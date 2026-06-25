const pool = require('./src/config/db');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS id_country_master
(
  country_code         VARCHAR(10) PRIMARY KEY NOT NULL,
  country_name         VARCHAR(75) NOT NULL,
  country_uncode       VARCHAR(10) NOT NULL,
  country_cargo_centre VARCHAR(10) NOT NULL,
  country_filter_0     VARCHAR(240),
  country_filter_1     VARCHAR(240),
  country_filter_2     VARCHAR(240),
  country_filter_3     VARCHAR(240),
  country_filter_4     VARCHAR(240),
  country_filter_5     VARCHAR(240),
  country_filter_6     VARCHAR(240),
  country_filter_7     VARCHAR(240),
  country_filter_8     VARCHAR(240),
  country_filter_9     VARCHAR(240),
  country_lang_name    VARCHAR(240),
  country_arabic_name  VARCHAR(75)
);

CREATE INDEX IF NOT EXISTS idx_country_filters
ON id_country_master (country_filter_0, country_filter_1);
`;

async function createTable() {
  try {
    console.log('Creating ID_COUNTRY_MASTER table...');
    await pool.query(createTableSQL);
    console.log('✓ Table created successfully');

    // Verify table exists
    const verifyResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'id_country_master'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Table columns:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
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
