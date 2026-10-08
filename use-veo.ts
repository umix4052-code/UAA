import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import JSZip from 'jszip';
import { SceneResult, VideoGenerationStatus, PromptGenerationProgress } from './types';

export const useVeo = (
    showNotification: (msg: string, isError?: boolean) => void,
    handleError: (error: unknown, operation: string, context?: object) => void,
    results: SceneResult[],
    videoModel: string,
    aspectRatio: string,
    negativePrompt: string,
    projectName: string,
    setPromptGenerationProgress: (progress: PromptGenerationProgress | null) => void,
    getAiClient: (apiKeyOverride?: string) => GoogleGenAI,
    useEnvApiKeyRef: React.MutableRefObject<boolean>
) => {
    const [veoApiKey, setVeoApiKey] = useState('');
    const veoApiKeyRef = useRef(veoApiKey);
    useEffect(() => { veoApiKeyRef.current = veoApiKey; }, [veoApiKey]);

    const resultsRef = useRef(results);
    useEffect(() => { resultsRef.current = results; }, [results]);

    const videoModelRef = useRef(videoModel);
    useEffect(() => { videoModelRef.current = videoModel; }, [videoModel]);

    const aspectRatioRef = useRef(aspectRatio);
    useEffect(() => { aspectRatioRef.current = aspectRatio; }, [aspectRatio]);

    const negativePromptRef = useRef(negativePrompt);
    useEffect(() => { negativePromptRef.current = negativePrompt; }, [negativePrompt]);

    const [veoApiKeyInput, setVeoApiKeyInput] = useState('');
    const [selectedScenesForVideo, setSelectedScenesForVideo] = useState<number[]>([]);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState<{ [key: number]: VideoGenerationStatus }>({});
    const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
    const [showMismatchWarning, setShowMismatchWarning] = useState(false);
    const stopVideoGenerationRef = useRef(false);
    const videoAbortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const savedVeoKey = localStorage.getItem('veoApiKey');
        if (savedVeoKey) {
            setVeoApiKey(savedVeoKey);
            setVeoApiKeyInput(savedVeoKey);
        }
    }, []);

    const handleSaveVeoApiKey = () => {
        if (veoApiKeyInput.trim()) {
            const key = veoApiKeyInput.trim();
            setVeoApiKey(key);
            localStorage.setItem('veoApiKey', key);
            showNotification("Veo API Key saved.");
        }
    };

    const handleClearVeoApiKey = () => {
        setVeoApiKey('');
        setVeoApiKeyInput('');
        localStorage.removeItem('veoApiKey');
        showNotification("Veo API Key cleared.");
    };

    const executeVideoGeneration = async () => {
        setIsGeneratingVideos(true);
        stopVideoGenerationRef.current = false;
        videoAbortControllerRef.current = new AbortController();
        setShowMismatchWarning(false);
        showNotification(`Starting video generation for ${selectedScenesForVideo.length} scenes...`);
        setPromptGenerationProgress({ current: 0, total: selectedScenesForVideo.length, message: `Starting video generation (0/${selectedScenesForVideo.length})...`, isStalled: false });

        let completedCount = 0;
        try {
        for (const index of selectedScenesForVideo) {
            if (stopVideoGenerationRef.current) {
                showNotification("Video generation stopped by user.");
                break;
            }
            setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'generating', progressMessage: 'Initiating...' } }));
            
            const remainingCount = selectedScenesForVideo.length - completedCount;
            const sceneProgressMessage = `Generating video for Scene ${index + 1} (${completedCount + 1} of ${selectedScenesForVideo.length})... ${completedCount} completed, ${remainingCount} remaining. (${Math.round((completedCount / selectedScenesForVideo.length) * 100)}%)`;
            showNotification(sceneProgressMessage);
            setPromptGenerationProgress({ 
                current: completedCount, 
                total: selectedScenesForVideo.length, 
                message: sceneProgressMessage, 
                isStalled: false 
            });
            
            try {
                const activeApiKeyForVeo = veoApiKeyRef.current || undefined;
                const ai = getAiClient(activeApiKeyForVeo);
                
                let prompt = resultsRef.current[index]?.video_prompt;
                if (!prompt) {
                    throw new Error("Video prompt is missing for this scene.");
                }
                if (negativePromptRef.current.trim()) {
                    prompt = `${prompt}, negative prompt: ${negativePromptRef.current.trim()}`;
                }
                
                const aspectRatioForVideo = (aspectRatioRef.current === '16:9' || aspectRatioRef.current === '9:16') ? aspectRatioRef.current : '16:9';
                const config: any = {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatioForVideo as ('16:9' | '9:16'),
                    abortSignal: videoAbortControllerRef.current?.signal
                };

                let operation = await ai.models.generateVideos({
                    model: 'veo-3.1-fast-generate-preview', // Reverted to hardcoded model name
                    prompt: prompt,
                    config: config
                });

                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'polling', progressMessage: 'Generating... This can take several minutes.' } }));
                
                let pollCount = 0;
                while (!operation.done) {
                    if (stopVideoGenerationRef.current) break;
                    pollCount++;
                    const pollingMessage = `Polling for Scene ${index + 1} completion... (Attempt ${pollCount}, ~${pollCount * 10}s elapsed)`;
                    setPromptGenerationProgress({ 
                        current: completedCount, 
                        total: selectedScenesForVideo.length, 
                        message: pollingMessage, 
                        isStalled: false 
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    operation = await ai.operations.getVideosOperation({ operation: operation });
                }

                if (stopVideoGenerationRef.current) break;

                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (!downloadLink) throw new Error("Generation finished, but no video link was returned.");

                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'polling', progressMessage: 'Finalizing video...' } }));
                setPromptGenerationProgress({ 
                    current: completedCount, 
                    total: selectedScenesForVideo.length, 
                    message: `Finalizing and downloading video for Scene ${index + 1}...`, 
                    isStalled: false 
                });

                const activeKey = veoApiKeyRef.current || (useEnvApiKeyRef.current ? process.env.API_KEY : undefined);
                const videoResponse = await fetch(`${downloadLink}&key=${activeKey}`, { signal: videoAbortControllerRef.current?.signal });
                if (!videoResponse.ok) {
                    const errorText = await videoResponse.text();
                    if (videoResponse.status === 400 && errorText.toLowerCase().includes('api key not valid')) {
                        handleClearVeoApiKey();
                        showNotification("The saved Veo API Key is invalid. It has been cleared. Please provide a valid key.", true);
                        throw new Error("Invalid API Key. Please provide a valid key.");
                    }
                    throw new Error(`Failed to download video file. Status: ${videoResponse.status}`);
                }

                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'complete', videoUrl: videoUrl } }));
                showNotification(`Video for Scene ${index + 1} completed!`);
                completedCount++;
                setPromptGenerationProgress({ current: completedCount, total: selectedScenesForVideo.length, message: `Completed ${completedCount} of ${selectedScenesForVideo.length} videos.`, isStalled: false });

            } catch (e: unknown) {
                handleError(e, `video generation for Scene ${index + 1}`, {});
                setVideoGenerationStatus(prev => ({ ...prev, [index]: { status: 'failed', error: e instanceof Error ? e.message : String(e) } }));
            }
        }
        } finally {
            setIsGeneratingVideos(false);
            stopVideoGenerationRef.current = false;
            setPromptGenerationProgress(null);
        }
    };

    const handleStartVideoGeneration = () => {
        if (!useEnvApiKeyRef.current && !veoApiKey) {
            showNotification("Please provide and save a Veo API Key or enable the Environment Key to generate videos.");
            return;
        }
        if (selectedScenesForVideo.length === 0) {
            showNotification("Please select at least one scene to generate.");
            return;
        }
        const currentModel = results[0]?.video_prompt ? videoModel : 'Unknown';
        if (currentModel !== 'Veo 3.1' && currentModel !== 'Unknown') {
            setShowMismatchWarning(true);
        } else {
            executeVideoGeneration();
        }
    };

    // =====================================================================
    // 🔒 CRITICAL ZONE: UI LOADER & GLOBAL STOP LOGIC PERFECTLY CALIBRATED. 
    // DO NOT EDIT OR MODIFY UNDER ANY CIRCUMSTANCES. 
    // IF CHANGES ARE ABSOLUTELY NECESSARY, YOU MUST ASK THE BOSS FOR 
    // EXPLICIT PERMISSION IN THE CHAT BEFORE PROCEEDING.
    // =====================================================================
    const handleStopVideoGeneration = () => {
        stopVideoGenerationRef.current = true;
        if (videoAbortControllerRef.current) {
            videoAbortControllerRef.current.abort();
        }
        setIsGeneratingVideos(false);
        showNotification("Current generation/translation process is stopping...");
    };

    const handleSceneSelectionChange = (index: number) => {
        setSelectedScenesForVideo(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    };

    const handleDownloadSingleVideo = (videoUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `${projectName.replace(/\s+/g, '_')}_scene_${index + 1}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`Downloading video for Scene ${index + 1}...`);
    };

    const handleDownloadVideosZip = async () => {
        const completedVideos = Object.entries(videoGenerationStatus).filter(([, value]) => {
            if (typeof value === 'object' && value !== null && 'status' in value && 'videoUrl' in value) {
                return value.status === 'complete' && value.videoUrl;
            }
            return false;
        });

        if (completedVideos.length === 0) {
            showNotification("No completed videos to download.");
            return;
        }

        showNotification(`Creating ZIP file with ${completedVideos.length} videos...`);
        const zip = new JSZip();
        try {
            for (const [indexStr, statusValue] of completedVideos) {
                if (typeof statusValue === 'object' && statusValue !== null && 'videoUrl' in statusValue && typeof statusValue.videoUrl === 'string') {
                    const index = parseInt(indexStr, 10);
                    const response = await fetch(statusValue.videoUrl, { signal: videoAbortControllerRef.current?.signal });
                    const videoBlob = await response.blob();
                    zip.file(`${projectName.replace(/\s+/g, '_')}_scene_${index + 1}.mp4`, videoBlob);
                }
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${projectName.replace(/\s+/g, '_')}_videos.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("Video ZIP file download started.");
        } catch (e: unknown) {
            handleError(e, 'ZIP creation', {});
        }
    };

    const handleCancelMismatch = () => {
        setShowMismatchWarning(false);
        stopVideoGenerationRef.current = true;
    };

    return {
        veoApiKey,
        veoApiKeyInput,
        setVeoApiKeyInput,
        selectedScenesForVideo,
        videoGenerationStatus,
        isGeneratingVideos,
        showMismatchWarning,
        handleSaveVeoApiKey,
        handleClearVeoApiKey,
        handleStartVideoGeneration,
        handleStopVideoGeneration,
        handleSceneSelectionChange,
        handleDownloadSingleVideo,
        handleDownloadVideosZip,
        executeVideoGeneration, // Exposed for mismatch modal confirmation
        handleCancelMismatch,
        stopVideoGenerationRef
    };
};