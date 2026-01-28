const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function updateSchema() {
    try {
        console.log('Creating Role table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS Role (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191) UNIQUE NOT NULL,
                description VARCHAR(191)
            )
        `);

        console.log('Adding roleId to User table...');
        const [columns] = await db.query(`SHOW COLUMNS FROM User LIKE 'roleId'`);
        if (columns.length === 0) {
            await db.query(`ALTER TABLE User ADD COLUMN roleId VARCHAR(191)`);
            console.log('Added roleId column.');
            
            // Add foreign key constraint
            try {
                await db.query(`ALTER TABLE User ADD CONSTRAINT fk_user_role FOREIGN KEY (roleId) REFERENCES Role(id) ON DELETE SET NULL`);
                console.log('Added foreign key constraint.');
            } catch (fkError) {
                console.error('Error adding foreign key (might already exist or data inconsistency):', fkError.message);
            }
        } else {
            console.log('roleId column already exists.');
        }

        console.log('Seeding roles...');
        const roles = [
            { name: 'ADMIN', description: 'Administrator', legacyName: 'Direction' },
            { name: 'HR_MANAGER', description: 'HR Manager', legacyName: 'HR_MANAGER' },
            { name: 'RESPONSABLE_RECRUTEMENT', description: 'Recruitment Manager', legacyName: 'Responsable Recrutement' },
            { name: 'DEMANDEUR', description: 'Requester', legacyName: 'Demandeur' },
            { name: 'EMPLOYEE', description: 'Employee', legacyName: 'Employee' }
        ];

        for (const role of roles) {
            // Check if role exists
            const [existing] = await db.query('SELECT id FROM Role WHERE name = ?', [role.name]);
            let roleId;
            
            if (existing.length > 0) {
                roleId = existing[0].id;
                console.log(`Role ${role.name} already exists with ID: ${roleId}`);
            } else {
                roleId = uuidv4();
                await db.query('INSERT INTO Role (id, name, description) VALUES (?, ?, ?)', [roleId, role.name, role.description]);
                console.log(`Created role ${role.name} with ID: ${roleId}`);
            }

            // Migrate Users
            if (role.legacyName) {
                const [result] = await db.query(`UPDATE User SET roleId = ? WHERE role = ? AND (roleId IS NULL OR roleId = '')`, [roleId, role.legacyName]);
                console.log(`Migrated ${result.affectedRows} users from legacy role '${role.legacyName}' to '${role.name}'`);
            }
        }
        
        console.log('Schema update and migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
