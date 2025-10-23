const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const waitForDb = async (sequelize, attempts = 5, delay = 2000) => {
  let i = 0;
  while (i < attempts) {
    try {
      await sequelize.authenticate();
      console.log('DB connected');
      return true;
    } catch (err) {
      console.warn(`DB connect attempt ${i+1} failed: ${err.message}`);
      i += 1;
      await wait(delay * i);
    }
  }
  throw new Error('Unable to connect to DB after retries');
};

module.exports = { waitForDb };
