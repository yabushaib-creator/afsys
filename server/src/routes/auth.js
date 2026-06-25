const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { Client } = require('ldapts');

const AD_URL    = 'ldaps://172.25.24.210:636';
const AD_SUFFIX = '@MILAHA.COM';

async function verifyAD(username, password) {
  const client = new Client({ url: AD_URL, connectTimeout: 8000, timeout: 8000, tlsOptions: { rejectUnauthorized: false } });
  try {
    await client.bind(`${username}${AD_SUFFIX}`, password);
    return { success: true };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('775')) return { success: false, reason: 'locked', raw: msg };
    return { success: false, reason: 'wrong_password', raw: msg };
  } finally {
    try { await client.unbind(); } catch (_) {}
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Step 1 — verify against Active Directory
  const ad = await verifyAD(username.trim(), password);

  if (!ad.success) {
    if (ad.reason === 'locked') {
      return res.status(401).json({ error: 'Your account is locked. Please contact IT to unlock it.' });
    }
    return res.status(401).json({ error: 'Incorrect password. Please use your Windows login password.' });
  }

  // Step 2 — check user exists and is active in the system
  try {
    const user = username.trim().toLowerCase();
    const userEmail = user.includes('@') ? user : `${user}@milaha.com`;
    const result = await pool.query(
      `SELECT user_code, user_name, user_admin_allow, user_default_company,
              user_filter_0 AS user_allowed_screens
       FROM id_user_master
       WHERE (LOWER(user_code) = $1 OR LOWER(user_code) = $2) AND user_status = 'A'`,
      [user, userEmail]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You don\'t have access to this system. Please contact your administrator.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
