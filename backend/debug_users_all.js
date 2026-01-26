const db = require('./config/db');

async function debug() {
    try {
        const [users] = await db.query('SELECT id, name, email FROM User');
        console.log('Total users:', users.length);
        users.forEach(u => {
            if (!u.name || u.name === "") {
                console.log('PROBLEM USER:', u);
            } else {
                 // console.log('Valid user:', u.email, u.name);
            }
        });
        
        // Also check one specific user if we can guess... 
        // Let's just dump all users short info
        console.log(JSON.stringify(users, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}

debug();
