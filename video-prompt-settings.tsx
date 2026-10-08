
import React, { useState, useRef, useEffect } from 'react';
import { SceneResult } from './types';
import { DownloadIcon, CheckIcon } from './icons';

interface VideoPromptSettingsProps {
    videoModel: string;
    setVideoModel: (val: string) => void;
    videoPromptBasis: string;
    setVideoPromptBasis: (val: string) => void;
    includeDialogue: boolean;
    setIncludeDialogue: (val: boolean) => void;
    includeAmbient: boolean;
    setIncludeAmbient: (val: boolean) => void;
    includeSfx: boolean;
    setIncludeSfx: (val: boolean) => void;
    isGeneratingVideoPrompts: boolean;
    onStop: () => void;
    onGenerate: (count?: number, script?: string, isResume?: boolean) => void;
    results: SceneResult[];
    script: string;
    handleExportPrompts: () => void;
    handleGenerateOnlyPrompts: (count: number, scriptContent?: string) => Promise<void>;
    imageCount: number;
    handleDownloadVideoPrompts: () => void;
    handleDownloadCombinedPrompts: () => void;
    isVideoPromptsGenerated: boolean;
    isGeneratingTextPrompts: boolean;
    onResetVideoPrompts: () => void;
    onResetImagePrompts: () => void;
    onResetAll: () => void;
    setImageCount: (val: number) => void;
    isOptionsGlowActive?: boolean;
}

export const VideoPromptSettings: React.FC<VideoPromptSettingsProps> = ({
    videoModel, setVideoModel, videoPromptBasis, setVideoPromptBasis,
    includeDialogue, setIncludeDialogue, includeAmbient, setIncludeAmbient,
    includeSfx, setIncludeSfx, isGeneratingVideoPrompts, onStop, onGenerate,
    results, script, handleExportPrompts, handleGenerateOnlyPrompts, imageCount,
    handleDownloadVideoPrompts, handleDownloadCombinedPrompts, isVideoPromptsGenerated: _isVideoPromptsGenerated,
    isGeneratingTextPrompts, onResetVideoPrompts, onResetImagePrompts, onResetAll, setImageCount, isOptionsGlowActive
}) => {
    const [uploadedScript, setUploadedScript] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>('');
    const [isPromptGenerationDone, setIsPromptGenerationDone] = useState(false);
    const scriptFileInputRef = useRef<HTMLInputElement>(null);
    const [activeSource, setActiveSource] = useState<'main' | 'upload'>('main');

    // Reset local states when parent resets storyboard results (results empty)
    useEffect(() => {
        if (results.length === 0) {
            setIsPromptGenerationDone(false);
            setUploadedScript(null);
            setUploadedFileName('');
            setActiveSource('main');
        }
    }, [results]);

    // Reset active source to main if the main script changes significantly (user loaded a new project/script)
    useEffect(() => {
        if (script && !uploadedScript) {
            setActiveSource('main');
        }
    }, [script, uploadedScript]);

    const handleScriptFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedScript(e.target?.result as string);
                setActiveSource('upload'); // Auto-select upload when file is added
            };
            reader.readAsText(file);
        }
    };

    const getActiveScript = () => {
        return activeSource === 'upload' ? (uploadedScript || '') : script;
    };

    const onGeneratePromptsClick = async () => {
        const scriptToUse = getActiveScript();
        await handleGenerateOnlyPrompts(imageCount, scriptToUse);
        setIsPromptGenerationDone(true);
    };

    const handleStartOver = () => {
        setIsPromptGenerationDone(false);
    };
    
    const handleVideoGenerateClick = () => {
         // Specific Logic Fix: 
         // If "Script-Driven", explicitly pass the selected script (Main or Uploaded) and Count.
         // This ensures "Upload Script" choice is respected for manual generation.
         const isResume = videoButtonLabel === 'Resume Video Prompts';
         if (videoPromptBasis === 'script-driven' || videoPromptBasis === 'script-driven-auto') {
             const scriptToUse = getActiveScript();
             // If auto, pass undefined count to trigger auto-breakdown. Otherwise, use manual count.
             const countToUse = videoPromptBasis === 'script-driven-auto' 
                 ? undefined 
                 : (imageCount > 0 ? imageCount : 1);
             onGenerate(countToUse, scriptToUse, isResume);
         } else {
             // Image-driven relies on existing results (SceneResult objects), so no need to pass script/count
             onGenerate(undefined, undefined, isResume);
         }
    };

    // Evaluate Image Prompts State
    const hasAnyImagePrompts = results.some(r => r && r.image_prompt && r.image_prompt.trim().length > 0);
    const hasAnyPrompts = results.some(r => r && ((r.image_prompt && r.image_prompt.trim().length > 0) || (r.video_prompt && r.video_prompt.trim().length > 0)));
    const hasPendingOrFailedImagePrompts = results.length < (imageCount || 1) || results.some(r => 
        !r || !r.image_prompt || r.image_prompt.trim() === ''
    );

    let imageButtonLabel = 'Generate Image Prompts';
    if (hasAnyImagePrompts) {
        if (hasPendingOrFailedImagePrompts) {
            imageButtonLabel = 'Resume Image Prompts';
        } else {
            imageButtonLabel = 'Regenerate Image Prompts';
        }
    }

    // Evaluate Video Prompts State robustly based directly on results
    const hasAnyVideoPrompts = results.some(r => r && r.video_prompt && r.video_prompt.trim().length > 0);
    const hasPendingOrFailedVideoPrompts = results.length > 0 && results.some(r => 
        r && (
            !r.video_prompt || 
            r.video_prompt.trim() === '' || 
            r.videoPromptStatus === 'pending' || 
            r.videoPromptStatus === 'failed'
        )
    );

    let videoButtonLabel = 'Generate Video Prompts';
    if (hasAnyVideoPrompts) {
        if (hasPendingOrFailedVideoPrompts) {
            videoButtonLabel = 'Resume Video Prompts';
        } else {
            videoButtonLabel = 'Regenerate Video Prompts';
        }
    }

    const isDownloadCombinedDisabled = results.length === 0;

    return (
        <div className="card">
            {/* New Section: Generate Image Prompts directly from Script (ULTRA COMPACT REDESIGN) */}
            <div className="prompt-generator-section" style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                
                {/* Header - Compact */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
                        Script to Prompts <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>(For Manual Generation)</span>
                    </h2>
                    <small style={{opacity: 0.8, fontSize: '0.75rem'}}>
                        <strong style={{ color: '#FFD700' }}>Note:</strong> Master Autopilot always uses the Main Script.
                    </small>
                </div>
                
                {/* Main Grid - Ultra Compact rows */}
                <div className="script-source-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {/* Source Box 1: Main Script */}
                    <div 
                        className={`script-source-card ${activeSource === 'main' ? 'selected' : ''}`}
                        onClick={() => setActiveSource('main')}
                        style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, height: 'auto', minHeight: 'unset', cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Use Main Script</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={script}>
                                {script.trim() ? (script.length > 50 ? script.slice(0, 50) + "..." : script) : "(Empty)"}
                            </span>
                        </div>
                    </div>

                    {/* Source Box 2: Upload Script */}
                    <div 
                        className={`script-source-card ${activeSource === 'upload' ? 'selected' : ''}`}
                        onClick={() => {
                            if (!uploadedFileName) scriptFileInputRef.current?.click();
                            else setActiveSource('upload');
                        }}
                        style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, height: 'auto', minHeight: 'unset', cursor: 'pointer' }}
                    >
                        <input 
                            type="file" 
                            ref={scriptFileInputRef}
                            onChange={handleScriptFileUpload}
                            accept=".txt,.srt"
                            style={{ display: 'none' }}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Upload Script</h4>
                            <span style={{ fontSize: '0.75rem', color: uploadedFileName ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {uploadedFileName || "Browse .txt/.srt"}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {uploadedFileName && (
                                <button 
                                    className="secondary-action-btn" 
                                    style={{fontSize: '0.7rem', padding: '0.15rem 0.4rem', width: 'auto', height: 'auto', margin: 0}} 
                                    onClick={(e) => { e.stopPropagation(); scriptFileInputRef.current?.click(); }}
                                    disabled={isPromptGenerationDone || isGeneratingTextPrompts}
                                >
                                    Change
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls - Compact Flex Row */}
                <div className="prompt-generation-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: videoPromptBasis === 'script-driven-auto' ? 0.5 : 1 }}>
                        <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>Number of Prompts:</label>
                        <input 
                            type="number" 
                            min="0" 
                            value={imageCount} 
                            onChange={(e) => setImageCount(parseInt(e.target.value) || 0)}
                            disabled={isPromptGenerationDone || isGeneratingTextPrompts || videoPromptBasis === 'script-driven-auto'}
                            style={{ width: '70px', padding: '0.25rem', margin: 0, cursor: videoPromptBasis === 'script-driven-auto' ? 'not-allowed' : 'text' }}
                            readOnly={videoPromptBasis === 'script-driven-auto'}
                        />
                    </div>
                    
                    <div className="prompt-buttons-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {!isGeneratingTextPrompts ? (
                            <button 
                                onClick={onGeneratePromptsClick} 
                                disabled={!getActiveScript().trim()}
                                className="cyan-btn"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', margin: 0 }}
                            >
                                {imageButtonLabel}
                            </button>
                        ) : (
                            <button onClick={onStop} className="stop-button" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', margin: 0 }}>
                                Stop
                            </button>
                        )}

                        {results.length > 0 && (
                            <button 
                                onClick={() => {
                                    setIsPromptGenerationDone(false);
                                    onResetImagePrompts();
                                }}
                                className="stop-button" 
                                style={{backgroundColor: '#e11d48', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', margin: 0}}
                            >
                                Reset Prompts
                            </button>
                        )}
                        
                        <button 
                            onClick={handleExportPrompts} 
                            className="btn-success"
                            disabled={!hasAnyImagePrompts}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                            <DownloadIcon style={{ width: '12px', height: '12px' }} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="video-prompt-card" style={{padding:0, border: 'none', background: 'transparent'}}>
                <h2>Video Prompt Options</h2>
                <div className="config-grid">
                    <div className="config-item">
                        <label htmlFor="videoModel">Target Video Model</label>
                        <select id="videoModel" value={videoModel} onChange={(e) => setVideoModel(e.target.value)}>
                            <option value="Veo 3.1">Veo 3.1 (Google)</option>
                            <option value="Sora">Sora (OpenAI)</option>
                            <option value="Kling">Kling (Kuaishou)</option>
                            <option value="Vidu">Vidu (ShengShu)</option>
                            <option value="Hailuo">Hailuo (Alibaba)</option>
                        </select>
                    </div>
                    <div className="config-item">
                        <label htmlFor="videoPromptBasis">Prompt Generation Basis</label>
                        <select id="videoPromptBasis" value={videoPromptBasis} onChange={(e) => setVideoPromptBasis(e.target.value)}>
                            <option value="image-driven">Image-Driven (Animate Scene)</option>
                            <option value="script-driven-auto">Auto (Sentence-by-Sentence)</option>
                            <option value="script-driven">Script-Driven (Manual Count)</option>
                        </select>
                    </div>
                    <div className={`config-item audio-cues-group ${isOptionsGlowActive && !includeDialogue && !includeAmbient && !includeSfx ? 'required-glow' : ''}`}>
                        <label style={{marginBottom: '0.75rem', display: 'block', fontSize: '1.05rem', fontWeight: 'bold'}}>Include Audio Cues</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: includeDialogue ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: includeDialogue ? 'bold' : 'normal', padding: '0.4rem 0.6rem', backgroundColor: includeDialogue ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '6px', border: includeDialogue ? '1px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" id="dialogue" checked={includeDialogue} onChange={(e) => setIncludeDialogue(e.target.checked)} style={{width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', margin: 0, cursor: 'pointer'}} />
                                Dialogue
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: includeAmbient ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: includeAmbient ? 'bold' : 'normal', padding: '0.4rem 0.6rem', backgroundColor: includeAmbient ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '6px', border: includeAmbient ? '1px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" id="ambient" checked={includeAmbient} onChange={(e) => setIncludeAmbient(e.target.checked)} style={{width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', margin: 0, cursor: 'pointer'}} />
                                Ambient Sound
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: includeSfx ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: includeSfx ? 'bold' : 'normal', padding: '0.4rem 0.6rem', backgroundColor: includeSfx ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '6px', border: includeSfx ? '1px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" id="sfx" checked={includeSfx} onChange={(e) => setIncludeSfx(e.target.checked)} style={{width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', margin: 0, cursor: 'pointer'}} />
                                Sound FX
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="button-group">
                {/* --- VIDEO BUTTONS SECTION --- */}
                {isGeneratingVideoPrompts ? (
                        <button onClick={onStop} className="stop-button">Stop</button>
                ) : (
                    <>
                        <button 
                            onClick={handleVideoGenerateClick} 
                            disabled={
                                isGeneratingVideoPrompts || 
                                (videoPromptBasis === 'image-driven' && results.length === 0) || 
                                (videoPromptBasis !== 'image-driven' && (!getActiveScript() || getActiveScript().trim() === ''))
                            }
                            style={{
                                backgroundColor: videoButtonLabel === 'Resume Video Prompts' ? '#eab308' : 
                                                 videoButtonLabel === 'Regenerate Video Prompts' ? '#22c55e' : '',
                                color: (videoButtonLabel === 'Resume Video Prompts' || videoButtonLabel === 'Regenerate Video Prompts') ? 'white' : ''
                            }}
                        >
                            {videoButtonLabel}
                        </button>
                        {results.length > 0 && hasAnyVideoPrompts && (
                            <button
                                onClick={onResetVideoPrompts}
                                className="stop-button"
                                style={{backgroundColor: '#e11d48', color: 'white', padding: '0.6rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}
                                title="Clear all generated video prompts and reset their statuses."
                            >
                                Reset Video Prompts
                            </button>
                        )}
                        
                        <button 
                            onClick={handleDownloadVideoPrompts} 
                            className={hasAnyVideoPrompts ? "btn-success" : ""}
                            disabled={!hasAnyVideoPrompts}
                            style={!hasAnyVideoPrompts ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                        >
                            <DownloadIcon /> Download Video Prompts
                        </button>
                    </>
                )}
                <button 
                    onClick={handleDownloadCombinedPrompts} 
                    disabled={isDownloadCombinedDisabled}
                    style={isDownloadCombinedDisabled ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                >
                    Download All Prompts (Combined)
                </button>
            </div>
        </div>
    );
};
