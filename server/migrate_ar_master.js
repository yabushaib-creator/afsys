const pool = require('./src/config/db');

async function run() {
  const client = await pool.connect();
  try {
    // Check existing data in the old table
    const existing = await client.query('SELECT * FROM id_ar_master_view');
    console.log(`Existing rows in id_ar_master_view: ${existing.rows.length}`);
    if (existing.rows.length > 0) {
      console.log('Sample:', JSON.stringify(existing.rows[0], null, 2));
    }

    // Migrate any existing rows into qnav_sub_ra_cust_addr_prof
    for (const row of existing.rows) {
      const check = await client.query(
        'SELECT 1 FROM qnav_sub_ra_cust_addr_prof WHERE customer_number=$1',
        [row.ar_code]
      );
      if (check.rows.length === 0) {
        await client.query(
          `INSERT INTO qnav_sub_ra_cust_addr_prof
             (customer_number, customer_name, address1)
           VALUES ($1, $2, $3)`,
          [row.ar_code, row.ar_name || '', row.ar_address_1 || '-']
        );
        console.log(`Migrated: ${row.ar_code} - ${row.ar_name}`);
      } else {
        console.log(`Skipped (already exists): ${row.ar_code}`);
      }
    }

    // Drop the old table and create the view
    await client.query('DROP TABLE id_ar_master_view');
    console.log('Old table dropped.');

    await client.query(`
      CREATE OR REPLACE VIEW id_ar_master_view (
        ar_company, ar_code, ar_name, ar_pobox,
        ar_address_1, ar_address_2, ar_address_3, ar_address_4,
        ar_telephone, ar_fax, ar_email,
        ar_status, ar_credit_days, ar_limit_type,
        ar_limit_amount, ar_final_limit,
        ar_gl_code, ar_control_acc
      ) AS
      SELECT
        'QTC'                                                   AS ar_company,
        customer_number                                         AS ar_code,
        customer_name                                           AS ar_name,
        postal_code                                             AS ar_pobox,
        address1                                                AS ar_address_1,
        address2                                                AS ar_address_2,
        address3                                                AS ar_address_3,
        COALESCE(city || ', ', '') || COALESCE(country, '')     AS ar_address_4,
        phone_number                                            AS ar_telephone,
        fax_number                                              AS ar_fax,
        email_address                                           AS ar_email,
        black_list                                              AS ar_status,
        NULL::INTEGER                                           AS ar_credit_days,
        NULL::VARCHAR                                           AS ar_limit_type,
        overall_credit_limit                                    AS ar_limit_amount,
        overall_credit_limit                                    AS ar_final_limit,
        gl_code                                                 AS ar_gl_code,
        control_acc                                             AS ar_control_acc
      FROM qnav_sub_ra_cust_addr_prof
    `);
    console.log('View id_ar_master_view created successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
