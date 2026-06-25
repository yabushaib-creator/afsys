const pool = require('./src/config/db');

async function addLineColumn() {
  try {
    console.log('Adding line_code column to vessels...');
    await pool.query(`
      ALTER TABLE id_qn_fgn_vsl_master
      ADD COLUMN IF NOT EXISTS qfv_line_code VARCHAR(10)
    `);
    console.log('✓ Column added successfully');
    pool.end();
  } catch (err) {
    console.error('✗ Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

addLineColumn();
