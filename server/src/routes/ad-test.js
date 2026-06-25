const express = require('express');
const router = express.Router();
const { Client } = require('ldapts');

async function tryBind(url, bindDN, password) {
  const client = new Client({ url, connectTimeout: 8000, timeout: 8000, tlsOptions: { rejectUnauthorized: false } });
  try {
    await client.bind(bindDN, password);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    try { await client.unbind(); } catch (_) {}
  }
}

router.post('/', async (req, res) => {
  const { server, domain, username, password } = req.body;
  if (!server || !username || !password) {
    return res.status(400).json({ success: false, error: 'server, username and password are required' });
  }

  const ip = server.replace(/^ldaps?:\/\//, '').replace(/:\d+$/, '');
  const url = `ldaps://${ip}:636`;
  const results = {};

  const formats = [
    `${domain}\\${username}`,           // QATARNAV\yabushaib
    `${username}@${domain}.COM`,        // yabushaib@QATARNAV.COM
    `${username}@${domain}`,            // yabushaib@QATARNAV
    `${username}@MILAHA.COM`,           // yabushaib@MILAHA.COM
    username,                           // plain username
  ];

  for (const fmt of formats) {
    results[fmt] = await tryBind(url, fmt, password);
    if (results[fmt].success) return res.json({ success: true, format: fmt, results });
  }

  res.json({ success: false, results });
});

module.exports = router;
