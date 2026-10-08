const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');

const startMarker = "const handleConfirmImagePromptGeneration = async (options: { discardPrevious?: boolean } = {}) => {";

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.error("Start marker not found");
    process.exit(1);
}

// Find the end by looking for the next function declaration or something
const nextFuncRegex = /\s+const handleExportPrompts = \(\) => {/g;
nextFuncRegex.lastIndex = startIndex;
const endMatch = nextFuncRegex.exec(content);
if (!endMatch) {
    console.error("End marker not found");
    process.exit(1);
}
const endIndex = endMatch.index;

const replacement = `const handleConfirmImagePromptGeneration = async (options: { discardPrevious?: boolean } = {}) => {
        setShowImagePromptConfirmModal(false);

        if (options.discardPrevious) {
            localStorage.removeItem('resumable_task');
            localStorage.removeItem('interim_results');
            setResumableTask(null);
            setResults([]); 
            showNotification("Previous task discarded. Starting new task.");
        }

        if (!imagePromptGenArgs) return;
        const count = imagePromptGenArgs.count;
        const scriptContent = imagePromptGenArgs.scriptContent;
        
        const isResuming = !options.discardPrevious && resultsRef.current.length > 0;
        const scriptToUse = scriptContent || scriptRef.current; 
        setIsGeneratingTextPrompts(true); 
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController();
        if (!isResuming) {
            setImageCount(count); 
        }
        setPromptGenerationProgress({ current: 0, total: isResuming ? resultsRef.current.length : count, message: "Initializing prompt engine...", isStalled: false }); 
        
        try { 
            const BATCH_SIZE_PROMPTS = 10; 
            let allParsedResults: SceneResult[] = isResuming ? [...resultsRef.current] : []; 
            let memoryBuffer = '';
            let previousVisualState: any = null;
            showNotification(isResuming ? 'Resuming image prompt generation...' : (autoBreakdown ? \`Generating prompts scene-by-scene...\` : \`Generating \${count} image prompts in batches...\`)); 
    
            let globalSummary = '';
            const expectedTotalScenesForText = autoBreakdown ? Math.max(1, Math.round(((scriptToUse.split(/\\s+/).length) / 120) * 60 / (targetSceneDurationRef.current || 8))) : count;
            const chunksForCount = splitScriptIntoMeaningfulChunks(scriptToUse, dynamicChunkSizeRef.current);
            if (!isResuming && (expectedTotalScenesForText > BATCH_SIZE_PROMPTS || chunksForCount.length > 1)) {
                showNotification("Generating Global Story Summary...");
                const summaryPrompt = \`Based on the following full script, generate a concise Global Story Summary & Visual Theme (300-400 words). Focus heavily on the core narrative arc, the setting, the primary vibe, and the overall visual aesthetic that should remain consistent throughout. Do NOT generate scenes, just the summary.\\n\\nScript:\\n\${scriptToUse}\`;
                const summaryResult = await executeGenerativeAiTask('', summaryPrompt, 'generate global summary', undefined, undefined, undefined, 'You are an expert story and visual analyst.');
                globalSummary = summaryResult.text ? summaryResult.text.trim() : '';
                globalSummaryRef.current = globalSummary;
            }

            if (isResuming) {
                let processedChunks = 0;
                let i = 0;
                while (i < allParsedResults.length) {
                    if (stopGenerationRef.current) throw new Error("stopped");
                    const scene = allParsedResults[i];
                    if (scene.imageStatus === 'failed' && scene.chunk_source_text && scene.target_chunk_count) {
                        const chunkText = scene.chunk_source_text;
                        const expectedScenes = scene.target_chunk_count;
                        const startIndex = i;
                        
                        showNotification(\`Resuming chunk generation for Scenes \${startIndex + 1} to \${startIndex + expectedScenes}...\`);
                        setPromptGenerationProgress({ current: processedChunks, total: 100, message: \`Resuming chunk generation...\`, isStalled: false });
                        
                        try {
                            const { systemData, userData } = getScriptToStoryboardPrompt(chunkText, expectedScenes, selectedThemesRef.current, selectedModifiersRef.current, cameraAngleRef.current.length > 0 ? cameraAngleRef.current.join(', ') : 'Default', aspectRatioRef.current, characterProfilesRef.current, negativePromptRef.current, useNegativePromptRef.current, projectNicheRef.current, referenceFilesRef.current, startIndex + 1, startIndex + expectedScenes, false, targetSceneDurationRef.current, undefined, undefined, globalSummaryRef.current, undefined, null); 
                            
                            const result = await executeGenerativeAiTask('', userData, \`resume chunk\`, jsonValidator, undefined, undefined, systemData);
                            const cleanedJson = extractJsonFromString(result.text);
                            const parsedJson = JSON.parse(cleanedJson);
                            let parsedScenes = parsedJson.scenes; 
                            if (!parsedScenes || !Array.isArray(parsedScenes)) throw new Error("JSON invalid");
                            if (parsedScenes.length !== expectedScenes) throw new Error("Target mismatch");
                            
                            let batchResults: SceneResult[] = parsedScenes.map((s: any) => ({ ...s, image_prompt: s.master_prompt || s.image_prompt || "", chunk_source_text: chunkText, target_chunk_count: expectedScenes }));
                            batchResults = injectCharacterDescriptions(batchResults, characterProfilesRef.current);
                            batchResults = injectPostProcessingStyles(batchResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);
                            batchResults = batchResults.map(r => ({ ...r, imageStatus: 'pending', retryCount: 0, safetyRetryCount: 0 }));
                            
                            for (let j = 0; j < expectedScenes; j++) {
                                if (startIndex + j < allParsedResults.length) {
                                    allParsedResults[startIndex + j] = batchResults[j];
                                }
                            }
                            
                            setResults([...allParsedResults]);
                            resultsRef.current = allParsedResults;
                        } catch (err) {
                            console.error("Resume failed for chunk", err);
                        }
                        
                        i += expectedScenes;
                        processedChunks++;
                    } else {
                        i++;
                    }
                }
                
                showNotification("Resume complete!");
                setIsGeneratingTextPrompts(false);
                setPromptGenerationProgress(null);
                return;
            }

            if (autoBreakdown) {
                 const defaultSize = apiProviderRef.current === 'google' ? 1200 : 800;
                 const maxChunkLength = Math.max(200, Math.min(1500, dynamicChunkSizeRef.current || defaultSize));
                 if (scriptToUse.length > maxChunkLength) {
                     setPromptGenerationProgress({ current: 0, total: 100, message: \`Analyzing long script (chunking for scene breakdown)...\`, isStalled: false });
                     const chunks = chunksForCount;
                     let aggregatedResults: SceneResult[] = [];
                     
                     for (let i = 0; i < chunks.length; i++) {
                         if (stopGenerationRef.current) throw new Error("stopped");
                         const chunk = chunks[i];
                         const nextChunk = i < chunks.length - 1 ? chunks[i+1] : undefined;
                         
                         const chunkWords = chunk.split(/\\s+/).filter(w => w.trim().length > 0).length;
                         const chunkEstimatedSeconds = (chunkWords / 120) * 60;
                         const targetDuration = targetSceneDurationRef.current || 8;
                         const expectedScenes = Math.max(1, Math.round(chunkEstimatedSeconds / targetDuration));
                         const progressMessage = \`Breaking down script chunk \${i + 1} of \${chunks.length} (Target: ~\${expectedScenes} scenes)...\`;
                         setPromptGenerationProgress({ current: i, total: chunks.length, message: progressMessage, isStalled: false });
                         showNotification(progressMessage);
                         
                         const { systemData, userData } = getScriptToStoryboardPrompt(chunk, expectedScenes, selectedThemesRef.current, selectedModifiersRef.current, cameraAngleRef.current.length > 0 ? cameraAngleRef.current.join(', ') : 'Default', aspectRatioRef.current, characterProfilesRef.current, negativePromptRef.current, useNegativePromptRef.current, projectNicheRef.current, referenceFilesRef.current, undefined, undefined, true, targetSceneDurationRef.current, undefined, memoryBuffer, globalSummary, nextChunk, previousVisualState);
                         
                         try {
                             const result = await executeGenerativeAiTask('', userData, \`generate prompts auto-breakdown chunk \${i+1}\`, jsonValidator, undefined, undefined, systemData);
                             const cleanedJson = extractJsonFromString(result.text);
                             const parsedJson = JSON.parse(cleanedJson);
                             let parsedScenes = parsedJson.scenes; 
                             if (!parsedScenes || !Array.isArray(parsedScenes)) throw new Error("JSON generation truncated due to token limit.");
                             if (parsedScenes.length !== expectedScenes) throw new Error("Target mismatch");
                             if (parsedJson.current_visual_state) {
                                 previousVisualState = parsedJson.current_visual_state;
                             } 
                             let batchResults: SceneResult[] = parsedScenes.map((scene: any) => ({ ...scene, image_prompt: scene.master_prompt || scene.image_prompt || "", chunk_source_text: chunk, target_chunk_count: expectedScenes }));
                             batchResults = injectCharacterDescriptions(batchResults, characterProfilesRef.current);
                             batchResults = injectPostProcessingStyles(batchResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);
                             
                             if (batchResults.length > 0) {
                                 const lastScene = batchResults[batchResults.length - 1];
                                 memoryBuffer = lastScene.image_prompt || lastScene.scene_description || '';
                                 if (batchResults.length > 1) {
                                     const secondLastScene = batchResults[batchResults.length - 2];
                                     memoryBuffer = (secondLastScene.image_prompt || secondLastScene.scene_description || '') + "\\n\\n" + memoryBuffer;
                                 }
                             }
                             const newResults = batchResults.map(r => ({ ...r, imageStatus: 'pending' as const, retryCount: 0, safetyRetryCount: 0 }));
                             aggregatedResults = aggregatedResults.concat(newResults);
                         } catch (err) {
                             let batchResults: SceneResult[] = Array.from({ length: expectedScenes }).map(() => ({
                                 scene_description: 'Error: Failed to generate scene', 
                                 image_prompt: '', 
                                 imageStatus: 'failed', 
                                 chunk_source_text: chunk, 
                                 target_chunk_count: expectedScenes
                             }));
                             aggregatedResults = aggregatedResults.concat(batchResults);
                         }
                     }
                     allParsedResults = aggregatedResults;
                 } else {
                     setPromptGenerationProgress({ current: 0, total: 100, message: \`Analyzing script and breaking down into scenes...\`, isStalled: false });
                     showNotification("AI is analyzing the script to determine the best scene structure...");
                     const scriptWords = scriptToUse.split(/\\s+/).filter(w => w.trim().length > 0).length;
                     const estimatedSeconds = (scriptWords / 120) * 60;
                     const targetDuration = targetSceneDurationRef.current || 8;
                     const expectedScenes = Math.max(1, Math.round(estimatedSeconds / targetDuration));
                     const { systemData, userData } = getScriptToStoryboardPrompt(scriptToUse, expectedScenes, selectedThemesRef.current, selectedModifiersRef.current, cameraAngleRef.current.length > 0 ? cameraAngleRef.current.join(', ') : 'Default', aspectRatioRef.current, characterProfilesRef.current, negativePromptRef.current, useNegativePromptRef.current, projectNicheRef.current, referenceFilesRef.current, undefined, undefined, true, targetSceneDurationRef.current);
                     try {
                         const result = await executeGenerativeAiTask('', userData, \`generate prompts auto-breakdown\`, jsonValidator, undefined, undefined, systemData);
                         const responseText = result.text;
                         const cleanedJson = extractJsonFromString(responseText);
                         const parsedJson = JSON.parse(cleanedJson);
                         let parsedScenes = parsedJson.scenes; 
                         if (!parsedScenes || !Array.isArray(parsedScenes)) throw new Error("JSON generation truncated due to token limit.");
                         if (parsedScenes.length !== expectedScenes) throw new Error("Target mismatch");
                         if (parsedJson.current_visual_state) {
                             previousVisualState = parsedJson.current_visual_state;
                         } 
                         let batchResults: SceneResult[] = parsedScenes.map((scene: any) => ({ ...scene, image_prompt: scene.master_prompt || scene.image_prompt || "", chunk_source_text: scriptToUse, target_chunk_count: expectedScenes }));
                         batchResults = injectCharacterDescriptions(batchResults, characterProfilesRef.current);
                         batchResults = injectPostProcessingStyles(batchResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);
                         batchResults = batchResults.map(r => ({ ...r, imageStatus: 'pending', retryCount: 0, safetyRetryCount: 0 }));
                         allParsedResults = batchResults;
                     } catch (err) {
                         let batchResults: SceneResult[] = Array.from({ length: expectedScenes }).map(() => ({
                             scene_description: 'Error: Failed to generate scene', 
                             image_prompt: '', 
                             imageStatus: 'failed', 
                             chunk_source_text: scriptToUse, 
                             target_chunk_count: expectedScenes
                         }));
                         allParsedResults = batchResults;
                     }
                 }
                 setImageCount(allParsedResults.length);
                 setResults(allParsedResults);
                 resultsRef.current = allParsedResults;
                 showNotification(\`Auto-breakdown complete! \${allParsedResults.length} scenes identified.\`);
            } else {
                 const chunks = splitScriptIntoMeaningfulChunks(scriptToUse, dynamicChunkSizeRef.current);
                 let totalScenesAssigned = 0;
                 
                 for (let i = 0; i < chunks.length; i++) {
                     if (stopGenerationRef.current) throw new Error("stopped");
                     
                     const chunk = chunks[i];
                     const nextChunk = i < chunks.length - 1 ? chunks[i+1] : undefined;
                     
                     let expectedScenes;
                     if (i === chunks.length - 1) {
                         expectedScenes = Math.max(1, count - totalScenesAssigned);
                     } else {
                         const chunkRatio = chunk.length / scriptToUse.length;
                         expectedScenes = Math.max(1, Math.round(count * chunkRatio));
                     }
                     
                     if (expectedScenes === 0 && i !== chunks.length - 1) {
                         continue;
                     }
                     
                     const sceneStart = totalScenesAssigned + 1;
                     const sceneEnd = totalScenesAssigned + expectedScenes;
                     totalScenesAssigned += expectedScenes;
                     
                     const progressMessage = \`Generating Image Prompts for chunk \${i+1}/\${chunks.length} (Scenes \${sceneStart}-\${sceneEnd})...\`;
                     showNotification(progressMessage);
                     setPromptGenerationProgress({ 
                         current: sceneStart - 1, 
                         total: count, 
                         message: progressMessage, 
                         isStalled: false 
                     }); 
                     
                     const { systemData, userData } = getScriptToStoryboardPrompt(chunk, expectedScenes, selectedThemesRef.current, selectedModifiersRef.current, cameraAngleRef.current.length > 0 ? cameraAngleRef.current.join(', ') : 'Default', aspectRatioRef.current, characterProfilesRef.current, negativePromptRef.current, useNegativePromptRef.current, projectNicheRef.current, referenceFilesRef.current, sceneStart, sceneEnd, false, targetSceneDurationRef.current, undefined, memoryBuffer, globalSummary, nextChunk, previousVisualState); 
                     
                     let finalBatchResults: SceneResult[] = [];
                     try {
                         const result = await executeGenerativeAiTask('', userData, \`generate image prompts only chunk \${i+1}\`, jsonValidator, undefined, undefined, systemData); 
                         const responseText = result.text; 
                         const cleanedJson = extractJsonFromString(responseText); 
                         const parsedJson = JSON.parse(cleanedJson);
                         let parsedScenes = parsedJson.scenes; 
                         if (!parsedScenes || !Array.isArray(parsedScenes)) throw new Error("JSON generation truncated due to token limit.");
                         if (parsedScenes.length !== expectedScenes) throw new Error("Target mismatch");
                         if (parsedJson.current_visual_state) {
                             previousVisualState = parsedJson.current_visual_state;
                         } 
                         
                         let batchResults: SceneResult[] = parsedScenes.map((scene: any) => ({ ...scene, image_prompt: scene.master_prompt || scene.image_prompt || "", chunk_source_text: chunk, target_chunk_count: expectedScenes })); 
                         batchResults = batchResults.slice(0, expectedScenes);
                         batchResults = injectCharacterDescriptions(batchResults, characterProfilesRef.current);
                         batchResults = injectPostProcessingStyles(batchResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);
                         if (batchResults.length > 0) {
                             const lastScene = batchResults[batchResults.length - 1];
                             memoryBuffer = lastScene.image_prompt || lastScene.scene_description || '';
                             if (batchResults.length > 1) {
                                 const secondLastScene = batchResults[batchResults.length - 2];
                                 memoryBuffer = (secondLastScene.image_prompt || secondLastScene.scene_description || '') + "\\n\\n" + memoryBuffer;
                             }
                         }
                         batchResults = batchResults.map(r => ({ ...r, imageStatus: 'pending', retryCount: 0, safetyRetryCount: 0 })); 
                         finalBatchResults = batchResults;
                     } catch (err) {
                         finalBatchResults = Array.from({ length: expectedScenes }).map(() => ({
                             scene_description: 'Error: Failed to generate scene', 
                             image_prompt: '', 
                             imageStatus: 'failed', 
                             chunk_source_text: chunk, 
                             target_chunk_count: expectedScenes
                         }));
                     }
                     allParsedResults = [...allParsedResults, ...finalBatchResults]; 
                     setResults(prev => {
                         let newResults = [...prev, ...finalBatchResults];
                         newResults = injectCharacterDescriptions(newResults, characterProfilesRef.current);
                         newResults = injectPostProcessingStyles(newResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);
                         resultsRef.current = newResults;
                         return newResults;
                     });
                     
                     setPromptGenerationProgress({ 
                         current: totalScenesAssigned, 
                         total: count, 
                         message: \`Successfully generated prompts up to Scene \${totalScenesAssigned}.\`, 
                         isStalled: false 
                     });
                     
                     await new Promise(resolve => setTimeout(resolve, 1000));
                 }
            }
            
            showNotification(\`\${allParsedResults.length} prompts generated successfully!\`); 
        } catch (e: any) { 
            if (e.message !== "stopped" && e.message !== "ENV_LIMIT_REACHED" && e.message !== "FATAL_STOP" && e.message !== "OPENROUTER_LIMIT_REACHED") 
                handleError(e, 'generate image prompts only', {}); 
        } finally { 
            setIsGeneratingTextPrompts(false); 
            setPromptGenerationProgress(null); 
        } 
    };
`;

const newContent = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync('index.tsx', newContent);
console.log("Replaced successfully");
