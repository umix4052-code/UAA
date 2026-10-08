    const handleGenerateVideoPrompts = async (count?: number, scriptContent?: string, isResumeAction?: boolean) => {
        let criticalErrorOccurred = false;
        setIsGeneratingVideoPrompts(true);
        setIsVideoPromptsGenerated(true);
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController();
        
        const rawResumable = localStorage.getItem('resumable_task');
        let currentTask: ResumableTask | null = resumableTask;
        if (rawResumable) {
            try { currentTask = JSON.parse(rawResumable); } catch (e) {}
        }
        const isResumingTask = currentTask?.type === 'video_prompt_gen';
        const isResuming = isResumingTask || isResumeAction;

        if (isResuming) {
            showNotification("Resuming video prompt generation...");
        }
    
        try {
            const targetScript = scriptContent || scriptRef.current;
            let currentResults: SceneResult[] = [...resultsRef.current];
            
            if (!isResuming && count !== undefined && currentResults.length > count && (videoPromptBasisRef.current === 'script-driven' || videoPromptBasisRef.current === 'script-driven-auto')) {
                currentResults = currentResults.slice(0, count);
                setResults(currentResults);
                resultsRef.current = currentResults;
            }
            
            // Fallback for resultsRef
            if (isResuming && currentResults.length === 0) {
                const rawInterim = localStorage.getItem('interim_results');
                if (rawInterim) {
                    try { currentResults = JSON.parse(rawInterim); } catch (e) {}
                }
            }
    
            // Generate storyboard first if it doesn't exist
            if (!isResuming && (currentResults.length === 0 || !currentResults.some(r => r.scene_description))) {
                if (videoPromptBasisRef.current === 'script-driven' || videoPromptBasisRef.current === 'script-driven-auto') {
                    if (!targetScript.trim()) throw new Error("Please provide a script.");
                    showNotification(`Preparing scenes from script...`);
                    
                    const isAuto = videoPromptBasisRef.current === 'script-driven-auto';
                    let newScenes: SceneResult[] = [];
                    const defaultSize = apiProviderRef.current === 'google' ? 1200 : 800;
                    const maxChunkLength = Math.max(200, Math.min(1500, dynamicChunkSizeRef.current || defaultSize));
                    
                    const chunkWords = targetScript.split(/\s+/).filter(w => w.trim().length > 0).length;
                    const expectedTotalScenesForVideo = isAuto ? Math.max(1, Math.round((chunkWords / 120) * 60 / (targetSceneDurationRef.current || 8))) : (count !== undefined ? count : imageCountRef.current);
                    
                    let globalSummary = '';

                    const chunksForSummary = splitScriptIntoMeaningfulChunks(targetScript, maxChunkLength);
                    if (expectedTotalScenesForVideo > 10 || chunksForSummary.length > 1) {
                        showNotification("Generating Global Story Summary...");
                        setPromptGenerationProgress({ current: 0, total: 1, message: "Analyzing Script & Generating Global Story Summary..." });
                        const summaryPrompt = `Based on the following full script, generate a concise Global Story Summary & Visual Theme (300-400 words). Focus heavily on the core narrative arc, the setting, the primary vibe, and the overall visual aesthetic that should remain consistent throughout. Do NOT generate scenes, just the summary.\n\nScript:\n${targetScript}`;
                        const summaryResult = await executeGenerativeAiTask('', summaryPrompt, 'generate global summary', undefined, undefined, undefined, 'You are an expert story and visual analyst.');
                        globalSummary = summaryResult.text ? summaryResult.text.trim() : '';
                        globalSummaryRef.current = globalSummary;
                    }

                    // Always chunk if script is too long, regardless of isAuto, to avoid token limits
                    if (targetScript.length > maxChunkLength) {
                        setPromptGenerationProgress({ current: 0, total: 100, message: `Analyzing long script (chunking for scene breakdown) for video prompts...`, isStalled: false });
                        const chunks = chunksForSummary;
                        let totalScenesAssigned = 0;
                        const targetCount = count !== undefined ? Math.max(1, count) : Math.max(1, imageCountRef.current);
                        let videoMemoryBuffer = '';
                        let videoPreviousVisualState: any = null;

                        for (let i = 0; i < chunks.length; i++) {
                            if (stopGenerationRef.current || showEnvLimitModal) throw new Error("stopped");
                            const chunk = chunks[i];
                            const nextChunk = i < chunks.length - 1 ? chunks[i+1] : undefined;
                            
                            const chunkWords = chunk.split(/\s+/).filter(w => w.trim().length > 0).length;
                            const chunkEstimatedSeconds = (chunkWords / 120) * 60;
                            const targetDuration = targetSceneDurationRef.current || 8;
                            
                            let expectedScenes;
                            if (isAuto) {
                                expectedScenes = Math.max(1, Math.round(chunkEstimatedSeconds / targetDuration));
                            } else {
                                // Proportional allocation for manual count
                                if (i === chunks.length - 1) {
                                    expectedScenes = Math.max(1, targetCount - totalScenesAssigned);
                                } else {
                                    const chunkRatio = chunk.length / targetScript.length;
                                    expectedScenes = Math.max(1, Math.round(targetCount * chunkRatio));
                                }
                                totalScenesAssigned += expectedScenes;
                            }
                            
                            const progressMessage = `Breaking down script chunk ${i + 1} of ${chunks.length} (Target: ~${expectedScenes} scenes) for video prompts...`;
                            setPromptGenerationProgress({ current: i, total: chunks.length, message: progressMessage, isStalled: false });
                            showNotification(progressMessage);

                            const { systemData, userData } = getScriptToStoryboardPrompt(chunk, expectedScenes, [], [], '', '', characterProfilesRef.current, '', false, projectNicheRef.current, [], undefined, undefined, isAuto, targetSceneDurationRef.current, undefined, videoMemoryBuffer, globalSummary, nextChunk, videoPreviousVisualState);
                            const result = await executeGenerativeAiTask('', userData, `script breakdown auto chunk ${i+1}`, jsonValidator, undefined, undefined, systemData);
                            const cleanedJson = extractJsonFromString(result.text);
                            const parsedJson = JSON.parse(cleanedJson);
                            const parsedResults: { scene_description: string }[] = parsedJson.scenes; if (!parsedResults || !Array.isArray(parsedResults)) throw new Error("JSON generation truncated due to token limit.");
                            if (parsedJson.current_visual_state) {
                                videoPreviousVisualState = parsedJson.current_visual_state;
                            }
                            
                            if (parsedResults.length > 0) {
                                const lastScene = parsedResults[parsedResults.length - 1];
                                videoMemoryBuffer = lastScene.scene_description || '';
                                if (parsedResults.length > 1) {
                                    const secondLastScene = parsedResults[parsedResults.length - 2];
                                    videoMemoryBuffer = (secondLastScene.scene_description || '') + "\n\n" + videoMemoryBuffer;
                                }
                            }

                            newScenes = newScenes.concat(parsedResults.map(r => ({
                                scene_description: r.scene_description, image_prompt: '', video_prompt: '', imageStatus: 'pending' as const, videoPromptStatus: 'pending' as const, retryCount: 0, safetyRetryCount: 0
                            })));
                        }
                    } else {
                        const targetCount = count !== undefined ? Math.max(1, count) : Math.max(1, imageCountRef.current);
                        setPromptGenerationProgress({ current: 0, total: 100, message: `Analyzing script and breaking down scenes...`, isStalled: false });
                        showNotification("AI is analyzing the script to determine the best scene structure for video prompts...");
                        let finalTargetCount = targetCount;
                        if (isAuto) {
                            const scriptWords = targetScript.split(/\s+/).filter(w => w.trim().length > 0).length;
                            const estimatedSeconds = (scriptWords / 120) * 60;
                            const targetDuration = targetSceneDurationRef.current || 8;
                            finalTargetCount = Math.max(1, Math.round(estimatedSeconds / targetDuration));
                        }
                        let videoPreviousVisualState: any = null;
                        const { systemData, userData } = getScriptToStoryboardPrompt(targetScript, finalTargetCount, [], [], '', '', characterProfilesRef.current, '', false, projectNicheRef.current, [], undefined, undefined, isAuto, targetSceneDurationRef.current, undefined, undefined, globalSummary, undefined, videoPreviousVisualState);
                        const result = await executeGenerativeAiTask('', userData, 'script breakdown', jsonValidator, undefined, undefined, systemData);
                        const responseText = result.text;
                        const cleanedJson = extractJsonFromString(responseText);
                        const parsedJson = JSON.parse(cleanedJson);
                            const parsedResults: { scene_description: string }[] = parsedJson.scenes; if (!parsedResults || !Array.isArray(parsedResults)) throw new Error("JSON generation truncated due to token limit.");
                            if (parsedJson.current_visual_state) {
                                videoPreviousVisualState = parsedJson.current_visual_state;
                            }
        
                        newScenes = parsedResults.map(r => ({
                            scene_description: r.scene_description, image_prompt: '', video_prompt: '', imageStatus: 'pending', videoPromptStatus: 'pending', retryCount: 0, safetyRetryCount: 0
                        }));
                    }
                    
                    if (videoPromptBasisRef.current === 'script-driven-auto') {
                        setImageCount(newScenes.length);
                    }
                    setResults(newScenes);
                    currentResults = newScenes; // Use the newly generated scenes immediately
                    localStorage.setItem('interim_results', JSON.stringify(newScenes));
                    showNotification(`Script breakdown complete! ${newScenes.length} scenes identified for video prompt generation.`);
                } else {
                    throw new Error("Please generate images first for image-driven basis, or use Script-Driven mode.");
                }
            }
    
            const allIndices = currentResults.map((_, i) => i);
            const completedIndices = new Set(isResuming ? allIndices.filter(i => 
                currentResults[i] && 
                currentResults[i].videoPromptStatus === 'completed' &&
                currentResults[i].video_prompt && 
                currentResults[i].video_prompt.trim().length > 15 && 
                !currentResults[i].video_prompt.startsWith("Error:") &&
                !currentResults[i].video_prompt.startsWith("stopped")
            ) : []);
            const pendingIndices = allIndices.filter(i => !completedIndices.has(i));
    
            if (pendingIndices.length === 0) {
                showNotification("All video prompts are already generated!");
                setIsGeneratingVideoPrompts(false); // Stop loading if nothing to do
                setPromptGenerationProgress(null);
                return;
            }
            
            const newTask: ResumableTask = {
                id: `video_prompt_gen_${currentResults.length}`, type: 'video_prompt_gen', provider: apiProviderRef.current, progress: completedIndices.size, imageCount: currentResults.length
            };
            if (!isResuming) {
                localStorage.setItem('resumable_task', JSON.stringify(newTask));
                setResumableTask(newTask);
            }

            showNotification(`Generating/Regenerating video prompts for ${pendingIndices.length} scenes...`);
            setPromptGenerationProgress({ 
                current: completedIndices.size, 
                total: allIndices.length, 
                message: `Initializing video prompt generation for ${pendingIndices.length} scenes...`, 
                isStalled: false 
            });
    
            const BATCH_SIZE = videoBatchSizeRef.current;
            for (let i = 0; i < pendingIndices.length; i += BATCH_SIZE) {
                if (stopGenerationRef.current || showEnvLimitModal) break;
    
                const batchIndices = pendingIndices.slice(i, i + BATCH_SIZE);
                const sceneStart = batchIndices[0] + 1;
                const sceneEnd = batchIndices[batchIndices.length - 1] + 1;
                
                const progressMessage = `Generating Video Prompts for Scenes ${sceneStart} to ${sceneEnd}... ${completedIndices.size + i} completed, ${allIndices.length - (completedIndices.size + i)} remaining.`;
                showNotification(progressMessage);
                setPromptGenerationProgress({ 
                    current: completedIndices.size + i, 
                    total: allIndices.length, 
                    message: progressMessage, 
                    isStalled: false 
                });
