const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all user groups
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_user_group ORDER BY ugroup_company, ugroup_code`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user group
router.get('/:company/:code', async (req, res) => {
  try {
    const { company, code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_user_group WHERE ugroup_company = $1 AND ugroup_code = $2`,
      [company, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User group not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user group
router.post('/', async (req, res) => {
  const {
    ugroup_company, ugroup_code, ugroup_description, ugroup_primary, ugroup_belong_to,
    ugroup_filter_0, ugroup_filter_1, ugroup_filter_2, ugroup_filter_3, ugroup_filter_4,
    ugroup_filter_5, ugroup_filter_6, ugroup_filter_7, ugroup_filter_8, ugroup_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_user_group
       (ugroup_company, ugroup_code, ugroup_description, ugroup_primary, ugroup_belong_to,
        ugroup_filter_0, ugroup_filter_1, ugroup_filter_2, ugroup_filter_3, ugroup_filter_4,
        ugroup_filter_5, ugroup_filter_6, ugroup_filter_7, ugroup_filter_8, ugroup_filter_9)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [ugroup_company, ugroup_code, ugroup_description, ugroup_primary || 'N', ugroup_belong_to,
       ugroup_filter_0, ugroup_filter_1, ugroup_filter_2, ugroup_filter_3, ugroup_filter_4,
       ugroup_filter_5, ugroup_filter_6, ugroup_filter_7, ugroup_filter_8, ugroup_filter_9]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update user group
router.put('/:company/:code', async (req, res) => {
  const { company, code } = req.params;
  const {
    ugroup_description, ugroup_primary, ugroup_belong_to, ugroup_filter_0, ugroup_filter_1,
    ugroup_filter_2, ugroup_filter_3, ugroup_filter_4, ugroup_filter_5, ugroup_filter_6,
    ugroup_filter_7, ugroup_filter_8, ugroup_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_user_group
       SET ugroup_description = $1, ugroup_primary = $2, ugroup_belong_to = $3,
           ugroup_filter_0 = $4, ugroup_filter_1 = $5, ugroup_filter_2 = $6,
           ugroup_filter_3 = $7, ugroup_filter_4 = $8, ugroup_filter_5 = $9,
           ugroup_filter_6 = $10, ugroup_filter_7 = $11, ugroup_filter_8 = $12,
           ugroup_filter_9 = $13
       WHERE ugroup_company = $14 AND ugroup_code = $15
       RETURNING *`,
      [ugroup_description, ugroup_primary, ugroup_belong_to, ugroup_filter_0, ugroup_filter_1,
       ugroup_filter_2, ugroup_filter_3, ugroup_filter_4, ugroup_filter_5, ugroup_filter_6,
       ugroup_filter_7, ugroup_filter_8, ugroup_filter_9, company, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User group not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user group
router.delete('/:company/:code', async (req, res) => {
  const { company, code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_user_group WHERE ugroup_company = $1 AND ugroup_code = $2 RETURNING ugroup_code`,
      [company, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User group not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].ugroup_code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
