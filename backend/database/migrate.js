import { closePool } from "./client.js";
import { runMigrations, testDatabaseConnection } from "./init.js";

async function main() {
  await testDatabaseConnection();
  const { applied, skipped } = await runMigrations();

  if (applied.length > 0) {
    console.log(`Applied migrations: ${applied.join(", ")}`);
  }

  if (skipped.length > 0) {
    console.log(`Already applied migrations: ${skipped.join(", ")}`);
  }

  if (applied.length === 0 && skipped.length === 0) {
    console.log("No migration files found.");
  }
}

main()
  .catch((error) => {
    console.error("Migration run failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closePool();
    } catch (error) {
      console.error("Failed to close DB pool:", error);
      process.exitCode = 1;
    }
  });
