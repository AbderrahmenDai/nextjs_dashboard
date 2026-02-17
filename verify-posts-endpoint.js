
async function test() {
    console.log("Testing GET http://localhost:8080/api/posts");
    const start = Date.now();
    try {
        const response = await fetch('http://localhost:8080/api/posts');
        const end = Date.now();
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Count: ${data.length}`);
        } else {
            console.log("Response text:", await response.text());
        }
        console.log(`Time: ${end - start}ms`);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
