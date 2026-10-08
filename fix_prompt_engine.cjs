const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');

// Fix 1: Add finalCharacterLock in getModelSpecificPromptGenerator and update prompt instructions
const searchStr1 = `            // Enhance prompts with Niche & Negative constraints`;
const replaceStr1 = `            const characterNames = characterProfiles.map(p => p.name?.trim()).filter(Boolean).join(', ');
            const finalCharacterLock = characterNames ? \`
==================================================
**CRITICAL CHARACTER TAGGING RULE:**
The script features these specific main characters: [ \${characterNames} ].
1. Whenever these characters are involved in a scene, you MUST use this exact bracket format in the video prompt: [Character: Name].
2. Example: If the script mentions Roy, you MUST write [Character: Roy] in your prompt.
3. NEVER replace their names with pronouns (he/she) or generic nouns (the man, the detective, the girl). You MUST use the bracketed name every single time they appear.
==================================================\` : '';

            // Enhance prompts with Niche & Negative constraints`;

code = code.split(searchStr1).join(replaceStr1);

const searchStr2 = `4.  **Character Presence (SEE FIRST, MATCH LATER):** DO NOT force every character provided in the 'Key Characters' list into the scene. First, read the 'Scene' section. If a character belongs in this specific scene or is clearly visible, ONLY THEN should you use their visual details. If they are not in the scene, COMPLETELY IGNORE THEM.
5.  **Character Naming (NO RAW IDs):** When describing a character, DO NOT use their raw ID (like 'char_1' or 'char_angel') in your final output paragraph. Instead, seamlessly integrate their visual appearance (e.g., "A grieving old king with a flowing white beard").
6.  **Motion Integration:** Seamlessly blend the camera movements and pacing into the scene's description (e.g., "A slow, tense push-in reveals...", "A fast-paced dynamic movement captures...").`;

const replaceStr2 = `4.  **Character Presence (SEE FIRST, MATCH LATER):** DO NOT force every character provided in the 'Key Characters' list into the scene. First, read the 'Scene' section. If a character belongs in this specific scene or is clearly visible, ONLY THEN should you use their visual details. If they are not in the scene, COMPLETELY IGNORE THEM.
5.  **Character Tagging (MANDATORY):** See the CRITICAL CHARACTER TAGGING RULE below. You MUST tag characters using the bracketed format [Character: Name]. Do NOT use pronouns or generic nouns for these characters.
6.  **Motion Integration:** Seamlessly blend the camera movements and pacing into the scene's description (e.g., "A slow, tense push-in reveals...", "A fast-paced dynamic movement captures...").`;

code = code.split(searchStr2).join(replaceStr2);

const searchStr3 = `\${negativeInstruction}

**EXAMPLE OF A PERFECT OUTPUT PARAGRAPH:**`;

const replaceStr3 = `\${negativeInstruction}
\${finalCharacterLock}

**EXAMPLE OF A PERFECT OUTPUT PARAGRAPH:**`;

code = code.split(searchStr3).join(replaceStr3);

// Fix 3: Strict Bracket Matching & Guard against double injection in injectCharacterDescriptions
const searchInjectStr = `        const replaceNames = (text: string) => {
            if (!text) return text;
            let result = text;
            
            // 1. Process [Character: Name] tags first
            const bracketRegex = /\\[Character:\\s*([^\\]]+)\\]/gi;
            result = result.replace(bracketRegex, (match, charName) => {
                const searchName = charName.trim().toLowerCase();
                
                // Try to find the matching profile
                const matchedProfile = characterProfiles.find(p => {
                    if (p.name && p.name.trim().toLowerCase() === searchName) return true;
                    const combined = ((p.userDescription || "") + " " + (p.aiDescription || "")).toLowerCase();
                    const nameMatch = combined.match(/name:?\\s*([a-zA-Z]+)/i) || combined.match(/^([a-zA-Z]+)/);
                    const parsedName = nameMatch ? nameMatch[1].toLowerCase() : p.id.toLowerCase();
                    return parsedName === searchName || combined.includes(searchName);
                });

                if (matchedProfile) {
                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    // Clean up raw AI headers before injecting
                    desc = desc.replace(/--- AI Script Analysis ---\\s*/gi, '').replace(/Description:\\s*/gi, '').replace(/--- AI Video Analysis ---\\s*/gi, '').trim();
                    return charName + ", " + desc;
                }
                return charName; // Fallback, just remove the brackets
            });
            
            // 2. Direct name matching using whole word
            const validProfiles = characterProfiles.filter(p => p.name && p.name.trim().length > 0);
            validProfiles.forEach(profile => {
                const name = profile.name!.trim();
                const desc = (profile.userDescription?.trim() || "") + " " + (profile.aiDescription?.trim() || "").trim();
                
                if (desc) {
                    // Whole word match, ignoring if it's already followed by '(' to avoid double injection
                    const nameRegex = new RegExp(\`\\\\b(\${name})\\\\b(?!\\\\s*\\\\()\`, 'gi');
                    result = result.replace(nameRegex, \`$1 (\${desc.trim()})\`);
                }
            });

            return result;
        };`;

const replaceInjectStr = `        const replaceNames = (text: string) => {
            if (!text) return text;
            let result = text;
            
            // 1. Process [Character: Name] tags first (Strict Bracket Matching)
            const bracketRegex = /\\[Character:\\s*([^\\]]+)\\]/gi;
            result = result.replace(bracketRegex, (match, charName) => {
                const searchName = charName.trim().toLowerCase();
                
                // Try to find the matching profile
                const matchedProfile = characterProfiles.find(p => {
                    if (p.name && p.name.trim().toLowerCase() === searchName) return true;
                    const combined = ((p.userDescription || "") + " " + (p.aiDescription || "")).toLowerCase();
                    const nameMatch = combined.match(/name:?\\s*([a-zA-Z]+)/i) || combined.match(/^([a-zA-Z]+)/);
                    const parsedName = nameMatch ? nameMatch[1].toLowerCase() : p.id.toLowerCase();
                    return parsedName === searchName || combined.includes(searchName);
                });

                if (matchedProfile) {
                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    // Clean up raw AI headers before injecting
                    desc = desc.replace(/--- AI Script Analysis ---\\s*/gi, '').replace(/Description:\\s*/gi, '').replace(/--- AI Video Analysis ---\\s*/gi, '').trim();
                    // Guard against double injection - if description is already in the text, just return the name
                    if (result.includes(desc)) {
                        return charName;
                    }
                    return charName + ", " + desc;
                }
                return charName; // Fallback, just remove the brackets
            });
            
            // 2. Direct name matching using whole word (with Already Injected Guard)
            const validProfiles = characterProfiles.filter(p => p.name && p.name.trim().length > 0);
            validProfiles.forEach(profile => {
                const name = profile.name!.trim();
                const desc = (profile.userDescription?.trim() || "") + " " + (profile.aiDescription?.trim() || "").trim();
                
                if (desc) {
                    // If description is already in the result, skip direct injection to prevent infinite loops
                    if (result.includes(desc)) return;
                    
                    // Whole word match, ignoring if it's already followed by '(' or ',' to avoid double injection
                    const nameRegex = new RegExp(\`\\\\b(\${name})\\\\b(?!\\\\s*[\\\\(,\\\\:])\`, 'gi');
                    result = result.replace(nameRegex, \`$1 (\${desc.trim()})\`);
                }
            });

            return result;
        };`;

code = code.split(searchInjectStr).join(replaceInjectStr);

fs.writeFileSync('prompt-engine.ts', code);
console.log("Fixes applied to prompt-engine.ts");
