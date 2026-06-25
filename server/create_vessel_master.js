const pool = require('./src/config/db');

const createTableSQL = `
DROP TABLE IF EXISTS id_vessel_master CASCADE;

CREATE TABLE id_vessel_master
(
  vessel_code             VARCHAR(10) PRIMARY KEY NOT NULL,
  vessel_name             VARCHAR(75) NOT NULL,
  vessel_owned_line       VARCHAR(10) NOT NULL,
  vessel_cargo            VARCHAR(1) DEFAULT 'C' NOT NULL,
  vessel_imco_allow       VARCHAR(1) DEFAULT 'Y' NOT NULL,
  vessel_reefer_allow     VARCHAR(1) DEFAULT 'Y' NOT NULL,
  vessel_out_allow        VARCHAR(1) DEFAULT 'Y' NOT NULL,
  vessel_45_status        VARCHAR(1) DEFAULT 'Y' NOT NULL,
  vessel_lifting_capacity NUMERIC DEFAULT 0 NOT NULL,
  vessel_ramp_capacity    NUMERIC DEFAULT 0 NOT NULL,
  vessel_height_clearance NUMERIC DEFAULT 0 NOT NULL,
  vessel_flag_country     VARCHAR(10),
  vessel_year_build       NUMERIC(4) NOT NULL,
  vessel_flex_1           VARCHAR(240),
  vessel_flex_2           VARCHAR(240),
  vessel_flex_3           VARCHAR(240),
  vessel_notes            VARCHAR(2000),
  vessel_filter_0         VARCHAR(240),
  vessel_filter_1         VARCHAR(240),
  vessel_filter_2         VARCHAR(240),
  vessel_filter_3         VARCHAR(240),
  vessel_filter_4         VARCHAR(240),
  vessel_filter_5         VARCHAR(240),
  vessel_filter_6         VARCHAR(240),
  vessel_filter_7         VARCHAR(240),
  vessel_filter_8         VARCHAR(240),
  vessel_filter_9         VARCHAR(240)
);

CREATE INDEX idx_vessel_filters
ON id_vessel_master (vessel_filter_0, vessel_filter_1);

CREATE INDEX idx_vessel_line
ON id_vessel_master (vessel_owned_line);

CREATE INDEX idx_vessel_country
ON id_vessel_master (vessel_flag_country);
`;

async function createTable() {
  try {
    console.log('Creating ID_VESSEL_MASTER table...');
    await pool.query(createTableSQL);
    console.log('✓ Table created successfully');

    // Verify table exists
    const verifyResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'id_vessel_master'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Table columns:');
    verifyResult.rows.forEach((row, i) => {
      console.log(`${(i + 1).toString().padEnd(3)} ${row.column_name.padEnd(40)} ${row.data_type}`);
    });

    console.log(`\nTotal: ${verifyResult.rows.length} columns`);
    pool.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

createTable();
