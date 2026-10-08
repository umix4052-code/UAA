const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');
const newFunc = `export const injectCharacterDescriptions = (scenes: any[], characterProfiles: CharacterProfile[]) => {
    if (!characterProfiles || characterProfiles.length === 0) return scenes;
    
    // Check if there are profiles with actual descriptions
    const hasValidProfiles = characterProfiles.some(p => p.name?.trim() || p.userDescription?.trim() || p.aiDescription?.trim());
    if (!hasValidProfiles) return scenes;

    // FIX: Declare the Set OUTSIDE the loop so it remembers characters across ALL scenes!
    const seenCharacters = new Set<string>();

    return scenes.map((scene) => {
        const imgText = scene.image_prompt || '';
        const vidText = scene.video_prompt || '';
        
        const replaceNames = (text: string) => {
            if (!text) return text;
            
            // শুধুমাত্র ডাবল কার্লি ব্র্যাকেট ট্যাগ {{Character: Name}} বা {{Name}} রিপ্লেস হবে
            const bracketRegex = /\\{\\{(?:Character:\\s*)?([^}]+)\\}\\}/gi;

            return text.replace(bracketRegex, (match, charName) => {
                const cleanName = charName.trim();
                const cleanNameLower = cleanName.toLowerCase();
                const matchedProfile = characterProfiles.find(p => p.name?.trim().toLowerCase() === cleanNameLower);
                
                if (matchedProfile) {
                    if (seenCharacters.has(cleanNameLower)) {
                        return cleanName; // Already seen in a previous scene, just return name
                    }
                    seenCharacters.add(cleanNameLower); // Mark as seen for all future scenes

                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    desc = desc.replace(/--- AI Script Analysis ---\\s*/gi, '')
                               .replace(/Description:\\s*/gi, '')
                               .replace(/--- AI Video Analysis ---\\s*/gi, '').trim();
                    
                    // Remove starting name and "is a" / "is" to avoid "Name, Name is a..."
                    const nameRegex = new RegExp(\`^\${cleanName.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')}\\\\s*(?:is\\\\s+a|is\\\\s+an|is|are)?\\\\s*[,:]?\\\\s*\`, 'i');
                    desc = desc.replace(nameRegex, '').trim();
                    desc = desc.replace(/^[,:]\\s*/, '').trim();
                    
                    // ডেসক্রিপশন থাকলে শুধু "Name, Description" বসবে
                    return desc ? \`\${cleanName}, \${desc}\` : cleanName;
                }
                return cleanName;
            });
        };

        return { 
            ...scene, 
            image_prompt: replaceNames(imgText), 
            video_prompt: replaceNames(vidText) 
        };
    });
};`;
const parts = code.split('export interface VideoPromptConfig');
const beforeFunc = parts[0].substring(0, parts[0].indexOf('export const injectCharacterDescriptions'));
fs.writeFileSync('prompt-engine.ts', beforeFunc + newFunc + '\n\nexport interface VideoPromptConfig' + parts[1]);
