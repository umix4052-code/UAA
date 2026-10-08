import React, { useState, useRef, useEffect } from 'react';
import { SceneResult, VideoGenerationStatus } from './types';
// Fix: Import RegenerateIcon
import { VideoIcon, DownloadIcon, ErrorIcon, RegenerateIcon } from './icons';

interface VeoVideoGeneratorProps {
    veoApiKey: string;
    veoApiKeyInput: string;
    setVeoApiKeyInput: (val: string) => void;
    handleSaveVeoApiKey: () => void;
    handleClearVeoApiKey: () => void;
    isGeneratingVideos: boolean;
    handleStopVideoGeneration: () => void;
    handleStartVideoGeneration: () => void;
    selectedScenesForVideo: number[];
    handleDownloadVideosZip: () => void;
    results: SceneResult[];
    handleSceneSelectionChange: (index: number) => void;
    handlePromptChange: (index: number, val: string, type: 'video') => void;
    videoGenerationStatus: { [key: number]: VideoGenerationStatus };
    handleDownloadSingleVideo: (url: string, index: number) => void;
    // Fix: Add missing prop for regenerating single video prompts
    onRegenerateSinglePrompt: (sceneIndex: number) => void;
    useEnvApiKey?: boolean; // New prop for env api key
}

export const VeoVideoGenerator: React.FC<VeoVideoGeneratorProps> = ({
    veoApiKey, veoApiKeyInput, setVeoApiKeyInput, handleSaveVeoApiKey, handleClearVeoApiKey,
    isGeneratingVideos, handleStopVideoGeneration, handleStartVideoGeneration,
    selectedScenesForVideo, handleDownloadVideosZip, results, handleSceneSelectionChange,
    handlePromptChange, videoGenerationStatus, handleDownloadSingleVideo,
    // Fix: Destructure the new prop
    onRegenerateSinglePrompt, useEnvApiKey = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedPrompts, setCopiedPrompts] = useState<Set<number>>(new Set());
    const sectionRef = useRef<HTMLDivElement>(null);

    const handleCopyVideoPrompt = async (index: number, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedPrompts(prev => new Set(prev).add(index));
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleClearAllGreenMarks = () => {
        setCopiedPrompts(new Set());
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const itemsWithPrompts = results.map((result, index) => ({ result, index })).filter(item => item.result && item.result.video_prompt);
    const visibleItems = isExpanded ? itemsWithPrompts : itemsWithPrompts.slice(0, 4);

    return (
        <div className="card video-generation-card" ref={sectionRef}>
            <h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><VideoIcon /> Veo Video Generation / Video Prompts</span>
                </div>
            </h2>
            <div className="veo-api-key-section">
                <p className={`api-key-status ${(useEnvApiKey || veoApiKey) ? 'selected' : 'not-selected'}`}>
                    Status: {useEnvApiKey ? 'Using Environment API Key' : (veoApiKey ? `API Key Provided (...${veoApiKey.slice(-4)})` : 'API Key Not Provided')}
                </p>
                <div className="input-group">
                    <input 
                        type="password" 
                        value={veoApiKeyInput} 
                        onChange={(e) => setVeoApiKeyInput(e.target.value)} 
                        placeholder="Enter your Veo API Key"
                        disabled={useEnvApiKey}
                    />
                    <button onClick={handleSaveVeoApiKey} disabled={useEnvApiKey}>Save Key</button>
                    <button onClick={handleClearVeoApiKey} className="clear-veo-key-btn" disabled={!veoApiKey || useEnvApiKey}>Clear Key</button>
                </div>
                <p className="description">Veo requires a project with billing enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer">Learn more</a>.</p>
            </div>
            
            <div className="main-actions" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {isGeneratingVideos ? (
                    <button className="stop-button" onClick={handleStopVideoGeneration}>Stop Generation</button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={handleStartVideoGeneration} disabled={(!useEnvApiKey && !veoApiKey) || selectedScenesForVideo.length === 0}>
                            {selectedScenesForVideo.length > 0 ? `Generate ${selectedScenesForVideo.length} Selected Videos` : 'Generate Selected Videos'}
                        </button>
                        <span style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--primary-color)', 
                            fontWeight: '600',
                            backgroundColor: 'rgba(0, 230, 204, 0.1)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: '1px solid rgba(0, 230, 204, 0.2)'
                        }}>
                            Total: {results.filter(r => r && r.video_prompt && r.video_prompt.trim().length > 0).length} / {results.length}
                        </span>
                    </div>
                )}
                <button onClick={handleDownloadVideosZip} disabled={Object.values(videoGenerationStatus).filter((s: VideoGenerationStatus) => s.status === 'complete').length === 0}>
                    Download Completed as ZIP
                </button>
                {copiedPrompts.size > 0 && (
                    <button onClick={handleClearAllGreenMarks} className="secondary-action-btn" style={{ background: 'transparent', border: '1px solid #4CAF50', color: '#4CAF50' }}>
                        Clear All Green Marks
                    </button>
                )}
            </div>
            
            {itemsWithPrompts.length > 0 && (
                <>
                    <div className="video-generation-list">
                        {visibleItems.map(({ result, index }) => (
                            <div key={index} className="video-gen-scene-item">
                                {/* Fix: Added flex styles to align the new button */}
                                <div className="video-gen-selector" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                    <input 
                                        type="checkbox" 
                                        id={`scene-select-${index}`} 
                                        checked={selectedScenesForVideo.includes(index)} 
                                        onChange={() => handleSceneSelectionChange(index)}
                                        style={{width: 'auto'}}
                                    />
                                    <label htmlFor={`scene-select-${index}`}><h3>Scene {index + 1}</h3></label>
                                    
                                    {copiedPrompts.has(index) ? (
                                        <span style={{ color: '#4CAF50', fontSize: '0.8rem', fontWeight: 'bold', background: 'var(--surface-color)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                            Copied!
                                        </span>
                                    ) : (
                                        <button 
                                            title="Copy video prompt"
                                            onClick={() => handleCopyVideoPrompt(index, result.video_prompt || '')}
                                            style={{ background: 'var(--surface-color)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                            disabled={!result.video_prompt}
                                        >
                                            Copy
                                        </button>
                                    )}

                                    {/* Fix: Added regenerate button for individual video prompts */}
                                    <button
                                        title="Regenerate video prompt"
                                        onClick={() => onRegenerateSinglePrompt(index)}
                                        disabled={isGeneratingVideos || result.videoPromptStatus === 'generating'}
                                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                    >
                                        <RegenerateIcon />
                                    </button>
                                </div>

                                <div className="video-gen-content" style={{ position: 'relative' }}>
                                        <textarea 
                                            className="prompt-text-area video-prompt-area" 
                                            value={result.video_prompt} 
                                            onChange={(e) => handlePromptChange(index, e.target.value, 'video')} 
                                            style={copiedPrompts.has(index) ? { color: '#4CAF50', borderColor: '#4CAF50' } : {}}
                                        />
                                </div>

                                <div className="video-gen-status">
                                    {videoGenerationStatus[index]?.status === 'generating' && <div className="status-indicator generating"><div className="loader small"></div><span>{videoGenerationStatus[index]?.progressMessage}</span></div>}
                                    {videoGenerationStatus[index]?.status === 'polling' && <div className="status-indicator generating"><div className="loader small"></div><span>{videoGenerationStatus[index]?.progressMessage}</span></div>}
                                    {videoGenerationStatus[index]?.status === 'complete' && videoGenerationStatus[index]?.videoUrl && (
                                        <div className="video-complete-container">
                                            <video src={videoGenerationStatus[index]?.videoUrl || undefined} loop muted playsInline />
                                            <button onClick={() => handleDownloadSingleVideo(videoGenerationStatus[index]!.videoUrl!, index)} className="video-download-btn"><DownloadIcon /></button>
                                        </div>
                                    )}
                                    {videoGenerationStatus[index]?.status === 'failed' && <div className="status-indicator failed" title={videoGenerationStatus[index]?.error}><ErrorIcon /><span>Failed</span></div>}
                                    {(!videoGenerationStatus[index] || videoGenerationStatus[index]?.status === 'idle') && <div className="status-indicator">Idle</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {!isExpanded && itemsWithPrompts.length > 4 && (
                        <div className="see-more-container" style={{ textAlign: 'center', marginTop: '1rem', padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
                            <button className="secondary-action-btn" onClick={() => setIsExpanded(true)} style={{ padding: '0.5rem 1.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '4px', cursor: 'pointer' }}>
                                See More ({itemsWithPrompts.length - 4} More)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};