const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all user access details
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_user_access_details ORDER BY acc_company, acc_user, acc_serial`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET access details for specific user
router.get('/:company/:user', async (req, res) => {
  try {
    const { company, user } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_user_access_details WHERE acc_company = $1 AND acc_user = $2 ORDER BY acc_serial`,
      [company, user]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single access detail
router.get('/:company/:user/:serial', async (req, res) => {
  try {
    const { company, user, serial } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_user_access_details WHERE acc_company = $1 AND acc_user = $2 AND acc_serial = $3`,
      [company, user, parseInt(serial)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User access detail not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user access detail
router.post('/', async (req, res) => {
  const {
    acc_company, acc_user, acc_module, acc_smodule, acc_status, acc_source,
    acc_u_m_name, acc_u_m_level, acc_u_s_name, acc_u_s_level, acc_u_p_name,
    acc_u_p_level, acc_u_module, acc_u_smodule, acc_filter_0, acc_filter_1,
    acc_filter_2, acc_filter_3, acc_filter_4, acc_filter_5, acc_filter_6,
    acc_filter_7, acc_filter_8, acc_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_user_access_details
       (acc_company, acc_user, acc_module, acc_smodule, acc_status, acc_source,
        acc_u_m_name, acc_u_m_level, acc_u_s_name, acc_u_s_level, acc_u_p_name,
        acc_u_p_level, acc_u_module, acc_u_smodule, acc_filter_0, acc_filter_1,
        acc_filter_2, acc_filter_3, acc_filter_4, acc_filter_5, acc_filter_6,
        acc_filter_7, acc_filter_8, acc_filter_9)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING *`,
      [acc_company, acc_user, acc_module, acc_smodule, acc_status || 'A', acc_source,
       acc_u_m_name, acc_u_m_level, acc_u_s_name, acc_u_s_level, acc_u_p_name,
       acc_u_p_level, acc_u_module, acc_u_smodule, acc_filter_0, acc_filter_1,
       acc_filter_2, acc_filter_3, acc_filter_4, acc_filter_5, acc_filter_6,
       acc_filter_7, acc_filter_8, acc_filter_9]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update user access detail
router.put('/:company/:user/:serial', async (req, res) => {
  const { company, user, serial } = req.params;
  const {
    acc_module, acc_smodule, acc_status, acc_source, acc_u_m_name, acc_u_m_level,
    acc_u_s_name, acc_u_s_level, acc_u_p_name, acc_u_p_level, acc_u_module,
    acc_u_smodule, acc_filter_0, acc_filter_1, acc_filter_2, acc_filter_3,
    acc_filter_4, acc_filter_5, acc_filter_6, acc_filter_7, acc_filter_8, acc_filter_9
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_user_access_details
       SET acc_module = $1, acc_smodule = $2, acc_status = $3, acc_source = $4,
           acc_u_m_name = $5, acc_u_m_level = $6, acc_u_s_name = $7, acc_u_s_level = $8,
           acc_u_p_name = $9, acc_u_p_level = $10, acc_u_module = $11, acc_u_smodule = $12,
           acc_filter_0 = $13, acc_filter_1 = $14, acc_filter_2 = $15, acc_filter_3 = $16,
           acc_filter_4 = $17, acc_filter_5 = $18, acc_filter_6 = $19, acc_filter_7 = $20,
           acc_filter_8 = $21, acc_filter_9 = $22
       WHERE acc_company = $23 AND acc_user = $24 AND acc_serial = $25
       RETURNING *`,
      [acc_module, acc_smodule, acc_status, acc_source, acc_u_m_name, acc_u_m_level,
       acc_u_s_name, acc_u_s_level, acc_u_p_name, acc_u_p_level, acc_u_module,
       acc_u_smodule, acc_filter_0, acc_filter_1, acc_filter_2, acc_filter_3,
       acc_filter_4, acc_filter_5, acc_filter_6, acc_filter_7, acc_filter_8,
       acc_filter_9, company, user, parseInt(serial)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User access detail not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user access detail
router.delete('/:company/:user/:serial', async (req, res) => {
  const { company, user, serial } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_user_access_details WHERE acc_company = $1 AND acc_user = $2 AND acc_serial = $3 RETURNING acc_serial`,
      [company, user, parseInt(serial)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User access detail not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].acc_serial });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
