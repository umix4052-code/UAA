const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf-8');

// Fix 1: index.tsx:3708
code = code.replace(
    /characterProfiles:\s*currentData\.characterProfiles\.map\(\(p:\s*any\)\s*=>\s*\(\{\s*id:\s*p\.id,\s*userDescription:\s*p\.userDescription,\s*aiDescription:\s*p\.aiDescription,\s*image:\s*null\s*\}\)\)/, 
    "characterProfiles: currentData.characterProfiles.map((p: any) => ({\n                            id: p.id,\n                            name: p.name || '',\n                            userDescription: p.userDescription,\n                            aiDescription: p.aiDescription,\n                            image: null\n                        }))"
);

// Fix 2: index.tsx:3802
code = code.replace(
    /characterProfiles:\s*characterProfiles\.map\(p\s*=>\s*\(\{\s*id:\s*p\.id,\s*userDescription:\s*p\.userDescription,\s*aiDescription:\s*p\.aiDescription,\s*image:\s*p\.image\s*\?\s*\{\s*name:\s*p\.image\.name,\s*size:\s*p\.image\.size\s*\}\s*:\s*null\s*\}\)\)/, 
    "characterProfiles: characterProfiles.map(p => ({ \n                    id: p.id, \n                    name: p.name || '',\n                    userDescription: p.userDescription, \n                    aiDescription: p.aiDescription, \n                    image: p.image ? { name: p.image.name, size: p.image.size } : null \n                }))"
);

// Fix 3: index.tsx:3969
code = code.replace(
    /const loadedCharProfiles:\s*CharacterProfile\[\]\s*=\s*\(projectData\.characterProfiles \|\|\s*\[\{\s*userDescription:\s*'',\s*aiDescription:\s*'',\s*image:\s*null\s*\}\]\)\.map\(\(p:\s*any\)\s*=>\s*\(\{\s*id:\s*crypto\.randomUUID\(\),\s*userDescription:\s*p\.userDescription,\s*aiDescription:\s*p\.aiDescription,\s*image:\s*p\.image\s*\?\s*\{\s*name:\s*p\.image\.name,\s*size:\s*p\.image\.size,\s*dataUrl:\s*'',\s*file:\s*null\s*\}\s*:\s*null,\s*\}\)\);/, 
    "const loadedCharProfiles: CharacterProfile[] = (projectData.characterProfiles || [{ userDescription: '', aiDescription: '', image: null }]).map((p: any) => ({ \n            id: p.id || crypto.randomUUID(), \n            name: p.name || '',\n            userDescription: p.userDescription, \n            aiDescription: p.aiDescription, \n            image: p.image ? { name: p.image.name, size: p.image.size, dataUrl: '', file: null } : null, \n        }));"
);

// Fix 4: Auto Scan in handleAnalyzeScript
const searchStr = `const newProfiles = parsedData.characters.map((c: { name: string, description: string }) => ({ 
                        id: crypto.randomUUID(), 
                        name: c.name, 
                        userDescription: '', 
                        aiDescription: c.description ? c.description.trim() : '', 
                        image: null 
                    })); 
                    setCharacterProfiles(newProfiles);`;

const replaceStr = `const newProfiles = parsedData.characters.map((c: { name: string, description: string }) => ({ 
                        id: crypto.randomUUID(), 
                        name: c.name, 
                        userDescription: '', 
                        aiDescription: c.description ? c.description.trim() : '', 
                        image: null 
                    })); 
                    setCharacterProfiles(prev => {
                        const updated = [...prev];
                        newProfiles.forEach((newProfile, index) => {
                            if (updated[index]) {
                                // Update AI description but PRESERVE existing name and userDescription if they exist
                                updated[index].aiDescription = newProfile.aiDescription;
                                if (!updated[index].name) {
                                    updated[index].name = newProfile.name;
                                }
                            } else {
                                updated.push(newProfile);
                            }
                        });
                        return updated;
                    });`;
code = code.split(searchStr).join(replaceStr);

fs.writeFileSync('index.tsx', code);
console.log("Fixes applied to index.tsx");
