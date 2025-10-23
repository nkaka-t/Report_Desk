const { verify } = require('../utils/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = verify(token);
    // attach user
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = { id: user.id, role: (user.role || '').toString().toLowerCase(), email: user.email, department_id: user.department_id, full_name: user.full_name };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
