const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'afsys',
  user: 'afsys_user',
  password: 'afsys_pass',
});

pool.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`).then(result => {
  console.log('=== All Tables in afsys database ===\n');
  result.rows.forEach((row, i) => {
    console.log(`${i + 1}. ${row.table_name}`);
  });
  pool.end();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  pool.end();
  process.exit(1);
});
