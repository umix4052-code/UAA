const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr = `their tag like \`[Character: Name]\`.`;
const replaceStr = `their tag like '[Character: Name]'.`;

if (code.includes(searchStr)) {
    code = code.split(searchStr).join(replaceStr);
    console.log("Fix applied.");
    fs.writeFileSync('ai-prompts.ts', code);
} else {
    console.log("Fix search string not found!");
}
