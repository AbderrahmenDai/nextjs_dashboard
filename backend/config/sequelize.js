const Sequelize = require('sequelize');
require('dotenv').config();

// Database configuration
const dbConfig = {
  HOST: (process.env.DB_HOST === 'mysqldb' || !process.env.DB_HOST) ? "localhost" : process.env.DB_HOST,
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "root",
  DB: process.env.DB_NAME || "recruitment_db",
  PORT: process.env.DB_PORT || 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false // Disable logging for cleaner output
};

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT,
    pool: dbConfig.pool,
    logging: dbConfig.logging
  }
);

module.exports = sequelize;
