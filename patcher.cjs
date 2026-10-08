const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');
const target = fs.readFileSync('target.txt', 'utf8');

const replacement = `    // 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC
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
    };
`;

const newContent = content.replace(target, replacement);
if (newContent !== content) {
    fs.writeFileSync('index.tsx', newContent, 'utf8');
    console.log("Success");
} else {
    console.log("Target string not found.");
}
