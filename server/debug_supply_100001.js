const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    // Check supply lines where party = 100001
    const r1 = await client.query(`
      SELECT ctid, qfs_company, qfs_refno, qfs_party, qfs_tariff, qfs_date, qfs_f_amount
      FROM id_qn_fv_supply_details
      WHERE qfs_party::text = '100001'
    `);
    console.log('Supply lines with qfs_party=100001:', r1.rows);

    // Check all distinct qfs_party values that look like 1xxxxx (AR codes)
    const r2 = await client.query(`
      SELECT DISTINCT qfs_party, COUNT(*) AS cnt
      FROM id_qn_fv_supply_details
      WHERE qfs_party::text LIKE '1%'
      GROUP BY qfs_party
      LIMIT 10
    `);
    console.log('qfs_party values starting with 1:', r2.rows);

    // What companies exist in supply details?
    const r3 = await client.query(`
      SELECT DISTINCT qfs_company FROM id_qn_fv_supply_details
    `);
    console.log('Companies in supply details:', r3.rows);

  } finally {
    client.release();
    await pool.end();
  }
}
run();
