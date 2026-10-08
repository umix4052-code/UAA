
import React, { useState, useEffect } from 'react';
import { SceneResult } from './types';
import { CopyIcon, DownloadIcon, CheckIcon } from './icons';

interface ImagePreviewModalProps {
    result: SceneResult | null;
    onClose: () => void;
    onCopyPrompt?: (text: string) => void;
    onPromptChange?: (newPrompt: string) => void;
    viewMode?: 'images' | 'videos';
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ result, onClose, onCopyPrompt, onPromptChange, viewMode }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState('');

    useEffect(() => {
        if (result) {
            if (viewMode === 'videos') {
                setEditedPrompt(result.video_prompt || '');
            } else {
                // ⚠️ FALLBACK LOGIC: DO NOT REMOVE. This allows testing images using video prompts.
                setEditedPrompt(result.image_prompt || result.video_prompt || '');
            }
        }
    }, [result, viewMode]);

    if (!result) return null;
    
    const handleCopy = () => {
        if (onCopyPrompt) {
            onCopyPrompt(editedPrompt);
            setIsCopied(true);
        }
    };

    const handleClose = () => {
        setIsCopied(false);
        onClose();
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setEditedPrompt(val);
        if (onPromptChange) {
            onPromptChange(val);
        }
    };

    const handleDownload = () => {
        if (!result.imageUrl) return;
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `image_preview.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="image-preview-modal" onClick={handleClose}>
            <div className="image-preview-card" onClick={(e) => e.stopPropagation()}>
                <div className="image-preview-header">
                    <h3>{result.imageUrl ? 'Image Preview' : 'Prompt Details'}</h3>
                    <button className="close-preview-btn" onClick={handleClose}>&times;</button>
                </div>
                <div className="image-preview-content">
                    <div className="preview-image-col" style={{ display: result.imageUrl ? 'flex' : 'none' }}>
                        {result.imageUrl && <img src={result.imageUrl} alt="Preview" />}
                    </div>
                    <div className="preview-details-col" style={{ width: result.imageUrl ? '50%' : '100%', minHeight: '300px' }}>
                        <div className="preview-prompt-header">
                            <h4>Prompt</h4>
                            {onCopyPrompt && (
                                <button 
                                    className="icon-btn copy-btn" 
                                    onClick={handleCopy}
                                    title="Copy Prompt"
                                    style={{border: 'none', padding: '0'}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: isCopied ? '#2ECC71' : 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem'}}>
                                        {isCopied ? 'COPIED' : 'COPY'} {isCopied ? <CheckIcon /> : <CopyIcon />}
                                    </div>
                                </button>
                            )}
                        </div>
                        <textarea 
                            className="preview-prompt-box"
                            value={editedPrompt}
                            onChange={handlePromptChange}
                            style={{ 
                                width: '100%', 
                                minHeight: '150px', 
                                resize: 'vertical',
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '1rem',
                                borderRadius: 'var(--base-radius)'
                            }}
                            placeholder="Prompt goes here..."
                        />
                        <div className="preview-actions">
                            {result.imageUrl && (
                                <button onClick={handleDownload} className="btn-success">
                                    <DownloadIcon /> Download Image
                                </button>
                            )}
                            <button onClick={handleClose} className="primary-action-btn" style={{ marginLeft: 'auto' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
