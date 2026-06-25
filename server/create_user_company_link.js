const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_USER_COMPANY_LINK table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_user_company_link (
        ucl_code VARCHAR(10) NOT NULL,
        ucl_company VARCHAR(10) NOT NULL,
        ucl_email VARCHAR(75),
        ucl_employee_code VARCHAR(10),
        ucl_filter_0 VARCHAR(240),
        ucl_filter_1 VARCHAR(240),
        ucl_filter_2 VARCHAR(240),
        ucl_filter_3 VARCHAR(240),
        ucl_filter_4 VARCHAR(240),
        ucl_filter_5 VARCHAR(240),
        ucl_filter_6 VARCHAR(240),
        ucl_filter_7 VARCHAR(240),
        ucl_filter_8 VARCHAR(240),
        ucl_filter_9 VARCHAR(240),
        ucl_office VARCHAR(10),
        ucl_location VARCHAR(10),
        PRIMARY KEY (ucl_code, ucl_company)
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS user_company_link_fx
      ON id_user_company_link (ucl_filter_0, ucl_filter_1)
    `);
    console.log('✓ Filter index created');

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_link_u_key
      ON id_user_company_link (ucl_code, ucl_company, ucl_location, ucl_office)
    `);
    console.log('✓ Unique constraint index created');

    console.log('\n✓ User Company Link setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
