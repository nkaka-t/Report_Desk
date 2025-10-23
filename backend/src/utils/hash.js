const bcrypt = require('bcrypt');

const hash = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const compare = async (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hash, compare };
