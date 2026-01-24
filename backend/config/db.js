const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
console.log("DB_HOST from env:", process.env.DB_HOST);

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
  }
};

console.log("Using DB Config:", {
    ...dbConfig,
    PASSWORD: "***"
});

// Create connection pool
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port: dbConfig.PORT,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max,
  queueLimit: 0
});

// Convert pool to allow async/await
const promisePool = pool.promise();

module.exports = promisePool;
