const requireRole = (...allowed) => (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const userRole = (user.role || '').toString().toLowerCase();
  const allowedLower = allowed.map(a => (a || '').toString().toLowerCase());
  if (allowedLower.includes(userRole)) return next();
  return res.status(403).json({ error: 'Forbidden' });
};

module.exports = requireRole;
