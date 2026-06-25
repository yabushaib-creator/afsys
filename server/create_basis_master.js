const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_BASIS_MASTER table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_basis_master (
        basis_code     VARCHAR(10)  NOT NULL,
        basis_name     VARCHAR(50)  NOT NULL,
        basis_flag     VARCHAR(1)   NOT NULL,
        basis_filter_0 VARCHAR(240),
        basis_filter_1 VARCHAR(240),
        basis_filter_2 VARCHAR(240),
        basis_filter_3 VARCHAR(240),
        basis_filter_4 VARCHAR(240),
        basis_filter_5 VARCHAR(240),
        basis_filter_6 VARCHAR(240),
        basis_filter_7 VARCHAR(240),
        basis_filter_8 VARCHAR(240),
        basis_filter_9 VARCHAR(240)
      )
    `);
    console.log('✓ Table created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS basis_master_fx
      ON id_basis_master (basis_filter_0, basis_filter_1)
    `);
    console.log('✓ Filter index created');

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS basks_key
      ON id_basis_master (basis_code)
    `);
    console.log('✓ Unique index on basis_code created');

    console.log('\n✓ ID_BASIS_MASTER setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
