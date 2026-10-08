const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr = `**CRITICAL CHARACTER RULE (GLOBAL):** Whenever you describe a character in the 'master_prompt' or create a character profile, you MUST explicitly state their gender (Male or Female) and approximate age. NEVER use ambiguous terms like 'a person', 'a traveler', or 'a child' without specifying 'a male traveler', 'a young female child', etc. For historical or religious figures (e.g., in Islamic History), they must explicitly be described as MALE unless historically specified otherwise.`;

const replaceStr = `**CRITICAL CHARACTER RULE (GLOBAL - READ CAREFULLY):**
1. FOR NAMED/PROJECT CHARACTERS: If a character is explicitly listed in the project (e.g., Detective Roy), you MUST STRICTLY use ONLY their tag like \`[Character: Name]\`. DO NOT describe their age, gender, clothing, or facial features in the prompt. Our local system will auto-inject their profile later.
2. FOR UNNAMED/BACKGROUND CHARACTERS: Whenever you describe a generic or unnamed character (e.g., a waiter, a crowd member, a random passerby), you MUST explicitly state their gender (Male or Female) and approximate age. NEVER use ambiguous terms like 'a person' or 'someone'.`;

if (code.includes(searchStr)) {
    code = code.split(searchStr).join(replaceStr);
    console.log("Fix applied.");
    fs.writeFileSync('ai-prompts.ts', code);
} else {
    console.log("Fix search string not found!");
}
