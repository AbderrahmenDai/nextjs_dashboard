const db = require('../backend/models');

async function sync() {
    try {
        console.log('Syncing database...');
        
        // Disable foreign key checks to allow dropping tables with constraints
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

        // Drop legacy tables that are not in Sequelize models anymore
        console.log('Dropping legacy tables if they exist...');
        await db.sequelize.query('DROP TABLE IF EXISTS Role', { raw: true });
        await db.sequelize.query('DROP TABLE IF EXISTS Site', { raw: true });
        await db.sequelize.query('DROP TABLE IF EXISTS _prisma_migrations', { raw: true }); // Cleanup prisma

        // Using force: true to drop tables and recreate them
        await db.sequelize.sync({ force: true });
        
        // Re-enable foreign key checks
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        console.log('Database synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

sync();
