const db = require('./config/db');

async function test() {
  try {
    console.log("Attempting to correct to MySQL...");
    const [rows] = await db.query('SELECT 1 + 1 as result');
    console.log("Connection successful! Result:", rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

test();
