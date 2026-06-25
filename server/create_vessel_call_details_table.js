const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_QN_FGN_VSL_CALL_DETAILS table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_qn_fgn_vsl_call_details (
        qfvc_company VARCHAR(10) NOT NULL,
        qfvc_refno NUMERIC NOT NULL,
        qfvc_vessel VARCHAR(10) NOT NULL,
        qfvc_name VARCHAR(50) NOT NULL,
        qfvc_party VARCHAR(10) NOT NULL,
        qfvc_eta DATE,
        qfvc_etd DATE,
        qfvc_l_date DATE,
        qfvc_captain VARCHAR(75) NOT NULL,
        qfvc_remarks VARCHAR(240) NOT NULL,
        qfvc_status VARCHAR(1) DEFAULT 'O' NOT NULL,
        qfvc_flex_1 VARCHAR(240),
        qfvc_flex_2 VARCHAR(240),
        qfvc_flex_3 VARCHAR(240),
        qfvc_flex_4 VARCHAR(240),
        qfvc_flex_5 VARCHAR(240),
        qfvc_filter_0 VARCHAR(240),
        qfvc_filter_1 VARCHAR(240),
        qfvc_filter_2 VARCHAR(240),
        qfvc_filter_3 VARCHAR(240),
        qfvc_filter_4 VARCHAR(240),
        qfvc_filter_5 VARCHAR(240),
        qfvc_filter_6 VARCHAR(240),
        qfvc_filter_7 VARCHAR(240),
        qfvc_filter_8 VARCHAR(240),
        qfvc_filter_9 VARCHAR(240),
        PRIMARY KEY (qfvc_company, qfvc_refno)
      );
    `);
    console.log('✓ Table created');

    // Create indexes
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS qn_fvc_pkey
      ON id_qn_fgn_vsl_call_details (qfvc_company, qfvc_refno)
    `);
    console.log('✓ Primary key index created');

    console.log('\n✓ Foreign Vessel Call Details setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
