const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    // What does qfs_inv_number look like?
    const s1 = await client.query(`
      SELECT qfs_inv_number, COUNT(*) AS cnt
      FROM id_qn_fv_supply_details WHERE qfs_company='QTC'
      GROUP BY qfs_inv_number ORDER BY cnt DESC LIMIT 10
    `);
    console.log('qfs_inv_number values:', s1.rows);

    // What does qfs_rct_number look like?
    const s2 = await client.query(`
      SELECT qfs_rct_number, COUNT(*) AS cnt
      FROM id_qn_fv_supply_details WHERE qfs_company='QTC'
      GROUP BY qfs_rct_number ORDER BY cnt DESC LIMIT 5
    `);
    console.log('qfs_rct_number values:', s2.rows);

    // Do any qfs_party values exist in ar_master_view?
    const s3 = await client.query(`
      SELECT DISTINCT qfs_party FROM id_qn_fv_supply_details
      WHERE qfs_company='QTC' AND qfs_party IN (SELECT ar_code FROM id_ar_master_view)
      LIMIT 10
    `);
    console.log('qfs_party values that match ar_code:', s3.rows);

    // Sample of distinct qfs_party values
    const s4 = await client.query(`
      SELECT DISTINCT qfs_party FROM id_qn_fv_supply_details
      WHERE qfs_company='QTC' LIMIT 10
    `);
    console.log('Sample qfs_party:', s4.rows.map(r => r.qfs_party));

    // Sample of ar_code values
    const s5 = await client.query(`SELECT ar_code FROM id_ar_master_view LIMIT 10`);
    console.log('Sample ar_code:', s5.rows.map(r => r.ar_code));

  } finally {
    client.release();
    await pool.end();
  }
}
run();
