import React, { useState, useRef, useEffect } from 'react';
import { CharacterProfile } from './types';
import { StopIcon } from './icons';

interface CharacterManagerProps {
    characterProfiles: CharacterProfile[];
    handleAddCharacter: () => void;
    handleRemoveCharacter: (id: string) => void;
    handleCharacterDescriptionChange: (id: string, value: string) => void;
    handleCharacterAiDescriptionChange: (id: string, value: string) => void;
    handleSetCharacterProfiles: React.Dispatch<React.SetStateAction<CharacterProfile[]>>;
    
    // Drag and Drop Props
    isDraggingChar: string | null;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    handlePaste: (e: React.ClipboardEvent<HTMLDivElement>, id: string) => void;
    
    // File Upload Props
    characterImageInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
    isAnalyzingCharacter: string | null;
    onStop: () => void;
    // Script Analysis Props
    handleAnalyzeScript?: (options: { extractCharacters: boolean; configureVoice: boolean; genderPreference?: 'any' | 'male' | 'female', keepExistingVoice?: boolean, configureVisuals?: boolean }) => Promise<void>;
    isExtractingCharacters?: boolean;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
    characterProfiles, handleAddCharacter, handleRemoveCharacter, handleCharacterDescriptionChange,
    handleCharacterAiDescriptionChange,
    handleSetCharacterProfiles, isDraggingChar, handleDragOver, handleDragLeave, handleDrop,
    handlePaste, characterImageInputRefs, handleImageUpload, isAnalyzingCharacter, onStop,
    handleAnalyzeScript, isExtractingCharacters
}) => {
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const characterContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (characterContainerRef.current && !characterContainerRef.current.contains(event.target as Node)) {
                setExpandedIds({});
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCollapse = (id: string) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCollapseAll = () => {
        setExpandedIds({});
    };

    const handleExpandAll = () => {
        const allExpanded: Record<string, boolean> = {};
        characterProfiles.forEach(p => {
            allExpanded[p.id] = true;
        });
        setExpandedIds(allExpanded);
    };

    const isAllCollapsed = Object.values(expandedIds).filter(Boolean).length === 0;

    return (
        <div className="card character-profile-card" ref={characterContainerRef}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Character Profile (for Consistency)</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {characterProfiles.length > 1 && (
                        <button 
                            onClick={isAllCollapsed ? handleExpandAll : handleCollapseAll} 
                            className="secondary-action-btn"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', width: 'auto', height: 'auto', backgroundColor: 'var(--bg-main)' }}
                        >
                            {isAllCollapsed ? 'Expand All' : 'Collapse All'}
                        </button>
                    )}
                    <button onClick={handleAddCharacter} className="add-character-btn">+</button>
                </div>
            </div>
            <p className="description" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#FFD700', fontSize: '1rem' }}>Note:</strong> The Character Name must exactly match the name used in your Script. You can upload an image OR manually paste the character's visual details below.
            </p>
            {handleAnalyzeScript && (
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                        className="btn primary" 
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--primary-light)', color: 'var(--text-main)', border: '1px solid var(--primary)' }}
                        onClick={() => handleAnalyzeScript({ extractCharacters: true, configureVoice: false })}
                        disabled={isExtractingCharacters}
                    >
                        {isExtractingCharacters ? (
                            <><span className="spinner" style={{ width: '12px', height: '12px' }}></span> Extracting...</>
                        ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 7.1"></path><path d="M12 12l9.9-4.9"></path></svg> Scan & Extract Main Characters</>
                        )}
                    </button>
                </div>
            )}
            <div className="character-profiles-container">
                {characterProfiles.map((profile, index) => {
                    const isExpanded = expandedIds[profile.id];
                    const firstLine = profile.userDescription ? profile.userDescription.trim().split('\n')[0] : '';
                    const previewText = firstLine ? ` - ${firstLine.slice(0, 45)}${firstLine.length > 45 ? '...' : ''}` : '';

                    return (
                        <div key={profile.id} className="character-profile-item" style={{ transition: 'all 0.2s', paddingBottom: !isExpanded ? '0.5rem' : '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div 
                                className="character-header" 
                                onClick={() => toggleCollapse(profile.id)}
                                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', padding: '0.5rem 0' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ 
                                        fontSize: '0.8rem', 
                                        color: 'var(--primary)', 
                                        transform: !isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)', 
                                        transition: 'transform 0.2s', 
                                        display: 'inline-block',
                                        cursor: 'pointer'
                                    }}>▼</span>
                                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>
                                        {profile.name ? profile.name : `Character ${index + 1}`}{previewText}
                                    </h3>
                                </div>
                                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button onClick={() => handleRemoveCharacter(profile.id)} className="remove-btn" style={{ position: 'static', margin: 0, fontSize: '1.2rem', padding: '0 0.5rem' }}>×</button>
                                </div>
                            </div>
                            
                            {isExpanded && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Character Name (Must exactly match the script)</label>
                                        {profile.bible_id && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.3rem', display: 'block' }}>
                                                * If left blank, the system automatically uses ID ({profile.bible_id || `char_${index + 1}`}) for tagging.
                                            </span>
                                        )}
                                        <input 
                                            type="text" 
                                            value={profile.name || ''} 
                                            onChange={(e) => handleSetCharacterProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, name: e.target.value } : p))} 
                                            placeholder={`e.g., Character ${index + 1}`}
                                            className="app-input"
                                            style={{ 
                                                backgroundColor: 'var(--surface-light)', 
                                                border: (profile.bible_id && (!profile.name || profile.name.trim() === '')) ? '2px solid orange' : '1px solid var(--border)',
                                                boxShadow: (profile.bible_id && (!profile.name || profile.name.trim() === '')) ? '0 0 8px rgba(255, 165, 0, 0.6)' : 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Visual Description (Age, Clothing, Face)</label>
                                        </div>
                                        <textarea 
                                            rows={4} 
                                            value={profile.userDescription} 
                                            onChange={(e) => handleCharacterDescriptionChange(profile.id, e.target.value)} 
                                            placeholder="Paste your character details here (Ctrl+V)..."
                                        />
                                    </div>
                                    {profile.aiDescription && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <button 
                                                    className="app-button secondary" 
                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                    onClick={(e) => { e.stopPropagation(); handleCharacterAiDescriptionChange(profile.id, ''); }}
                                                    title="Clear AI Analysis"
                                                >
                                                    🗑️ Clear AI Analysis
                                                </button>
                                            </div>
                                            <textarea
                                                className="ai-description"
                                                value={profile.aiDescription}
                                                onChange={(e) => handleCharacterAiDescriptionChange(profile.id, e.target.value)}
                                                rows={6}
                                                placeholder="AI-generated description will appear here. You can edit it."
                                            />
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`drop-zone ${isDraggingChar === profile.id ? 'drag-over' : ''}`} 
                                        onDragOver={(e) => handleDragOver(e, profile.id)} 
                                        onDragLeave={handleDragLeave} 
                                        onDrop={(e) => handleDrop(e, profile.id)} 
                                        onPaste={(e) => handlePaste(e, profile.id)}
                                    >
                                            <input 
                                                type="file" 
                                                ref={el => { if (el) { characterImageInputRefs.current[profile.id] = el; } }} 
                                                onChange={(e) => handleImageUpload(e, profile.id)} 
                                                accept="image/*" 
                                                style={{display: 'none'}} 
                                            />
                                        {isAnalyzingCharacter === profile.id ? (
                                            <button onClick={onStop} className="stop-button">
                                                <StopIcon /> Stop Analysis
                                            </button>
                                        ) : (
                                            <button onClick={() => characterImageInputRefs.current[profile.id]?.click()} disabled={isAnalyzingCharacter !== null}>
                                                Upload Image
                                            </button>
                                        )}
                                        {profile.image ? (
                                            <div className="ref-file-item">
                                                <img src={profile.image.dataUrl || undefined} alt="Character Reference" className="ref-file-preview" />
                                                <button onClick={() => handleSetCharacterProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, image: null } : p))} className="ref-delete-btn">×</button>
                                            </div>
                                        ) : <p>Drop or Paste Image</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};