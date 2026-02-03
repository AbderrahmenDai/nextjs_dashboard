const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const usersToSeed = [
    { name: "Meher Hammami", email: "meher.hammami@tescagroup.com", poste: "Responsable HSE", dept: "HSE" },
    { name: "Zoubaier Berrebeh", email: "zoubaier.berrebeh@tescagroup.com", poste: "R.RH", dept: "RH" },
    { name: "Abdelfatteh Mahmoud", email: "abdelfatteh.mahmoud@tescagroup.com", poste: "R.Prod", dept: "Production" },
    { name: "Zouhair Chmissi", email: "zouhair.chmissi@tescagroup.com", poste: "Responsable UAP Coupe", dept: "Production" },
    { name: "Hssan Daghfous", email: "hssan.daghfous@tescagroup.com", poste: "Responsable UAP Confection", dept: "Production" },
    { name: "Walid Trabelsi", email: "walid.trabelsi@tescagroup.com", poste: "Responsable UAP Confection", dept: "Production" },
    { name: "Maher Farhani", email: "maher.farhani@tescagroup.com", poste: "R.Indus & Amelioration continue", dept: "Industrialisation" },
    { name: "Imen Benaicha", email: "imen.benaicha@tescagroup.com", poste: "R.Méthode & Amelioration continue", dept: "Méthodes" },
    { name: "Chokri Ghalioun", email: "chokri.ghalioun@tescagroup.com", poste: "R.Finance", dept: "Finance" },
    { name: "Ines Chaarabi", email: "ines.chaarabi@tescagroup.com", poste: "Controleuse de Gestion", dept: "Finance" },
    { name: "Ahmed Amor", email: "ahmed.amor@tescagroup.com", poste: "R.Comptabilité", dept: "Comptabilité" },
    { name: "Mohamed-Aymen Baccouche", email: "mohamed-aymen.baccouche@tescagroup.com", poste: "D.RH", dept: "RH" },
    { name: "Karim Mani", email: "karim.mani@tescagroup.com", poste: "Plant Manager", dept: "Management" },
    { name: "Kais Fakhet", email: "kais.fakhet@tescagroup.co", poste: "Supply Chain Manager", dept: "Supply Chain" },
    { name: "Rami Ouafi", email: "rami.ouafi@tescagroup.com", poste: "PIC-PDP", dept: "Supply Chain" },
    { name: "Mouna Touati", email: "mouna.touati@tescagroup.com", poste: "Responsable Flux & Magasin", dept: "Supply Chain" },
    { name: "Tarek Ferchichi", email: "tarek.ferchichi@tescagroup.com", poste: "R.Achat", dept: "Achat" },
    { name: "Wsaiidi", email: "wsaiidi@tescagroup.com", poste: "R.Maintenance", dept: "Maintenance" },
    { name: "Hiba Saadani", email: "hiba.saadani@tescagroup.com", poste: "R.Recrutement", dept: "RH" },
    { name: "Mohamed-Karim Tabassi", email: "mohamed-karim.tabassi@tescagroup.com", poste: "R.Qualité", dept: "Qualité" }
];

async function seed() {
    try {
        console.log("🚀 Starting seeding users for Site TT...");

        // 1. Ensure Site TT exists
        const [sites] = await db.query("SELECT id FROM Site WHERE id = 'TT'");
        if (sites.length === 0) {
            console.log("Creating Site TT...");
            await db.query("INSERT INTO Site (id, name, budget, description) VALUES ('TT', 'TT', 5000000.00, 'Main Manufacturing Site')");
        }

        const siteId = 'TT';
        const defaultPassword = await bcrypt.hash('Tesca2026!', 10);

        // Map known color gradients to departments for better look
        const deptColors = {
            "HSE": "from-teal-500 to-emerald-500",
            "RH": "from-orange-500 to-red-500",
            "Production": "from-blue-500 to-cyan-500",
            "Industrialisation": "from-purple-500 to-pink-500",
            "Méthodes": "from-purple-500 to-indigo-500",
            "Finance": "from-pink-500 to-rose-500",
            "Comptabilité": "from-pink-400 to-rose-400",
            "Management": "from-gray-700 to-slate-900",
            "Supply Chain": "from-slate-400 to-gray-600",
            "Achat": "from-amber-400 to-orange-600",
            "Maintenance": "from-blue-600 to-indigo-800",
            "Qualité": "from-emerald-400 to-teal-600"
        };

        // 2. Process each user
        for (const userData of usersToSeed) {
            console.log(`Processing ${userData.name} (${userData.email})...`);

            // a. Ensure Department exists for this site
            const [depts] = await db.query("SELECT id FROM Department WHERE name = ? AND siteId = ?", [userData.dept, siteId]);
            let deptId;
            if (depts.length === 0) {
                deptId = uuidv4();
                console.log(`  - Creating Department ${userData.dept}...`);
                await db.query(`INSERT INTO Department (id, name, head, location, employeeCount, budget, status, siteId, colorCallback) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [deptId, userData.dept, userData.name, 'Site TT', 1, 150000.00, 'Active', siteId, deptColors[userData.dept] || "from-gray-500 to-slate-500"]);
            } else {
                deptId = depts[0].id;
                // Update employeeCount
                await db.query("UPDATE Department SET employeeCount = employeeCount + 1 WHERE id = ?", [deptId]);
            }

            // b. Ensure Role exists
            const [roles] = await db.query("SELECT id FROM Role WHERE name = ?", [userData.poste]);
            let roleId;
            if (roles.length === 0) {
                roleId = uuidv4();
                console.log(`  - Creating Role ${userData.poste}...`);
                await db.query("INSERT INTO Role (id, name, description) VALUES (?, ?, ?)", [roleId, userData.poste, `Role functional for ${userData.poste}`]);
            } else {
                roleId = roles[0].id;
            }

            // c. Create User
            const [existingUsers] = await db.query("SELECT id FROM User WHERE email = ?", [userData.email]);
            if (existingUsers.length === 0) {
                const userId = uuidv4();
                console.log(`  - Creating User ${userData.name}...`);
                
                await db.query(`INSERT INTO User (id, name, email, password, roleId, status, avatarGradient, departmentId) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [userId, userData.name, userData.email, defaultPassword, roleId, 'Active', deptColors[userData.dept] || "from-gray-500 to-slate-500", deptId]);
            } else {
                console.log(`  - User ${userData.email} already exists. Updating department and role...`);
                await db.query("UPDATE User SET departmentId = ?, roleId = ? WHERE email = ?", [deptId, roleId, userData.email]);
            }
        }

        console.log("✅ Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
