const pool = require('./src/config/db');
async function run() {
  const client = await pool.connect();
  try {
    // Does 100001 exist in id_ar_master_view?
    const r1 = await client.query(`SELECT ar_code, ar_name, ar_company FROM id_ar_master_view WHERE ar_code='100001'`);
    console.log('100001 in id_ar_master_view:', r1.rows);

    // Does 100001 exist in id_ar_group_link?
    const r2 = await client.query(`SELECT arg_code, arg_company, arg_group_code FROM id_ar_group_link WHERE arg_code='100001'`);
    console.log('100001 in id_ar_group_link:', r2.rows);

    // Does 100001 exist in qnav_sub_ra_cust_addr_prof?
    const r3 = await client.query(`SELECT customer_number, customer_name, address1 FROM qnav_sub_ra_cust_addr_prof WHERE customer_number='100001'`);
    console.log('100001 in qnav_sub_ra_cust_addr_prof:', r3.rows);

    // Does the full LOV JOIN return 100001?
    const r4 = await client.query(`
      SELECT av.ar_code, av.ar_name, gl.arg_group_code
      FROM id_ar_master_view av
      JOIN id_ar_group_link gl ON av.ar_company = gl.arg_company AND av.ar_code = gl.arg_code
      WHERE av.ar_company='QTC' AND av.ar_code='100001'
    `);
    console.log('100001 in full LOV JOIN:', r4.rows);

  } finally {
    client.release();
    await pool.end();
  }
}
run();
