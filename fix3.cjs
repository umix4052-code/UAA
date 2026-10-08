const fs = require('fs');
const code = fs.readFileSync('index.tsx', 'utf-8');
const lines = code.split('\n');

// Find the duplicate block and remove it.
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (parsedResults.length > 0) {ScenesAssigned += expectedScenes;')) {
        startIdx = i;
        break;
    }
}
if (startIdx !== -1) {
    for (let i = startIdx + 1; i < startIdx + 25; i++) {
        if (lines[i] && lines[i].includes('if (parsedResults.length > 0) {')) {
            endIdx = i;
            break;
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx);
    lines[startIdx] = '                            if (parsedResults.length > 0) {';
    fs.writeFileSync('index.tsx', lines.join('\n'));
    console.log('Fixed lines from', startIdx, 'to', endIdx);
} else {
    console.log('Could not find the duplicate block to remove.');
}
