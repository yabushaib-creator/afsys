const pool = require('./src/config/db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS id_document_type_master (
      doc_company           VARCHAR(10)   NOT NULL,
      doc_type              VARCHAR(10)   NOT NULL,
      doc_name              VARCHAR(75)   NOT NULL,
      doc_prefix            VARCHAR(5)    NOT NULL,
      doc_short_name        VARCHAR(10)   NOT NULL,
      doc_module            VARCHAR(50)   NOT NULL,
      doc_base              VARCHAR(10)   NOT NULL,
      doc_approval_required VARCHAR(1)    NOT NULL DEFAULT 'N',
      doc_approval_numbers  NUMERIC(2)    NOT NULL DEFAULT 0,
      doc_starting_number   NUMERIC(10)   NOT NULL DEFAULT 1,
      doc_print_program     VARCHAR(240),
      doc_print_path        VARCHAR(240),
      doc_print_command     VARCHAR(2000),
      doc_print_call_1      VARCHAR(1)    NOT NULL DEFAULT 'N',
      doc_print_call_2      VARCHAR(1)    NOT NULL DEFAULT 'N',
      doc_print_call_3      VARCHAR(1)    NOT NULL DEFAULT 'N',
      doc_print_call_4      VARCHAR(1)    NOT NULL DEFAULT 'Y',
      doc_printer           VARCHAR(50)   NOT NULL DEFAULT 'LPT1',
      doc_notes             VARCHAR(2000),
      doc_posting_module    VARCHAR(10)   NOT NULL,
      doc_printing          VARCHAR(1)    NOT NULL DEFAULT 'N',
      doc_online_posting    VARCHAR(1)    DEFAULT 'N',
      doc_filter_0          VARCHAR(240),
      doc_filter_1          VARCHAR(240),
      doc_filter_2          VARCHAR(240),
      doc_filter_3          VARCHAR(240),
      doc_filter_4          VARCHAR(240),
      doc_filter_5          VARCHAR(240),
      doc_filter_6          VARCHAR(240),
      doc_filter_7          VARCHAR(240),
      doc_filter_8          VARCHAR(240),
      doc_filter_9          VARCHAR(240)
    )
  `);
  console.log('Table id_document_type_master created.');

  await pool.query(`
    CREATE INDEX IF NOT EXISTS document_master_key
      ON id_document_type_master (doc_company, doc_type, doc_filter_0, doc_filter_1)
  `);
  console.log('Index document_master_key created.');

  await pool.query(`
    CREATE INDEX IF NOT EXISTS document_type_master_fx
      ON id_document_type_master (doc_filter_0, doc_filter_1)
  `);
  console.log('Index document_type_master_fx created.');

  await pool.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
