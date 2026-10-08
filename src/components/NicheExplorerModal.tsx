import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronDown, ChevronUp, Copy, Check, Lightbulb, Sparkles, BookOpen, Loader2 } from 'lucide-react';

interface NicheItem {
    id: string;
    name: string;
    imageUrl: string;
    textUrl: string;
}

interface GithubFile {
    name: string;
    download_url: string;
    type: string;
}

interface NicheExplorerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectNiche: (nicheName: string) => void;
    onSelectIdea: (idea: string) => void;
    onGenerateIdeas: (playbookText: string) => Promise<string[]>;
}

export const NicheExplorerModal: React.FC<NicheExplorerModalProps> = ({
    isOpen,
    onClose,
    onSelectNiche,
    onSelectIdea,
    onGenerateIdeas
}) => {
    const [niches, setNiches] = useState<NicheItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNiche, setSelectedNiche] = useState<NicheItem | null>(null);
    const [playbookText, setPlaybookText] = useState<string>('');
    const [isLoadingPlaybook, setIsLoadingPlaybook] = useState(false);
    
    // Details states
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    // Idea generation states
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const [ideasSourceNiche, setIdeasSourceNiche] = useState<string>('');
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleAppDataCleared = () => {
            setGeneratedIdeas([]);
            setIdeasSourceNiche('');
            setSelectedNiche(null);
            setPlaybookText('');
            setIsAccordionOpen(false);
        };

        window.addEventListener('app-data-cleared', handleAppDataCleared);
        return () => {
            window.removeEventListener('app-data-cleared', handleAppDataCleared);
        };
    }, []);

    useEffect(() => {
        if (isOpen && niches.length === 0) {
            fetchNiches();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setIsLoadingPlaybook(false);
            setIsGeneratingIdeas(false);
        }
    }, [isOpen]);

    const fetchNiches = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("https://api.github.com/repos/muntasintr/ai-niche-playbooks/contents/");
            if (!res.ok) throw new Error("Failed to fetch repository contents");
            const files: GithubFile[] = await res.json();
            
            const nichesMap = new Map<string, Partial<NicheItem>>();
            
            files.forEach(file => {
                if (file.type !== "file") return;
                const ext = file.name.split('.').pop()?.toLowerCase();
                const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
                
                if (!nichesMap.has(baseName)) {
                    // Convert kebab-case or snake_case to Title Case
                    const formattedName = baseName
                        .replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, char => char.toUpperCase());
                        
                    nichesMap.set(baseName, { 
                        id: baseName, 
                        name: formattedName 
                    });
                }
                
                const item = nichesMap.get(baseName)!;
                if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
                    item.imageUrl = file.download_url;
                } else if (ext === 'txt') {
                    item.textUrl = file.download_url;
                }
            });
            
            const validNiches = Array.from(nichesMap.values())
                .filter(n => n.imageUrl && n.textUrl) as NicheItem[];
                
            setNiches(validNiches);
        } catch (error) {
            console.error("Error fetching niches:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectNiche = async (niche: NicheItem) => {
        setSelectedNiche(niche);
        setIsLoadingPlaybook(true);
        setIsAccordionOpen(false);
        try {
            const res = await fetch(niche.textUrl);
            const text = await res.text();
            setPlaybookText(text);
        } catch (error) {
            console.error("Error fetching playbook text:", error);
            setPlaybookText("Failed to load playbook data.");
        } finally {
            setIsLoadingPlaybook(false);
        }
    };

    const handleBackToGrid = () => {
        setSelectedNiche(null);
        setPlaybookText('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(playbookText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleGenerate = async () => {
        if (!playbookText) return;
        setIsGeneratingIdeas(true);
        try {
            const ideas = await onGenerateIdeas(playbookText);
            setGeneratedIdeas(ideas);
            setIdeasSourceNiche(selectedNiche?.name || '');
        } catch (error) {
            console.error("Failed to generate ideas", error);
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const extractShortIdea = (text: string) => {
        if (!text) return "";
        // Strict logic: Extract everything before "২. " (Idea and Title Generation section)
        // No blind cuts, preserves exact meaning up to section 2.
        const parts = text.split(/(?=২\.\s*)/);
        if (parts.length > 0) {
            return parts[0].trim();
        }
        return text.trim();
    };

    if (!isOpen) return null;

    return (
        <div id="niche-explorer-panel" ref={panelRef} className="w-full max-h-[600px] flex flex-col bg-[#1e2330] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-700 overflow-hidden mt-4 mb-8 transition-all">
            <style>{`
                .niche-custom-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }
                .niche-custom-card {
                    display: flex;
                    flex-direction: column;
                    background-color: #151923;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                }
                .niche-custom-card:hover {
                    transform: translateY(-6px) scale(1.02);
                    border-color: #3b82f6;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
                }
                .niche-custom-img {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    border-bottom: 1px solid #374151;
                }
                .niche-custom-title {
                    padding: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #e5e7eb;
                    text-align: center;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .niche-idea-card {
                    padding: 16px;
                    background-color: rgba(30, 58, 138, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 12px;
                }
                .niche-idea-card:hover {
                    background-color: rgba(30, 58, 138, 0.4);
                    transform: translateY(-3px);
                    border-color: rgba(59, 130, 246, 0.6);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .niche-idea-text {
                    color: #dbeafe;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                }
                .niche-idea-hint {
                    font-size: 12px;
                    color: #60a5fa;
                    margin-top: 10px;
                    opacity: 0.5;
                    margin-bottom: 0;
                    transition: opacity 0.2s;
                }
                .niche-idea-card:hover .niche-idea-hint {
                    opacity: 1;
                }
            `}</style>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(55,65,81,0.5)', backgroundColor: '#151923' }}>
                {selectedNiche && (
                    <button 
                        onClick={handleBackToGrid}
                        style={{ padding: '8px', marginRight: '16px', backgroundColor: 'transparent', border: 'none', color: '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '8px' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Sparkles color="#FBBF24" size={22} />
                    {selectedNiche ? selectedNiche.name : "Explore Premium Niches"}
                </h2>
            </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
                            <Loader2 size={40} className="animate-spin text-blue-500" />
                            <p>Loading Niche Library from GitHub...</p>
                        </div>
                    ) : selectedNiche ? (
                        // Details Super Modal View
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '48rem', margin: '0 auto', paddingBottom: '40px', width: '100%' }}>
                            {/* Top Banner */}
                            <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                                <img src={selectedNiche.imageUrl} alt={selectedNiche.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', alignItems: 'flex-end', padding: '24px' }}>
                                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{selectedNiche.name}</h1>
                                </div>
                            </div>

                            {/* Dynamic Short Idea */}
                            <div style={{ backgroundColor: '#151923', padding: '24px', borderRadius: '12px', border: '1px solid rgba(55,65,81,0.5)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
                                {isLoadingPlaybook ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9CA3AF' }}>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Analyzing Playbook...</span>
                                    </div>
                                ) : (
                                    <div style={{ color: '#E5E7EB', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                        {extractShortIdea(playbookText)}
                                    </div>
                                )}
                            </div>

                            {/* Playbook Accordion */}
                            {playbookText && !isLoadingPlaybook && (
                                <div style={{ border: '1px solid rgba(55,65,81,0.8)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1a1f2b' }}>
                                    <button 
                                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#151923', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <BookOpen color="#60A5FA" size={20} />
                                            View Playbook & Viral Strategy
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', backgroundColor: '#374151', padding: '6px 12px', borderRadius: '6px', transition: 'background-color 0.2s', color: 'white' }}
                                            >
                                                {isCopied ? <Check color="#4ADE80" size={14} /> : <Copy size={14} />}
                                                {isCopied ? 'Copied' : 'Copy'}
                                            </div>
                                            {isAccordionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    
                                    {isAccordionOpen && (
                                        <div style={{ padding: '24px', borderTop: '1px solid rgba(55,65,81,0.8)', overflowX: 'auto' }}>
                                            <pre style={{ color: '#D1D5DB', fontFamily: 'sans-serif', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                                                {playbookText}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Idea Generation Results */}
                            {generatedIdeas.length > 0 && (
                                <div className="mt-4 flex flex-col gap-3">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                            <Lightbulb size={20}/>
                                            {ideasSourceNiche && ideasSourceNiche !== selectedNiche.name
                                                ? `Old Ideas for: ${ideasSourceNiche}`
                                                : 'AI Generated Ideas'}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setGeneratedIdeas([]);
                                                setIdeasSourceNiche('');
                                            }}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <X size={14}/> Clear Ideas
                                        </button>
                                    </div>
                                    <div className="grid gap-3">
                                        {generatedIdeas.map((idea, idx) => (
                                            <div key={idx} onClick={() => { onSelectIdea(idea); onClose(); }} className="niche-idea-card">
                                                <p className="niche-idea-text">{idea}</p>
                                                <p className="niche-idea-hint">✨ Click to use this idea in your script</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', padding: '8px 0', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => {
                                        onSelectNiche(selectedNiche.name);
                                        onClose();
                                    }}
                                    className="bg-green-600 hover:bg-green-500 text-white transition-all"
                                    style={{ flex: '1 1 0%', minWidth: '200px', padding: '14px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
                                >
                                    <Check size={20} /> Select Niche
                                </button>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGeneratingIdeas || isLoadingPlaybook}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-all"
                                    style={{ flex: '1 1 0%', minWidth: '200px', padding: '14px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: isGeneratingIdeas || isLoadingPlaybook ? 'not-allowed' : 'pointer', border: 'none' }}
                                >
                                    {isGeneratingIdeas ? <Loader2 className="animate-spin" size={20} /> : <Lightbulb size={20} />}
                                    {isGeneratingIdeas ? 'Generating...' : 'Generate Ideas'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Netflix Style Grid
                        <div className="niche-custom-grid">
                            {niches.map((niche) => (
                                <div 
                                    key={niche.id}
                                    onClick={() => handleSelectNiche(niche)}
                                    className="niche-custom-card"
                                >
                                    <img 
                                        src={niche.imageUrl} 
                                        alt={niche.name} 
                                        className="niche-custom-img"
                                    />
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <h3 className="niche-custom-title">
                                            {niche.name}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        </div>
    );
};
