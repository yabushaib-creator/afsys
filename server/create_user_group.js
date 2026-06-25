const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_USER_GROUP table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_user_group (
        ugroup_company VARCHAR(10) NOT NULL,
        ugroup_code VARCHAR(10) NOT NULL,
        ugroup_description VARCHAR(75) NOT NULL,
        ugroup_primary VARCHAR(1) DEFAULT 'N' NOT NULL,
        ugroup_belong_to VARCHAR(10) NOT NULL,
        ugroup_filter_0 VARCHAR(240),
        ugroup_filter_1 VARCHAR(240),
        ugroup_filter_2 VARCHAR(240),
        ugroup_filter_3 VARCHAR(240),
        ugroup_filter_4 VARCHAR(240),
        ugroup_filter_5 VARCHAR(240),
        ugroup_filter_6 VARCHAR(240),
        ugroup_filter_7 VARCHAR(240),
        ugroup_filter_8 VARCHAR(240),
        ugroup_filter_9 VARCHAR(240),
        PRIMARY KEY (ugroup_company, ugroup_code)
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS user_group_fx
      ON id_user_group (ugroup_filter_0, ugroup_filter_1)
    `);
    console.log('✓ Filter index created');

    console.log('\n✓ User Group setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
