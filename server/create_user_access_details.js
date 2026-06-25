const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_USER_ACCESS_DETAILS table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_user_access_details (
        acc_company VARCHAR(10) NOT NULL,
        acc_user VARCHAR(10) NOT NULL,
        acc_serial SERIAL NOT NULL,
        acc_module NUMERIC NOT NULL,
        acc_smodule NUMERIC NOT NULL,
        acc_status VARCHAR(1) DEFAULT 'A' NOT NULL,
        acc_source VARCHAR(1) NOT NULL,
        acc_u_m_name VARCHAR(75),
        acc_u_m_level NUMERIC,
        acc_u_s_name VARCHAR(75),
        acc_u_s_level NUMERIC,
        acc_u_p_name VARCHAR(75),
        acc_u_p_level NUMERIC,
        acc_u_module NUMERIC,
        acc_u_smodule NUMERIC,
        acc_filter_0 VARCHAR(240),
        acc_filter_1 VARCHAR(240),
        acc_filter_2 VARCHAR(240),
        acc_filter_3 VARCHAR(240),
        acc_filter_4 VARCHAR(240),
        acc_filter_5 VARCHAR(240),
        acc_filter_6 VARCHAR(240),
        acc_filter_7 VARCHAR(240),
        acc_filter_8 VARCHAR(240),
        acc_filter_9 VARCHAR(240),
        PRIMARY KEY (acc_company, acc_user, acc_serial)
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uaccess_key
      ON id_user_access_details (acc_company, acc_user, acc_serial)
    `);
    console.log('✓ Primary index created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS user_access_details_fx
      ON id_user_access_details (acc_filter_0, acc_filter_1)
    `);
    console.log('✓ Filter index created');

    console.log('\n✓ User Access Details setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
