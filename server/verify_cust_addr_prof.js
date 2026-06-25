const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) AS rows FROM qnav_sub_ra_cust_addr_prof');
    console.log('Row count:', count.rows[0].rows);
    const cols = await client.query(
      "SELECT column_name, data_type, character_maximum_length, is_nullable FROM information_schema.columns WHERE table_name='qnav_sub_ra_cust_addr_prof' ORDER BY ordinal_position"
    );
    console.log('\nColumns:');
    cols.rows.forEach(c => console.log(` - ${c.column_name}: ${c.data_type}${c.character_maximum_length ? '(' + c.character_maximum_length + ')' : ''} ${c.is_nullable === 'NO' ? 'NOT NULL' : ''}`));
  } finally {
    client.release();
    await pool.end();
  }
}
run();
