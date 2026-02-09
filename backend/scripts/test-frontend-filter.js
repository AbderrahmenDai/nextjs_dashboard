const db = require('../config/db');

async function testFrontendLogic() {
    try {
        // 1. Get a TTG Department
        const [depts] = await db.query('SELECT * FROM Department WHERE siteId = "TTG" LIMIT 1');
        if (depts.length === 0) {
            console.log('No TTG departments found.');
            process.exit(0);
        }
        const dept = depts[0];
        console.log(`Checking roles for Dept: ${dept.name} (${dept.id})`);

        // 2. Fetch all roles (simulating API)
        const [roles] = await db.query('SELECT * FROM Role');
        
        // 3. Filter (simulating frontend)
        const filteredRoles = roles.filter(r => r.departmentId === dept.id);
        
        console.log(`Found ${filteredRoles.length} roles:`);
        filteredRoles.forEach(r => console.log(` - ${r.name}`));
        
        if (filteredRoles.length === 0) {
            console.log("❌ Frontend will show empty dropdown!");
        } else {
            console.log("✅ Frontend will show these roles.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFrontendLogic();
