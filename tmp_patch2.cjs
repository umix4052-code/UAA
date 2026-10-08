const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');

const regex = /\/\/ 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC[\s\S]*?const handleGenerateScript = async \(duration: string\) => \{[\s\S]*?\} \n    \};\n/g;

const match = content.match(regex);
if (match) {
    fs.writeFileSync('tmp_match.txt', match[0], 'utf8');
    console.log("Match found and saved to tmp_match.txt");
} else {
    console.log("No match found.");
}
