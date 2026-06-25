const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM id_basis_master ORDER BY basis_code`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { basis_code, basis_name, basis_flag } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO id_basis_master (basis_code, basis_name, basis_flag) VALUES ($1, $2, $3) RETURNING *`,
      [basis_code, basis_name, basis_flag || 'Y']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:code', async (req, res) => {
  const { basis_name, basis_flag } = req.body;
  try {
    const result = await pool.query(
      `UPDATE id_basis_master SET basis_name=$1, basis_flag=$2 WHERE basis_code=$3 RETURNING *`,
      [basis_name, basis_flag, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM id_basis_master WHERE basis_code=$1 RETURNING basis_code`,
      [req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
