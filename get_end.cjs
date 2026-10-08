const fs = require('fs');
const lines = fs.readFileSync('index.tsx', 'utf8').split('\n');
const start = 780; // zero-based
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
console.log('START: ' + (start + 1));
console.log('END: ' + (end + 1));
