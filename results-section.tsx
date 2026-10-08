
import React, { useState, useRef, useEffect } from 'react';
import { SceneResult } from './types';
import { DownloadIcon, RegenerateIcon } from './icons';

interface ResultsSectionProps {
    results: SceneResult[];
    imageCount: number;
    videoModel: string;
    handlePromptChange: (index: number, newPrompt: string, type: 'image' | 'video') => void;
    copyToClipboard: (text: string, identifier: string) => void;
    copiedInfo: string | null;
    setPreviewImage: (result: SceneResult | null, mode?: 'images' | 'videos') => void;
    handleDownloadSingle: (url: string | undefined, index: number) => void;
    handleRegenerateImage: (index: number) => void;
    isBatchGenerating: boolean;
    isGeneratingStoryboard?: boolean;
    handleGenerateAllImages?: () => void;
    handleDownloadAllImagesZip?: () => void;
    handleResetImagePrompts?: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
    results, imageCount, setPreviewImage, handleDownloadSingle, handleRegenerateImage,
    isBatchGenerating, isGeneratingStoryboard, handleGenerateAllImages, handleDownloadAllImagesZip, handleResetImagePrompts
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewMode, setViewMode] = useState<'images' | 'videos'>('images');
    const sectionRef = useRef<HTMLDivElement>(null);

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

    // =====================================================================
    // 🚨 DANGER ZONE: COMPLEX FILTER LOGIC 🚨
    // This ensures ghost cards (video prompts in image view) remain visible.
    // DO NOT touch this condition unless adding a completely new view mode.
    // =====================================================================
    const filteredResults = results.filter(r => {
        if (!r) return false;
        if (viewMode === 'images') {
            const hasImagePrompt = (r.image_prompt !== undefined && r.image_prompt.trim() !== '');
            const hasActiveImageStatus = (r.imageStatus === 'pending' || r.imageStatus === 'loading' || r.imageStatus === 'retrying' || r.imageStatus === 'failed' || r.imageStatus === 'completed');
            const hasVideoPrompt = (r.video_prompt !== undefined && r.video_prompt.trim() !== '');
            
            return hasImagePrompt || hasActiveImageStatus || hasVideoPrompt;
        } else {
            const hasVideoPrompt = (r.video_prompt !== undefined && r.video_prompt.trim() !== '');
            const hasActiveVideoStatus = (r.videoPromptStatus === 'pending' || r.videoPromptStatus === 'generating' || r.videoPromptStatus === 'failed' || r.videoPromptStatus === 'completed');
            return hasVideoPrompt || hasActiveVideoStatus;
        }
    });

    const visibleResults = isExpanded ? filteredResults : filteredResults.slice(0, 4);

    const hasActualImageActivity = isBatchGenerating || results.some(r => r && (r.imageStatus === 'loading' || r.imageStatus === 'retrying' || (r.imageStatus === 'completed' && !!r.imageUrl)));
    const hasStoryboardContent = results.length > 0 && results.some(r => r && ((r.image_prompt && r.image_prompt.trim().length > 0) || (r.video_prompt && r.video_prompt.trim().length > 0) || r.videoPromptStatus === 'generating'));

    // ১. যখন আসল ছবি রেন্ডার হচ্ছে বা রেন্ডার হয়ে কার্ডে আছে (এবং ইউজার images ভিউতে আছেন), কেবল তখনই "Generated Images" জ্বলবে
    const isImageActive = hasActualImageActivity && viewMode === 'images';
    // ২. যখন স্টোরিবোর্ড প্রম্পট জেনারেট হচ্ছে অথবা কার্ডে প্রম্পট রেডি আছে (কিন্তু ইমেজ অ্যাক্টিভ নয়), কেবল তখনই "Storyboard" জ্বলবে। গ্রিড ফাঁকা থাকলে কোনোটিই জ্বলবে না!
    const isStoryboardActive = !isImageActive && (!!isGeneratingStoryboard || hasStoryboardContent);

    const totalScenesCount = results.length > 0 ? results.length : (imageCount || 0);
    const completedCount = results.filter(r => r && (r.imageStatus === 'completed' || r.videoPromptStatus === 'completed')).length;

    return (
        <div className="card results-section" ref={sectionRef}>
            <style>{`
                @keyframes headerStatusBlink {
                    0%, 100% {
                        opacity: 1;
                        text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.8);
                        color: #00e5ff;
                        border-color: rgba(0, 229, 255, 0.6);
                        background: rgba(0, 229, 255, 0.14);
                    }
                    50% {
                        opacity: 0.35;
                        text-shadow: none;
                        color: #ffffff;
                        border-color: rgba(0, 229, 255, 0.15);
                        background: rgba(0, 229, 255, 0.04);
                    }
                }
                .header-mode-active {
                    animation: headerStatusBlink 1.4s infinite ease-in-out;
                    font-weight: 800;
                    padding: 2px 10px;
                    border-radius: 6px;
                    border: 1px solid rgba(0, 229, 255, 0.5);
                    display: inline-block;
                }
                .header-mode-dim {
                    opacity: 0.38;
                    font-weight: 500;
                    transition: opacity 0.3s ease;
                }
            `}</style>
            <div className="results-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={isImageActive ? 'header-mode-active' : (isStoryboardActive ? 'header-mode-dim' : '')}>
                            Generated Images
                        </span>
                        <span style={{ opacity: 0.35 }}>/</span>
                        <span className={isStoryboardActive ? 'header-mode-active' : (isImageActive ? 'header-mode-dim' : '')}>
                            Storyboard
                        </span>
                        <span>({completedCount}/{totalScenesCount})</span>
                    </h2>
                    {results.length > 0 && (
                        <div className="toggle-group" style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <button 
                                className={`toggle-btn ${viewMode === 'images' ? 'active' : ''}`}
                                onClick={() => setViewMode('images')}
                                style={{ padding: '4px 12px', border: 'none', background: viewMode === 'images' ? 'var(--primary)' : 'transparent', color: viewMode === 'images' ? '#000' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: viewMode === 'images' ? 'bold' : 'normal', fontSize: '0.85rem' }}
                            >
                                View Images
                            </button>
                            <button 
                                className={`toggle-btn ${viewMode === 'videos' ? 'active' : ''}`}
                                onClick={() => setViewMode('videos')}
                                style={{ padding: '4px 12px', border: 'none', background: viewMode === 'videos' ? 'var(--primary)' : 'transparent', color: viewMode === 'videos' ? '#000' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: viewMode === 'videos' ? 'bold' : 'normal', fontSize: '0.85rem' }}
                            >
                                View Videos
                            </button>
                        </div>
                    )}
                </div>
                {results.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {handleGenerateAllImages && (
                            <button 
                                className="primary-action-btn" 
                                onClick={handleGenerateAllImages} 
                                disabled={isBatchGenerating || results.every(r => r && r.imageStatus === 'completed')}
                                style={{ 
                                    padding: '6px 14px', 
                                    background: 'linear-gradient(135deg, #00E5FF, #00B0FF)', 
                                    color: '#000', 
                                    fontWeight: 'bold', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    opacity: (isBatchGenerating || results.every(r => r && r.imageStatus === 'completed')) ? 0.6 : 1,
                                    pointerEvents: (isBatchGenerating || results.every(r => r && r.imageStatus === 'completed')) ? 'none' : 'auto'
                                }}
                            >
                                {isBatchGenerating ? 'Generating...' : '⚡ Generate All Images'}
                            </button>
                        )}
                        {handleResetImagePrompts && (
                            <button 
                                className="secondary-action-btn" 
                                onClick={handleResetImagePrompts} 
                                disabled={isBatchGenerating}
                                style={{ 
                                    padding: '6px 14px', 
                                    background: 'transparent', 
                                    color: '#FF5252', 
                                    fontWeight: 'bold', 
                                    border: '1px solid #FF5252', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    opacity: isBatchGenerating ? 0.6 : 1,
                                    pointerEvents: isBatchGenerating ? 'none' : 'auto'
                                }}
                            >
                                🔄 Reset Images
                            </button>
                        )}
                        {handleDownloadAllImagesZip && (
                            <button 
                                className="secondary-action-btn" 
                                onClick={handleDownloadAllImagesZip}
                                disabled={isBatchGenerating || !results.some(r => r && r.imageStatus === 'completed')}
                                style={{ 
                                    padding: '6px 14px', 
                                    background: '#374151', 
                                    color: '#fff', 
                                    border: '1px solid #4B5563', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    opacity: (isBatchGenerating || !results.some(r => r && r.imageStatus === 'completed')) ? 0.5 : 1
                                }}
                            >
                                📦 Download ZIP
                            </button>
                        )}
                    </div>
                )}
                <div style={{ fontSize: '1rem', color: '#FFD700', textAlign: 'right', fontWeight: 500 }}>
                    ℹ️ <strong>Note:</strong> Use ↻ to generate images manually.
                </div>
            </div>
            {results.length > 0 ? (
                <>
                    <div className="results-grid">
                        {filteredResults.length > 0 ? visibleResults.map((result, index) => {
                            // Find the original index to ensure correct regeneration/download indexing
                            const originalIndex = results.indexOf(result);
                            return (
                                <div key={originalIndex} className="result-card-grid" onClick={() => setPreviewImage(result, viewMode)} style={{ display: 'flex', flexDirection: 'column' }}>
                                    {viewMode === 'images' && (
                                        <>
                                            <div className="image-preview-container-grid">
                                                {result.imageStatus === 'loading' && <div className="loader"></div>}
                                                {result.imageStatus === 'completed' && result.imageUrl && <img src={result.imageUrl || undefined} alt={`Scene ${originalIndex + 1}`} />}
                                                {result.imageStatus === 'retrying' && <div className="error-placeholder" title={result.error}>Retrying...</div>}
                                                {result.imageStatus === 'failed' && <div className="error-placeholder" title={result.error}>{result.error ? 'Failed' : 'Error'}</div>}
                                                {result.imageStatus === 'pending' && <div className="pending-placeholder">Scene {originalIndex + 1}</div>}
                                                
                                                <div className="grid-overlay-actions">
                                                     <button title="Download" onClick={(e) => { e.stopPropagation(); handleDownloadSingle(result.imageUrl, originalIndex); }} disabled={!result.imageUrl}>
                                                        <DownloadIcon />
                                                     </button>
                                                     <button title="Regenerate" onClick={(e) => { e.stopPropagation(); handleRegenerateImage(originalIndex); }} disabled={isBatchGenerating}>
                                                        <RegenerateIcon />
                                                     </button>
                                                </div>
                                                <div className="scene-label">Scene {originalIndex + 1}</div>
                                            </div>
                                            <div className="prompt-text-container" style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                <strong style={{ color: 'var(--primary)' }}>Image Prompt:</strong>
                                                <p style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap', flexGrow: 1, overflowY: 'auto', maxHeight: '100px' }}>
                                                    {result.image_prompt || "No image prompt generated yet."}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    {viewMode === 'videos' && (
                                        <div className="prompt-text-container" style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', height: '100%', minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
                                            <div className="scene-label" style={{ position: 'static', background: 'transparent', padding: 0, marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>Scene {originalIndex + 1}</div>
                                            <strong style={{ color: '#FF9800' }}>Video Prompt:</strong>
                                            <p style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap', flexGrow: 1, overflowY: 'auto' }}>
                                                {result.video_prompt || "No video prompt generated yet."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="placeholder-text" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No {viewMode === 'images' ? 'image' : 'video'} prompts available in this view.
                            </div>
                        )}
                    </div>
                    {!isExpanded && filteredResults.length > 4 && (
                        <div className="see-more-container" style={{ textAlign: 'center', marginTop: '1rem', padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
                            <button className="secondary-action-btn" onClick={() => setIsExpanded(true)} style={{ padding: '0.5rem 1.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '4px', cursor: 'pointer' }}>
                                See More ({filteredResults.length - 4} More)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="placeholder-text">
                    <p>Generated images will appear here in a grid.</p>
                </div>
            )}
        </div>
    );
};