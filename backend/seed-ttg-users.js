const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedTTGUsers() {
    console.log('🌱 Seeding TTG Users from provided data...');

    const departments = [
        { name: 'Supply Chain', code: 'Supply Chain' },
        { name: 'Qualité', code: 'QM' },
        { name: 'Engineering', code: 'Indus' },
        { name: 'Finance & Controlling', code: 'FI' },
        { name: 'Achat', code: 'Achat' },
        { name: 'Production', code: 'PROD' },
        { name: 'Ressources Humaines', code: 'RH' },
        { name: 'Direction Générale', code: 'DG' }
    ];

    const users = [
        { name: 'Kais Riahi', email: 'kais.riahi@tescagroup.com', role: 'Responsable Manufacturing & Supply Chain', deptCode: 'Supply Chain' },
        { name: 'Mohamed-Karim Tabassi', email: 'mohamed-karim.tabassi@tescagroup.com', role: 'Responsable Qualité', deptCode: 'QM' },
        { name: 'Sahbi Toumi', email: 'sahbi.toumi@tescagroup.com', role: 'Responsable Engineering', deptCode: 'Indus' },
        { name: 'Saida Benbrahim', email: 'saida.benbrahim@tescagroup.com', role: 'Controleuse de Gestion', deptCode: 'FI' },
        { name: 'Feten Mdaissi', email: 'feten.mdaissi@tescagroup.com', role: 'Responsable Cash', deptCode: 'FI' },
        { name: 'Chokri Ghalioun', email: 'chokri.ghalioun@tescagroup.com', role: 'Responsable Finance', deptCode: 'FI' },
        { name: 'Ahmed Amor', email: 'ahmed.amor@tescagroup.com', role: 'Responsable Comptabilité', deptCode: 'FI' },
        { name: 'Tarek Ferchichi', email: 'tarek.ferchichi@tescagroup.com', role: 'Responsable Achat', deptCode: 'Achat' },
        { name: 'Mohamed-Aymen Baccouche', email: 'mohamed-aymen.baccouche@tescagroup.com', role: 'Plant Manager', deptCode: 'DG' },
        { name: 'Raouf Souissi', email: 'raouf.souissi@tescagroup.com', role: 'Responsable UAP Tissage & Finition', deptCode: 'PROD' },
        { name: 'Khaled Dridi', email: 'khaled.dridi@tescagroup.com', role: 'Responsable UAP', deptCode: 'PROD' },
        { name: 'Mohamed-Amine Guerbouj', email: 'mohamed-amine.guerbouj@tescagroup.com', role: 'Responsable Labo', deptCode: 'QM' },
        { name: 'Amine El Abed', email: 'amine.elabed@tescagroup.com', role: 'HRBP', deptCode: 'RH' }
    ];

    try {
        // Enforce the 'TT' site exists
        const [sites] = await db.query('SELECT id FROM site WHERE name = ?', ['TT']);
        let siteId = sites.length > 0 ? sites[0].id : 'TT';
        if (sites.length === 0) {
            await db.query('INSERT IGNORE INTO site (id, name, location) VALUES (?, ?, ?)', ['TT', 'TT', 'Tunisie']);
        }

        const deptMap = {};
        for (const dept of departments) {
            const [existing] = await db.query('SELECT id FROM Department WHERE name = ? OR name = ?', [dept.name, dept.code]);
            if (existing.length > 0) {
                deptMap[dept.code] = existing[0].id;
            } else {
                const id = uuidv4();
                // Assign a head for new departments
                const head = users.find(u => u.deptCode === dept.code)?.name || 'Directeur';
                await db.query(
                    'INSERT INTO Department (id, name, head, location, budget, colorCallback, siteId) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id, dept.name, head, dept.code, 150000, 'bg-blue-500', siteId]
                );
                deptMap[dept.code] = id;
            }
        }

        // Insert Users
        for (const u of users) {
            const [existingUser] = await db.query('SELECT id FROM user WHERE email = ?', [u.email]);
            if (existingUser.length > 0) {
                console.log(`⏩ User ${u.email} already exists, updating...`);
                await db.query(
                    'UPDATE user SET name = ?, role = ?, departmentId = ? WHERE email = ?',
                    [u.name, u.role, deptMap[u.deptCode], u.email]
                );
            } else {
                const id = uuidv4();
                const avatarGradients = [
                    'from-blue-500 to-indigo-600',
                    'from-purple-500 to-pink-500',
                    'from-emerald-500 to-teal-600',
                    'from-orange-500 to-red-600'
                ];
                const gradient = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];
                
                await db.query(
                    `INSERT INTO user (id, name, email, password, status, avatarGradient, departmentId, role) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, u.name, u.email, 'password123', 'active', gradient, deptMap[u.deptCode], u.role]
                );
                console.log(`✅ Created user: ${u.name}`);
            }
        }

        console.log('✨ All TTG users have been seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding TTG users:', error);
        process.exit(1);
    }
}

seedTTGUsers();
