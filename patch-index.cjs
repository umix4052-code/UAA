const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf-8');

const startStr = '// Post-Process: Replace ANY mentioned Character ID with full visual details';
const endStr = 'console.error("Error post-processing character IDs:", replaceErr);\n                        }';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const toRemove = content.substring(startIdx, endIdx + endStr.length);
    content = content.replace(toRemove, '');
    fs.writeFileSync('index.tsx', content);
    console.log('Removed bad post-process block.');
} else {
    console.log('Block not found');
}
