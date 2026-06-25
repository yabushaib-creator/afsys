const pool = require('./src/config/db');

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS qnav_sub_ra_cust_addr_prof (
        customer_number   VARCHAR(30)  NOT NULL,
        customer_name     VARCHAR(200),
        status            VARCHAR(20),
        customer_type     VARCHAR(20),
        postal_code       VARCHAR(50),
        address1          VARCHAR(240) NOT NULL,
        address2          VARCHAR(240),
        address3          VARCHAR(240),
        address4          VARCHAR(240),
        city              VARCHAR(50),
        state             VARCHAR(50),
        country           VARCHAR(50),
        phone_number      VARCHAR(50),
        fax_number        VARCHAR(50),
        telex_number      VARCHAR(50),
        email_address     VARCHAR(100),
        overall_credit_limit NUMERIC,
        gl_code           VARCHAR(50),
        control_acc       VARCHAR(50),
        black_list        VARCHAR(100),
        old_code          VARCHAR(30),
        CONSTRAINT pk_cust_addr_prof PRIMARY KEY (customer_number)
      )
    `);
    console.log('Table qnav_sub_ra_cust_addr_prof created (or already exists).');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cust_addr_prof_status
        ON qnav_sub_ra_cust_addr_prof (status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cust_addr_prof_type
        ON qnav_sub_ra_cust_addr_prof (customer_type)
    `);
    console.log('Indexes created.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
