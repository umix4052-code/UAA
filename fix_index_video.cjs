const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf-8');

const searchStr = `                        const result = await executeGenerativeAiTask(
                            '',
                            videoPromptText,
                            \`generate video prompt \${sceneIndex}\`,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            isResuming // Don't use system data cache for these
                        );
                        let finalPrompt = result.text.trim();
                        
                        setResults(prev => prev.map((r, idx) => idx === sceneIndex ? { ...r, videoPromptStatus: 'completed', video_prompt: finalPrompt } : r));`;

const replaceStr = `                        const result = await executeGenerativeAiTask(
                            '',
                            videoPromptText,
                            \`generate video prompt \${sceneIndex}\`,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            isResuming // Don't use system data cache for these
                        );
                        let finalPrompt = result.text.trim();
                        
                        setResults(prev => {
                            let newResults = prev.map((r, idx) => idx === sceneIndex ? { ...r, videoPromptStatus: 'completed', video_prompt: finalPrompt } : r);
                            newResults = injectCharacterDescriptions(newResults, characterProfilesRef.current);
                            return newResults;
                        });`;

code = code.split(searchStr).join(replaceStr);

fs.writeFileSync('index.tsx', code);
console.log("Fixes applied to index.tsx for video prompt injection");
