import React, { useState } from 'react';

// ============================================================
// CUSTOM ROUTER PROVIDER (ISOLATED MODULE)
// Supports any OpenAI-compatible router (e.g. TokenRouter).
// This file is fully self-contained. To remove the feature,
// delete this file and the marked link-up lines elsewhere.
// ============================================================

// ---------------- UI COMPONENT ----------------
type CustomRouterUIProps = {
    baseUrl: string;
    setBaseUrl: (v: string) => void;
    apiKey: string;
    setApiKey: (v: string) => void;
    modelId: string;
    setModelId: (v: string) => void;
};

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
        
        let providerName = "Custom Router";
        if (baseUrl.toLowerCase().includes('groq')) providerName = "Groq";
        else if (baseUrl.toLowerCase().includes('nara')) providerName = "Nara";
        else if (baseUrl.toLowerCase().includes('tokenrouter')) providerName = "TokenRouter";
        else {
            try { 
                const host = new URL(baseUrl).hostname.replace('api.', '');
                providerName = host.split('.')[0];
                providerName = providerName.charAt(0).toUpperCase() + providerName.slice(1);
            } catch(e){}
        }
        
        const shortModel = modelId.split('/').pop() || modelId;
        const name = `${providerName} - ${shortModel}`;

        const newProfile = { name, baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), modelId: modelId.trim() };
        const updatedProfiles = [...savedProfiles.filter((p: any) => p.name !== name), newProfile];
        
        setSavedProfiles(updatedProfiles);
        setSelectedProfileName(name);
        
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('custom_router_profiles', JSON.stringify(updatedProfiles));
        }
    };

    const handleDeleteProfile = () => {
        if (!selectedProfileName) return;
        // Removed the confirm() dialog to make deletion instant and bypass sandbox blocking
        
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

// ---------------- EXECUTION LOGIC ----------------
let globalLastCustomCallTime = 0;

export const executeCustomRouterTask = async (
    baseUrl: string,
    apiKey: string,
    modelId: string,
    contents: any,
    systemInstruction?: string,
    signal?: AbortSignal
): Promise<{ text: string }> => {
    if (!baseUrl) throw new Error("Custom Router: Base URL is missing.");
    if (!apiKey) throw new Error("Custom Router: API Key is missing.");
    if (!modelId) throw new Error("Custom Router: Model ID is missing.");

    const textContent = typeof contents === 'string'
        ? contents
        : contents.parts?.find((p: any) => p.text)?.text || '';
    if (!textContent) throw new Error("Custom Router: No text content found for request.");

    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });

    let formattedContent: any;

    if (typeof contents !== 'string' && contents.parts) {
        formattedContent = contents.parts.map((part: any) => {
            if (part.text) return { type: "text", text: part.text };
            if (part.inlineData) {
                let finalUrl = part.inlineData.data;
                if (typeof finalUrl === 'string' && !finalUrl.startsWith('data:')) {
                    finalUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${finalUrl}`;
                }
                return { 
                    type: "image_url", 
                    image_url: { url: finalUrl } 
                };
            }
            return null;
        }).filter(Boolean);
    } else {
        const textContent = typeof contents === 'string' ? contents : JSON.stringify(contents);
        formattedContent = [{ type: "text", text: textContent }];
    }
    
    const urlLower = baseUrl.toLowerCase();
    // STRICTLY ISOLATED FOR GROQ ONLY
    if (urlLower.includes('groq') && Array.isArray(formattedContent)) {
        // Groq requires text to be the first element in the array
        formattedContent.sort((a: any, b: any) => (a.type === 'text' ? -1 : b.type === 'text' ? 1 : 0));
    }

    messages.push({ role: "user", content: formattedContent });

    // Use our backend proxy to avoid CORS
    const endpoint = '/api/custom-router';

    const requestBody: any = {
        baseUrl,
        apiKey,
        model: modelId,
        messages: messages,
        temperature: 0.7,
    };

    // CR-9: GLM model thinking disable flag
    if (modelId.toLowerCase().includes('glm')) {
        requestBody.thinking = { type: "disabled" };
    }

    let minDelay = 5000; // Default 5 seconds
    if (urlLower.includes('groq')) {
        minDelay = 2500; // Groq is fast (30 RPM)
    } else if (urlLower.includes('nara') || urlLower.includes('bynara')) {
        minDelay = 6500; // Nara requires safety (10 RPM)
    }

    const timeSinceLast = Date.now() - globalLastCustomCallTime;
    if (timeSinceLast < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLast));
    }
    globalLastCustomCallTime = Date.now();

    const fetchPromise = fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
    });

    const timeoutPromise = new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error("Custom Router Timeout: API proxy unresponsive or payload too large.")), 65000)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (response.status === 429) {
        const err: any = new Error("CUSTOM_LIMIT_REACHED");
        err.status = 429;
        throw err;
    }

    const rawText = await response.text();
    let responseData;
    try {
        responseData = JSON.parse(rawText);
    } catch (e) {
        throw new Error(`Invalid API Response (HTTP ${response.status}): ${rawText.substring(0, 100)}...`);
    }

    if (!response.ok) {
        let errorMessage = responseData?.error?.message || `Custom Router HTTP ${response.status}`;
        
        // Check for specific TPM or size limit errors
        const errLower = errorMessage.toLowerCase();
        if (errLower.includes('rate_limit_exceeded') || errLower.includes('too large for model') || errLower.includes('tokens per minute')) {
            const err: any = new Error("CUSTOM_LIMIT_REACHED");
            err.status = 429;
            throw err;
        }

        // ONLY for Groq: Append full error details for debugging without breaking others
        if (urlLower.includes('groq') && responseData?.error) {
            errorMessage = `Groq Error: ${JSON.stringify(responseData.error)}`;
        }
        
        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.error = responseData.error;
        throw error;
    }

    const completion = responseData;
    const message = completion.choices?.[0]?.message || {};
    let text: any = message.content || "";

    // Some routers return content as an array of parts
    if (Array.isArray(text)) {
        text = text.map((p: any) => (typeof p === 'string' ? p : p?.text || '')).join('');
    }

    // Fallback for reasoning models (e.g. GLM, DeepSeek R1):
    // final answer may live in reasoning fields when content is empty
    if (!text) {
        text = message.reasoning_content || message.reasoning || "";
    }

    // Strip leaked <think> blocks from reasoning models
    if (typeof text === 'string' && text.includes('<think>')) {
        text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    return { text: text || "" };
};
