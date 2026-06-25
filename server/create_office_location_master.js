const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_OFFICE_LOCATION_MASTER table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_office_location_master (
        off_company VARCHAR(10) NOT NULL,
        off_serial SERIAL NOT NULL,
        off_office VARCHAR(10) NOT NULL,
        off_office_name VARCHAR(75) NOT NULL,
        off_location VARCHAR(10),
        off_location_name VARCHAR(75),
        off_notes VARCHAR(240),
        off_filter_0 VARCHAR(240),
        off_filter_1 VARCHAR(240),
        off_filter_2 VARCHAR(240),
        off_filter_3 VARCHAR(240),
        off_filter_4 VARCHAR(240),
        off_filter_5 VARCHAR(240),
        off_filter_6 VARCHAR(240),
        off_filter_7 VARCHAR(240),
        off_filter_8 VARCHAR(240),
        off_filter_9 VARCHAR(240),
        off_address_1 VARCHAR(50),
        off_address_2 VARCHAR(50),
        off_address_3 VARCHAR(50),
        off_address_4 VARCHAR(50),
        off_phone VARCHAR(50),
        off_fax VARCHAR(50),
        off_telex VARCHAR(50),
        off_email VARCHAR(50),
        off_contact VARCHAR(50),
        off_operation_map_line VARCHAR(10),
        off_report_head VARCHAR(1) DEFAULT 'L' NOT NULL,
        off_office_short VARCHAR(1) DEFAULT '1' NOT NULL,
        PRIMARY KEY (off_company, off_serial)
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS off_company_srl_key
      ON id_office_location_master (off_company, off_serial)
    `);
    console.log('✓ Primary index created');

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS off_loc_ukey
      ON id_office_location_master (off_company, off_office, off_location)
    `);
    console.log('✓ Unique location index created');

    console.log('\n✓ Office Location Master setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
