// lib/db.ts
import { Pool } from 'pg';
import { config } from 'dotenv';
import { join } from 'path';
import { runMigrations, resetDatabase } from './migrations';

// Load environment variables from .env.local
config({
  path: join(process.cwd(), '.env.local'),
  override: true,
  quiet: true,
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('error', (error) => {
  console.error('Database connection error:', error);
  // In case of errors, try to reconnect after a delay
  const reconnect = () => {
    pool.connect().catch((connectError) => {
      console.error('Failed to reconnect to database, retrying in 5 seconds:', connectError);
      setTimeout(reconnect, 5000);
    });
  };
  setTimeout(reconnect, 5000);
});

// Export the pool and migration functions
export { pool as default, pool, runMigrations, resetDatabase };
