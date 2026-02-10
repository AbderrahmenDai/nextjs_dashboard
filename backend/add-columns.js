const db = require('./config/db');

async function addColumns() {
    try {
        console.log('Adding logoUrl column...');
        await db.query('ALTER TABLE Department ADD COLUMN logoUrl VARCHAR(255) NULL');
        console.log('Added logoUrl column.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('logoUrl column already exists.');
        } else {
            console.error('Error adding logoUrl:', error);
        }
    }

    try {
        console.log('Adding icon column...');
        await db.query('ALTER TABLE Department ADD COLUMN icon VARCHAR(50) NULL');
        console.log('Added icon column.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('icon column already exists.');
        } else {
            console.error('Error adding icon:', error);
        }
    }

    process.exit();
}

addColumns();
