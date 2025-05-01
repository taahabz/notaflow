// Run database migrations
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check .env file.');
  process.exit(1);
}

// Create Supabase client with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to migrations directory
const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'migrations');

// Run a migration file
async function runMigration(filename) {
  console.log(`Running migration: ${filename}`);
  
  try {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    const { error } = await supabase.rpc('pg_execute', { sql_query: sql });
    
    if (error) {
      console.error(`Error running migration ${filename}:`, error);
      return false;
    }
    
    console.log(`Migration ${filename} completed successfully.`);
    return true;
  } catch (err) {
    console.error(`Error running migration ${filename}:`, err);
    return false;
  }
}

// Run all migrations
async function runAllMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory ${MIGRATIONS_DIR} does not exist.`);
    process.exit(1);
  }
  
  // Get all SQL files
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Run in alphabetical order
  
  if (migrationFiles.length === 0) {
    console.log('No migration files found.');
    process.exit(0);
  }
  
  console.log(`Found ${migrationFiles.length} migration files.`);
  
  // Run each migration
  let failures = 0;
  
  for (const file of migrationFiles) {
    const success = await runMigration(file);
    if (!success) failures++;
  }
  
  if (failures > 0) {
    console.error(`${failures} migration(s) failed.`);
    process.exit(1);
  } else {
    console.log('All migrations completed successfully.');
  }
}

// Run the migrations
runAllMigrations(); 