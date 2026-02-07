const xlsx = require('xlsx');
const path = require('path');

// Go up one level from backend to find the file
const filePath = path.join(__dirname, '../Liste des postes.xlsx');
console.log('Reading file:', filePath);

try {
    const workbook = xlsx.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        // Read as JSON to see headers and data structure
        const data = xlsx.utils.sheet_to_json(sheet, { defval: "" }); 
        
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
            console.log('First 3 rows:');
            data.slice(0, 3).forEach((row, index) => {
                console.log(`Row ${index}:`, row);
            });
        } else {
            console.log('Sheet is empty or only headers.');
        }
    });
} catch (error) {
    console.error('Error reading file:', error);
}
