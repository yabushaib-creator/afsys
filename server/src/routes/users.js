const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM id_user_master ORDER BY user_code`
    );
    const rows = result.rows.map(r => ({
      ...r,
      user_allowed_screens: r.user_filter_0 || '',
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT * FROM id_user_master WHERE user_code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  const {
    user_code, user_name, user_password, user_primary_group, user_status,
    user_admin_allow, user_default_company, user_default_location, user_allowed_screens,
    user_filter_0, user_filter_1, user_filter_2, user_filter_3, user_filter_4,
    user_filter_5, user_filter_6, user_filter_7, user_filter_8, user_filter_9,
    user_last_password_changed_on, user_next_password_change_on
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO id_user_master
       (user_code, user_name, user_password, user_primary_group, user_status,
        user_admin_allow, user_default_company, user_filter_0, user_filter_1,
        user_filter_2, user_filter_3, user_filter_4, user_filter_5, user_filter_6,
        user_filter_7, user_filter_8, user_filter_9, user_last_password_changed_on,
        user_next_password_change_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [user_code, user_name, user_password, user_primary_group, user_status || 'A',
       user_admin_allow || 'N', user_default_company,
       user_allowed_screens || user_filter_0 || null,
       user_filter_1, user_filter_2, user_filter_3, user_filter_4, user_filter_5,
       user_filter_6, user_filter_7, user_filter_8, user_filter_9,
       user_last_password_changed_on, user_next_password_change_on]
    );

    const userData = { ...result.rows[0], user_allowed_screens: result.rows[0].user_filter_0 || '' };
    userData.user_default_location = user_default_location;

    res.status(201).json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update user
router.put('/:code', async (req, res) => {
  const { code } = req.params;
  const {
    user_name, user_password, user_primary_group, user_status, user_admin_allow,
    user_default_company, user_default_location, user_allowed_screens,
    user_filter_0, user_filter_1, user_filter_2, user_filter_3,
    user_filter_4, user_filter_5, user_filter_6, user_filter_7, user_filter_8,
    user_filter_9, user_last_password_changed_on, user_next_password_change_on
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE id_user_master
       SET user_name = $1, user_password = $2, user_primary_group = $3, user_status = $4,
           user_admin_allow = $5, user_default_company = $6,
           user_filter_0 = $7,
           user_filter_1 = $8, user_filter_2 = $9, user_filter_3 = $10, user_filter_4 = $11,
           user_filter_5 = $12, user_filter_6 = $13, user_filter_7 = $14, user_filter_8 = $15,
           user_filter_9 = $16, user_last_password_changed_on = $17, user_next_password_change_on = $18
       WHERE user_code = $19
       RETURNING *`,
      [user_name, user_password, user_primary_group, user_status || 'A', user_admin_allow || 'N',
       user_default_company,
       user_allowed_screens !== undefined ? (user_allowed_screens || null) : (user_filter_0 || null),
       user_filter_1, user_filter_2, user_filter_3,
       user_filter_4, user_filter_5, user_filter_6, user_filter_7, user_filter_8,
       user_filter_9, user_last_password_changed_on, user_next_password_change_on, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = { ...result.rows[0], user_allowed_screens: result.rows[0].user_filter_0 || '' };
    userData.user_default_location = user_default_location;

    res.json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM id_user_master WHERE user_code = $1 RETURNING user_code`,
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ success: true, deleted: result.rows[0].user_code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
