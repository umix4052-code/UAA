import { SceneResult, CharacterProfile } from './types';
import { getNicheConfig } from './niche-directives';
import { VideoPromptConfig } from './prompt-engine';

// 🚨 CRITICAL ARCHITECTURAL LOCK: Visual Remake Engine V2 (Core Logic) - STRICT WARNING: DO NOT MODIFY, OVERRIDE, OR REFACTOR THIS LOGIC WITHOUT EXPLICIT ARCHITECTURAL RISK ASSESSMENT AND USER CONFIRMATION.
export const getVisualRemakeVideoPrompt_V2 = (
    res: SceneResult, 
    characterProfiles: CharacterProfile[],
    config: VideoPromptConfig,
    globalSummary?: string,
    previousVisualState?: any,
    incDialogue: boolean = true,
    incAmbient: boolean = true,
    incSfx: boolean = true
): string => {
    const { videoModel, videoPromptBasis, includeDialogue, includeAmbient, includeSfx, cameraAngle, projectNiche, useNegativePrompt, negativePrompt } = config;

    // Filter characters strictly to ONLY those explicitly mentioned in the scene's character list.
    let characterInstruction = "No specific characters in this scene.";
    const hasCharactersInSceneProp = 'characters_in_scene' in res;
    const charactersInScene = (res as any).characters_in_scene || [];

    if (hasCharactersInSceneProp && Array.isArray(charactersInScene) && charactersInScene.length > 0) {
        const sceneCharacters = characterProfiles.filter(p =>
            charactersInScene.includes((p as any).bible_id || '') || charactersInScene.includes(p.id)
        );

        if (sceneCharacters.length > 0) {
            characterInstruction = sceneCharacters.map(p =>
                `\n- Character: \n  - User Hint: ${(p.userDescription || '').trim()}\n  - AI Analysis: ${(p.aiDescription || '').trim()}`
            ).join('');
        }
    }
    
    const audioCues = [];
    if (includeDialogue) audioCues.push('Dialogue');
    if (includeAmbient) audioCues.push('Ambient');
    if (includeSfx) audioCues.push('SFX');
    
    const cameraFinal = Array.isArray(cameraAngle) ? cameraAngle.join(', ') : cameraAngle;

    // --- CINEMATIC MOTION & PACING ENGINE ---
    const description = (res.scene_description || res.image_prompt || '').toLowerCase();
    let motionInstructions: string[] = [];

    const nicheConfig = projectNiche ? getNicheConfig(projectNiche) : null;
    
    if (nicheConfig && nicheConfig.forceFixedCamera) {
        motionInstructions = [
            'Absolutely locked static camera, zero camera displacement', 
            'Dynamic pacing: Starts with hyper-lapse fast-forward environmental evolution, then smoothly transitions into normal real-time speed', 
            'Cinematic transition: Start the scene emerging from a heavy blur (fade-in), and end the scene fading into a deep Gaussian blur and black screen (fade-out) to prevent end-frame glitches'
        ];
    } else if (nicheConfig && nicheConfig.defaultThemes && nicheConfig.defaultThemes.includes('Found Footage')) {
        if (/\b(running|chasing|driving fast|explosion|fighting|sprinting|flying quickly|battle|war|action sequence)\b/.test(description)) {
            motionInstructions.push('frantic first-person POV dash', 'extreme shaky cam', 'motion blur', 'panic zoom');
        } else if (/\b(creeping|sneaking|hiding|peeking|lurking|tense|suspense|shadows)\b/.test(description)) {
            motionInstructions.push('slow, trembling first-person POV creeping', 'heavy breathing handheld shake', 'rack focus to build suspense');
        } else {
            motionInstructions.push('steady first-person POV', 'subtle handheld camera movement');
        }
    } else {
        if (/\b(running|chasing|driving fast|explosion|fighting|sprinting|flying quickly|battle|war|action sequence)\b/.test(description)) {
            motionInstructions.push('fast-paced tracking shot', 'shaky cam effect', 'quick cuts', 'motion blur');
        }
        if (/\b(crying|sad|thinking|slowly walking|looking at|meditating|praying|contemplating|gazing|sorrow|grief|lonely)\b/.test(description)) {
            motionInstructions.push('slow-dolly zoom in', 'lingering shot', 'soft focus', 'static shot with subtle focus pull', 'subtle character breathing', 'gentle robe rustle in the breeze', 'slight shift in facial expression');
        }
        if (/\b(reveals|discovers|panoramic|vast|cityscape|landscape|epic view|mountains|ocean)\b/.test(description)) {
            motionInstructions.push('epic wide shot', 'slow crane shot revealing the scene', 'sweeping drone footage');
        }
        if (/\b(creeping|sneaking|hiding|peeking|lurking|tense|suspense|shadows)\b/.test(description)) {
            motionInstructions.push('slow, tense push-in', 'use of shadows and low-key lighting', 'rack focus to build suspense');
        }
    }

    const uniqueInstructions = [...new Set(motionInstructions)];

    const lightingInstructions: string[] = [];
    if (/\b(dark|night|rain|blood|fire|ember|battle|storm|gloomy|apocalyptic|chiaroscuro|moonlight|smoldering|war|fighting)\b/.test(description)) {
        lightingInstructions.push('dramatic high-contrast chiaroscuro lighting', 'dark atmospheric shadows', 'suppress daytime or bright golden hour illumination');
    } else if (/\b(sunrise|morning|golden hour|serene|peaceful|holy|divine light|radiant)\b/.test(description)) {
        lightingInstructions.push('soft golden hour glow', 'luminous atmospheric lighting');
    }
    const uniqueLighting = [...new Set(lightingInstructions)];
    const lightingDescription = uniqueLighting.length > 0 ? "Incorporate these specific lighting rules: " + uniqueLighting.join(', ') + "." : "Standard cinematic lighting fitting the scene.";

    let globalAudioInstruction = "";
    if (includeDialogue || includeAmbient || includeSfx) {
        const audioParts = [];
        if (includeDialogue) audioParts.push("Dialogue: <extracted/inferred dialogue if enabled>");
        if (includeAmbient) audioParts.push("Ambient: <scene ambient sounds if enabled>");
        if (includeSfx) audioParts.push("SFX: <action sound effects if enabled>");
        
        const nicheAudioDNA = (nicheConfig && nicheConfig.audioRules) ? `\n\n**NICHE SPECIFIC AUDIO DNA:**\n${nicheConfig.audioRules}` : "";
        
        globalAudioInstruction = `\n\n**GLOBAL AUDIO DIRECTIVE:**\nAt the very end of your generated video prompt, you MUST append the following exact tag:\n[Audio Directives: ${audioParts.join(" | ")}] (replace the <...> placeholders with actual inferred sounds).${nicheAudioDNA}`;
    }

    const globalStoryInstruction = globalSummary 
        ? `\n\n**GLOBAL STORY THEME:**\n${globalSummary}` 
        : '';
        
    const previousVisualInstruction = previousVisualState 
        ? `\n\n**PREVIOUS SCENE VISUALLY ENDED WITH:**\n${JSON.stringify(previousVisualState)}` 
        : '';

    switch (videoModel) {
        case 'Veo 3.1':
            const sceneDescription = res.scene_description || "Not specified.";
            const visualReference = res.image_prompt || "Not specified.";
            const audioDescription = audioCues.length > 0 
                ? `The scene's audio should include cues for: ${audioCues.join(', ')}.` 
                : "No specific audio cues.";
            const motionDescription = uniqueInstructions.length > 0
                ? `Incorporate these cinematic techniques: ${uniqueInstructions.join(', ')}.`
                : "Standard, smooth camera movement.";

            const characterNames = characterProfiles.map(p => p.name?.trim()).filter(Boolean).join(', ');
            const finalCharacterLock = characterNames ? `
==================================================
**CRITICAL CHARACTER TAGGING RULE:**
The script features these specific main characters: [ ${characterNames} ].
1. Whenever these characters are involved in a scene, you MUST use this exact bracket format in the video prompt: {{Character: Name}}.
2. Example: If the script mentions Roy, you MUST write {{Character: Roy}} in your prompt.
3. NEVER replace their names with pronouns (he/she) or generic nouns (the man, the detective, the girl). You MUST use the bracketed name every single time they appear.
==================================================` : '';

            // Enhance prompts with Niche & Negative constraints
            const nicheConfigObj = projectNiche ? getNicheConfig(projectNiche) : null;
            const nicheInstruction = (nicheConfigObj && nicheConfigObj.lastMileVideoRules) 
                ? `7. **Niche Constraint:** ${nicheConfigObj.lastMileVideoRules}` 
                : "";
                
            const negativeInstruction = (useNegativePrompt && negativePrompt && negativePrompt.trim())
                ? `8. **Negative Prompts:** YOU MUST STRICTLY AVOID any mention, implication, or visual depiction of the following concepts: "${negativePrompt.trim()}".`
                : "";

            let audioInferenceRule = "";
            if (incDialogue || incAmbient || incSfx) {
                const requestedAudio = [];
                if (incAmbient) requestedAudio.push("ambient environmental sounds");
                if (incSfx) requestedAudio.push("action-triggered sound effects (SFX)");
                if (incDialogue) requestedAudio.push("dialogue or spoken words");
                
                audioInferenceRule = `**AUDIO & DIALOGUE INTEGRATION:** 
The cinematic scene descriptions provided below ALREADY contain embedded audio cues (ambient, SFX, or dialogue). 
You MUST naturally weave these exact audio elements into your final video generation prompt so the video model understands what sounds/dialogue are occurring. Include them fluidly without using bullet points.`;
            }

            const masterPrompt = `You are an expert AI video generation prompt engineer.
Your task is to take a specific cinematic scene description (along with the previous scene's context for visual continuity) and expand it into ONE highly detailed, fluid Video Generation Prompt.

**PROJECT NICHE & STYLE RULES:**
You MUST ensure the final prompt adheres to this project's visual style:
${nicheConfig ? nicheConfig.visualRules : "No specific visual rules."}

**SYNTHESIS RULES:**
1. **Flow & Continuity:** Transform the current scene description into a single, continuous, cinematic narrative paragraph. Do not use bullet points. Ensure the action and environment flow perfectly and logically from the previous scene's visual state.
2. **Detail Retention:** Keep the specific camera movements (pans, tilts, tracking), physical actions, and character details mentioned in the input scenes.
${audioInferenceRule ? `3. ${audioInferenceRule}\n` : ''}
**FINAL TASK & OUTPUT FORMAT:**
Synthesize the provided CURRENT SCENE DESCRIPTION into ONE fluid video generation prompt, maintaining strict continuity with any previous scene context provided. 
- Your response MUST be ONLY the final synthesized paragraph. 
- DO NOT use intros, labels, bullet points, or scene numbers.

**CURRENT SCENE DESCRIPTION TO SYNTHESIZE:**
${sceneDescription}
${visualReference}
${lightingDescription}
${motionDescription}
${cameraFinal}
${characterInstruction}
${nicheInstruction}
${negativeInstruction}
${finalCharacterLock}
${globalStoryInstruction}
${previousVisualInstruction}`;

            return masterPrompt;

        default:
            const characterInfo = characterInstruction 
                ? `\n\nAVAILABLE CHARACTERS: ${characterInstruction}\n\nCRITICAL RULE: First, read the scene description. ONLY include a character's visual details if they logically belong in this specific scene. DO NOT force all characters into the scene. DO NOT write raw IDs like 'char_1' in the final prompt.`
                : "";
            const motionInfo = uniqueInstructions.length > 0 ? ` Use these camera techniques: ${uniqueInstructions.join(', ')}.` : "";
            const cameraInfo = cameraFinal ? ` The shot type should be: ${cameraFinal}.` : "";
            const audioInfo = audioCues.length > 0 ? ` Include audio for ${audioCues.join(', ')}.` : "";
            const nicheConfigRef = projectNiche ? getNicheConfig(projectNiche) : null;
            const nicheInfoStr = (nicheConfigRef && nicheConfigRef.lastMileVideoRules) 
                ? `\n\nCRITICAL NICHE CONSTRAINT: ${nicheConfigRef.lastMileVideoRules}` 
                : "";
            const negativeInfoStr = (useNegativePrompt && negativePrompt && negativePrompt.trim()) ? `\n\nNEGATIVE PROMPT (AVOID THESE): ${negativePrompt.trim()}` : "";
            const lightingInfoStr = uniqueLighting.length > 0 ? ` ${lightingDescription}` : "";
            
            return `Create a detailed, cinematic video prompt in a single paragraph. The scene is: ${res.scene_description}. The overall visual style is based on this image prompt: "${res.image_prompt}".${lightingInfoStr}${motionInfo}${cameraInfo}${audioInfo}${characterInfo}${nicheInfoStr}${negativeInfoStr}${globalStoryInstruction}${previousVisualInstruction}${globalAudioInstruction}`;
    }
};
