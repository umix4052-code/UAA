const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');

const searchStrStart = `        // Clean up redundant AI-generated text like "Style: Default / General Themes: None"`;
const searchStrEnd = `        if (newImgPrompt && !newImgPrompt.startsWith('[Style:')) {`;

const startIndex = code.indexOf(searchStrStart);
const endIndex = code.indexOf(searchStrEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replaceStr = `        // Aggressively clean up any AI hallucinated prefixes like "Style: ... / General Themes: ... -"
        const prefixCleanupRegex = /^(?:\\**Style:\\**.*?(?:\\/|-)\\s*)*?(?:\\**General Themes?:\\**.*?(?:\\/|-)\\s*)*/i;
        newImgPrompt = newImgPrompt.replace(prefixCleanupRegex, '').trim();
        newImgPrompt = newImgPrompt.replace(/^(?:Style|Theme|Modifier|Camera)[s]?:.*?(?:-)\\s*/i, '').trim();
        newImgPrompt = newImgPrompt.replace(/^Style:[\\s\\S]*?General Themes:[\\s\\S]*?-\\s*/i, '').trim();
        
        `;
    code = code.substring(0, startIndex) + replaceStr + code.substring(endIndex);
    fs.writeFileSync('prompt-engine.ts', code);
    console.log("Style fix applied!");
} else {
    console.log("Not found");
}
