    const handleAnalyzeScript = async (options: { extractCharacters: boolean; configureVoice: boolean; genderPreference?: 'any' | 'male' | 'female', keepExistingVoice?: boolean, configureVisuals?: boolean } = { extractCharacters: true, configureVoice: true, genderPreference: 'any', keepExistingVoice: false, configureVisuals: true }) => { 
        if (!scriptRef.current.trim()) { showNotification("Please provide a script to analyze."); return; } 
        setIsAnalyzingScriptContent(true); 
        if (options.extractCharacters) setIsExtractingCharacters(true);
        if (options.configureVisuals) setIsAnalyzingVisuals(true);
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController(); 
        showNotification("Analyzing script content... Est. time: ~30s"); 
        
        let currentStep = 0;
        const totalSteps = (options.extractCharacters ? 1 : 0) + (autoConfigCamera ? 1 : 0) + (options.configureVoice ? 1 : 0);
        
        const updateProgress = (stepMsg: string, subStep?: string) => {
            currentStep++;
            const progressPercent = Math.round((currentStep / totalSteps) * 100);
            const remainingSteps = totalSteps - currentStep;
            setPromptGenerationProgress({ 
                current: progressPercent, 
                total: 100, 
                message: `${stepMsg}${subStep ? `: ${subStep}` : ''} (${progressPercent}%) - ${remainingSteps} steps remaining`, 
                isStalled: false 
            });
        };

        try { 
            if (options.extractCharacters) { 
                setPromptGenerationProgress({ current: 5, total: 100, message: "Extracting characters from script...", isStalled: false });
                showNotification("AI is identifying characters and their traits...");
                const prompt = getCharacterExtractionPrompt(scriptRef.current, projectNicheRef.current); 
                const result = await executeGenerativeAiTask('', prompt, 'analyze script characters', jsonValidator); 
                if (stopGenerationRef.current) { showNotification("Analysis stopped."); return; } 
                const responseText = result.text; 
                const cleanedJson = extractJsonFromString(responseText); 
                const parsedData = JSON.parse(cleanedJson); 
                if (parsedData.characters && parsedData.characters.length > 0) { 
                    const newProfiles = parsedData.characters.map((c: { name: string, description: string }) => ({ 
                        id: crypto.randomUUID(), 
                        name: c.name, 
                        userDescription: '', 
                        aiDescription: c.description ? c.description.trim() : '', 
                        image: null 
                    })); 
                    setCharacterProfiles(prev => {
                        const updated = [...prev];
                        newProfiles.forEach((newProfile, index) => {
                            if (updated[index]) {
                                // Update AI description but PRESERVE existing name and userDescription if they exist
                                updated[index].aiDescription = newProfile.aiDescription;
                                if (!updated[index].name) {
                                    updated[index].name = newProfile.name;
                                }
                            } else {
                                updated.push(newProfile);
                            }
                        });
                        return updated;
                    }); 
                    showNotification(`Script analyzed! ${newProfiles.length} character profiles created.`); 
                } else { 
                    showNotification("No distinct characters found."); 
                    setCharacterProfiles([{ id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }]); 
                } 
                updateProgress("Characters extracted", `${parsedData.characters?.length || 0} found`);
            } 
            
            if (autoConfigCamera && options.configureVisuals) {
                setPromptGenerationProgress({ 
                    current: Math.round((currentStep / totalSteps) * 100) + 5, 
                    total: 100, 
                    message: "Analyzing optimal visual settings...", 
                    isStalled: false 
                });
                showNotification("AI is determining best themes, styles, and camera angles...");
                const anglePrompt = getScriptVisualsConfigPrompt(scriptRef.current);
                const angleResult = await executeGenerativeAiTask('', anglePrompt, 'analyze visual settings', jsonValidator);
                
                if (stopGenerationRef.current) return;

                const angleText = angleResult.text;
                if (angleText) {
                    const cleanedAngleJson = extractJsonFromString(angleText);
                    try {
                        const angleData = JSON.parse(cleanedAngleJson);
                        if (angleData.suggestedThemes && Array.isArray(angleData.suggestedThemes) && angleData.suggestedThemes.length > 0) {
                            setSelectedThemes(angleData.suggestedThemes);
                        }
                        if (angleData.suggestedModifiers && Array.isArray(angleData.suggestedModifiers) && angleData.suggestedModifiers.length > 0) {
                            setSelectedModifiers(angleData.suggestedModifiers);
                        }
                        if (angleData.suggestedAngles && Array.isArray(angleData.suggestedAngles) && angleData.suggestedAngles.length > 0) {
                            setCameraAngle(angleData.suggestedAngles);
                            showNotification(`Visuals set to: ${angleData.suggestedThemes?.join(', ')}, ${angleData.suggestedAngles?.join(', ')}`);
                        }
                    } catch (e) {
                        console.error("Failed to parse visual settings JSON", e);
                    }
                }
                updateProgress("Visual settings analyzed");
            }

            if (options.configureVoice) { 
                setPromptGenerationProgress({ 
                    current: Math.round((currentStep / totalSteps) * 100) + 5, 
                    total: 100, 
                    message: "Auto-configuring voiceover settings...", 
                    isStalled: false 
                });
                showNotification("AI is selecting the best voice and tone...");
                await voiceover.autoConfigureVoiceover(scriptRef.current, options.genderPreference, options.keepExistingVoice); 
                updateProgress("Voiceover configured");
            } 
            showNotification("Script analysis complete!");
        } catch (e: any) { 
            if (e.message !== "stopped" && e.message !== "ENV_LIMIT_REACHED" && e.message !== "FATAL_STOP" && e.message !== "OPENROUTER_LIMIT_REACHED" && e.message !== "CUSTOM_LIMIT_REACHED") 
                handleError(e, 'analyze script', {}); 
        } finally { 
            setIsAnalyzingScriptContent(false); 
            setIsExtractingCharacters(false);
            setIsAnalyzingVisuals(false);
            setPromptGenerationProgress(null);
        } 
    };

    const handleAddCharacter = () => { setCharacterProfiles(prev => [{ id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }, ...prev]); }; 
    const handleRemoveCharacter = (id: string) => { setCharacterProfiles(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : [{ id: crypto.randomUUID(), userDescription: '', aiDescription: '', image: null }]); }; 
    const handleCharacterDescriptionChange = (id: string, value: string) => { setCharacterProfiles(prev => prev.map(p => p.id === id ? { ...p, userDescription: value } : p)); };
    const handleCharacterAiDescriptionChange = (id: string, value: string) => { setCharacterProfiles(prev => prev.map(p => p.id === id ? { ...p, aiDescription: value } : p)); };
    const handleSavePreset = () => { 
        if (!newPresetName.trim()) { showNotification("Please enter a name for the preset."); return; } 
        if (stylePresets.some(p => p.name === newPresetName.trim())) { showNotification("A preset with this name already exists."); return; } 
        const newPreset: StylePreset = { 
            name: newPresetName.trim(), 
            themes: selectedThemes, 
            modifiers: selectedModifiers, 
            angle: cameraAngle
        }; 
        const updatedPresets = [...stylePresets, newPreset]; 
        setStylePresets(updatedPresets); 
        localStorage.setItem('stylePresets', JSON.stringify(updatedPresets)); 
        setNewPresetName(''); 
        showNotification(`Preset "${newPreset.name}" saved!`); 
    }; 
    const handleLoadPreset = (preset: StylePreset) => { 
        setSelectedThemes(preset.themes); 
        setSelectedModifiers(preset.modifiers); 
        setCameraAngle(Array.isArray(preset.angle) ? preset.angle : [preset.angle as string]); 
        showNotification(`Preset "${preset.name}" loaded!`); 
    }; 
    const handleDeletePreset = (presetName: string) => { const updatedPresets = stylePresets.filter(p => p.name !== presetName); setStylePresets(updatedPresets); localStorage.setItem('stylePresets', JSON.stringify(updatedPresets)); showNotification(`Preset "${presetName}" deleted.`); };
    const handleProjectResetReminderOk = () => {
        setShowProjectResetReminder(false);
    };

    const handleProjectResetReminderClearNow = async () => {
        setShowProjectResetReminder(false);
        const savedScript = script; // Preserve whatever was just pasted or typed
        await handleConfirmClearAllProjects();
        // Restore the script after clearing if it was a paste
        setTimeout(() => {
            if (savedScript) {
                setScript(savedScript);
            }
        }, 100);
    };

    const handleConfirmClearAllProjects = async () => { 
        try { 
            // BUG FIX: Reset the current state in memory BEFORE clearing the database.
            resetProjectState();
            await dbHelper.clearAllProjects(); 
            setSavedProjects([]); 
            await calculateStorageUsage(); 
            showNotification("All projects have been cleared from the browser."); 
        } catch (e: any) { 
            showNotification(`Error clearing projects: ${e.message}`); 
            handleError({ message: e.message, stack: e.stack }, "Clear All Projects", {}); 
        } finally { 
            setShowClearAllProjectsConfirm(false); 
        } 
    };
    
    const handleTranslateScript = async (targetLanguage: 'English' | 'Bengali' | 'Hindi') => {
        if (!script.trim()) {
            showNotification("No script to translate.");
            return;
        }
        setIsTranslating(true);
        setOriginalScript(script); // Save original script before starting
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController();
        const operation = `Translating to ${targetLanguage}`;
        showNotification(`${operation}...`);
        setPromptGenerationProgress({ current: 0, total: 100, message: `${operation}...`, isStalled: false });
        
        try {
            if (useChunking) {
                const scriptChunks = splitScriptIntoMeaningfulChunks(script, chunkSize);
                const translatedChunks = new Array(scriptChunks.length);
                showNotification(`Translating in ${scriptChunks.length} chunks...`);
                setChunkProcessingProgress({ currentChunk: 0, totalChunks: scriptChunks.length, progress: 0, message: `${operation} starting...` });

                for (let i = 0; i < scriptChunks.length; i++) {
                    if (stopGenerationRef.current) throw new Error("stopped");
                    
                    const baseProgress = (i / scriptChunks.length) * 100;
                    const targetProgress = ((i + 1) / scriptChunks.length) * 100;
                    const progressGap = targetProgress - baseProgress;
                    let currentSimulated = 0;
                    
                    const timerId = setInterval(() => {
                        currentSimulated += (progressGap * 0.05);
                        if (currentSimulated > progressGap * 0.95) {
                            currentSimulated = progressGap * 0.95;
                        }
                        const displayPct = Math.round(baseProgress + currentSimulated);
                        
                        setChunkProcessingProgress(prev => prev ? { ...prev, progress: displayPct, message: `${operation} chunk ${i + 1} of ${scriptChunks.length}... (${displayPct}%)` } : null);
                        setPromptGenerationProgress(prev => prev ? { ...prev, current: displayPct, total: 100, message: `${operation} (Chunk ${i + 1}/${scriptChunks.length})... (${displayPct}%)` } : null);
                    }, 800);

                    const contextInstruction = (i > 0 && translatedChunks[i - 1])
                        ? `For context, the previous translated part ended with: "...${translatedChunks[i - 1].slice(-500)}". Ensure a smooth, natural transition.`
                        : 'This is the first part of the script.';
                    
                    try {
                        const prompt = getTranslationPrompt(scriptChunks[i], targetLanguage, contextInstruction);
                        const result = await executeGenerativeAiTask('', prompt, `translate chunk ${i+1}`);
                        
                        clearInterval(timerId);
                        
                        const finalPct = Math.round(targetProgress);
                        setChunkProcessingProgress({ currentChunk: i + 1, totalChunks: scriptChunks.length, progress: finalPct, message: `${operation} chunk ${i + 1} of ${scriptChunks.length}... (${finalPct}%)` });
                        setPromptGenerationProgress({ current: finalPct, total: 100, message: `${operation} (Chunk ${i + 1}/${scriptChunks.length})... (${finalPct}%)`, isStalled: false });

                        if (!result.text || result.text.trim() === '') {
                            throw new Error(`Chunk ${i + 1} translation failed to return valid content.`);
                        }
                        translatedChunks[i] = result.text.trim();
                        
                        // Live update the text area with translated chunks + remaining original chunks
                        const currentLiveScript = [...translatedChunks.slice(0, i + 1), ...scriptChunks.slice(i + 1)].join('\n\n');
                        setScript(currentLiveScript);
                    } catch (error) {
                        clearInterval(timerId);
                        throw error;
                    }
                }

                if (stopGenerationRef.current) throw new Error("stopped");
                const finalScript = sanitizeAiGeneratedScript(translatedChunks.join('\n\n'));
                setScript(finalScript);
                voiceover.setVoiceoverScript(finalScript);
            } else {
                const prompt = getTranslationPrompt(script, targetLanguage);
                const result = await executeGenerativeAiTask('', prompt, `translate to ${targetLanguage}`);
                const translatedScript = result.text;
                if (translatedScript) {
                    const sanitized = sanitizeAiGeneratedScript(translatedScript);
                    setScript(sanitized);
                    voiceover.setVoiceoverScript(sanitized);
                } else {
                    throw new Error("AI did not return a translation.");
                }
            }
            showNotification("Script translated successfully!");
        } catch (e: any) {
            if (e.message !== "stopped" && e.message !== "OPENROUTER_LIMIT_REACHED") 
                handleError(e, 'translate script', {});
        } finally {
            setIsTranslating(false);
            setChunkProcessingProgress(null);
            setPromptGenerationProgress(null);
        }
    };


    const enabledStepsConfig = [
        { id: 1, text: 'Refine Story / Rephrase...', enabled: () => (refineStoryInAutopilot || rephraseInAutopilot || generateUniqueStory), task: async () => { if (refineStoryInAutopilot) { showNotification("Autopilot: Generating Refine Suggestions..."); const language = detectLanguage(scriptRef.current); const prompt = getRefineStorySuggestionsPrompt(scriptRef.current); const toolsConfig = apiProvider === 'google' ? { tools: [{ googleSearch: {} }] } : undefined; const result = await executeGenerativeAiTask('', prompt, 'generating suggestions', jsonValidator, toolsConfig); const responseText = result.text; const cleanedJson = extractJsonFromString(responseText); const parsedData = JSON.parse(cleanedJson).suggestions; if (parsedData && parsedData.length > 0) { setStorySuggestions(parsedData); setIsRefineModalVisible(true); autopilotPausedForRefineRef.current = true; setIsAutopilotModalVisible(false); throw new Error("PAUSED_FOR_USER_INPUT"); } else { throw new Error("Autopilot failed to generate story suggestions."); } } else { await handleRephraseScript(); } } },
        { id: 2, text: 'Analyze Script for Characters', enabled: () => analyzeScriptInAutopilot, task: () => handleAnalyzeScript({ extractCharacters: true, configureVoice: false }) },
        { id: 3, text: 'Auto-Configure Voiceover', enabled: () => useAiToAutoConfigureVoiceover, task: () => voiceover.autoConfigureVoiceover(scriptRef.current, autopilotVoiceGender, !useUserSelectedVoiceInAutopilot) },
        { id: 4, text: 'Generating Image Prompts & Images...', enabled: () => true, task: executePromptAndImageGeneration },
        { id: 5, text: 'Generating Video Prompts...', enabled: () => true, task: async () => {
            if (resultsRef.current.length === 0) {
                await handleGenerateVideoPrompts(imageCount, scriptRef.current);
            } else {
                await handleGenerateVideoPrompts();
            }
        } },
        { id: 6, text: 'Preparing & Downloading Assets...', enabled: () => true, task: () => handleAutopilotDownloads() },
        { id: 7, text: 'Generating & Downloading Voiceover...', enabled: () => true, task: () => voiceover.handleAudioAutopilot() }
    ];

    const handleOpenAutopilotModal = () => { if (!script.trim()) { showNotification("Please provide a script before starting the Autopilot."); return; } if (generateUniqueStory) { setRephraseInAutopilot(true); } setIsAutopilotModalVisible(true); if (!autopilotProgress || autopilotCompleted || (autopilotProgress && autopilotProgress.isError && autopilotProgress.stepId !== 4 && autopilotProgress.stepId !== 7)) { autopilotStopRef.current = false; autopilotPauseRef.current = false; setIsAutopilotPaused(false); setAutopilotProgress(null); setAutopilotCompleted(false); setAutopilotElapsedTime(0); } };
    const runAutopilotSteps = async (startingStepId = 1) => { if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); autopilotTimerRef.current = window.setInterval(() => setAutopilotElapsedTime(prev => prev + 1), 1000); const activeSteps = enabledStepsConfig.filter(s => s.enabled()); const totalSteps = activeSteps.length; const startingStepIndex = activeSteps.findIndex(s => s.id === startingStepId); if (startingStepIndex === -1) { console.warn(`Step ${startingStepId} not enabled. Finding next available step.`); } let loopStartIndex = startingStepIndex !== -1 ? startingStepIndex : 0; if (startingStepId === 2 && startingStepIndex === -1) { const step3Index = activeSteps.findIndex(s => s.id === 3); if (step3Index !== -1) loopStartIndex = step3Index; } try { for (let i = loopStartIndex; i < activeSteps.length; i++) { const step = activeSteps[i]; setAutopilotProgress({ step: i + 1, totalSteps, stepId: step.id, message: step.text, isError: false }); while (autopilotPauseRef.current) { if (autopilotStopRef.current) throw new Error('stopped'); await new Promise(resolve => setTimeout(resolve, 500)); } if (step.id === 6) { const completedImages = resultsRef.current.filter(r => r.imageStatus === 'completed'); if (completedImages.length === 0) { console.warn("No images completed for download."); } } if (autopilotStopRef.current) throw new Error('stopped'); await step.task(); await new Promise(resolve => setTimeout(resolve, 1000)); } setAutopilotCompleted(true); setAutopilotProgress(null); clearInterval(autopilotTimerRef.current!); showNotification("Master Autopilot Completed Successfully!"); } catch (e: any) { if (e.message === 'stopped') { showNotification("Autopilot stopped by user."); setAutopilotProgress(null); } else if (e.message === 'PAUSED_FOR_USER_INPUT') { if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); } else if (e.message === 'ENV_LIMIT_REACHED' || e.message === 'OPENROUTER_LIMIT_REACHED') { 
setAutopilotProgress(prev => prev ? { ...prev, isError: true, message: `Paused: API Limit Exceeded.` } : null); if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); } else { console.error("Autopilot Error:", e); let errorMsg = e.message; if (e.message === 'NO_IMAGES_COMPLETED') errorMsg = "No generated images found to download."; else if (e.message === 'AUDIO_GENERATION_FAILED') errorMsg = "Audio generation failed."; 
setAutopilotProgress(prev => prev ? { ...prev, isError: true, message: `Error: ${errorMsg}` } : null); 
handleError(e, 'Autopilot Process', {}); if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); } } };
    const handleStopAutopilot = () => { autopilotStopRef.current = true; if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); };
    const handlePauseResumeAutopilot = () => { if (isAutopilotPaused) { autopilotPauseRef.current = false; setIsAutopilotPaused(false); } else { autopilotPauseRef.current = true; setIsAutopilotPaused(true); } };
    const handleSkipAutopilotStage = () => { if (autopilotProgress) { const currentStepId = autopilotProgress.stepId; const activeSteps = enabledStepsConfig.filter(s => s.enabled()); const currentStepIndex = activeSteps.findIndex(s => s.id === currentStepId); if (currentStepIndex !== -1 && currentStepIndex < activeSteps.length - 1) { const nextStepId = activeSteps[currentStepIndex + 1].id; runAutopilotSteps(nextStepId); } else { setAutopilotCompleted(true); setAutopilotProgress(null); if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); showNotification("Master Autopilot Completed (Skipped to end)!"); } } };
    const handleRetryAutopilotStage = () => { if (autopilotProgress) { runAutopilotSteps(autopilotProgress.stepId); } };
    const handleResetAutopilot = () => { setAutopilotProgress(null); setAutopilotCompleted(false); setAutopilotElapsedTime(0); setIsAutopilotModalVisible(false); };

    const handleAcceptCharacterConsistency = () => {
        setShowCharacterConsistencyModal(false);
        setApiProvider('google');
        if (pendingVideoAnalysisArgs) {
            const { file, isVisualRemake, remakeType, framesPerBatch, extractScriptAndStyles, generatePromptsDirectly, extractCharacters, resumeFromSegment } = pendingVideoAnalysisArgs;
            handleVideoFileSelect(file, isVisualRemake, remakeType, framesPerBatch, extractScriptAndStyles, generatePromptsDirectly, extractCharacters, resumeFromSegment);
            setPendingVideoAnalysisArgs(null);
        }
    };

    const handleDenyCharacterConsistency = () => {
        setShowCharacterConsistencyModal(false);
        if (pendingVideoAnalysisArgs) {
            const { file, isVisualRemake, remakeType, framesPerBatch, extractScriptAndStyles, generatePromptsDirectly, extractCharacters, resumeFromSegment } = pendingVideoAnalysisArgs;
            handleVideoFileSelect(file, isVisualRemake, remakeType, framesPerBatch, extractScriptAndStyles, generatePromptsDirectly, extractCharacters, resumeFromSegment, true);
            setPendingVideoAnalysisArgs(null);
        }
    };

    // Left for future expansion if we need to show a tip when large scripts are pasted
    const handleScriptPaste = (pastedText: string) => {
        // We could trigger semantic chunking analysis here later
    };

    const handleVideoFileStage = (file: File, isVisualRemake: boolean) => {
    };

    if (!isCoreSystemLoaded) { 
        return <SysLoader message={lockMessage} onUnlock={handleUnlockSuccess} onDevLogin={handleDevLogin} isVerifyingSession={verifying} />; 
    }
    
    const areKeysDisabled = (apiProvider === 'google' && !useEnvApiKey && enabledApiKeys.length === 0) || 
                            (apiProvider === 'openrouter' && !openRouterApiKey);

    return (
        <div className="app">
            {autoRetryCountdown !== null && autoRetryCountdown > 0 && (
                <div style={{ position: 'fixed', top: '90px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', color: '#000', padding: '0.3rem 0.75rem', zIndex: 10005, fontWeight: '700', fontSize: '0.78rem', borderRadius: '8px', boxShadow: '0 0 15px rgba(255, 210, 0, 0.6)', width: 'auto', maxWidth: '320px' }}>
                    API Limit Reached. Retrying in {autoRetryCountdown}s...
                </div>
            )}
            {isDevMode && (
                <div className="dev-mode-banner">
                    <button onClick={handleExitDevMode} className="dev-exit-btn">Exit Dev Mode</button>
                </div>
            )}
            <StatusIndicators 
                notifications={notifications}
                isLoading={isLoading}
                isBatchGenerating={isBatchGenerating}
                results={results}
                isGlobalBusy={isGlobalBusy} 
                promptGenerationProgress={promptGenerationProgress} 
                chunkProcessingProgress={chunkProcessingProgress}
                rateLimitCountdown={rateLimitCountdown}
            />

            <div 
                className={`fab-container ${isFabExpanded ? 'expanded' : ''} ${isGlobalBusy ? 'busy' : ''}`}
                onMouseEnter={() => !isGlobalBusy && setIsFabExpanded(true)}
                onMouseLeave={() => !isGlobalBusy && setIsFabExpanded(false)}
            >
                {!isGlobalBusy && <div className="fab-hover-bridge"></div>}

                {!isGlobalBusy && (
                    <button 
                        className="fab-action-btn fab-top" 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        title="Go to Top"
                    >
                        <ArrowUpIcon />
                        <span className="fab-label">Top</span>
                    </button>
                )}

                <button 
                    className={`fab-action-btn fab-main-btn ${isGlobalBusy ? 'spinning' : ''}`}
                    onClick={() => {
                        if (!isGlobalBusy) {
                            document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    title={isGlobalBusy ? "Processing..." : "Go to Middle"}
                >
                    {isGlobalBusy ? (
                        <div className="loader small-loader" style={{borderColor: '#000', borderTopColor: 'transparent', width: '20px', height: '20px'}}></div>
                    ) : (
                        <>
                            <ArrowDownIcon />
                            <span className="fab-label">Mid</span>
                        </>
                    )}
                </button>

                {!isGlobalBusy && (
                    <button 
                        className="fab-action-btn fab-bottom" 
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        title="Go to Bottom"
                    >
                        <ArrowDownIcon />
                        <span className="fab-label">Down</span>
                    </button>
                )}
            </div>

            {isConfirmModalVisible && (
                <ConfirmationModal 
                    onConfirm={handleConfirmGeneration} 
                    onCancel={() => setIsConfirmModalVisible(false)} 
                    imageCount={results.length > 0 ? results.length : imageCount} 
                    isAutopilot={isAutopilot} 
                    resumableTask={resumableTask} 
                    taskTypeForConfirmation="auto_scene_gen"
                    isAutoMode={videoPromptBasis === 'script-driven-auto'}
                    completedCount={Math.max(0, results.filter(r => r && r.imageStatus === 'completed').length)}
                    totalCount={results.length > 0 ? results.length : imageCount}
                />
            )}
            {showVideoPromptConfirmModal && (
                <ConfirmationModal
                    onConfirm={handleConfirmVideoPromptGeneration}
                    onCancel={() => setShowVideoPromptConfirmModal(false)}
                    imageCount={videoPromptGenArgs?.count || imageCount || 1}
                    isAutopilot={isAutopilot}
                    resumableTask={resumableTask}
                    taskTypeForConfirmation="video_prompt_gen"
                    isAutoMode={videoPromptBasis === 'script-driven-auto'}
                    completedCount={Math.max(0, results.filter(r => r && (r.videoPromptStatus === 'completed' || (r.video_prompt && r.video_prompt.trim() !== '' && !r.video_prompt.startsWith("Error:")))).length)}
                    totalCount={videoPromptGenArgs?.count || imageCount || 1}
                />
            )}
            {showImagePromptConfirmModal && (
                <ConfirmationModal
                    onConfirm={handleConfirmImagePromptGeneration}
                    onCancel={() => setShowImagePromptConfirmModal(false)}
                    imageCount={imagePromptGenArgs?.count || imageCount || 1}
                    isAutopilot={isAutopilot}
                    resumableTask={resumableTask}
                    taskTypeForConfirmation="auto_scene_gen"
                    completedCount={Math.max(0, results.filter(r => r && r.image_prompt && r.image_prompt.trim() !== '').length)}
                    totalCount={imagePromptGenArgs?.count || imageCount || 1}
                />
            )}
            {showEnvLimitModal && (
                <QuotaLimitModal 
                    limitType={quotaLimitType}
                    isEnvKey={useEnvApiKeyRef.current}
                    providerName={quotaProvider}
                    onOk={() => { 
                        setShowEnvLimitModal(false); 
                        handleStopGeneration(); 
                    }} 
                    onSwitchToCustom={() => { 
                        setUseEnvApiKey(false); 
                        setShowEnvLimitModal(false); 
                        handleStopGeneration(); 
                        showNotification("Switched to Custom API Keys. Please Resume or Retry if needed."); 
                    }} 
                />
            )}
            {rateLimitDecision && (
                <RateLimitDecisionModal
                    provider={rateLimitDecision.provider}
                    onWait={() => rateLimitDecision.resolve('wait')}
                    onCancel={() => rateLimitDecision.resolve('stop')}
                />
            )}
            {veo.showMismatchWarning && <MismatchWarningModal onConfirm={veo.executeVideoGeneration} onCancel={veo.handleCancelMismatch} fromModel={results[0]?.video_prompt ? videoModel : 'Unknown'} toModel={videoModel} />}
            {projectToDelete && <DeleteConfirmationModal projectName={projectToDelete} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
            {showProjectResetReminder && <ProjectResetReminderModal onOk={handleProjectResetReminderOk} onClearNow={handleProjectResetReminderClearNow} />}
            {showClearAllProjectsConfirm && <ClearAllProjectsConfirmationModal onConfirm={handleConfirmClearAllProjects} onCancel={() => setShowClearAllProjectsConfirm(false)} />}
            {previewResult && <ImagePreviewModal 
                result={previewResult} 
                viewMode={previewMode}
                onClose={() => setPreviewResult(null)} 
                onCopyPrompt={(text) => copyToClipboard(text, `preview-${previewResult.image_prompt || previewResult.video_prompt}`)}
                onPromptChange={(newPrompt) => {
                    const idx = results.findIndex(r => r === previewResult || (r.image_prompt === previewResult.image_prompt && r.scene_description === previewResult.scene_description));
                    if (idx !== -1) {
                        const isVideo = previewMode === 'videos';
                        handlePromptChange(idx, newPrompt, isVideo ? 'video' : 'image');
                        setPreviewResult(prev => prev ? { ...prev, [isVideo ? 'video_prompt' : 'image_prompt']: newPrompt } : null);
                    }
                }}
            />}
            {isRefineModalVisible && <RefineStoryModal suggestions={storySuggestions} onSelect={handleApplyRefineSuggestion} onClose={() => setIsRefineModalVisible(false)} isLoading={isBrainstorming} />}
            {showCharacterConsistencyModal && <CharacterConsistencyModal onAccept={handleAcceptCharacterConsistency} onDeny={handleDenyCharacterConsistency} onCancel={() => setShowCharacterConsistencyModal(false)} providerName={apiProvider === 'custom' || localStorage.getItem('apiProvider') === 'customRouter' || apiProvider === 'customRouter' ? 'Custom Router' : (apiProvider === 'openrouter' ? 'OpenRouter' : 'Groq')} />}
            <ProgressModal visible={isRefiningStory && refineProgress !== null} currentChunk={refineProgress?.currentChunk || 0} totalChunks={refineProgress?.totalChunks || 0} progress={refineProgress?.progress || 0} message={refineProgress?.message || ''} onStop={handleStopGeneration} />
            <AutopilotModal isVisible={isAutopilotModalVisible} onClose={() => setIsAutopilotModalVisible(false)} autopilotProgress={autopilotProgress} autopilotCompleted={autopilotCompleted} autopilotElapsedTime={autopilotElapsedTime} autopilotSteps={autopilotSteps} generateUniqueStory={generateUniqueStory} rephraseInAutopilot={rephraseInAutopilot} setRephraseInAutopilot={setRephraseInAutopilot} refineStoryInAutopilot={refineStoryInAutopilot} setRefineStoryInAutopilot={setRefineStoryInAutopilot} analyzeScriptInAutopilot={analyzeScriptInAutopilot} setAnalyzeScriptInAutopilot={setAnalyzeScriptInAutopilot} useAiToAutoConfigureVoiceover={useAiToAutoConfigureVoiceover} setUseAiToAutoConfigureVoiceover={setUseAiToAutoConfigureVoiceover} useUserSelectedVoiceInAutopilot={useUserSelectedVoiceInAutopilot} setUseUserSelectedVoiceInAutopilot={setUseUserSelectedVoiceInAutopilot} autopilotVoiceGender={autopilotVoiceGender} setAutopilotVoiceGender={setAutopilotVoiceGender} isAutopilotPaused={isAutopilotPaused} onStart={() => runAutopilotSteps(1)} onStop={handleStopAutopilot} onPauseResume={handlePauseResumeAutopilot} onSkip={handleSkipAutopilotStage} onRetry={handleRetryAutopilotStage} onReset={handleResetAutopilot} />

            <main>
                <CoreHeader onLogout={handleLogout} />
                <NavUnit onOpenAutopilot={handleOpenAutopilotModal} isAutopilotDisabled={!script.trim()} onScrollToNotifications={() => notificationLogRef.current?.scrollIntoView({ behavior: 'smooth' })} onScrollToErrors={() => errorLogRef.current?.scrollIntoView({ behavior: 'smooth' })} theme={theme} setTheme={setTheme} palette={palette} setPalette={setPalette} />
                <div className="global-settings">
                    <ProjectManager projectName={projectName} setProjectName={setProjectName} handleSaveProject={handleSaveProject} handleLoadProject={handleLoadProjectFromFile} storageUsage={storageUsage} setShowClearAllProjectsConfirm={setShowClearAllProjectsConfirm} savedProjects={savedProjects} handleDeleteProject={handleDeleteProject} autoSaveEnabled={autoSaveEnabled} setAutoSaveEnabled={setAutoSaveEnabled} aiTaskModels={aiTaskModels} apiProvider={apiProvider} isOpenRouterPaid={isOpenRouterPaid} />
                    <ApiKeyManager 
                        apiProvider={apiProvider} 
                        setApiProvider={setApiProvider} 
                        openRouterApiKey={openRouterApiKey} 
                        setOpenRouterApiKey={setOpenRouterApiKey}
                        isOpenRouterPaid={isOpenRouterPaid}
                        setIsOpenRouterPaid={setIsOpenRouterPaid}
                        customRouterBaseUrl={customRouterBaseUrl}
                        setCustomRouterBaseUrl={setCustomRouterBaseUrl}
                        customRouterApiKey={customRouterApiKey}
                        setCustomRouterApiKey={setCustomRouterApiKey}
                        customRouterModelId={customRouterModelId}
                        setCustomRouterModelId={setCustomRouterModelId}
                        newApiKey={newApiKey} 
                        setNewApiKey={setNewApiKey} 
                        handleAddApiKey={handleAddApiKey} 
                        useEnvApiKey={useEnvApiKey} 
                        setUseEnvApiKey={(val) => {
                            setUseEnvApiKey(val);
                            if (val) {
                                setShowProjectResetReminder(true);
                            }
                        }}
                        enabledApiKeys={enabledApiKeys} 
                        apiKeys={apiKeys} 
                        handleToggleApiKey={handleToggleApiKey} 
                        handleRemoveApiKey={handleRemoveApiKey} 
                        onApiKeyPaste={() => {
                            setShowProjectResetReminder(true);
                        }}
                    />
                    <GeminiTaskModelsCard 
                        aiTaskModels={aiTaskModels} 
                        setAiTaskModels={setAiTaskModels} 
                        disabled={apiProvider !== 'google'} 
                    />
                </div>
                <div className={`workspace ${areKeysDisabled ? 'disabled' : ''}`}>
                    {areKeysDisabled && <div className="workspace-disabled-overlay"><h3>No Active API Key</h3><p>Please add and enable a Gemini API Key in the &quot;API Key Management&quot; section above, enable the &quot;Built-in Environment Key&quot;, OR provide an OpenRouter API Key to continue.</p></div>}
                    
                    <div className="control-panel">
                        <VideoAnalyzerCard videoUrl={videoUrl} setVideoUrl={setVideoUrl} isAnalyzingUrl={isAnalyzingUrl} onDeconstruct={handleDeconstructVideoUrl} onVideoFileSelect={handleVideoFileSelect} onVideoFileStage={handleVideoFileStage} onStop={handleStopGeneration} resumableSegment={resumableTask?.type === 'visual_remake' ? resumableTask.progress : null} isVisualRemakeMode={isVisualRemakeMode} setIsVisualRemakeMode={setIsVisualRemakeMode} />
                        <ScriptAssistantCard scriptIdea={scriptIdea} setScriptIdea={setScriptIdea} isGeneratingScript={isGeneratingScript} onGenerate={handleGenerateScript} onStop={handleStopGeneration} />
                        
                        <ScriptInputSection 
                            script={script} setScript={setScript} scriptType={scriptType} fileInputRef={fileInputRef} handleFileChange={handleFileChange} fileName={fileName} 
                            generateUniqueStory={generateUniqueStory} setGenerateUniqueStory={setGenerateUniqueStory} isRephrasing={isRephrasing} handleRephraseScript={handleRephraseScript} 
                            isAnalyzingScriptContent={isAnalyzingScriptContent} handleAnalyzeScript={handleAnalyzeScript} onStop={handleStopGeneration} 
                            handleRefineStory={handleRefineStory} isBrainstorming={isBrainstorming} 
                            extractCharacters={analyzeScriptInAutopilot} setExtractCharacters={setAnalyzeScriptInAutopilot} 
                            configureVoice={useAiToAutoConfigureVoiceover} setConfigureVoice={setUseAiToAutoConfigureVoiceover} 
                            autoConfigCamera={autoConfigCamera} setAutoConfigCamera={setAutoConfigCamera}
                            onTranslateScript={handleTranslateScript} isTranslating={isTranslating}
                            useChunking={useChunking} setUseChunking={setUseChunking}
                            chunkSize={chunkSize} setChunkSize={setChunkSize}
                            apiProvider={apiProvider}
                            originalScript={originalScript}
                            onScriptPaste={handleScriptPaste}
                            isOptionsGlowActive={(script && script.trim().length > 0) || isVisualRemakeMode}
                        />
                        <ConfigPanel 
                            apiProvider={apiProvider}
                            openRouterImageModel={openRouterImageModel}
                            setOpenRouterImageModel={setOpenRouterImageModel}
                            openRouterTextModel={openRouterTextModel}
                            setOpenRouterTextModel={setOpenRouterTextModel}
                            openRouterModelMode={openRouterModelMode}
                            setOpenRouterModelMode={setOpenRouterModelMode}
                            videoDuration={videoDuration} setVideoDuration={setVideoDuration} 
                            videoDurationSec={videoDurationSec} setVideoDurationSec={setVideoDurationSec} 
                            imageCount={imageCount} setImageCount={setImageCount} 
                            imageModel={imageModel} setImageModel={setImageModel} 
                            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} 
                            disabled={isLoading || isBatchGenerating} 
                            autoBreakdown={autoBreakdown} setAutoBreakdown={handleAutoBreakdownChange}
                            dynamicChunkSize={dynamicChunkSize} setDynamicChunkSize={setDynamicChunkSize} dynamicChunkSizeRef={dynamicChunkSizeRef}
                            videoBatchSize={videoBatchSize} setVideoBatchSize={setVideoBatchSize}
                            videoBatchDelay={videoBatchDelay} setVideoBatchDelay={setVideoBatchDelay}
                            projectNiche={projectNiche} setProjectNiche={handleProjectNicheChange}
                            targetSceneDuration={targetSceneDuration} setTargetSceneDuration={setTargetSceneDuration}
                            isOptionsGlowActive={(script && script.trim().length > 0) || isVisualRemakeMode}
                            nicheSectionRef={nicheSectionRef}
                            highlightNiche={highlightNiche}
                        />
                        <StyleReferenceCard isDragging={isDraggingRef} setIsDragging={setIsDraggingRef} onDrop={handleDrop} onPaste={handlePaste} fileInputRef={refImageInputRef} onFileUpload={handleReferenceImageUpload} referenceFiles={referenceFiles} onDeleteFile={handleDeleteReferenceFile} />
                        {/* Fix: Passed the correct function `handleCharacterImageUpload` to the `handleImageUpload` prop. */}
                        <CharacterManager characterProfiles={characterProfiles} handleAddCharacter={handleAddCharacter} handleRemoveCharacter={handleRemoveCharacter} handleCharacterDescriptionChange={handleCharacterDescriptionChange} handleCharacterAiDescriptionChange={handleCharacterAiDescriptionChange} handleSetCharacterProfiles={setCharacterProfiles} isDraggingChar={isDraggingChar} handleDragOver={(e, id) => { e.preventDefault(); setIsDraggingRef(true); setIsDraggingChar(id); }} handleDragLeave={() => { setIsDraggingRef(false); setIsDraggingChar(null); }} handleDrop={(e, id) => handleCharacterImageDrop(e, id)} handlePaste={(e, id) => handleCharacterImagePaste(e, id)} characterImageInputRefs={characterImageInputRefs} handleImageUpload={handleCharacterImageUpload} isAnalyzingCharacter={isAnalyzingCharacter} onStop={handleStopGeneration} handleAnalyzeScript={handleAnalyzeScript} isExtractingCharacters={isExtractingCharacters} />
                        <StyleControlPanel 
                            themesVisible={themesVisible} setThemesVisible={setThemesVisible} 
                            selectedThemes={selectedThemes} handleThemeChange={handleThemeChange} 
                            modifiersVisible={modifiersVisible} setModifiersVisible={setModifiersVisible} 
                            selectedModifiers={selectedModifiers} handleModifierChange={handleModifierChange} 
                            useNegativePrompt={useNegativePrompt} setUseNegativePrompt={setUseNegativePrompt} 
                            negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt} 
                            newPresetName={newPresetName} setNewPresetName={setNewPresetName} 
                            handleSavePreset={handleSavePreset} stylePresets={stylePresets} 
                            handleLoadPreset={handleLoadPreset} handleDeletePreset={handleDeletePreset} 
                            cameraAnglesExpanded={isCameraExpanded} setCameraAnglesExpanded={setIsCameraExpanded}
                            cameraAngle={cameraAngle} handleAngleToggle={handleAngleToggle}
                            isOptionsGlowActive={(script && script.trim().length > 0) || isVisualRemakeMode} 
                            onAutoDetectStyle={handleAutoDetectStyle}
                            setSelectedThemes={setSelectedThemes}
                            setSelectedModifiers={setSelectedModifiers}
                            setCameraAngle={setCameraAngle}
                        />
                        <MainActionsCard isAutopilot={isAutopilot} setIsAutopilot={setIsAutopilot} isPausedByCircuitBreaker={isPausedByCircuitBreaker} handleResumeFromCircuitBreaker={handleResumeFromCircuitBreaker} isLoading={isLoading} isBatchGenerating={isBatchGenerating} handleStopGeneration={handleStopGeneration} handleGenerate={handleGenerate} isRephrasing={isRephrasing} isGeneratingScript={isGeneratingScript} isAnalyzing={isAnalyzing} results={results} handleRetryFailed={handleRetryFailed} isRetrying={isRetrying} />
                    </div>
                    <ResultsSection 
                        results={results} 
                        imageCount={imageCount} 
                        videoModel={videoModel} 
                        handlePromptChange={handlePromptChange} 
                        copyToClipboard={copyToClipboard} 
                        copiedInfo={copiedInfo} 
                        setPreviewImage={(res, mode) => { setPreviewResult(res); if(mode) setPreviewMode(mode); }} 
                        handleDownloadSingle={handleDownloadSingle} 
                        handleRegenerateImage={handleRegenerateImage} 
                        isBatchGenerating={isBatchGenerating} 
                        handleGenerateAllImages={handleGenerateAllImagesManual}
                        handleDownloadAllImagesZip={handleDownloadZip}
                        handleResetImagePrompts={handleClearGeneratedImagesOnly}
                    />
                    <div className="post-production-wrapper">
                        <VideoPromptSettings videoModel={videoModel} setVideoModel={setVideoModel} videoPromptBasis={videoPromptBasis} setVideoPromptBasis={setVideoPromptBasis} includeDialogue={includeDialogue} setIncludeDialogue={setIncludeDialogue} includeAmbient={includeAmbient} setIncludeAmbient={setIncludeAmbient} includeSfx={includeSfx} setIncludeSfx={setIncludeSfx} isGeneratingVideoPrompts={isGeneratingVideoPrompts} onStop={handleStopGeneration} onGenerate={triggerVideoPromptGeneration} results={results} script={script} handleExportPrompts={handleExportPrompts} handleGenerateOnlyPrompts={handleGenerateOnlyPrompts} imageCount={imageCount} handleDownloadVideoPrompts={handleDownloadVideoPrompts} handleDownloadCombinedPrompts={handleDownloadCombinedPrompts} isVideoPromptsGenerated={isVideoPromptsGenerated} isGeneratingTextPrompts={isGeneratingTextPrompts} onResetVideoPrompts={handleResetVideoPrompts} onResetImagePrompts={handleResetImagePrompts} onResetAll={() => { setResults([]); setIsVideoPromptsGenerated(false); localStorage.removeItem('resumable_task'); localStorage.removeItem('interim_results'); setResumableTask(null); setImageCount(0); showNotification('Storyboard has been reset.'); }} setImageCount={setImageCount} isOptionsGlowActive={(script && script.trim().length > 0) || isVisualRemakeMode} />
                        <VoiceoverGenerator 
                            isAutoConfiguringVoice={voiceover.isAutoConfiguringVoice} 
                            voiceoverScript={voiceover.voiceoverScript} 
                            setVoiceoverScript={voiceover.setVoiceoverScript} 
                            script={script} 
                            handleAudioAutopilot={voiceover.handleAudioAutopilot} 
                            isTTSBusy={voiceover.isGeneratingAudio || voiceover.isGeneratingChunks} 
                            wordCount={voiceover.voiceoverScript.trim().split(/\s+/).filter(Boolean).length} 
                            recommendedWords={Math.floor((((typeof videoDuration === 'number' ? videoDuration : 0) * 60) + (typeof videoDurationSec === 'number' ? videoDurationSec : 0) || 0) / 60) * (120 * voiceover.ttsConfig.speed)} 
                            estimatedSeconds={Math.ceil((voiceover.voiceoverScript.trim().split(/\s+/).filter(Boolean).length / 120) * 60)} 
                            targetSeconds={(typeof videoDuration === 'number' ? videoDuration : 0) * 60 + (typeof videoDurationSec === 'number' ? videoDurationSec : 0)} 
                            handleFitScriptToDuration={voiceover.handleFitScriptToDuration} 
                            isFittingScript={voiceover.isFittingScript} 
                            selectedTone={selectedTone} 
                            setSelectedTone={setSelectedTone} 
                            ttsConfig={voiceover.ttsConfig} 
                            setTtsConfig={voiceover.setTtsConfig} 
                            isAuditioning={voiceover.isAuditioning} 
                            handleAuditionVoice={voiceover.handleAuditionVoice} 
                            customTtsPrompt={voiceover.customTtsPrompt} 
                            setCustomTtsPrompt={voiceover.setCustomTtsPrompt} 
                            forceSpeed={voiceover.forceSpeed} 
                            setForceSpeed={voiceover.setForceSpeed} 
                            isGeneratingAudio={voiceover.isGeneratingAudio} 
                            isGeneratingChunks={voiceover.isGeneratingChunks} 
                            handleStopAudioGeneration={voiceover.handleStopAudioGeneration} 
                            handleStopChunkGeneration={voiceover.handleStopChunkGeneration} 
                            handleGenerateSample={voiceover.handleGenerateSample} 
                            isGeneratingSample={voiceover.isGeneratingSample} 
                            sampleAudioUrl={voiceover.sampleAudioUrl} 
                            projectName={projectName} 
                            handleGenerateVoiceover={voiceover.handleGenerateVoiceover} 
                            generatedAudioUrl={voiceover.generatedAudioUrl} 
                            handleDownloadAudio={voiceover.handleDownloadAudio} 
                            generatedAudioBytes={voiceover.generatedAudioBytes} 
                            handleGenerateChunkedAudio={voiceover.handleGenerateChunkedAudio} 
                            audioChunks={voiceover.audioChunks} 
                            handleRetrySingleAudioChunk={voiceover.handleRetrySingleAudioChunk} 
                            handleMergeAndDownload={voiceover.handleMergeAndDownload} 
                            isMergingAudio={voiceover.isMergingAudio} 
                            onProcessScript={voiceover.handleProcessScript} 
                            isProcessingScript={voiceover.isProcessingScript} 
                            onExportCleanScript={voiceover.handleExportCleanScript} 
                            isScriptProcessed={voiceover.isScriptProcessed}
                            processingOptions={voiceover.processingOptions} 
                            setProcessingOptions={voiceover.setProcessingOptions} 
                            chunkMode={voiceover.chunkMode}
                            setChunkMode={voiceover.setChunkMode}
                            useSelectedVoice={voiceover.useSelectedVoice} 
                            setUseSelectedVoice={voiceover.setUseSelectedVoice} 
                            autoConfigureVoiceover={voiceover.autoConfigureVoiceover} 
                            handleClearVoiceCache={voiceover.handleClearVoiceCache} 
                            handleDownloadAllChunksZip={voiceover.handleDownloadAllChunksZip} 
                        />
                        <VeoVideoGenerator veoApiKey={veo.veoApiKey} veoApiKeyInput={veo.veoApiKeyInput} setVeoApiKeyInput={veo.setVeoApiKeyInput} handleSaveVeoApiKey={veo.handleSaveVeoApiKey} handleClearVeoApiKey={veo.handleClearVeoApiKey} isGeneratingVideos={veo.isGeneratingVideos} handleStopVideoGeneration={veo.handleStopVideoGeneration} handleStartVideoGeneration={veo.handleStartVideoGeneration} selectedScenesForVideo={veo.selectedScenesForVideo} handleDownloadVideosZip={veo.handleDownloadVideosZip} results={results} handleSceneSelectionChange={veo.handleSceneSelectionChange} handlePromptChange={handlePromptChange} videoGenerationStatus={veo.videoGenerationStatus} handleDownloadSingleVideo={veo.handleDownloadSingleVideo} onRegenerateSinglePrompt={handleRegenerateSingleVideoPrompt} useEnvApiKey={useEnvApiKey} />
                    </div>
                    <div className="logs-and-info-wrapper">
                        <LogSection notificationLogRef={notificationLogRef} errorLogRef={errorLogRef} notificationLog={notificationLog} setNotificationLog={setNotificationLog} errorLog={errorLog} setErrorLog={setErrorLog} />
                        <InfoSection usageVisible={usageVisible} setUsageVisible={setUsageVisible} apiUsageVisible={apiUsageVisible} setApiUsageVisible={setApiUsageVisible} aboutVisible={aboutVisible} setAboutVisible={setAboutVisible} />
                    </div>
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);