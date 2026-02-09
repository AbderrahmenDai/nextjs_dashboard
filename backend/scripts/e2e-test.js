const http = require('http');

const data = JSON.stringify({
    requesterId: '097b8132-e1f0-4539-9525-8cef6a6d9d99', // A known requester ID
    title: 'E2E Test Request for Notification Check',
    departmentId: 'd1', // Dummy
    site: 'Tunis',
    // meaningful fields
    contractType: 'CDI',
    status: 'Pending Responsable RH', // This is default anyway
    priority: 'High'
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/hiring-requests',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Response:', responseData);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
