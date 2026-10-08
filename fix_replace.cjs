const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');

const searchStrStart = `        const replaceNames = (text: string) => {`;
const searchStrEnd = `            return result;
        };`;

const startIndex = code.indexOf(searchStrStart);
const endIndex = code.indexOf(searchStrEnd, startIndex) + searchStrEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
    const replaceStr = `        const replaceNames = (text: string) => {
            if (!text) return text;
            
            // শুধুমাত্র ব্র্যাকেট ট্যাগ [Character: Name] বা [Name] রিপ্লেস হবে
            const bracketRegex = /\\[(?:Character:\\s*)?([^\\]]+)\\]/gi;
            return text.replace(bracketRegex, (match, charName) => {
                const cleanName = charName.trim();
                const matchedProfile = characterProfiles.find(p => p.name?.trim().toLowerCase() === cleanName.toLowerCase());
                
                if (matchedProfile) {
                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    desc = desc.replace(/--- AI Script Analysis ---\\s*/gi, '').replace(/Description:\\s*/gi, '').replace(/--- AI Video Analysis ---\\s*/gi, '').trim();
                    
                    // ডেসক্রিপশন থাকলে শুধু "Name, Description" বসবে (কোনো ব্র্যাকেট বা লুপ থাকবে না)
                    return desc ? \`\${cleanName}, \${desc}\` : cleanName;
                }
                return cleanName;
            });
        };`;
    
    code = code.substring(0, startIndex) + replaceStr + code.substring(endIndex);
    fs.writeFileSync('prompt-engine.ts', code);
    console.log("Fix applied successfully!");
} else {
    console.log("Could not find bounds");
}
