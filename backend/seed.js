const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // --- 1. Clean up existing data (Order matters for FKs) ---
        console.log('   🧹 Clearing existing data...');
        await db.query('DELETE FROM User');
        await db.query('DELETE FROM Department');
        await db.query('DELETE FROM Site');

        // --- 2. Insert Sites ---
        console.log('   🏭 Inserting Sites...');
        const sites = [
            { id: 'TT', name: 'TT', budget: 5000000.00, description: 'Main Manufacturing Site' },
            { id: 'TTG', name: 'TTG', budget: 3500000.00, description: 'Global Distribution Center' },
            { id: 'Paris', name: 'Paris HQ', budget: 8000000.00, description: 'Headquarters' }
        ];

        for (const site of sites) {
            await db.query(
                'INSERT INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)',
                [site.id, site.name, site.budget, site.description]
            );
        }

        // --- 3. Insert Departments ---
        console.log('   🏢 Inserting Departments...');
        const departments = [
            // TT Site
            { id: uuidv4(), name: 'RH', head: 'Sarah Connor', location: 'Building A', budget: 400000, siteId: 'TT', color: 'bg-pink-500' }, // ID 1
            { id: uuidv4(), name: 'Production', head: 'John Doe', location: 'Factory Floor', budget: 2000000, siteId: 'TT', color: 'bg-blue-500' }, // ID 2
            { id: uuidv4(), name: 'Maintenance', head: 'Mike Ross', location: 'Workshop', budget: 450000, siteId: 'TT', color: 'bg-red-500' },
            
            // TTG Site
            { id: uuidv4(), name: 'Finance', head: 'Bob Wilson', location: 'HQ Floor 5', budget: 300000, siteId: 'TTG', color: 'bg-orange-500' },
            { id: uuidv4(), name: 'Supply Chain', head: 'Eva Green', location: 'Warehouse A', budget: 800000, siteId: 'TTG', color: 'bg-purple-500' },
            { id: uuidv4(), name: 'Qualité', head: 'Harvey Specter', location: 'Lab 1', budget: 500000, siteId: 'TTG', color: 'bg-indigo-500' },

            // Paris Site
            { id: uuidv4(), name: 'Marketing', head: 'Emily Cooper', location: 'Tower 1', budget: 1200000, siteId: 'Paris', color: 'bg-fuchsia-500' },
            { id: uuidv4(), name: 'IT', head: 'Elliot Alderson', location: 'Server Room', budget: 950000, siteId: 'Paris', color: 'bg-cyan-500' }
        ];

        // Keep track of department IDs for users
        const deptMap = {}; // name -> id

        for (const dept of departments) {
            await db.query(
                `INSERT INTO Department (id, name, head, location, employeeCount, budget, status, colorCallback, siteId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [dept.id, dept.name, dept.head, dept.location, 0, dept.budget, 'Active', dept.color, dept.siteId]
            );
            deptMap[dept.name] = dept.id;
        }

        // --- 4. Insert Users ---
        console.log('   👥 Inserting Users...');
        const users = [
            // RH
            { name: 'Sarah Connor', email: 'sarah.connor@company.com', role: 'Responsable RH', dept: 'RH', status: 'Active' },
            { name: 'Jim Halpert', email: 'jim.halpert@company.com', role: 'Responsable Recrutement', dept: 'RH', status: 'In Meeting' },
            
            // Production
            { name: 'John Doe', email: 'john.doe@company.com', role: 'Direction', dept: 'Production', status: 'Active' },
            { name: 'Dwight Schrute', email: 'dwight.schrute@company.com', role: 'Demandeur', dept: 'Production', status: 'Active' },
            { name: 'Pam Beesly', email: 'pam.beesly@company.com', role: 'Demandeur', dept: 'Production', status: 'Offline' },

            // Finance
            { name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'Direction', dept: 'Finance', status: 'Active' },
            { name: 'Angela Martin', email: 'angela.martin@company.com', role: 'Demandeur', dept: 'Finance', status: 'Active' },

            // IT
            { name: 'Elliot Alderson', email: 'elliot.alderson@company.com', role: 'Direction', dept: 'IT', status: 'Offline' },
            { name: 'Darlene Alderson', email: 'darlene.alderson@company.com', role: 'Demandeur', dept: 'IT', status: 'Active' },
            { name: 'Tyrell Wellick', email: 'tyrell.wellick@company.com', role: 'Demandeur', dept: 'IT', status: 'In Meeting' },
             
            // Marketing
             { name: 'Emily Cooper', email: 'emily.cooper@company.com', role: 'Responsable Recrutement', dept: 'Marketing', status: 'Active' },
        ];

        for (const user of users) {
             const deptId = deptMap[user.dept];
             const avatarGradients = [
                 "from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-orange-500 to-red-500",
                 "from-emerald-500 to-green-500", "from-indigo-500 to-violet-500"
             ];
             const randomGradient = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

             await db.query(
                 `INSERT INTO User (id, name, email, password, role, status, avatarGradient, departmentId)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                 [
                     uuidv4(),
                     user.name,
                     user.email,
                     'password123', // Default password
                     user.role,
                     user.status,
                     randomGradient,
                     deptId
                 ]
             );
        }

        console.log('✅ Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
