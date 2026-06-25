const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'afsys',
  user: 'afsys_user',
  password: 'afsys_pass',
});

pool.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'id_qn_fgn_vsl_master'
  ORDER BY ordinal_position
`).then(result => {
  console.log('=== All Columns in id_qn_fgn_vsl_master ===\n');
  result.rows.forEach((row, i) => {
    const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(required)';
    console.log(`${(i + 1).toString().padEnd(3)} ${row.column_name.padEnd(40)} ${row.data_type.padEnd(15)} ${nullable}`);
  });
  console.log(`\nTotal columns: ${result.rows.length}`);
  pool.end();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
  process.exit(1);
});
