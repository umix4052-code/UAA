// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
import { SceneResult, CharacterProfile } from './types';
import { getNicheConfig } from './niche-directives';

// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
// 🚨 CRITICAL ARCHITECTURAL LOCK: Prompt Engine V1 (Post-processing injection) - STRICT WARNING: DO NOT MODIFY, OVERRIDE, OR REFACTOR THIS LOGIC WITHOUT EXPLICIT ARCHITECTURAL RISK ASSESSMENT AND USER CONFIRMATION.
export const injectPostProcessingStyles = (
    scenes: any[],
    projectNiche: string,
    selectedThemes: string[],
    selectedModifiers: string[]
) => {
    const nicheConfig = getNicheConfig(projectNiche);
    const coreNicheStyle = nicheConfig.dropdownName || projectNiche;

    const activeThemes = selectedThemes && selectedThemes.length > 0 ? selectedThemes : (nicheConfig?.defaultThemes || []);
    const activeModifiers = selectedModifiers && selectedModifiers.length > 0 ? selectedModifiers : (nicheConfig?.defaultModifiers || []);

    const themesStr = activeThemes && activeThemes.length > 0 ? activeThemes.join(', ') : 'None';
    
    const darkMoodKeywords = ['dark', 'night', 'rain', 'blood', 'fire', 'ember', 'battle', 'storm', 'gloomy', 'apocalyptic', 'chiaroscuro', 'moonlight', 'smoldering', 'war', 'fighting'];
    const conflictingLightingModifiers = ['golden hour lighting', 'sunny', 'daylight', 'bright'];

    return scenes.map((scene) => {
        const cameraAngle = scene.camera_angle || 'Default';
        
        // Smart Bypass: Check for dark/moody context in the scene
        const sceneContext = ((scene.scene_description || '') + ' ' + (scene.image_prompt || '') + ' ' + (scene.video_prompt || '')).toLowerCase();
// 🚨 CRITICAL ARCHITECTURAL LOCK: Prompt Engine V1 (Golden Hour Stripping) - STRICT WARNING: DO NOT MODIFY, OVERRIDE, OR REFACTOR THIS LOGIC WITHOUT EXPLICIT ARCHITECTURAL RISK ASSESSMENT AND USER CONFIRMATION.
        const isDarkMood = darkMoodKeywords.some(keyword => sceneContext.includes(keyword));
        
        let currentModifiers = activeModifiers || [];
        if (isDarkMood) {
            // Strip out conflicting daylight modifiers, keep the rest intact
            currentModifiers = currentModifiers.filter(mod => 
                !conflictingLightingModifiers.some(daylightMod => mod.toLowerCase().includes(daylightMod))
            );
        }
        
        const modifiersStr = currentModifiers.length > 0 ? currentModifiers.join(', ') : 'None';
        const prefix = `[Style: ${coreNicheStyle}] [Themes: ${themesStr}] [Modifiers: ${modifiersStr}] [Camera: ${cameraAngle}]`;
        
        let newImgPrompt = scene.image_prompt || '';
        const isImgError = newImgPrompt.toLowerCase().startsWith('error:') || newImgPrompt.includes('AI failed to generate');
        if (newImgPrompt && !newImgPrompt.startsWith('[Style:') && !isImgError) {
            newImgPrompt = `${prefix} - ${newImgPrompt}`;
        }
        
        let newVidPrompt = scene.video_prompt || '';
        const isVidError = newVidPrompt.toLowerCase().startsWith('error:') || newVidPrompt.includes('AI failed to generate') || scene.videoPromptStatus === 'failed';
        if (newVidPrompt && !newVidPrompt.startsWith('[Style:') && !isVidError) {
            newVidPrompt = `${prefix} - ${newVidPrompt}`;
        }
        
        return {
            ...scene,
            image_prompt: newImgPrompt,
            video_prompt: newVidPrompt
        };
    });
};


// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
export const injectCharacterDescriptions = (scenes: any[], characterProfiles: CharacterProfile[]) => {
    if (!characterProfiles || characterProfiles.length === 0) return scenes;
    
    // Check if there are profiles with actual descriptions
    const hasValidProfiles = characterProfiles.some(p => p.name?.trim() || p.userDescription?.trim() || p.aiDescription?.trim());
    if (!hasValidProfiles) return scenes;

    return scenes.map((scene) => {
        // CRITICAL: Set MUST be inside the loop so EVERY scene gets the character description at least once!
        // 🚨 CRITICAL ARCHITECTURAL LOCK: Prompt Engine V1 (Character Set Scope) - STRICT WARNING: DO NOT MODIFY, OVERRIDE, OR REFACTOR THIS LOGIC WITHOUT EXPLICIT ARCHITECTURAL RISK ASSESSMENT AND USER CONFIRMATION.
        const seenCharacters = new Set<string>(); 
        const imgText = scene.image_prompt || '';
        const vidText = scene.video_prompt || '';
        
        const replaceNames = (text: string) => {
            if (!text) return text;
            
            // শুধুমাত্র ডাবল কার্লি ব্র্যাকেট ট্যাগ {{Character: Name}} বা {{Name}} রিপ্লেস হবে
            const bracketRegex = /\{\{(?:Character:\s*)?([^}]+)\}\}/gi;

            return text.replace(bracketRegex, (match, charName) => {
                const cleanName = charName.replace(/[`'"]/g, '').trim();
                const cleanNameLower = cleanName.toLowerCase();
                const matchedProfile = characterProfiles.find(p => 
                    (p.name && p.name.replace(/[`'"]/g, '').trim().toLowerCase() === cleanNameLower) ||
                    (p.bible_id && p.bible_id.toLowerCase() === cleanNameLower)
                );
                
                if (matchedProfile) {
                    let desc = (matchedProfile.userDescription?.trim() || "") + " " + (matchedProfile.aiDescription?.trim() || "");
                    desc = desc.replace(/--- AI Script Analysis ---\s*/gi, '')
                               .replace(/Description:\s*/gi, '')
                               .replace(/--- AI Video Analysis ---\s*/gi, '')
                               .replace(/Character from Video\s*\([^)]*\)\s*/gi, '').trim();
                    
                    // Remove starting name and "is a" / "is" to avoid "Name, Name is a..."
                    const escapedName = cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const nameRegex = new RegExp('^([\\s,\\`\'"]*' + escapedName + '[\\s,\\`\'"]*(?:is\\s+a|is\\s+an|is|are)?\\s*[,:]?\\s*)', 'i');
                    desc = desc.replace(nameRegex, '').trim();
                    desc = desc.replace(/^[,:]\s*/, '').trim();
                    
                    if (matchedProfile.name) {
                        if (seenCharacters.has(cleanNameLower)) return cleanName;
                        seenCharacters.add(cleanNameLower);
                        return desc ? `${cleanName}, ${desc}` : cleanName;
                    } else {
                        return desc || "";
                    }
                }
                return cleanName;
            });
        };

        return { 
            ...scene, 
            image_prompt: replaceNames(imgText), 
            video_prompt: replaceNames(vidText) 
        };
    });
};

export interface VideoPromptConfig {
    videoModel: string;
    videoPromptBasis: string;
    includeDialogue: boolean;
    includeAmbient: boolean;
    includeSfx: boolean;
    cameraAngle: string | string[];
    projectNiche?: string;
    useNegativePrompt?: boolean;
    negativePrompt?: string;
}


export const getModelSpecificPromptGenerator = (
    res: SceneResult, 
    characterProfiles: CharacterProfile[],
    config: VideoPromptConfig
): string => {
    const { videoModel, videoPromptBasis, includeDialogue, includeAmbient, includeSfx, cameraAngle, projectNiche, useNegativePrompt, negativePrompt } = config;

    // Filter characters strictly to ONLY those explicitly mentioned in the scene's character list.
    // This prevents the AI from falsely injecting characters into scenes they don't belong in.
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
        // This strictly locks the motion for fixed-camera niches
        motionInstructions = [
            'Absolutely locked static camera, zero camera displacement', 
            'Dynamic pacing: Starts with hyper-lapse fast-forward environmental evolution, then smoothly transitions into normal real-time speed', 
            'Cinematic transition: Start the scene emerging from a heavy blur (fade-in), and end the scene fading into a deep Gaussian blur and black screen (fade-out) to prevent end-frame glitches'
        ];
    } else if (nicheConfig && nicheConfig.defaultThemes && nicheConfig.defaultThemes.includes('Found Footage')) {
        // STRICT FIRST-PERSON POV MOTION LOGIC FOR FOUND FOOTAGE
        if (/\b(running|chasing|driving fast|explosion|fighting|sprinting|flying quickly|battle|war|action sequence)\b/.test(description)) {
            motionInstructions.push('frantic first-person POV dash', 'extreme shaky cam', 'motion blur', 'panic zoom');
        } else if (/\b(creeping|sneaking|hiding|peeking|lurking|tense|suspense|shadows)\b/.test(description)) {
            motionInstructions.push('slow, trembling first-person POV creeping', 'heavy breathing handheld shake', 'rack focus to build suspense');
        } else {
            motionInstructions.push('steady first-person POV', 'subtle handheld camera movement');
        }
    } else {
        // Fast Motion Keywords
        if (/\b(running|chasing|driving fast|explosion|fighting|sprinting|flying quickly|battle|war|action sequence)\b/.test(description)) {
            motionInstructions.push('fast-paced tracking shot', 'shaky cam effect', 'quick cuts', 'motion blur');
        }
        // Slow/Emotional Motion Keywords
        if (/\b(crying|sad|thinking|slowly walking|looking at|meditating|praying|contemplating|gazing|sorrow|grief|lonely)\b/.test(description)) {
            motionInstructions.push('slow-dolly zoom in', 'lingering shot', 'soft focus', 'static shot with subtle focus pull');
        }
        // Grand/Epic Motion Keywords
        if (/\b(reveals|discovers|panoramic|vast|cityscape|landscape|epic view|mountains|ocean)\b/.test(description)) {
            motionInstructions.push('epic wide shot', 'slow crane shot revealing the scene', 'sweeping drone footage');
        }
        // Suspenseful Motion Keywords
        if (/\b(creeping|sneaking|hiding|peeking|lurking|tense|suspense|shadows)\b/.test(description)) {
            motionInstructions.push('slow, tense push-in', 'use of shadows and low-key lighting', 'rack focus to build suspense');
        }
    }

    const uniqueInstructions = [...new Set(motionInstructions)];

    let globalAudioInstruction = "";
    if (includeDialogue || includeAmbient || includeSfx) {
        const audioParts = [];
        if (includeDialogue) audioParts.push("Dialogue: <extracted/inferred dialogue if enabled>");
        if (includeAmbient) audioParts.push("Ambient: <scene ambient sounds if enabled>");
        if (includeSfx) audioParts.push("SFX: <action sound effects if enabled>");
        
        const nicheAudioDNA = (nicheConfig && nicheConfig.audioRules) ? `\n\n**NICHE SPECIFIC AUDIO DNA:**\n${nicheConfig.audioRules}` : "";
        
        globalAudioInstruction = `\n\n**GLOBAL AUDIO DIRECTIVE:**\nAt the very end of your generated video prompt, you MUST append the following exact tag:\n[Audio Directives: ${audioParts.join(" | ")}] (replace the <...> placeholders with actual inferred sounds).${nicheAudioDNA}`;
    }

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
            const nicheInstruction = (nicheConfig && nicheConfig.lastMileVideoRules) 
                ? `7. **Niche Constraint:** ${nicheConfig.lastMileVideoRules}` 
                : "";
                
            const negativeInstruction = (useNegativePrompt && negativePrompt && negativePrompt.trim())
                ? `8. **Negative Prompts:** YOU MUST STRICTLY AVOID any mention, implication, or visual depiction of the following concepts: "${negativePrompt.trim()}".`
                : "";

            // UPGRADED VEO PROMPT with more explicit instructions and an example
            const veoPrompt = `You are a world-class prompt engineer for the Veo 3.1 video generation model. Your task is to synthesize the provided structured information into a single, dense, cinematic paragraph that is extremely detailed and ready for generation.

**CRITICAL INSTRUCTIONS (MUST BE FOLLOWED):**
1.  **Output Format:** Your response MUST be a single, cohesive paragraph. DO NOT use section labels (like "Scene:", "Visuals:"), lists, bullet points, or multiple line breaks.
2.  **Synthesis, Not Listing:** Intelligently weave all details from the sections below into a fluid, descriptive narrative. Do not just list the keywords.
3.  **Cinematic Language:** Use vivid, professional, and cinematic language. Describe lighting, mood, texture, and emotion.
4.  **Character Presence (SEE FIRST, MATCH LATER):** DO NOT force every character provided in the 'Key Characters' list into the scene. First, read the 'Scene' section. If a character belongs in this specific scene or is clearly visible, ONLY THEN should you use their visual details. If they are not in the scene, COMPLETELY IGNORE THEM.
5.  **Character Tagging (MANDATORY):** See the CRITICAL CHARACTER TAGGING RULE below. You MUST tag characters using the bracketed format {{Character: Name}}. Do NOT use pronouns or generic nouns for these characters.
6.  **Motion Integration:** Seamlessly blend the camera movements and pacing into the scene's description (e.g., "A slow, tense push-in reveals...", "A fast-paced dynamic movement captures...").
${nicheInstruction}
${negativeInstruction}
${finalCharacterLock}

**EXAMPLE OF A PERFECT OUTPUT PARAGRAPH:**
"A slow-dolly zoom in on a grieving old king, whose face is etched with sorrow. He is an old man with a long white beard, wearing regal but worn-out robes, sitting alone on a massive stone throne in a dimly lit, cavernous hall. The scene is shot with dramatic, high-contrast lighting, casting long shadows that dance on the cold stone walls. The camera, set at a low angle to emphasize his loneliness, slowly pushes towards his face, capturing a single tear rolling down his weathered cheek. The atmosphere is heavy with the ambient sound of distant, echoing drips."

--- STRUCTURED INFORMATION TO SYNTHESIZE ---

**Scene:**
${sceneDescription}

**Visuals:**
- **Core Style:** ${visualReference}
- **Key Characters:** ${characterInstruction}

**Camera:**
- **Shot Types:** ${cameraFinal || "Director's choice."}
- **Movement & Pacing:** ${motionDescription}

**Audio:**
- **Cues:** ${audioDescription}

---

Now, using the example as a quality guide, generate the single-paragraph video prompt based on the information provided.${globalAudioInstruction}`;

            return veoPrompt;

        default:
            const characterInfo = characterInstruction 
                ? `\n\nAVAILABLE CHARACTERS: ${characterInstruction}\n\nCRITICAL RULE: First, read the scene description. ONLY include a character's visual details if they logically belong in this specific scene. DO NOT force all characters into the scene. DO NOT write raw IDs like 'char_1' in the final prompt.`
                : "";
            const motionInfo = uniqueInstructions.length > 0 ? ` Use these camera techniques: ${uniqueInstructions.join(', ')}.` : "";
            const cameraInfo = cameraFinal ? ` The shot type should be: ${cameraFinal}.` : "";
            const audioInfo = audioCues.length > 0 ? ` Include audio for ${audioCues.join(', ')}.` : "";
            const nicheInfoStr = (nicheConfig && nicheConfig.lastMileVideoRules) ? `\n\nCRITICAL NICHE CONSTRAINT: ${nicheConfig.lastMileVideoRules}` : "";
            const negativeInfoStr = (useNegativePrompt && negativePrompt && negativePrompt.trim()) ? `\n\nNEGATIVE PROMPT (AVOID THESE): ${negativePrompt.trim()}` : "";
            
            return `Create a detailed, cinematic video prompt in a single paragraph. The scene is: ${res.scene_description}. The overall visual style is based on this image prompt: "${res.image_prompt}".${motionInfo}${cameraInfo}${audioInfo}${characterInfo}${nicheInfoStr}${negativeInfoStr}${globalAudioInstruction}`;
    }
};