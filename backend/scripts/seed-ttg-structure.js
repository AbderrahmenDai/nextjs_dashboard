
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const SITE_NAME = "TTG";

const DEPARTMENTS = [
    {
        name: "Ressources Humaines",
        roles: [
            "Directeur RH",
            "Responsable Communication et Formation",
            "Responsable développement et recrutement",
            "HRBP",
            "Responsable Paie",
            "Chargé RH & HSE",
            "Chargé Formation et juridique"
        ]
    },
    {
        name: "HSE",
        roles: [
            "Responsable HSE",
            "Superviseur HSE",
            "Aide Soignant", // Fixed typo "Aide Soient"
            "Infirmier"
        ]
    },
    {
        name: "Achat",
        roles: [
            "Directeur Achat",
            "Acheteur Senior",
            "Acheteur Junior"
        ]
    },
    {
        name: "Finance",
        roles: [
            "Responsable Comptabilité",
            "Responsable Finance",
            "Comptable Senior",
            "Assistant Controleur de Gestion",
            "Controleur de Gestion",
            "Assistant Responsable Cash",
            "Responsable Cash",
            "Comptable Junior"
        ]
    },
    {
        name: "Supply Chain",
        roles: [
            "Responsable Supply Chain",
            "Responsable Aprov",
            "Responsable Planification & Contact Client",
            "PIC-PDP",
            "Responsable Flux & Magasin",
            "Planificateur et Contact Client", // Fixed typo "Planifiacteur"
            "Planificateur Prod",
            "Approvisionneur", // Fixed typo "Approvisorneur"
            "Superviseur Magasin"
        ]
    },
    {
        name: "Qualité",
        roles: [
            "Ing Qualité Prod",
            "Responsable Labo",
            "Responsable AQF"
        ]
    },
    {
        name: "Production",
        roles: [
            "Responsable Manufacturing & Supply Chain",
            "Responsable UAP",
            "Responsable UAP Tissage",
            "Responsable UAP Finition", // Fixed typo "Fintion"
            "Superviseur Tissage",
            "Superviseur Finition"
        ]
    },
    {
        name: "Indus & Amélioration Continue",
        roles: [
            "Responsable Engineering",
            "Chef Projet & Amélioration Continue"
        ]
    },
    {
        name: "Direction",
        roles: [
            "Plant Manager"
        ]
    }
];

async function seedTTGStructure() {
    try {
        console.log(`🌱 Seeding structure for site: ${SITE_NAME}...`);

        // 1. Ensure Site Exists
        const [sites] = await db.query('SELECT * FROM Site WHERE id = ?', [SITE_NAME]);
        if (sites.length === 0) {
            await db.query('INSERT INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)', 
                [SITE_NAME, SITE_NAME, 0, 'Site TTG']);
            console.log(`Created Site: ${SITE_NAME}`);
        } else {
            console.log(`Site ${SITE_NAME} exists.`);
        }

        // 2. Create Departments & Roles
        for (const deptData of DEPARTMENTS) {
            // Check for existing department in this site
            const [existingDepts] = await db.query(
                'SELECT id FROM Department WHERE name = ? AND siteId = ?', 
                [deptData.name, SITE_NAME]
            );

            let deptId;
            if (existingDepts.length > 0) {
                deptId = existingDepts[0].id;
                console.log(`  - Department exists: ${deptData.name}`);
            } else {
                deptId = uuidv4();
                // Default budget logic based on department type (similar to TT)
                let budget = Math.floor(Math.random() * 200000) + 100000;
                if (deptData.name === "Production") budget = 800000;
                if (deptData.name === "Direction") budget = 500000;
                if (deptData.name === "Achat") budget = 300000;

                await db.query(
                    'INSERT INTO Department (id, name, siteId, budget, employeeCount, status, colorCallback, head, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [deptId, deptData.name, SITE_NAME, budget, 0, 'Active', 'blue', 'TBD', SITE_NAME]
                );
                console.log(`  + Created Department: ${deptData.name}`);
            }

            // Roles
            for (const roleName of deptData.roles) {
                const [existingRoles] = await db.query(
                    'SELECT id, departmentId FROM Role WHERE name = ?', 
                    [roleName]
                );

                if (existingRoles.length > 0) {
                    // Check if linked to this department?
                    // Roles are global in name (unique), but linked to a department. 
                    // If the role exists but is linked to another department (e.g. TT), we might have a conflict 
                    // because Role.name is UNIQUE in schema.
                    // However, "Directeur RH" exists in TT. If we try to create it for TTG, we can't if name is unique.
                    // The schema says: name String @unique
                    
                    // SOLUTION: Roles should probably be unique per Department or name should include site if unique.
                    // OR: We reuse the Role "Directeur RH" but it can only belong to ONE departmentId.
                    // This schema limitation (Role belongs to ONE department) combined with Unique Name means we can't share "Directeur RH" across sites if they are strictly modeled as separate department rows.
                    // Wait, `Department` table has `siteId`. So "Ressources Humaines" (TT) and "Ressources Humaines" (TTG) are two rows.
                    // Row 1: Dept RH (TT).
                    // Row 2: Dept RH (TTG).
                    // If Role "Directeur RH" is linked to Dept RH (TT), it cannot be linked to Dept RH (TTG) simultaneously if the relationship is `departmentId String?`.
                    // Ideally, Role names should be "Directeur RH (TT)" or we remove the Unique constraint, or we allow many-to-many.
                    // But for this request, I should probably suffix the roles if they collide, OR check if the User meant the exact same Role string.
                    
                    // Actually, looking at the previous turn's schema check:
                    // model Role { ... name String @unique ... departmentId String? ... }
                    // This is problematic for multi-site strict structure if roles have same names.
                    
                    // Workaround: 
                    // 1. Check if the role is already linked to the CORRECT department (this specific row id).
                    // 2. If linked to another department, we might need to duplicate the role with a suffix? 
                    //    e.g. "Directeur RH - TTG".
                    // Let's assume for now we suffix if collision, to avoid breaking unique constraint.
                    
                    const existingRole = existingRoles[0];
                    if (existingRole.departmentId === deptId) {
                        // All good
                    } else {
                        // Collision! Role exists but points to another Dept (likely in TT).
                        console.log(`    ! Role '${roleName}' exists but linked to another dept. Creating '${roleName} (TTG)'`);
                        
                        const suffixedName = `${roleName} (TTG)`;
                        const [suffixedRoles] = await db.query('SELECT id FROM Role WHERE name = ?', [suffixedName]);
                        
                        if (suffixedRoles.length === 0) {
                            const newRoleId = uuidv4();
                            await db.query('INSERT INTO Role (id, name, departmentId) VALUES (?, ?, ?)', 
                                [newRoleId, suffixedName, deptId]);
                            console.log(`    + Created Role: ${suffixedName}`);
                        }
                    }
                } else {
                    // Doesn't exist, create it
                    const newRoleId = uuidv4();
                    await db.query('INSERT INTO Role (id, name, departmentId) VALUES (?, ?, ?)', 
                        [newRoleId, roleName, deptId]);
                    console.log(`    + Created Role: ${roleName}`);
                }
            }
        }

        console.log("✅ TTG Structure Seeded.");

    } catch (error) {
        console.error("❌ Error seeding TTG structure:", error);
    } finally {
        process.exit();
    }
}

seedTTGStructure();
