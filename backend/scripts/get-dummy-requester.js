const db = require('../config/db');

async function getRequester() {
    try {
        const [users] = await db.query('SELECT id, name FROM User LIMIT 1');
        console.log('Valid User ID:', users[0].id);
        console.log('Valid User Name:', users[0].name);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getRequester();
