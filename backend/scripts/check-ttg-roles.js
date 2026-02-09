const db = require('../config/db');

async function listTTGRoles() {
    try {
        const [rows] = await db.query(`
            SELECT r.name as Role, d.name as Dept, s.name as Site 
            FROM Role r
            JOIN Department d ON r.departmentId = d.id
            JOIN Site s ON d.siteId = s.id
            WHERE s.id = 'TTG' AND d.name = 'Ressources Humaines'
        `);
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
listTTGRoles();
