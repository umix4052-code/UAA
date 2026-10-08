import React, { useRef, useState, useEffect } from 'react';
import { VideoIcon, DownloadIcon, InfoIcon } from './icons';
import { formatTime, formatBytes } from './utils';

export interface VideoAnalyzerProps {
    videoUrl: string;
    setVideoUrl: (url: string) => void;
    isAnalyzingUrl: boolean;
    onDeconstruct: (isVisualRemake: boolean, remakeType: 'long' | 'shorts' | 'hyper-detailed') => void;
    onVideoFileSelect?: (file: File, isVisualRemake: boolean, remakeType: 'long' | 'shorts' | 'hyper-detailed', framesPerBatch: number, extractScriptAndStyles: boolean, generatePromptsDirectly: boolean, extractCharacters: boolean, resumeFromSegment?: number) => void;
    onVideoFileStage?: (file: File, isVisualRemake: boolean) => void;
    onStop: () => void;
    resumableSegment: number | null;
    isVisualRemakeMode: boolean;
    setIsVisualRemakeMode: (val: boolean) => void;
}

export const VideoAnalyzerCard: React.FC<VideoAnalyzerProps> = ({ 
    videoUrl, setVideoUrl, isAnalyzingUrl, onVideoFileSelect, onVideoFileStage, onStop, resumableSegment,
    isVisualRemakeMode, setIsVisualRemakeMode
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    
    // States for staging, mode and timer
    const [stagedFile, setStagedFile] = useState<File | null>(null);
    const [remakeType, setRemakeType] = useState<'long' | 'shorts' | 'hyper-detailed'>('long');
    const [extractScriptAndStyles, setExtractScriptAndStyles] = useState(true);
    const [extractCharacters, setExtractCharacters] = useState(true);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const timerIntervalRef = useRef<number | null>(null);
    const [framesPerBatch, setFramesPerBatch] = useState(5);
    // New state for the checkbox
    const [generatePromptsDirectly, setGeneratePromptsDirectly] = useState(true);

    const [apiProvider, setApiProvider] = useState<string>('google');
    const [customRouterUrl, setCustomRouterUrl] = useState<string>('');
    const [customRouterModel, setCustomRouterModel] = useState<string>('');

    useEffect(() => {
        const handleStorageChange = () => {
            const provider = localStorage.getItem('apiProvider') || 'google';
            const url = localStorage.getItem('customRouterBaseUrl') || localStorage.getItem('customRouterUrl') || '';
            const model = localStorage.getItem('customRouterModelId') || '';
            
            setApiProvider(prev => (prev !== provider ? provider : prev));
            setCustomRouterUrl(prev => (prev !== url ? url : prev));
            setCustomRouterModel(prev => (prev !== model ? model : prev));
        };

        handleStorageChange(); // Initial load
        window.addEventListener('profileUpdated', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('profileUpdated', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (apiProvider === 'google') {
            setFramesPerBatch(24);
        } else if (apiProvider === 'openrouter') {
            setFramesPerBatch(5); // Updated from 8 to 5 for payload safety
        } else if (apiProvider === 'custom') {
            const customUrl = (customRouterUrl || '').toLowerCase();
            const customModel = (customRouterModel || '').toLowerCase(); 
            const isGroq = customUrl.includes('groq') || customModel.includes('qwen') || customModel.includes('llama');
            
            setFramesPerBatch(isGroq ? 3 : 5);
        }
    }, [apiProvider, customRouterUrl, customRouterModel]);


    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setStagedFile(file);
            if (onVideoFileStage) onVideoFileStage(file, isVisualRemakeMode);
        }
        if (e.target) e.target.value = '';
    };

    const startTimer = () => {
        setRecordingSeconds(0);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = window.setInterval(() => {
            setRecordingSeconds(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true 
            });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                stopTimer();
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const file = new File([blob], `screen-rec-${timestamp}.webm`, { type: 'video/webm' });
                
                setStagedFile(file);
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);
            startTimer();

            stream.getVideoTracks()[0].onended = () => {
                 if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                 }
            };

        } catch (err) {
            console.error("Error starting screen recording:", err);
            setIsRecording(false);
            stopTimer();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleDownloadStagedFile = () => {
        if (!stagedFile) return;
        const url = URL.createObjectURL(stagedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = stagedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRemoveStagedFile = () => {
        setStagedFile(null);
        setRecordingSeconds(0);
        localStorage.removeItem('remake_resume_segment');
    };

    const handleAnalyzeClick = (isResume = false) => {
        if (stagedFile && onVideoFileSelect) {
            onVideoFileSelect(stagedFile, isVisualRemakeMode, remakeType, framesPerBatch, extractScriptAndStyles, generatePromptsDirectly, extractCharacters, isResume ? resumableSegment ?? undefined : undefined);
        }
    };

    return (
        <div className="card video-analyzer-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>AI Video Deconstructor</h2>
                    <p className="description" style={{ margin: '0.25rem 0 0 0' }}>Analyze videos scene-by-scene. Perfect for remakes or factory processes.</p>
                </div>
                <div style={{
                    fontSize: '0.85rem',
                    color: '#64ffda',
                    background: 'rgba(100, 255, 218, 0.08)',
                    border: '1px solid rgba(100, 255, 218, 0.25)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    maxWidth: '450px',
                    lineHeight: '1.4'
                }}>
                    <strong style={{ color: '#FFD700', fontSize: '1rem' }}>💡 Limit Note:</strong> Up to 15 minutes of video remake per day has been successfully tested using Gemini free-tier. Note that actual limits may vary according to Google's policies and rule updates.
                </div>
            </div>
            
            <div className="style-item" style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--primary)', borderRadius: 'var(--base-radius)', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--primary)' }}>Visual Remake Mode</strong>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {isVisualRemakeMode
                                ? "ON: Analyzes video visuals shot-by-shot to generate a full storyboard with prompts."
                                : "OFF: Analyzes only the audio to extract the script and voice tone."}
                        </small>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={isVisualRemakeMode} 
                            onChange={(e) => setIsVisualRemakeMode(e.target.checked)} 
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {isVisualRemakeMode && (
                <div style={{ 
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--base-radius)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{fontWeight: '500', fontSize: '0.9rem'}}>Visual Remake Video Length:</span>
                        <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                            <input type="radio" name="remakeType" value="long" checked={remakeType === 'long'} onChange={() => setRemakeType('long')} style={{width: 'auto'}}/>
                            Long Video (8-10s/scene)
                        </label>
                        <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                            <input type="radio" name="remakeType" value="shorts" checked={remakeType === 'shorts'} onChange={() => setRemakeType('shorts')} style={{width: 'auto'}}/>
                            Shorts (2-4s/scene)
                        </label>
                        <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                            <input type="radio" name="remakeType" value="hyper-detailed" checked={remakeType === 'hyper-detailed'} onChange={() => setRemakeType('hyper-detailed')} style={{width: 'auto'}}/>
                            Hyper-Detailed
                        </label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', gap: '4px' }}>
                            <div className="config-item" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <label htmlFor="framesPerBatch" style={{margin: 0, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                    Frames per Batch
                                    <div className="tooltip-icon" title="Standard is 24 for Gemini (Fixed). For OpenRouter (Default: 5) and Custom Routers (Default: 5), adjust up or down from their default values based on your specific model's limits.">
                                        <InfoIcon/>
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    id="framesPerBatch"
                                    value={framesPerBatch}
                                    onChange={(e) => setFramesPerBatch(parseInt(e.target.value, 10))}
                                    min="1"
                                    max="60"
                                    style={{width: '80px'}}
                                />
                            </div>
                            <div style={{ color: '#eab308', fontSize: '0.75rem', maxWidth: '250px', textAlign: 'right', lineHeight: '1.2' }}>
                                💡 Note: Gemini=24 (Fixed). OpenRouter=5, Custom=5. Adjust defaults based on model limits.
                            </div>
                        </div>
                    </div>
                    
                    {remakeType === 'hyper-detailed' && (
                        <p className="description" style={{marginTop: '-0.5rem', color: 'var(--primary)'}}>
                           Creates a new scene for every visual change (Maximum Detail). Ideal for shot-by-shot remakes or long videos.
                        </p>
                    )}
                    {(apiProvider === 'openrouter' || apiProvider === 'custom') && (
                        <p className="description" style={{gridColumn: '1 / -1', marginTop: '-0.5rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 500}}>
                           Note: If you face payload or rate-limit errors, we recommend reducing 'Frames per Batch' to 4 or 5.
                        </p>
                    )}
                    <div className="style-item" style={{ gridColumn: '1 / 2', background: 'transparent', padding: '0.5rem 0 0 0', border: 'none', boxShadow: 'none' }}>
                        <input
                            type="checkbox"
                            id="extractScriptAndStyles"
                            checked={extractScriptAndStyles}
                            onChange={(e) => setExtractScriptAndStyles(e.target.checked)}
                            style={{ width: 'auto', marginRight: '0.5rem' }}
                        />
                        <label htmlFor="extractScriptAndStyles" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                            Extract Script & Styles First (Full Analysis)
                        </label>
                        <div className="tooltip-icon" title="If unchecked, the app will ONLY perform visual analysis to create a storyboard, saving time and API costs." style={{ marginLeft: '0.25rem' }}>
                            <InfoIcon />
                        </div>
                    </div>
                    <div className="style-item" style={{ gridColumn: '2 / 3', background: 'transparent', padding: '0.5rem 0 0 0', border: 'none', boxShadow: 'none', justifyContent: 'flex-end', opacity: apiProvider !== 'google' ? 0.6 : 1 }}>
                        <input
                            type="checkbox"
                            id="extractCharacters"
                            checked={apiProvider === 'google' ? extractCharacters : false}
                            onChange={(e) => setExtractCharacters(e.target.checked)}
                            disabled={apiProvider !== 'google'}
                            style={{ width: 'auto', marginRight: '0.5rem', cursor: apiProvider !== 'google' ? 'not-allowed' : 'pointer' }}
                        />
                        <label htmlFor="extractCharacters" style={{ cursor: apiProvider !== 'google' ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                            Extract Characters
                        </label>
                        <div className="tooltip-icon" title={apiProvider !== 'google' ? "Character extraction requires Google Gemini API." : "If checked, the AI will extract character profiles from the video. Uncheck to save API costs if characters are not needed."} style={{ marginLeft: '0.25rem' }}>
                            <InfoIcon/>
                        </div>
                    </div>
                     <div className="style-item" style={{ gridColumn: '1 / -1', background: 'transparent', padding: '0.5rem 0 0 0', border: 'none', boxShadow: 'none', justifyContent: 'flex-start' }}>
                        <input
                            type="checkbox"
                            id="generateVideoPromptsOnly"
                            checked={generatePromptsDirectly}
                            onChange={(e) => setGeneratePromptsDirectly(e.target.checked)}
                            style={{ width: 'auto', marginRight: '0.5rem' }}
                        />
                        <label htmlFor="generateVideoPromptsOnly" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Generate Video Prompts Directly
                        </label>
                        <div className="tooltip-icon" title="Saves time by generating video prompts immediately after analysis, skipping the manual image generation step." style={{ marginLeft: '0.25rem' }}>
                            <InfoIcon />
                        </div>
                    </div>
                </div>
            )}

            <div className="input-group">
                <input 
                    type="url" 
                    value={videoUrl} 
                    onChange={(e) => setVideoUrl(e.target.value)} 
                    placeholder="Paste Video Link... (Currently disabled)"
                    disabled={true}
                    title="This feature is currently disabled due to unreliability. Please use the file upload or screen record options."
                />
                <button disabled={true}>
                    Start Remake
                </button>
            </div>

            <div className="or-divider">- OR -</div>

            {stagedFile ? (
                <div className="staged-file-preview">
                    <div className="file-info">
                        <VideoIcon />
                        <div className="file-details">
                            <span className="file-name">{stagedFile.name}</span>
                            <span className="file-size">{formatBytes(stagedFile.size)}</span>
                        </div>
                    </div>
                    
                    <div className="file-actions">
                        <button onClick={handleDownloadStagedFile} className="remove-file-btn" title="Download Recorded Video">
                            <DownloadIcon />
                        </button>
                         {isAnalyzingUrl ? (
                            <button onClick={onStop} className="stop-button analyze-btn">Stop</button>
                         ) : resumableSegment !== null ? (
                             <button onClick={() => handleAnalyzeClick(true)} disabled={isAnalyzingUrl} className="analyze-btn" style={{backgroundColor: '#FFA726', color: '#000'}}>
                                Resume from Segment {resumableSegment + 1}
                            </button>
                         ) : (
                             <button onClick={() => handleAnalyzeClick(false)} disabled={isAnalyzingUrl} className="analyze-btn">
                                {isVisualRemakeMode ? 'Start Remake' : 'Analyze File'}
                            </button>
                         )}
                        <button onClick={handleRemoveStagedFile} className="remove-file-btn">×</button>
                    </div>
                </div>
            ) : (
                <>
                    {resumableSegment !== null && !isRecording && (
                        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#1E1E1E', color: '#FFD54F', borderRadius: '8px', border: '1px solid #FFD54F', textAlign: 'center' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#FFB300' }}>Analysis Paused</h4>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>A previous analysis was interrupted. Please re-upload the original video to resume from segment {resumableSegment + 1}.</p>
                            <button onClick={() => fileInputRef.current?.click()} style={{ backgroundColor: '#FFD54F', color: '#000', fontWeight: 'bold', width: '100%' }}>
                                Re-select Original Video
                            </button>
                        </div>
                    )}
                    <div className={`button-group upload-options ${isRecording ? 'recording' : ''} ${isVisualRemakeMode && !isRecording ? 'required-glow' : ''}`}>
                    {!isRecording && (
                        <div className="input-group" style={{ width: 'auto' }}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" style={{display: 'none'}} />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingUrl}>
                                Upload File
                            </button>
                        </div>
                    )}
                    <button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isAnalyzingUrl} className={isRecording ? 'is-recording' : ''}>
                        {isRecording ? `Stop (${formatTime(recordingSeconds)})` : 'Record Screen'}
                    </button>
                </div>
                </>
            )}
        </div>
    );
};

interface ScriptAssistantProps {
    scriptIdea: string;
    setScriptIdea: (idea: string) => void;
    isGeneratingScript: boolean;
    onGenerate: (duration: string) => void;
    onStop: () => void;
}

export const ScriptAssistantCard: React.FC<ScriptAssistantProps> = ({
    scriptIdea, setScriptIdea, isGeneratingScript, onGenerate, onStop
}) => {
    const [h, setH] = useState('0');
    const [m, setM] = useState('0');
    const [s, setS] = useState('0');

    const handleGenerateClick = () => {
        const duration = `${Number(h) || 0}:${Number(m) || 0}:${Number(s) || 0}`;
        onGenerate(duration);
    };

    return (
        <div className="card script-assistant-card" style={{ paddingTop: '15px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '10px' }}>AI Script Assistant</h2>
            <label htmlFor="scriptIdea" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                Script Topic / Idea 
                <span style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 'normal' }}>
                    (Type in Bengali or English to set output language)
                </span>
            </label>
            <div className="script-assistant-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                <div className="script-idea-input" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <textarea 
                        id="scriptIdea" 
                        rows={6}
                        value={scriptIdea} 
                        onChange={(e) => setScriptIdea(e.target.value)} 
                        placeholder="e.g., ট্রয় নগরীর পতনের ঐতিহাসিক গল্প। Tone হবে অত্যন্ত epic এবং cinematic. Focus on the strategy of the Wooden Horse. শেষে একটা dramatic twist থাকবে। (আপনি এখানে সাধারণ ভাষায় আপনার বিস্তারিত স্টোরি বা গাইডলাইন লিখতে পারেন...)"
                        style={{ width: '100%', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                        {scriptIdea.trim() ? scriptIdea.trim().split(/\s+/).length : 0} words | {scriptIdea.length} characters
                    </div>
                </div>

                <div className="duration-and-generate" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-main)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <label htmlFor="gen-h" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>H</label>
                            <input type="number" id="gen-h" min="0" value={h == 0 || h === '0' ? '' : h} onChange={e => setH(e.target.value)} placeholder="0" style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', textAlign: 'center' }} />
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>:</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <label htmlFor="gen-m" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>M</label>
                            <input type="number" id="gen-m" min="0" max="59" value={m == 0 || m === '0' ? '' : m} onChange={e => setM(e.target.value)} placeholder="0" style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', textAlign: 'center' }} />
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>:</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <label htmlFor="gen-s" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>S</label>
                            <input type="number" id="gen-s" min="0" max="59" value={s == 0 || s === '0' ? '' : s} onChange={e => setS(e.target.value)} placeholder="0" style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', textAlign: 'center' }} />
                        </div>
                    </div>

                    {isGeneratingScript ? (
                        <button onClick={onStop} className="stop-button">Stop</button>
                    ) : (
                        <button onClick={handleGenerateClick} disabled={!scriptIdea.trim()}>Generate</button>
                    )}
                </div>
            </div>
        </div>
    );
};