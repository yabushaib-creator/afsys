const pool = require('./src/config/db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS id_qn_fv_ar_details (
      sub_ard_company        VARCHAR(10)   NOT NULL,
      sub_ard_doc_type       VARCHAR(10)   NOT NULL,
      sub_ard_doc_number     VARCHAR(25)   NOT NULL,
      sub_ard_serial         NUMERIC       NOT NULL,
      sub_ard_currency       VARCHAR(10),
      sub_ard_ex_rate        NUMERIC,
      sub_ard_foreign_amount NUMERIC       NOT NULL DEFAULT 0,
      sub_ard_local_amount   NUMERIC       NOT NULL DEFAULT 0,
      sub_ard_narration      VARCHAR(240),
      sub_ard_notes          VARCHAR(2000),
      sub_ard_detail_1       VARCHAR(50),
      sub_ard_detail_2       VARCHAR(50),
      sub_ard_detail_3       VARCHAR(50),
      sub_ard_detail_4       VARCHAR(50),
      sub_ard_detail_5       VARCHAR(50),
      sub_ard_detail_6       VARCHAR(50),
      sub_ard_detail_7       VARCHAR(50),
      sub_ard_detail_8       VARCHAR(50),
      sub_ard_detail_9       VARCHAR(50),
      sub_ard_detail_10      VARCHAR(50),
      sub_filter_0           VARCHAR(240),
      sub_filter_1           VARCHAR(240),
      sub_filter_2           VARCHAR(240),
      sub_filter_3           VARCHAR(240),
      sub_filter_4           VARCHAR(240),
      sub_filter_5           VARCHAR(240),
      sub_filter_6           VARCHAR(240),
      sub_filter_7           VARCHAR(240),
      sub_filter_8           VARCHAR(240),
      sub_filter_9           VARCHAR(240)
    )
  `);
  console.log('Table created.');

  await pool.query(`
    CREATE INDEX IF NOT EXISTS far_ar_details_fx
      ON id_qn_fv_ar_details (sub_filter_0, sub_filter_1)
  `);
  console.log('Index far_ar_details_fx created.');

  await pool.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
