# Raw Code Extract: Audio Engine & UI Math

## Part 1: UI Math (from index.tsx & voiceover-generator.tsx)

**In `index.tsx` (VoiceoverGenerator component props mapping):**
\`\`\`tsx
wordCount={voiceover.voiceoverScript.trim().split(/\\s+/).filter(Boolean).length} 
recommendedWords={Math.floor((((typeof videoDuration === 'number' ? videoDuration : 0) * 60) + (typeof videoDurationSec === 'number' ? videoDurationSec : 0) || 0) / 60) * (120 * voiceover.ttsConfig.speed)} 
estimatedSeconds={Math.ceil((voiceover.voiceoverScript.trim().split(/\\s+/).filter(Boolean).length / 120) * 60)} 
targetSeconds={(typeof videoDuration === 'number' ? videoDuration : 0) * 60 + (typeof videoDurationSec === 'number' ? videoDurationSec : 0)} 
\`\`\`

**In `voiceover-generator.tsx` (Rendering the math):**
\`\`\`tsx
<div className="audio-estimator-info">
    <div><span>Word Count:</span> <strong>{wordCount} {recommendedWords > 0 ? \`/ ~\${recommendedWords}\` : ''}</strong></div>
    <div><span>Est. Duration:</span> <strong>{formatTime(estimatedSeconds)}</strong></div>
    <div><span>Target Duration:</span> <strong>{formatTime(targetSeconds)}</strong></div>
</div>
\`\`\`

## Part 2: Audio Engine / Generation Loop (from use-voiceover.ts)

**The `handleGenerateChunkedAudio` logic:**
\`\`\`typescript
    const handleGenerateChunkedAudio = async () => {
        const scriptText = voiceoverScriptRef.current;
        if (!scriptText.trim()) {
            showNotification("No script to generate.", true);
            return;
        }
        setIsGeneratingChunks(true);
        stopChunkGenerationRef.current = false;
        voiceAbortControllerRef.current = new AbortController();
        
        const limit = chunkModeRef.current === 'quality' ? 400 : (chunkModeRef.current === 'speed' ? 2800 : 1000);
        const chunks = splitScriptIntoChunks(scriptText, limit);
        const totalChunks = chunks.length;
        const initialChunks: AudioChunk[] = chunks.map((text, id) => ({ id, text, status: 'pending' }));
        setAudioChunks(initialChunks);
        
        showNotification(\`Generating audio in \${totalChunks} chunks...\`);
        setPromptGenerationProgress({ 
            current: 0, 
            total: totalChunks, 
            message: \`Initializing chunked audio generation (\${totalChunks} chunks)...\`, 
            isStalled: false 
        });
        
        try {
            for (let i = 0; i < chunks.length; i++) {
                if (stopChunkGenerationRef.current) {
                    showNotification("Chunk generation stopped by user.");
                    break;
                }
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'generating' } : c));
                
                const progressMessage = \`Generating Audio Chunk \${i + 1} of \${totalChunks}... \${i} completed, \${totalChunks - i} remaining. (\${Math.round((i / totalChunks) * 100)}%)\`;
                showNotification(progressMessage);
                setPromptGenerationProgress({ 
                    current: i, 
                    total: totalChunks, 
                    message: progressMessage, 
                    isStalled: false 
                });
                
                try {
                    const audioBytes = await generateAudio(chunks[i]);
                    if (audioBytes) {
                        const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                        const url = URL.createObjectURL(wavBlob);
                        setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'complete', audioBytes, audioUrl: url } : c));
                    } else {
                        throw new Error("API returned no audio data.");
                    }
                } catch (e: unknown) {
                    setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'failed', error: e instanceof Error ? e.message : String(e) } : c));
                }
                
                setPromptGenerationProgress({ 
                    current: i + 1, 
                    total: totalChunks, 
                    message: \`Completed chunk \${i + 1} of \${totalChunks}.\`, 
                    isStalled: false 
                });
            }
        } finally {
            setIsGeneratingChunks(false);
            setPromptGenerationProgress(null);
        }
    };
\`\`\`

**The `handleRetrySingleAudioChunk` logic:**
\`\`\`typescript
    const handleRetrySingleAudioChunk = async (id: number) => {
        const chunkToRetry = audioChunksRef.current.find(c => c.id === id);
        if (!chunkToRetry) return;
        setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'generating', error: undefined } : c));
        voiceAbortControllerRef.current = new AbortController();
        try {
            const audioBytes = await generateAudio(chunkToRetry.text);
            if (audioBytes) {
                const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                const url = URL.createObjectURL(wavBlob);
                setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'complete', audioBytes, audioUrl: url } : c));
            } else {
                throw new Error("API returned no audio data.");
            }
        } catch (e: unknown) { 
             setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'failed', error: e instanceof Error ? e.message : String(e) } : c));
        }
    };
\`\`\`
