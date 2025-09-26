// lib/db.ts
import { Pool } from "pg";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables from .env.local
config({
  path: join(process.cwd(), ".env.local"),
  override: true,
  quiet: true,
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test the connection
pool.on("error", (error) => {
  console.error("Database connection error:", error);
  // In case of errors, try to reconnect after a delay
  setTimeout(() => {
    pool.connect().catch((connectError) => {
      console.error("Failed to reconnect to database:", connectError);
    });
  }, 5000);
});

// Check which migrations have already been applied
async function ensureMigrationsTable() {
  const client = await pool.connect();
  try {
    // Create the migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Migrations table is ready");
  } catch (error: unknown) {
    console.error("Failed to ensure migrations table:", error);
    throw error; // Re-throw to prevent application from starting with a broken migrations system
  } finally {
    client.release();
  }
}

ensureMigrationsTable();

// Export the pool for direct use
export { pool };

// Default export for CommonJS compatibility
export default pool;
