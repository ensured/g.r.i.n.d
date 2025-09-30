import { Pool } from 'pg';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type for migration files
type Migration = {
  name: string;
  up: string;
  down: string;
};

// Load all SQL migration files from the migrations directory
function loadMigrations(): Migration[] {
  const migrationsDir = join(__dirname, 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Important: ensure migrations run in order

  return migrationFiles.map(file => {
    const migrationName = file.replace(/\.sql$/, '');
    const filePath = join(migrationsDir, file);
    const content = readFileSync(filePath, 'utf8');
    
    // Split the file into up and down migrations
    // We'll use a delimiter on its own line to separate up and down migrations
    const parts = content.split('\n-- DOWN\n');
    const up = parts[0].trim();
    const down = parts[1] ? parts[1].trim() : `-- No down migration for ${migrationName}`;
    
    return {
      name: migrationName,
      up,
      down
    };
  });
}

// Load migrations from files
const migrations = loadMigrations();

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        run_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Get applied migrations
    const appliedMigrations = await client.query<{ name: string }>(
      'SELECT name FROM _migrations ORDER BY name'
    );
    const appliedMigrationNames = new Set(appliedMigrations.rows.map(m => m.name));

    // Run pending migrations
    for (const migration of migrations) {
      if (!appliedMigrationNames.has(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        await client.query(migration.up);
        await client.query(
          'INSERT INTO _migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`Applied migration: ${migration.name}`);
      }
    }

    await client.query('COMMIT');
    console.log('Database migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Run all down migrations in reverse order
    for (let i = migrations.length - 1; i >= 0; i--) {
      const migration = migrations[i];
      console.log(`Reverting migration: ${migration.name}`);
      await client.query(migration.down);
    }
    
    // Drop migrations table
    await client.query('DROP TABLE IF EXISTS _migrations CASCADE');
    
    await client.query('COMMIT');
    console.log('Database reset completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export default migrations;
