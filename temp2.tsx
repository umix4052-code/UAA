export const CustomRouterUI: React.FC<CustomRouterUIProps> = ({
    baseUrl, setBaseUrl, apiKey, setApiKey, modelId, setModelId
}) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const [selectedProfileName, setSelectedProfileName] = useState<string>("");

    const [savedProfiles, setSavedProfiles] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = localStorage.getItem('custom_router_profiles');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    return [];
                }
            }
        }
        return [];
    });

    const handleSaveProfile = () => {
        if (!baseUrl || !apiKey || !modelId) {
            alert("Please fill in Base URL, API Key, and Model ID before saving a profile.");
            return;
        }
        const name = prompt("Enter a name for this profile (e.g., Groq, Nara Router):");
        if (!name) return;

        const newProfile = { name, baseUrl, apiKey, modelId };
        const updatedProfiles = [...savedProfiles, newProfile];
        setSavedProfiles(updatedProfiles);
        setSelectedProfileName(name);
        
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('custom_router_profiles', JSON.stringify(updatedProfiles));
        }
    };

    const handleDeleteProfile = () => {
        if (!selectedProfileName) return;
        if (!confirm(`Are you sure you want to delete the profile "${selectedProfileName}"?`)) return;
        
        const updatedProfiles = savedProfiles.filter((p: any) => p.name !== selectedProfileName);
        setSavedProfiles(updatedProfiles);
        setSelectedProfileName("");
        
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('custom_router_profiles', JSON.stringify(updatedProfiles));
        }
    };

    const handleSelectProfile = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        setSelectedProfileName(selectedName);
        if (!selectedName) return;
        const profile = savedProfiles.find((p: any) => p.name === selectedName);
        if (profile) {
            setBaseUrl(profile.baseUrl);
            setApiKey(profile.apiKey);
            setModelId(profile.modelId);
        }
    };

    const handleCopy = async () => {
        if (!apiKey) return;
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const getDisplayApiKey = () => {
        if (!apiKey) return "";
        if (showApiKey || isFocused) return apiKey;
        if (apiKey.length <= 10) return "•".repeat(apiKey.length);
        return apiKey.slice(0, 6) + "••••••••••••••••" + apiKey.slice(-4);
    };

    return (
        <div className="custom-router-section">
            <p className="description">
                Connect any OpenAI-compatible router (e.g. TokenRouter).
                Enter the Base URL, your API Key, and paste any Model ID.
                Your settings are saved automatically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Saved Profiles Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                        Saved Profiles (Presets)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                            value={selectedProfileName}
                            onChange={handleSelectProfile}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                        >
                            <option value="" disabled>-- Select a Saved Profile --</option>
                            {savedProfiles.map((p: any, i: number) => (
                                <option key={i} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleSaveProfile}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                        >
                            💾 Save Current Setup
                        </button>
                        {selectedProfileName && (
                            <button 
                                onClick={handleDeleteProfile}
                                title="Delete this profile"
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ef4444', background: 'var(--bg-main)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                        Base URL
                    </label>
                    <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => { setBaseUrl(e.target.value); setSelectedProfileName(""); }}
                        placeholder="e.g. https://api.tokenrouter.io/v1"
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                        API Key
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={getDisplayApiKey()}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => { setApiKey(e.target.value); setSelectedProfileName(""); }}
                            placeholder="Enter your router API Key (sk-...)"
                            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', padding: '0.5rem', paddingRight: '4.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                        />
                        <div style={{ position: 'absolute', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleCopy} title="Copy API Key" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}>
                                {copied ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                )}
                            </button>
                            <button onClick={() => setShowApiKey(!showApiKey)} title={showApiKey ? "Hide API Key" : "Show API Key"} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}>
                                {showApiKey ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                        Model ID (paste any model)
                    </label>
                    <input
                        type="text"
                        value={modelId}
                        onChange={(e) => { setModelId(e.target.value); setSelectedProfileName(""); }}
                        placeholder="e.g. openai/gpt-4o-mini"
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                    />
                </div>
            </div>
        </div>
    );
};
