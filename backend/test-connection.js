const prisma = require('./config/db');

async function testConnection() {
  console.log('Testing database connection...');
  try {
    // Attempt to connect
    await prisma.$connect();
    console.log('✅ Successfully connected to the database server.');

    // Attempt a simple query
    try {
        const count = await prisma.site.count();
        console.log(`✅ Database query successful. Found ${count} existing sites.`);
    } catch (queryError) {
        console.error('❌ Connected, but failed to query the "Site" table.');
        console.error('   Have you run "npx prisma db push" to create the tables?');
        console.error('   Error detail:', queryError.message);
    }

  } catch (error) {
    console.error('❌ Connection failed.');
    console.error('   Check your .env file for correct credentials.');
    console.error('   Error detail:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
