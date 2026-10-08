const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

const searchStr = `batchResults = batchResults.map(r => ({ ...r, imageStatus: 'pending', retryCount: 0, safetyRetryCount: 0 }));`;
// Wait, this string exists in multiple places. Let's just remove the one right after chunkText logic.

const block = `let batchResults: SceneResult[] = parsedScenes.map((s: any) => ({ ...s, image_prompt: s.master_prompt || s.image_prompt || "", chunk_source_text: chunkText, target_chunk_count: expectedScenes, imageStatus: 'pending' as const, retryCount: 0, safetyRetryCount: 0 }));
                            batchResults = injectCharacterDescriptions(batchResults, characterProfilesRef.current);
                            batchResults = injectPostProcessingStyles(batchResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);
                            batchResults = batchResults.map(r => ({ ...r, imageStatus: 'pending', retryCount: 0, safetyRetryCount: 0 }));`;

const replaceBlock = `let batchResults: SceneResult[] = parsedScenes.map((s: any) => ({ ...s, image_prompt: s.master_prompt || s.image_prompt || "", chunk_source_text: chunkText, target_chunk_count: expectedScenes, imageStatus: 'pending' as const, retryCount: 0, safetyRetryCount: 0 }));
                            batchResults = injectCharacterDescriptions(batchResults, characterProfilesRef.current);
                            batchResults = injectPostProcessingStyles(batchResults, projectNicheRef.current, selectedThemesRef.current, selectedModifiersRef.current);`;

content = content.replace(block, replaceBlock);
fs.writeFileSync('index.tsx', content);
