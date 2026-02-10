
const db = require('../config/db');

// --- Data ---
const SITE_NAME = "TT";
const DEPARTMENTS = [
  {
    name: "Ressources Humaines",
    roles: [
      "Directeur RH",
      "Responsable RH",
      "Responsable Communication et Formation",
      "Responsable développement et recrutement",
      "HRBP",
      "Responsable Paie",
      "Assistant RH",
      "Chargé Formation et juridique",
      "Cordinateur RH",
      "Chargé RH"
    ]
  },
  {
    name: "HSE",
    roles: [
      "Responsable HSE",
      "Superviseur HSE",
      "Aide Soignant",
      "Infirmier"
    ]
  },
  {
    name: "Achat",
    roles: [
      "Responsable Achat",
      "Acheteur Senior",
      "Acheteur Junior"
    ]
  },
  {
    name: "Finance", // Corrected 'Finace'
    roles: [
      "Responsable comptablité",
      "Responsable Finance",
      "Comptable Senior",
      "Assistant Controleur de Gestion",
      "Controleur de Gestion",
      "Comptable Junior"
    ]
  },
  {
    name: "Qualité",
    roles: [
      "Responsable Qualité",
      "Pilote Qualité UAP",
      "Responsable AQF",
      "Ingénieur AQF",
      "Technicien Qualité système", // Corrected 'Technicen'
      "Responsable Qualité système",
      "Pilote Qualité Client"
    ]
  },
  {
    name: "Indus & Amélioration Continue", // Corrected 'Améloiration'
    roles: [
      "Responsable Indus & Amélioration Continue",
      "Responsable méthode & Amelioration continue",
      "Chef Projet Indus",
      "Ingénieur Process",
      "Technicien Indus & Process",
      "Tech CAO",
      "Chef Projet Cost",
      "Pilote Sprint",
      "Key User SAP",
      "Ingénieur Méthode"
    ]
  },
  {
    name: "Production",
    roles: [
      "Responsable Production",
      "Responsable UAP Confection",
      "Responsable UAP Coupe",
      "Superviseur Confection",
      "Superviseur Coupe"
    ]
  },
  {
    name: "Supply Chain",
    roles: [
      "Responsable Supply Chain",
      "Responsable Approv",
      "Responsable Planification & Contact Client",
      "PIC-PDP",
      "Responsable Flux & Magasin",
      "Planificateur et Contact Client", // Corrected 'Planifacteur'
      "Planificateur Prod", // Corrected 'Planifacteur'
      "Approvisionneur", // Corrected 'Approvisonneur'
      "Superviseur Magasin"
    ]
  },
  {
    name: "Direction",
    roles: [
      "Plant Manager"
    ]
  }
];

// --- Main ---

async function seedTTStructure() {
    try {
        console.log("🚀 Seeding TT Site Structure...");

        // 1. Ensure Site exists
        let [sites] = await db.query('SELECT * FROM Site WHERE name = ?', [SITE_NAME]);
        if (sites.length === 0) {
            console.log(`Creating Site: ${SITE_NAME}`);
            await db.query('INSERT INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)', 
                [SITE_NAME, SITE_NAME, 0, 'Site TT']);
        } else {
            console.log(`Site ${SITE_NAME} OK.`);
        }
        
        // 2. Process Departments & Roles
        for (const deptData of DEPARTMENTS) {
            console.log(`\nProcessing Department: ${deptData.name}`);

            // Find or Create Department
            let [depts] = await db.query('SELECT * FROM Department WHERE name = ? AND siteId = ?', [deptData.name, SITE_NAME]);
            let deptId;

            if (depts.length === 0) {
                // Check if exists in OTHER site (to reuse name cleanly if not strictly separate in DB logic, but here we enforce separate per Site)
                // We create a NEW one just for TT
                const newId = require('uuid').v4();
                await db.query(
                    'INSERT INTO Department (id, name, siteId, budget, employeeCount, status, colorCallback, head, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [newId, deptData.name, SITE_NAME, 0, 0, 'Active', 'blue', 'TBD', SITE_NAME]
                );
                deptId = newId;
                console.log(`  -> Created Department: ${deptData.name} (${deptId})`);
            } else {
                deptId = depts[0].id;
                console.log(`  -> Found Department: ${deptData.name} (${deptId})`);
            }

            // Roles
            for (const roleName of deptData.roles) {
                // Find Role
                let [roles] = await db.query('SELECT * FROM Role WHERE name = ?', [roleName]);
                let roleId;

                if (roles.length === 0) {
                    const newRoleId = require('uuid').v4();
                    await db.query('INSERT INTO Role (id, name, departmentId) VALUES (?, ?, ?)', [newRoleId, roleName, deptId]);
                    roleId = newRoleId;
                    console.log(`    -> Created Role: ${roleName}`);
                } else {
                    roleId = roles[0].id;
                    // Update connection to THIS department if not already set (or if we want to enforce it belongs here)
                    // If it belongs to another Dept (e.g. TTG one), we update it to point here?
                    // "affecté a chaque department leur proper postes"
                    // If "Responsable Production" is used in TTG, and we update departmentId to point to TT Production, does it break TTG?
                    // Previous analysis suggests frontend uses Name matching.
                    // If we update DepartmentId to point to TT-Production, Dept(TT-Production).name is "Production".
                    // If we select Dept(TTG-Production), its name is "Production".
                    // Match works!
                    // So linking to ANY "Production" department is fine.
                    // We update it to ensure at least one link exists.
                    if (roles[0].departmentId !== deptId) {
                         await db.query('UPDATE Role SET departmentId = ? WHERE id = ?', [deptId, roleId]);
                         console.log(`    -> Linked Role: ${roleName} to Department ${deptData.name}`);
                    } else {
                         console.log(`    -> Role already checking out: ${roleName}`);
                    }
                }
            }
        }

        console.log("\n✅ TT Structure Seeding Complete!");

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
    } finally {
        process.exit();
    }
}

seedTTStructure();
