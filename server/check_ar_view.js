const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    const r = await client.query(
      "SELECT table_name, table_type FROM information_schema.tables WHERE table_name = 'id_ar_master_view'"
    );
    console.log(r.rows);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
