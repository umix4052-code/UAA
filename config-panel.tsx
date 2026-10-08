import React, { useState, useRef, useEffect } from 'react';
import { 
    cameraAngles, 
    nicheOptions,
    allTextVisionModels,
    openRouterFreeImageModels,
    openRouterPaidImageModels,
    paidVisionModels,
    paidTextModels
} from './constants';
import { InfoIcon } from './icons';

interface ConfigPanelProps {
    apiProvider: 'google' | 'openrouter';
    openRouterImageModel: string;
    setOpenRouterImageModel: (model: string) => void;
    openRouterTextModel: string;
    setOpenRouterTextModel: (model: string) => void;
    openRouterModelMode: 'standard' | 'free' | 'online';
    setOpenRouterModelMode: (mode: 'standard' | 'free' | 'online') => void;
    videoDuration: number | '';
    setVideoDuration: (val: number | '') => void;
    videoDurationSec: number | '';
    setVideoDurationSec: (val: number | '') => void;
    imageCount: number;
    setImageCount: (val: number) => void;
    imageModel: string;
    setImageModel: (val: string) => void;
    aspectRatio: string;
    setAspectRatio: (val: string) => void;
    disabled: boolean;
    autoBreakdown: boolean;
    setAutoBreakdown: (val: boolean) => void;
    dynamicChunkSize: number;
    setDynamicChunkSize: (val: number) => void;
    dynamicChunkSizeRef: React.MutableRefObject<number>;
    videoBatchSize: number;
    setVideoBatchSize: (val: number) => void;
    videoBatchDelay: number;
    setVideoBatchDelay: (val: number) => void;
    projectNiche: string;
    setProjectNiche: (val: string) => void;
    targetSceneDuration: number | null;
    setTargetSceneDuration: (val: number | null) => void;
    isOptionsGlowActive?: boolean;
    nicheSectionRef?: React.RefObject<HTMLDivElement>;
    highlightNiche?: boolean;
    onOpenNicheExplorer: () => void;
}

// --- NEW CUSTOM MODEL SELECTOR COMPONENT ---
const CustomModelSelector: React.FC<{
    selectedValue: string;
    onSelect: (value: string) => void;
    disabled: boolean;
}> = ({ selectedValue, onSelect, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tooltip, setTooltip] = useState<{ content: string; top: number; left: number } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // List of working models based on your input
    const workingModels = new Set([
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        'nvidia/nemotron-3-nano-30b-a3b:free',
        'nvidia/nemotron-nano-9b-v2',
        'google/gemma-3n-e4b-it',
        'google/gemma-3n-e2b-it',
        'liquid/lfm-2.5-1.2b-instruct',
        'liquid/lfm-2.5-1.2b-thinking',
        'z-ai/glm-4.5-air:free',
        'arcee-ai/trinity-large-thinking:free',
        'deepseek/deepseek-v4-flash:free',
        'qwen/qwen3-vl-235b-a22b-thinking',
        'google/gemma-4-31b-it:free',
        'nvidia/nemotron-3-super-120b-a12b:free',
        'tencent/hy3-preview:free',
        'qwen/qwen3-next-80b-a3b-instruct:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'openai/gpt-oss-20b:free',
        'nousresearch/hermes-3-llama-3.1-405b:free'
    ]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setTooltip(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Try to find the selected model in the list
    let displayLabel = selectedValue;
    const foundModel = allTextVisionModels.find(m => 'id' in m && m.id === selectedValue);
    if (foundModel && 'label' in foundModel) {
        displayLabel = foundModel.label;
    } else if (selectedValue) {
        displayLabel = `Custom: ${selectedValue}`;
    } else {
        displayLabel = "Select a Model";
    }

    const handleMouseEnter = (event: React.MouseEvent<HTMLLIElement>, details: string) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (listRef.current) {
            const listRect = listRef.current.getBoundingClientRect();
            setTooltip({
                content: details,
                top: rect.top,
                left: listRect.right + 10,
            });
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                style={{
                    width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem',
                    borderRadius: 'var(--base-radius)', border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '1rem', cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayLabel}</span>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, width: '100%', maxHeight: '400px', overflowY: 'auto',
                    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--base-radius)',
                    marginTop: '0.5rem', zIndex: 1000, boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                }}>
                    <ul ref={listRef} style={{ listStyle: 'none', margin: 0, padding: '0.5rem' }}>
                        {allTextVisionModels.map((model, index) => {
                            if ('isHeader' in model) {
                                return (
                                    <li key={`header-${index}`} style={{ padding: '0.5rem 0.75rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid var(--border)', marginTop: index > 0 ? '0.5rem' : '0' }}>
                                        {model.label}
                                    </li>
                                );
                            }

                            const paramsMatch = model.details.match(/\[প্যারামিটার: (.*?) \| কনটেক্সট: (.*?)\]/);
                            const params = paramsMatch ? `(${paramsMatch[1]} | ${paramsMatch[2]})` : '';
                            const isWorking = workingModels.has(model.id);

                            return (
                                <li
                                    key={`${model.id}-${index}`}
                                    onClick={() => { onSelect(model.id); setIsOpen(false); setTooltip(null); }}
                                    onMouseEnter={(e) => handleMouseEnter(e, model.details)}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        padding: '0.75rem', cursor: 'pointer', borderRadius: '4px',
                                        backgroundColor: selectedValue === model.id ? 'rgba(0, 229, 255, 0.1)' : 'transparent'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', color: selectedValue === model.id ? 'var(--primary)' : (isWorking ? '#2ECC71' : 'var(--text-primary)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>
                                            {model.label}
                                            {isWorking && <span style={{ color: '#27AE60', marginLeft: '8px', fontSize: '0.8em', fontWeight: 'normal' }}>(working)</span>}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1rem', flexShrink: 0 }}>{params}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                                        (App: {model.appFunction})
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            
            {tooltip && tooltip.content && (
                <div style={{
                    position: 'fixed', top: `${tooltip.top}px`, left: `${tooltip.left}px`, width: '400px',
                    padding: '1rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)',
                    borderRadius: 'var(--base-radius)', border: '1px solid var(--primary)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.5)', zIndex: 1001,
                    fontSize: '0.9rem', lineHeight: '1.5', pointerEvents: 'none',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    animation: 'fadeIn 0.2s ease-out'
                 }}>
                    {tooltip.content}
                 </div>
            )}
        </div>
    );
};


export const ConfigPanel: React.FC<ConfigPanelProps> = ({
    apiProvider, openRouterImageModel, setOpenRouterImageModel,
    openRouterTextModel, setOpenRouterTextModel,
    openRouterModelMode, setOpenRouterModelMode,
    videoDuration, setVideoDuration,
    videoDurationSec, setVideoDurationSec,
    imageCount, setImageCount,
    imageModel, setImageModel,
    aspectRatio, setAspectRatio,
    disabled,
    autoBreakdown, setAutoBreakdown,
    dynamicChunkSize, setDynamicChunkSize, dynamicChunkSizeRef,
    videoBatchSize, setVideoBatchSize,
    videoBatchDelay, setVideoBatchDelay,
    projectNiche, setProjectNiche,
    targetSceneDuration, setTargetSceneDuration,
    isOptionsGlowActive,
    nicheSectionRef, highlightNiche,
    onOpenNicheExplorer
}) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingMode, setPendingMode] = useState<'standard' | 'free' | 'online'>('free');
    const [showPaidModelWarning, setShowPaidModelWarning] = useState(false);
    const [paidModelName, setPaidModelName] = useState('');
    
    const handleModeChange = (mode: 'standard' | 'free' | 'online') => {
        if (mode === 'free') {
            setOpenRouterModelMode(mode);
        } else {
            setPendingMode(mode);
            setShowConfirmDialog(true);
        }
    };
    
    const handleTextModelSelect = (modelId: string) => {
        setOpenRouterTextModel(modelId);
        const isPaid = paidVisionModels.some(m => m.id === modelId) || paidTextModels.some(m => m.id === modelId);
        if (isPaid) {
            const model = paidVisionModels.find(m => m.id === modelId) || paidTextModels.find(m => m.id === modelId);
            setPaidModelName(model?.label || modelId);
            setShowPaidModelWarning(true);
        }
    };

    const handleImageModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const modelId = e.target.value;
        setOpenRouterImageModel(modelId);
        const isPaid = openRouterPaidImageModels.some(m => m.value === modelId);
        if (isPaid) {
            const model = openRouterPaidImageModels.find(m => m.value === modelId);
            setPaidModelName(model?.label || modelId);
            setShowPaidModelWarning(true);
        }
    };
    
    const isGoogleProvider = apiProvider === 'google';

    return (
        <div className="card config-section">
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--base-radius)',
                        border: '1px solid var(--border)', maxWidth: '400px', textAlign: 'center'
                    }}>
                        <h3 style={{marginTop: 0}}>Confirm Mode Change</h3>
                        <p>You are switching to {pendingMode === 'standard' ? 'Paid (Standard)' : 'Online (Web Search)'} mode. This may incur costs on your OpenRouter account. Are you sure?</p>
                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem'}}>
                            <button onClick={() => setShowConfirmDialog(false)} style={{padding: '0.5rem 1rem', cursor: 'pointer'}}>Cancel</button>
                            <button onClick={() => { setOpenRouterModelMode(pendingMode); setShowConfirmDialog(false); }} style={{padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--base-radius)', cursor: 'pointer'}}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showPaidModelWarning && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--base-radius)', 
                        maxWidth: '450px', border: '1px solid #E74C3C', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{marginTop: 0, color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <span style={{fontSize: '1.5rem'}}>⚠️</span> Paid Model Selected
                        </h3>
                        <p style={{color: 'var(--text-primary)', lineHeight: 1.5}}>
                            You have selected <strong>{paidModelName}</strong>.
                        </p>
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5}}>
                            This is a premium model. Using it will deduct credits/dollars directly from your OpenRouter account balance.
                        </p>
                        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                            <button onClick={() => { setShowPaidModelWarning(false); setOpenRouterModelMode('standard'); }} style={{padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#E74C3C', color: 'white', cursor: 'pointer', fontWeight: 'bold'}}>I Understand</button>
                        </div>
                    </div>
                </div>
            )}

            <h2>Configuration</h2>
            <div className="config-grid">
                <div 
                    id="project-niche-dropdown-section"
                    ref={nicheSectionRef}
                    className={`config-item ${isOptionsGlowActive && projectNiche === '' ? 'required-glow' : ''}`} 
                    style={{ 
                        gridColumn: '1 / -1', 
                        border: highlightNiche ? '2px solid #FF5252' : 'none', 
                        transition: 'all 0.3s ease', 
                        borderRadius: '8px',
                        padding: highlightNiche ? '8px' : '0' 
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label htmlFor="projectNiche" style={{fontWeight: 'bold', color: 'var(--primary)', marginBottom: 0}}>Project Niche</label>
                        <style>{`
                            .explore-niches-btn {
                                background: transparent;
                                border: 1px solid var(--primary);
                                color: var(--primary);
                                padding: 4px 14px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 0.85rem;
                                font-weight: 600;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                transition: all 0.3s ease;
                                box-shadow: 0 0 0 rgba(0,0,0,0);
                            }
                            .explore-niches-btn:hover {
                                background: rgba(59, 130, 246, 0.15);
                                transform: translateY(-2px) scale(1.02);
                                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                                border-color: #60A5FA;
                            }
                            .explore-niches-btn:active {
                                transform: translateY(0) scale(1);
                            }
                        `}</style>
                        <button 
                            type="button" 
                            onClick={() => { console.log('Explore Niches button clicked!'); onOpenNicheExplorer(); }}
                            className="explore-niches-btn"
                        >
                            💡 Explore Niches
                        </button>
                    </div>
                    <select 
                        id="projectNiche" 
                        value={projectNiche} 
                        onChange={(e) => setProjectNiche(e.target.value)}
                        disabled={disabled}
                        title="Select the niche to give the AI specific style instructions."
                    >
                        {projectNiche && !nicheOptions.some(opt => opt.value === projectNiche) && (
                            <option value={projectNiche}>{projectNiche}</option>
                        )}
                        {nicheOptions.map(option => (
                            <option 
                                key={option.value} 
                                value={option.value}
                                style={option.isNew ? { color: '#00FF00', fontWeight: 'bold' } : {}}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="config-item" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <label style={{fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem'}}>
                        Video Prompt Duration & Content Basis
                    </label>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--base-radius)', border: targetSceneDuration === null ? '2px solid #ff4444' : '1px solid var(--border)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap'}}>
                            <span style={{fontWeight: '500', color: targetSceneDuration === null ? '#ff4444' : 'var(--text-primary)'}}>Duration (Mandatory):</span>
                            {[4, 8, 10].map(duration => (
                                <label key={duration} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: targetSceneDuration === duration ? 'var(--primary)' : 'var(--text-primary)', fontWeight: targetSceneDuration === duration ? 'bold' : 'normal'}}>
                                    <input 
                                        type="radio" 
                                        name="scene-duration" 
                                        value={duration} 
                                        checked={targetSceneDuration === duration} 
                                        onChange={() => setTargetSceneDuration(duration)} 
                                        disabled={disabled}
                                        style={{width: 'auto', margin: 0, accentColor: 'var(--primary)'}}
                                    />
                                    {duration}s
                                </label>
                            ))}
                        </div>
                        
                        <div style={{height: '1px', backgroundColor: 'var(--border)', width: '100%'}}></div>
                        
                        <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem'}}>
                            <label className={`style-item ${isOptionsGlowActive && !autoBreakdown ? 'required-glow' : ''}`} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: autoBreakdown ? 'rgba(0, 229, 255, 0.1)' : 'transparent', borderRadius: '6px', border: autoBreakdown ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.2s', margin: 0}}>
                                <input 
                                    type="checkbox" 
                                    id="autoBreakdown" 
                                    checked={autoBreakdown} 
                                    onChange={(e) => setAutoBreakdown(e.target.checked)} 
                                    disabled={disabled}
                                    style={{width: '1.25rem', height: '1.25rem', margin: 0, accentColor: 'var(--primary)', cursor: 'pointer'}}
                                />
                                <span style={{fontWeight: 'bold', color: autoBreakdown ? 'var(--primary)' : 'var(--text-primary)'}}>
                                    Auto Sentence-by-Sentence Scene Generation (Recommended)
                                </span>
                            </label>

                            <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: autoBreakdown ? 0.4 : 1, pointerEvents: autoBreakdown ? 'none' : 'auto'}}>
                                <div style={{width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 0.5rem', display: 'none'}}></div> 
                                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                    <span style={{fontSize: '0.9rem'}}>Target Length:</span>
                                    <input 
                                        type="number" 
                                        id="durationMin" 
                                        min="0" 
                                        placeholder="Min"
                                        value={videoDuration} 
                                        onChange={(e) => setVideoDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))} 
                                        disabled={disabled || autoBreakdown}
                                        style={{width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'}}
                                    />
                                    <span>:</span>
                                    <input 
                                        type="number" 
                                        id="durationSec" 
                                        min="0" 
                                        max="59" 
                                        placeholder="Sec"
                                        value={videoDurationSec} 
                                        onChange={(e) => setVideoDurationSec(e.target.value === '' ? '' : parseInt(e.target.value, 10))} 
                                        disabled={disabled || autoBreakdown}
                                        style={{width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'}}
                                    />
                                </div>

                                <div style={{width: '1px', height: '24px', backgroundColor: 'var(--border)'}}></div>

                                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                   <span style={{fontSize: '0.9rem'}}>Total Prompts:</span>
                                   <input 
                                        type="number" 
                                        id="imageCount" 
                                        min="0" 
                                        value={imageCount || ''} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setImageCount(val === '' ? 0 : parseInt(val, 10));
                                        }} 
                                        disabled={disabled || autoBreakdown}
                                        style={{width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'}}
                                        readOnly={autoBreakdown}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(300px, 2.5fr)', gap: '1.5rem', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="config-item" style={{ minWidth: 0 }}>
                            <label htmlFor="aspectRatio" style={{fontWeight: '600', marginBottom: '0.5rem', display: 'block'}}>Aspect Ratio</label>
                            <select 
                                id="aspectRatio" 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value)} 
                                disabled={disabled} 
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem 0.5rem', 
                                    borderRadius: 'var(--base-radius)', 
                                    border: '1px solid var(--border)', 
                                    backgroundColor: 'var(--bg-main)', 
                                    color: 'var(--text-primary)', 
                                    fontSize: '1rem' 
                                }}
                            >
                                <option value="16:9">16:9 (Widescreen)</option>
                                <option value="9:16">9:16 (Portrait)</option>
                                <option value="1:1">1:1 (Square)</option>
                                <option value="4:3">4:3 (Classic TV)</option>
                            </select>
                        </div>

                        {isGoogleProvider && (
                            <div className="config-item">
                                <label htmlFor="imageModel" style={{fontWeight: '600', marginBottom: '0.5rem', display: 'block'}}>Image Model (Google)</label>
                                <select 
                                    id="imageModel" 
                                    value={imageModel} 
                                    onChange={(e) => setImageModel(e.target.value)}
                                    disabled={disabled}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem 0.5rem', 
                                        borderRadius: 'var(--base-radius)', 
                                        border: '1px solid var(--border)', 
                                        backgroundColor: 'var(--bg-main)', 
                                        color: 'var(--text-primary)', 
                                        fontSize: '1rem' 
                                    }}
                                >
                                    <option value="none">--- None (Skip Image Generation) ---</option>
                                    <option value="imagen-4.0-generate-001">Imagen 4 (High Quality)</option>
                                    <optgroup label="Free Models">
                                        <option value="gemini-3.1-flash-lite-image">Nano Banana 2 Lite (Fast & Free)</option>
                                        {openRouterFreeImageModels.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label htmlFor="dynamicChunkSize" style={{fontWeight: '600', fontSize: '0.95rem'}}>Max Chunk Length (Characters):</label>
                                    <input 
                                        type="number" 
                                        id="dynamicChunkSize" 
                                        min="100"
                                        max="10000"
                                        value={dynamicChunkSize || ''} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const numVal = val === '' ? 0 : parseInt(val, 10);
                                            setDynamicChunkSize(numVal);
                                            dynamicChunkSizeRef.current = numVal;
                                        }} 
                                        disabled={disabled}
                                        style={{width: '90px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'}}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label htmlFor="videoBatchSize" style={{fontWeight: '600', fontSize: '0.95rem'}}>Batch Size (Concurrent Prompts):</label>
                                    <input 
                                        type="number" 
                                        id="videoBatchSize" 
                                        min="1"
                                        max="50"
                                        value={videoBatchSize || ''} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setVideoBatchSize(val === '' ? 0 : parseInt(val, 10));
                                        }} 
                                        disabled={disabled}
                                        style={{width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'}}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label htmlFor="videoBatchDelay" style={{fontWeight: '600', fontSize: '0.95rem'}}>Batch Delay (Seconds):</label>
                                    <input 
                                        type="number" 
                                        id="videoBatchDelay" 
                                        min="0"
                                        max="60"
                                        value={videoBatchDelay === 0 ? 0 : (videoBatchDelay || '')} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setVideoBatchDelay(val === '' ? 0 : parseInt(val, 10));
                                        }} 
                                        disabled={disabled}
                                        style={{width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'}}
                                    />
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', border: '1px solid #00e5ff', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', marginTop: '12px', display: 'block' }}>
                                ⚠️ <strong>CRITICAL SETTING:</strong> এই ফাংশনগুলোতে অপ্রয়োজনে হাত দেবেন না! জেমিনির জন্য ডিফল্ট (Batch: 5, Delay: 12s) সেট করা আছে যা সবচেয়ে ভালো পারফর্ম করে। কাজের স্পিড বাড়াতে চাইলে আপনি ব্যাচ সাইজ বাড়াতে পারেন, তবে অতিরিক্ত ব্যাচ বা শূন্য ডিলে (0s) দিলে API রেট লিমিট শেষ হয়ে যেতে পারে এবং 502/504 বা 429 Error খেয়ে প্রসেস ফেইল করতে পারে। প্রোভাইডার পরিবর্তন করলে এর ডিফল্ট মান অটোমেটিক অ্যাডজাস্ট হয়ে যাবে।
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {!isGoogleProvider && (
                <div className="openrouter-model-settings" style={{ marginTop: '2rem' }}>
                    {apiProvider === 'openrouter' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.25rem' }}>OpenRouter Model Settings</h3>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)', marginLeft: '1rem' }}></div>
                            </div>
                            
                            <div style={{
                                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                border: '1px solid rgba(234, 179, 8, 0.4)',
                                color: '#eab308',
                                padding: '0.8rem 1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>⚠️</span>
                                <div>
                                    <strong>নোট:</strong> সবুজ রঙের মডেলগুলো বর্তমানে ফ্রি। ওপেন রাউটারে যেকোনো সময় ফ্রি মডেল পরিবর্তন হয়ে পেইড হয়ে যেতে পারে, তখন তা কাজ নাও করতে পারে। নতুন বা অন্য কোনো ফ্রি মডেল ব্যবহার করতে চাইলে ওপেন রাউটার (<a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" style={{color: '#eab308', textDecoration: 'underline'}}>openrouter.ai</a>) থেকে মডেল আইডি/কোড কপি করে নিচের Custom Model ইনপুট বক্সে পেস্ট করুন।
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start'}}>
                        {apiProvider === 'openrouter' && (
                            <div className="config-item" style={{ flex: '1 1 300px' }}>
                                <label htmlFor="openRouterTextModel" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Text & Vision Model</label>
                                <CustomModelSelector 
                                    selectedValue={openRouterTextModel}
                                    onSelect={handleTextModelSelect}
                                    disabled={disabled}
                                />
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Custom Model (Overrides selection)</label>
                                    <input 
                                        type="text" 
                                        value={openRouterTextModel} 
                                        onChange={(e) => handleTextModelSelect(e.target.value)}
                                        placeholder="e.g. max-intelligence/deepseek..."
                                        disabled={disabled}
                                        style={{
                                            width: '100%', padding: '0.5rem', borderRadius: 'var(--base-radius)', 
                                            border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', 
                                            color: 'var(--text-primary)', fontSize: '0.85rem'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="config-item" style={{ flex: '1 1 300px' }}>
                            <label htmlFor="openRouterImageModel" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Image Generation Model</label>
                            <select 
                                id="openRouterImageModel" 
                                value={openRouterImageModel} 
                                onChange={handleImageModelSelect}
                                disabled={disabled}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: 'var(--base-radius)', 
                                    border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', 
                                    color: 'var(--text-primary)', fontSize: '1rem', height: '42px'
                                }}
                            >
                                <option value="none">--- None (Skip Image Generation) ---</option>
                                <optgroup label="--- Free Models ---">
                                    {openRouterFreeImageModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </optgroup>
                                <optgroup label="--- Paid Models ---">
                                    {openRouterPaidImageModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </optgroup>
                            </select>
                            
                            <div style={{ marginTop: '1rem' }}>
                                 <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Model Routing Mode</label>
                                 <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                                    <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.4rem 0.6rem', backgroundColor: openRouterModelMode === 'standard' ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '4px', border: openRouterModelMode === 'standard' ? '1px solid var(--primary)' : '1px solid var(--border)'}}>
                                        <input type="radio" name="or-mode" value="standard" checked={openRouterModelMode === 'standard'} onChange={() => handleModeChange('standard')} style={{width: 'auto', margin: 0}}/>
                                        Standard
                                    </label>
                                    <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.4rem 0.6rem', backgroundColor: openRouterModelMode === 'free' ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '4px', border: openRouterModelMode === 'free' ? '1px solid var(--primary)' : '1px solid var(--border)'}}>
                                        <input type="radio" name="or-mode" value="free" checked={openRouterModelMode === 'free'} onChange={() => handleModeChange('free')} style={{width: 'auto', margin: 0}}/>
                                        Free
                                    </label>
                                    <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.4rem 0.6rem', backgroundColor: openRouterModelMode === 'online' ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '4px', border: openRouterModelMode === 'online' ? '1px solid var(--primary)' : '1px solid var(--border)'}}>
                                        <input type="radio" name="or-mode" value="online" checked={openRouterModelMode === 'online'} onChange={() => handleModeChange('online')} style={{width: 'auto', margin: 0}}/>
                                        Online Search
                                    </label>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};