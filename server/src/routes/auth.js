const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  try {
    const result = await pool.query(
      `SELECT user_code, user_name, user_admin_allow, user_default_company,
              user_filter_0 AS user_allowed_screens
       FROM id_user_master
       WHERE UPPER(user_code) = UPPER($1) AND user_password = $2 AND user_status = 'A'`,
      [username.trim(), password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password, or account is inactive.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
