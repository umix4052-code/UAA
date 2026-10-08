import React, { useState, useRef, useEffect } from 'react';
import { CopyIcon, CheckIcon, AutopilotIcon, ClockIcon, StopIcon, InfoIcon } from './icons';
import { formatTime, stripTimestamps, splitScriptIntoMeaningfulChunks } from './utils';

// Simple inline SVG for translation icon
const TranslateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6"/>
        <path d="m4 14 6-6 2-3"/>
        <path d="M2 5h12"/>
        <path d="M7 2h1"/>
        <path d="m22 22-5-10-5 10"/>
        <path d="M14 18h6"/>
    </svg>
);


interface ScriptInputSectionProps {
    script: string;
    setScript: (script: string) => void;
    scriptType: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileName: string;
    generateUniqueStory: boolean;
    setGenerateUniqueStory: (val: boolean) => void;
    isRephrasing: boolean;
    handleRephraseScript: () => void;
    isAnalyzingScriptContent: boolean;
    handleAnalyzeScript: (options: { extractCharacters: boolean; configureVoice: boolean }) => void;
    onStop: () => void;
    handleRefineStory?: () => void;
    isBrainstorming?: boolean;
    // Synced props
    extractCharacters: boolean;
    setExtractCharacters: (val: boolean) => void;
    configureVoice: boolean;
    setConfigureVoice: (val: boolean) => void;
    // New Props for Camera
    autoConfigCamera: boolean;
    setAutoConfigCamera: (val: boolean) => void;
    // New Props for Translation
    onTranslateScript: (language: 'English' | 'Bengali' | 'Hindi') => void;
    isTranslating: boolean;
    // New prop for chunking
    useChunking: boolean;
    setUseChunking: (val: boolean) => void;
    chunkSize: number;
    setChunkSize: (size: number) => void;
    // New prop for provider context
    apiProvider: 'google' | 'openrouter';
    // For comparing original vs new script
    originalScript?: string | null;
    onScriptPaste?: (pastedText: string) => void;
    isOptionsGlowActive?: boolean;
}

export const ScriptInputSection: React.FC<ScriptInputSectionProps> = ({
    script, setScript, scriptType, fileInputRef, handleFileChange, fileName,
    generateUniqueStory, setGenerateUniqueStory, isRephrasing, handleRephraseScript,
    isAnalyzingScriptContent, handleAnalyzeScript, onStop, handleRefineStory,
    isBrainstorming = false,
    extractCharacters, setExtractCharacters, configureVoice, setConfigureVoice,
    autoConfigCamera, setAutoConfigCamera,
    onTranslateScript, isTranslating,
    useChunking, setUseChunking, chunkSize, setChunkSize,
    apiProvider, originalScript, onScriptPaste,
    isOptionsGlowActive
}) => {
    const [copied, setCopied] = useState(false);
    const [isTranslateMenuOpen, setIsTranslateMenuOpen] = useState(false);
    const [showingOriginal, setShowingOriginal] = useState(false);
    const translateMenuRef = useRef<HTMLDivElement>(null);
    const [justFinished, setJustFinished] = useState(false);
    const wasProcessing = useRef(false);

    useEffect(() => {
        const isProcessing = isRephrasing || isTranslating || isAnalyzingScriptContent || isBrainstorming;
        if (!isProcessing && wasProcessing.current) {
            // Processing just finished
            setJustFinished(true);
            setTimeout(() => setJustFinished(false), 2500); // Remove class after animation
        }
        wasProcessing.current = isProcessing;
    }, [isRephrasing, isTranslating, isAnalyzingScriptContent, isBrainstorming]);

    useEffect(() => {
        // Set default chunk size based on provider when it changes
        setChunkSize(apiProvider === 'google' ? 10000 : 4000);
    }, [apiProvider, setChunkSize]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
                setIsTranslateMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [translateMenuRef]);
    
    const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
    const charCount = script.length;
    
    // Standard Industry Calculation: ~120 words per minute (Average speaking pace)
    const estimatedSeconds = Math.ceil((wordCount / 120) * 60); 
    const maxWords = 40000;
    const progressPercentage = Math.min((wordCount / maxWords) * 100, 100);

    const displayChunkCount = useChunking && charCount > 0 && chunkSize > 0 ? Math.ceil(charCount / chunkSize) : 1;

    const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow the input to be temporarily empty (which evaluates to 0) while typing
        setChunkSize(value === '' ? 0 : parseInt(value, 10));
    };

    const handleCopyScript = () => {
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const translateButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: 'var(--text-primary)',
        padding: '0.75rem 1.5rem',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer'
    };
    
    const translateButtonHoverStyle: React.CSSProperties = {
        backgroundColor: 'var(--primary)',
        color: '#000'
    };

    return (
        <div className="card script-section">
            <div className="script-header-row">
                <h2>Script Input</h2>
                <div className="script-header-actions" style={{display: 'flex', gap: '0.5rem'}}>
                    <div style={{ position: 'relative' }} ref={translateMenuRef}>
                        {isTranslating ? (
                            <button
                                className="icon-btn stop-button"
                                onClick={onStop}
                                title="Stop Translation"
                            >
                                <StopIcon />
                            </button>
                        ) : (
                            <button
                                className="icon-btn"
                                onClick={() => setIsTranslateMenuOpen(!isTranslateMenuOpen)}
                                title="Translate Script"
                                disabled={!script.trim() || isRephrasing || isAnalyzingScriptContent}
                            >
                                <TranslateIcon />
                            </button>
                        )}
                        {isTranslateMenuOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', right: 0,
                                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--base-radius)', zIndex: 10,
                                marginTop: '0.5rem', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                display: 'flex', flexDirection: 'column', width: '150px'
                            }}>
                                <button 
                                    onClick={() => { onTranslateScript('English'); setIsTranslateMenuOpen(false); }} 
                                    style={translateButtonStyle}
                                    onMouseEnter={e => { Object.assign(e.currentTarget.style, translateButtonHoverStyle); }}
                                    onMouseLeave={e => { Object.assign(e.currentTarget.style, translateButtonStyle); }}
                                >
                                    to English
                                </button>
                                <button 
                                    onClick={() => { onTranslateScript('Bengali'); setIsTranslateMenuOpen(false); }} 
                                    style={translateButtonStyle}
                                    onMouseEnter={e => { Object.assign(e.currentTarget.style, translateButtonHoverStyle); }}
                                    onMouseLeave={e => { Object.assign(e.currentTarget.style, translateButtonStyle); }}
                                >
                                    to Bengali
                                </button>
                                <button 
                                    onClick={() => { onTranslateScript('Hindi'); setIsTranslateMenuOpen(false); }} 
                                    style={translateButtonStyle}
                                    onMouseEnter={e => { Object.assign(e.currentTarget.style, translateButtonHoverStyle); }}
                                    onMouseLeave={e => { Object.assign(e.currentTarget.style, translateButtonStyle); }}
                                >
                                    to Hindi
                                </button>
                            </div>
                        )}
                    </div>

                    {originalScript && (
                        <button 
                            onClick={() => setShowingOriginal(!showingOriginal)}
                            title={showingOriginal ? "View Edited Script" : "View Original Script"}
                            style={{ 
                                fontSize: '0.8rem', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: showingOriginal ? 'var(--secondary-color)' : 'transparent',
                                color: 'inherit',
                                marginRight: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {showingOriginal ? "Viewing Original" : "View Original"}
                        </button>
                    )}

                    <button 
                        className="icon-btn copy-script-btn" 
                        onClick={handleCopyScript} 
                        title="Copy Script"
                        disabled={!script.trim()}
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
            </div>

            {scriptType === 'text' ? (
                <textarea 
                    rows={10} 
                    className={justFinished ? 'textarea-success-glow' : ''}
                    value={showingOriginal && originalScript !== null ? originalScript : script} 
                    onChange={(e) => {
                        if (showingOriginal) return;
                        setScript(stripTimestamps(e.target.value));
                    }} 
                    placeholder="Write your story here..."
                    readOnly={showingOriginal}
                    style={showingOriginal ? { backgroundColor: 'var(--bg-secondary)', opacity: 0.8 } : undefined}
                    onPaste={(e) => {
                        if (showingOriginal || !onScriptPaste) return;
                        const pasted = e.clipboardData.getData('text');
                        if (pasted.length > 50) { 
                            onScriptPaste(pasted);
                        }
                    }}
                />
            ) : (
                <div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".srt,.txt" 
                        style={{display: 'none'}} 
                    />
                    <button onClick={() => fileInputRef.current?.click()}>Upload .SRT / .TXT File</button>
                    {fileName && <p style={{marginTop: '10px', fontSize: '0.9rem'}}>Selected file: {fileName}</p>}
                </div>
            )}
            
            <div className="script-stats-bar-modern">
                <div className="stat-item word-count-group">
                    <span className="stat-label">Words:</span>
                    <span className="stat-value-highlight">{wordCount.toLocaleString()}</span>
                    <span className="stat-divider">|</span>
                    <span className="stat-label">Chars:</span>
                    <span className="stat-value-highlight" title="Total characters including spaces">{charCount.toLocaleString()}</span>
                    
                    <div className="word-progress-bar" style={{width: '60px', marginLeft: '0.5rem'}}>
                        <div className="word-progress-fill" style={{width: `${progressPercentage}%`}}></div>
                    </div>
                </div>
                
                <div className="stat-item duration-badge" title="Estimated based on ~120 words per minute (Industry Standard)">
                    <ClockIcon />
                    <span>Time: {formatTime(estimatedSeconds)}</span>
                </div>
            </div>
            
            <div className="chunking-container">
                <p className="chunking-title">For large scripts (Rephrase, Translate, New Story):</p>
                <div className="chunking-controls">
                    <div className="style-item checkbox-small" style={{background: 'transparent', padding: 0}}>
                        <input 
                            type="checkbox" 
                            id="useChunking" 
                            checked={useChunking} 
                            onChange={(e) => setUseChunking(e.target.checked)} 
                            style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="useChunking" title="Breaks large scripts into smaller parts to avoid API errors. Recommended for OpenRouter.">
                            Process in Chunks
                        </label>
                    </div>
                    {useChunking && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label htmlFor="chunkSizeInput" style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Size (chars):</label>
                            <input
                                id="chunkSizeInput"
                                type="number"
                                value={chunkSize === 0 ? '' : chunkSize}
                                onChange={handleChunkSizeChange}
                                onBlur={() => { if (chunkSize < 200) setChunkSize(200); }}
                                style={{ width: '90px', padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)' }}
                                step="100"
                                min="200"
                            />
                        </div>
                    )}
                </div>
                {useChunking && (
                     <p className="chunk-recommendation-text">
                        <InfoIcon /> <strong>Tip:</strong> Gemini (Max: 10,000), OpenRouter (Free Max: 4,000). Larger chunks may cause errors or incomplete results.
                    </p>
                )}
                {useChunking && script.trim() && (
                    <p className="chunking-info-text">
                        ⚡️ This will be processed in <strong>{displayChunkCount}</strong> chunk{displayChunkCount !== 1 ? 's' : ''}.
                    </p>
                )}
            </div>

            <div className="script-footer-actions">
                {/* LEFT: Generate / Rephrase */}
                <div className="action-col left">
                    <div className="checkbox-stack">
                         <div className="style-item checkbox-small">
                            <input 
                                type="checkbox" 
                                id="generateUniqueStory" 
                                checked={generateUniqueStory} 
                                onChange={(e) => setGenerateUniqueStory(e.target.checked)} 
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label htmlFor="generateUniqueStory" title="Generates a completely new story on the same topic.">
                                Generate Unique Story
                            </label>
                        </div>
                    </div>
                    {isRephrasing ? (
                        <button onClick={onStop} className="stop-button full-width">
                            <StopIcon /> Stop Rephrasing
                        </button>
                    ) : (
                        <button onClick={handleRephraseScript} disabled={!script.trim() || isTranslating || isAnalyzingScriptContent} className="primary-action-btn full-width">
                            {generateUniqueStory ? 'Generate New' : 'Rephrase Script'}
                        </button>
                    )}
                </div>

                {/* MIDDLE: Refine Story */}
                <div className="action-col center">
                    {/* {isBrainstorming ? (
                        <button 
                            onClick={onStop} 
                            className="stop-button refine-story-btn" 
                        >
                            <StopIcon /> Stop Brainstorming
                        </button>
                    ) : (
                        <button 
                            className="refine-story-btn" 
                            onClick={handleRefineStory} 
                            disabled={!script.trim() || isRephrasing || isTranslating || isAnalyzingScriptContent}
                        >
                            <AutopilotIcon /> Refine Story with AI
                        </button>
                    )} */}
                </div>

                {/* RIGHT: Analyze & Prepare */}
                <div className="action-col right" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* New Config Box Aligned with Button */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <div className={`style-item checkbox-small ${isOptionsGlowActive && !extractCharacters ? 'required-glow' : ''}`} style={{background: 'transparent', padding: '2px', borderRadius: '4px'}}>
                            <input 
                                type="checkbox" 
                                id="extractCharacters" 
                                checked={extractCharacters} 
                                onChange={(e) => setExtractCharacters(e.target.checked)} 
                                style={{ width: '16px', height: '16px' }}
                            />
                            <label htmlFor="extractCharacters" style={{fontSize: '0.9rem', cursor: 'pointer'}}>Extract Characters</label>
                        </div>
                        <div className={`style-item checkbox-small ${isOptionsGlowActive && !configureVoice ? 'required-glow' : ''}`} style={{background: 'transparent', padding: '2px', borderRadius: '4px'}}>
                            <input 
                                type="checkbox" 
                                id="autoConfigVoice" 
                                checked={configureVoice} 
                                onChange={(e) => setConfigureVoice(e.target.checked)} 
                                style={{ width: '16px', height: '16px' }}
                            />
                            <label htmlFor="autoConfigVoice" style={{fontSize: '0.9rem', cursor: 'pointer'}}>Auto-Config Voiceover</label>
                        </div>
                        <div className={`style-item checkbox-small ${isOptionsGlowActive && !autoConfigCamera ? 'required-glow' : ''}`} style={{background: 'transparent', padding: '2px', borderRadius: '4px'}}>
                            <input 
                                type="checkbox" 
                                id="autoConfigCamera" 
                                checked={autoConfigCamera} 
                                onChange={(e) => setAutoConfigCamera(e.target.checked)} 
                                style={{ width: '16px', height: '16px' }}
                            />
                            <label htmlFor="autoConfigCamera" style={{fontSize: '0.9rem', cursor: 'pointer'}}>Auto-Config Visuals (Theme, Style, Camera)</label>
                        </div>
                    </div>

                    {isAnalyzingScriptContent ? (
                        <button onClick={onStop} className="stop-button full-width">
                            <StopIcon /> Stop Analysis
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleAnalyzeScript({ extractCharacters, configureVoice, configureVisuals: true })} 
                            disabled={!script.trim() || isRephrasing || isTranslating} 
                            className="primary-action-btn full-width"
                        >
                            Analyze & Prepare
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};