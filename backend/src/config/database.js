const { Sequelize } = require('sequelize');

// Support running against local Postgres or a lightweight SQLite file for
// development without Docker. Set DB_CLIENT=sqlite to use SQLite and
// DB_SQLITE_FILE to point at the file (defaults to ./backend/dev.sqlite).
const DB_CLIENT = (process.env.DB_CLIENT || 'postgres').toLowerCase();

let sequelize;
if (DB_CLIENT === 'sqlite') {
  const storage = process.env.DB_SQLITE_FILE || 'backend/dev.sqlite';
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'reportdesk_db',
    process.env.DB_USER || 'reportdesk',
    process.env.DB_PASSWORD || 'reportdesk_pass',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;
