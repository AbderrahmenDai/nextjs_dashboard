require('dotenv').config();
const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seedTestData() {
    try {
        console.log('🌱 Seeding Test Data (Departments, Users, Hiring Requests)...');

        // 1. Check/Create Sites first
        const [existingSites] = await db.query('SELECT id FROM Site');
        let siteId;

        if (existingSites.length === 0) {
            // Create a default site
            siteId = 'site-main-' + uuidv4().substring(0, 8);
            await db.query(`
                INSERT INTO Site (id, name, budget, description)
                VALUES (?, ?, ?, ?)
            `, [siteId, 'Main Office', 1000000, 'Primary company location']);
            console.log('✅ Created site:', siteId);
        } else {
            siteId = existingSites[0].id;
            console.log('✅ Using existing site:', siteId);
        }

        // 2. Create Departments (read site ID from DB)
        const departments = [
            {
                name: 'Human Resources',
                head: 'Sarah Johnson',
                location: 'Building A, Floor 2',
                employeeCount: 15,
                budget: 200000,
                status: 'Active',
                colorCallback: 'from-pink-500 to-rose-500'
            },
            {
                name: 'Information Technology',
                head: 'Michael Chen',
                location: 'Building B, Floor 3',
                employeeCount: 25,
                budget: 500000,
                status: 'Active',
                colorCallback: 'from-blue-500 to-cyan-500'
            },
            {
                name: 'Marketing',
                head: 'Emily Rodriguez',
                location: 'Building A, Floor 1',
                employeeCount: 12,
                budget: 300000,
                status: 'Active',
                colorCallback: 'from-purple-500 to-pink-500'
            },
            {
                name: 'Finance',
                head: 'David Kim',
                location: 'Building C, Floor 2',
                employeeCount: 18,
                budget: 250000,
                status: 'Active',
                colorCallback: 'from-green-500 to-emerald-500'
            },
            {
                name: 'Operations',
                head: 'Lisa Anderson',
                location: 'Building B, Floor 1',
                employeeCount: 20,
                budget: 400000,
                status: 'Active',
                colorCallback: 'from-orange-500 to-red-500'
            }
        ];

        const departmentIds = [];
        for (const dept of departments) {
            // Check if department already exists
            const [existing] = await db.query('SELECT id FROM Department WHERE name = ?', [dept.name]);
            
            if (existing.length > 0) {
                departmentIds.push(existing[0].id);
                console.log(`ℹ️  Department "${dept.name}" already exists`);
            } else {
                const deptId = uuidv4();
                await db.query(`
                    INSERT INTO Department (id, name, head, location, employeeCount, budget, status, colorCallback, siteId)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    deptId,
                    dept.name,
                    dept.head,
                    dept.location,
                    dept.employeeCount,
                    dept.budget,
                    dept.status,
                    dept.colorCallback,
                    siteId
                ]);
                departmentIds.push(deptId);
                console.log(`✅ Created department: ${dept.name}`);
            }
        }

        // Get actual department IDs from database
        const [allDepts] = await db.query('SELECT id, name FROM Department');
        const deptMap = {};
        allDepts.forEach(d => {
            deptMap[d.name] = d.id;
        });

        // 3. Create Users with different roles (read department IDs from DB)
        const defaultPassword = 'Password123!'; // Default password for all test users
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const users = [
            // HR Department Users
            {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                password: hashedPassword,
                role: 'HR_MANAGER',
                status: 'Active',
                avatarGradient: 'from-pink-500 to-rose-500',
                department: 'Human Resources'
            },
            {
                name: 'James Wilson',
                email: 'james.wilson@company.com',
                password: hashedPassword,
                role: 'HR_ASSISTANT',
                status: 'Active',
                avatarGradient: 'from-pink-400 to-rose-400',
                department: 'Human Resources'
            },
            {
                name: 'Emma Davis',
                email: 'emma.davis@company.com',
                password: hashedPassword,
                role: 'RECRUITER',
                status: 'Active',
                avatarGradient: 'from-pink-300 to-rose-300',
                department: 'Human Resources'
            },
            // IT Department Users
            {
                name: 'Michael Chen',
                email: 'michael.chen@company.com',
                password: hashedPassword,
                role: 'TECH_LEAD',
                status: 'Active',
                avatarGradient: 'from-blue-500 to-cyan-500',
                department: 'Information Technology'
            },
            {
                name: 'Alex Thompson',
                email: 'alex.thompson@company.com',
                password: hashedPassword,
                role: 'DEVELOPER',
                status: 'Active',
                avatarGradient: 'from-blue-400 to-cyan-400',
                department: 'Information Technology'
            },
            {
                name: 'Sophie Martinez',
                email: 'sophie.martinez@company.com',
                password: hashedPassword,
                role: 'DEVELOPER',
                status: 'Active',
                avatarGradient: 'from-blue-300 to-cyan-300',
                department: 'Information Technology'
            },
            // Marketing Department Users
            {
                name: 'Emily Rodriguez',
                email: 'emily.rodriguez@company.com',
                password: hashedPassword,
                role: 'MARKETING_MANAGER',
                status: 'Active',
                avatarGradient: 'from-purple-500 to-pink-500',
                department: 'Marketing'
            },
            {
                name: 'Ryan Brown',
                email: 'ryan.brown@company.com',
                password: hashedPassword,
                role: 'MARKETING_SPECIALIST',
                status: 'Active',
                avatarGradient: 'from-purple-400 to-pink-400',
                department: 'Marketing'
            },
            // Finance Department Users
            {
                name: 'David Kim',
                email: 'david.kim@company.com',
                password: hashedPassword,
                role: 'FINANCE_MANAGER',
                status: 'Active',
                avatarGradient: 'from-green-500 to-emerald-500',
                department: 'Finance'
            },
            {
                name: 'Olivia White',
                email: 'olivia.white@company.com',
                password: hashedPassword,
                role: 'ACCOUNTANT',
                status: 'Active',
                avatarGradient: 'from-green-400 to-emerald-400',
                department: 'Finance'
            },
            // Operations Department Users
            {
                name: 'Lisa Anderson',
                email: 'lisa.anderson@company.com',
                password: hashedPassword,
                role: 'OPERATIONS_MANAGER',
                status: 'Active',
                avatarGradient: 'from-orange-500 to-red-500',
                department: 'Operations'
            },
            {
                name: 'Robert Taylor',
                email: 'robert.taylor@company.com',
                password: hashedPassword,
                role: 'DIRECTOR',
                status: 'Active',
                avatarGradient: 'from-orange-400 to-red-400',
                department: 'Operations'
            },
            // Admin User
            {
                name: 'Admin User',
                email: 'admin@company.com',
                password: hashedPassword,
                role: 'ADMIN',
                status: 'Active',
                avatarGradient: 'from-gray-500 to-slate-500',
                department: null
            }
        ];

        const userIds = [];
        for (const user of users) {
            // Check if user already exists
            const [existing] = await db.query('SELECT id FROM User WHERE email = ?', [user.email]);
            
            if (existing.length > 0) {
                userIds.push(existing[0].id);
                console.log(`ℹ️  User "${user.email}" already exists`);
            } else {
                const userId = uuidv4();
                const departmentId = user.department ? deptMap[user.department] : null;
                
                await db.query(`
                    INSERT INTO User (id, name, email, password, role, status, avatarGradient, departmentId)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    userId,
                    user.name,
                    user.email,
                    user.password,
                    user.role,
                    user.status,
                    user.avatarGradient,
                    departmentId
                ]);
                userIds.push(userId);
                console.log(`✅ Created user: ${user.name} (${user.role})`);
            }
        }

        // Get actual user IDs from database
        const [allUsers] = await db.query('SELECT id, name, email, role FROM User');
        const userMap = {};
        allUsers.forEach(u => {
            userMap[u.email] = u.id;
        });

        // 4. Create Hiring Requests (read department and user IDs from DB)
        const hiringRequests = [
            {
                title: 'Senior Full Stack Developer',
                department: 'Information Technology',
                requesterEmail: 'michael.chen@company.com',
                status: 'Pending HR',
                priority: 'High',
                budget: 75000,
                currency: 'TND',
                contractType: 'CDI',
                category: 'Cadre',
                reason: 'Need experienced developer to lead new e-commerce platform project',
                description: 'We are looking for a senior full stack developer with 5+ years of experience in React, Node.js, and PostgreSQL. The candidate should have experience with microservices architecture and cloud deployment.'
            },
            {
                title: 'Frontend Developer',
                department: 'Information Technology',
                requesterEmail: 'michael.chen@company.com',
                status: 'Approved',
                priority: 'Medium',
                budget: 50000,
                currency: 'TND',
                contractType: 'CDI',
                category: 'Cadre',
                reason: 'Expand frontend team for mobile app development',
                description: 'Looking for a frontend developer with strong React Native and TypeScript skills. Experience with state management libraries and API integration required.'
            },
            {
                title: 'HR Recruiter',
                department: 'Human Resources',
                requesterEmail: 'sarah.johnson@company.com',
                status: 'Pending Director',
                priority: 'High',
                budget: 35000,
                currency: 'TND',
                contractType: 'CDI',
                category: 'Etam',
                reason: 'Increase recruitment capacity for Q2 hiring goals',
                description: 'We need an experienced recruiter to handle technical and non-technical positions. Must have experience with ATS systems and interview coordination.'
            },
            {
                title: 'Marketing Specialist',
                department: 'Marketing',
                requesterEmail: 'emily.rodriguez@company.com',
                status: 'Pending HR',
                priority: 'Medium',
                budget: 40000,
                currency: 'TND',
                contractType: 'CDD',
                category: 'Etam',
                reason: 'Support for upcoming product launch campaign',
                description: 'Looking for a marketing specialist with experience in digital marketing, social media management, and content creation. Experience with analytics tools is a plus.'
            },
            {
                title: 'Financial Analyst',
                department: 'Finance',
                requesterEmail: 'david.kim@company.com',
                status: 'Approved',
                priority: 'Medium',
                budget: 45000,
                currency: 'TND',
                contractType: 'CDI',
                category: 'Cadre',
                reason: 'Support financial planning and analysis team',
                description: 'We need a financial analyst with strong Excel skills, financial modeling experience, and knowledge of accounting principles. CPA certification preferred.'
            },
            {
                title: 'Operations Coordinator',
                department: 'Operations',
                requesterEmail: 'lisa.anderson@company.com',
                status: 'Pending HR',
                priority: 'Low',
                budget: 30000,
                currency: 'TND',
                contractType: 'CDI',
                category: 'Etam',
                reason: 'Improve operational efficiency and process management',
                description: 'Looking for an operations coordinator to manage daily operations, coordinate between departments, and implement process improvements. Strong organizational skills required.'
            },
            {
                title: 'DevOps Engineer',
                department: 'Information Technology',
                requesterEmail: 'michael.chen@company.com',
                status: 'Pending Director',
                priority: 'High',
                budget: 65000,
                currency: 'TND',
                contractType: 'CDI',
                category: 'Cadre',
                reason: 'Improve CI/CD pipeline and infrastructure automation',
                description: 'We need a DevOps engineer with experience in Docker, Kubernetes, AWS/Azure, and CI/CD tools like Jenkins or GitLab CI. Knowledge of infrastructure as code is essential.'
            },
            {
                title: 'Content Writer',
                department: 'Marketing',
                requesterEmail: 'emily.rodriguez@company.com',
                status: 'Approved',
                priority: 'Low',
                budget: 28000,
                currency: 'TND',
                contractType: 'CDD',
                category: 'Stagiaire',
                reason: 'Create content for blog and social media',
                description: 'Looking for a creative content writer with excellent writing skills and SEO knowledge. Experience with content management systems and social media platforms required.'
            }
        ];

        console.log('\n📝 Creating Hiring Requests...');
        for (const req of hiringRequests) {
            const departmentId = deptMap[req.department];
            const requesterId = userMap[req.requesterEmail];

            if (!departmentId) {
                console.log(`⚠️  Skipping request "${req.title}" - Department "${req.department}" not found`);
                continue;
            }

            if (!requesterId) {
                console.log(`⚠️  Skipping request "${req.title}" - Requester "${req.requesterEmail}" not found`);
                continue;
            }

            // Check if request already exists (by title and department)
            const [existing] = await db.query(
                'SELECT id FROM HiringRequest WHERE title = ? AND departmentId = ?',
                [req.title, departmentId]
            );

            if (existing.length > 0) {
                console.log(`ℹ️  Hiring request "${req.title}" already exists`);
                continue;
            }

            const requestId = uuidv4();
            await db.query(`
                INSERT INTO HiringRequest (
                    id, title, departmentId, requesterId, status, priority,
                    budget, currency, contractType, category, reason, description,
                    createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                requestId,
                req.title,
                departmentId,
                requesterId,
                req.status,
                req.priority,
                req.budget,
                req.currency,
                req.contractType,
                req.category,
                req.reason,
                req.description
            ]);

            console.log(`✅ Created hiring request: ${req.title} (${req.status})`);
        }

        console.log('\n✅ Test data seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Departments: ${allDepts.length}`);
        console.log(`   - Users: ${allUsers.length}`);
        const [requestCount] = await db.query('SELECT COUNT(*) as count FROM HiringRequest');
        console.log(`   - Hiring Requests: ${requestCount[0].count}`);
        console.log('\n🔑 Default password for all test users: Password123!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

seedTestData();
