const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');

const searchStrStart = `        // Aggressively clean up any AI hallucinated prefixes`;
const searchStrEnd = `        if (newImgPrompt && !newImgPrompt.startsWith('[Style:')) {`;

const startIndex = code.indexOf(searchStrStart);
const endIndex = code.indexOf(searchStrEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replaceStr = `        // Carefully clean up AI hallucinated style prefixes to prevent double tags
        const prefixMatch = newImgPrompt.match(/^(?:\\**Style:\\**|\\**Themes?:\\**|\\**General Themes?:\\**)[\\s\\S]{0,100}?(?:-)\\s*/i);
        if (prefixMatch) {
            newImgPrompt = newImgPrompt.substring(prefixMatch[0].length).trim();
        }
        // Sometimes it separates with slashes instead of a dash
        const slashMatch = newImgPrompt.match(/^(?:\\**Style:\\**.*?(?:\\/)\\s*)?(?:\\**General Themes?:\\**.*?(?:\\/|\\.|-)\\s*)/i);
        if (slashMatch && slashMatch[0].length < 150) {
            newImgPrompt = newImgPrompt.substring(slashMatch[0].length).trim();
        }
        
`;
    code = code.substring(0, startIndex) + replaceStr + code.substring(endIndex);
    fs.writeFileSync('prompt-engine.ts', code);
    console.log("Style fix safe applied!");
} else {
    console.log("Not found");
}
