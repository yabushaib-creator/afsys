const pool = require('./src/config/db');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS id_line_master
(
  line_code              VARCHAR(10) PRIMARY KEY NOT NULL,
  line_name              VARCHAR(50) NOT NULL,
  line_address_1         VARCHAR(75) NOT NULL,
  line_address_2         VARCHAR(75),
  line_address_3         VARCHAR(75),
  line_telephone         VARCHAR(20) NOT NULL,
  line_fax               VARCHAR(20) NOT NULL,
  line_email             VARCHAR(75) NOT NULL,
  line_bl_print          VARCHAR(75),
  line_local_port_code   VARCHAR(25),
  line_local_custom_code VARCHAR(25),
  line_name_others       VARCHAR(75),
  line_filter_0          VARCHAR(240),
  line_filter_1          VARCHAR(240),
  line_filter_2          VARCHAR(240),
  line_filter_3          VARCHAR(240),
  line_filter_4          VARCHAR(240),
  line_filter_5          VARCHAR(240),
  line_filter_6          VARCHAR(240),
  line_filter_7          VARCHAR(240),
  line_filter_8          VARCHAR(240),
  line_filter_9          VARCHAR(240)
);

CREATE INDEX IF NOT EXISTS idx_line_filters
ON id_line_master (line_filter_0, line_filter_1);
`;

async function createTable() {
  try {
    console.log('Creating ID_LINE_MASTER table...');
    const result = await pool.query(createTableSQL);
    console.log('✓ Table created successfully');

    // Verify table exists
    const verifyResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'id_line_master'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Table columns:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    pool.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

createTable();
