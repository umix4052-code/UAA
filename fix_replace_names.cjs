const fs = require('fs');
let code = fs.readFileSync('prompt-engine.ts', 'utf-8');

const searchStr = `                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    desc = desc.replace(/--- AI Script Analysis ---\\s*/gi, '').replace(/Description:\\s*/gi, '').replace(/--- AI Video Analysis ---\\s*/gi, '').trim();
                    
                    // ডেসক্রিপশন থাকলে শুধু "Name, Description" বসবে (কোনো ব্র্যাকেট বা লুপ থাকবে না)
                    return desc ? \`\${cleanName}, \${desc}\` : cleanName;`;

const replaceStr = `                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    desc = desc.replace(/--- AI Script Analysis ---\\s*/gi, '').replace(/Description:\\s*/gi, '').replace(/--- AI Video Analysis ---\\s*/gi, '').trim();
                    
                    // Remove starting name and "is a" / "is" to avoid "Name, Name is a..."
                    const nameRegex = new RegExp(\`^\${cleanName.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')}\\\\s*(?:is\\\\s+a|is\\\\s+an|is|are)?\\\\s*[,:]?\\\\s*\`, 'i');
                    desc = desc.replace(nameRegex, '').trim();
                    desc = desc.replace(/^[,:]\\s*/, '').trim();
                    
                    // ডেসক্রিপশন থাকলে শুধু "Name, Description" বসবে (কোনো ব্র্যাকেট বা লুপ থাকবে না)
                    return desc ? \`\${cleanName}, \${desc}\` : cleanName;`;

code = code.split(searchStr).join(replaceStr);
fs.writeFileSync('prompt-engine.ts', code);
console.log("Replace names fix applied");
