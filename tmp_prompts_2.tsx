                });

                const batchPromises = batchIndices.map(async (sceneIndex, idx) => {
                    if (stopGenerationRef.current) return { index: sceneIndex, prompt: 'Error: Generation Stopped', status: 'failed' as const };
                    
                    // আর্কিটেক্টের নির্দেশ: OpenRouter বা Custom হলে রিকোয়েস্টের মাঝে গ্যাপ (ঢিলে) থাকবে
                    if (apiProviderRef.current !== 'google' && idx > 0 && videoBatchDelayRef.current > 0) {
                        await new Promise(resolve => setTimeout(resolve, idx * (videoBatchDelayRef.current * 1000)));
                    }
                    
                    setResults(prev => prev.map((r, rIdx) => rIdx === sceneIndex ? { ...r, videoPromptStatus: 'generating' } : r));

                    try {
                        const res = currentResults[sceneIndex]; 
                        const vConfig = {
                            videoModel: videoModelRef.current, videoPromptBasis: videoPromptBasisRef.current, includeDialogue: includeDialogueRef.current, includeAmbient: includeAmbientRef.current, includeSfx: includeSfxRef.current, cameraAngle: cameraAngleRef.current.length > 0 ? cameraAngleRef.current.join(', ') : 'Default',
                            projectNiche: projectNicheRef.current,
                            negativePrompt: negativePromptRef.current,
                            useNegativePrompt: useNegativePromptRef.current
                        };
                        const videoPromptText = USE_REMAKE_ENGINE_V2
                            ? getVisualRemakeVideoPrompt_V2(
                                res, 
                                characterProfilesRef.current, 
                                vConfig, 
                                globalSummaryRef.current,
                                sceneIndex > 0 ? currentResults[sceneIndex - 1] : null,
                                includeDialogueRef.current,
                                includeAmbientRef.current,
                                includeSfxRef.current
                              )
                            : getModelSpecificPromptGenerator(res, characterProfilesRef.current, vConfig);
                        const videoResult = await executeGenerativeAiTask('', videoPromptText, `generate video prompt ${sceneIndex + 1}`, undefined, undefined, undefined, undefined, 75000);

                        // 1. Safe Tag Cleaning (Removes only specific AI tool tags, ignores all other brackets or formatting)
                        let cleanedText = videoResult.text ? videoResult.text.trim() : '';
                        cleanedText = cleanedText.replace(/<\/?(invoke|minimax)[^>]*>/gi, '').trim();

                        // 2. Strict Blacklist (Fails the prompt instantly if AI outputs conversational filler)
                        const blacklist = ['here is the prompt', 'the user wants', 'let me think', 'understood', 'synthesize a single', 'here is the synthesized'];
                        const hasGarbage = blacklist.some(phrase => cleanedText.toLowerCase().includes(phrase));

                        // 3. Length & Final Status Validation (Requires at least 200 chars for a valid cinematic prompt)
                        const isError = cleanedText.toLowerCase().startsWith('error:');
                        const isTooShort = cleanedText.length < 200;

                        const finalVideoPrompt = cleanedText || 'Error: AI failed to generate a prompt.';
                        
                        // Show "post-processing" style notification rapidly before replacement completes
                        setPromptGenerationProgress(prev => prev ? { ...prev, message: `Finalizing Prompts with Character Details...` } : null);
                        
                        // Simulate tiny delay to ensure UI updates
                        await smartDelay(500);
                        if (stopGenerationRef.current) return { index: sceneIndex, prompt: 'Error: Generation Stopped', status: 'failed' as const };

                        const status = (isError || hasGarbage || isTooShort) ? 'failed' as const : 'completed' as const;
                        return { index: sceneIndex, prompt: finalVideoPrompt, status };
                    } catch (e: any) {
                        // =====================================================================
                        // 🔒 CRITICAL ZONE: ALL LOGIC HERE IS PERFECTLY CALIBRATED FOR RESUME 
                        // AND FAKE-SUCCESS PREVENTION. DO NOT EDIT OR MODIFY UNDER ANY CIRCUMSTANCES. 
                        // IF CHANGES ARE ABSOLUTELY NECESSARY, YOU MUST ASK THE BOSS FOR 
                        // EXPLICIT PERMISSION IN THE CHAT BEFORE PROCEEDING.
                        // =====================================================================
                        if (e.message.includes("ENV_LIMIT") || e.message.includes("OPENROUTER_LIMIT")) throw e;
                        if (stopGenerationRef.current || e.name === 'AbortError' || e.message === 'stopped' || e.message === 'FATAL_STOP') {
                             return { index: sceneIndex, prompt: '', status: 'failed' as const, errorMessage: "Generation Stopped by User" };
                        }
                        return { index: sceneIndex, prompt: '', status: 'failed' as const, errorMessage: e.message || "Unknown Error" };
                    }
                });
    
                const batchResults = await Promise.all(batchPromises);
                
                let hasToastBeenShownForBatch = false;
    
                // =====================================================================
                // 🔒 CRITICAL ZONE: ALL LOGIC HERE IS PERFECTLY CALIBRATED FOR RESUME 
                // AND FAKE-SUCCESS PREVENTION. DO NOT EDIT OR MODIFY UNDER ANY CIRCUMSTANCES. 
                // IF CHANGES ARE ABSOLUTELY NECESSARY, YOU MUST ASK THE BOSS FOR 
                // EXPLICIT PERMISSION IN THE CHAT BEFORE PROCEEDING.
                // =====================================================================
                setResults(prev => {
                    let newResults = [...prev];
                    batchResults.forEach(item => {
                        if (item) { // Ensure item is not undefined
                           newResults[item.index] = { ...newResults[item.index], video_prompt: item.prompt, videoPromptStatus: item.status };
                           if (item.status === 'failed' && !hasToastBeenShownForBatch) {
                               if (item.errorMessage === 'Generation Stopped by User') {
                                   showNotification(`Generation Stopped by User`, false);
                                   hasToastBeenShownForBatch = true;
                               } else {
                                   showNotification(`AI Generation Failed: ${item.errorMessage || "Unknown Error"}`, true);
                                   console.error(`Video Prompt Gen Failed for scene ${item.index}:`, item.errorMessage);
                                   hasToastBeenShownForBatch = true;
                               }
                           }
                        }
                    });

                    // CRITICAL FIX: Apply Injection Functions on the newly generated video prompts before saving!
                    newResults = injectCharacterDescriptions(newResults, characterProfilesRef.current);
                    newResults = injectPostProcessingStyles(newResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);

                    localStorage.setItem('interim_results', JSON.stringify(newResults));
                    resultsRef.current = newResults; // Manually update ref for immediate consistency
                    return newResults;
                });
                
                const totalCompleted = resultsRef.current.filter(r => r && r.videoPromptStatus === 'completed').length;
                setResumableTask(prev => {
                    if (!prev) return null;
                    const updated = { ...prev, progress: totalCompleted, provider: apiProviderRef.current };
                    localStorage.setItem('resumable_task', JSON.stringify(updated));
                    return updated;
                });

                setPromptGenerationProgress({ current: totalCompleted, total: allIndices.length, message: `Generating Video Prompts (${totalCompleted}/${allIndices.length})...`, isStalled: false });
                
                // API Rate Limit Cool-down (Do not delay after the very last batch)
                // =====================================================================
                // 🔒 CRITICAL ZONE: ALL LOGIC HERE IS PERFECTLY CALIBRATED. 
                // DO NOT EDIT OR MODIFY UNDER ANY CIRCUMSTANCES. 
                // IF CHANGES ARE ABSOLUTELY NECESSARY, YOU MUST ASK THE BOSS FOR 
                // EXPLICIT PERMISSION IN THE CHAT BEFORE PROCEEDING.
                // =====================================================================
                if (i + BATCH_SIZE < pendingIndices.length && !stopGenerationRef.current && !showEnvLimitModal && videoBatchDelayRef.current > 0) {
                    let timeLeft = videoBatchDelayRef.current;
                    while (timeLeft > 0 && !stopGenerationRef.current) {
                        setRateLimitCountdown(`Cooling down for ${timeLeft} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        timeLeft--;
                    }
                    setRateLimitCountdown(null);
                }
            }
    
        } catch (e: any) {
            criticalErrorOccurred = true;
            if (e.message !== "stopped" && e.message !== "ENV_LIMIT_REACHED" && e.message !== "FATAL_STOP" && e.message !== "OPENROUTER_LIMIT_REACHED" && e.message !== "CUSTOM_LIMIT_REACHED")
                handleError(e, 'generate video prompts', { provider: apiProviderRef.current, model: videoModelRef.current });
        } finally {
            setIsGeneratingVideoPrompts(false);
            setPromptGenerationProgress(null);
            
            const finalFailedCount = resultsRef.current.filter(r => r && r.videoPromptStatus === 'failed').length;
            const pendingCount = resultsRef.current.filter(r => r && (r.videoPromptStatus === 'pending' || r.videoPromptStatus === 'generating')).length;
            
            if (!criticalErrorOccurred && resultsRef.current.length > 0 && finalFailedCount === 0 && pendingCount === 0 && !stopGenerationRef.current) {
                showNotification("All video prompts generated successfully!");
                localStorage.removeItem('resumable_task');
