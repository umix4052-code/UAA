const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr = `    const userData = \`**PHASE 4: TARGET SCRIPT**\\n\${scriptInstruction}\`;`;

const replaceStr = `    const characterNames = characterProfiles.map(p => p.name?.trim()).filter(Boolean).join(', ');
    const finalCharacterLock = characterNames ? \`
\\n\\n==================================================
**ABSOLUTE MANDATORY CHARACTER TAGGING RULE (FATAL ERROR IF IGNORED):**
We have specific project characters: [ \${characterNames} ].
1. Whenever any of these characters appear in a scene, you MUST NOT describe their physical appearance, clothing, age, or gender.
2. You MUST tag them strictly using this exact bracketed format: [Character: Name] (e.g., [Character: Detective Roy]).
3. Writing generic descriptions like "a weary detective" or "a young adventurer" instead of the tag [Character: Name] is a CRITICAL SYSTEM FAILURE.
==================================================\` : '';

    systemData += finalCharacterLock;

    const userData = \`**PHASE 4: TARGET SCRIPT**\\n\${scriptInstruction}\`;`;

if (code.includes(searchStr)) {
    code = code.split(searchStr).join(replaceStr);
    console.log("Override fix applied.");
    fs.writeFileSync('ai-prompts.ts', code);
} else {
    console.log("Override fix search string not found!");
}
