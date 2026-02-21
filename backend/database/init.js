import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getClient, query } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "schema.sql");
const migrationsDir = path.join(__dirname, "migrations");
const MIGRATION_LOCK_KEY = 88431017;

export async function testDatabaseConnection() {
  await query("SELECT 1");
}

export async function bootstrapDatabaseSchema() {
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  await query(schemaSql);
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function computeChecksum(sql) {
  return crypto.createHash("sha256").update(sql, "utf8").digest("hex");
}

async function listMigrationFiles() {
  let entries = [];
  try {
    entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && /^\d+_.+\.sql$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export async function runMigrations() {
  const migrationFiles = await listMigrationFiles();

  if (migrationFiles.length === 0) {
    return { applied: [], skipped: [] };
  }

  const client = await getClient();
  const applied = [];
  const skipped = [];

  try {
    await client.query("SELECT pg_advisory_lock($1);", [MIGRATION_LOCK_KEY]);
    await ensureMigrationsTable(client);

    for (const fileName of migrationFiles) {
      const filePath = path.join(migrationsDir, fileName);
      const sql = await fs.readFile(filePath, "utf8");
      const checksum = computeChecksum(sql);

      await client.query("BEGIN");

      const existing = await client.query(
        "SELECT checksum FROM schema_migrations WHERE version = $1",
        [fileName]
      );

      if (existing.rowCount > 0) {
        const existingChecksum = existing.rows[0].checksum;
        if (existingChecksum !== checksum) {
          throw new Error(
            `Migration checksum mismatch for ${fileName}. Existing checksum differs from file contents.`
          );
        }

        skipped.push(fileName);
        await client.query("COMMIT");
        continue;
      }

      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)",
        [fileName, checksum]
      );
      await client.query("COMMIT");
      applied.push(fileName);
    }

    return { applied, skipped };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors; original error is more useful.
    }
    throw error;
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1);", [MIGRATION_LOCK_KEY]);
    } catch {
      // If unlock fails due to connection state, release() will still close the session.
    }
    client.release();
  }
}
