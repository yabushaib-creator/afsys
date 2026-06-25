const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    const r = await client.query(`
      SELECT av.ar_code, av.ar_name, gl.arg_group_code, gl.arg_description
      FROM id_ar_master_view av
      JOIN id_ar_group_link gl ON av.ar_company = gl.arg_company AND av.ar_code = gl.arg_code
      WHERE av.ar_company = 'QTC'
      ORDER BY av.ar_name
      LIMIT 5
    `);
    console.log('Row count check — first 5:');
    r.rows.forEach(row => console.log(row));
    const cnt = await client.query(`
      SELECT COUNT(*) AS total
      FROM id_ar_master_view av
      JOIN id_ar_group_link gl ON av.ar_company = gl.arg_company AND av.ar_code = gl.arg_code
      WHERE av.ar_company = 'QTC'
    `);
    console.log('Total rows:', cnt.rows[0].total);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
