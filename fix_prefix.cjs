const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');

const searchStr = `        let newImgPrompt = scene.image_prompt || '';
        if (newImgPrompt && !newImgPrompt.startsWith('[Style:')) {
            newImgPrompt = \`\${prefix} - \${newImgPrompt}\`;
        }`;

const replaceStr = `        let newImgPrompt = scene.image_prompt || '';
        
        // Clean up redundant AI-generated text like "Style: Default / General Themes: None"
        newImgPrompt = newImgPrompt.replace(/^(?:Style:|General Themes?:).*?(?:-|\/|\\|)\\s*/gi, '').trim();
        newImgPrompt = newImgPrompt.replace(/^(?:Style:|Themes:|Modifiers:|Camera:).*?(?:-|\/|\\|)\\s*/gi, '').trim();
        // Sometime it might just be "Style: ... / General Themes: ..." all together.
        newImgPrompt = newImgPrompt.replace(/^(?:Style:[^/]*\\/\\s*General Themes:[^/]*\\/\\s*.*?-)\\s*/i, '').trim();
        newImgPrompt = newImgPrompt.replace(/^(?:Style:[^/]*\\/?\\s*General Themes:[^/]*\\/?\\s*.*?[-:]?)\\s*/i, '').trim();
        
        // More robust generic cleaner for these AI hallucinated prefixes at the start
        newImgPrompt = newImgPrompt.replace(/^(?:Style|Theme|Modifier|Camera)[s]?:[\\s\\S]*?(?:-|\\/)\\s*(?=[A-Z\\[])/i, '').trim();

        // Also clean up any lingering "Style: Default / General Themes: None -" pattern
        newImgPrompt = newImgPrompt.replace(/^Style:.*?General Themes:.*?-\\s*/i, '').trim();

        if (newImgPrompt && !newImgPrompt.startsWith('[Style:')) {
            newImgPrompt = \`\${prefix} - \${newImgPrompt}\`;
        }`;

code = code.split(searchStr).join(replaceStr);
fs.writeFileSync('prompt-engine.ts', code);
console.log("Prefix fix applied");
