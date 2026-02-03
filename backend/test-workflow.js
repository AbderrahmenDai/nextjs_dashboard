const db = require('./config/db');

async function testWorkflow() {
    try {
        console.log('🧪 Testing Hiring Request Workflow...\n');

        // 1. Check Roles
        console.log('📋 Step 1: Checking Roles...');
        const [roles] = await db.query(`
            SELECT id, name FROM Role 
            WHERE name IN ('DEMANDEUR', 'HR_MANAGER', 'PLANT_MANAGER', 'RECRUITMENT_MANAGER')
            ORDER BY name
        `);
        
        console.log('✅ Found roles:');
        roles.forEach(role => console.log(`   - ${role.name} (${role.id})`));
        
        if (roles.length < 4) {
            console.log('❌ Missing roles! Expected 4, found', roles.length);
            return;
        }

        // 2. Check Users
        console.log('\n📋 Step 2: Checking Users...');
        const [users] = await db.query(`
            SELECT User.id, User.name, User.email, Role.name as roleName
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE Role.name IN ('HR_MANAGER', 'PLANT_MANAGER', 'RECRUITMENT_MANAGER')
            ORDER BY Role.name
        `);
        
        console.log('✅ Found users:');
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.roleName}`);
        });

        if (users.length < 3) {
            console.log('❌ Missing users! Expected 3 (HR, Direction, Recruitment), found', users.length);
            return;
        }

        // 3. Check Hiring Requests
        console.log('\n📋 Step 3: Checking Hiring Requests...');
        const [requests] = await db.query(`
            SELECT 
                hr.id,
                hr.title,
                hr.status,
                u.name as requesterName,
                r.name as requesterRole
            FROM HiringRequest hr
            LEFT JOIN User u ON hr.requesterId = u.id
            LEFT JOIN Role r ON u.roleId = r.id
            ORDER BY hr.createdAt DESC
            LIMIT 5
        `);
        
        if (requests.length > 0) {
            console.log('✅ Recent hiring requests:');
            requests.forEach(req => {
                console.log(`   - "${req.title}" - Status: ${req.status} - By: ${req.requesterName || 'Unknown'} (${req.requesterRole || 'N/A'})`);
            });
        } else {
            console.log('⚠️  No hiring requests found in database');
        }

        // 4. Check Notifications
        console.log('\n📋 Step 4: Checking Notifications...');
        const [notifications] = await db.query(`
            SELECT 
                n.id,
                n.message,
                n.type,
                n.isRead,
                sender.name as senderName,
                receiver.name as receiverName
            FROM Notification n
            LEFT JOIN User sender ON n.senderId = sender.id
            LEFT JOIN User receiver ON n.receiverId = receiver.id
            WHERE n.entityType = 'HIRING_REQUEST'
            ORDER BY n.createdAt DESC
            LIMIT 5
        `);
        
        if (notifications.length > 0) {
            console.log('✅ Recent notifications:');
            notifications.forEach(notif => {
                const readStatus = notif.isRead ? '📖' : '📬';
                console.log(`   ${readStatus} ${notif.type}: "${notif.message.substring(0, 60)}..."`);
                console.log(`      From: ${notif.senderName || 'System'} → To: ${notif.receiverName || 'Unknown'}`);
            });
        } else {
            console.log('⚠️  No notifications found');
        }

        // 5. Workflow Status Summary
        console.log('\n📊 Workflow Status Summary:');
        const [statusCounts] = await db.query(`
            SELECT status, COUNT(*) as count
            FROM HiringRequest
            GROUP BY status
            ORDER BY count DESC
        `);
        
        if (statusCounts.length > 0) {
            statusCounts.forEach(stat => {
                const emoji = 
                    stat.status === 'Pending HR' ? '🔵' :
                    stat.status === 'Pending Director' ? '🟠' :
                    stat.status === 'Approved' ? '🟢' :
                    stat.status === 'Rejected' ? '🔴' : '⚪';
                console.log(`   ${emoji} ${stat.status}: ${stat.count} request(s)`);
            });
        }

        console.log('\n✅ Workflow test complete!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Login as a DEMANDEUR and create a hiring request');
        console.log('   2. Login as zoubaier.berrebeh@tescagroup.com (password: 123) to approve/reject');
        console.log('   3. If approved by HR, login as karim.mani@tescagroup.com (password: 123456)');
        console.log('   4. Check notifications for hiba.saadani@tescagroup.com after final approval');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error testing workflow:', error);
        process.exit(1);
    }
}

testWorkflow();
