import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { closePool } from "./database/client.js";
import {
  bootstrapDatabaseSchema,
  runMigrations,
  testDatabaseConnection,
} from "./database/init.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const host = process.env.HOST || "0.0.0.0";
const shouldRunMigrations = process.env.DB_RUN_MIGRATIONS_ON_STARTUP !== "false";
const shouldBootstrap = process.env.DB_BOOTSTRAP_ON_STARTUP === "true";

app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await testDatabaseConnection();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "degraded", database: "unavailable", error: error.message });
  }
});

let server;

async function shutdown(signal) {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error(`Failed during ${signal} shutdown:`, error);
    process.exit(1);
  }
}

async function start() {
  await testDatabaseConnection();

  if (shouldRunMigrations) {
    const { applied, skipped } = await runMigrations();
    if (applied.length > 0) {
      console.log(`Applied migrations: ${applied.join(", ")}`);
    }
    if (skipped.length > 0) {
      console.log(`Already applied migrations: ${skipped.join(", ")}`);
    }
  }

  if (shouldBootstrap) {
    console.warn("DB_BOOTSTRAP_ON_STARTUP=true. Running destructive bootstrap from database/schema.sql");
    await bootstrapDatabaseSchema();
  }

  server = app.listen(port, host, () => {
    console.log(`FleetFlow backend listening on http://${host}:${port}`);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

start().catch(async (error) => {
  console.error("Server failed to start:", error);
  await closePool();
  process.exit(1);
});
