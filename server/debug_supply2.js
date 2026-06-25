const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    // All supply lines under MILAHA with party=100001
    const r1 = await client.query(`
      SELECT ctid, qfs_company, qfs_refno, qfs_party, qfs_tariff, qfs_created_on
      FROM id_qn_fv_supply_details
      WHERE qfs_company='MILAHA' AND qfs_party::text='100001'
    `);
    console.log('MILAHA + party=100001:', r1.rows);

    // Most recently created supply lines (any company)
    const r2 = await client.query(`
      SELECT qfs_company, qfs_refno, qfs_party, qfs_tariff, qfs_f_amount, qfs_created_on
      FROM id_qn_fv_supply_details
      ORDER BY qfs_created_on DESC NULLS LAST
      LIMIT 10
    `);
    console.log('Most recent supply lines:', r2.rows);

    // Count by company
    const r3 = await client.query(`
      SELECT qfs_company, COUNT(*) AS cnt FROM id_qn_fv_supply_details GROUP BY qfs_company
    `);
    console.log('Count by company:', r3.rows);

  } finally {
    client.release();
    await pool.end();
  }
}
run();
