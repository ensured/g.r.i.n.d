// lib/db.ts
import { Pool } from "pg";
import { config } from "dotenv";
import { join } from "path";
import { migrations } from "./migrations";

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

// Function to run migrations
async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get all applied migrations
    const { rows: appliedMigrations } = await client.query<{name: string}>(
      'SELECT name FROM _migrations ORDER BY name'
    );
    
    const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));
    
    // Apply each migration that hasn't been applied yet
    for (const [name, sql] of Object.entries(migrations)) {
      if (!appliedMigrationNames.has(name)) {
        console.log(`Applying migration: ${name}`);
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (name) VALUES ($1)',
          [name]
        );
        console.log(`Applied migration: ${name}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('All migrations applied successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migrations when the module is loaded
runMigrations().catch(console.error);

// Export the pool for direct use
export { pool as default, pool, runMigrations };
