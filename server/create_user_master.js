const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_USER_MASTER table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_user_master (
        user_code VARCHAR(10) NOT NULL PRIMARY KEY,
        user_name VARCHAR(75) NOT NULL,
        user_password VARCHAR(15) NOT NULL,
        user_primary_group VARCHAR(10) NOT NULL,
        user_status VARCHAR(1) DEFAULT 'A' NOT NULL,
        user_admin_allow VARCHAR(1) DEFAULT 'N' NOT NULL,
        user_default_company VARCHAR(10) NOT NULL,
        user_filter_0 VARCHAR(240),
        user_filter_1 VARCHAR(240),
        user_filter_2 VARCHAR(240),
        user_filter_3 VARCHAR(240),
        user_filter_4 VARCHAR(240),
        user_filter_5 VARCHAR(240),
        user_filter_6 VARCHAR(240),
        user_filter_7 VARCHAR(240),
        user_filter_8 VARCHAR(240),
        user_filter_9 VARCHAR(240),
        user_last_password_changed_on DATE,
        user_next_password_change_on DATE
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_key
      ON id_user_master (user_code)
    `);
    console.log('✓ Primary index created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS user_master_fx
      ON id_user_master (user_filter_0, user_filter_1)
    `);
    console.log('✓ Filter index created');

    console.log('\n✓ User Master setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
