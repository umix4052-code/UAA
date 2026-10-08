const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr1 = "    *   Crucially, if you are breaking down a chunk of a larger story, ensure the visual continuity matches the overall narrative arc.\\n";
const replaceStr1 = "";

const searchStr2 = "\\n(Note: Make sure the current scenes transition smoothly towards this next event).";
const replaceStr2 = "";

let modified = false;

if (code.includes(searchStr1)) {
    code = code.replace(searchStr1, replaceStr1);
    console.log("Fix 1 applied.");
    modified = true;
} else {
    console.log("Fix 1 search string not found!");
}

if (code.includes(searchStr2)) {
    code = code.replace(searchStr2, replaceStr2);
    console.log("Fix 2 applied.");
    modified = true;
} else {
    console.log("Fix 2 search string not found!");
}

if (modified) {
    fs.writeFileSync('ai-prompts.ts', code);
    console.log("Updated ai-prompts.ts successfully.");
}
