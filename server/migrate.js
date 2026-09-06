const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  console.log('📡 Starting Database Migration for Grocify...');
  const client = await pool.connect();
  try {
    // 1. Add status column with check constraint
    console.log('🔄 Adding "status" column...');
    await client.query(`
      ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);

    // Add constraint checking if not already present
    try {
      await client.query(`
        ALTER TABLE items ADD CONSTRAINT items_status_check CHECK (status IN ('active', 'consumed', 'expired'));
      `);
      console.log('✅ Added status check constraint.');
    } catch (e) {
      console.log('ℹ️ Status constraint check already exists or skipped.');
    }

    // Update existing records to default status
    await client.query(`
      UPDATE items SET status = 'active' WHERE status IS NULL;
    `);

    // Set not null
    await client.query(`
      ALTER TABLE items ALTER COLUMN status SET NOT NULL;
    `);

    // 2. Add consumed_at, wasted_at, saved_via_recipe columns
    console.log('🔄 Adding outcome timestamps and recipe impact columns...');
    await client.query(`
      ALTER TABLE items ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE items ADD COLUMN IF NOT EXISTS wasted_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE items ADD COLUMN IF NOT EXISTS saved_via_recipe BOOLEAN DEFAULT FALSE NOT NULL;
    `);

    console.log('🚀 Database Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
