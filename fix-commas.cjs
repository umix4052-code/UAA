const fs = require('fs');

let constantsContent = fs.readFileSync('constants.ts', 'utf-8');

// The script added things like:
// "Yoga"
//    "Narrative",
//    "3D Animation",
// We need to find items that are followed by newline and spaces and quotes without a comma

constantsContent = constantsContent.replace(/"\n\s+"/g, '",\n    "');

fs.writeFileSync('constants.ts', constantsContent);
console.log('Fixed commas');
