import React, { useRef, useEffect } from 'react';
import { themeOptions, styleModifiers, cameraAngles as cameraAnglesList } from './constants';
import { StylePreset } from './types';

interface StyleControlPanelProps {
    // Theme & Modifiers
    themesVisible: boolean;
    setThemesVisible: (visible: boolean) => void;
    selectedThemes: string[];
    handleThemeChange: (theme: string) => void;
    modifiersVisible: boolean;
    setModifiersVisible: (visible: boolean) => void;
    selectedModifiers: string[];
    handleModifierChange: (modifier: string) => void;

    // Negative Prompt
    useNegativePrompt: boolean;
    setUseNegativePrompt: (use: boolean) => void;
    negativePrompt: string;
    setNegativePrompt: (prompt: string) => void;

    // Camera Angle
    cameraAnglesExpanded?: boolean;
    setCameraAnglesExpanded?: (visible: boolean) => void;
    cameraAngle?: string[];
    handleAngleToggle?: (angle: string) => void;
    
    // Presets
    newPresetName: string;
    setNewPresetName: (name: string) => void;
    handleSavePreset: () => void;
    stylePresets: StylePreset[];
    handleLoadPreset: (preset: StylePreset) => void;
    handleDeletePreset: (name: string) => void;
    isOptionsGlowActive?: boolean;
    onAutoDetectStyle?: () => void;
    setSelectedThemes?: (themes: string[]) => void;
    setSelectedModifiers?: (modifiers: string[]) => void;
    setCameraAngle?: (angle: string[]) => void;
}

export const StyleControlPanel: React.FC<StyleControlPanelProps> = ({
    themesVisible, setThemesVisible, selectedThemes, handleThemeChange,
    modifiersVisible, setModifiersVisible, selectedModifiers, handleModifierChange,
    useNegativePrompt, setUseNegativePrompt, negativePrompt, setNegativePrompt,
    newPresetName, setNewPresetName, handleSavePreset, stylePresets, handleLoadPreset, handleDeletePreset,
    cameraAnglesExpanded, setCameraAnglesExpanded, cameraAngle, handleAngleToggle,
    isOptionsGlowActive, onAutoDetectStyle,
    setSelectedThemes, setSelectedModifiers, setCameraAngle
}) => {
    const themesRef = useRef<HTMLDivElement>(null);
    const modifiersRef = useRef<HTMLDivElement>(null);
    const cameraAnglesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (themesRef.current && !themesRef.current.contains(event.target as Node)) {
                setThemesVisible(false);
            }
            if (modifiersRef.current && !modifiersRef.current.contains(event.target as Node)) {
                setModifiersVisible(false);
            }
            if (cameraAnglesRef.current && !cameraAnglesRef.current.contains(event.target as Node)) {
                if (setCameraAnglesExpanded) {
                    setCameraAnglesExpanded(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setThemesVisible, setModifiersVisible, setCameraAnglesExpanded]);

    return (
        <>
            <div className="card style-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Choose Theme & Styles</h2>
                    {onAutoDetectStyle && (
                        <div style={{ 
                            flex: 1,
                            margin: '0 1rem',
                            background: 'rgba(255, 193, 7, 0.1)', 
                            border: '1px solid #FFC107', 
                            color: '#FFD54F', 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            ⚠️ <strong>Note:</strong> এই অটো-ডিটেক্ট বাটনটি শুধুমাত্র কাস্টম আইডিয়ার জন্য। Project Niche সিলেক্ট করা থাকলে রিয়ালিস্টিক আউটপুট ঠিক রাখতে এটি ব্যবহার করবেন না।
                        </div>
                    )}
                    {onAutoDetectStyle && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <button 
                                    onClick={onAutoDetectStyle}
                                    className="cyan-btn"
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto', minHeight: 'unset', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                    ✨ Auto-Detect from Script
                                </button>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>(Auto-selects Theme, Modifiers & Camera Angles)</span>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    if (setSelectedThemes) setSelectedThemes([]);
                                    if (setSelectedModifiers) setSelectedModifiers([]);
                                    if (setCameraAngle) setCameraAngle([]);
                                }}
                                className="clear-styles-btn"
                                style={{ 
                                    padding: '0.25rem 0.6rem', 
                                    fontSize: '0.75rem', 
                                    backgroundColor: 'transparent', 
                                    border: '1px solid #ef4444', 
                                    color: '#ef4444', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                title="Clear all selected themes, modifiers, and angles"
                            >
                                🗑️ Clear All Styles
                            </button>
                        </div>
                    )}
                </div>
                <div className={`collapsible ${isOptionsGlowActive && selectedThemes.length === 0 ? 'required-glow' : ''}`} ref={themesRef} style={{marginBottom: '0.5rem', borderRadius: 'var(--base-radius)'}}>
                    <button type="button" className="collapsible-header" onClick={(e) => { e.preventDefault(); setThemesVisible(!themesVisible); }}>
                        Primary Themes <span style={{ color: 'var(--primary)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>({selectedThemes.length} selected)</span> {themesVisible ? '[-]' : '[+]'}
                    </button>
                    <div className="style-grid collapsible-content" style={{ display: themesVisible ? 'grid' : 'none' }}>
                        {themeOptions.map(theme => (
                            <div key={theme} className="style-item">
                                <input 
                                    type="checkbox" 
                                    id={`theme-${theme}`} 
                                    checked={selectedThemes.includes(theme)} 
                                    onChange={() => handleThemeChange(theme)} 
                                />
                                <label htmlFor={`theme-${theme}`}>{theme}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`collapsible ${isOptionsGlowActive && selectedModifiers.length === 0 ? 'required-glow' : ''}`} ref={modifiersRef} style={{marginBottom: '0.5rem', borderRadius: 'var(--base-radius)'}}>
                    <button type="button" className="collapsible-header" onClick={(e) => { e.preventDefault(); setModifiersVisible(!modifiersVisible); }}>
                        Artistic Modifiers <span style={{ color: 'var(--primary)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>({selectedModifiers.length} selected)</span> {modifiersVisible ? '[-]' : '[+]'}
                    </button>
                    <div className="style-grid collapsible-content" style={{ display: modifiersVisible ? 'grid' : 'none' }}>
                        {styleModifiers.map(modifier => (
                            <div key={modifier} className="style-item">
                                <input 
                                    type="checkbox" 
                                    id={`mod-${modifier}`} 
                                    checked={selectedModifiers.includes(modifier)} 
                                    onChange={() => handleModifierChange(modifier)} 
                                />
                                <label htmlFor={`mod-${modifier}`}>{modifier}</label>
                            </div>
                        ))}
                    </div>
                </div>
                
                {cameraAngle && handleAngleToggle && setCameraAnglesExpanded && (
                    <div className="collapsible" ref={cameraAnglesRef} style={{marginBottom: '0.5rem', borderRadius: 'var(--base-radius)'}}>
                        <button type="button" className="collapsible-header" onClick={(e) => { e.preventDefault(); setCameraAnglesExpanded(!cameraAnglesExpanded); }}>
                            Camera Angles <span style={{ color: 'var(--primary)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>({cameraAngle.length} selected)</span> {cameraAnglesExpanded ? '[-]' : '[+]'}
                        </button>
                        <div className="style-grid collapsible-content" style={{ display: cameraAnglesExpanded ? 'grid' : 'none', maxHeight: '300px', overflowY: 'auto' }}>
                            {cameraAnglesList.map(angle => (
                                <div key={angle.value} className="style-item">
                                    <input 
                                        type="checkbox" 
                                        id={`cam-${angle.value}`} 
                                        checked={cameraAngle.includes(angle.value)} 
                                        onChange={() => handleAngleToggle(angle.value)} 
                                    />
                                    <label htmlFor={`cam-${angle.value}`} title={angle.description}>{angle.value}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <h2>Advanced Styling</h2>
                <div className="negative-prompt-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="useNegativePrompt"
                        checked={useNegativePrompt}
                        onChange={(e) => setUseNegativePrompt(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px', flexShrink: 0 }}
                    />
                    <label htmlFor="useNegativePrompt" style={{ margin: 0 }}>Use Negative Prompt</label>
                </div>
                <textarea 
                    id="negativePrompt" 
                    rows={3} 
                    value={negativePrompt} 
                    onChange={(e) => setNegativePrompt(e.target.value)} 
                    placeholder="e.g., poorly drawn hands, blurry, watermark, text" 
                    disabled={!useNegativePrompt}
                />
                <p className="description">Use negative prompts to describe elements you want to strictly exclude from your generated images and videos.</p>
            </div>

            <div className="card">
                <h2>Style Presets</h2>
                <div className="input-group">
                    <input 
                        type="text" 
                        value={newPresetName} 
                        onChange={(e) => setNewPresetName(e.target.value)} 
                        placeholder="New Preset Name" 
                    />
                    <button onClick={handleSavePreset}>Save Style</button>
                </div>
                <div className="preset-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {stylePresets.map(preset => (
                        <div key={preset.name} className="preset-item" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            padding: '0.6rem 0.85rem', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '6px',
                            gap: '1rem' 
                        }}>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{preset.name}</span>
                            <div className="preset-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                <button 
                                    onClick={() => handleLoadPreset(preset)} 
                                    className="cyan-btn" 
                                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem', width: 'auto', height: 'auto', minHeight: 'unset' }}
                                >
                                    Load
                                </button>
                                <button 
                                    onClick={() => handleDeletePreset(preset.name)} 
                                    className="remove-btn"
                                    style={{ 
                                        width: '28px', 
                                        height: '28px', 
                                        borderRadius: '4px', 
                                        background: 'rgba(255,68,68,0.1)', 
                                        color: '#ff4444', 
                                        border: '1px solid rgba(255,68,68,0.2)', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        fontSize: '1rem',
                                        lineHeight: 1
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};