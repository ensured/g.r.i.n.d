import { runMigrations, resetDatabase } from "../src/lib/db";

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'up':
      console.log('Running database migrations...');
      await runMigrations();
      console.log('Migrations completed successfully');
      break;
      
    case 'reset':
      console.log('Resetting database...');
      await resetDatabase();
      console.log('Database reset completed successfully');
      break;
      
    case 'refresh':
      console.log('Refreshing database (reset + migrate)...');
      await resetDatabase();
      await runMigrations();
      console.log('Database refresh completed successfully');
      break;
      
    default:
      console.log('Usage: npm run migrate <command>');
      console.log('Commands:');
      console.log('  up      - Run pending migrations');
      console.log('  reset   - Reset the database (DANGER: drops all data)');
      console.log('  refresh - Reset and then run all migrations');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
