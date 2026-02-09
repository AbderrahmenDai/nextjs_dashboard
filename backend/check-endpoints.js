const http = require('http');

const endpoints = [
  '/api/departments',
  '/api/roles',
  '/api/hiring-requests?page=1&limit=10'
];

function checkEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${path} - Status: ${res.statusCode}`);
          resolve(true);
        } else {
          console.log(`❌ ${path} - Status: ${res.statusCode}`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ ${path} - Error: ${e.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function runChecks() {
  console.log("Checking API endpoints...");
  for (const endpoint of endpoints) {
    await checkEndpoint(endpoint);
  }
}

runChecks();
