const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_CURRENCY_MASTER table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_currency_master (
        currency_company VARCHAR(10) NOT NULL,
        currency_code VARCHAR(10) NOT NULL,
        currency_name VARCHAR(50) NOT NULL,
        currency_corporate_rate NUMERIC DEFAULT 0 NOT NULL,
        currency_customer_rate NUMERIC DEFAULT 0 NOT NULL,
        currency_market_rate NUMERIC DEFAULT 0 NOT NULL,
        currency_other_rate NUMERIC DEFAULT 0 NOT NULL,
        currency_filter_0 VARCHAR(240),
        currency_filter_1 VARCHAR(240),
        currency_filter_2 VARCHAR(240),
        currency_filter_3 VARCHAR(240),
        currency_filter_4 VARCHAR(240),
        currency_filter_5 VARCHAR(240),
        currency_filter_6 VARCHAR(240),
        currency_filter_7 VARCHAR(240),
        currency_filter_8 VARCHAR(240),
        currency_filter_9 VARCHAR(240),
        currency_created_by VARCHAR(10),
        currency_created_on DATE,
        currency_modified_by VARCHAR(10),
        currency_modified_on DATE,
        PRIMARY KEY (currency_company, currency_code)
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS currency_key
      ON id_currency_master (currency_company, currency_code, currency_filter_0, currency_filter_1)
    `);
    console.log('✓ Primary index created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS currency_master_fx
      ON id_currency_master (currency_filter_0, currency_filter_1)
    `);
    console.log('✓ Filter index created');

    console.log('\n✓ Currency Master setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
