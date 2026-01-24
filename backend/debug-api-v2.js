const http = require('http');

const req = http.get('http://localhost:8080/api/interviews', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    console.log('Raw Body Length:', data.length);
    console.log('Raw Body Preview:', data.substring(0, 500));
    try {
        const json = JSON.parse(data);
        console.log('Parsed Type:', typeof json);
        console.log('Is Array:', Array.isArray(json));
        if (!Array.isArray(json)) {
            console.log('Keys:', Object.keys(json));
        }
    } catch (e) {
        console.log('Not JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});
