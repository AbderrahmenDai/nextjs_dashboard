const db = require('../config/db');

async function checkSchema() {
    try {
        console.log("Checking HiringRequest columns...");
        const [columns] = await db.query("SHOW COLUMNS FROM HiringRequest");
        const colNames = columns.map(c => c.Field);
        console.log("Columns:", colNames.join(", "));
        
        const required = ['site', 'businessUnit', 'roleId', 'replacementFor', 'replacementReason'];
        const missing = required.filter(r => !colNames.includes(r));
        
        if (missing.length > 0) {
            console.log("❌ Missing columns:", missing);
        } else {
            console.log("✅ All required columns present.");
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
