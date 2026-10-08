    const handleVideoFileSelect = async (file: File, isVisualRemake: boolean, remakeType: 'long' | 'shorts' | 'hyper-detailed', framesPerBatch: number, extractScriptAndStyles: boolean, generatePromptsDirectly: boolean, extractCharacters: boolean, resumeFromSegment?: number, bypassConsistencyCheck: boolean = false) => {
        if (isVisualRemake && !validateNicheSelection()) return;
        const hasEmptyProfiles = characterProfiles.length === 0 || (characterProfiles.length === 1 && !characterProfiles[0].userDescription.trim() && !characterProfiles[0].aiDescription.trim());
        const currentProvider = localStorage.getItem('apiProvider') || apiProvider || '';
        const isThirdPartyForWarning = apiProvider === 'openrouter' || apiProvider === 'custom' || currentProvider === 'customRouter';
        if (!bypassConsistencyCheck && isVisualRemake && isThirdPartyForWarning && hasEmptyProfiles) {
            setPendingVideoAnalysisArgs({ file, isVisualRemake, remakeType, framesPerBatch, extractScriptAndStyles, generatePromptsDirectly, extractCharacters, resumeFromSegment });
            setShowCharacterConsistencyModal(true);
            return;
        }

        setIsAnalyzingUrl(true);
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController();
        showNotification(isVisualRemake && !extractScriptAndStyles ? "Visual Remake: Starting Visual-Only Analysis..." : (isVisualRemake ? "Visual Remake: Initializing Full Analysis..." : "Uploading and analyzing video..."));
        setPromptGenerationProgress({ current: 0, total: 100, message: "Initializing video file analysis...", isStalled: false });
        showNotification("AI is preparing to analyze the uploaded video...");

        if (stallTimeoutRef.current) clearTimeout(stallTimeoutRef.current);
    
        if (!resumeFromSegment && isVisualRemake) {
            const newTask: ResumableTask = { id: `${file.name}-${file.size}`, type: 'visual_remake', provider: apiProvider, progress: 0, remakeType: remakeType };
            localStorage.setItem('resumable_task', JSON.stringify(newTask));
            localStorage.setItem('interim_results', JSON.stringify([]));
            setResumableTask(newTask);
            showNotification("Visual Remake task initialized. Progress will be saved automatically.");
        } else if (!resumeFromSegment) {
            localStorage.removeItem('resumable_task');
            localStorage.removeItem('interim_results');
            setResumableTask(null);
        }

        let uploadedVideoPart: any = { fileToUpload: file }; // default for safety

        try {
            // PRE-UPLOAD CHECK (Only upload to Gemini if we need to use Gemini for analysis)
            const needsGoogleUpload = (apiProvider === 'google' || (apiProvider === 'openrouter' && extractScriptAndStyles && !resumeFromSegment));
            
            if (needsGoogleUpload) {
                showNotification("Uploading file securely to AI. This bypasses memory issues...");
                setPromptGenerationProgress({ current: 5, total: 100, message: "Uploading large file to AI framework securely...", isStalled: false });
                
                const apiKeyForUpload = useEnvApiKeyRef.current ? undefined : (enabledApiKeys.length > 0 ? enabledApiKeys[0] : undefined);
                const aiClient = getAiClient(apiKeyForUpload); 
                let uploadedFile = await aiClient.files.upload({ file, config: { mimeType: file.type } });
                
                let waitTime = 0;
                const MAX_WAIT_TIME = 15 * 60 * 1000;
                while (uploadedFile.state === 'PROCESSING' && waitTime < MAX_WAIT_TIME) {
                    setPromptGenerationProgress({ current: 15, total: 100, message: `Waiting for AI to assign file processing status... (${Math.round(waitTime/1000)}s)`, isStalled: false });
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    uploadedFile = await aiClient.files.get({name: uploadedFile.name});
                    waitTime += 5000;
                }

                if (uploadedFile.state !== 'ACTIVE') {
                    throw new Error(`File upload timed out or failed. Server state: ${uploadedFile.state || 'UNKNOWN'}`);
                }

                // Add 10-second safety buffer to allow backend caching fully.
                setPromptGenerationProgress({ current: 15, total: 100, message: "Finalizing cloud syncing...", isStalled: false });
                await new Promise(resolve => setTimeout(resolve, 10000));

                uploadedVideoPart = { fileData: { fileUri: uploadedFile.uri, mimeType: file.type } };
                showNotification("File upload successful and ACTIVE. Analyzing data...");
            }

            // --- SCRIPT EXTRACTION (COMMON FOR BOTH PROVIDERS IF ENABLED) ---
            if (extractScriptAndStyles && !resumeFromSegment) {
                const currentProvider = localStorage.getItem('apiProvider') || apiProvider || '';
                const forceGoogleForScript = apiProvider === 'openrouter' || apiProvider === 'custom' || currentProvider === 'customRouter';
                if (forceGoogleForScript && !useEnvApiKey && enabledApiKeys.length === 0) {
                    showNotification("Video/Audio analysis strictly requires a Gemini API key. Please add one or enable the Built-in Key.", true);
                    setIsAnalyzingUrl(false); return;
