const db = require('./config/db');

async function verify() {
    try {
        const [rows] = await db.query('DESCRIBE Department');
        console.log(rows.map(r => `${r.Field} (${r.Type})`).join('\n'));
    } catch (error) {
        console.error('Error describing table:', error);
    } finally {
        process.exit();
    }
}

verify();
