const db = require('./config/db');

async function checkCandidature() {
    try {
        console.log('--- CANDIDATURE COLUMNS ---');
        const [columns] = await db.query('SHOW COLUMNS FROM candidature');
        console.log(columns.map(c => c.Field));
        
        console.log('\n--- FIRST ROW ---');
        const [rows] = await db.query('SELECT * FROM candidature LIMIT 1');
        console.log(rows[0]);
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

checkCandidature();
