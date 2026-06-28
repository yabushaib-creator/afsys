const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const { Client } = require('ldapts');
const { SECRET } = require('../middleware/auth');

const AD_URL    = 'ldaps://172.25.24.210:636';
const AD_SUFFIX = '@MILAHA.COM';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function sanitizeUsername(username) {
  // Allow only safe characters — strip anything that could be LDAP metachar
  return username.replace(/[^a-zA-Z0-9._@\-]/g, '');
}

async function verifyAD(username, password) {
  const client = new Client({
    url: AD_URL,
    connectTimeout: 8000,
    timeout: 8000,
    tlsOptions: { rejectUnauthorized: false },
  });
  try {
    await client.bind(`${username}${AD_SUFFIX}`, password);
    return { success: true };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('775')) return { success: false, reason: 'locked' };
    return { success: false, reason: 'wrong_password' };
  } finally {
    try { await client.unbind(); } catch (_) {}
  }
}

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const clean = sanitizeUsername(username.trim());
  if (!clean) return res.status(400).json({ error: 'Invalid username.' });

  // Strip @domain if user typed full email — we control the suffix
  const adUser = clean.includes('@') ? clean.split('@')[0] : clean;

  const ad = await verifyAD(adUser, password);
  if (!ad.success) {
    if (ad.reason === 'locked') {
      return res.status(401).json({ error: 'Your account is locked. Please contact IT to unlock it.' });
    }
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  try {
    const userEmail = `${adUser.toLowerCase()}@milaha.com`;
    const result = await pool.query(
      `SELECT user_code, user_name, user_admin_allow, user_default_company,
              user_filter_0 AS user_allowed_screens
       FROM id_user_master
       WHERE (LOWER(user_code) = $1 OR LOWER(user_code) = $2) AND user_status = 'A'`,
      [adUser.toLowerCase(), userEmail]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "You don't have access to this system. Please contact your administrator." });
    }
    const user = result.rows[0];
    const token = jwt.sign(
      { user_code: user.user_code, user_name: user.user_name, user_admin_allow: user.user_admin_allow },
      SECRET,
      { expiresIn: '10h' }
    );
    res.json({ token, ...user });
  } catch {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
