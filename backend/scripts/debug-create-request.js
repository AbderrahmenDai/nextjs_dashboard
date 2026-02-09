const db = require('../config/db');
const hiringRequestService = require('../services/hiringRequestService');
// Mock notification service
const notificationService = {
    createNotification: async () => ({ id: 'mock-notif-id' })
};
const socketService = {
    sendNotificationToUser: () => {}
};

async function debugCreate() {
    try {
        console.log("🔍 Debugging Creation Logic...");
        
        // 1. Get User
        const [users] = await db.query("SELECT * FROM User WHERE name LIKE '%Maher%' LIMIT 1");
        if (!users.length) throw new Error("Maher not found");
        const user = users[0];
        console.log(`👤 User: ${user.name}, RoleId: ${user.roleId}`);

        // 2. Mock Request Body
        const reqBody = {
            title: "Debug Request",
            departmentId: user.departmentId || "some-dept-id", 
            // If user has no dept, fetch one
            category: "Cadre",
            status: "Pending HR",
            site: "TT",
            requesterId: user.id
        };

        if (!reqBody.departmentId) {
            const [d] = await db.query("SELECT id FROM Department LIMIT 1");
            reqBody.departmentId = d[0].id;
        }
        
        console.log("📦 Body:", reqBody);

        // 3. Controller Logic Simulation
        
        // Verify Requester
        const [requester] = await db.query(`
            SELECT User.id, User.name, Role.name as roleName 
            FROM User 
            LEFT JOIN Role ON User.roleId = Role.id 
            WHERE User.id = ?
        `, [user.id]);
        
        const userRole = requester[0].roleName;
        console.log(`🛡️ User Role: ${userRole}`);
        
        // Determine Workflow
        let initialStatus = 'Pending HR';
        const { site } = reqBody;
        
        const isHrRole = ['Responsable RH', 'human resources', 'RESPONSABLE_RECRUTEMENT'].includes(userRole);
        console.log(`Checking isHrRole: ${isHrRole} (Role: ${userRole})`); // Should be False for Maher
        
        if (isHrRole) {
             console.log("-> HR Workflow");
        } else {
             console.log("-> Standard Workflow");
             if (site === 'TTG') {
                 console.log("   -> Site TTG");
             } else {
                 console.log("   -> Site TT/Other");
                 const [hrManagers] = await db.query(
                    `SELECT User.id, User.name FROM User 
                     JOIN Role ON User.roleId = Role.id 
                     WHERE Role.name = 'HR_MANAGER'` 
                 );
                 console.log(`   Found ${hrManagers.length} HR Managers:`, hrManagers.map(h => h.name));
                 // If 0 managers, it proceeds fine.
             }
        }
        
        const requestData = { ...reqBody, status: initialStatus };
        
        console.log("📝 Creating Check...");
        const newItem = await hiringRequestService.createHiringRequest(requestData);
        console.log("✅ Created Successfully:", newItem.id);

        process.exit(0);

    } catch (error) {
        console.error("❌ CRASHED:", error);
        process.exit(1);
    }
}

debugCreate();
