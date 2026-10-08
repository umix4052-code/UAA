const fs = require('fs');

// Read niches
const nichesContent = fs.readFileSync('niche-directives.ts', 'utf-8');
const themeMatch = [...nichesContent.matchAll(/defaultThemes:\s*\[(.*?)\]/gs)];
const modifierMatch = [...nichesContent.matchAll(/defaultModifiers:\s*\[(.*?)\]/gs)];
const cameraMatch = [...nichesContent.matchAll(/defaultCameraAngles:\s*\[(.*?)\]/gs)];

const extract = (matches) => {
    const items = new Set();
    matches.forEach(m => {
        const raw = m[1];
        // match strings
        const strings = [...raw.matchAll(/"([^"]+)"/g)].map(x => x[1]);
        strings.forEach(s => items.add(s));
    });
    return Array.from(items);
};

const newThemes = extract(themeMatch);
const newModifiers = extract(modifierMatch);
const newCameras = extract(cameraMatch);

// Read constants.ts
let constantsContent = fs.readFileSync('constants.ts', 'utf-8');

const updateArray = (arrayName, newItems) => {
    const regex = new RegExp(`export const ${arrayName} = \\[(.*?)\\];`, 's');
    const match = constantsContent.match(regex);
    if (!match) return;
    
    let existingRaw = match[1];
    const existingItems = new Set([...existingRaw.matchAll(/"([^"]+)"/g)].map(x => x[1]));
    
    let toAdd = [];
    newItems.forEach(item => {
        if (!existingItems.has(item)) {
            toAdd.push(`    "${item}",`);
        }
    });
    
    if (toAdd.length > 0) {
        let newRaw = existingRaw.replace(/(\s*)$/, `\n${toAdd.join('\n')}$1`);
        constantsContent = constantsContent.replace(regex, `export const ${arrayName} = [${newRaw}];`);
    }
};

updateArray('themeOptions', newThemes);
updateArray('styleModifiers', newModifiers);
updateArray('cameraAngles', newCameras);

fs.writeFileSync('constants.ts', constantsContent);
console.log('Success');
