const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all AR values
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_ar_master_view ORDER BY ar_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single AR value
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_ar_master_view WHERE ar_code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AR value not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create AR value
router.post('/', async (req, res) => {
  const { ar_code, ar_name } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_ar_master_view (ar_code, ar_name)
       VALUES ($1, $2)
       RETURNING *`,
      [ar_code, ar_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update AR value
router.put('/:code', async (req, res) => {
  const { code } = req.params;
  const { ar_name } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_ar_master_view SET ar_name = $1 WHERE ar_code = $2 RETURNING *`,
      [ar_name, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AR value not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE AR value
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_ar_master_view WHERE ar_code = $1 RETURNING ar_code`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AR value not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].ar_code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
