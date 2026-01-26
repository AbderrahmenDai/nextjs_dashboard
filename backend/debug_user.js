const db = require('./config/db');

async function debug() {
    try {
        const [users] = await db.query('SELECT * FROM User LIMIT 1');
        if (users.length > 0) {
            console.log('Keys:', Object.keys(users[0]));
            console.log('Name value:', users[0].name);
            console.log('Email value:', users[0].email);
        } else {
            console.log('No users found');
        }
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}

debug();
