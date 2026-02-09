const db = require('./config/db');

async function showTables() {
  try {
    const [rows] = await db.query('SHOW TABLES');
    console.log("Tables in recruitment_db:");
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error("Error showing tables:", err);
    process.exit(1);
  }
}

showTables();
