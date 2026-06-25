const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_AR_MASTER_VIEW table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_ar_master_view (
        ar_code VARCHAR(10) NOT NULL PRIMARY KEY,
        ar_name VARCHAR(75) NOT NULL
      );
    `);
    console.log('✓ Table created');

    console.log('\n✓ AR Master View setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
