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
