const db = require('./models');
const postSiteService = require('./services/postSiteService');
const postService = require('./services/postService');
const userService = require('./services/userService');

async function test() {
    try {
        console.log('Starting Post Feature Test...');

        // 1. Create PostSite
        console.log('1. Creating PostSite (TT)...');
        await postSiteService.createSite({
            name: 'TT',
            budget: 100000
        });
        console.log('   PostSite created.');

        // 2. Create Department
        console.log('2. Creating Department (IT)...');
        const dept = await db.Department.create({
            name: 'IT',
            site: 'TT',
            head: 'IT Head'
        });
        console.log('   Department created:', dept.id);

        // 3. Create User
        console.log('3. Creating User in IT...');
        const user = await userService.createUser({
            name: 'IT User',
            email: `it.user.${Date.now()}@test.com`,
            password: 'password123',
            role: 'demander ',
            departmentId: dept.id
        });
        console.log('   User created:', user.id);

        // 4. Create Post
        console.log('4. Creating Post (Developer)...');
        const post = await postService.createPost({
            title: 'Developer',
            departmentId: dept.id,
            status: 'Active',
            jobDescription: 'Writes code'
        });
        console.log('   Post created:', post.id);

        // 5. Verify Post Fetch
        const fetchedPost = await postService.getPostById(post.id);
        console.log('   Fetched Post Dept:', fetchedPost.departmentName);
        if (fetchedPost.departmentName !== 'IT') throw new Error('Post department mismatch');

        // 6. Refresh Stats
        console.log('6. Refreshing Site Stats...');
        const sites = await postSiteService.refreshSiteStats('TT');
        const ttSite = sites.find(s => s.name === 'TT');
        
        console.log('   Stats:', {
            deptCount: ttSite.numberOfDepartments,
            empCount: ttSite.numberOfEmployees
        });

        if (ttSite.numberOfDepartments !== 1) throw new Error('Dept count mismatch');
        if (ttSite.numberOfEmployees !== 1) throw new Error('Emp count mismatch');

        console.log('SUCCESS: Post features verified.');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

test();
