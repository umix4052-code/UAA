import React, { useState, useEffect, useRef } from 'react';
import { InfoIcon, CheckIcon } from './icons';
import { CustomRouterUI } from './custom-router-provider';

interface ApiKeyManagerProps {
    // New props for provider selection
    apiProvider: 'google' | 'openrouter' | 'custom';
    setApiProvider: (provider: 'google' | 'openrouter' | 'custom') => void;
    openRouterApiKey: string;
    setOpenRouterApiKey: (key: string) => void;
    isOpenRouterPaid: boolean;
    setIsOpenRouterPaid: (isPaid: boolean) => void;

    customRouterBaseUrl: string;
    setCustomRouterBaseUrl: (v: string) => void;
    customRouterApiKey: string;
    setCustomRouterApiKey: (v: string) => void;
    customRouterModelId: string;
    setCustomRouterModelId: (v: string) => void;

    // Existing Gemini props
    newApiKey: string;
    setNewApiKey: (key: string) => void;
    handleAddApiKey: () => void;
    useEnvApiKey: boolean;
    setUseEnvApiKey: (use: boolean) => void;
    enabledApiKeys: string[];
    apiKeys: string[];
    handleToggleApiKey: (key: string, force?: boolean) => void;
    handleRemoveApiKey: (key: string) => void;
    onApiKeyPaste?: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
    apiProvider, setApiProvider, openRouterApiKey, setOpenRouterApiKey,
    isOpenRouterPaid, setIsOpenRouterPaid,
    customRouterBaseUrl, setCustomRouterBaseUrl, customRouterApiKey, setCustomRouterApiKey, customRouterModelId, setCustomRouterModelId,
    newApiKey, setNewApiKey, handleAddApiKey,
    useEnvApiKey, setUseEnvApiKey,
    enabledApiKeys, apiKeys, handleToggleApiKey, handleRemoveApiKey,
    onApiKeyPaste
}) => {
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [isEditingKey, setIsEditingKey] = useState(() => !openRouterApiKey);
    const [localApiKey, setLocalApiKey] = useState(openRouterApiKey);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showGeminiNewKey, setShowGeminiNewKey] = useState(false);
    const [copiedGeminiKey, setCopiedGeminiKey] = useState<string | null>(null);

    // Sync local state if the prop changes from an external source (e.g., loading a project)
    useEffect(() => {
        setLocalApiKey(openRouterApiKey);
        setIsEditingKey(!openRouterApiKey);
    }, [openRouterApiKey]);
    
    // Focus the input when entering edit mode
    useEffect(() => {
        if (isEditingKey) {
            inputRef.current?.focus();
        }
    }, [isEditingKey]);

    const handleBlur = () => {
        setOpenRouterApiKey(localApiKey); // Sync parent state
        if (localApiKey) {
            setIsEditingKey(false);
            setIsKeySaved(true);
            setTimeout(() => setIsKeySaved(false), 2000);
        }
    };

    const maskApiKey = (key: string): string => {
        if (!key || key.length < 12) {
            return 'sk-or-v...'; // Placeholder for empty/short key
        }
        const prefix = key.substring(0, 7);
        const suffix = key.substring(key.length - 4);
        return `${prefix}....................${suffix}`;
    };

    return (
        <div className="card api-key-section">
            <h2>API Key Management</h2>

            <div className="api-provider-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <label style={{ fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0, paddingTop: '0.75rem' }}>API Provider:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    <div className={`style-item ${apiProvider === 'google' ? 'selected' : ''}`} style={{ border: `2px solid ${apiProvider === 'google' ? 'var(--primary)' : 'transparent'}`, cursor: 'pointer', background: 'var(--bg-main)' }} onClick={() => setApiProvider('google')}>
                        <input type="radio" id="provider-google" name="apiProvider" value="google" checked={apiProvider === 'google'} onChange={() => setApiProvider('google')} style={{width: 'auto'}} />
                        <label htmlFor="provider-google" style={{cursor: 'pointer'}}>Google Gemini (Default)</label>
                    </div>
                    <div className={`style-item ${apiProvider === 'openrouter' ? 'selected' : ''}`} style={{ border: `2px solid ${apiProvider === 'openrouter' ? 'var(--primary)' : 'transparent'}`, cursor: 'pointer', background: 'var(--bg-main)' }} onClick={() => { setApiProvider('openrouter'); setUseEnvApiKey(false); }}>
                        <input type="radio" id="provider-openrouter" name="apiProvider" value="openrouter" checked={apiProvider === 'openrouter'} onChange={() => { setApiProvider('openrouter'); setUseEnvApiKey(false); }} style={{width: 'auto'}}/>
                        <label htmlFor="provider-openrouter" style={{cursor: 'pointer'}}>OpenRouter</label>
                        <div className="tooltip-icon" title="Access a wide variety of open-source and proprietary models. Performance and availability may vary. AI Voiceover and Video Generation (Veo) are NOT supported in this mode.">
                            <InfoIcon />
                        </div>
                    </div>
                    <div className={`style-item ${apiProvider === 'custom' ? 'selected' : ''}`} style={{ border: `2px solid ${apiProvider === 'custom' ? 'var(--primary)' : 'transparent'}`, cursor: 'pointer', background: 'var(--bg-main)' }} onClick={() => { setApiProvider('custom'); setUseEnvApiKey(false); }}>
                        <input type="radio" id="provider-custom" name="apiProvider" value="custom" checked={apiProvider === 'custom'} onChange={() => { setApiProvider('custom'); setUseEnvApiKey(false); }} style={{width: 'auto'}}/>
                        <label htmlFor="provider-custom" style={{cursor: 'pointer'}}>Custom Router (Advanced)</label>
                        <div className="tooltip-icon" title="Connect any OpenAI-compatible router (e.g. TokenRouter) with your own Base URL, API Key and Model ID. Experimental feature.">
                            <InfoIcon />
                        </div>
                    </div>
                </div>
            </div>

            {apiProvider === 'google' ? (
                <>
                    <div className="input-group" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <input 
                                type={showGeminiNewKey ? "text" : "password"} 
                                value={newApiKey} 
                                onChange={(e) => setNewApiKey(e.target.value)} 
                                onPaste={onApiKeyPaste}
                                placeholder="Add new Gemini API Key"
                                style={{ width: '100%', paddingRight: '2.5rem' }}
                            />
                            <div style={{ position: 'absolute', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setShowGeminiNewKey(!showGeminiNewKey)} title={showGeminiNewKey ? "Hide API Key" : "Show API Key"} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}>
                                    {showGeminiNewKey ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button onClick={handleAddApiKey} style={{ flexShrink: 0 }}>Add</button>
                    </div>
                    <div className="style-item special-api-toggle" style={{ margin: '1rem 0', border: '1px solid var(--primary)', padding: '0.75rem' }}>
                        <input 
                            type="checkbox" 
                            id="useEnvKey" 
                            checked={useEnvApiKey} 
                            onChange={(e) => setUseEnvApiKey(e.target.checked)} 
                        />
                        <label htmlFor="useEnvKey" style={{ fontWeight: 'bold', color: 'var(--primary)', cursor: 'pointer' }}>
                            Use Built-in Gemini Key (No Setup Required)
                        </label>
                    </div>
                    <p className="description">
                        {enabledApiKeys.length === 0 && !useEnvApiKey 
                            ? <span className="api-key-warning">You must add and enable at least one Gemini API key OR use the built-in key to unlock the app.</span> 
                            : "Add your Gemini API keys below and enable one to start using the app."}
                    </p>
                    <div className="api-key-list">
                        <ul>
                            {apiKeys.map(key => (
                                <li key={key} className={enabledApiKeys.includes(key) ? 'enabled' : ''}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="key-text" style={{ fontFamily: 'monospace' }}>
                                            {key.length > 15 ? `${key.substring(0, 6)}••••••••••••••••${key.substring(key.length - 4)}` : key}
                                        </span>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(key).catch(err => console.error("Failed to copy:", err));
                                            setCopiedGeminiKey(key);
                                            setTimeout(() => setCopiedGeminiKey(null), 2000);
                                        }} title="Copy API Key" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                            {copiedGeminiKey === key ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="api-key-actions">
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={enabledApiKeys.includes(key)} 
                                                onChange={() => handleToggleApiKey(key)} 
                                                disabled={useEnvApiKey} 
                                                title={useEnvApiKey ? "Disable Built-in key to manage custom keys" : ""} 
                                            />
                                            <span className="slider"></span>
                                        </label>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveApiKey(key); }} className="remove-btn">×</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : apiProvider === 'openrouter' ? (
                 <div className="openrouter-key-section">
                    <p className="description">
                        Enter your OpenRouter API key. Get one from <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">openrouter.ai</a>. Your key is saved automatically.
                    </p>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input 
                            type="checkbox" 
                            checked={isOpenRouterPaid} 
                            onChange={(e) => setIsOpenRouterPaid(e.target.checked)} 
                            style={{ width: 'auto', accentColor: 'var(--primary)', margin: 0 }} 
                        />
                        <span style={{ color: isOpenRouterPaid ? 'var(--primary)' : 'var(--text-primary)' }}>I have a Paid OpenRouter Account (with $10+ credits)</span>
                    </label>

                    <div className="input-group" style={{ position: 'relative' }}>
                        {isEditingKey ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                onPaste={onApiKeyPaste}
                                onBlur={handleBlur}
                                placeholder="Enter your OpenRouter API Key (sk-or-...)"
                                style={{ fontFamily: 'monospace' }}
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingKey(true)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--base-radius)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-main)',
                                    color: 'var(--text-primary)',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer',
                                    fontFamily: 'monospace',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: '46px' // Match input height
                                }}
                                title="Click to edit key"
                            >
                                {maskApiKey(openRouterApiKey)}
                            </div>
                        )}

                        {isKeySaved && !isEditingKey && (
                            <span style={{ 
                                position: 'absolute', 
                                right: '10px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: 'var(--primary)', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.9rem',
                                pointerEvents: 'none' // Prevent interaction with the text
                            }}>
                                <CheckIcon /> Saved!
                            </span>
                        )}
                    </div>
                 </div>
            ) : (
                <CustomRouterUI
                    baseUrl={customRouterBaseUrl}
                    setBaseUrl={setCustomRouterBaseUrl}
                    apiKey={customRouterApiKey}
                    setApiKey={setCustomRouterApiKey}
                    modelId={customRouterModelId}
                    setModelId={setCustomRouterModelId}
                />
            )}

            <div className="api-usage-guide" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <InfoIcon /> API Usage & Limits Guidelines
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--base-radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary)' }}>Gemini API Limits</div>
                        
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', marginTop: '6px' }}>FREE TIER</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                            <span>Speed Limit:</span> <strong>15 RPM</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                            <span>Daily Quota:</span> <strong>1,500 RPD</strong>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PAID (PAY-AS-YOU-GO)</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                            <span>Speed Limit:</span> <strong>1000 RPM</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Daily Quota:</span> <strong>Pay-As-You-Go</strong>
                        </div>
                    </div>
                    <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--base-radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary)' }}>OpenRouter Limits</div>
                        
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', marginTop: '6px' }}>FREE USERS</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                            <span>Speed Limit:</span> <strong>20 RPM</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                            <span>Daily Quota:</span> <strong>50~200 RPD (Model Dep.)</strong>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>WITH CREDITS ($10+ Recharge)</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                            <span>Speed Limit:</span> <strong>20 RPM</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                            <span>Daily Quota:</span> <strong>1,000 RPD</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Prepaid:</span> <strong>Limitless</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};