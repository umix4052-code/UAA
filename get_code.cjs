const fs = require('fs');
const lines = fs.readFileSync('index.tsx', 'utf8').split('\n');

function extractFunc(name) {
    const startLine = lines.findIndex(l => l.includes(`const ${name} = `));
    if (startLine === -1) return "Not found";
    
    let braceCount = 0;
    let started = false;
    let endLine = startLine;
    
    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            if (line[j] === '{') { braceCount++; started = true; }
            else if (line[j] === '}') { braceCount--; }
        }
        if (started && braceCount === 0) {
            endLine = i;
            break;
        }
    }
    return lines.slice(startLine, endLine + 1).join('\n');
}

const p1 = extractFunc('handleGenerateVideoPrompts');
const p2 = extractFunc('handleVideoFileSelect');
// Write them to a file for easy reading or console log them
fs.writeFileSync('extracted_code.txt', `// === TARGET A: handleGenerateVideoPrompts ===\n${p1}\n\n// === TARGET B: handleVideoFileSelect (Visual Remake) ===\n${p2}\n`);
console.log("Extracted successfully.");
