
                success = true; consecutiveApiFailuresRef.current = 0;
            } catch (e: any) {
                const failedKey = selectedKey; const isContentError = e.message.includes("Content validation failed");
                if (isContentError) { handleError(e, `Content Error on ${operation}`, { apiKey: failedKey, attempt: totalAttempts }); } else { handleError(e, `API Error on ${operation}`, { apiKey: failedKey, attempt: totalAttempts }); }
                
                if (useEnvApiKeyRef.current && (e.message?.includes('limit: 0') || (e.message?.toLowerCase().includes('quota') && !e.message?.includes('429')))) {
                    stopGenerationRef.current = true;
                    setQuotaProvider('Gemini');
                    setShowEnvLimitModal(true);
                    throw new Error("ENV_LIMIT_REACHED");
                }

                const isRateLimit = e.message?.includes('429') || e.message?.includes('Resource has been exhausted') || e.message?.includes('Too Many Requests');
                const isPermanentFailure = !isRateLimit && (e.message?.includes('limit: 0') || e.message?.includes('API key not valid') || e.message?.includes('API_KEY_INVALID'));

                if (isRateLimit) {
                    const dynamicDelay = 90000;
                    
                    if (totalAttempts === 1) { // 2nd attempt
                        stopGenerationRef.current = true;
                        setQuotaProvider('Gemini');
                        setQuotaLimitType('daily');
                        setShowEnvLimitModal(true);
                        throw new Error("ENV_LIMIT_REACHED");
                    } else if (totalAttempts >= 2) {
                        throw new Error("ENV_LIMIT_REACHED");
                    }
                    
                    const waitMins = Math.floor(dynamicDelay / 60000);
                    const waitSecs = Math.floor((dynamicDelay % 60000) / 1000);
                    showNotification(`Gemini Rate Limit Hit. Waiting ${waitMins}m ${waitSecs}s then trying again...`, true);
                    
                    await smartDelay(dynamicDelay, 'Gemini');
                    // Allow the loop to try again without forcing circuit breaker limits instantly
                    continue;
                }

                if (useEnvApiKeyRef.current) { await new Promise(resolve => setTimeout(resolve, 2500)); continue; }
                
                if (isPermanentFailure && failedKey) { 
                    setDisabledKeysForSession(prev => { 
                        const newDisabled = [...new Set([...prev, failedKey])]; 
                        if (newDisabled.length >= enabledApiKeysRef.current.length) { setAllKeysPermanentlyFailed(true); } 
                        return newDisabled; 
                    }); 
                    showNotification(`API Key ...${failedKey.slice(-4)} is invalid or has billing issues. Disabling for this session.`, true); 
                } else if (failedKey) { 
                    setApiKeyCooldowns(prev => ({ ...prev, [failedKey]: Date.now() + 61000 })); 
                    consecutiveApiFailuresRef.current++; 
                    if (consecutiveApiFailuresRef.current >= 3) { 
                        const circuitBreakerMsg = "Circuit Breaker: Paused due to 3 consecutive API errors. Check your keys and logs."; 
                        showNotification(circuitBreakerMsg, true); 
                        setIsPausedByCircuitBreaker(true); 
                        stopGenerationRef.current = true; 
                        throw new Error("PAUSED_BY_CIRCUIT_BREAKER"); 
                    } 
                }
                await new Promise(resolve => setTimeout(resolve, 2500));
            }
        }
        if (!success) { const finalError = new Error(`Failed operation "${operation}" after ${TOTAL_MAX_ATTEMPTS_PER_TASK} attempts across all keys.`); 
handleError(finalError, `Total Failure on ${operation}`, {}); throw finalError; }
        return result;
    };
    
    const voiceover = useVoiceover(
        executeGenerativeAiTask,
        getAiClient, 
        showNotification, 
        handleError, 
        projectName, 
        (typeof videoDuration === 'number' ? videoDuration : 0), 
        (typeof videoDurationSec === 'number' ? videoDurationSec : 0),
        setPromptGenerationProgress,
        aiTaskModelsRef
    );
    
    const veo = useVeo(
        showNotification,
        handleError,
        results,
        videoModel,
        aspectRatio,
        negativePrompt,
        projectName,
        setPromptGenerationProgress,
        getAiClient,
        useEnvApiKeyRef
    );

    const isGlobalBusy = isLoading || isBatchGenerating || isAnalyzing || isRephrasing || isGeneratingScript || isGeneratingVideoPrompts || isGeneratingTextPrompts || veo.isGeneratingVideos || voiceover.isGeneratingAudio || voiceover.isGeneratingChunks || voiceover.isFittingScript || isAnalyzingUrl || isAnalyzingCharacter !== null || isRefiningStory || isBrainstorming || voiceover.isProcessingScript || isAnalyzingScriptContent || isTranslating || isExtractingCharacters || isAnalyzingVisuals;
    
    const loadSavedProjects = async () => { try { const projects = await dbHelper.getAllProjectNames(); setSavedProjects(projects.sort()); } catch (e: any) { 
handleError(e, "loading project list", {}); } };
    const calculateStorageUsage = async () => { if (navigator.storage && navigator.storage.estimate) { const estimate = await navigator.storage.estimate(); const usageMB = (estimate.usage || 0) / 1024 / 1024; const quotaMB = (estimate.quota || 0) / 1024 / 1024; setStorageUsage({ used: usageMB.toFixed(2), percentage: quotaMB > 0 ? Math.min((usageMB / quotaMB) * 100, 100) : 0 }); } };

    useEffect(() => {
        const validateExistingSession = async () => {
            // Dev bypass remains the same
            if (localStorage.getItem('uaa-bypass-active') === 'true') {
                setIsCoreSystemLoaded(true);
                setIsDevMode(true);
                showNotification("Developer Session Active.");
                return;
            }
    
            const sessionToken = localStorage.getItem('sessionToken');
            const userEmail = localStorage.getItem('userEmail'); // Needed for relink
    
            if (sessionToken && userEmail) {
                setVerifying(true);
                setLockMessage("Verifying your session...");
                
                try {
                    const deviceId = getDeviceId();
                    const result = await verifyUserSession({ sessionToken, deviceId });
    
                    if (result.success) {
                        setIsCoreSystemLoaded(true);
                        showNotification("Session verified successfully.");
