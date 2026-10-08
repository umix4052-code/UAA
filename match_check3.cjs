const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');

const checks = [
    `handleError(e, 'Autopilot Process', {}); if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); } } };`
];

checks.forEach((str, i) => {
    console.log(`Check ${i}: ${content.includes(str) ? 'MATCH' : 'FAIL'}`);
});
