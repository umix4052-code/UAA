const fs = require('fs');
const lines = fs.readFileSync('index.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('const executeGenerativeAiTask ='));
if(start === -1) { console.log('Not found'); process.exit(1); }
let braces = 0;
let started = false;
let end = start;
for(let i=start; i<lines.length; i++) {
    for(let j=0; j<lines[i].length; j++) {
        if(lines[i][j] === '{') { braces++; started=true; }
        else if(lines[i][j] === '}') { braces--; }
    }
    if(started && braces === 0) { end = i; break; }
}
console.log(lines.slice(start, end+1).join('\n'));
