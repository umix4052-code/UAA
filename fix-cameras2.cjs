const fs = require('fs');

let constantsContent = fs.readFileSync('constants.ts', 'utf-8');

// The incorrect part is:
//     { value: "Zoom Out", description: "Lens focal length changes to get further." }
//     "Eye-level",
//     "Cinematic Pan",
// ...
//     "Gentle Tracking",
// ];

// Let's find everything from "Eye-level" to "Gentle Tracking",
// add a comma after "Zoom Out", and convert the strings to objects.

const lines = constantsContent.split('\n');
let inCameraAngles = false;
let newLines = [];
let fixed = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('export const cameraAngles = [')) {
        inCameraAngles = true;
    }
    if (inCameraAngles && line.includes('];')) {
        inCameraAngles = false;
    }

    if (inCameraAngles) {
        if (line.match(/^\s*"([^"]+)",?\s*$/)) {
            // This is a bare string
            // We need to make sure the previous line had a comma if it didn't
            if (newLines.length > 0 && !newLines[newLines.length-1].trim().endsWith(',')) {
                newLines[newLines.length-1] = newLines[newLines.length-1] + ',';
            }
            const match = line.match(/^\s*"([^"]+)",?\s*$/);
            const val = match[1];
            line = `    { value: "${val}", description: "Niche specific angle" },`;
            fixed = true;
        }
    }
    newLines.push(line);
}

fs.writeFileSync('constants.ts', newLines.join('\n'));
console.log('Fixed cameras');
