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
  console.log('=== Table: id_qn_fgn_vsl_master ===\n');
  result.rows.forEach(row => {
    const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(required)';
    console.log(`${row.column_name.padEnd(35)} ${row.data_type.padEnd(15)} ${nullable}`);
  });
  pool.end();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
  process.exit(1);
});
