
const db = require('../config/db');

async function updateRoleNames() {
    try {
        console.log("🚀 Updating Role Names to match new requirements...");

        // 1. Rename 'Directeur RH' -> 'DRH'
        console.log("Checking for 'Directeur RH'...");
        const [directorRoles] = await db.query("SELECT * FROM Role WHERE name LIKE '%Directeur RH%'");
        for (const role of directorRoles) {
            const newName = role.name.replace('Directeur RH', 'DRH');
            console.log(`  -> Renaming '${role.name}' to '${newName}'`);
            try {
                await db.query("UPDATE Role SET name = ? WHERE id = ?", [newName, role.id]);
            } catch (err) {
                console.warn(`    ! Could not rename (might exist): ${err.message}`);
                // If it exists, maybe we merge or just skip. 
                // For now, let's assume unique constraint might be hit if DRH already exists.
            }
        }

        // 2. Rename 'Responsable développement et recrutement' -> 'Responsable Recrutement'
        console.log("Checking for 'Responsable développement et recrutement'...");
        const [recruitmentRoles] = await db.query("SELECT * FROM Role WHERE name LIKE '%Responsable développement et recrutement%'");
        for (const role of recruitmentRoles) {
            const newName = role.name.replace('Responsable développement et recrutement', 'Responsable Recrutement');
            console.log(`  -> Renaming '${role.name}' to '${newName}'`);
            try {
                await db.query("UPDATE Role SET name = ? WHERE id = ?", [newName, role.id]);
            } catch (err) {
                console.warn(`    ! Could not rename: ${err.message}`);
            }
        }

        // 3. Ensure 'Demandeur' exists (optional, mostly for testing or specific users)
        // Usually Demandeur is an implicitly role for standard "Employé" or just anyone not an Approver.
        // But if we want a specific "Demandeur" role:
        // await db.query("INSERT IGNORE INTO Role ...");

        console.log("✅ Role Name Updates Complete.");
        process.exit();

    } catch (error) {
        console.error("❌ Error updating roles:", error);
        process.exit(1);
    }
}

updateRoleNames();
