const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE OR REPLACE VIEW id_ar_group_link (
        arg_company,
        arg_code,
        arg_group_code,
        arg_description
      ) AS
      SELECT
        'QTC'              AS arg_company,
        customer_number    AS arg_code,
        'QNNTC'            AS arg_group_code,
        'Qatar Navigation' AS arg_description
      FROM qnav_sub_ra_cust_addr_prof
    `);
    console.log('View id_ar_group_link created successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
