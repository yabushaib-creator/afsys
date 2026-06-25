const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all currencies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_currency_master ORDER BY currency_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single currency
router.get('/:company/:code', async (req, res) => {
  try {
    const { company, code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_currency_master WHERE currency_company = $1 AND currency_code = $2`,
      [company, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Currency not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create currency
router.post('/', async (req, res) => {
  const {
    currency_company, currency_code, currency_name, currency_corporate_rate,
    currency_customer_rate, currency_market_rate, currency_other_rate,
    currency_filter_0, currency_filter_1, currency_filter_2, currency_filter_3,
    currency_filter_4, currency_filter_5, currency_filter_6, currency_filter_7,
    currency_filter_8, currency_filter_9, currency_created_by, currency_created_on
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_currency_master
       (currency_company, currency_code, currency_name, currency_corporate_rate,
        currency_customer_rate, currency_market_rate, currency_other_rate,
        currency_filter_0, currency_filter_1, currency_filter_2, currency_filter_3,
        currency_filter_4, currency_filter_5, currency_filter_6, currency_filter_7,
        currency_filter_8, currency_filter_9, currency_created_by, currency_created_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [currency_company, currency_code, currency_name, currency_corporate_rate || 0,
       currency_customer_rate || 0, currency_market_rate || 0, currency_other_rate || 0,
       currency_filter_0, currency_filter_1, currency_filter_2, currency_filter_3,
       currency_filter_4, currency_filter_5, currency_filter_6, currency_filter_7,
       currency_filter_8, currency_filter_9, currency_created_by, currency_created_on]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update currency
router.put('/:company/:code', async (req, res) => {
  const { company, code } = req.params;
  const {
    currency_name, currency_corporate_rate, currency_customer_rate,
    currency_market_rate, currency_other_rate, currency_filter_0, currency_filter_1,
    currency_filter_2, currency_filter_3, currency_filter_4, currency_filter_5,
    currency_filter_6, currency_filter_7, currency_filter_8, currency_filter_9,
    currency_modified_by, currency_modified_on
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_currency_master
       SET currency_name = $1, currency_corporate_rate = $2, currency_customer_rate = $3,
           currency_market_rate = $4, currency_other_rate = $5, currency_filter_0 = $6,
           currency_filter_1 = $7, currency_filter_2 = $8, currency_filter_3 = $9,
           currency_filter_4 = $10, currency_filter_5 = $11, currency_filter_6 = $12,
           currency_filter_7 = $13, currency_filter_8 = $14, currency_filter_9 = $15,
           currency_modified_by = $16, currency_modified_on = $17
       WHERE currency_company = $18 AND currency_code = $19
       RETURNING *`,
      [currency_name, currency_corporate_rate || 0, currency_customer_rate || 0,
       currency_market_rate || 0, currency_other_rate || 0, currency_filter_0,
       currency_filter_1, currency_filter_2, currency_filter_3, currency_filter_4,
       currency_filter_5, currency_filter_6, currency_filter_7, currency_filter_8,
       currency_filter_9, currency_modified_by, currency_modified_on, company, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Currency not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE currency
router.delete('/:company/:code', async (req, res) => {
  const { company, code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_currency_master WHERE currency_company = $1 AND currency_code = $2 RETURNING currency_code`,
      [company, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Currency not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].currency_code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
