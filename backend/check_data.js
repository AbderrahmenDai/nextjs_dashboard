const db = require('./config/db');

async function checkData() {
    try {
        console.log('--- SITES ---');
        const [sites] = await db.query('SELECT * FROM Site');
        console.log(sites);

        console.log('\n--- DEPARTMENTS ---');
        const [depts] = await db.query('SELECT * FROM Department');
        console.log(depts);

        console.log('\n--- CANDIDATURE TABLES? ---');
        const [tables] = await db.query('SHOW TABLES');
        console.log(tables.map(t => Object.values(t)[0]));
    } catch (err) {
        console.error(err);
    }
    process.exit();
}

checkData();
