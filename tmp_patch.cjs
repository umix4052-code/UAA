const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');

const targetStr = `    // 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
    const handleGenerateScript = async (duration: string) => {  
        if (!validateNicheSelection()) return;
        if (!scriptIdea.trim()) { 
            handleError({ message: "Please enter a story idea first."}, "Generate Script", {}); return; } 
        setIsGeneratingScript(true); 
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController();
        showNotification("Generating script from your idea... Est. time: ~45s"); 
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 1;
            if (progress > 95) {
                clearInterval(progressInterval);
                progress = 95;
            }
            let message = "Connecting to AI Engine...";
            if (progress > 5) message = "Initializing script generation...";
            if (progress > 15) message = "Analyzing story idea and niche...";
            if (progress > 30) message = "Generating narrative structure...";
            if (progress > 45) message = "Drafting script content and scenes...";
            if (progress > 60) message = "Refining dialogue and pacing...";
            if (progress > 75) message = "Polishing scene transitions...";
            if (progress > 85) message = "Finalizing script and formatting...";
            
            setPromptGenerationProgress({ 
                current: progress, 
                total: 100, 
                message: \`\${message} (\${progress}%)\`, 
                isStalled: false 
            });
        }, 450); 
        try { 
            const prompt = getIdeaToScriptPrompt(scriptIdea, imageCount, duration, projectNiche); 
            const toolsConfig = apiProvider === 'google' ? { tools: [{ googleSearch: {} }] } : undefined;
            const result = await executeGenerativeAiTask('', prompt, 'generate script', undefined, toolsConfig); 
            const newScript = result.text; 
            if (newScript) { 
                const finalScript = sanitizeAiGeneratedScript(newScript);
                setScript(finalScript); 
                showNotification("Script generated successfully!"); 
            } else { 
                throw new Error("AI failed to return a script."); 
            } 
        } catch (e: any) { 
            if (e.message !== "stopped" && e.message !== "ENV_LIMIT_REACHED" && e.message !== "FATAL_STOP" && e.message !== "OPENROUTER_LIMIT_REACHED" && e.message !== "CUSTOM_LIMIT_REACHED") 
                handleError(e, 'generate script', {}); 
        } finally { 
            clearInterval(progressInterval);
            setIsGeneratingScript(false); 
            setPromptGenerationProgress(null);
        } 
    };`;

const replacementStr = `    // 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
    const handleGenerateScript = async (duration: string) => {  
        if (!validateNicheSelection()) return;
        if (!scriptIdea.trim()) { 
            handleError({ message: "Please enter a story idea first."}, "Generate Script", {}); return; } 
        setIsGeneratingScript(true); 
        stopGenerationRef.current = false;
        abortControllerRef.current = new AbortController();
        setScript(""); // Clear old script before generation
        showNotification("Generating script from your idea... Est. time: ~45s"); 
        
        try { 
            const executeAiTaskWrapper = async (prompt: string, operation: string, validator?: any, forceProvider?: any, sysInst?: any, timeout?: any, signal?: AbortSignal) => {
                const toolsConfig = apiProvider === 'google' ? { tools: [{ googleSearch: {} }] } : undefined;
                return await executeGenerativeAiTask('', prompt, operation, validator, toolsConfig, forceProvider, sysInst, timeout);
            };

            const updateProgress = (progress: number, message: string) => {
                setPromptGenerationProgress({ 
                    current: progress, 
                    total: 100, 
                    message: \`\${message} (\${progress}%)\`, 
                    isStalled: false 
                });
            };

            const onChunkGenerated = (newChunk: string) => {
                setScript(prev => prev ? prev + "\\n\\n" + newChunk : newChunk);
            };

            const checkAbort = () => stopGenerationRef.current;

            const language = detectLanguage(scriptIdea);

            await generateLongFormScript(
                scriptIdea,
                duration,
                projectNiche,
                language,
                apiProvider,
                executeAiTaskWrapper,
                updateProgress,
                onChunkGenerated,
                checkAbort,
                abortControllerRef.current.signal
            );
            
            showNotification("Script generated successfully!"); 
        } catch (e: any) { 
            if (e.message !== "stopped" && e.message !== "ENV_LIMIT_REACHED" && e.message !== "FATAL_STOP" && e.message !== "OPENROUTER_LIMIT_REACHED" && e.message !== "CUSTOM_LIMIT_REACHED") 
                handleError(e, 'generate script', {}); 
        } finally { 
            setIsGeneratingScript(false); 
            setPromptGenerationProgress(null);
        } 
    };`;

const newContent = content.replace(targetStr, replacementStr);
if (newContent !== content) {
    fs.writeFileSync('index.tsx', newContent, 'utf8');
    console.log("Success");
} else {
    console.log("Target string not found.");
}
