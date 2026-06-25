const pool = require('./src/config/db');

async function setup() {
  try {
    console.log('Creating ID_QN_FV_SUPPLY_DETAILS table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS id_qn_fv_supply_details (
        qfs_company      VARCHAR(10)    NOT NULL,
        qfs_refno        NUMERIC        NOT NULL,
        qfs_vessel       VARCHAR(10)    NOT NULL,
        qfs_tariff       VARCHAR(10)    NOT NULL,
        qfs_date         DATE           NOT NULL,
        qfs_basis        VARCHAR(10)    NOT NULL,
        qfs_quantity     NUMERIC(16)    NOT NULL,
        qfs_currency     VARCHAR(10)    NOT NULL,
        qfs_exrate       NUMERIC        NOT NULL,
        qfs_rate         NUMERIC        NOT NULL,
        qfs_f_amount     NUMERIC        NOT NULL,
        qfs_l_amount     NUMERIC        NOT NULL,
        qfs_description  VARCHAR(2000),
        qfs_remarks      VARCHAR(2000),
        qfs_inv_type     VARCHAR(10),
        qfs_inv_number   VARCHAR(25),
        qfs_rct_type     VARCHAR(10),
        qfs_rct_number   VARCHAR(25),
        qfs_inv_rct_date DATE,
        qfs_type         VARCHAR(1)     NOT NULL,
        qfs_supplier     VARCHAR(10),
        qfs_supplier_rate NUMERIC       DEFAULT 0,
        qfs_supplier_ref VARCHAR(75),
        qfs_created_by   VARCHAR(10)    NOT NULL,
        qfs_created_on   DATE           NOT NULL,
        qfs_modified_by  VARCHAR(10),
        qfs_modified_on  DATE,
        qfs_filter_0     VARCHAR(240),
        qfs_filter_1     VARCHAR(240),
        qfs_filter_2     VARCHAR(240),
        qfs_filter_3     VARCHAR(240),
        qfs_filter_4     VARCHAR(240),
        qfs_filter_5     VARCHAR(240),
        qfs_filter_6     VARCHAR(240),
        qfs_filter_7     VARCHAR(240),
        qfs_filter_8     VARCHAR(240),
        qfs_filter_9     VARCHAR(240),
        qfs_party        VARCHAR(10)
      )
    `);
    console.log('✓ Table created');

    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS qfs_filter_idx
      ON id_qn_fv_supply_details (qfs_filter_0, qfs_filter_1)
    `);
    console.log('✓ Filter index created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS qfs_inv_idx
      ON id_qn_fv_supply_details (qfs_company, qfs_inv_type, qfs_inv_number)
    `);
    console.log('✓ Invoice index created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS qfs_rct_idx
      ON id_qn_fv_supply_details (qfs_company, qfs_rct_type, qfs_rct_number)
    `);
    console.log('✓ Receipt index created');

    console.log('\n✓ ID_QN_FV_SUPPLY_DETAILS setup complete');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

setup();
