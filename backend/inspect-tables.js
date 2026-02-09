const db = require('./config/db');

async function inspectTables() {
  try {
    const [deptRows] = await db.query('DESCRIBE Department');
    console.log("Department Table Columns:");
    console.table(deptRows);

    const [userRows] = await db.query('DESCRIBE User');
    console.log("User Table Columns:");
    console.table(userRows);
    
    process.exit(0);
  } catch (err) {
    console.error("Error inspecting tables:", err);
    process.exit(1);
  }
}

inspectTables();
