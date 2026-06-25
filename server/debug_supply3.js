const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    // Most recently created supply lines
    const r1 = await client.query(`
      SELECT qfs_company, qfs_refno, qfs_party, qfs_tariff, qfs_f_amount, qfs_created_on, qfs_created_by
      FROM id_qn_fv_supply_details
      ORDER BY qfs_created_on DESC NULLS LAST
      LIMIT 10
    `);
    console.log('Most recent supply lines:');
    r1.rows.forEach(r => console.log(r));

    // Specifically look for party=100001
    const r2 = await client.query(`
      SELECT qfs_company, qfs_refno, qfs_party, qfs_tariff
      FROM id_qn_fv_supply_details
      WHERE qfs_party::text = '100001'
    `);
    console.log('\nLines with party=100001:', r2.rows);

    // What are all distinct party values in recently entered data?
    const r3 = await client.query(`
      SELECT DISTINCT qfs_company, qfs_party, qfs_refno
      FROM id_qn_fv_supply_details
      WHERE qfs_created_on >= CURRENT_DATE - INTERVAL '7 days'
         OR qfs_created_on IS NULL
    `);
    console.log('\nRecent distinct company/party/refno:', r3.rows);

  } finally {
    client.release();
    await pool.end();
  }
}
run();
