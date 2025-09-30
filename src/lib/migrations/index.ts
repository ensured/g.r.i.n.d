import * as fs from 'fs';
import * as path from 'path';

const migrations: Record<string, string> = {};

// Read all SQL files from the migrations directory
const migrationFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.sql'))
  .sort();

// Import each migration file
for (const file of migrationFiles) {
  const migrationName = path.basename(file, '.sql');
  migrations[migrationName] = fs.readFileSync(path.join(__dirname, file), 'utf8');
}

export { migrations };
