// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
import { CharacterProfile, TTSConfig, ScriptProcessingOptions, ReferenceFile } from './types';
import { themeOptions, styleModifiers, ttsVoices, cameraAngles } from './constants';
import { getNicheConfig } from './niche-directives';
import { detectLanguage } from './utils';



// --- MASTER PERSONA CONSTANT (UPDATED V4 - UNIVERSAL ARCHETYPES) ---
// Strictly enforces RAW NARRATION ONLY. No music, no speaker tags.
const MASTER_SCRIPTWRITER_PERSONA = `You are a World-Class YouTube Scriptwriter. You specialize in 'Retention Engineering'—crafting scripts with high-impact narration that keeps viewers glued to the screen.

**CORE WRITING RULES:**
1. **Tone:** Use a **Conversational Tone**. Write naturally, as if telling a story to an audience, but maintain authority.
2. **Language:** Use **Simple Language**. Avoid complex academic words. Write in simple English that a 10th-grade student can easily understand.
3. **Structure:** Every script must have a Hook (0-5s), Body (Story Arc), and Payoff.
4. **Visuals:** Write words that paint a picture.

**STRICT FORMATTING RULES (CRITICAL):**
- **RAW NARRATION ONLY:** Write ONLY the words that will be spoken.
- **NO META-DATA:** Do NOT include scene headings (e.g., "SCENE 1", "EXT. DAY").
- **NO MUSIC/SFX:** Do NOT include music cues or sound effects in parentheses (e.g., "(Music starts)", "[Sound of rain]").
- **NO SPEAKER TAGS:** Do NOT use labels like "NARRATOR:", "Speaker:", or "**Host:**". Just write the text.
- **NO INTROS:** Do not say "Here is the script". Start directly with the first word of the story.`;

export const AUDIO_VISUAL_SCRIPTWRITER_PERSONA = `You are an Elite Visual Storyboard & Scene Director. Your primary job is to write highly detailed, step-by-step visual action scripts without continuous narration.

**STRICT FORMATTING RULES (CRITICAL):**
1. **VISUAL ACTION FIRST (PRIMARY GOAL):** Describe exactly what happens on screen in vivid detail. Focus on character actions, camera pacing, environment, and physical movements.
2. **SCENE HEADINGS:** Break the visual action into logical, numbered scenes (e.g., 'Scene 1', 'Scene 2').
3. **NO CONTINUOUS NARRATOR:** DO NOT write a traditional narrator voiceover or background storytelling.
4. **AUDIO & SFX TRACKING:** You MUST describe ambient sounds and specific character audio cues using [SFX: description] tags alongside the visual actions.
5. **SPARSE DIALOGUE & REACTIONS:** You MUST include short, realistic character reactions, sparse dialogues, or whispers ONLY IF the specific niche rules explicitly demand it. Blend these naturally with the physical actions.`;

// Helper to inject niche-specific instructions using UNIVERSAL ARCHETYPES
const getNicheInstructions = (contextText: string): string => {
    // Increased slice to 500 chars to better catch context in longer inputs
    return `
    **STEP 1: DETECT NICHE & ASSIGN ARCHETYPE**
    Analyze the input text ("${contextText.slice(0, 500)}...") and categorize it into one of the following 5 Archetypes. Apply the rules STRICTLY:

    **TYPE 1: THE SOLEMN CHRONICLER (History, War, Religion, True Crime, News)**
    - *Apply if:* Islamic History, WW2, Ancient History, Crime, Biography.
    - **Tone:** Grave, Authoritative, Respectful, Intense, "Deep Documentary" Style.
    - **Language:** Simple but powerful. Use present tense for intensity (e.g., "The tanks roll in...").
    - **FACT RULE:** You MUST use Google Search to verify names, dates, and religious texts (Quran/Hadith). Zero tolerance for fake info.

    **TYPE 2: THE SHADOW WEAVER (Horror, Mystery, Thriller, Paranormal)**
    - *Apply if:* Ghost stories, Aliens, Detective, Scary tales.
    - **Tone:** Eerie, Slow-paced, Suspenseful, Whispery texture.
    - **Style:** Hold back the answer. Use loops. Use words like "Shadow", "Unknown", "Lurking".

    **TYPE 3: THE HYPE FUTURIST (Tech, Sports, Cars, Action, Finance)**
    - *Apply if:* Gadgets, AI, Football, Racing, Money making.
    - **Tone:** High Energy, Fast, Punchy, Enthusiastic, Confident.
    - **Style:** Short sentences. Get straight to the point. No fluff.

    **TYPE 4: THE GENTLE GUIDE (Kids, Nature, Wellness, Lifestyle, Travel)**
    - *Apply if:* Bedtime stories, Meditation, Cooking, Vlogs, Animals.
    - **Tone:** Warm, Soothing, Cheerful, Soft, Descriptive.
    - **Style:** Very simple vocabulary. Focus on sensory details (colors, smells, feelings).

    **TYPE 5: THE DRAMATIC STORYTELLER (General Fiction, Drama, Movies)**
    - *Apply if:* Love story, Social drama, Movie recap, Fan fiction.
    - **Tone:** Emotional, Cinematic, Engaging.
    - **Style:** Focus on character feelings and dramatic twists.
    `;
};

// Deprecated niche function for backward compatibility with old calls if any
export const getNicheSpecificInstructions = (niche: string): string => {
    return getNicheInstructions(niche); 
};

// --- NEW HELPER FOR AUDIO CUES ---
export const getVoiceoverAutoConfigPrompt = (chunkedScript: string, availableVoices: string, nicheName: string, scriptRules: string, audioRules: string): string => {
    return `You are an expert script analyst and voiceover director. Your task is to select the best TTS voice and speed based on the STRICT NICHE DIRECTIVES and the SCRIPT CONTEXT provided below.

[SUPREME PRIORITY: NICHE RULES]
You MUST obey the following rules. They override any conflicting tone in the script.
- Niche Name: ${nicheName}
- Script Strategy: ${scriptRules}
- Audio Strategy: ${audioRules}

[STORY CONTEXT]
Use these 3 chunks (Beginning, Middle, End) to understand the story's emotional arc, gender requirement, and pacing. However, ALWAYS filter your final voice selection through the 'Supreme Priority' rules above.
${chunkedScript}

**Available TTS Voices:**
${availableVoices}

**Your instructions are:**
1.  **Extract Voiceover Text:** Read the provided chunked script and return a brief summary representation or sample, omitting scene headings. (The actual full script processing happens elsewhere; just return a valid string for "voiceoverScript").
2.  **Determine Archetype & Select Voice:**
    - Use the [SUPREME PRIORITY: NICHE RULES] to determine the optimal voice archetype.
    - *Constraint:* You MUST return the exact 'conceptualName' from the list provided.
3.  **Suggest Speaking Speed:** 
    - Rely on Niche Rules and Story Context.
    - Serious/Sad/Horror/History: Slower (0.85 - 0.95).
    - Tech/Action/Happy: Faster (1.05 - 1.15).
    - Default: 1.0.
4.  **Create a Custom Prompt:** Write a detailed, descriptive custom prompt for the AI voice matching the Niche Rules. Example: "Spoken with a deep, grave tone, like an old historian recounting a tragedy."
5.  **Format the Output:** You MUST return your response as a single, valid JSON object. Keys: "voiceoverScript", "selectedVoice", "suggestedSpeed", "customPrompt".`;
};


// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
export const getScriptVisualsConfigPrompt = (script: string): string => {
    const availableAngles = cameraAngles.map(a => a.value).join(', ');
    const availableThemes = themeOptions.join(', ');
    const availableModifiers = styleModifiers.join(', ');

    return `You are an expert art director and cinematographer. Analyze the following script and determine the most effective visual configurations to bring this story to life.
    
    **Available Options:**
    - Themes: ${availableThemes}
    - Modifiers: ${availableModifiers}
    - Camera Angles: ${availableAngles}
    
    **CRITICAL INSTRUCTION:**
    You must select items ONLY from the "Available Options" lists provided above. Do not invent new terms.
    
    **OUTPUT FORMAT - STRICT JSON ONLY:**
    1. Analyze the script's mood, setting, and pacing.
    2. Select 1 to 2 Primary Themes.
    3. Select 2 to 4 Artistic Modifiers.
    4. Select 1 to 3 Camera Angles.
    5. Return ONLY a valid JSON object.
    6. **DO NOT** use Markdown code blocks (like \`\`\`json).
    7. **DO NOT** include any introductory or explanatory text.
    
    **Required JSON Structure:**
    { 
        "suggestedThemes": ["Cyberpunk", "Cinematic"],
        "suggestedModifiers": ["High Contrast", "Volumetric Lighting"],
        "suggestedAngles": ["Wide Shot", "Low Angle"]
    }
    
    **Script:**
    "${script.slice(0, 5000)}..."`;
};

export const getUniqueStoryPrompt = (script: string): string => {
    // This is for generating a completely NEW story from an existing script (Inspiration)
    const nicheInstr = getNicheInstructions(script);
    return `${MASTER_SCRIPTWRITER_PERSONA}
    
    ${nicheInstr}

    **TASK:**
    Analyze the following script to understand its core topic, theme, and style. Then, write a completely **NEW and UNIQUE** script about the same topic.
    
    **INSTRUCTIONS:**
    1. **Authenticity:** If the topic requires facts (History/Religion/War), verify key details using your knowledge (or Search if enabled).
    2. **Uniqueness:** The story structure, characters, and flow must be different to avoid "Reused Content".
    3. **Simplicity:** Use simple, direct language. Do not use complex vocabulary.
    4. **Length:** Similar to the original.
    5. **FORMAT:** Raw narration ONLY. No speaker tags, no music cues.

    Respond ONLY with the newly generated script text.

    **ORIGINAL SCRIPT for TOPIC ANALYSIS:**
    ---\n${script}\n---`;
};

export const getUniqueStoryChunkPrompt = (chunk: string, contextInstruction: string, language: 'Bengali' | 'English', projectNiche?: string): string => {
    const languageRule = language === 'Bengali'
        ? `**STRICT LANGUAGE RULE:** The input is in Bengali. Your output MUST be in high-quality, natural-sounding Bengali ("Suddho Chalito" - শুদ্ধ চলিত). DO NOT translate to English. Your writing style should be natural and suitable for the detected genre.`
        : `**STRICT LANGUAGE RULE:** The input is in English. Your output MUST be in English. DO NOT translate to Bengali. Your writing style should be natural and suitable for the detected genre.`;

    const nicheConfig = projectNiche ? getNicheConfig(projectNiche) : null;
    const scriptRules = nicheConfig?.scriptRules || '';

    return `You are a world-class YouTube scriptwriter specializing in creating high-retention, viral content. Your goal is to rewrite the provided script chunk into a completely new, unique story that is far more engaging.

${languageRule}
${scriptRules}

**LOGIC BLOCK 1: DYNAMIC THEME-AWARE SCRIPT GENERATION**

**1. DYNAMIC ANALYSIS (THE "BRAIN"):**
Before writing, analyze the input text to identify:
-   **The Topic & Niche:** (e.g., Ancient Mystery, Tech Review, Sad Story, Health Tips).
-   **The Emotion/Vibe:** (e.g., Suspenseful, Energetic, Melancholic, Informative).
-   **The Structure:** Is it a Linear Story (Narrative) OR a List/Steps?
Adapt your writing style COMPLETELY to the detected niche. Do not force a single style.

**2. ADAPTIVE WRITING FORMULA (Apply based on your analysis):**
-   **Phase 1: The "Context-Matched" Hook:** If this is the beginning of the story, create an opening that fits the niche perfectly.
    -   *Mystery/Crime:* Start with the 'Climax' or a chilling question.
    -   *Tech/Info:* Start with the 'Problem' the user faces.
    -   *History/Epic:* Start by setting the 'Time & Atmosphere'.
    -   *Meditation/Sleep:* Start with 'Calm & Relaxation'.
-   **Phase 2: The Body (Smart Flow):**
    -   *IF Narrative (Story/Docu):* Use "Cinematic Liquid Flow". Sentences must glide into each other. Build tension and release it. Eliminate "dead air" (unnecessary pauses).
    -   *IF List/Educational:* Keep points clear, but make explanations engaging and punchy. Remove dry, robotic descriptions.
-   **Phase 3: The Payoff (Conclusion):** If this is the end of the story, provide a powerful closing thought or a final takeaway that satisfies the viewer's curiosity.

**CONTEXT & FLOW INSTRUCTIONS:**
-   ${contextInstruction}

**STRICT OUTPUT FORMATTING (CRITICAL):**
-   **RAW NARRATION ONLY:** Respond ONLY with the spoken words of the new script.
-   **NO META-DATA:** Do NOT include headings (like "Scene 1"), intro/outro text (like "Here is the new script:"), or speaker labels (like "NARRATOR:").
-   **NO SOUND CUES:** Do NOT include music or sound effect cues like [sad music] or (wind blowing).
-   **CRITICAL CONSTRAINT: SUMMARIZING IS STRICTLY FORBIDDEN. The output length MUST be similar to the input length. Failure to maintain the original length will result in a penalty.** Retain full depth.

**ORIGINAL SCRIPT CHUNK TO REWRITE:**
---
${chunk}
---
`;
};

export const getRefineStorySuggestionsPrompt = (script: string, count: number = 10): string => {
    return `You are an expert script doctor specializing in repurposing viral content for different platforms while avoiding content reuse flags.

**CORE OBJECTIVE:**
Generate ${count} unique structural variations of the provided script. Each variation must retain the **original core facts, emotion, and impact** but completely restructure the phrasing and narrative flow. The goal is to tell the same story in a new way.

**BILINGUAL OUTPUT REQUIREMENT (CRITICAL):**
For EACH of the ${count} variations, you MUST provide the title and roadmap in BOTH English and natural, high-quality Bengali ("Suddho Chalito" - শুদ্ধ চলিত). This is a strict requirement regardless of the input script's language.

**"RE-HOOKING & RE-STRUCTURING" STRATEGY:**
Analyze the "Viral Pattern" of the input script and recreate it using different **Entry Points** and **Narrative Structures**. Generate exactly ${count} variations based on these structural shifts:
1.  **The "Reverse Engineering" Angle:** Start with the climax/result first, then explain how it happened.
2.  **The "Misconception First" Angle:** Start by attacking a common false belief related to the topic.
3.  **The "Hidden Mechanism" Angle:** Focus strictly on the invisible scientific or psychological process behind the events.
4.  **The "Chronological Tension" Angle:** A linear retelling but with heightened pacing and more dramatic language.
5.  **The "Direct Challenge" Angle:** Address the viewer directly ("You might think X, but the truth is Y...").
6.  **The "Protagonist's POV" Angle:** Tell the story from the first-person perspective of a key character involved.
7.  **The "Analogical" Angle:** Explain the core concept by comparing it to a simple, relatable analogy first.
8.  **The "Cold Open" Angle:** Start mid-action without any introduction, forcing the viewer to catch up.
9.  **The "Investigative Report" Angle:** Frame the story as a journalistic investigation, presenting facts and evidence piece by piece.
10. **The "What If" Angle:** Start by posing a hypothetical question that the rest of the script answers (e.g., "What if you were the last person on Earth?").

**"PLOT ROADMAP" FORMULA (Internal guide for you):**
For each of the ${count} angles, you MUST provide a 5-line functional summary explaining **HOW** this version is structurally unique.
*   **Line 1 (The New Hook):** "This version starts by showing [X] instead of [Y]..."
*   **Line 2-3 (The Flow Change):** "It rearranges the middle section to focus on [A] before explaining [B]..."
*   **Line 4-5 (The Resolution):** "Ends with the same conclusion but phrased as a [Question/Statement]..."

**STRICT JSON OUTPUT FORMAT:**
- You MUST return a valid JSON object with a single key "suggestions" that contains a JSON array of exactly ${count} objects.
- Each object must have the keys: "id", "angle_type", "en_title", "bn_title", "en_roadmap", "bn_roadmap".
- **DO NOT** use Markdown code blocks (\`\`\`).
- **DO NOT** include any introductory text. Your response must start with \`{\` and end with \`}\`.

**ORIGINAL SCRIPT TO ANALYZE:**
---
${script.slice(0, 10000)}
---`;
};

export const getRefineStoryChunkPrompt = (chunk: string, contextInstruction: string, title: string, roadmap: string, language: 'Bengali' | 'English', projectNiche?: string): string => {
    const languageRule = language === 'Bengali'
        ? `**STRICT LANGUAGE RULE:** The input is in Bengali. Your output MUST be in high-quality, natural-sounding Bengali ("Suddho Chalito").`
        : `**STRICT LANGUAGE RULE:** The input is in English. Your output MUST be in English.`;

    const nicheConfig = projectNiche ? getNicheConfig(projectNiche) : null;
    const scriptRules = nicheConfig?.scriptRules || '';

    return `${MASTER_SCRIPTWRITER_PERSONA}
    ${scriptRules}
    
**GOAL:** You are rewriting a script chunk based on a specific creative angle. Follow the provided "Plot Roadmap" precisely to transform the text.

${languageRule}

**SELECTED ANGLE:** "${title}"

**PLOT ROADMAP (Your Creative Brief):**
---
${roadmap}
---

**CRITICAL INSTRUCTIONS:**
1.  **Follow the Roadmap:** The roadmap is your primary instruction. Your rewrite must reflect its structural and thematic changes.
2.  **Retention Engineering:** Use strong hooks, pattern interrupts, and curiosity loops to keep the viewer engaged.
3.  **Pacing:** Expand on emotionally resonant moments and condense less critical information, as guided by the angle.
4.  **Simple & Powerful Language:** Use a natural, conversational tone. Avoid robotic or overly complex words.
5.  **Flow & Context:** ${contextInstruction}
6.  **CRITICAL LENGTH CONSTRAINT:** Do NOT summarize. The rewritten chunk must be of a similar length to the original chunk to maintain the story's pacing and detail.

**STRICT OUTPUT FORMATTING:**
-   **RAW NARRATION ONLY:** Write ONLY the narration/dialogue.
-   **NO METADATA:** Do NOT include speaker tags (NARRATOR:), scene headings (SCENE 1), or any text that isn't meant to be spoken.
-   **NO SOUND CUES:** Do NOT add [sad music] or (wind blowing).

**ORIGINAL SCRIPT CHUNK TO REWRITE:**
---
"${chunk}"
---`;
};

// DEPRECATED - This is the old, weak rephrase prompt.
export const getRephraseChunkPrompt = (chunk: string, contextInstruction: string): string => {
    // Keeps original meaning but ensures copyright safety.
    // Added specific instruction to avoid "complex academic language".
    return `${MASTER_SCRIPTWRITER_PERSONA}
    
    Rephrase the following paragraph to make it unique and avoid copyright issues, while keeping the original story, meaning, and tone intact.
    
    **CRITICAL INSTRUCTIONS:**
    1. **Language:** Use simple, clear, conversational English. Do not use complex synonyms or "thesaurus" words.
    2. **Length:** DO NOT SHORTEN. The output MUST be approximately the same length as the input.
    3. **No Summarizing:** Summarizing is strictly forbidden.
    4. **Format:** Raw text only. No intro/outro.
    
    ${contextInstruction} Respond only with the rephrased paragraph.
    
    **ORIGINAL PARAGRAPH:**
    "${chunk}"`;
};

// NEW: Advanced Rephrase/Paraphrase Prompt to fix the bug
export const getAdvancedRephraseChunkPrompt = (chunk: string, contextInstruction: string, language: 'Bengali' | 'English', projectNiche?: string): string => {
    const languageRule = language === 'Bengali'
        ? `**STRICT LANGUAGE RULE:** The input is in Bengali. Your output MUST be in high-quality, natural-sounding Bengali ("Suddho Chalito"). DO NOT translate to English.`
        : `**STRICT LANGUAGE RULE:** The input is in English. Your output MUST be in English. DO NOT translate to Bengali.`;

    const nicheConfig = projectNiche ? getNicheConfig(projectNiche) : null;
    const scriptRules = nicheConfig?.scriptRules || '';

    return `You are an expert script paraphraser. Your goal is to rewrite the provided script chunk to be completely unique and pass plagiarism checks, while preserving the original meaning, tone, and narrative flow. This is for avoiding copyright/content reuse flags.

${languageRule}
${scriptRules}

**CORE TASK: DEEP PARAPHRASING**
1.  **Analyze Meaning:** First, understand the core message and intent of the original text.
2.  **Change Sentence Structure:** Do not just replace words. Actively change the structure of the sentences. Combine short sentences, break up long ones, and change the order of clauses.
3.  **Use Synonyms Intelligently:** Replace keywords with suitable synonyms that fit the context. Do not use overly complex or obscure words. Keep the language simple and conversational.
4.  **Maintain Tone & Flow:** The rewritten version must have the same emotional tone (e.g., suspenseful, happy, serious) as the original. It must also connect smoothly with the surrounding text.
5.  **Context:** ${contextInstruction}

**CRITICAL CONSTRAINTS:**
-   **DO NOT CHANGE THE CORE STORY/FACTS.** The meaning must be identical.
-   **LENGTH RULE (CRITICAL):** DO NOT SHORTEN THE SCRIPT. The output MUST be approximately the exact same length as the input.
-   **NO SUMMARIZING (CRITICAL):** Summarizing is strictly forbidden. You MUST rewrite every single sentence line-by-line. Do not skip any details.
-   **NO INTRO/OUTRO:** Respond ONLY with the rephrased text. Do not add "Here is the rephrased version:" or any other conversational filler.

**ORIGINAL SCRIPT CHUNK TO PARAPHRASHE:**
---
${chunk}
---`;
};

// This function is being replaced by getRefineStoryChunkPrompt but kept here to avoid breaking old calls if any.
// It is now updated to reflect a more generic refinement.
export const getRefineStoryPrompt = (chunk: string, contextInstruction: string, angle: string): string => {
    console.warn("DEPRECATED: getRefineStoryPrompt is being used. Please switch to getRefineStoryChunkPrompt.");
    return getRefineStoryChunkPrompt(chunk, contextInstruction, "General Refinement", angle, "English");
};


export const getSafetyRephrasePrompt = (originalPrompt: string): string => {
    return `The following image prompt was blocked by a safety filter. Your task is to rephrase it to be safe for generation while preserving the original artistic intent and core concepts. Do not refuse, just make it safe. Respond ONLY with the newly generated prompt text, without any additional comments, introductions, or formatting.\n\nORIGINAL PROMPT:\n---\n${originalPrompt}\n---`;
};

// Generates the master prompt for creating a storyboard FROM A SCRIPT.

// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
// 🚨 CRITICAL ARCHITECTURAL LOCK: Idea & Script Processing / AI Communication - STRICT WARNING: DO NOT MODIFY, OVERRIDE, OR REFACTOR THIS LOGIC WITHOUT EXPLICIT ARCHITECTURAL RISK ASSESSMENT AND USER CONFIRMATION.
export const getScriptToStoryboardPrompt = (
    script: string,
    imageCount: number,
    selectedThemes: string[],
    selectedModifiers: string[],
    cameraAngle: string,
    aspectRatio: string,
    characterProfiles: CharacterProfile[],
    negativePrompt: string,
    useNegativePrompt: boolean,
    projectNiche: string,
    styleReferenceFiles: ReferenceFile[],
    sceneStart?: number,
    sceneEnd?: number,
    autoBreakdown: boolean = false,
    targetSceneDuration: number | null = 8,
    fullScriptContext?: string,
    previousContext?: string, // Sliding window memory
    globalSummary?: string,
    nextChunk?: string,
    previousVisualState?: any
): { systemData: string; userData: string } => {
    console.log("[Data Verification] characterProfiles count passed to AI Prompt:", characterProfiles?.length || 0);
    const nicheConfig = getNicheConfig(projectNiche);
    
    const isNoVoiceover = (nicheConfig?.scriptRules || '').toUpperCase().includes('NO VOICEOVER') || (nicheConfig?.dropdownName || '').toUpperCase().includes('NO VOICE');
    const noVoiceInstruction = isNoVoiceover ? "\n\n**CRITICAL AUDIO & DIALOGUE RULE:** This is a 'No Voice' or 'No Dialogue' project. DO NOT create scenes where characters are speaking, arguing, or giving speeches. Focus PURELY on physical actions, cinematic B-roll, character movement, and facial expressions without spoken words. The `scene_description` MUST NOT contain dialogue tags." : "";

    const activeThemes = selectedThemes && selectedThemes.length > 0 ? selectedThemes : (nicheConfig?.defaultThemes || []);
    const activeModifiers = selectedModifiers && selectedModifiers.length > 0 ? selectedModifiers : (nicheConfig?.defaultModifiers || []);

    const universalCameraPalette = "Establishing Shot, Wide Angle, Drone Shot, Tracking Shot, Eye-level, Medium Shot, Over-the-Shoulder, Close-up, Extreme Close-up, Low Angle";
    const finalCameraPalette = cameraAngle !== 'Default' ? `${cameraAngle} (User Preferred), ${universalCameraPalette}` : universalCameraPalette;

    const masterCameraDirector = `
**[MASTER CAMERA & PACING DIRECTOR]**
**Primary Camera Palette:** [${finalCameraPalette}]

**Cinematic Variety & Scene Matching:** 
You must act as a professional cinematographer. Analyze the exact narrative context, action, and emotion of the current scene and select the most perfect camera angle from the palette (however, if the scene's action or emotion demands a different perspective not on this list, you MUST confidently invent and use the exact angle that fits best).
- **For vast world-building, establishing settings, or historical timeline shifts:** Use Establishing Shots, Wide Angles, or Drone Shots to show scale.
- **For dialogues, character reactions, or intimate emotional moments:** Use Medium Shots, Close-ups, or Over-the-Shoulder shots to build connection. When two characters are conversing, dynamically alternate the focus between their faces across consecutive scenes, or use Over-the-Shoulder shots to shoot from behind one character's shoulder focusing on the other, keeping both characters connected in the frame.
- **For intense physical action, battle sequences, or running:** Use dynamic Tracking Shots, Low Angles, or Handheld Shaky Cam to convey momentum.
- **For inspecting artifacts, tiny details, or subtle micro-motions (e.g., a tear, a glowing stone):** Use Extreme Close-up or Macro shots.

**CRITICAL CAMERA PROTOCOL (Single Shot vs. Combo-Move):** 
- **The Default Rule:** You MUST choose EXACTLY ONE primary camera angle/perspective per scene. Video generation models fail and morph characters when you combine multiple distinct camera movements in a single prompt.
- **The Exception (Creative Freedom):** You may use multi-stage camera transitions (combo-moves) ONLY IF the scene's emotional or spatial narrative strictly demands it (e.g., a dynamic tracking shot that suddenly halts into a close-up, or descending from the sky into a specific room). Do NOT use combo-moves randomly; use them very rarely and only for deliberate cinematic impact.
`;

    const globalStoryInstruction = globalSummary
        ? `\n\n**GLOBAL STORY THEME:**\n${globalSummary}`
        : '';

    const slidingWindowInstruction = previousContext
        ? `\n\n**PREVIOUS SCENE VISUALLY ENDED WITH:**\n${previousContext}`
        : '';
        
    const isFixedPOV = nicheConfig?.visualRules?.toLowerCase().includes("first-person pov") || nicheConfig?.visualRules?.toLowerCase().includes("fixed camera");

    const povEnforcementInstruction = (isFixedPOV && previousContext) 
        ? `\n\n**CRITICAL POV & CONTINUITY LOCK:** Based on the PREVIOUS SCENE context above, YOU MUST strictly maintain the EXACT SAME camera angle, POV, and core environment. DO NOT deviate or change locations.` 
        : ``;

    const upcomingContextInstruction = nextChunk
        ? `\n\n**UPCOMING SCRIPT CONTEXT (WHERE THE STORY GOES NEXT):**\n${nextChunk}`
        : '';
        
    const stateInheritanceInstruction = `\n\n**STRICT VISUAL STATE INHERITANCE (CRITICAL FOR CONTINUITY):**
You will be provided with a 'PREVIOUS_VISUAL_STATE' JSON. 
- **The Physical Continuity Test:** Before copying the previous scene's environment, ask yourself: Can the current script line happen physically at the exact same time and inside the exact same room/location as the previous scene without any camera cuts or time gaps? (e.g., Dialogue in a royal court = YES. A complaint at night, and the next line the prophet judges in the morning = NO).
- **Smart Memory Flush:** If the answer is NO (meaning there is a time gap, change in daylight, or change in action type), even if there are no explicit keywords like 'next day' or 'a century later' in the script, you MUST select 'NEW_LOCATION' or 'TIME_JUMP' as the \`location_status\`. When this flag is triggered, completely flush/reset the PREVIOUS_VISUAL_STATE memory buffer and create a completely new environment and lighting according to the scene's demands.
- If the answer is YES, you MUST strictly use the exact environmental details (lighting, background props, colors) from the PREVIOUS_VISUAL_STATE in your new master_prompt. Do not invent new surroundings.
- VERY IMPORTANT: At the end of your JSON response, you MUST output a new field called \`current_visual_state\` containing a brief JSON snapshot of the scene's environment (e.g., location, style, lighting, key background props). This will be used as memory for the next chunk.
PREVIOUS_VISUAL_STATE: ${previousVisualState ? JSON.stringify(previousVisualState) : "null"}

**INTRA-ARRAY SCENE-TO-SCENE CONTINUITY (CRITICAL):**
When generating multiple scenes within the same 'scenes' array, you MUST maintain strict environmental continuity between consecutive scenes.
- **Intra-Array Continuity Safe Rule:** If there's immediate continuous action within the same array (e.g., opening a box, talking), continuity remains 100% intact. Scene 2 MUST inherit the exact location, environment, weather, and lighting established in Scene 1. Scene 3 must inherit from Scene 2, and so on.
- DO NOT invent a new location (e.g., jumping from an 'alleyway' to an indoor 'room') UNLESS the Physical Continuity Test demands a transition to a new setting.`;

    const styleReferenceInstruction = (styleReferenceFiles.length > 0 && autoBreakdown)
        ? `\n\n**PHASE 0.5: VISUAL REFERENCE ANALYSIS (HIGHEST PRIORITY)**
           - **Primary Directive:** You have been provided with Style Reference images. These images are the **ULTIMATE SOURCE OF TRUTH** for the visual style.
           - **Your Task:** Before generating a prompt, deeply analyze the user-provided images. Identify their color palette, lighting, composition, mood, and overall aesthetic.
           - **Execution:** Your generated 'master_prompt' for each scene MUST be heavily biased to replicate this reference style. The 'Primary Themes' and 'Artistic Modifiers' are SECONDARY to the visual information in these reference images. If there is a conflict, the reference image style ALWAYS WINS.`
        : '';
        
    const characterInstruction = characterProfiles.some(p => p.name?.trim() || p.userDescription.trim() || p.aiDescription.trim()) 
        ? `\n\n**CRITICAL RULE: CHARACTER TAGGING (MANDATORY):**
1. Important Characters available in this project: ${characterProfiles.map((p, index) => p.name?.trim() || `Character ${index + 1}`).join(', ')} (or infer their names from the script).
2. If a named character appears in the scene, DO NOT describe their clothing or face in the prompt.
3. Just write their exact name tagged like {{Character: Name}} (e.g., {{Character: Zaid}} or {{Character: Layla}}) in the "master_prompt".
4. Our client-side application will automatically inject their visual details later. Do not waste tokens describing them.`
        : '';
    
    const finalNegative = (useNegativePrompt && negativePrompt && negativePrompt.trim()) 
        ? negativePrompt.trim() 
        : (nicheConfig?.defaultNegativePrompt || "watermark, text, logo, signature, low resolution, blurry, ugly, bad anatomy, deformed");

    const negativeInstruction = finalNegative 
        ? `\n\n**Negative Prompt:** The "master_prompt" MUST STRICTLY AVOID any mention or depiction of the following concepts: "${finalNegative}".` 
        : '';

    const rangeInstruction = (sceneStart !== undefined && sceneEnd !== undefined) 
        ? `Generate distinct scenes numbered ${sceneStart} to ${sceneEnd} (from a total of ${imageCount} scenes).`
        : `Divide the script into exactly ${imageCount} distinct, logical scenes.`;

    const countInstruction = autoBreakdown 
        ? `**STRICT TIMING & SCENE COUNT REQUIREMENT (MINIMUM TARGET: ${imageCount} SCENES):**
           1. **The Audio-to-Video Math:** This specific script chunk equals approximately ${imageCount * (targetSceneDuration || 8)} seconds of spoken audio. Since each generated video clip will be exactly ${targetSceneDuration || 8} seconds long, you MUST generate AT LEAST ${imageCount} distinct scenes to ensure the video correctly covers the audio length.
           2. **NEVER COMPRESS ACTIONS:** Generating fewer than ${imageCount} scenes is a CRITICAL FAILURE. Do NOT combine multiple actions or a long paragraph into a single 8-second scene. If reading the text aloud takes 24 seconds, it MUST be broken into at least three 8-second scenes.
           3. **Static Monologue Rule:** If the text is a long dialogue or static event without new actions, do NOT loop or repeat the exact same prompt, and do NOT compress the event. Instead, fulfill the ${imageCount} scene quota by naturally progressing the visual focus every ${targetSceneDuration || 8} seconds (e.g., "Wide shot of the speaker", then "Close up of their hands", then "B-roll cutaway of the subject matter", then "Reaction of the listener").
           4. **Allowance:** It is acceptable to generate 1 or 2 extra scenes if the narrative requires it, but you must NEVER generate fewer than ${imageCount} scenes.`
        : ((sceneStart !== undefined && sceneEnd !== undefined)
            ? `You must generate exactly ${sceneEnd - sceneStart + 1} objects in the JSON array (Scenes ${sceneStart} to ${sceneEnd}).`
            : `You must generate exactly ${imageCount} objects in the JSON array.`);

    const scriptInstruction = globalSummary 
        ? `Here is the GLOBAL STORY SUMMARY for context. Read this to understand the true narrative arc, characters, and overall atmosphere:\n---\n${globalSummary}\n---\n\nYOUR SPECIFIC TASK:\nBreak down ONLY the following specific chunk of the script into scenes:\n---\n${script}\n---`
        : `Here is the script you must process:\n---\n${script}\n---`;

    let systemData = `// ==========================================
// 🔒 GLOBAL CORE ENGINE - SECURE ZONE 
// STRICTLY DO NOT MODIFY OR EDIT THIS SECTION
// ==========================================
You are an Elite Cinematic Director, Master Storyboard Artist, and Advanced AI Video Prompt Engineer. Your task is to analyze the following script and generate a visual storyboard as a structured JSON object.

**PHASE 0: STYLE DEFINITION (Project Niche: ${projectNiche})**
You MUST adhere to the following core visual rules for this project:
${nicheConfig.visualRules}
${styleReferenceInstruction}
${negativeInstruction}

${masterCameraDirector}

**PHASE 1: CONTEXT LOCK (CRITICAL)**
Before generating any prompts, analyze the script to determine the **Time Period**, **Setting**, and **Technology Level**. Stay locked to the primary era unless the script explicitly changes it.
${globalStoryInstruction}
${slidingWindowInstruction}
${povEnforcementInstruction}
${upcomingContextInstruction}
${stateInheritanceInstruction}

**PHASE 2: SCENE GENERATION & THE DIRECTOR'S INTERPRETATION ENGINE (CRITICAL LOGIC)**
For each segment of the script, you must act as a director, not a literal translator. Follow these rules:

1.  **Literal vs. Figurative Rule:** Before creating a scene, ask: "Is this sentence a literal action, or is it a metaphor, an internal thought, or sarcasm?"

2.  **"Show, Don't Tell" Policy:**
    *   **If Figurative/Sarcastic (e.g., "he felt like he was on top of the world" or "you think you're walking on clouds"):** DO NOT create a literal image (e.g., a man on a globe, a person on a cloud). Instead, **SHOW THE REACTION OR EMOTION**. Create a \`scene_description\` that captures the character's *expression* (e.g., "A close-up on the man's triumphant, smiling face" or "Show the listener's annoyed and disbelieving facial expression").
    *   **If Literal Action (e.g., "he opened the door"):** Describe the action directly and cinematically.

3.  **Continuity for Dialogue & B-Rolls:**
    *   If a script line is purely dialogue, DO NOT create a new, random scene. Instead, describe it as holding the previous shot or cutting to a simple reaction shot of the speaker/listener.
    *   **CRITICAL B-ROLL AWARENESS:** If a character has a long dialogue, DO NOT keep the camera statically locked on their face for consecutive scenes. Instead, dynamically describe compelling **B-Roll footage (cutaways)** that are HIGHLY RELEVANT to the subject being discussed to visually reinforce the spoken words and prevent visual repetition.

4.  **Character Motion & Morphing Prevention (Micro vs. Macro Scaling):** You must animate characters based on scene intimacy. NEVER leave characters standing or sitting like lifeless statues. 
    - For dialogue, praying, thinking, or quiet scenes, use **Micro-motion** (e.g., 'subtle head tilt', 'shifting gaze', 'deep inhalation with chest rising', 'robes rustling gently in the wind', 'slight facial reaction'). Do NOT use large movements here to avoid AI video morphing.
    - For battle, chasing, physical conflict, or action scenes, use **Macro-motion** (e.g., 'charging forward with force', 'wielding a spear aggressively', 'stumbling back in shock', 'dust swirling around rapid footsteps').${noVoiceInstruction}

${characterInstruction}

**PHASE 3: JSON OUTPUT STRUCTURE**
Before generating the master_prompt, you MUST apply the 'Physical Continuity Test' to determine the 'location_status' and write a short 'status_justification' to logically prove your decision.
The final output MUST be a valid JSON object matching the following structure exactly:
{
  "scenes": [
    {
      "scene_number": 1,
      "scene_description": "The breakdown of what is happening.",
      "location_status": "SAME_AS_PREVIOUS or NEW_LOCATION or TIME_JUMP",
      "status_justification": "Briefly explain the result of your Physical Continuity Test.",
      "camera_angle": "Write the EXACT ONE primary camera angle chosen for this scene based on the MASTER CAMERA & PACING DIRECTOR rules.",
      "characters_in_scene": ["char_1", "char_2"], // An array of strings containing ONLY the specific Character IDs that are VISUALLY PRESENT in this specific scene. If no characters are present, return an empty array [].
      "master_prompt": "A highly detailed and structured cinematic master visual prompt."
    }
  ],
  "current_visual_state": {
    "location_type": "...",
    "lighting_and_atmosphere": "...",
    "key_props": "..."
  }
}

**CRITICAL CHARACTER RULE (GLOBAL - READ CAREFULLY):**
1. FOR NAMED/PROJECT CHARACTERS: If a character is explicitly listed in the project (e.g., Detective Roy), you MUST STRICTLY use ONLY their tag like '{{Character: Name}}'. DO NOT describe their age, gender, clothing, or facial features in the prompt. Our local system will auto-inject their profile later.
2. FOR UNNAMED/BACKGROUND CHARACTERS: Whenever you describe a generic or unnamed character (e.g., a waiter, a crowd member, a random passerby), you MUST explicitly state their gender (Male or Female) and approximate age. NEVER use ambiguous terms like 'a person' or 'someone'.

**INSTRUCTIONS:**
1.  **Sequential Processing (CRITICAL):** You MUST process the script sequentially from beginning to end. Do not jump between sections. Each generated scene must follow the narrative order of the script.
2.  **Scene Division:** ${autoBreakdown ? 'Follow the breakdown rule below.' : rangeInstruction} ${countInstruction}
3.  **Style Integration:** Each "master_prompt" MUST incorporate the following style elements NATURALLY into the description:
    -   **Primary Themes:** ${activeThemes.join(', ')}
    -   **Artistic Modifiers:** ${activeModifiers.join(', ')}
    -   **Aspect Ratio:** Conceptualize the image for a ${aspectRatio} aspect ratio.
4.  **FORMATTING RULES (VERY IMPORTANT):**
    - The "master_prompt" MUST be a **single, cohesive paragraph**.
    - **DO NOT** use bullet points, lists, or line breaks inside the "master_prompt" string.
    - **DO NOT** include labels like "Theme:", "Style:", etc., inside the "master_prompt". Blend everything into one visual description.`;

    const characterNames = characterProfiles.map(p => p.name?.trim()).filter(Boolean).join(', ');
    const finalCharacterLock = characterNames ? `\n\n==================================================\n**CRITICAL CHARACTER TAGGING RULE:**\nThe script features these specific main characters: [ ${characterNames} ].\n1. Whenever these characters are involved in a scene, you MUST use this exact bracket format in the image_prompt and video_prompt: {{Character: Name}}.\n2. Example: If the script mentions Roy, you MUST write {{Character: Roy}} in your prompt.\n3. NEVER replace their names with pronouns (he/she) or generic nouns (the man, the detective, the girl). You MUST use the bracketed name every single time they appear.\n==================================================` : '';

    systemData += finalCharacterLock;

    const userData = `**PHASE 4: TARGET SCRIPT**\n${scriptInstruction}`;

    return { systemData, userData };
};

export const getVideoDeconstructionPrompt = (videoUrl: string, availableVoices: string): string => {
    return `You are an expert video analyst with access to a vast knowledge base of internet content, including transcripts and summaries of many YouTube videos. A user has provided this URL: ${videoUrl}\n\nYour task is to act as if you have watched this video. Based on your knowledge of the video's content (including its likely transcript, dialogue, and visual elements), you must deconstruct it and provide a detailed analysis. Your goal is to be as faithful to the original video as possible.\n\nYou MUST generate a single, valid JSON object with the following structure. Do not include any other text, explanations, or markdown formatting outside of the JSON object.\n\n{\n  "reconstructedScript": "Reconstruct the full script or voiceover from the video as accurately as possible based on your training data. Include dialogue and narration. If you cannot find an exact transcript, generate a highly plausible script that captures the original's tone, pacing, and key points.",\n  "visualStyleAnalysis": {\n    "themes": ["An array of the most relevant themes from this list: ${themeOptions.join(', ')}"],\n    "modifiers": ["An array of the most fitting artistic modifiers from this list: ${styleModifiers.join(', ')}"],\n    "cameraAndEditing": "Describe the camera work (e.g., static shots, handheld, drone footage) and editing style (e.g., fast cuts, slow transitions, jump cuts)."\n  },\n  "voiceoverAnalysis": {\n    "detailedTone": "A professional description of the speaker's voice, tone, emotion, and pacing. Example: 'A male voice, mid-range, with a clear and enthusiastic tone. The pacing is quick, suitable for an engaging tech review.'",\n    "suggestedAiVoice": "Based on your analysis, suggest the single best AI voice's conceptualName from this list to replicate the style: ${availableVoices}"\n  },\n  "overallProductionAnalysis": "Provide a brief analysis of how the original video was likely produced. Mention camera quality, lighting, audio quality, and overall production value (e.g., high-budget documentary, casual vlog-style)."\n}`;
};

export const getVideoFileAnalysisPrompt = (availableVoices: string): string => {
    return `You are an expert video analyst. Analyze the provided video file.
            
            You MUST generate a single, valid JSON object with the following structure:
            {
              "reconstructedScript": "Provide a complete, word-for-word, line-by-line transcription of all spoken dialogue and narration from the video. The output MUST be in the original language spoken in the video. Do not summarize, do not describe, do not translate, and do not add any commentary. The output should be only the transcribed text.",
              "visualStyleAnalysis": {
                "themes": ["Select relevant themes from: ${themeOptions.join(', ')}"],
                "modifiers": ["Select relevant modifiers from: ${styleModifiers.join(', ')}"]
              },
              "voiceoverAnalysis": {
                "detailedTone": "Describe the speaker's tone and emotion.",
                "suggestedAiVoice": "Suggest the best matching voice from: ${availableVoices}"
              }
            }`;
};

export const getTtsPrompt = (text: string, config: TTSConfig, customPrompt: string, force: boolean, isDocumentaryMode: boolean = false): string => {
    const getSpeedDescription = (speed: number): string => {
        if (speed < 0.95) return 'slowly';
        if (speed > 1.05) return 'quickly';
        return 'at a normal pace';
    };

    const speedDescription = getSpeedDescription(config.speed);
    const selectedVoiceObject = ttsVoices.find(v => v.conceptualName === config.voice);
    const voiceCharacter = selectedVoiceObject ? selectedVoiceObject.use_case : `a ${config.tone.toLowerCase()} voice`;
    const styleDescription = customPrompt.trim() ? customPrompt.trim() : voiceCharacter;

    const documentaryDirective = isDocumentaryMode ? `
**DOCUMENTARY STYLE DIRECTIVE (CRITICAL):**
- Use ellipses (...) to indicate dramatic pauses between key phrases.
- Use hyphens (-) within words or after vowels to indicate a "dragged" or "mystic" pronunciation (e.g., "The ancient- secrets- of the- world...").
- Ensure the delivery is cinematic, deep, and mysterious.` : "";

    return `You are a world-class voice actor AI. Your goal is to deliver the following text naturally and professionally.

**Core Directives:**
1.  **Voice Style:** Embodiment: "${styleDescription}". This defines your tone and emotion.
2.  **Pacing:** The narration MUST be spoken ${speedDescription}. Maintain a natural, professional narrative pacing. Do NOT drag the tone, over-act, or create artificial pauses. Read fluently like a normal human.
3.  **Natural Intonation:** Use natural pitch variations and emphasis to make the delivery engaging and realistic. Avoid a robotic, monotone delivery.${documentaryDirective}

**Text to perform:**
---
"${text}"`;
};

export const getScriptFittingPrompt = (voiceoverScript: string, recommendedWords: number, mode: 'shorten' | 'expand' = 'shorten'): string => {
    if (mode === 'expand') {
        return `You are a creative script doctor. The user's script is too short for the target duration.
        
**GOAL:** EXPAND the script to reach approximately **${recommendedWords} words** without adding meaningless fluff.

**STRATEGY:**
1. **Elaborate on Scenes:** Add vivid sensory details (sight, sound, atmosphere). Describe the environment to set the mood.
2. **Expand Dialogue:** If characters are speaking, make the conversation more natural, emotional, and detailed.
3. **Internal Monologue:** Add internal thoughts or narration to provide depth to the characters' actions.
4. **Pacing:** Slow down the pacing by describing actions in detail.

**CRITICAL:** Keep the original plot, characters, and tone intact. Do not change the story, just tell it more richly.

**INPUT SCRIPT:**
---
${voiceoverScript}
---`;
    } else {
        return `You are a ruthless script editor. Your GOAL is to rewrite the script to fit a **STRICT WORD COUNT LIMIT of ${recommendedWords} words**.

**CRITICAL INSTRUCTIONS:**
1.  **CUT AGGRESSIVELY:** Remove all filler, repetitive sentences, and unnecessary details.
2.  **SUMMARIZE:** If the script is noticeably longer than ${recommendedWords} words (e.g., 50 mins trying to fit into 20 mins), you MUST summarize long scenes into concise paragraphs.
3.  **KEEP THE PLOT:** Keep the core narrative arc intact, but sacrifice depth for brevity.
4.  **FORMAT:** Return ONLY the raw script text. No intros.

**INPUT SCRIPT:**
---
${voiceoverScript}
---`;
    }
};

// Fix: Add missing getAiScriptProcessingPrompt function
export const getAiScriptProcessingPrompt = (script: string, options: ScriptProcessingOptions): string => {
    const instructions: string[] = [];

    if (options.autoClean) {
        instructions.push("- **Auto-Clean:** Remove any conversational filler (e.g., 'Here is the script'), speaker tags (e.g., 'NARRATOR:'), scene headings (e.g., 'INT. ROOM - DAY'), and action descriptions in parentheses (e.g., '(He walks to the door)').");
    }
    if (options.fastSpeak) { // Mapped to "Fast Speak" in UI
        instructions.push("- **Fast Speak:** To increase narration speed, remove any unnecessary commas and short pauses to create a faster, more breathless delivery. Do not remove content, only punctuation that slows down reading.");
    }
    // Logic: autoPauses is disabled in UI if documentaryStyle is on. It also shouldn't conflict with Fast Speak.
    if (options.autoPauses && !options.fastSpeak) {
// Fix: Corrected typo from 'Auto-pauses' to 'Auto-Pauses' for consistency.
        instructions.push("- **Auto-Pauses:** Add natural pause indicators like '...' after sentences to create a better rhythm for narration.");
    }
    if (options.emotionalCues) {
        instructions.push(`- **Emotional Cues (Voice Director Mode):** Act as an expert voice director. Analyze the script's emotional subtext and insert highly specific, actionable performance cues in brackets. Do not just use simple emotions. Provide nuanced direction on:
    - **Pacing:** [speaking faster], [slowing down for emphasis], [dramatic pause]
    - **Tone/Volume:** [whispering], [shouting], [softly], [with a hint of sarcasm], [curiously]
    - **Emotion:** [with growing excitement], [with a cracking voice], [sounding exhausted]`);
    }

    const finalInstructions = instructions.length > 0 ? `
**Processing Rules:**
Apply the following rules to the script:
${instructions.join('\n')}
` : '';

    return `You are a professional script editor for voiceovers. Your task is to process the following script based on a set of rules to prepare it for a Text-to-Speech engine.
${finalInstructions}
**CRITICAL:** Your response must be ONLY the processed script text. Do not add any introductory or concluding remarks.

**SCRIPT TO PROCESS:**
---
${script}
---`;
};

export const getScriptSceneBreakdownPrompt = (scriptText: string, imageCount: number, targetSceneDuration: number | null = 8): string => {
    const durationRule = targetSceneDuration 
        ? `Each scene MUST represent approximately ${targetSceneDuration} seconds of video. For a script of this length, aim for a total of ${imageCount} scenes to maintain the correct pacing.`
        : `Break it down into exactly ${imageCount} distinct, logical scenes.`;

    return `You are an expert in visual storytelling. Your task is to analyze the following script and break it down into logical scenes. 
    
    **SCENE BREAKDOWN RULE:**
    ${durationRule}
    
    For each scene, provide a concise but descriptive summary. The final output MUST be a valid JSON object with a single key "scenes" containing a JSON array of objects. Each object must have one key: "scene_description".\n\nHere is the script:\n---\n${scriptText}\n---`;
};

export const getIdeaToScriptPrompt = (scriptIdea: string, imageCount: number, duration: string, projectNiche?: string): string => {
    const nicheInstr = getNicheInstructions(scriptIdea);
    const nicheConfig = projectNiche ? getNicheConfig(projectNiche) : null;
    const scriptRules = nicheConfig?.scriptRules || '';
    
    const language = detectLanguage(scriptIdea);
    const languageRule = language === 'Bengali'
        ? `**STRICT LANGUAGE RULE:** The input idea is in Bengali. Your output MUST be in high-quality, natural-sounding Bengali ('Suddho Chalito'). DO NOT translate to English.`
        : `**STRICT LANGUAGE RULE:** The input is in English. Your output MUST be in English.`;

    let durationInstruction = `The script should be well-paced and engaging.`;
    if (duration && duration !== "0:0:0") {
        const [hStr, mStr, sStr] = duration.split(':');
        const hours = parseInt(hStr) || 0;
        const minutes = parseInt(mStr) || 0;
        const seconds = parseInt(sStr) || 0;
        
        let durationParts = [];
        if (hours > 0) durationParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes > 0) durationParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        if (seconds > 0) durationParts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
        const durationText = durationParts.join(', ');

        durationInstruction = `**DURATION TARGET:** The final script should be approximately ${durationText} long when read aloud at a normal pace. \n    - Please aim for a word count that roughly corresponds to this time (around 130-150 words per minute).\n    - It does not need to be exact, a tolerance of +/- 10% is perfectly acceptable.\n    - Adjust the pacing, level of detail, and number of scenes to naturally fit this timeframe.`;
    }
    
    const isNoVoiceover = scriptRules.toUpperCase().includes('NO VOICEOVER') || (nicheConfig?.dropdownName || '').toUpperCase().includes('NO VOICE');
    const activePersona = isNoVoiceover ? AUDIO_VISUAL_SCRIPTWRITER_PERSONA : MASTER_SCRIPTWRITER_PERSONA;
    const finalOutputRequirement = isNoVoiceover
        ? `**Output Requirement:**
    Write the full action and sound script now.
    **CRITICAL:** DO NOT write a continuous narrator voiceover or documentary-style narration. However, you MAY include short, in-scene character dialogue, shouts, or reactions (e.g., an owner talking to a pet, a pilot screaming) if it fits the story. Mix these sparse dialogues naturally with detailed visual actions, camera movements, and ambient sound/SFX cues. Format it cleanly.`
        : `**Output Requirement:**
    Write the full script now. It should be formatted clearly for a narrator/voiceover.
    **CRITICAL:** Do NOT use speaker labels (e.g. "Narrator:"). Do NOT use scene headings (e.g. "Scene 1"). Do NOT use music cues. Write ONLY the text to be spoken.`;

    const expertStrategy = isNoVoiceover
        ? `**Your Expert Strategy (Visual & Action Focus):**
    1. **The Hook (0-3s):** Start with a visually striking first scene or a highly satisfying macro action. No spoken introductions.
    2. **Pacing:** Focus on the rhythm of the physical actions, satisfying visual transitions, or sudden environmental changes.
    3. **Visual Scene Breakdown:** Write a script strictly broken down into logical visual scenes (approx ${imageCount} scenes).
    4. **Audio Synergy:** Ensure the ambient sounds [SFX] perfectly match the physical actions happening on screen.
    5. **Duration:** ${durationInstruction}`
        : `**Your Expert Strategy (The "Viral Formula"):**
    1.  **The Hook (0-3s):** You MUST start with a "Pattern Interrupt" or a burning question. No boring introductions.
    2.  **Retention:** Use "Ups and Downs" in emotion and pacing. Open curiosity loops.
    3.  **Visual Focus:** Write a script meant to be seen, broken down into logical visual scenes (approx ${imageCount} scenes).
    4.  **Facts:** If the niche involves history, religion (Islamic), or science, YOU MUST ENSURE THE FACTS ARE ACCURATE using your knowledge or the search tool provided.
    5.  **Simplicity:** Use simple, direct, conversational language.
    6.  **Duration:** ${durationInstruction}`;

    return `${activePersona}
    
    ${nicheInstr}
    ${scriptRules}
    ${languageRule}

    ${expertStrategy}

    **User's Idea:** "${scriptIdea}"
    
    ${finalOutputRequirement}
    
    Respond ONLY with the script text itself.`;
};

export const getCharacterExtractionPrompt = (script: string, projectNiche?: string): string => {
    const nicheConfig = projectNiche ? getNicheConfig(projectNiche) : null;
    const characterNicheRule = (nicheConfig && nicheConfig.characterExtractionRules) 
        ? `\n\n${nicheConfig.characterExtractionRules}` 
        : '';

    return `Analyze the following script to identify all key characters. Your response MUST be a valid JSON object. The JSON object should have one key: "characters". The "characters" key should contain an array of objects, one for each distinct character found. Each character object should have two keys: "name" (a string) and "description" (a string). 
    
CRITICAL: The "description" MUST BE EXTREMELY DETAILED (at least 2-3 sentences). Focus heavily on visual appearance as described in the script, including age, clothing, facial features, hair, and vibe. If the script doesn't provide visual details, you must infer a highly specific visual style based on their personality and role to ensure consistent AI image generation.

CRITICAL: You MUST explicitly identify and state the character's GENDER (Male/Female) and ETHNICITY/RACE (e.g., Asian, Black, Caucasian). Do not leave this ambiguous.${characterNicheRule}

CRITICAL PROP & ACTION BAN: While keeping the physical appearance and clothing details ultra-high quality and exact, you MUST NEVER include temporary actions (e.g., running, looking) or handheld props/objects (e.g., holding a compass, carrying a flashlight) in the description. The output MUST be a strictly static physical and sartorial profile.

If no characters with names or specific dialogue/actions are present, you MUST return an empty array for "characters". Do not invent characters from vague descriptions (e.g., 'a narrator'). Your response must be strictly {"characters": []} in this case.\n\nHere is the script:\n---\n${script}\n---`;
};

export const getImageStyleAnalysisPrompt = (): string => {
    const availableAngles = cameraAngles.map(a => a.value).join(', ');
    return `Analyze this image to identify its primary themes, artistic modifiers, and camera angles. Your response MUST be a single, comma-separated string of keywords. You MUST ONLY use keywords from these three lists, prioritizing the most dominant visual elements:\n- Themes: ${themeOptions.join(', ')}\n- Modifiers: ${styleModifiers.join(', ')}\n- Camera Angles: ${availableAngles}\n\nYour response should be only the keywords. Example response: Horror, Cinematic, 4K, Film Grain, Wide Shot`;
};

export const getCharacterImageAnalysisPrompt = (): string => {
    return `Analyze this image and provide a highly detailed, exhaustive visual description of the character. Break down every visible element comprehensively:
1. Facial Structure & Features: Jawline, cheekbones, nose shape, eye shape/color, eyebrows, wrinkles, facial hair, makeup.
2. Hair: Style, color, texture, length, how it falls.
3. Skin & Build: Tone, texture, specific marks/scars, overall body type and posture.
4. Clothing: Specific garment types, materials/fabrics, textures, colors, layering, fit, and the historical or cultural era/style it represents.
5. Accessories & Props: Headwear, jewelry, weapons, or items held.
6. Overall Demographics/Vibe: Apparent age, ethnicity, and general aura.
DO NOT BE CONCISE. Provide as much visual detail as possible. This description will be injected directly into prompt engines to ensure strict 100% character consistency across AI generations.`;
};

export const getDocumentaryStyleRewritePrompt = (script: string): string => {
    return `Act as a Professional Documentary Narrator/Scriptwriter.

Your Task: Rewrite the provided script to make it suitable for a high-retention TTS (Text-to-Speech) voiceover in a documentary style.

Target Voice Style: Deep, Slow-paced, and Breath-taking.

Formatting Rules (Strictly follow these 4 rules):

1.  **The "Pause" Rule:** Use ellipses (...) frequently between phrases, to create dramatic pauses. (approx 0.5s - 1s wait).
    *   *Action:* This mimics the narrator taking a deep breath and pausing for 0.5s - 1s.
    *   *Usage:* Insert (...) after almost every phrase.

2.  **The "Drag" Rule:** Use dashes ( - ) in the middle of sentences to slightly drag the tone.
    *   *Action:* This signals the voice to slightly "drag" or stretch the tone for suspense.

3.  **The "Punch" Rule:** Keep sentences short and end powerful statements with a period (.) to drop the pitch.
    *   *Action:* This drops the pitch and makes the statement sound final.

4.  **Structure:** Mix these elements. Start slow with pauses, drag the middle, and end with a punch.

**Strict Output Format Example:**
"That night... a verse was revealed...in Medina. It shook - the entire universe. Ayat al-Kursi. It is not just a verse... but the greatest shield... ever gifted - to mankind. Inside it... were such secrets... that even dark forces... were forced... to bow down."

**INSTRUCTIONS:**
- Do NOT change the core meaning or facts of the script.
- Do NOT summarize.
- You may enhance vocabulary to be more "epic" or "documentary-style" if needed to fit the tone.
- Apply the formatting rules aggressively.
- **CRITICAL:** Respond ONLY with the text to be spoken. DO NOT include intros like "Here is the script" or "Rewritten version:". Return RAW text only.

**SCRIPT TO REWRITE:**
"${script}"`;
};

export const getTranslationPrompt = (script: string, targetLanguage: 'English' | 'Bengali' | 'Hindi', contextInstruction?: string): string => {
    return `You are an expert, fluent translator. Your task is to translate the following script into natural-sounding ${targetLanguage}.

    **CRITICAL INSTRUCTIONS:**
    ${contextInstruction ? `\n    **Context:** ${contextInstruction}` : ''}
    1.  **Natural Phrasing:** Do not translate word-for-word. You MUST restructure sentences to sound natural and fluent in ${targetLanguage}. For example, the English "I eat rice" should be translated to Bengali as "আমি ভাত খাই", not "আমি খাই ভাত".
    2.  **Maintain Tone and Intent:** Preserve the original tone (e.g., serious, humorous, sad), pacing, and overall meaning.
    3.  **Formatting:** Keep the original paragraph structure and line breaks as much as possible.
    4.  **Raw Output:** Respond ONLY with the translated text. Do not add any conversational filler, notes, or explanations like "Here is the translation:".
    5.  **Maintain Length:** Do not summarize or shorten the text. The translation must have a similar length and level of detail as the original.

    SCRIPT TO TRANSLATE:
    ---
    ${script}
    ---`;
};

// --- V2 JSON-ONLY VISUAL REMAKE PROMPTS (NEW & SAFE) ---

/**
 * V2 - New, safe function for JSON-only workflow (full video analysis).
 */

// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
export const getVisualRemakeJSON_AnalysisPrompt = (
    projectNiche: string, 
    remakeType: 'long' | 'shorts' | 'hyper-detailed',
    startTime?: number,
    endTime?: number,
    extractCharacters: boolean = true,
    useNegativePrompt?: boolean,
    negativePrompt?: string,
    characterProfiles?: CharacterProfile[]
): string => {
    const nicheConfig = getNicheConfig(projectNiche);

    let sceneGenerationInstruction: string;
    switch (remakeType) {
        case 'long':
            sceneGenerationInstruction = `
- **TIME-SEGMENTATION RULE (CRITICAL - 24s Context Blocks):** You MUST analyze this video by conceptually breaking it into **24-second blocks** (e.g., 0-24s, 24-48s, etc.).
- **OUTPUT REQUIREMENT (3 Scenes per Block):** For each 24-second block, you MUST generate **three distinct scenes**, with each scene representing roughly 8 seconds of action within that block. A 60-second video MUST result in approximately 7-8 scenes total. Maintain narrative continuity across the blocks. This is a non-negotiable rule.`;
            break;
        case 'shorts':
            sceneGenerationInstruction = `
- **TIME-SEGMENTATION RULE (CRITICAL):** You MUST analyze this video in strict, sequential **4-second segments**.
- **OUTPUT REQUIREMENT:** For each 4-second segment of the video, you MUST generate exactly ONE scene object in the JSON array. Do not combine segments. A 60-second video MUST result in approximately 15 scenes. This is a non-negotiable rule.`;
            break;
        case 'hyper-detailed':
            sceneGenerationInstruction = `
- **TIME-SEGMENTATION RULE (CRITICAL):** You MUST analyze this video in strict, sequential **1 to 2-second segments**.
- **OUTPUT REQUIREMENT:** Create a new scene for every single visual change or camera cut. DO NOT combine or group any actions. A 60-second video should result in 30-60 scenes. This is for maximum detail and a shot-by-shot breakdown. This is a non-negotiable rule.`;
            break;
    }

    const timeBoundaryInstruction = (startTime !== undefined && endTime !== undefined) 
        ? `\n\n**CRITICAL TIME BOUNDARY:** You MUST ONLY analyze the portion of the video from **${startTime} seconds to ${endTime} seconds**. DO NOT analyze or output any scenes outside of this exact time window. Treat this specific time window as if it were the entire video for the purpose of this analysis.`
        : '';

    const validProfiles = (characterProfiles || []).filter(p => (p as any).bible_id || p.name?.trim() || p.userDescription?.trim() || p.aiDescription?.trim());
    const existingCharactersInstruction = validProfiles.length > 0
        ? `\n\n**EXISTING CHARACTERS IDENTIFIED SO FAR (CRITICAL CONTINUITY ACROSS CHUNKS):**\nThe following characters have already been identified in previous segments of this project:\n${validProfiles.map((p, idx) => {
            const cid = (p as any).bible_id || p.name?.trim() || `char_${idx + 1}`;
            const cleanDesc = ((p.userDescription || '') + ' ' + (p.aiDescription || '')).replace(/--- AI Video Analysis ---\s*/gi, '').trim();
            return `- character_id: "${cid}" -> ${cleanDesc}`;
        }).join('\n')}\nCRITICAL RULE: When any of these existing characters appear in the current video segment, you MUST reuse their exact 'character_id' (e.g., "${(validProfiles[0] as any).bible_id || validProfiles[0].name?.trim() || 'char_1'}") in 'character_bible' and 'characters_in_scene'. Only assign a new sequential ID (e.g., "char_${validProfiles.length + 1}") if a brand-new recurring character appears who is NOT in the list above.`
        : '';
        
    const finalNegative = (useNegativePrompt && negativePrompt && negativePrompt.trim()) 
        ? negativePrompt.trim() 
        : (nicheConfig?.defaultNegativePrompt || "watermark, text, logo, signature, low resolution, blurry, ugly, bad anatomy, deformed");

    const negativeInstruction = finalNegative 
        ? `\n**NEGATIVE PROMPT RULES (CRITICAL):**\nYou MUST STRICTLY AVOID describing any of the following concepts in your analysis and image prompt: "${finalNegative}".`
        : "";

    return `You are an expert film analyst, continuity supervisor, and prompt engineer. Your task is to deconstruct the provided video into a structured JSON format following a strict two-phase process.${timeBoundaryInstruction}${existingCharactersInstruction}${negativeInstruction}

**CORE DIRECTIVE (MAXIMUM PRIORITY):**
1.  **HYPER-LITERAL ANALYSIS:** You MUST describe exactly what is on screen, no matter how abstract or unusual (e.g., 'a transparent glass skeleton in a desert'). Do not interpret or 'correct' the visuals.
2.  **FOCUS ON TRANSFORMATION:** Pay extreme attention to how subjects change over time (e.g., 'veins appearing inside the glass body'). This transformation is the core of the story.
3.  **IGNORE ALL ON-SCREEN TEXT:** You are strictly forbidden from including any text overlays, watermarks, logos, or timestamps (e.g., "HOUR 1") in your analysis. Treat all text as metadata, NOT part of the visual scene. Your analysis must be purely visual.

---
**PHASE 1: MASTER ANALYSIS & CHARACTER BIBLE CREATION (CRITICAL)**
---
First, analyze the ENTIRE video ONE TIME to identify every distinct, recurring character. Create a "Character Bible" with an entry for each one. This bible is the single source of truth for character visuals. 
**STRICT REQUIREMENT:** For EVERY character, you MUST provide at least 3-4 sentences of EXTREME, EXHAUSTIVE physical detail. Break it down explicitly:
1. Facial structure, eye color, nose shape, skin texture, age, wrinkles, and facial hair.
2. Hair style, color, length, and texture.
3. Specific clothing layers, material types, colors, accessories, props, and overall build/posture.
DO NOT BE LAZY. "Old man in a dark robe" is a FAIL state. You must write a highly detailed paragraph.

---
**PHASE 2: TIME-LOCKED SEQUENTIAL ANALYSIS**
---
After creating the bible, you will now analyze the video conceptually based on the following time segmentation rule. **SUMMARIZING IS FORBIDDEN.**
${sceneGenerationInstruction}

For EACH scene you generate, you MUST perform these tasks:
1.  **Analyze Segment:** Describe what is happening visually ONLY within its time segment.
2.  **Apply Smart Character Logic:**
    - Look at the current segment. Is a character from your Phase 1 Bible present?
    - **IF AND ONLY IF** a character is present, you MUST include their unique ID from the bible in the 'characters_in_scene' array.
    - If no character is present, the 'characters_in_scene' array MUST be empty.
3.  **Generate Scene & Prompt:**
    - Create a concise 'scene_description' (the storyboard summary).
    - Synthesize all visual details (action, environment, and the visual description of any present characters from the bible) into a single, cohesive, cinematic paragraph for the 'master_prompt'. This prompt is for an AI image generator. DO NOT use labels or lists inside the 'master_prompt'.
4.  **Attribute Dialogue (IF ANY CHARACTER SPEAKS):**
    - If any character speaks in this segment (heard in audio, visible lip movement, or clearly inferable from context), you MUST attribute EVERY spoken line to its speaker using the character tag format: {{Character: Name}} says: "..." (example: {{Character: char_1}} says: "We have to go, now.").
    - Use the character's exact NAME when it is known (from the existing-characters list or the bible); otherwise use their character_id (e.g., char_1). NEVER write a bare name for the speaker — always the {{Character: ...}} tag.
    - Place the attributed dialogue naturally at the end of the 'master_prompt' paragraph.

**PHASE 3: JSON OUTPUT STRUCTURE (CRITICAL)**
- You MUST format your entire response as a single, valid JSON object.
- **DO NOT** use markdown code blocks (like \`\`\`).
- **DO NOT** add any introductory text. Your response must start with '{'.
CRITICAL REMINDER FOR MASTER_PROMPT: Maintain the standard baseline of ONE primary camera angle per scene. HOWEVER, you have full creative freedom to use multi-stage camera transitions (combo-moves) ONLY IF the scene's emotional or spatial narrative strictly demands it (e.g., descending from the sky into a room).

**CRITICAL CHARACTER RULE (GLOBAL - READ CAREFULLY):**
1. FOR NAMED/PROJECT CHARACTERS: If a character is explicitly listed in the project (e.g., Detective Roy), you MUST STRICTLY use ONLY their tag like '{{Character: Name}}'. DO NOT describe their age, gender, clothing, or facial features in the prompt. Our local system will auto-inject their profile later.
2. FOR UNNAMED/BACKGROUND CHARACTERS: Whenever you describe a generic or unnamed character (e.g., a waiter, a crowd member, a random passerby), you MUST explicitly state their gender (Male or Female) and approximate age. NEVER use ambiguous terms like 'a person' or 'someone'.

**REQUIRED JSON STRUCTURE:**
{
${extractCharacters ? `  "character_bible": [
    {
      "character_id": "char_1",
      "visual_description": "An EXHAUSTIVE, high-definition physical description of the character MINIMUM 3 SENTENCES (e.g., 'A 45-year-old male with a sharp jawline, short silver hair styled neatly, and piercing emerald green eyes. He has a small scar on the left cheekbone and weather-beaten skin with deep laugh lines. He is wearing a fitted charcoal wool suit with a crimson unbuttoned silk shirt, featuring a silver chain necklace, and a heavy leather trench coat over the top...'). Describe clothing, facial features, hair, age, gender, build, and distinctive marks in extreme detail to guarantee 100% consistency."
    }
  ],` : ''}
  "scenes": [
    {
      "scene_number": 1,
      "characters_in_scene": ["char_1"],
      "camera_angle": "Wide Shot / Close-up / etc. (Decided by AI based on the scene)",
      "scene_description": "A short, clear summary of what happens in this scene.",
      "master_prompt": "A single, synthesized, cinematic paragraph combining all visual details. If char_1 is present, it MUST include 'A golden skeleton with infant proportions, glowing blue eyes, intricate bone details.' along with the scene's action and environment."
    }
  ]
}

**PROJECT CONTEXT:**
- **Project Niche:** ${projectNiche}
- **Visual Style Rules:**
${nicheConfig.visualRules}

Analyze the provided video file and generate the JSON output.`;
};


/**
 * V2 - New, safe function for text-only workflow (frame-based analysis).
 * This function is refactored to incorporate the character bible and other settings for OpenRouter.
 */

export const getVisualRemakeJSON_FrameAnalysisPrompt = (
    frameCount: number,
    projectNiche: string,
    remakeType: 'long' | 'shorts' | 'hyper-detailed',
    characterProfiles: CharacterProfile[],
    useNegativePrompt?: boolean,
    negativePrompt?: string,
    previousContext?: string,
    incDialogue?: boolean,
    incAmbient?: boolean,
    incSfx?: boolean
): string => {
    const nicheConfig = getNicheConfig(projectNiche);

    // --- Logic from index.tsx (Character Bible) ---
    let characterBible = '';
    const hasCharacterProfiles = characterProfiles.some(p => p.name?.trim() || p.userDescription.trim() || p.aiDescription.trim());
    if (hasCharacterProfiles) {
        const profileDescriptions = characterProfiles.map((p, index) => {
            const shortHint = (p.userDescription + " " + p.aiDescription).trim().split(/[.!?]/).slice(0, 2).join('. ') + '.';
            return `- Character Name: ${p.name?.trim() || `Character ${index + 1}`}\n  Visual Hint: ${shortHint}`;
        }).join('\n');
        characterBible = `**AVAILABLE CHARACTERS (SEE FIRST, MATCH LATER):**
You have been provided with an 'Available Characters' list containing exact Names and Visual Hints. 
1. **Match Before Use:** When you visually recognize a character in the video frames that matches a description from this list, you MUST NEVER invent generic names like 'Actor 1', 'char_1', or write their visual description manually.
2. **Output Tag Only:** Instead, ONLY output their exact name enclosed in double curly brackets with the Character prefix inside your scene description, like this: \`{{Character: Exact_Name_From_List}}\` or \`{{Exact_Name_From_List}}\`.

${profileDescriptions}`;
    }

    const logicRule = `**DIRECTOR'S LOGIC (CRITICAL):**
- **If a frame contains a character from the list:** Seamlessly describe the scene and output ONLY their exact name tag (e.g., \`{{Character: Exact_Name_From_List}}\`) in the action. Do not write their visual description manually.
- **If a frame contains NO character from the list:** Simply describe the environment, action, and mood. DO NOT mention any characters.`;

    // --- Instruction based on remakeType for paragraph output ---
    let sceneDensityInstruction: string;
    switch (remakeType) {
        case 'shorts':
            sceneDensityInstruction = `Focus on creating a punchy, concise description that captures the key action of the frames.`;
            break;
        case 'hyper-detailed':
            sceneDensityInstruction = `Be extremely literal and detailed. Describe every small visual change you see across the frames.`;
            break;
        case 'long':
        default:
            sceneDensityInstruction = `Synthesize the frames into a cohesive description of a complete action or moment.`;
            break;
    }
    
    const finalNegative = (useNegativePrompt && negativePrompt && negativePrompt.trim()) 
        ? negativePrompt.trim() 
        : (nicheConfig?.defaultNegativePrompt || "watermark, text, logo, signature, low resolution, blurry, ugly, bad anatomy, deformed");

    const negativeInstruction = finalNegative 
        ? `**NEGATIVE PROMPT RULES (CRITICAL):**\nYou MUST STRICTLY AVOID describing any of the following concepts in your generated paragraph: "${finalNegative}".\n`
        : "";

    let audioInferenceRule = "";
    if (incDialogue || incAmbient || incSfx) {
        const requestedAudio = [];
        if (incAmbient) requestedAudio.push("ambient environmental sounds");
        if (incSfx) requestedAudio.push("action-triggered sound effects (SFX)");
        if (incDialogue) requestedAudio.push("dialogue or spoken words (if any character is speaking)");
        
        audioInferenceRule = `**AUDIO INFERENCE RULE:** While analyzing the video frames, do not just describe the visuals. You MUST also infer and predict the audio landscape of the scene: ${requestedAudio.join(", ")}. Include this naturally at the end of your description.${incDialogue ? `\n\n**DIALOGUE ATTRIBUTION RULE (CRITICAL):** If any dialogue is present, you MUST attribute EVERY spoken line to its speaker using the character tag format: {{Character: Name}} says: "..." (example: {{Character: Emily Carter}} says: "We have to go, now."). Use the exact name from the Available Characters list when the speaker matches a listed character; otherwise use their character_id (e.g., char_1). NEVER write a bare name for the speaker — always the {{Character: ...}} tag, so the local system can inject the speaker's full visual description.` : ''}`;
    }

    const styleBlendingRule = `**STYLE BLENDING RULE (CRITICAL):** Extract the exact camera angles, physical actions, and core locations strictly from the video frames. THEN, coat these visual facts with the Art Style, Textures, and Atmosphere defined in the Project Niche. DO NOT invent niche-specific actions, camera moves, or locations that are not physically present in the frames.`;

    const continuityInstruction = previousContext 
        ? `\n**SLIDING WINDOW CONTEXT & PHYSICAL CONTINUITY TEST (CRITICAL):**
PREVIOUS_VISUAL_STATE: "${previousContext}"
You are processing a chunked sequence of a video. Compare the new image frames with the PREVIOUS_VISUAL_STATE:
- **Same Location/Time:** If the new frames show the exact same environment and time as the PREVIOUS_VISUAL_STATE, maintain seamless physical continuity. Continue describing the action fluidly without repeating the exact previous action.
- **Smart Memory Flush (Time Jump / New Location):** If the frames clearly show a different location or a time jump, you MUST completely flush the previous environmental memory. Seamlessly transition your description into the NEW environment based ONLY on what you see in the current frames. Do not force previous visual elements into the new scene.\n` 
        : '';

    // --- Combine everything into the final prompt ---
    const masterPrompt = `You are a world-class film analyst and cinematic prompt engineer. Your task is to analyze a sequence of image frames and synthesize them into ONE SINGLE, highly detailed, cinematic paragraph.

${continuityInstruction ? `${continuityInstruction}\n` : ''}${characterBible ? `${characterBible}\n` : ''}
**PROJECT NICHE & STYLE RULES (Project Niche: ${projectNiche}):**
You MUST adhere to the following core visual rules for this project:

${nicheConfig.visualRules}

${styleBlendingRule}

${logicRule}

**PACING & DENSITY RULE (Based on Video Type: ${remakeType}):**
${sceneDensityInstruction}

${audioInferenceRule ? `${audioInferenceRule}\n` : ''}${negativeInstruction ? `${negativeInstruction}\n` : ''}
**FINAL TASK & OUTPUT FORMAT:**
Now, analyze the following ${frameCount} image frames. Based on ALL the rules above, write ONE SINGLE cinematic paragraph describing the scene.
- Your response MUST be ONLY the final paragraph.
- Enclose your final single paragraph strictly inside <cinematic_scene> and </cinematic_scene> tags.
- DO NOT use intros, labels, bullet points, or any text other than the paragraph itself.`;

    return masterPrompt;
};

export const getMasterOutlinerPrompt = (scriptIdea: string, durationText: string, projectNicheRules: string, language: string, calculatedChapters: number): string => {
    const languageRule = language === 'Bengali'
        ? `**STRICT LANGUAGE RULE:** Your generated summary and chapter details MUST be in high-quality Bengali ('Suddho Chalito').`
        : `**STRICT LANGUAGE RULE:** Your generated output MUST be in English.`;

    return `You are an Elite Master Storyboard Architect. Your task is to analyze the user's idea and generate a structured "Story Outline & Memory Blueprint" for a long-form video script.

**CORE RULES (NICHE INJECTION):**
You must strictly align the storyline with these project niche rules:${projectNicheRules}

**TARGET DURATION & PACING:**
The user wants the final script to be approximately ${durationText} long. 
- Standard speaking rate is 130-150 words per minute.
- **CRITICAL MATH LIMIT:** You MUST strictly divide the story into EXACTLY ${calculatedChapters} chapters. Do NOT create more or fewer chapters.${languageRule}

**STRICT JSON OUTPUT FORMAT:**
Return ONLY a valid JSON object. Do not wrap it in markdown block (like \`\`\`json). The JSON schema must perfectly follow this:
{
  "global_summary": "A comprehensive 4-5 sentence summary of the entire story from beginning to end. This will act as the global memory for the AI.",
  "total_chapters": ${calculatedChapters},
  "chapters": [
    {
      "chapter_number": 1,
      "chapter_title": "Title of the chapter",
      "focus_and_events": "A detailed paragraph explaining what happens in this chapter, character actions, narrative events, and how it transitions to the next."
    }
  ]
}

**USER'S STORY IDEA:**
"${scriptIdea}"`;
};

export const getSmartChunkWriterPrompt = (
    chapterTitle: string, 
    chapterFocus: string, 
    globalSummary: string, 
    previousChunkContext: string, 
    projectNicheRules: string, 
    language: string, 
    targetWordCount: number,
    isNoVoiceover: boolean,
    isFinalChapter: boolean
): string => {
    const languageRule = language === 'Bengali'
        ? `\n**STRICT LANGUAGE RULE:** The script MUST be written in natural, high-quality Bengali ('Suddho Chalito').`
        : `\n**STRICT LANGUAGE RULE:** The script MUST be written in English.`;

    let contextInstruction = "This is the BEGINNING of the story. Hook the audience immediately.";
    if (previousChunkContext) {
        contextInstruction = `**LOCAL MEMORY (STITCHING POINT):** Here is the exact ending of the previous chapter: "...${previousChunkContext}". \nINSTRUCTION: Continue the story seamlessly from this exact point. Do NOT repeat the previous lines.`;
    }

    let conclusionInstruction = "";
    if (isFinalChapter) {
        conclusionInstruction = `\n**CRITICAL: THIS IS THE FINAL CHAPTER!** You MUST conclude the story gracefully within this chunk. Resolve the main conflict and deliver the moral or ending perfectly. DO NOT leave any cliffhangers.`;
    }

    // isNoVoiceover is now received as a parameter directly from the engine
    const finalOutputRequirement = isNoVoiceover
        ? `**CRITICAL OUTPUT REQUIREMENT:** DO NOT write a continuous narrator voiceover. Write detailed visual actions, camera movements, and ambient sound/SFX cues. You MAY use [Visual: ...] and [Audio: ...] tags. Short in-scene dialogue is allowed.`
        : `**CRITICAL OUTPUT REQUIREMENT:** Write ONLY the pure narration and dialogue. Do NOT use scene headings. Do NOT use [Visual: ...] or [Audio: ...] tags. The output must be 100% ready for Text-to-Speech (TTS).`;

    return `You are an Elite Scriptwriter. Your task is to write ONE specific chapter of a larger long-form video script. 

**GLOBAL MEMORY (DO NOT DEVIATE):**
Here is the core storyline: "${globalSummary}"

**YOUR CURRENT ASSIGNMENT:**
Write the script for Chapter: "${chapterTitle}"
Chapter Focus: "${chapterFocus}"
Target Length: Approximately ${targetWordCount} words.

**NICHE RULES & TONE:**
${projectNicheRules}

**FLOW & CONTINUITY:**
${contextInstruction}${conclusionInstruction}${languageRule}

${finalOutputRequirement}
- Do NOT output JSON. Do NOT output chapter titles. Just write the pure script for this chunk.

**🚨 THE LAST MILE RULE (CRITICAL RE-CHECK):**
Before generating the output, deeply re-read the "Niche Rules & Tone" and the "Global Memory" above. Ensure your script tone exactly matches the required archetype. 
**ANTI-THINKING / REASONING BAN:** DO NOT output your internal chain-of-thought, thinking process, drafting notes, or word count calculations. Do NOT output <think> tags. Provide ONLY the final production-ready spoken words directly.
**STRICT WORD LIMIT:** You MUST write exactly around ${targetWordCount} words. DO NOT EXCEED ${targetWordCount + 100} words under any circumstances. Overwriting will completely ruin the video pacing and duration!`;
};

