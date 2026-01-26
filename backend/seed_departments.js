const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const departments = [
    { name: 'RH', color: 'from-pink-500 to-rose-500' },
    { name: 'Production', color: 'from-blue-600 to-indigo-600' },
    { name: 'Méthode & Indus', color: 'from-orange-500 to-amber-500' },
    { name: 'Finance', color: 'from-green-500 to-emerald-500' },
    { name: 'Supply Chain', color: 'from-yellow-500 to-orange-500' }, // Corrected spelling
    { name: 'Maintenance', color: 'from-slate-500 to-gray-500' },
    { name: 'HSE', color: 'from-red-500 to-red-600' },
    { name: 'Qualité', color: 'from-teal-500 to-green-500' },
    { name: 'Achat', color: 'from-cyan-500 to-blue-500' }
];

async function seedDepartments() {
    try {
        console.log('Seeding departments...');
        
        // check existing to avoid duplicates
        const [existing] = await db.query('SELECT name FROM Department');
        const existingNames = existing.map(d => d.name);

        for (const dept of departments) {
            if (!existingNames.includes(dept.name)) {
                console.log(`Creating ${dept.name}...`);
                await db.query(`
                    INSERT INTO Department (id, name, head, location, employeeCount, budget, status, colorCallback, siteId)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    uuidv4(),
                    dept.name,
                    'TBD', // Head
                    'Main Site', // Location
                    0, // Employee count
                    0, // Budget
                    'Active',
                    dept.color,
                    'TT' // Site ID we found earlier
                ]);
            } else {
                console.log(`Department ${dept.name} already exists.`);
            }
        }
        console.log('Departments seeded successfully');
    } catch (err) {
        console.error('Error seeding departments:', err);
    }
    process.exit();
}

seedDepartments();
