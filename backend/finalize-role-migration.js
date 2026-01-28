const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function finalizeMigration() {
    try {
        console.log('Starting final migration...');

        // 1. Get all users
        const [users] = await db.query('SELECT id, role, roleId FROM User');
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            // If roleId is already set, we might check consistency, but primary goal is to handle missing ones.
            // If user has a role string but no roleId, we must migrate it.
            if (user.role && !user.roleId) {
                console.log(`Processing user ${user.id} with legacy role: ${user.role}`);

                // Check if role exists
                const [roleRows] = await db.query('SELECT id FROM Role WHERE name = ?', [user.role]);
                let roleId;

                if (roleRows.length > 0) {
                    roleId = roleRows[0].id;
                    console.log(`  - Role '${user.role}' found (ID: ${roleId}). Linking...`);
                } else {
                    // Create new role
                    roleId = uuidv4();
                    const description = `Auto-generated from legacy data`;
                    await db.query('INSERT INTO Role (id, name, description) VALUES (?, ?, ?)', [roleId, user.role, description]);
                    console.log(`  - Role '${user.role}' created (ID: ${roleId}). Linking...`);
                }

                // Update user
                await db.query('UPDATE User SET roleId = ? WHERE id = ?', [roleId, user.id]);
                console.log(`  - User ${user.id} updated.`);
            }
        }

        console.log('All users migrated. Now dropping legacy column...');

        // 2. Drop the 'role' column
        try {
            await db.query('ALTER TABLE User DROP COLUMN role');
            console.log("Successfully dropped 'role' column from User table.");
        } catch (error) {
            if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log("Column 'role' might already be dropped or doesn't exist.");
            } else {
                throw error;
            }
        }

        console.log('Final migration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

finalizeMigration();
