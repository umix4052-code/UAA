const fs = require('fs');
const content = fs.readFileSync('ai-prompts.ts', 'utf8');

const targetStr = `export const getSmartChunkWriterPrompt = (
    chapterTitle: string, 
    chapterFocus: string, 
    globalSummary: string, 
    previousChunkContext: string, 
    projectNicheRules: string, 
    language: string, 
    targetWordCount: number
): string => {
    const languageRule = language === 'Bengali'
        ? \`**STRICT LANGUAGE RULE:** The script MUST be written in natural, high-quality Bengali ('Suddho Chalito').\`
        : \`**STRICT LANGUAGE RULE:** The script MUST be written in English.\`;

    let contextInstruction = "This is the BEGINNING of the story. Hook the audience immediately.";
    if (previousChunkContext) {
        contextInstruction = \`**LOCAL MEMORY (STITCHING POINT):** Here is the exact ending of the previous chapter: "...$\{previousChunkContext}". \\nINSTRUCTION: Continue the story seamlessly from this exact point. Do NOT repeat the previous lines.\`;
    }

    const isNoVoiceover = projectNicheRules.toUpperCase().includes('NO VOICEOVER');
    const finalOutputRequirement = isNoVoiceover
        ? \`**CRITICAL OUTPUT REQUIREMENT:** DO NOT write a continuous narrator voiceover. Write detailed visual actions, camera movements, and ambient sound/SFX cues. You MAY use [Visual: ...] and [Audio: ...] tags. Short in-scene dialogue is allowed.\`
        : \`**CRITICAL OUTPUT REQUIREMENT:** Write ONLY the pure narration and dialogue. Do NOT use scene headings. Do NOT use [Visual: ...] or [Audio: ...] tags. The output must be 100% ready for Text-to-Speech (TTS).\`;

    return \`You are an Elite Scriptwriter. Your task is to write ONE specific chapter of a larger long-form video script. 

**GLOBAL MEMORY (DO NOT DEVIATE):**
Here is the core storyline: "$\{globalSummary}"

**YOUR CURRENT ASSIGNMENT:**
Write the script for Chapter: "$\{chapterTitle}"
Chapter Focus: "$\{chapterFocus}"
Target Length: Approximately $\{targetWordCount} words.

**NICHE RULES & TONE:**$\{projectNicheRules}

**FLOW & CONTINUITY:**$\{contextInstruction}$\{languageRule}

$\{finalOutputRequirement}
- Do NOT output JSON. Do NOT output chapter titles. Just write the pure script for this chunk.

**🚨 THE LAST MILE RULE (CRITICAL RE-CHECK):**
Before generating the output, deeply re-read the "Niche Rules & Tone" and the "Global Memory" above. Ensure your script tone exactly matches the required archetype. Ensure you hit the target word count of $\{targetWordCount} words.\`;
};`;

const replacementStr = `export const getSmartChunkWriterPrompt = (
    chapterTitle: string, 
    chapterFocus: string, 
    globalSummary: string, 
    previousChunkContext: string, 
    projectNicheRules: string, 
    language: string, 
    targetWordCount: number,
    isNoVoiceover: boolean
): string => {
    const languageRule = language === 'Bengali'
        ? \`**STRICT LANGUAGE RULE:** The script MUST be written in natural, high-quality Bengali ('Suddho Chalito').\`
        : \`**STRICT LANGUAGE RULE:** The script MUST be written in English.\`;

    let contextInstruction = "This is the BEGINNING of the story. Hook the audience immediately.";
    if (previousChunkContext) {
        contextInstruction = \`**LOCAL MEMORY (STITCHING POINT):** Here is the exact ending of the previous chapter: "...$\{previousChunkContext}". \\nINSTRUCTION: Continue the story seamlessly from this exact point. Do NOT repeat the previous lines.\`;
    }

    // isNoVoiceover is now received as a parameter directly from the engine
    const finalOutputRequirement = isNoVoiceover
        ? \`**CRITICAL OUTPUT REQUIREMENT:** DO NOT write a continuous narrator voiceover. Write detailed visual actions, camera movements, and ambient sound/SFX cues. You MAY use [Visual: ...] and [Audio: ...] tags. Short in-scene dialogue is allowed.\`
        : \`**CRITICAL OUTPUT REQUIREMENT:** Write ONLY the pure narration and dialogue. Do NOT use scene headings. Do NOT use [Visual: ...] or [Audio: ...] tags. The output must be 100% ready for Text-to-Speech (TTS).\`;

    return \`You are an Elite Scriptwriter. Your task is to write ONE specific chapter of a larger long-form video script. 

**GLOBAL MEMORY (DO NOT DEVIATE):**
Here is the core storyline: "$\{globalSummary}"

**YOUR CURRENT ASSIGNMENT:**
Write the script for Chapter: "$\{chapterTitle}"
Chapter Focus: "$\{chapterFocus}"
Target Length: Approximately $\{targetWordCount} words.

**NICHE RULES & TONE:**$\{projectNicheRules}

**FLOW & CONTINUITY:**$\{contextInstruction}$\{languageRule}

$\{finalOutputRequirement}
- Do NOT output JSON. Do NOT output chapter titles. Just write the pure script for this chunk.

**🚨 THE LAST MILE RULE (CRITICAL RE-CHECK):**
Before generating the output, deeply re-read the "Niche Rules & Tone" and the "Global Memory" above. Ensure your script tone exactly matches the required archetype. 
**STRICT WORD LIMIT:** You MUST write exactly around $\{targetWordCount} words. DO NOT EXCEED $\{targetWordCount + 100} words under any circumstances. Overwriting will completely ruin the video pacing and duration!\`;
};`;

const newContent = content.replace(targetStr, replacementStr);
if (newContent !== content) {
    fs.writeFileSync('ai-prompts.ts', newContent, 'utf8');
    console.log("Success");
} else {
    console.log("Target string not found.");
}
