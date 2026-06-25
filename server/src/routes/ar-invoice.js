const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const DEFAULT_COMPANY = 'QTC';

async function recalcHeader(client, company, docType, docNumber) {
  await client.query(`
    UPDATE id_qn_fv_ar_header
    SET sub_ar_f_amount = COALESCE((
          SELECT SUM(sub_ard_foreign_amount) FROM id_qn_fv_ar_details
          WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3
        ), 0),
        sub_ar_l_amount = COALESCE((
          SELECT SUM(sub_ard_local_amount) FROM id_qn_fv_ar_details
          WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3
        ), 0)
    WHERE sub_ar_company=$1 AND sub_ar_doc_type=$2 AND sub_ar_doc_number=$3
  `, [company, docType, docNumber]);
}

// GET AR Code + Group LOV
router.get('/lov', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (av.ar_code)
        av.ar_code         AS ar_code,
        av.ar_name         AS ar_name,
        gl.arg_group_code  AS arg_group_code,
        gl.arg_description AS arg_description
      FROM id_ar_master_view av
      JOIN id_ar_group_link  gl ON av.ar_company = gl.arg_company
                                AND av.ar_code    = gl.arg_code
      WHERE av.ar_company = $1
      ORDER BY av.ar_code, av.ar_name
    `, [DEFAULT_COMPANY]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET headers with optional filters
router.get('/', async (req, res) => {
  const { doc_type, doc_number, doc_base, ar_code, ar_group, status, date_from, date_to } = req.query;
  const conditions = ['h.sub_ar_company=$1'];
  const params = [DEFAULT_COMPANY];

  if (doc_type)   { params.push(doc_type);              conditions.push(`h.sub_ar_doc_type=$${params.length}`); }
  if (doc_number) { params.push(`%${doc_number}%`);     conditions.push(`h.sub_ar_doc_number ILIKE $${params.length}`); }
  if (doc_base)   { params.push(`%${doc_base}%`);       conditions.push(`h.sub_ar_doc_base ILIKE $${params.length}`); }
  if (ar_code)    { params.push(ar_code);               conditions.push(`h.sub_ar_code=$${params.length}`); }
  if (ar_group)   { params.push(`%${ar_group}%`);       conditions.push(`h.sub_ar_group ILIKE $${params.length}`); }
  if (status)     { params.push(status);                conditions.push(`h.sub_ar_status=$${params.length}`); }
  if (date_from)  { params.push(date_from);             conditions.push(`h.sub_ar_date>=$${params.length}`); }
  if (date_to)    { params.push(date_to);               conditions.push(`h.sub_ar_date<=$${params.length}`); }

  try {
    const result = await pool.query(`
      SELECT h.*,
             (SELECT COUNT(*) FROM id_qn_fv_ar_details d
              WHERE d.sub_ard_company=h.sub_ar_company
              AND d.sub_ard_doc_type=h.sub_ar_doc_type
              AND d.sub_ard_doc_number=h.sub_ar_doc_number) AS line_count
      FROM id_qn_fv_ar_header h
      WHERE ${conditions.join(' AND ')}
      ORDER BY h.sub_ar_internal_number DESC
      LIMIT 200
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single header with details
router.get('/:company/:doc_type/:doc_number', async (req, res) => {
  const { company, doc_type, doc_number } = req.params;
  try {
    const [hRes, dRes] = await Promise.all([
      pool.query(
        `SELECT * FROM id_qn_fv_ar_header
         WHERE sub_ar_company=$1 AND sub_ar_doc_type=$2 AND sub_ar_doc_number=$3`,
        [company, doc_type, doc_number]
      ),
      pool.query(
        `SELECT * FROM id_qn_fv_ar_details
         WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3
         ORDER BY sub_ard_serial`,
        [company, doc_type, doc_number]
      ),
    ]);
    if (!hRes.rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ header: hRes.rows[0], details: dRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create header
router.post('/', async (req, res) => {
  const {
    sub_ar_doc_type, sub_ar_doc_number, sub_ar_doc_base, sub_ar_code,
    sub_ar_group, sub_ar_other_reference, sub_ar_date, sub_ar_gl_date,
    sub_ar_due_date, sub_ar_age_date, sub_ar_currency, sub_ar_ex_rate,
    sub_ar_narration, sub_ar_user, sub_ar_status,
    sub_ar_discount, sub_ar_tax, sub_ar_notes,
    sub_ar_flex_1, sub_ar_flex_2, sub_ar_flex_3,
  } = req.body;
  try {
    const intRes = await pool.query(
      `SELECT COALESCE(MAX(sub_ar_internal_number), 0) + 1 AS next_no FROM id_qn_fv_ar_header`
    );
    const internalNumber = intRes.rows[0].next_no;

    const result = await pool.query(`
      INSERT INTO id_qn_fv_ar_header
        (sub_ar_company, sub_ar_doc_type, sub_ar_doc_number, sub_ar_internal_number,
         sub_ar_doc_base, sub_ar_code, sub_ar_group, sub_ar_other_reference,
         sub_ar_date, sub_ar_gl_date, sub_ar_due_date, sub_ar_age_date,
         sub_ar_currency, sub_ar_ex_rate, sub_ar_f_amount, sub_ar_l_amount,
         sub_ar_narration, sub_ar_user, sub_ar_status,
         sub_ar_discount, sub_ar_tax, sub_ar_notes,
         sub_ar_flex_1, sub_ar_flex_2, sub_ar_flex_3)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,0,0,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *
    `, [
      DEFAULT_COMPANY, sub_ar_doc_type, sub_ar_doc_number, internalNumber,
      'INV', sub_ar_code, sub_ar_group || '', sub_ar_other_reference || '',
      sub_ar_date, sub_ar_gl_date, sub_ar_due_date, sub_ar_age_date,
      sub_ar_currency, sub_ar_ex_rate || 1,
      sub_ar_narration, sub_ar_user, sub_ar_status || 'N',
      sub_ar_discount || 0, sub_ar_tax || 0, sub_ar_notes,
      sub_ar_flex_1, sub_ar_flex_2, sub_ar_flex_3,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update header
router.put('/:company/:doc_type/:doc_number', async (req, res) => {
  const { company, doc_type, doc_number } = req.params;
  const {
    sub_ar_doc_base, sub_ar_code, sub_ar_group, sub_ar_other_reference,
    sub_ar_date, sub_ar_gl_date, sub_ar_due_date, sub_ar_age_date,
    sub_ar_currency, sub_ar_ex_rate, sub_ar_narration, sub_ar_status,
    sub_ar_discount, sub_ar_tax, sub_ar_notes,
    sub_ar_flex_1, sub_ar_flex_2, sub_ar_flex_3,
  } = req.body;
  try {
    const result = await pool.query(`
      UPDATE id_qn_fv_ar_header
      SET sub_ar_doc_base=$4, sub_ar_code=$5, sub_ar_group=$6,
          sub_ar_other_reference=$7, sub_ar_date=$8, sub_ar_gl_date=$9,
          sub_ar_due_date=$10, sub_ar_age_date=$11,
          sub_ar_currency=$12, sub_ar_ex_rate=$13,
          sub_ar_narration=$14, sub_ar_status=$15,
          sub_ar_discount=$16, sub_ar_tax=$17, sub_ar_notes=$18,
          sub_ar_flex_1=$19, sub_ar_flex_2=$20, sub_ar_flex_3=$21
      WHERE sub_ar_company=$1 AND sub_ar_doc_type=$2 AND sub_ar_doc_number=$3
      RETURNING *
    `, [
      company, doc_type, doc_number,
      'INV', sub_ar_code, sub_ar_group || '', sub_ar_other_reference || '',
      sub_ar_date, sub_ar_gl_date, sub_ar_due_date, sub_ar_age_date,
      sub_ar_currency, sub_ar_ex_rate || 1,
      sub_ar_narration, sub_ar_status || 'N',
      sub_ar_discount || 0, sub_ar_tax || 0, sub_ar_notes,
      sub_ar_flex_1, sub_ar_flex_2, sub_ar_flex_3,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE header + all details
router.delete('/:company/:doc_type/:doc_number', async (req, res) => {
  const { company, doc_type, doc_number } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM id_qn_fv_ar_details WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3`,
      [company, doc_type, doc_number]
    );
    const result = await client.query(
      `DELETE FROM id_qn_fv_ar_header WHERE sub_ar_company=$1 AND sub_ar_doc_type=$2 AND sub_ar_doc_number=$3 RETURNING sub_ar_doc_number`,
      [company, doc_type, doc_number]
    );
    await client.query('COMMIT');
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST add detail line
router.post('/:company/:doc_type/:doc_number/lines', async (req, res) => {
  const { company, doc_type, doc_number } = req.params;
  const {
    sub_ard_currency, sub_ard_ex_rate,
    sub_ard_foreign_amount, sub_ard_local_amount,
    sub_ard_narration, sub_ard_notes,
    sub_ard_detail_1, sub_ard_detail_2, sub_ard_detail_3, sub_ard_detail_4, sub_ard_detail_5,
    sub_ard_detail_6, sub_ard_detail_7, sub_ard_detail_8, sub_ard_detail_9, sub_ard_detail_10,
    source_ctid,
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const serialRes = await client.query(
      `SELECT COALESCE(MAX(sub_ard_serial), 0) + 1 AS next_serial
       FROM id_qn_fv_ar_details
       WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3`,
      [company, doc_type, doc_number]
    );
    const serial = serialRes.rows[0].next_serial;
    const result = await client.query(`
      INSERT INTO id_qn_fv_ar_details
        (sub_ard_company, sub_ard_doc_type, sub_ard_doc_number, sub_ard_serial,
         sub_ard_currency, sub_ard_ex_rate, sub_ard_foreign_amount, sub_ard_local_amount,
         sub_ard_narration, sub_ard_notes,
         sub_ard_detail_1, sub_ard_detail_2, sub_ard_detail_3, sub_ard_detail_4, sub_ard_detail_5,
         sub_ard_detail_6, sub_ard_detail_7, sub_ard_detail_8, sub_ard_detail_9, sub_ard_detail_10)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *
    `, [
      company, doc_type, doc_number, serial,
      sub_ard_currency, sub_ard_ex_rate || 1,
      sub_ard_foreign_amount || 0, sub_ard_local_amount || 0,
      sub_ard_narration, sub_ard_notes,
      sub_ard_detail_1, sub_ard_detail_2, sub_ard_detail_3, sub_ard_detail_4, sub_ard_detail_5,
      sub_ard_detail_6, sub_ard_detail_7, sub_ard_detail_8, sub_ard_detail_9, sub_ard_detail_10,
    ]);
    // Mark the source supply line as invoiced so it won't appear again
    if (source_ctid) {
      await client.query(
        `UPDATE id_qn_fv_supply_details
         SET qfs_inv_type=$1, qfs_inv_number=$2
         WHERE ctid=$3::tid`,
        [doc_type, doc_number, source_ctid]
      );
    }
    await recalcHeader(client, company, doc_type, doc_number);
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT update detail line
router.put('/:company/:doc_type/:doc_number/lines/:serial', async (req, res) => {
  const { company, doc_type, doc_number, serial } = req.params;
  const {
    sub_ard_currency, sub_ard_ex_rate,
    sub_ard_foreign_amount, sub_ard_local_amount,
    sub_ard_narration, sub_ard_notes,
    sub_ard_detail_1, sub_ard_detail_2, sub_ard_detail_3, sub_ard_detail_4, sub_ard_detail_5,
    sub_ard_detail_6, sub_ard_detail_7, sub_ard_detail_8, sub_ard_detail_9, sub_ard_detail_10,
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(`
      UPDATE id_qn_fv_ar_details
      SET sub_ard_currency=$5, sub_ard_ex_rate=$6,
          sub_ard_foreign_amount=$7, sub_ard_local_amount=$8,
          sub_ard_narration=$9, sub_ard_notes=$10,
          sub_ard_detail_1=$11, sub_ard_detail_2=$12, sub_ard_detail_3=$13,
          sub_ard_detail_4=$14, sub_ard_detail_5=$15, sub_ard_detail_6=$16,
          sub_ard_detail_7=$17, sub_ard_detail_8=$18, sub_ard_detail_9=$19,
          sub_ard_detail_10=$20
      WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3 AND sub_ard_serial=$4
      RETURNING *
    `, [
      company, doc_type, doc_number, serial,
      sub_ard_currency, sub_ard_ex_rate || 1,
      sub_ard_foreign_amount || 0, sub_ard_local_amount || 0,
      sub_ard_narration, sub_ard_notes,
      sub_ard_detail_1, sub_ard_detail_2, sub_ard_detail_3, sub_ard_detail_4, sub_ard_detail_5,
      sub_ard_detail_6, sub_ard_detail_7, sub_ard_detail_8, sub_ard_detail_9, sub_ard_detail_10,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Line not found' });
    await recalcHeader(client, company, doc_type, doc_number);
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE detail line
router.delete('/:company/:doc_type/:doc_number/lines/:serial', async (req, res) => {
  const { company, doc_type, doc_number, serial } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `DELETE FROM id_qn_fv_ar_details
       WHERE sub_ard_company=$1 AND sub_ard_doc_type=$2 AND sub_ard_doc_number=$3 AND sub_ard_serial=$4
       RETURNING sub_ard_serial`,
      [company, doc_type, doc_number, serial]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Line not found' });
    await recalcHeader(client, company, doc_type, doc_number);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
