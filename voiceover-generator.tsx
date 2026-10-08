// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC

import React, { useState, useEffect, useRef } from 'react';
import { AudioIcon, AutopilotIcon, PlayIcon, StopIcon, DownloadIcon, RegenerateIcon, InfoIcon, MagicWandIcon, TrashIcon } from './icons';
import { AudioPlayer } from './components';
import { formatTime } from './utils';
import { TTSConfig, AudioChunk, TTSVoice, ScriptProcessingOptions } from './types';
import { ttsVoices, ttsTones } from './constants';

// Inline Filter Icon for the square button
const FilterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

interface VoiceoverGeneratorProps {
    isAutoConfiguringVoice: boolean;
    voiceoverScript: string;
    setVoiceoverScript: (script: string) => void;
    script: string;
    handleAudioAutopilot: () => Promise<void>;
    isTTSBusy: boolean;
    wordCount: number;
    recommendedWords: number;
    estimatedSeconds: number;
    targetSeconds: number;
    handleFitScriptToDuration: () => void;
    isFittingScript: boolean;
    selectedTone: string;
    setSelectedTone: (tone: string) => void;
    ttsConfig: TTSConfig;
    setTtsConfig: React.Dispatch<React.SetStateAction<TTSConfig>>;
    isAuditioning: string | null;
    handleAuditionVoice: (voice: TTSVoice) => void;
    customTtsPrompt: string;
    setCustomTtsPrompt: (prompt: string) => void;
    forceSpeed: boolean;
    setForceSpeed: (force: boolean) => void;
    isGeneratingAudio: boolean;
    isGeneratingChunks: boolean;
    handleStopAudioGeneration: () => void;
    handleStopChunkGeneration: () => void;
    handleGenerateSample: () => void;
    isGeneratingSample: boolean;
    sampleAudioUrl: string | null;
    projectName: string;
    handleGenerateVoiceover: () => void;
    generatedAudioUrl: string | null;
    handleDownloadAudio: (bytes?: Uint8Array, filename?: string) => void;
    generatedAudioBytes: Uint8Array | null;
    handleGenerateChunkedAudio: () => void;
    handleResumeChunkedAudio: () => void;
    audioChunks: AudioChunk[];
    handleRetrySingleAudioChunk: (id: number) => void;
    handleMergeAndDownload: () => void;
    isMergingAudio: boolean;
    handleDownloadAllChunksZip: () => void;
    onProcessScript: (options: any) => void;
    isProcessingScript: boolean;
    onExportCleanScript: () => void;
    isScriptProcessed?: boolean; // New prop for state control
    processingOptions?: ScriptProcessingOptions;
    setProcessingOptions?: React.Dispatch<React.SetStateAction<ScriptProcessingOptions>>;
    useSelectedVoice?: boolean;
    setUseSelectedVoice?: (val: boolean) => void;
    autoConfigureVoiceover?: (script: string, genderPreference: 'any' | 'male' | 'female', overrideKeepExisting: boolean) => Promise<void>;
    handleClearVoiceCache?: () => Promise<void>;
}

const VOICE_PRESETS = [
    {
        category: "Cinematic & Documentary",
        items: [
            { label: "Epic Documentary Narrator", prompt: "Deep, resonant, serious, grand-scale history or space documentary style", emotion: "Documentary", voices: ["Archenor", "Gacrux", "Odin", "Chronicler", "Algieba", "Algenib"], desc: "Creates a powerful, serious tone like in major history or space documentaries." },
            { label: "Mysterious Crime Story", prompt: "Serious, investigative, grave tone, slow and mysterious, suspenseful", emotion: "Crime Story", voices: ["Enceladus", "Noir (Detective)", "Investigator", "Lovecraft"], desc: "Ideal for suspense, mystery, and true-crime narration with a dark atmosphere." },
            { label: "Historical Chronicler", prompt: "Wise, aged, scholarly, slow, resonant, storytelling", emotion: "History", voices: ["Chronicler", "Herodotus", "Clio", "Archivist", "Algieba", "Eldred"], desc: "Perfect for historical accounts, biographies, and recounting ancient events." },
            { label: "Nature Documentary", prompt: "Calm, observational, soothing, highly detailed, gentle awe", emotion: "Nature/Geography", voices: ["Explorer", "Atlas", "Pulcherrima", "Umbriel"], desc: "Soft, observant tone for wildlife, geography, and nature scenes." },
            { label: "Political Commentary", prompt: "Formal, authoritative, serious, clear articulation, persuasive", emotion: "Political Commentary", voices: ["Churchill", "Cleopatra", "Oracle", "Oran"], desc: "Strong, authoritative voice for news, politics, and serious commentary." },
            { label: "Sci-Fi / Space", prompt: "Cold, analytical, futuristic, cosmic, awe-inspiring", emotion: "Sci-Fi Narration", voices: ["Gacrux", "Archenor", "Zorp", "Atlas"], desc: "For futuristic, space exploration, and scientific content." }
        ]
    },
    {
        category: "Storytelling & Audiobooks",
        items: [
            { label: "Ancient Storyteller", prompt: "A very old, wise voice, telling a story by a campfire.", emotion: "Ancient Wisdom", voices: ["Eldred", "Hesta", "Sage", "Somnus", "Algieba", "Algenib"], desc: "A very old, wise voice perfect for myths, legends, and folklore." },
            { label: "Bedtime Story / Sleep", prompt: "Soft, soothing, slow, warm, whispering, comforting for sleep", emotion: "Sleeping Story", voices: ["Pulcherrima", "Morpheus", "Aura", "Lyra"], desc: "Extremely calm and slow, designed to help listeners fall asleep or relax." },
            { label: "Fantasy Epic Narrator", prompt: "Dramatic, bold, heroic, grand, mythological tone", emotion: "Fantasy Epic", voices: ["Valkyrie", "Odin", "Siren", "Goliath"], desc: "Grand and heroic, suitable for high fantasy battles and epic tales." },
            { label: "Horror Narrator", prompt: "Eerie, deep, suspenseful, slow-paced, menacing tone", emotion: "Horror Story", voices: ["Lovecraft", "Enceladus", "Goliath", "Agatha"], desc: "Creepy and unsettling, best for ghost stories and creepypastas." },
            { label: "Islamic / Religious History", prompt: "Deep, respectful, slow, resonant, grave, serious narration", emotion: "Islamic History", voices: ["Chronicler", "Gacrux", "Archenor", "Algieba", "Algenib"], desc: "Respectful and grave tone for religious or solemn historical content." }
        ]
    },
    {
        category: "Professional & Education",
        items: [
            { label: "Corporate Promo", prompt: "Confident, upbeat, clear, trustworthy, persuasive, professional", emotion: "Corporate Narration", voices: ["Kore", "Valor", "Achernar", "Oracle"], desc: "Clean and professional, ideal for business presentations and commercials." },
            { label: "Tech Reviewer", prompt: "Casual, friendly, conversational, normal pace, engaging, geeky", emotion: "Tech Review", voices: ["Scribe", "Oran", "Oracle", "Vindemiatrix"], desc: "Conversational and modern, perfect for gadget reviews and tutorials." },
            { label: "Health & Wellness", prompt: "Calm, professional, clear, reassuring, instructional", emotion: "Health & Fitness", voices: ["Physician", "Coach", "Erinome", "Orus"], desc: "Trustworthy and clear, for medical explainers and fitness guides." },
            { label: "Educational / Professor", prompt: "Intellectual, articulate, slow, explanatory, clear", emotion: "Educational", voices: ["Thaddeus", "Da Vinci", "Newton", "Erinome"], desc: "Knowledgeable tone for lectures, e-learning, and explainers." }
        ]
    },
    {
        category: "Fun & Energetic",
        items: [
            { label: "High Energy Ad / Trailer", prompt: "Fast, excited, punchy, loud, enthusiastic, persuasive", emotion: "Dynamic", voices: ["Leda", "Maverick", "Cygnus", "Coach"], desc: "Fast-paced and hype-filled, for action trailers and energetic ads." },
            { label: "Cartoon / Comedy", prompt: "Exaggerated, funny, quirky, distinct character voice", emotion: "Comedy Skit", voices: ["Zorp", "Mad Scientist", "Umbriel", "Leda"], desc: "Quirky and expressive, for animation, memes, and comedy skits." }
        ]
    }
];

export const VoiceoverGenerator: React.FC<VoiceoverGeneratorProps> = ({
    isAutoConfiguringVoice, voiceoverScript, setVoiceoverScript, script, handleAudioAutopilot, isTTSBusy,
    wordCount, recommendedWords, estimatedSeconds, targetSeconds, handleFitScriptToDuration, isFittingScript,
    selectedTone, setSelectedTone, ttsConfig, setTtsConfig, isAuditioning, handleAuditionVoice,
    customTtsPrompt, setCustomTtsPrompt, forceSpeed, setForceSpeed, isGeneratingAudio, isGeneratingChunks,
    handleStopAudioGeneration, handleStopChunkGeneration, handleGenerateSample, isGeneratingSample, sampleAudioUrl,
    projectName, handleGenerateVoiceover, generatedAudioUrl, handleDownloadAudio, generatedAudioBytes,
    handleGenerateChunkedAudio, handleResumeChunkedAudio, audioChunks, handleRetrySingleAudioChunk, handleMergeAndDownload, isMergingAudio,
    handleDownloadAllChunksZip, onProcessScript, isProcessingScript, onExportCleanScript, isScriptProcessed = false,
    processingOptions, setProcessingOptions, chunkMode, setChunkMode, useSelectedVoice, setUseSelectedVoice, autoConfigureVoiceover,
    handleClearVoiceCache
}) => {
    
    const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
    const [isToneFilterOpen, setIsToneFilterOpen] = useState(false);
    const [isVoiceLibFilterOpen, setIsVoiceLibFilterOpen] = useState(false); 
    const [presetNotification, setPresetNotification] = useState<{visible: boolean, message: string, voices: string}>({ visible: false, message: '', voices: '' });
    
    const presetMenuRef = useRef<HTMLDivElement>(null);
    const toneFilterRef = useRef<HTMLDivElement>(null);
    const voiceLibFilterRef = useRef<HTMLDivElement>(null); 

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (presetMenuRef.current && !presetMenuRef.current.contains(event.target as Node)) {
                setIsPresetMenuOpen(false);
            }
            if (toneFilterRef.current && !toneFilterRef.current.contains(event.target as Node)) {
                setIsToneFilterOpen(false);
            }
            if (voiceLibFilterRef.current && !voiceLibFilterRef.current.contains(event.target as Node)) {
                setIsVoiceLibFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleProcessingOption = (key: keyof ScriptProcessingOptions) => {
        if (setProcessingOptions && processingOptions) {
            setProcessingOptions(prev => {
                const newState = { ...prev, [key]: !prev[key] };
                // Conflict resolution: If documentary style enabled, disable auto pauses to avoid double handling
                if (key === 'documentaryStyle' && newState.documentaryStyle) {
                    newState.autoPauses = false;
                }
                return newState;
            });
        }
    };

    const handlePresetSelect = (preset: any) => {
        setCustomTtsPrompt(preset.prompt);
        setSelectedTone(preset.emotion);
        
        if (preset.voices && preset.voices.length > 0 && !useSelectedVoice) {
            let foundVoice = null;
            for (const suggestedVoice of preset.voices) {
                let v = ttsVoices.find(tv => tv.conceptualName.includes(suggestedVoice));
                if (!v) {
                    v = ttsVoices.find(tv => tv.apiName === suggestedVoice);
                }
                if (v) {
                    foundVoice = v;
                    break; 
                }
            }

            if (foundVoice) {
                setTtsConfig(prev => ({ ...prev, voice: foundVoice!.conceptualName }));
            }
        }
        
        setPresetNotification({
            visible: true,
            message: `Preset Applied: ${preset.label}`,
            voices: `Try with: ${preset.voices.join(', ')}`
        });
        setTimeout(() => setPresetNotification(prev => ({ ...prev, visible: false })), 5000);
        
        setIsPresetMenuOpen(false);
    };

    const filteredVoices = ttsVoices.filter(v => 
        v.language === 'English' && (
            selectedTone === 'All Tones' || 
            v.tones.includes(selectedTone) ||
            (selectedTone === 'Female' && v.gender === 'Female') || 
            (selectedTone === 'Male' && v.gender === 'Male')
        )
    );

    return (
        <div className={`card tts-card ${isAutoConfiguringVoice ? 'configuring' : ''}`}>
            {isAutoConfiguringVoice && (
                <div className="configuring-overlay">
                    <div className="loader"></div>
                    <p>AI is auto-configuring voiceover settings...</p>
                </div>
            )}

            {presetNotification.visible && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '-230px', 
                    width: '220px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--primary)',
                    borderRadius: 'var(--base-radius)',
                    padding: '1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <div style={{fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem'}}>{presetNotification.message}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4'}}>{presetNotification.voices}</div>
                </div>
            )}

            <div className="card-header tts-main-header">
                <h2><AudioIcon /> AI Voiceover Generation</h2>
                <button onClick={() => handleAudioAutopilot().catch(e => {
                        if (e.message !== 'stopped') {
                        console.error("Audio Autopilot failed:", e);
                    }
                })} className="autopilot-audio-btn" disabled={isTTSBusy || !voiceoverScript.trim()} title="Automatically configures voice, generates all chunks, and merges them.">
                    <AutopilotIcon/> Audio Autopilot
                </button>
            </div>

            <div className="script-processor-container">
                <div className="processor-box export-box">
                    <div className="processor-header">
                        <DownloadIcon />
                        <h4>Export Clean Script</h4>
                    </div>
                    <p>Download a clean .txt version compatible with other TTS tools.</p>
                    <button 
                        className="processor-btn export-btn" 
                        onClick={onExportCleanScript}
                        disabled={!isScriptProcessed}
                        title={!isScriptProcessed ? "Process the script first to enable export" : "Download the processed script as a text file."}
                    >
                        Export Clean File
                    </button>
                </div>
                <div className="processor-box ai-box">
                    <div className="processor-header">
                        <AutopilotIcon />
                        <h4>AI Script Processor</h4>
                    </div>
                    <p>Apply selected processing options (clean text, add pauses, emotional cues).</p>
                    <button 
                        className="processor-btn ai-btn" 
                        onClick={() => onProcessScript(processingOptions || {})}
                        disabled={isProcessingScript || !voiceoverScript.trim()}
                        title="Click to clean and format script based on checkbox settings."
                    >
                        {isProcessingScript ? 'Processing...' : 'Process Script'}
                    </button>
                </div>
            </div>

            <div className="voice-controls-panel-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                <div className="voice-customization-panel" style={{ backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--base-radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#FFA726', fontSize: '1.1rem' }}>Voice Customization</h3>
                    
                    <div className="config-item" style={{ marginBottom: '1rem', position: 'relative' }} ref={toneFilterRef}>
                        <label htmlFor="ttsTone" title="Select the emotional tone for the voice.">Emotion / Tone</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <select id="ttsTone" value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} style={{ flexGrow: 1 }} title="Choose from 70+ emotional tones.">
                                {ttsTones.map(tone => <option key={tone} value={tone}>{tone}</option>)}
                            </select>
                            <button 
                                className="tone-filter-btn" 
                                onClick={() => setIsToneFilterOpen(!isToneFilterOpen)}
                                style={{ width: '42px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}
                                title="Filter Tones"
                            >
                                <FilterIcon />
                            </button>
                        </div>

                        {isToneFilterOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                width: '300px',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--base-radius)',
                                padding: '1rem',
                                zIndex: 100,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                marginTop: '0.5rem'
                            }}>
                                <h4 style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Tone Categories</h4>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                                    {['Heavy', 'Old', 'Islamic History', 'War', 'Crime Story', 'Horror Story', 'Deep', 'Calm', 'Dynamic', 'Formal', 'Kids Bedtime Story', 'Scientific Narration'].map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => { setSelectedTone(cat); setIsToneFilterOpen(false); }}
                                            style={{
                                                fontSize: '0.8rem', 
                                                padding: '0.5rem', 
                                                backgroundColor: selectedTone === cat ? 'var(--primary)' : 'var(--bg-main)',
                                                color: selectedTone === cat ? '#000' : 'var(--text-primary)',
                                                border: '1px solid var(--border)',
                                                cursor: 'pointer',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="config-item" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label htmlFor="narrationSpeed">Narration Speed</label>
                        </div>
                        <select 
                            id="narrationSpeed"
                            value={ttsConfig.speed}
                            onChange={(e) => setTtsConfig(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                            style={{ 
                                width: '100%', 
                                padding: '0.8rem 1rem', 
                                borderRadius: '8px', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: 'var(--text-color)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={0.85} style={{ background: '#1a1a1a' }}>Slow</option>
                            <option value={1.0} style={{ background: '#1a1a1a' }}>Normal (Default)</option>
                            <option value={1.15} style={{ background: '#1a1a1a' }}>Fast</option>
                        </select>
                    </div>

                    <div className="config-item" style={{ marginTop: '1rem', position: 'relative' }} ref={presetMenuRef}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="customVoicePrompt">Custom Voice Prompt</label>
                            <div className="tooltip-icon" title="Overrides settings. Use Magic Wand for presets!">
                                <InfoIcon /> 
                            </div>
                        </div>
                        <div className="input-with-button" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <input 
                                type="text" 
                                id="customVoicePrompt"
                                value={customTtsPrompt} 
                                onChange={(e) => setCustomTtsPrompt(e.target.value)} 
                                placeholder="e.g., speak as an old, wise narrator" 
                                style={{ flexGrow: 1 }}
                            />
                            <button 
                                className="magic-wand-btn" 
                                onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
                                title="Open Preset Menu"
                            >
                                <MagicWandIcon />
                            </button>
                        </div>

                        {isPresetMenuOpen && (
                            <div className="preset-dropdown" style={{width: '350px'}}>
                                {VOICE_PRESETS.map((category, idx) => (
                                    <div key={idx} className="preset-category">
                                        <div className="preset-category-title">{category.category}</div>
                                        {category.items.map((item, i) => (
                                            <div 
                                                key={i} 
                                                className="preset-option" 
                                                onClick={() => handlePresetSelect(item)}
                                            >
                                                <div className="preset-label">{item.label}</div>
                                                <div className="preset-sub" style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px'}}>{item.desc}</div>
                                                <div className="preset-voices" style={{fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '600'}}>
                                                    Try with: {item.voices.join(', ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {useSelectedVoice !== undefined && setUseSelectedVoice && (
                        <div className="config-item" style={{ marginBottom: '1rem' }}>
                            <div className="style-item" style={{ padding: 0, background: 'transparent' }}>
                                <input 
                                    type="checkbox" 
                                    id="useSelectedVoiceCheckbox" 
                                    checked={useSelectedVoice} 
                                    onChange={(e) => setUseSelectedVoice(e.target.checked)} 
                                    disabled={!isAutoConfiguringVoice && false} 
                                />
                                <label htmlFor="useSelectedVoiceCheckbox" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                    Use Selected Voice
                                </label>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => autoConfigureVoiceover && autoConfigureVoiceover(script, 'any', false)} 
                        disabled={isAutoConfiguringVoice || !script.trim()}
                        style={{ width: '100%', backgroundColor: '#FFA726', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <AutopilotIcon /> Auto-Config Voice
                    </button>
                </div>

                <div className="script-processing-panel" style={{ backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--base-radius)', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#FFA726', fontSize: '1.1rem' }}>AI Script Processing</h3>
                    
                    <div style={{ backgroundColor: 'rgba(255, 167, 38, 0.15)', border: '1px solid #FFA726', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                        <p style={{ margin: 0, color: '#FFA726', fontSize: '0.9rem', fontWeight: '500', lineHeight: '1.4' }}>
                            ⚠️ গুরুত্বপূর্ণ নির্দেশ: নিচের অপশনগুলো সিলেক্ট করার পর, স্ক্রিপ্টে পরিবর্তনগুলো অ্যাপ্লাই করতে অবশ্যই ঠিক ওপরে থাকা 'Process Script' বাটনে ক্লিক করুন।
                        </p>
                    </div>

                    {processingOptions && (
                        <div className="processing-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="settings-group">
                                <label style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Audio Chunking Mode</label>
                                <select 
                                    className="select-input"
                                    value={chunkMode}
                                    onChange={(e) => setChunkMode && setChunkMode(e.target.value as any)}
                                    style={{ width: '100%', marginBottom: '0.25rem' }}
                                >
                                    <option value="quality">High Quality (30s Chunks)</option>
                                    <option value="balanced">Balanced (1 Min Chunks)</option>
                                    <option value="speed">Max Speed (3 Min Chunks)</option>
                                </select>
                                <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {chunkMode === 'quality' && 'Splits text into short segments to ensure the highest voice consistency.'}
                                    {chunkMode === 'balanced' && 'Recommended balanced mode for stable generation.'}
                                    {chunkMode === 'speed' && 'Uses fewer requests, but voice may drift over long segments.'}
                                </p>
                            </div>
                            
                            {/* New Mystic Deep Voice Option */}
                            <div style={{backgroundColor: 'rgba(255, 167, 38, 0.1)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 167, 38, 0.3)'}}>
                                <div className="style-item" style={{ padding: 0, background: 'transparent', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        id="opt-doc-style" 
                                        checked={processingOptions.documentaryStyle} 
                                        onChange={() => toggleProcessingOption('documentaryStyle')} 
                                    />
                                    <label htmlFor="opt-doc-style" style={{ fontWeight: 'bold', cursor: 'pointer', color: '#FFA726' }}>Apply Mystic Deep Voice Format</label>
                                </div>
                                <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Adds specialized pauses (...) and drags (-) for viral deep voice narration.</p>
                            </div>

                            <div>
                                <div className="style-item" style={{ padding: 0, background: 'transparent', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        id="opt-clean" 
                                        checked={processingOptions.autoClean} 
                                        onChange={() => toggleProcessingOption('autoClean')} 
                                    />
                                    <label htmlFor="opt-clean" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Auto-Clean Script</label>
                                </div>
                                <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Removes conversational fillers (e.g. &quot;Here is&quot;), directions, and markers.</p>
                            </div>
                            <div>
                                <div className="style-item" style={{ padding: 0, background: 'transparent', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        id="opt-dialogue" 
                                        checked={processingOptions.fastSpeak} 
                                        onChange={() => toggleProcessingOption('fastSpeak')} 
                                    />
                                    <label htmlFor="opt-dialogue" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Fast Speak</label>
                                </div>
                                <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Removes extra commas and pauses for faster delivery without removing content.</p>
                            </div>
                            <div>
                                <div className="style-item" style={{ padding: 0, background: 'transparent', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        id="opt-pauses" 
                                        checked={processingOptions.autoPauses} 
                                        onChange={() => toggleProcessingOption('autoPauses')} 
                                        disabled={processingOptions.documentaryStyle}
                                    />
                                    <label htmlFor="opt-pauses" style={{ fontWeight: 'bold', cursor: 'pointer', opacity: processingOptions.documentaryStyle ? 0.5 : 1 }}>Auto-add Pauses</label>
                                </div>
                                <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Adds pauses after punctuation.</p>
                            </div>
                            <div>
                                <div className="style-item" style={{ padding: 0, background: 'transparent', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        id="opt-emotions" 
                                        checked={processingOptions.emotionalCues} 
                                        onChange={() => toggleProcessingOption('emotionalCues')} 
                                    />
                                    <label htmlFor="opt-emotions" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Auto-add Emotional Cues</label>
                                </div>
                                <p style={{ margin: '0 0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Injects cues like [laughs].</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="voiceover-script-header">
                <h3>Voiceover Script</h3>
                <button onClick={() => setVoiceoverScript(script)} title="Copy the main script into this box.">Copy from Main Script</button>
            </div>
            <textarea rows={8} value={voiceoverScript} onChange={(e) => setVoiceoverScript(e.target.value)} placeholder="Enter the text to be converted to speech here..." />

            <div className="audio-estimator-info">
                <div><span>Word Count:</span> <strong>{wordCount} {recommendedWords > 0 ? `/ ~${recommendedWords}` : ''}</strong></div>
                <div><span>Est. Duration:</span> <strong>{formatTime(estimatedSeconds)}</strong></div>
                <div><span>Target Duration:</span> <strong>{formatTime(targetSeconds)}</strong></div>
            </div>
            <button onClick={handleFitScriptToDuration} disabled={isFittingScript || targetSeconds === 0 || !voiceoverScript.trim()} title="Rewrites the script to match the video duration.">
                {isFittingScript ? 'Optimizing...' : 'Fit Script to Duration'}
            </button>
            
            <div className="voice-library">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h4 className="voice-list-heading" style={{margin: 0}}>Select a Voice ({filteredVoices.length})</h4>
                    
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        {/* Clear Cache Button */}
                        {handleClearVoiceCache && (
                            <button 
                                className="tone-filter-btn"
                                onClick={handleClearVoiceCache}
                                style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid #dc3545', // Red border for alert
                                    color: '#dc3545',
                                    cursor: 'pointer',
                                    borderRadius: 'var(--base-radius)'
                                }}
                                title="Clear cached audio samples to regenerate new ones"
                            >
                                <TrashIcon /> Clear Audio Cache
                            </button>
                        )}

                        {/* Tone Filter Dropdown */}
                        <div style={{position: 'relative'}} ref={voiceLibFilterRef}>
                            <button 
                                className="tone-filter-btn"
                                onClick={() => setIsVoiceLibFilterOpen(!isVoiceLibFilterOpen)}
                                style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    color: selectedTone !== 'All Tones' ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    borderRadius: 'var(--base-radius)'
                                }}
                            >
                                <FilterIcon /> 
                                {selectedTone !== 'All Tones' ? selectedTone : 'Filter Tone'}
                            </button>

                            {isVoiceLibFilterOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '250px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: 'var(--base-radius)',
                                    padding: '0.5rem',
                                    zIndex: 100,
                                    marginTop: '0.5rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}>
                                    <div 
                                        onClick={() => { setSelectedTone('All Tones'); setIsVoiceLibFilterOpen(false); }}
                                        style={{
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            backgroundColor: selectedTone === 'All Tones' ? 'var(--primary)' : 'transparent',
                                            color: selectedTone === 'All Tones' ? '#000' : 'var(--text-primary)',
                                            borderRadius: '4px',
                                            marginBottom: '0.25rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        All Tones
                                    </div>
                                    {ttsTones.filter(t => t !== 'All Tones').map(tone => (
                                        <div 
                                            key={tone}
                                            onClick={() => { setSelectedTone(tone); setIsVoiceLibFilterOpen(false); }}
                                            style={{
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                backgroundColor: selectedTone === tone ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                                                color: selectedTone === tone ? 'var(--primary)' : 'var(--text-secondary)',
                                                borderRadius: '4px',
                                                marginBottom: '2px',
                                                fontSize: '0.9rem'
                                            }}
                                            className="tone-option-item"
                                        >
                                            {tone}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRID LAYOUT (Replacing List) */}
                <div className="voice-selector-list" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    padding: '0.5rem'
                }}>
                    {filteredVoices.map(voice => (
                        <div 
                            key={voice.conceptualName}
                            title={voice.use_case}
                            className={`voice-card-grid ${ttsConfig.voice === voice.conceptualName ? 'selected' : ''} ${isAuditioning === voice.conceptualName ? 'auditioning' : ''}`} 
                            onClick={() => setTtsConfig(prev => ({ ...prev, voice: voice.conceptualName }))}
                            style={{
                                backgroundColor: '#141414', // Dark Card
                                border: ttsConfig.voice === voice.conceptualName ? '2px solid #00E5FF' : '1px solid #333',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div className="voice-card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div>
                                    <div className="voice-name-title" style={{
                                        fontWeight: 'bold', 
                                        fontSize: '1.1rem', 
                                        color: '#fff', 
                                        marginBottom: '0.25rem'
                                    }}>
                                        {voice.conceptualName}
                                    </div>
                                    <div className="voice-card-badges" style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                        <span style={{
                                            backgroundColor: voice.gender === 'Male' ? '#1E90FF' : '#FF69B4', 
                                            color: '#fff', 
                                            fontSize: '0.7rem', 
                                            padding: '0.1rem 0.4rem', 
                                            borderRadius: '4px', 
                                            fontWeight: 'bold'
                                        }}>{voice.gender}</span>
                                        <span style={{
                                            backgroundColor: '#333', 
                                            color: '#ccc', 
                                            fontSize: '0.7rem', 
                                            padding: '0.1rem 0.4rem', 
                                            borderRadius: '4px'
                                        }}>{voice.language}</span>
                                    </div>
                                </div>
                                <div 
                                    className="play-btn-circle"
                                    onClick={(e) => { e.stopPropagation(); handleAuditionVoice(voice); }}
                                    title={`Listen to ${voice.conceptualName}`}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: isAuditioning === voice.conceptualName ? '#fff' : 'transparent',
                                        border: '1px solid #fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isAuditioning === voice.conceptualName ? '#000' : '#fff'
                                    }}
                                >
                                    {isAuditioning === voice.conceptualName ? <StopIcon /> : <PlayIcon />}
                                </div>
                            </div>
                            
                            <div className="voice-card-desc" style={{
                                fontSize: '0.85rem', 
                                color: '#aaa', 
                                lineHeight: '1.4',
                                fontStyle: 'italic'
                            }}>
                                {voice.use_case}
                                <br/>
                                <span style={{fontSize: '0.75rem', opacity: 0.6}}>(API: {voice.apiName})</span>
                            </div>

                            {/* AI Processing Bar at Bottom */}
                            {isAuditioning === voice.conceptualName && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #00E5FF, #fff, #00E5FF)',
                                    backgroundSize: '200% 100%',
                                    animation: 'globalLoading 1.5s infinite linear',
                                    borderBottomLeftRadius: '8px',
                                    borderBottomRightRadius: '8px',
                                    opacity: 0.8
                                }}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="tts-actions">
                    {(isGeneratingAudio || isGeneratingChunks) &&
                    <button onClick={isGeneratingAudio ? handleStopAudioGeneration : handleStopChunkGeneration} className="stop-button main-stop-button">
                        Stop Generation
                    </button>
                }
                <div className="tts-action-group wide-button">
                        <button onClick={handleGenerateSample} disabled={isTTSBusy || !voiceoverScript.trim()} title="Generates first 15 seconds to test voice and settings.">
                        {isGeneratingSample ? 'Generating...' : 'Generate Sample (15s)'}
                    </button>
                </div>
                {sampleAudioUrl && (
                    <div className="generation-result-item">
                        <AudioPlayer src={sampleAudioUrl} title="Sample" onDownload={() => {
                            const link = document.createElement('a');
                            link.href = sampleAudioUrl;
                            link.download = `${projectName.replace(/\s+/g, '_')}_sample.wav`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }} />
                    </div>
                )}
                <div className="tts-action-pair">
                    <div className="tts-action-group generate-group">
                        <button className="generate-full-btn" onClick={handleGenerateVoiceover} disabled={isTTSBusy || !voiceoverScript.trim()} title="Generates one continuous audio file.">
                            {isGeneratingAudio ? 'Generating...' : 'Generate Full Audio (Single File) - Best for Shorts/Reels (1-2 min)'}
                        </button>
                        {generatedAudioUrl && (
                            <div className="generation-result-item">
                                <AudioPlayer src={generatedAudioUrl} title="Full Audio" onDownload={() => handleDownloadAudio()} />
                            </div>
                        )}
                    </div>
                        <button onClick={() => handleDownloadAudio()} disabled={!generatedAudioBytes} className="download-button paired-download-btn" title="Download full audio.">
                        <DownloadIcon /> Download
                    </button>
                </div>

                <div className="tts-action-group">
                    <button className="generate-full-btn" onClick={handleGenerateChunkedAudio} disabled={isTTSBusy || !voiceoverScript.trim()} title="Safest for long scripts. Generates audio in parts.">
                        {isGeneratingChunks ? 'Generating...' : 'Generate Full Audio (In Chunks) - Recommended for Long Videos'}
                    </button>
                    {audioChunks.length > 0 && (
                        <div className="generation-result-item full-width">
                            <h4>Audio Chunks ({audioChunks.filter(c => c.status === 'complete').length}/{audioChunks.length})</h4>
                            <div className="audio-chunk-list">
                                {audioChunks.map(chunk => (
                                    <div key={chunk.id} className={`audio-chunk-item ${chunk.status}`}>
                                        <div className="audio-chunk-controls">
                                            {chunk.status === 'pending' && <span>Chunk {chunk.id + 1}: Pending...</span>}
                                            {chunk.status === 'generating' && <><div className="loader small"></div><span>Chunk {chunk.id + 1}: Generating...</span></>}
                                            {chunk.status === 'failed' && <>
                                                <span className="error-placeholder" title={chunk.error}>Chunk {chunk.id + 1}: Failed</span>
                                                <button title="Retry Chunk" onClick={() => handleRetrySingleAudioChunk(chunk.id)} className="result-actions" style={{ padding: '0', width: '30px', height: '30px', flexShrink: 0 }}><RegenerateIcon /></button>
                                            </>}
                                            {chunk.status === 'complete' && chunk.audioUrl && (
                                                <AudioPlayer src={chunk.audioUrl} title={`Chunk ${chunk.id + 1}`} onDownload={() => handleDownloadAudio(chunk.audioBytes, `${projectName}_chunk_${chunk.id + 1}.wav`)} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                                <div className="chunk-download-actions">
                                {audioChunks.some(c => c.status === 'failed' || c.status === 'pending') && (
                                    <button 
                                        onClick={handleResumeChunkedAudio} 
                                        disabled={isTTSBusy} 
                                        title="Resume generating pending or failed chunks."
                                        className="generate-full-btn"
                                        style={{ backgroundColor: '#ff9800', color: '#fff' }}
                                    >
                                        Resume Incomplete Chunks
                                    </button>
                                )}
                                <button onClick={handleMergeAndDownload} disabled={isTTSBusy || isMergingAudio || audioChunks.filter(c => c.status === 'complete').length === 0} title="Combine all chunks into one file.">
                                    {isMergingAudio ? 'Merging...' : 'Merge & Download'}
                                </button>
                                <button onClick={handleDownloadAllChunksZip} disabled={isTTSBusy || audioChunks.filter(c => c.status === 'complete').length === 0} title="Download chunks as individual files.">
                                    Download as ZIP
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};