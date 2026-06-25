const pool = require('./src/config/db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS id_qn_fv_ar_header (
      sub_ar_company         VARCHAR(10)   NOT NULL,
      sub_ar_doc_type        VARCHAR(10)   NOT NULL,
      sub_ar_doc_number      VARCHAR(25)   NOT NULL,
      sub_ar_internal_number NUMERIC       NOT NULL,
      sub_ar_doc_base        VARCHAR(10)   NOT NULL,
      sub_ar_code            VARCHAR(10)   NOT NULL,
      sub_ar_group           VARCHAR(10)   NOT NULL,
      sub_ar_other_reference VARCHAR(50)   NOT NULL,
      sub_ar_date            DATE          NOT NULL,
      sub_ar_gl_date         DATE          NOT NULL,
      sub_ar_due_date        DATE          NOT NULL,
      sub_ar_age_date        DATE          NOT NULL,
      sub_ar_currency        VARCHAR(10)   NOT NULL,
      sub_ar_ex_rate         NUMERIC       NOT NULL,
      sub_ar_f_amount        NUMERIC       NOT NULL,
      sub_ar_l_amount        NUMERIC       NOT NULL,
      sub_ar_narration       VARCHAR(240),
      sub_ar_user            VARCHAR(10)   NOT NULL,
      sub_ar_created         DATE          NOT NULL DEFAULT CURRENT_DATE,
      sub_ar_status          VARCHAR(1)    NOT NULL DEFAULT 'N',
      sub_ar_posted_date     DATE,
      sub_ar_discount        NUMERIC       NOT NULL DEFAULT 0,
      sub_ar_tax             NUMERIC       NOT NULL DEFAULT 0,
      sub_ar_notes           VARCHAR(2000),
      sub_ar_flex_1          VARCHAR(240),
      sub_ar_flex_2          VARCHAR(240),
      sub_ar_flex_3          VARCHAR(240),
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
    CREATE UNIQUE INDEX IF NOT EXISTS far_ar_key
      ON id_qn_fv_ar_header (sub_ar_company, sub_ar_doc_type, sub_ar_doc_number)
  `);
  console.log('Unique index far_ar_key created.');

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS fv_int_no_idx
      ON id_qn_fv_ar_header (sub_ar_internal_number)
  `);
  console.log('Unique index fv_int_no_idx created.');

  await pool.query(`
    CREATE INDEX IF NOT EXISTS far_ar_header_fx
      ON id_qn_fv_ar_header (sub_filter_0, sub_filter_1)
  `);
  console.log('Index far_ar_header_fx created.');

  await pool.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
