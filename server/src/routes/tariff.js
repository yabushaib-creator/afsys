const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all tariffs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qft_company, qft_code, qft_description, qft_currency, qft_amount, qft_account, qft_status
       FROM id_qn_fv_tariff_master
       ORDER BY qft_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create tariff
router.post('/', async (req, res) => {
  const { qft_company, qft_code, qft_description, qft_currency, qft_amount, qft_account } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO id_qn_fv_tariff_master
         (qft_company, qft_code, qft_description, qft_currency, qft_amount, qft_account, qft_created_by, qft_created_on, qft_modified_on)
       VALUES ($1, $2, $3, $4, $5, $6, 'SYSTEM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [qft_company, qft_code, qft_description, qft_currency, qft_amount, qft_account]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Tariff code already exists for this company.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update tariff
router.put('/:company/:code', async (req, res) => {
  const { company, code } = req.params;
  const { qft_description, qft_currency, qft_amount, qft_account } = req.body;
  try {
    const result = await pool.query(
      `UPDATE id_qn_fv_tariff_master
       SET qft_description = $1, qft_currency = $2, qft_amount = $3, qft_account = $4,
           qft_modified_by = 'SYSTEM', qft_modified_on = CURRENT_TIMESTAMP
       WHERE qft_company = $5 AND qft_code = $6
       RETURNING *`,
      [qft_description, qft_currency, qft_amount, qft_account, company, code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tariff not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tariff
router.delete('/:company/:code', async (req, res) => {
  const { company, code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_qn_fv_tariff_master WHERE qft_company = $1 AND qft_code = $2 RETURNING *`,
      [company, code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tariff not found.' });
    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
