const fs = require('fs');

let constantsContent = fs.readFileSync('constants.ts', 'utf-8');

// Find the section for cameraAngles and replace strings with objects
// It looks like:
// "Eye-level",
// "Cinematic Pan",
// ...

const start = constantsContent.indexOf('export const cameraAngles = [');
const end = constantsContent.indexOf('];', start);
let arrayContent = constantsContent.substring(start, end);

arrayContent = arrayContent.replace(/"([^"]+)"(,?)/g, (match, p1, p2) => {
    // If it's part of a value:"..." or description:"...", skip it
    // Wait, the regex is too broad, it would match "value" and "Arc Shot"
    return match;
});

fs.writeFileSync('constants.ts', constantsContent);
