import { runMigrations } from "../src/lib/db";

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
