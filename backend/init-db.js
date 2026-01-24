const mysql = require('mysql2/promise'); // Use promise-based driver for init
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  console.log('========================================');
  console.log('🔄 Initializing Database');
  console.log('========================================');
  
  // 1. Log Config (mask password)
  console.log(`🔌 Configuration:`);
  console.log(`   - Host:     ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   - User:     ${process.env.DB_USER || 'root'}`);
  console.log(`   - Database: ${process.env.DB_NAME || 'recruitment_db'}`);
  console.log('----------------------------------------');

  let connection;
  try {
    // 2. Create Database if not exists
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
    });
    
    const dbName = process.env.DB_NAME || 'recruitment_db';
    console.log(`🔨 Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end(); // Close setup connection

    // 3. Connect to Database (using our standard db module)
    console.log('Reconnect to database...');
    // We can require the db module now, as the DB exists
    const db = require('./config/db'); 

    // 4. Test Connection
    await db.query('SELECT 1');
    console.log('✅ Connection to database successful!');

    // 3. Read Schema
    console.log('📖 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        throw new Error('schema.sql not found at ' + schemaPath);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // 4. Execute Statements
    // Split by semicolon, but be careful with triggers/procedures if any (none in simple schema)
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`⚙️  Executing ${statements.length} SQL statements...`);

    for (const [index, sql] of statements.entries()) {
        try {
            await db.query(sql);
            // console.log(`   ✔ Statement ${index + 1} executed.`);
        } catch (err) {
            console.error(`   ❌ Error submitting statement ${index + 1}:`);
            console.error(`   SQL: ${sql.substring(0, 100)}...`);
            throw err;
        }
    }

    console.log('✅ Schema applied successfully.');

    // 5. Verify Tables
    const [rows] = await db.query('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]);
    console.log('----------------------------------------');
    console.log(`📊 Tables in '${process.env.DB_NAME}':`);
    tables.forEach(t => console.log(`   - ${t}`));
    console.log('========================================');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:');
    console.error(error.message);
    
    // Diagnosis hints
    if (error.code === 'ENOTFOUND') {
        console.log('\n💡 HINT: The host address could not be resolved.');
        console.log('   If you are running locally, try changing DB_HOST to "localhost" in your .env file.');
        console.log('   Current value: ' + process.env.DB_HOST);
    }
    if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 HINT: Connection refused.');
        console.log('   - Is MySQL running?');
        console.log('   - Is it listening on port 3306?');
        console.log(`   - Is '${process.env.DB_HOST}' the correct host?`);
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('\n💡 HINT: Access/Authentication denied.');
        console.log('   Check DB_USER and DB_PASSWORD in your .env file.');
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
        console.log(`\n💡 HINT: Database '${process.env.DB_NAME}' does not exist.`);
        console.log('   Please create the database first using MySQL Workbench or CLI:');
        console.log(`   CREATE DATABASE ${process.env.DB_NAME};`);
    }

    process.exit(1);
  }
}

initDb();
