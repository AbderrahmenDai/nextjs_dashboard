const http = require('http');

http.get('http://localhost:8080/api/interviews', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', data);
    try {
        const json = JSON.parse(data);
        console.log('Is Array:', Array.isArray(json));
    } catch (e) {
        console.log('Not JSON');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
