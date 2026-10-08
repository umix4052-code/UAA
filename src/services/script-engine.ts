import { getMasterOutlinerPrompt, getSmartChunkWriterPrompt } from '../../ai-prompts';

export const generateLongFormScript = async (
    scriptIdea: string,
    durationText: string,
    projectNicheRules: string,
    language: string,
    provider: string,
    executeAiTask: (prompt: string, operation: string, validator?: any, forceProvider?: any, sysInst?: any, timeout?: any, signal?: AbortSignal) => Promise<{text: string}>,
    updateProgress: (progress: number, message: string) => void,
    onChunkGenerated: (chunkText: string) => void,
    checkAbort: () => boolean,
    abortSignal?: AbortSignal,
    isNoVoiceover: boolean = false
): Promise<void> => {
    
    if (checkAbort()) throw new Error("stopped");

    // Math Calculation for Chapters & Words
    const [hStr, mStr, sStr] = (durationText || "0:0:0").split(':');
    const hours = parseInt(hStr) || 0;
    const minutes = parseInt(mStr) || 0;
    const seconds = parseInt(sStr) || 0;
    let durationMins = (hours * 60) + minutes + (seconds / 60);
    if (durationMins <= 0) durationMins = 5; // Fallback
    
    const chunkLimit = provider === 'google' ? 1500 : 800;
    const totalTargetWords = durationMins * 140; // 140 WPM average
    const calculatedChapters = Math.max(1, Math.ceil(totalTargetWords / chunkLimit));
    const targetWordCount = Math.ceil(totalTargetWords / calculatedChapters); // Evenly distribute

    updateProgress(10, "Architecting story outline & global memory...");
    const outlinePrompt = getMasterOutlinerPrompt(scriptIdea, durationText, projectNicheRules, language, calculatedChapters);
    
    const outlineResult = await executeAiTask(outlinePrompt, 'generate story outline', undefined, undefined, undefined, undefined, abortSignal);
    
    if (checkAbort()) throw new Error("stopped");

    // JSON Auto-Healing & Extraction
    let outlineData;
    try {
        const rawText = outlineResult.text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : rawText;
        outlineData = JSON.parse(jsonString);
        
        if (!outlineData.chapters || !Array.isArray(outlineData.chapters)) {
            throw new Error("Invalid chapter array structure.");
        }
    } catch (e) {
        throw new Error("AI failed to generate a valid chapter structure. Please try again.");
    }

    let previousContext = "";
    const totalChapters = outlineData.chapters.length;

    for (let i = 0; i < totalChapters; i++) {
        if (checkAbort()) throw new Error("stopped");
        
        const chapter = outlineData.chapters[i];
        const currentProgress = 20 + Math.floor((i / totalChapters) * 75);
        updateProgress(currentProgress, `Writing Chapter ${i + 1} of ${totalChapters}: ${chapter.chapter_title}...`);
        
        const chunkPrompt = getSmartChunkWriterPrompt(
            chapter.chapter_title,
            chapter.focus_and_events,
            outlineData.global_summary,
            previousContext,
            projectNicheRules,
            language,
            targetWordCount,
            isNoVoiceover,
            i === totalChapters - 1
        );

        const chunkResult = await executeAiTask(chunkPrompt, `writing chapter ${i + 1}`, undefined, undefined, undefined, undefined, abortSignal);
        
        if (checkAbort()) throw new Error("stopped");

        // Remove reasoning <think> blocks and markdown wrappers before processing
        const rawText = chunkResult.text;
        const chunkText = rawText
            .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think>...</think> entirely
            .replace(/```(?:markdown|text)?\s*[\s\S]*?```/gi, (match) => match.replace(/```(?:markdown|text)?/g, '').replace(/```/g, '')) // Remove markdown code blocks but keep content
            .trim();
        
        // Incremental UI Saving
        onChunkGenerated(chunkText);
        
        // Save last 100 words for the next loop's memory
        const words = chunkText.split(/\s+/);
        previousContext = words.slice(-100).join(' ');
    }

    updateProgress(100, "Script Generation Complete!");
};
