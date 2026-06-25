const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all countries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_country_master ORDER BY country_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single country
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_country_master WHERE country_code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Country not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create country
router.post('/', async (req, res) => {
  const {
    country_code, country_name, country_uncode, country_cargo_centre,
    country_filter_0, country_filter_1, country_filter_2, country_filter_3,
    country_filter_4, country_filter_5, country_filter_6, country_filter_7,
    country_filter_8, country_filter_9, country_lang_name, country_arabic_name
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_country_master
       (country_code, country_name, country_uncode, country_cargo_centre,
        country_filter_0, country_filter_1, country_filter_2, country_filter_3,
        country_filter_4, country_filter_5, country_filter_6, country_filter_7,
        country_filter_8, country_filter_9, country_lang_name, country_arabic_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [country_code, country_name, country_uncode, country_cargo_centre,
       country_filter_0 || null, country_filter_1 || null, country_filter_2 || null,
       country_filter_3 || null, country_filter_4 || null, country_filter_5 || null,
       country_filter_6 || null, country_filter_7 || null, country_filter_8 || null,
       country_filter_9 || null, country_lang_name || null, country_arabic_name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Country code already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update country
router.put('/:code', async (req, res) => {
  const { code } = req.params;
  const {
    country_name, country_uncode, country_cargo_centre,
    country_filter_0, country_filter_1, country_filter_2, country_filter_3,
    country_filter_4, country_filter_5, country_filter_6, country_filter_7,
    country_filter_8, country_filter_9, country_lang_name, country_arabic_name
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_country_master
       SET country_name = $1, country_uncode = $2, country_cargo_centre = $3,
           country_filter_0 = $4, country_filter_1 = $5, country_filter_2 = $6,
           country_filter_3 = $7, country_filter_4 = $8, country_filter_5 = $9,
           country_filter_6 = $10, country_filter_7 = $11, country_filter_8 = $12,
           country_filter_9 = $13, country_lang_name = $14, country_arabic_name = $15
       WHERE country_code = $16
       RETURNING *`,
      [country_name, country_uncode, country_cargo_centre,
       country_filter_0 || null, country_filter_1 || null, country_filter_2 || null,
       country_filter_3 || null, country_filter_4 || null, country_filter_5 || null,
       country_filter_6 || null, country_filter_7 || null, country_filter_8 || null,
       country_filter_9 || null, country_lang_name || null, country_arabic_name || null, code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Country not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE country
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_country_master WHERE country_code = $1 RETURNING *`,
      [code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Country not found.' });
    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
