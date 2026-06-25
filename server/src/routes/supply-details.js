const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET supply lines filtered by AR code (qfs_party)
router.get('/by-party/:company/:ar_code', async (req, res) => {
  const { company, ar_code } = req.params;
  try {
    const result = await pool.query(
      `SELECT ctid, * FROM id_qn_fv_supply_details
       WHERE qfs_company=$1 AND qfs_party::text=$2
       ORDER BY qfs_date, qfs_tariff`,
      [company, ar_code]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all supply lines for a vessel call, optional ?party= filter
router.get('/:company/:refno', async (req, res) => {
  const { company, refno } = req.params;
  const { party } = req.query;
  const conditions = ['qfs_company=$1', 'qfs_refno=$2'];
  const params = [company, refno];
  if (party) { params.push(party); conditions.push(`qfs_party=$${params.length}`); }
  try {
    const result = await pool.query(
      `SELECT ctid, * FROM id_qn_fv_supply_details
       WHERE ${conditions.join(' AND ')}
       ORDER BY qfs_date, qfs_tariff`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create supply line
router.post('/', async (req, res) => {
  const {
    qfs_company, qfs_refno, qfs_vessel, qfs_tariff, qfs_date, qfs_basis,
    qfs_quantity, qfs_currency, qfs_exrate, qfs_rate, qfs_f_amount, qfs_l_amount,
    qfs_description, qfs_remarks, qfs_inv_type, qfs_inv_number, qfs_rct_type,
    qfs_rct_number, qfs_inv_rct_date, qfs_type, qfs_supplier, qfs_supplier_rate,
    qfs_supplier_ref, qfs_created_by, qfs_party
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_qn_fv_supply_details
       (qfs_company, qfs_refno, qfs_vessel, qfs_tariff, qfs_date, qfs_basis,
        qfs_quantity, qfs_currency, qfs_exrate, qfs_rate, qfs_f_amount, qfs_l_amount,
        qfs_description, qfs_remarks, qfs_inv_type, qfs_inv_number, qfs_rct_type,
        qfs_rct_number, qfs_inv_rct_date, qfs_type, qfs_supplier, qfs_supplier_rate,
        qfs_supplier_ref, qfs_created_by, qfs_created_on, qfs_party)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,CURRENT_DATE,$25)
       RETURNING ctid, *`,
      [qfs_company, qfs_refno, qfs_vessel, qfs_tariff, qfs_date, qfs_basis,
       qfs_quantity, qfs_currency, qfs_exrate, qfs_rate, qfs_f_amount, qfs_l_amount,
       qfs_description, qfs_remarks, qfs_inv_type, qfs_inv_number, qfs_rct_type,
       qfs_rct_number, qfs_inv_rct_date || null, qfs_type, qfs_supplier, qfs_supplier_rate || 0,
       qfs_supplier_ref, qfs_created_by, qfs_party]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update supply line by ctid
router.put('/:ctid', async (req, res) => {
  const ctid = decodeURIComponent(req.params.ctid);
  const {
    qfs_tariff, qfs_date, qfs_basis, qfs_quantity, qfs_currency, qfs_exrate,
    qfs_rate, qfs_f_amount, qfs_l_amount, qfs_description, qfs_remarks,
    qfs_inv_type, qfs_inv_number, qfs_rct_type, qfs_rct_number, qfs_inv_rct_date,
    qfs_type, qfs_supplier, qfs_supplier_rate, qfs_supplier_ref, qfs_modified_by
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_qn_fv_supply_details
       SET qfs_tariff=$1, qfs_date=$2, qfs_basis=$3, qfs_quantity=$4, qfs_currency=$5,
           qfs_exrate=$6, qfs_rate=$7, qfs_f_amount=$8, qfs_l_amount=$9,
           qfs_description=$10, qfs_remarks=$11, qfs_inv_type=$12, qfs_inv_number=$13,
           qfs_rct_type=$14, qfs_rct_number=$15, qfs_inv_rct_date=$16, qfs_type=$17,
           qfs_supplier=$18, qfs_supplier_rate=$19, qfs_supplier_ref=$20,
           qfs_modified_by=$21, qfs_modified_on=CURRENT_DATE
       WHERE ctid=$22::tid
       RETURNING ctid, *`,
      [qfs_tariff, qfs_date, qfs_basis, qfs_quantity, qfs_currency, qfs_exrate,
       qfs_rate, qfs_f_amount, qfs_l_amount, qfs_description, qfs_remarks,
       qfs_inv_type, qfs_inv_number, qfs_rct_type, qfs_rct_number, qfs_inv_rct_date || null,
       qfs_type, qfs_supplier, qfs_supplier_rate || 0, qfs_supplier_ref, qfs_modified_by, ctid]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Row not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE supply line by ctid
router.delete('/:ctid', async (req, res) => {
  const ctid = decodeURIComponent(req.params.ctid);
  try {
    const result = await pool.query(
      `DELETE FROM id_qn_fv_supply_details WHERE ctid=$1::tid RETURNING qfs_tariff`,
      [ctid]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Row not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
