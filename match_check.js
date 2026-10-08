const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');

const checks = [
    'if (validator && !validator(text)) { throw new Error("Content validation failed: AI returned invalid format or empty response."); }',
    'if (message.includes(\'fetch\')) {',
    'handleError(e, \'generate video prompts\', { provider: apiProviderRef.current, model: videoModelRef.current });',
    'handleError(e, isVisualRemake ? \'visual remake\' : \'video file analysis\', {});',
    'handleError(e, \'generate prompts and images\', {});',
    'handleError(e, \'analyze script\', {});',
    'handleError(e, \'translate script\', {});',
    'handleError(e, \'generate script\', {});',
    'handleError(e, \'generate image prompts only\', {});',
    'handleError(e, \'Autopilot Process\', {});'
];

checks.forEach((str, i) => {
    console.log(`Check ${i}: ${content.includes(str) ? 'MATCH' : 'FAIL'}`);
});
