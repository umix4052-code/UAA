const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

const searchStr = `let batchResults: SceneResult[] = parsedScenes.map((s: any) => ({ ...s, image_prompt: s.master_prompt || s.image_prompt || "", chunk_source_text: chunkText, target_chunk_count: expectedScenes }));`;
const replaceStr = `let batchResults: SceneResult[] = parsedScenes.map((s: any) => ({ ...s, image_prompt: s.master_prompt || s.image_prompt || "", chunk_source_text: chunkText, target_chunk_count: expectedScenes, imageStatus: 'pending' as const, retryCount: 0, safetyRetryCount: 0 }));`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync('index.tsx', content);
