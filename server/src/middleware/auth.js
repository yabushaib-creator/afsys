const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'afsys_jwt_s3cr3t_milaha_2026';

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

module.exports = { requireAuth, SECRET };
