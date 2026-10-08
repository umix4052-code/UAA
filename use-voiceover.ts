// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import JSZip from 'jszip';
import { 
    decode, decodePcmAudioData, pcmToWav, jsonValidator,
    getCleanTextForExport 
} from './utils';
import { 
    TTSConfig, AudioChunk, TTSVoice, ScriptProcessingOptions, PromptGenerationProgress 
} from './types';
import {
    ttsVoices
} from './constants';
import { nicheConfigs } from './niche-directives';
import { 
    getVoiceoverAutoConfigPrompt, getTtsPrompt, getScriptFittingPrompt, getDocumentaryStyleRewritePrompt, getAiScriptProcessingPrompt
} from './ai-prompts';
import { dbHelper } from './db';

function extractSmartThreePointContext(scriptText: string): string {
    if (!scriptText) return "";

    const sentences = scriptText.match(/[^.!?\n]+[.!?\n]+/g) || [scriptText];
    
    if (sentences.length <= 12 || scriptText.length < 1000) {
        return scriptText.trim();
    }

    const getForwardChunk = (startIdx: number) => {
        let chunk = "";
        let count = 0;
        let idx = startIdx;
        while (idx < sentences.length && (count < 4 || chunk.length < 350)) {
            chunk += (chunk ? " " : "") + sentences[idx].trim();
            count++;
            idx++;
        }
        return chunk;
    };

    const startChunk = getForwardChunk(0);
    const midPoint = Math.floor(sentences.length / 2);
    const midChunk = getForwardChunk(Math.max(0, midPoint - 2));

    let endChunk = "";
    let endCount = 0;
    let endIdx = sentences.length - 1;
    const endParts = [];
    while (endIdx >= 0 && (endCount < 4 || endChunk.length < 350)) {
        endParts.unshift(sentences[endIdx].trim());
        endChunk = endParts.join(" ");
        endCount++;
        endIdx--;
    }

    return `[BEGINNING CONTEXT]:\n${startChunk}\n\n...\n\n[MIDDLE TWIST/PLOT]:\n${midChunk}\n\n...\n\n[ENDING CONCLUSION]:\n${endChunk}`;
}

export const useVoiceover = (
    executeGenerativeAiTask: (model: string, contents: unknown, operation: string, validator?: (text: string) => boolean, toolsConfig?: unknown) => Promise<{text: string}>,
    getAiClient: () => GoogleGenAI,
    showNotification: (msg: string, isError?: boolean) => void,
    handleError: (error: unknown, operation: string, context?: object) => void,
    projectName: string,
    videoDuration: number,
    videoDurationSec: number,
    setPromptGenerationProgress: (progress: PromptGenerationProgress | null) => void,
    aiTaskModelsRef?: React.MutableRefObject<any>,
    projectNiche: string = ""
) => {
    const [voiceoverScript, setVoiceoverScript] = useState('');
    const voiceoverScriptRef = useRef(voiceoverScript);
    useEffect(() => { voiceoverScriptRef.current = voiceoverScript; }, [voiceoverScript]);

    const [customTtsPrompt, setCustomTtsPrompt] = useState('');
    const customTtsPromptRef = useRef(customTtsPrompt);
    useEffect(() => { customTtsPromptRef.current = customTtsPrompt; }, [customTtsPrompt]);

    const [ttsConfig, setTtsConfig] = useState<TTSConfig>({ voice: 'Zephyr (API Standard)', tone: 'Neutral', speed: 1.0 });
    const ttsConfigRef = useRef(ttsConfig);
    useEffect(() => { ttsConfigRef.current = ttsConfig; }, [ttsConfig]);

    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [generatedAudioBytes, setGeneratedAudioBytes] = useState<Uint8Array | null>(null);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
    
    const [isAuditioning, setIsAuditioning] = useState<string | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const [isAutoConfiguringVoice, setIsAutoConfiguringVoice] = useState(false);
    const stopAudioGenerationRef = useRef(false);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const [isFittingScript, setIsFittingScript] = useState(false);
    
    const [forceSpeed, setForceSpeed] = useState(false);
    const forceSpeedRef = useRef(forceSpeed);
    useEffect(() => { forceSpeedRef.current = forceSpeed; }, [forceSpeed]);

    const [isGeneratingSample, setIsGeneratingSample] = useState(false);
    const [sampleAudioUrl, setSampleAudioUrl] = useState<string | null>(null);
    const sampleUrlHistoryRef = useRef<string[]>([]);
    
    const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
    const [isGeneratingChunks, setIsGeneratingChunks] = useState(false);
    const stopChunkGenerationRef = useRef(false);
    const voiceAbortControllerRef = useRef<AbortController | null>(null);
    const audioChunksRef = useRef(audioChunks);
    useEffect(() => { audioChunksRef.current = audioChunks; }, [audioChunks]);
    const [isMergingAudio, setIsMergingAudio] = useState(false);
    
    const [isProcessingScript, setIsProcessingScript] = useState(false);
    const [isScriptProcessed, setIsScriptProcessed] = useState(false);
    const [processingOptions, setProcessingOptions] = useState<ScriptProcessingOptions>({
        autoClean: false,
        fastSpeak: false,
        autoPauses: false,
        emotionalCues: false,
        podcastMode: false,
        documentaryStyle: false
    });
    const processingOptionsRef = useRef(processingOptions);
    useEffect(() => { processingOptionsRef.current = processingOptions; }, [processingOptions]);
    
    const [chunkMode, setChunkMode] = useState<'quality' | 'balanced' | 'speed'>('balanced');
    const chunkModeRef = useRef(chunkMode);
    useEffect(() => { chunkModeRef.current = chunkMode; }, [chunkMode]);
    
    const [useSelectedVoice, setUseSelectedVoice] = useState(false);
    const useSelectedVoiceRef = useRef(useSelectedVoice);
    useEffect(() => { useSelectedVoiceRef.current = useSelectedVoice; }, [useSelectedVoice]);

    useEffect(() => {
        const handleClearAudioMemory = () => {
            // Stop any ongoing API requests immediately to save tokens
            if (voiceAbortControllerRef.current) {
                voiceAbortControllerRef.current.abort();
            }
            stopAudioGenerationRef.current = true;
            stopChunkGenerationRef.current = true;

            // Clear Samples
            sampleUrlHistoryRef.current.forEach(url => URL.revokeObjectURL(url));
            sampleUrlHistoryRef.current = [];
            setSampleAudioUrl(null);

            // Clear Full Audio
            setGeneratedAudioUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });

            // Clear All Chunks from RAM
            setAudioChunks(prev => {
                prev.forEach(chunk => {
                    if (chunk.audioUrl) URL.revokeObjectURL(chunk.audioUrl);
                });
                return [];
            });
        };

        window.addEventListener('app-data-cleared', handleClearAudioMemory);
        return () => {
            window.removeEventListener('app-data-cleared', handleClearAudioMemory);
        };
    }, []);

    const getSelectedApiVoiceName = () => { 
        const selectedVoiceObject = ttsVoices.find(v => v.conceptualName === ttsConfigRef.current.voice); 
        return selectedVoiceObject ? selectedVoiceObject.apiName : null; 
    };

    const splitScriptIntoChunks = (text: string, maxLength = 2800): string[] => { 
        if (!text) return []; 
        const chunks: string[] = []; 
        let remainingText = text.trim(); 
        while (remainingText.length > 0) { 
            if (remainingText.length <= maxLength) { chunks.push(remainingText); break; } 
            let chunk = remainingText.substring(0, maxLength); 
            let splitIndex = -1; 
            const lastParagraphBreak = chunk.lastIndexOf('\n\n'); 
            if (lastParagraphBreak > maxLength / 2) { splitIndex = lastParagraphBreak; } 
            else { 
                const sentenceEnders = /[.!?]/g; 
                let lastSentenceBreak = -1; 
                let match; 
                while ((match = sentenceEnders.exec(chunk)) !== null) { lastSentenceBreak = match.index; } 
                if (lastSentenceBreak !== -1) { splitIndex = lastSentenceBreak + 1; } 
                else { 
                    const lastNewline = chunk.lastIndexOf('\n'); 
                    if (lastNewline !== -1) { splitIndex = lastNewline; } 
                    else { 
                        const lastSpace = chunk.lastIndexOf(' '); 
                        if (lastSpace !== -1) { splitIndex = lastSpace; } 
                        else { splitIndex = maxLength; } 
                    } 
                } 
            } 
            chunk = remainingText.substring(0, splitIndex); 
            chunks.push(chunk.trim()); 
            remainingText = remainingText.substring(splitIndex).trim(); 
        } 
        return chunks.filter(c => c.length > 0); 
    };

    const mergeAudioChunks = async (chunks: AudioChunk[]): Promise<Uint8Array | null> => { 
        const completedChunks = chunks.filter(c => c.status === 'complete' && c.audioBytes).sort((a, b) => a.id - b.id); 
        if (completedChunks.length === 0) { showNotification("No completed audio chunks to merge.", true); return null; } 
        try { 
            let totalLength = 0; 
            for (const chunk of completedChunks) { totalLength += chunk.audioBytes!.length; } 
            const mergedPcm = new Uint8Array(totalLength); 
            let offset = 0; 
            for (const chunk of completedChunks) { mergedPcm.set(chunk.audioBytes!, offset); offset += chunk.audioBytes!.length; } 
            return mergedPcm; 
        } catch (e: unknown) { 
            handleError(e, 'Audio Merging', {}); 
            return null; 
        } 
    };

    const handleClearVoiceCache = async () => {
        try {
            await dbHelper.clearVoiceSamples();
            showNotification("Audio Cache Cleared. Next audition will generate fresh audio.");
        } catch (e: unknown) {
            handleError(e, 'Clear Voice Cache', {});
        }
    };

    const autoConfigureVoiceover = async (scriptText: string, genderPreference: 'any' | 'male' | 'female' = 'any', overrideKeepExisting: boolean = false) => {
        if (!scriptText.trim()) return;
        setIsAutoConfiguringVoice(true);
        showNotification("AI is auto-configuring voiceover settings... Est. time: ~20s");
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            if (progress > 95) {
                clearInterval(progressInterval);
                progress = 95;
            }
            let message = "Analyzing script for voiceover...";
            if (progress > 15) message = "Identifying characters and narrators...";
            if (progress > 30) message = "Matching voices to script content...";
            if (progress > 45) message = "Configuring emotional tone and pacing...";
            if (progress > 60) message = "Processing voiceover configuration...";
            if (progress > 75) message = "Optimizing settings for TTS...";
            if (progress > 90) message = "Finalizing voiceover configuration...";
            
            setPromptGenerationProgress({ 
                current: progress, 
                total: 100, 
                message: `${message} (${progress}%)`, 
                isStalled: false 
            });
        }, 400);

        try {
            const shouldKeepVoice = useSelectedVoice && !overrideKeepExisting;
            let prompt = "";
            const filteredVoices = ttsVoices.filter(v => 
                genderPreference === 'any' || v.gender.toLowerCase() === genderPreference
            );
            const availableVoices = filteredVoices.map(v => `${v.conceptualName} (${v.gender}, API: ${v.apiName})`).join('; ');

            const nicheData = nicheConfigs[projectNiche] || nicheConfigs['Default / General'];
            const chunkedScript = extractSmartThreePointContext(scriptText);
            const nicheName = nicheData?.dropdownName || projectNiche;
            const scriptRules = nicheData?.scriptRules || "Adapt to the core theme dynamically.";
            const audioRules = nicheData?.audioRules || "Adapt to the core theme dynamically.";

            if (shouldKeepVoice) {
                const currentVoice = ttsVoices.find(v => v.conceptualName === ttsConfigRef.current.voice);
                const voiceDesc = currentVoice ? `${currentVoice.conceptualName} (${currentVoice.gender}, ${currentVoice.use_case})` : "Unknown Voice";
                prompt = `You are an expert voiceover director. The user has ALREADY SELECTED the voice: "${voiceDesc}". DO NOT CHANGE THE VOICE. Your task is to analyze the script and determine the best settings for this voice. Instructions: 1. Extract Voiceover Text. 2. Selected Voice: Return "${ttsConfigRef.current.voice}" exactly. 3. Suggest Speaking Speed (0.7 - 1.3). 4. Create a Custom Prompt. 5. Format: Return JSON with keys: "voiceoverScript", "selectedVoice", "suggestedSpeed", "customPrompt". 
                
[STORY CONTEXT]
Use these 3 chunks (Beginning, Middle, End) to understand the story's emotional arc:
${chunkedScript}
`;
            } else {
                prompt = getVoiceoverAutoConfigPrompt(chunkedScript, availableVoices, nicheName, scriptRules, audioRules);
            }
            
            const result = await executeGenerativeAiTask('', prompt, 'auto-configure voiceover', jsonValidator);
            
            if (!result.text) {
                 throw new Error("AI returned invalid JSON for voice config.");
            }

            const cleanedJson = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanedJson);
            
            if (parsedData.voiceoverScript) setVoiceoverScript(parsedData.voiceoverScript);
            if (parsedData.customPrompt) setCustomTtsPrompt(parsedData.customPrompt);
            
            if (!shouldKeepVoice && parsedData.selectedVoice && ttsVoices.some(v => v.conceptualName === parsedData.selectedVoice)) {
                setTtsConfig(prev => ({ ...prev, voice: parsedData.selectedVoice }));
            }
            
            if (typeof parsedData.suggestedSpeed === 'number') {
                setTtsConfig(prev => ({ ...prev, speed: Math.max(0.7, Math.min(1.3, parsedData.suggestedSpeed)) }));
            }
    
            showNotification("Voiceover section has been auto-configured by AI!");
    
        } catch (e: unknown) {
            if (e instanceof Error && e.message !== "stopped") handleError(e, 'auto-configure voiceover', {});
        } finally {
            clearInterval(progressInterval);
            setIsAutoConfiguringVoice(false);
            setPromptGenerationProgress(null);
        }
    };

    const handleAuditionVoice = async (voice: TTSVoice) => {
        if (audioSourceRef.current) { 
            try { audioSourceRef.current.stop(); } catch { /* ignore */ }
            audioSourceRef.current = null;
        }

        if (isAuditioning === voice.conceptualName) { 
            setIsAuditioning(null); 
            return; 
        }
        
        setIsAuditioning(voice.conceptualName);
        
        try {
            if (!outputAudioContextRef.current) { 
                outputAudioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 24000 }); 
            }
            if (outputAudioContextRef.current.state === 'suspended') { 
                await outputAudioContextRef.current.resume(); 
            }

            const activeTone = ttsConfigRef.current.tone === 'All Tones' ? (voice.tones[0] || 'Neutral') : ttsConfigRef.current.tone;
            const cacheKey = `${voice.apiName}_${activeTone}_${voice.conceptualName}`;
            let audioBytes: Uint8Array | null = null;
            const cachedBuffer = await dbHelper.getVoiceSample(cacheKey);

            if (cachedBuffer) {
                audioBytes = new Uint8Array(cachedBuffer);
            } else {
                const textToSpeak = `My name is ${voice.conceptualName}. I am speaking in a ${activeTone.toLowerCase()} tone.`;
                const styleDesc = `${voice.use_case}. Tone: ${activeTone}`;
                const prompt = getTtsPrompt(textToSpeak, { ...ttsConfigRef.current, tone: activeTone }, styleDesc, true, processingOptionsRef.current.documentaryStyle); 

                const modelToUse = aiTaskModelsRef?.current?.voiceoverAudioGeneration || "gemini-2.5-flash-preview-tts";
                const ai = getAiClient();
                const response = await ai.models.generateContent({ 
                    model: modelToUse, 
                    contents: [{ parts: [{ text: prompt }] }], 
                    config: { 
                        responseModalities: [Modality.AUDIO], 
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.apiName } } }, 
                    }, 
                });
                
                const base64Audio = response.candidates?.[0]?.content?.parts[0]?.inlineData?.data;
                if (!base64Audio) { throw new Error("API did not return audio data for audition."); }
                
                audioBytes = decode(base64Audio);
                await dbHelper.saveVoiceSample(cacheKey, audioBytes.buffer);
            }

            if (audioBytes) {
                const audioBuffer = await decodePcmAudioData(audioBytes, outputAudioContextRef.current!, 24000, 1);
                const source = outputAudioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current!.destination);
                source.onended = () => {
                    if (isAuditioning === voice.conceptualName) setIsAuditioning(null);
                    audioSourceRef.current = null;
                };
                source.start(0);
                audioSourceRef.current = source;
            } else {
                throw new Error("Failed to get audio bytes for playback.");
            }

        } catch (e: unknown) {
            handleError(e, `Audition Voice: ${voice.conceptualName}`, {});
            setIsAuditioning(null);
        }
    };
    
    const handleStopAudioGeneration = () => { 
        stopAudioGenerationRef.current = true; 
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
    };
    const handleStopChunkGeneration = () => { 
        stopChunkGenerationRef.current = true; 
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
    };

    const handleFitScriptToDuration = async () => {
        setIsFittingScript(true);
        showNotification("AI is rewriting script to fit duration...");
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            if (progress > 95) {
                clearInterval(progressInterval);
                progress = 95;
            }
            let message = "Analyzing script length...";
            if (progress > 20) message = "Calculating target word count...";
            if (progress > 40) message = "Adjusting script for duration...";
            if (progress > 60) message = "Refining script content...";
            if (progress > 80) message = "Finalizing script adjustments...";
            
            setPromptGenerationProgress({ 
                current: progress, 
                total: 100, 
                message: `${message} (${progress}%)`, 
                isStalled: false 
            });
        }, 300);

        try {
            const currentWords = voiceoverScriptRef.current.trim().split(/\s+/).filter(Boolean).length;
            const totalTargetSeconds = videoDuration * 60 + videoDurationSec;
            const recommendedWords = Math.floor(totalTargetSeconds / 60 * (150 * ttsConfigRef.current.speed));

            if (recommendedWords === 0) {
                showNotification("Target duration is 0, cannot fit script.", true);
                return;
            }
            
            const mode = currentWords > recommendedWords ? 'shorten' : 'expand';
            const prompt = getScriptFittingPrompt(voiceoverScriptRef.current, recommendedWords, mode);
            const result = await executeGenerativeAiTask('', prompt, 'fit script to duration');
            
            if (result.text) {
                setVoiceoverScript(result.text);
                showNotification(`Script ${mode === 'shorten' ? 'shortened' : 'expanded'} to fit duration!`);
            } else {
                throw new Error("AI failed to return a script.");
            }
        } catch (e: unknown) {
            if (e instanceof Error && e.message !== "stopped") handleError(e, 'fit script to duration', {});
        } finally {
            clearInterval(progressInterval);
            setIsFittingScript(false);
            setPromptGenerationProgress(null);
        }
    };
    
    const generateAudio = async (text: string, isSample = false): Promise<Uint8Array | null> => {
        const voiceName = getSelectedApiVoiceName();
        if (!voiceName) {
            throw new Error(`Voice "${ttsConfigRef.current.voice}" is not a valid selection.`);
        }
        
        try {
            const prompt = getTtsPrompt(text, ttsConfigRef.current, customTtsPromptRef.current, forceSpeedRef.current, processingOptionsRef.current.documentaryStyle);
            const modelToUse = aiTaskModelsRef?.current?.voiceoverAudioGeneration || "gemini-2.5-flash-preview-tts";
            const ai = getAiClient();
            const signal = voiceAbortControllerRef.current?.signal;
            
            // 1. Create a promise that instantly rejects if aborted
            const abortPromise = new Promise<never>((_, reject) => {
                if (signal?.aborted) reject(new Error("stopped"));
                signal?.addEventListener('abort', () => reject(new Error("stopped")));
            });
            abortPromise.catch(() => {});

            // 2. The API call with root-level signal injection for token optimization
            const generatePromise = ai.models.generateContent({
                model: modelToUse,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
                    },
                },
                ...(signal ? { signal } : {})
            } as any);

            // 🛡️ Safety net to swallow unhandled rejection if abortPromise wins the race
            generatePromise.catch(() => {});

            // 3. Race them! Whichever finishes/rejects first wins.
            const response = await Promise.race([generatePromise, abortPromise]) as any;
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) { throw new Error("API did not return audio data."); }
            
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const reqCount = parseInt(localStorage.getItem(`ai_daily_requests_${todayStr}`) || localStorage.getItem(`OR_req_count_${todayStr}`) || '0');
                
                // Estimate credits based on text length: 800 characters = 1 minute of speech = 30 credits (160 characters = 6 credits)
                const textLength = text ? text.length : 0;
                const creditCost = Math.max(1, Math.ceil(textLength / 160) * 6);
                
                const nextReqCount = reqCount + creditCost;
                localStorage.setItem(`ai_daily_requests_${todayStr}`, nextReqCount.toString());
                localStorage.setItem(`OR_req_count_${todayStr}`, nextReqCount.toString());
            } catch (trackErr) {
                console.error("Error tracking Voiceover API stats:", trackErr);
            }

            return decode(base64Audio);

        } catch (e: any) {
            if (e.name === 'AbortError' || e.message?.toLowerCase().includes('abort') || voiceAbortControllerRef.current?.signal.aborted) {
                throw new Error("stopped");
            }
            handleError(e, isSample ? 'Generate Sample' : 'Generate Audio', {});
            return null;
        }
    };

    const handleGenerateSample = async () => {
        if (isGeneratingChunks || isGeneratingAudio) {
            showNotification("Generation is already in progress.", true);
            return;
        }
        if (!voiceoverScriptRef.current.trim()) {
            showNotification("Please provide a script to generate a sample.", true);
            return;
        }
        setIsGeneratingSample(true);
        setSampleAudioUrl(null);
        try {
            const first250Chars = voiceoverScriptRef.current.substring(0, 250);
            const audioBytes = await generateAudio(first250Chars, true);
            if (audioBytes) {
                const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                const url = URL.createObjectURL(wavBlob);
                sampleUrlHistoryRef.current.push(url);
                if (sampleUrlHistoryRef.current.length > 3) {
                    const oldestUrl = sampleUrlHistoryRef.current.shift();
                    if (oldestUrl) URL.revokeObjectURL(oldestUrl);
                }
                setSampleAudioUrl(url);
                showNotification("Sample generated successfully!");
            }
        } catch (e: any) {
            if (e.message !== "stopped") {
                handleError(e, 'Generate Audio', {});
            }
        } finally {
            setIsGeneratingSample(false);
        }
    };

    const handleGenerateVoiceover = async () => {
        if (isGeneratingChunks || isGeneratingAudio) {
            showNotification("Generation is already in progress.", true);
            return;
        }
        if (!voiceoverScriptRef.current.trim()) {
            showNotification("No script to generate.", true);
            return;
        }
        setIsGeneratingAudio(true);
        setGeneratedAudioBytes(null);
        setGeneratedAudioUrl(null);
        stopAudioGenerationRef.current = false;
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
        voiceAbortControllerRef.current = new AbortController();
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 1;
            if (progress > 95) {
                clearInterval(progressInterval);
                progress = 95;
            }
            let message = "Preparing audio generation...";
            if (progress > 15) message = "Processing script for TTS...";
            if (progress > 30) message = "Synthesizing voice audio...";
            if (progress > 45) message = "Applying voice characteristics...";
            if (progress > 60) message = "Processing audio chunks...";
            if (progress > 75) message = "Combining audio segments...";
            if (progress > 90) message = "Finalizing audio file...";
            
            setPromptGenerationProgress({ 
                current: progress, 
                total: 100, 
                message: `${message} (${progress}%)`, 
                isStalled: false 
            });
        }, 500);

        try {
            const audioBytes = await generateAudio(voiceoverScriptRef.current);
            if (audioBytes) {
                setGeneratedAudioBytes(audioBytes);
                const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                const url = URL.createObjectURL(wavBlob);
                setGeneratedAudioUrl(prevUrl => {
                    if (prevUrl) URL.revokeObjectURL(prevUrl);
                    return url;
                });
                showNotification("Full audio generated successfully!");
            }
        } catch (e: any) {
            if (e.message !== "stopped") {
                handleError(e, 'Generate Audio', {});
            }
        } finally {
            clearInterval(progressInterval);
            setIsGeneratingAudio(false);
            setPromptGenerationProgress(null);
        }
    };

    const handleDownloadAudio = (bytes?: Uint8Array, filename?: string) => {
        const audioBytes = bytes || generatedAudioBytes;
        if (!audioBytes) {
            showNotification("No audio data to download.", true);
            return;
        }
        const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
        const url = URL.createObjectURL(wavBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${projectName.replace(/\s+/g, '_')}_voiceover.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification("Audio download started.");
    };

    const handleGenerateChunkedAudio = async () => {
        if (isGeneratingChunks || isGeneratingAudio) {
            showNotification("Generation is already in progress.", true);
            return;
        }
        const scriptText = voiceoverScriptRef.current;
        if (!scriptText.trim()) {
            showNotification("No script to generate.", true);
            return;
        }
        setIsGeneratingChunks(true);
        stopChunkGenerationRef.current = false;
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
        voiceAbortControllerRef.current = new AbortController();
        
        const limit = chunkModeRef.current === 'quality' ? 400 : (chunkModeRef.current === 'speed' ? 2800 : 1000);
        const chunks = splitScriptIntoChunks(scriptText, limit);
        const totalChunks = chunks.length;
        const initialChunks: AudioChunk[] = chunks.map((text, id) => ({ id, text, status: 'pending' }));
        setAudioChunks(initialChunks);
        
        showNotification(`Generating audio in ${totalChunks} chunks...`);
        setPromptGenerationProgress({ 
            current: 0, 
            total: totalChunks, 
            message: `Initializing chunked audio generation (${totalChunks} chunks)...`, 
            isStalled: false 
        });

        try {
        for (let i = 0; i < chunks.length; i++) {
            if (stopChunkGenerationRef.current) {
                showNotification("Chunk generation stopped by user.");
                break;
            }
            setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'generating' } : c));
            
            const progressMessage = `Generating Audio Chunk ${i + 1} of ${totalChunks}... ${i} completed, ${totalChunks - i} remaining. (${Math.round((i / totalChunks) * 100)}%)`;
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
            } catch (e: any) {
                if (e.message === "stopped" || stopChunkGenerationRef.current) {
                    setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'pending', error: undefined } : c));
                    showNotification("Chunk generation stopped by user.");
                    break;
                }
                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'failed', error: e instanceof Error ? e.message : String(e) } : c));
            }
            
            setPromptGenerationProgress({ 
                current: i + 1, 
                total: totalChunks, 
                message: `Completed chunk ${i + 1} of ${totalChunks}.`, 
                isStalled: false 
            });
        }
        } finally {
        setIsGeneratingChunks(false);
        setPromptGenerationProgress(null);
        }
    };

    const handleResumeChunkedAudio = async () => {
        if (isGeneratingChunks || isGeneratingAudio) {
            showNotification("Generation is already in progress.", true);
            return;
        }
        if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
            showNotification("No existing chunks to resume.", true);
            return;
        }
        setIsGeneratingChunks(true);
        stopChunkGenerationRef.current = false;
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
        voiceAbortControllerRef.current = new AbortController();
        
        const chunksToProcess = audioChunksRef.current.filter(c => c.status !== 'complete');
        if (chunksToProcess.length === 0) {
            showNotification("All chunks are already complete.");
            setIsGeneratingChunks(false);
            return;
        }

        const totalChunks = audioChunksRef.current.length;
        showNotification(`Resuming audio generation... ${chunksToProcess.length} chunks remaining.`);
        
        try {
            for (let i = 0; i < totalChunks; i++) {
                if (stopChunkGenerationRef.current) {
                    showNotification("Chunk generation stopped by user.");
                    break;
                }
                
                const currentChunk = audioChunksRef.current[i];
                if (currentChunk.status === 'complete') continue; 

                setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'generating', error: undefined } : c));
                
                setPromptGenerationProgress({ 
                    current: i, 
                    total: totalChunks, 
                    message: `Resuming Chunk ${i + 1} of ${totalChunks}...`, 
                    isStalled: false 
                });
                
                try {
                    const audioBytes = await generateAudio(currentChunk.text);
                    if (audioBytes) {
                        const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                        const url = URL.createObjectURL(wavBlob);
                        setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'complete', audioBytes, audioUrl: url } : c));
                    } else {
                        throw new Error("API returned no audio data.");
                    }
                } catch (e: any) {
                    if (e.message === "stopped" || stopChunkGenerationRef.current) {
                        setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'pending', error: undefined } : c));
                        showNotification("Chunk generation stopped by user.");
                        break;
                    }
                    setAudioChunks(prev => prev.map(c => c.id === i ? { ...c, status: 'failed', error: e instanceof Error ? e.message : String(e) } : c));
                }
            }
        } finally {
            setIsGeneratingChunks(false);
            setPromptGenerationProgress(null);
        }
    };

    const handleRetrySingleAudioChunk = async (id: number) => {
        if (isGeneratingChunks || isGeneratingAudio) {
            showNotification("Generation is already in progress.", true);
            return;
        }
        const chunkToRetry = audioChunksRef.current.find(c => c.id === id);
        if (!chunkToRetry) return;
        setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'generating', error: undefined } : c));
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
        voiceAbortControllerRef.current = new AbortController();
        try {
            const audioBytes = await generateAudio(chunkToRetry.text);
            if (audioBytes) {
                const wavBlob = pcmToWav(audioBytes, 24000, 1, 16);
                const url = URL.createObjectURL(wavBlob);
                const oldChunk = audioChunksRef.current.find(c => c.id === id);
                if (oldChunk && oldChunk.audioUrl) {
                    URL.revokeObjectURL(oldChunk.audioUrl);
                }
                setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'complete', audioBytes, audioUrl: url } : c));
            } else {
                throw new Error("API returned no audio data.");
            }
        } catch (e: any) {
             if (e.message === "stopped" || stopChunkGenerationRef.current) {
                 setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'pending', error: undefined } : c));
                 showNotification("Chunk generation stopped by user.");
             } else {
                 setAudioChunks(prev => prev.map(c => c.id === id ? { ...c, status: 'failed', error: e instanceof Error ? e.message : String(e) } : c));
             }
        }
    };
    
    const handleMergeAndDownload = async () => {
        setIsMergingAudio(true);
        showNotification("Merging audio chunks...");
        try {
            const mergedBytes = await mergeAudioChunks(audioChunksRef.current);
            if (mergedBytes) {
                handleDownloadAudio(mergedBytes, `${projectName.replace(/\s+/g, '_')}_merged_voiceover.wav`);
            }
        } finally {
            setIsMergingAudio(false);
        }
    };

    const handleDownloadAllChunksZip = async () => {
        showNotification("Creating ZIP file of audio chunks...");
        try {
            const zip = new JSZip();
            const completedChunks = audioChunksRef.current.filter(c => c.status === 'complete' && c.audioBytes);
            if (completedChunks.length === 0) {
                showNotification("No completed chunks to download.", true);
                return;
            }
            for (const chunk of completedChunks) {
                const wavBlob = pcmToWav(chunk.audioBytes!, 24000, 1, 16);
                zip.file(`${projectName}_chunk_${chunk.id + 1}.wav`, wavBlob);
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${projectName.replace(/\s+/g, '_')}_audio_chunks.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("Audio chunks ZIP download started.");
        } catch (e: unknown) {
            handleError(e, 'ZIP creation for audio chunks', {});
        }
    };
    
    const handleProcessScript = async (options: ScriptProcessingOptions) => {
        if (!voiceoverScriptRef.current.trim()) {
            showNotification("No script to process.", true);
            return;
        }
        setIsProcessingScript(true);
        setIsScriptProcessed(false);
        showNotification("AI is processing the script...");
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            if (progress > 95) {
                clearInterval(progressInterval);
                progress = 95;
            }
            let message = "Analyzing script structure...";
            if (progress > 20) message = "Identifying voiceover segments...";
            if (progress > 40) message = "Assigning voices to segments...";
            if (progress > 60) message = "Optimizing script for TTS...";
            if (progress > 80) message = "Finalizing script processing...";
            
            setPromptGenerationProgress({ 
                current: progress, 
                total: 100, 
                message: `${message} (${progress}%)`, 
                isStalled: false 
            });
        }, 300);

        try {
            const currentScript = voiceoverScriptRef.current;
            const prompt = options.documentaryStyle 
                ? getDocumentaryStyleRewritePrompt(currentScript) 
                : getAiScriptProcessingPrompt(currentScript, options);
    
            const result = await executeGenerativeAiTask('', prompt, 'process script');
            
            if (result.text) {
                setVoiceoverScript(result.text);
                setIsScriptProcessed(true);
                showNotification("Script processed successfully!");
            } else {
                throw new Error("AI did not return a processed script.");
            }
    
        } catch (e: unknown) {
            handleError(e, 'process script', {});
        } finally {
            clearInterval(progressInterval);
            setIsProcessingScript(false);
            setPromptGenerationProgress(null);
        }
    };
    
    const handleExportCleanScript = () => {
        if (!voiceoverScriptRef.current.trim()) {
            showNotification("No script to export.", true);
            return;
        }
        const cleanText = getCleanTextForExport(voiceoverScriptRef.current);
        const blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${projectName.replace(/\s+/g, '_')}_clean_tts_script.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("Clean script for TTS downloaded.");
    };

    const handleAudioAutopilot = async () => {
        showNotification("Audio Autopilot Initiated.");
        try {
            if (!customTtsPrompt.trim()) {
                setPromptGenerationProgress({ current: 0, total: 100, message: "Auto-configuring voiceover...", isStalled: false });
                await autoConfigureVoiceover(voiceoverScriptRef.current, 'any', true);
            }
            setPromptGenerationProgress({ current: 20, total: 100, message: "Generating audio chunks...", isStalled: false });
            await handleGenerateChunkedAudio();
            const checkCompletion = () => new Promise<boolean>(resolve => {
                const interval = setInterval(() => {
                    const allDone = audioChunksRef.current.every(c => c.status === 'complete' || c.status === 'failed');
                    const completed = audioChunksRef.current.filter(c => c.status === 'complete').length;
                    setPromptGenerationProgress({ current: 20 + Math.floor((completed / audioChunksRef.current.length) * 60), total: 100, message: `Generating chunk ${completed} of ${audioChunksRef.current.length}...`, isStalled: false });
                    if (allDone) {
                        clearInterval(interval);
                        const hasFailures = audioChunksRef.current.some(c => c.status === 'failed');
                        resolve(!hasFailures);
                    }
                }, 1000);
            });
            const success = await checkCompletion();
            if (!success) {
                showNotification("Audio Autopilot: Some chunks failed. Merging the successful ones.", true);
            }
            setPromptGenerationProgress({ current: 90, total: 100, message: "Merging audio chunks...", isStalled: false });
            await handleMergeAndDownload();
            setPromptGenerationProgress(null);
            showNotification("Audio Autopilot Completed!");
        } catch (e: unknown) {
            setPromptGenerationProgress(null);
            handleError(e, 'Audio Autopilot', {});
            throw new Error("AUDIO_GENERATION_FAILED");
        }
    };

    return {
        voiceoverScript, setVoiceoverScript, customTtsPrompt, setCustomTtsPrompt,
        ttsConfig, setTtsConfig, isGeneratingAudio, generatedAudioBytes, generatedAudioUrl,
        isAuditioning, isAutoConfiguringVoice, isFittingScript, forceSpeed, setForceSpeed,
        isGeneratingSample, sampleAudioUrl, audioChunks, setAudioChunks, isGeneratingChunks,
        isMergingAudio, isProcessingScript, isScriptProcessed, processingOptions, setProcessingOptions,
        chunkMode, setChunkMode,
        useSelectedVoice, setUseSelectedVoice, autoConfigureVoiceover, handleAuditionVoice,
        handleFitScriptToDuration, handleStopAudioGeneration, handleStopChunkGeneration,
        handleGenerateSample, handleGenerateVoiceover, handleDownloadAudio,
        handleGenerateChunkedAudio, handleResumeChunkedAudio, handleRetrySingleAudioChunk, handleMergeAndDownload,
        handleDownloadAllChunksZip, handleProcessScript, handleExportCleanScript,
        handleAudioAutopilot, handleClearVoiceCache,
    };
};