
import React, { useRef, useState, useEffect } from 'react';
import { TrashIcon, DownloadIcon } from './icons';
import { getPacificTimeDateStr } from './utils';

interface ProjectManagerProps {
    projectName: string;
    setProjectName: (name: string) => void;
    handleSaveProject: () => void;
    handleLoadProject: (file: File) => void;
    storageUsage: { used: string; percentage: number };
    setShowClearAllProjectsConfirm: (show: boolean) => void;
    savedProjects: string[];
    handleDeleteProject: (name: string) => void;
    autoSaveEnabled: boolean;
    setAutoSaveEnabled: (val: boolean) => void;
    aiTaskModels?: Record<string, string>;
    apiProvider?: string;
    isOpenRouterPaid?: boolean;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
    projectName,
    setProjectName,
    handleSaveProject,
    handleLoadProject,
    setShowClearAllProjectsConfirm,
    autoSaveEnabled,
    setAutoSaveEnabled,
    aiTaskModels,
    apiProvider,
    isOpenRouterPaid
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleLoadProject(file);
        }
        // Reset so same file can be selected again
        if (event.target) event.target.value = '';
    };

    return (
        <div className="card project-card">
            <h2>Project Management (Local File)</h2>
            <p className="description">Save your entire project (script, images, audio) as a file to your computer.</p>
            <div className="project-actions-top">
                <div className="input-group">
                    <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                        placeholder="Enter Project Name" 
                    />
                    <button onClick={handleSaveProject} disabled={!projectName.trim()} title="Download project file to computer">
                        <DownloadIcon /> Save to Disk
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onFileChange} 
                        accept=".json,.uaa" 
                        style={{display: 'none'}}
                    />
                    <button onClick={() => fileInputRef.current?.click()} title="Load project file from computer">
                        Load from Disk
                    </button>
                </div>
            </div>
            
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button onClick={() => setShowClearAllProjectsConfirm(true)} className="clear-storage-btn" title="Clear all browser-cached projects">
                    <TrashIcon/> Clear Browser Cache
                </button>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '6px', color: '#eab308', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <p style={{ margin: 0, lineHeight: 1.4 }}>
                        <strong style={{ color: '#FFD700', fontSize: '1rem' }}>Note:</strong> When starting a new project, please click here to clear cache and avoid data conflicts with your previous projects.
                    </p>
                </div>
                
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Auto Save Project</h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Automatically backs up your work every 10 seconds. Disable this if your PC has low RAM or faces lag.</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem', padding: '0.5rem 1rem', backgroundColor: autoSaveEnabled ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-main)', borderRadius: '8px', border: autoSaveEnabled ? '1px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s', alignSelf: 'center' }}>
                        <input 
                            type="checkbox" 
                            checked={autoSaveEnabled} 
                            onChange={(e) => setAutoSaveEnabled(e.target.checked)} 
                            style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: 'var(--primary)', margin: 0 }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: autoSaveEnabled ? 'var(--primary)' : 'var(--text-secondary)' }}>
                            {autoSaveEnabled ? "ON" : "OFF"}
                        </span>
                    </label>
                </div>

                {/* Live API Quota & Usage Counter */}
                {(() => {
                    const [stats, setStats] = useState({ requests: 0, tokens: 0 });
                    const [timeLeft, setTimeLeft] = useState('');

                    useEffect(() => {
                        const updateStats = () => {
                            const today = getPacificTimeDateStr();
                            let reqs = 0;
                            const tkns = parseInt(localStorage.getItem(`ai_daily_tokens_${today}`) || '0');
                            
                            if (apiProvider === 'google' || apiProvider === 'google_gemini') {
                                reqs = parseInt(localStorage.getItem(`ai_daily_requests_${today}`) || '0');
                            } else if (apiProvider === 'openrouter') {
                                reqs = parseInt(localStorage.getItem(`OR_req_count_${today}`) || '0');
                            } else {
                                // Fallback
                                reqs = parseInt(localStorage.getItem(`ai_daily_requests_${today}`) || localStorage.getItem(`OR_req_count_${today}`) || '0');
                            }
                            
                            setStats({ requests: reqs, tokens: tkns });
                        };
                        
                        const updateCountdown = () => {
                            const now = new Date();
                            const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
                            const diffMs = utcMidnight.getTime() - now.getTime();
                            
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
                            
                            setTimeLeft(`${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
                        };

                        updateStats();
                        updateCountdown();
                        
                        const interval = setInterval(() => {
                            updateStats();
                            updateCountdown();
                        }, 1000);
                        
                        return () => clearInterval(interval);
                    }, [apiProvider, isOpenRouterPaid]);

                    const hasProModel = aiTaskModels && Object.values(aiTaskModels).some((modelVal: unknown) => 
                        typeof modelVal === 'string' && modelVal.includes('pro')
                    );

                    const getTargetLimit = () => {
                        if (apiProvider === 'google' || apiProvider === 'google_gemini') {
                            return 1500;
                        } else if (apiProvider === 'openrouter') {
                            return isOpenRouterPaid ? 1000 : 50; 
                        }
                        return 1500;
                    };

                    return (
                        <div style={{
                            marginTop: '1.25rem',
                            padding: '1rem',
                            backgroundColor: 'rgba(0, 229, 255, 0.03)',
                            border: '1px solid rgba(0, 229, 255, 0.15)',
                            borderRadius: '8px',
                            boxShadow: '0 0 15px rgba(0, 229, 255, 0.03)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>📊</span>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        লাইভ API কোটা ও লিমিট ট্র্যাকার
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.15rem 0.4rem',
                                            backgroundColor: 'rgba(0, 229, 255, 0.15)',
                                            borderRadius: '10px',
                                            color: 'var(--primary)',
                                            fontWeight: 'normal'
                                        }}>LIVE</span>
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>রিয়েল-টাইম ব্যবহৃত রিকোয়েস্ট ও টোকেন কাউন্ট</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                                {/* Daily Requests */}
                                <div style={{
                                    padding: '0.6rem',
                                    backgroundColor: 'var(--bg-main)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.15rem' }}>আজকের রিকোয়েস্ট</span>
                                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                        {stats.requests} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.6 }}>/ {apiProvider === 'custom' ? 'Provider Limit' : getTargetLimit()}</span>
                                    </strong>
                                    <div style={{
                                        width: '100%',
                                        height: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        marginTop: '0.35rem',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: apiProvider === 'custom' ? '100%' : `${Math.min(100, (stats.requests / getTargetLimit()) * 100)}%`,
                                            height: '100%',
                                            backgroundColor: apiProvider === 'custom' ? '#60a5fa' : (stats.requests > (getTargetLimit() * 0.8) ? '#e53935' : 'var(--primary)'),
                                            transition: 'width 0.3s ease-out'
                                        }} />
                                    </div>
                                </div>

                                {/* Used Tokens */}
                                <div style={{
                                    padding: '0.6rem',
                                    backgroundColor: 'var(--bg-main)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.15rem' }}>আনুমানিক টোকেন</span>
                                    <strong style={{ fontSize: '1.05rem', color: stats.tokens > 1000000 ? '#f87171' : 'var(--text-primary)', textShadow: '0 0 6px rgba(0, 229, 255, 0.1)' }}>
                                        {stats.tokens.toLocaleString()}
                                    </strong>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem', opacity: 0.8 }}>
                                        {hasProModel ? '💎 Pro multiplier active' : '⚡ Flat Flash pricing'}
                                    </span>
                                </div>
                            </div>

                            {/* Reset Countdown */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                marginBottom: '0.85rem',
                                fontSize: '0.8rem'
                            }}>
                                <span style={{ color: 'var(--text-secondary)' }}>কোটা রিসেট হতে বাকি (UTC):</span>
                                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{timeLeft}</strong>
                            </div>

                            {/* Safe Limits Dynamic Guidelines Box */}
                            {apiProvider === 'openrouter' ? (
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: hasProModel ? 'rgba(139, 92, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                    border: `1px solid ${hasProModel ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.4'
                                }}>
                                    <h5 style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasProModel ? '#8b5cf6' : '#34d399' }}>
                                        {hasProModel ? '⚡ ওপেন-রাউটার পেইড লিমিট' : '✅ ওপেন-রাউটার ফ্রি লিমিট'}
                                    </h5>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                                        {hasProModel 
                                            ? 'আপনার ক্রেডিট-যুক্ত অ্যাকাউন্টের মাধ্যমে আপনি দৈনিক ১০০০টি পর্যন্ত রিকোয়েস্ট নিরবচ্ছিন্নভাবে পাঠাতে পারবেন। পেলোড সেফটির জন্য স্পিড লিমিট ২০ RPM-এ ফিক্সড করা আছে।' 
                                            : 'ওপেন-রাউটারের ফ্রি টায়ারে মডেলের ওপর ভিত্তি করে দৈনিক ৫০ থেকে ২০০টি রিকোয়েস্ট পাঠানো যায়। রেট-লিমিট এরর এড়াতে আপনার স্পিড লিমিট ২০ RPM-এ সেফলি নিয়ন্ত্রিত আছে।'}
                                    </p>
                                </div>
                            ) : apiProvider === 'custom' ? (
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.4'
                                }}>
                                    <h5 style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa' }}>
                                        🌐 কাস্টম রাউটার সক্রিয়
                                    </h5>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                                        যেহেতু আপনি একটি Custom API ব্যবহার করছেন, তাই ডেইলি রেট-লিমিট আপনার প্রোভাইডারের (Groq, Nara ইত্যাদি) উপর নির্ভর করবে। অ্যাপ শুধুমাত্র আপনার আজকের ব্যবহৃত রিকোয়েস্ট ট্র্যাকিং করবে।
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: hasProModel ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                    border: `1px solid ${hasProModel ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.4'
                                }}>
                                    <h5 style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasProModel ? '#f87171' : '#34d399' }}>
                                        {hasProModel ? '⚠️ প্রো মডেল সেটিংস ওয়ার্নিং' : '✅ আদর্শ ফ্রি মডেল সেটিংস সক্রিয়'}
                                    </h5>
                                    <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                                        {hasProModel 
                                            ? 'উচ্চমানের ১০-১২ মিনিটের ভিডিও রিমেক, ভিডিও এনালাইসিস বা স্ক্রিপ্ট ডিকোড করা যাবে। প্রো ব্যবহার করায় আপনার আজকের ফ্রি লিমিট মাত্র ৫০টি রিকোয়েস্টের সীমাবদ্ধ। শুধুমাত্র ইমেজ বা ভিডিও প্রম্পট তৈরিতে স্ক্রিপ্ট এনালাইসিস দিলে ১২-১৩টি প্রম্পটেই কোটা শেষ হতে পারে। দ্রুত শেষ হওয়া এড়াতে Gemini 3.5 Flash ব্যবহার করুন।'
                                            : 'জেমিনি ৩.৫ ফ্ল্যাশ সক্রিয় থাকায় আপনি অত্যন্ত দ্রুত গতিতে নিরবচ্ছিন্নভাবে কাজ করতে পারবেন। এর মাধ্যমে আপনি প্রায় ৫০ মিনিট পর্যন্ত ভয়েস জেনারেশন স্ক্রিপ্ট তৈরি করতে পারবেন (সেফ লিমিট ৩০ মিনিট)। প্রম্পট জেনারেশন বা এনালাইসিসের ক্ষেত্রে দৈনিক সর্বোচ্চ ১৫০০টি রিকোয়েস্ট ফ্লেক্সিবল ভাবে ব্যবহারের সুযোগ রয়েছে।'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
