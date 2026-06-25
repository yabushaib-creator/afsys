const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const DEFAULT_COMPANY = 'MILAHA';

// GET all vessel calls
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_qn_fgn_vsl_call_details ORDER BY qfvc_eta DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single vessel call
router.get('/:company/:refno', async (req, res) => {
  try {
    const { company, refno } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_qn_fgn_vsl_call_details WHERE qfvc_company = $1 AND qfvc_refno = $2`,
      [company, refno]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel call not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create vessel call
router.post('/', async (req, res) => {
  const {
    qfvc_vessel, qfvc_name, qfvc_party, qfvc_eta, qfvc_etd, qfvc_l_date,
    qfvc_captain, qfvc_remarks, qfvc_status, qfvc_flex_1, qfvc_flex_2, qfvc_flex_3,
    qfvc_flex_4, qfvc_flex_5, qfvc_filter_0, qfvc_filter_1, qfvc_filter_2, qfvc_filter_3,
    qfvc_filter_4, qfvc_filter_5, qfvc_filter_6, qfvc_filter_7, qfvc_filter_8, qfvc_filter_9
  } = req.body;

  try {
    // Get next reference number
    const maxResult = await pool.query(
      `SELECT COALESCE(MAX(qfvc_refno), 0) as max_refno FROM id_qn_fgn_vsl_call_details WHERE qfvc_company = $1`,
      [DEFAULT_COMPANY]
    );
    const nextRefno = maxResult.rows[0].max_refno + 1;

    const result = await pool.query(
      `INSERT INTO id_qn_fgn_vsl_call_details
       (qfvc_company, qfvc_refno, qfvc_vessel, qfvc_name, qfvc_party, qfvc_eta, qfvc_etd,
        qfvc_l_date, qfvc_captain, qfvc_remarks, qfvc_status, qfvc_flex_1, qfvc_flex_2,
        qfvc_flex_3, qfvc_flex_4, qfvc_flex_5, qfvc_filter_0, qfvc_filter_1, qfvc_filter_2,
        qfvc_filter_3, qfvc_filter_4, qfvc_filter_5, qfvc_filter_6, qfvc_filter_7,
        qfvc_filter_8, qfvc_filter_9)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
       RETURNING *`,
      [DEFAULT_COMPANY, nextRefno, qfvc_vessel, qfvc_name, qfvc_party, qfvc_eta, qfvc_etd,
       qfvc_l_date, qfvc_captain, qfvc_remarks, qfvc_status || 'A', qfvc_flex_1, qfvc_flex_2,
       qfvc_flex_3, qfvc_flex_4, qfvc_flex_5, qfvc_filter_0, qfvc_filter_1, qfvc_filter_2,
       qfvc_filter_3, qfvc_filter_4, qfvc_filter_5, qfvc_filter_6, qfvc_filter_7,
       qfvc_filter_8, qfvc_filter_9]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update vessel call
router.put('/:company/:refno', async (req, res) => {
  const { company, refno } = req.params;
  const {
    qfvc_vessel, qfvc_name, qfvc_party, qfvc_eta, qfvc_etd, qfvc_l_date,
    qfvc_captain, qfvc_remarks, qfvc_status, qfvc_flex_1, qfvc_flex_2, qfvc_flex_3,
    qfvc_flex_4, qfvc_flex_5, qfvc_filter_0, qfvc_filter_1, qfvc_filter_2, qfvc_filter_3,
    qfvc_filter_4, qfvc_filter_5, qfvc_filter_6, qfvc_filter_7, qfvc_filter_8, qfvc_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_qn_fgn_vsl_call_details
       SET qfvc_vessel = $1, qfvc_name = $2, qfvc_party = $3, qfvc_eta = $4, qfvc_etd = $5,
           qfvc_l_date = $6, qfvc_captain = $7, qfvc_remarks = $8, qfvc_status = $9,
           qfvc_flex_1 = $10, qfvc_flex_2 = $11, qfvc_flex_3 = $12, qfvc_flex_4 = $13, qfvc_flex_5 = $14,
           qfvc_filter_0 = $15, qfvc_filter_1 = $16, qfvc_filter_2 = $17, qfvc_filter_3 = $18,
           qfvc_filter_4 = $19, qfvc_filter_5 = $20, qfvc_filter_6 = $21, qfvc_filter_7 = $22,
           qfvc_filter_8 = $23, qfvc_filter_9 = $24
       WHERE qfvc_company = $25 AND qfvc_refno = $26
       RETURNING *`,
      [qfvc_vessel, qfvc_name, qfvc_party, qfvc_eta, qfvc_etd, qfvc_l_date, qfvc_captain,
       qfvc_remarks, qfvc_status, qfvc_flex_1, qfvc_flex_2, qfvc_flex_3, qfvc_flex_4, qfvc_flex_5,
       qfvc_filter_0, qfvc_filter_1, qfvc_filter_2, qfvc_filter_3, qfvc_filter_4, qfvc_filter_5,
       qfvc_filter_6, qfvc_filter_7, qfvc_filter_8, qfvc_filter_9, company, refno]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel call not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE vessel call
router.delete('/:company/:refno', async (req, res) => {
  const { company, refno } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_qn_fgn_vsl_call_details WHERE qfvc_company = $1 AND qfvc_refno = $2 RETURNING qfvc_refno`,
      [company, refno]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel call not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].qfvc_refno });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
