const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf-8');

// Fix 1: in splitScriptIntoScenes
const searchStr1 = `                            const parsedResults: { scene_description: string }[] = parsedJson.scenes;\n                            if (parsedJson.current_visual_state) {\n                                videoPreviousVisualState = parsedJson.current_visual_state;\n                            } return parsedResults.map(r => ({ scene_description: r.scene_description, image_prompt: '', imageStatus: 'pending' })); };`;
const replaceStr1 = `                            const parsedResults: { scene_description: string }[] = parsedJson.scenes;\n                            return parsedResults.map(r => ({ scene_description: r.scene_description, image_prompt: '', imageStatus: 'pending' })); };`;

if (code.includes(searchStr1)) {
    code = code.replace(searchStr1, replaceStr1);
    console.log("Fix 1 applied.");
} else {
    console.log("Fix 1 search string not found!");
}

// Fix 2: in triggerVideoPromptGeneration
const searchStr2 = `                            finalTargetCount = Math.max(1, Math.round(estimatedSeconds / targetDuration));\n                        }\n                        const { systemData, userData } = getScriptToStoryboardPrompt(targetScript, finalTargetCount, [], [], '', '', [], '', false, projectNicheRef.current, [], undefined, undefined, isAuto, targetSceneDurationRef.current, cinematicModeEnabledRef.current, cinematicOptionsRef.current, targetScript, undefined, globalSummary);\n                        const result = await executeGenerativeAiTask('', userData, 'script breakdown', jsonValidator, undefined, undefined, systemData);`;

const replaceStr2 = `                            finalTargetCount = Math.max(1, Math.round(estimatedSeconds / targetDuration));\n                        }\n                        let videoPreviousVisualState: any = null;\n                        const { systemData, userData } = getScriptToStoryboardPrompt(targetScript, finalTargetCount, [], [], '', '', [], '', false, projectNicheRef.current, [], undefined, undefined, isAuto, targetSceneDurationRef.current, cinematicModeEnabledRef.current, cinematicOptionsRef.current, targetScript, undefined, globalSummary, undefined, videoPreviousVisualState);\n                        const result = await executeGenerativeAiTask('', userData, 'script breakdown', jsonValidator, undefined, undefined, systemData);`;

if (code.includes(searchStr2)) {
    code = code.replace(searchStr2, replaceStr2);
    console.log("Fix 2 applied.");
} else {
    console.log("Fix 2 search string not found!");
}

fs.writeFileSync('index.tsx', code);
