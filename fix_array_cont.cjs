const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr = `    const stateInheritanceInstruction = \`\\n\\n**STRICT VISUAL STATE INHERITANCE (CRITICAL FOR CONTINUITY):**
You will be provided with a 'PREVIOUS_VISUAL_STATE' JSON. 
- If the current script scene is in the SAME location/time as the previous scene, you MUST strictly use the exact environmental details (lighting, background props, colors) from the PREVIOUS_VISUAL_STATE in your new master_prompt. Do not invent new surroundings.
- If the script explicitly changes location or time, you may create a new environment.
- VERY IMPORTANT: At the end of your JSON response, you MUST output a new field called \\\`current_visual_state\\\` containing a brief JSON snapshot of the scene's environment (e.g., location, style, lighting, key background props). This will be used as memory for the next chunk.
PREVIOUS_VISUAL_STATE: \${previousVisualState ? JSON.stringify(previousVisualState) : "null"}\`;`;

const replaceStr = `    const stateInheritanceInstruction = \`\\n\\n**STRICT VISUAL STATE INHERITANCE (CRITICAL FOR CONTINUITY):**
You will be provided with a 'PREVIOUS_VISUAL_STATE' JSON. 
- If the current script scene is in the SAME location/time as the previous scene, you MUST strictly use the exact environmental details (lighting, background props, colors) from the PREVIOUS_VISUAL_STATE in your new master_prompt. Do not invent new surroundings.
- If the script explicitly changes location or time, you may create a new environment.
- VERY IMPORTANT: At the end of your JSON response, you MUST output a new field called \\\`current_visual_state\\\` containing a brief JSON snapshot of the scene's environment (e.g., location, style, lighting, key background props). This will be used as memory for the next chunk.
PREVIOUS_VISUAL_STATE: \${previousVisualState ? JSON.stringify(previousVisualState) : "null"}

**INTRA-ARRAY SCENE-TO-SCENE CONTINUITY (CRITICAL):**
When generating multiple scenes within the same 'scenes' array, you MUST maintain strict environmental continuity between consecutive scenes.
- Scene 2 MUST inherit the exact location, environment, weather, and lighting established in Scene 1. Scene 3 must inherit from Scene 2, and so on.
- DO NOT invent a new location (e.g., jumping from an 'alleyway' to an indoor 'room') UNLESS the script explicitly and clearly dictates a physical transition to a new setting.
- If the script line merely describes an action (e.g., 'he opens the box'), keep the background exactly the same as the previous scene in the array.\`;`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('ai-prompts.ts', code);
    console.log("Updated ai-prompts.ts successfully.");
} else {
    console.log("Could not find the target string.");
}
