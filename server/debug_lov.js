const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    // 1. How many supply lines exist for QTC with no inv/rct number?
    const s1 = await client.query(`
      SELECT COUNT(*) AS cnt FROM id_qn_fv_supply_details
      WHERE qfs_company='QTC' AND qfs_inv_number IS NULL AND qfs_rct_number IS NULL
    `);
    console.log('Supply lines (no inv/rct):', s1.rows[0].cnt);

    // 2. Sample qfs_party values
    const s2 = await client.query(`
      SELECT DISTINCT qfs_party, pg_typeof(qfs_party) AS type
      FROM id_qn_fv_supply_details WHERE qfs_company='QTC' LIMIT 5
    `);
    console.log('Sample qfs_party:', s2.rows);

    // 3. Sample ar_code values from view
    const s3 = await client.query(`
      SELECT ar_code, pg_typeof(ar_code) AS type FROM id_ar_master_view LIMIT 5
    `);
    console.log('Sample ar_code:', s3.rows);

    // 4. Sample arg_code from group link
    const s4 = await client.query(`
      SELECT arg_code, arg_group_code FROM id_ar_group_link LIMIT 5
    `);
    console.log('Sample arg_code:', s4.rows);

    // 5. Try join without the group link
    const s5 = await client.query(`
      SELECT COUNT(*) AS cnt
      FROM id_qn_fv_supply_details sd
      JOIN id_ar_master_view av ON sd.qfs_company = av.ar_company
                                AND sd.qfs_party::text = av.ar_code::text
      WHERE sd.qfs_company='QTC' AND sd.qfs_inv_number IS NULL AND sd.qfs_rct_number IS NULL
    `);
    console.log('After joining ar_master_view:', s5.rows[0].cnt);

    // 6. Try full join
    const s6 = await client.query(`
      SELECT COUNT(*) AS cnt
      FROM id_qn_fv_supply_details sd
      JOIN id_ar_master_view  av ON sd.qfs_company = av.ar_company AND sd.qfs_party::text = av.ar_code::text
      JOIN id_ar_group_link   gl ON av.ar_company = gl.arg_company AND av.ar_code = gl.arg_code
      WHERE sd.qfs_company='QTC' AND sd.qfs_inv_number IS NULL AND sd.qfs_rct_number IS NULL
    `);
    console.log('After joining group_link:', s6.rows[0].cnt);

    // 7. Check qfs_inv_number and qfs_rct_number nullability
    const s7 = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE qfs_inv_number IS NULL) AS inv_null,
        COUNT(*) FILTER (WHERE qfs_inv_number IS NOT NULL) AS inv_set,
        COUNT(*) FILTER (WHERE qfs_rct_number IS NULL) AS rct_null,
        COUNT(*) FILTER (WHERE qfs_rct_number IS NOT NULL) AS rct_set
      FROM id_qn_fv_supply_details WHERE qfs_company='QTC'
    `);
    console.log('inv/rct nulls:', s7.rows[0]);

  } finally {
    client.release();
    await pool.end();
  }
}
run();
