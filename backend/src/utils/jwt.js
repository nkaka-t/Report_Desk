const jwt = require('jsonwebtoken');

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'replace_this_with_a_strong_secret', { expiresIn: '12h' });

const verify = (token) => jwt.verify(token, process.env.JWT_SECRET || 'replace_this_with_a_strong_secret');

module.exports = { sign, verify };
