const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr = `    const finalCharacterLock = characterNames ? \`
\\n\\n==================================================
**ABSOLUTE MANDATORY CHARACTER TAGGING RULE (FATAL ERROR IF IGNORED):**
We have specific project characters: [ \${characterNames} ].
1. Whenever any of these characters appear in a scene, you MUST NOT describe their physical appearance, clothing, age, or gender.
2. You MUST tag them strictly using this exact bracketed format: [Character: Name] (e.g., [Character: Detective Roy]).
3. Writing generic descriptions like "a weary detective" or "a young adventurer" instead of the tag [Character: Name] is a CRITICAL SYSTEM FAILURE.
==================================================\` : '';`;

const replaceStr = `    const finalCharacterLock = characterNames ? \`\\n\\n==================================================\\n**CRITICAL CHARACTER TAGGING RULE:**\\nThe script features these specific main characters: [ \${characterNames} ].\\n1. Whenever these characters are involved in a scene, you MUST use this exact bracket format in the image_prompt and video_prompt: [Character: Name].\\n2. Example: If the script mentions Roy, you MUST write [Character: Roy] in your prompt.\\n3. NEVER replace their names with pronouns (he/she) or generic nouns (the man, the detective, the girl). You MUST use the bracketed name every single time they appear.\\n==================================================\` : '';`;

code = code.split(searchStr).join(replaceStr);

fs.writeFileSync('ai-prompts.ts', code);
console.log("Fixes applied to ai-prompts.ts");
