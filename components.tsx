import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, PauseIcon, PlayIcon, CopyIcon, CheckIcon, StopIcon, ErrorIcon } from './icons';
import { formatTime, getErrorMessageSummary } from './utils';
import { DetailedError, NotificationLogItem, StorySuggestion, ResumableTask } from './types';

// Custom Audio Player Component
export const AudioPlayer = ({ src, onDownload, title }: { src: string, onDownload: () => void, title?: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [hasError, setHasError] = useState(false);

    // Reset state when src changes to prevent playing old audio state on new track
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setHasError(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.load();
        }
    }, [src]);

    const handlePlayPause = () => {
        if (audioRef.current && !hasError) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch(error => {
                            console.error("Playback failed:", error);
                            setIsPlaying(false);
                            setHasError(true);
                        });
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setHasError(false);
        }
    };
    
    const handleErrorEvent = () => {
        console.error("Audio source error");
        setHasError(true);
        setIsPlaying(false);
    };
    
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current && !hasError) {
            const time = Number(e.target.value);
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return (
        <div className="custom-audio-player">
             <audio
                ref={audioRef}
                src={src || undefined}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleErrorEvent}
            />
            <button 
                onClick={handlePlayPause} 
                className="player-play-btn" 
                disabled={hasError}
                title={hasError ? "Audio Unavailable" : (isPlaying ? "Pause" : "Play")}
            >
                {hasError ? <ErrorIcon /> : (isPlaying ? <PauseIcon /> : <PlayIcon />)}
            </button>
            <div className="player-progress-bar-container">
                {title && <strong>{title}:&nbsp;</strong>}
                 <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="player-seek-slider"
                    disabled={hasError}
                />
                <span className="player-time-display">
                    {hasError ? "Error" : `${formatTime(currentTime)} / ${formatTime(duration)}`}
                </span>
            </div>
            <button onClick={onDownload} className="player-download-btn" title="Download Audio" disabled={hasError}>
                <DownloadIcon />
            </button>
        </div>
    );
};

// Confirmation Modal Component
export const ConfirmationModal = ({ onConfirm, onCancel, imageCount, isAutopilot, resumableTask, taskTypeForConfirmation, isAutoMode, completedCount, totalCount } : { onConfirm: (options: { discardPrevious?: boolean }) => void, onCancel: () => void, imageCount: number, isAutopilot: boolean, resumableTask: ResumableTask | null, taskTypeForConfirmation: ResumableTask['type'], isAutoMode?: boolean, completedCount?: number, totalCount?: number }) => {
    const isResuming = resumableTask && resumableTask.progress > 0;
    const isCorrectTaskType = isResuming && resumableTask.type === taskTypeForConfirmation;
    const isConflictingTask = isResuming && !isCorrectTaskType;

    const remainingCount = (totalCount !== undefined && completedCount !== undefined) 
        ? totalCount - completedCount 
        : (isResuming && resumableTask.imageCount) ? resumableTask.imageCount - resumableTask.progress : imageCount;

    const getTaskName = (type: ResumableTask['type']) => {
        switch (type) {
            case 'auto_scene_gen': return 'Image Generation';
            case 'video_prompt_gen': return 'Video Prompt Generation';
            case 'visual_remake': return 'Visual Remake';
            default: return 'task';
        }
    };

    if (isConflictingTask) {
        return (
            <div className="confirmation-modal-overlay">
                <div className="confirmation-modal-content">
                    <h3>⚠️ Task Conflict</h3>
                    <p>You have an unfinished &quot;<strong>{getTaskName(resumableTask!.type)}</strong>&quot; task.</p>
                    <p>Starting a new {getTaskName(taskTypeForConfirmation)} task will discard the 'Resume' memory of the previous task. Don't worry, your already generated cards will remain safe. Do you want to proceed?</p>
                    <div className="confirmation-modal-actions">
                        <button onClick={onCancel} className="cancel-btn">Cancel</button>
                        <button onClick={() => onConfirm({ discardPrevious: true })} className="confirm-btn delete-confirm-btn">Discard & Proceed</button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content">
                <h3>{isCorrectTaskType || (completedCount !== undefined && completedCount > 0) ? 'Resume Generation?' : 'Confirm Generation'}</h3>
                {isCorrectTaskType ? (
                    <p>You have an unfinished task. Do you want to resume generating the remaining <strong>{remainingCount} items</strong>?</p>
                ) : (completedCount !== undefined && totalCount !== undefined && completedCount > 0) ? (
                    <p>You have <strong>{completedCount}</strong> items generated out of <strong>{totalCount}</strong>. Do you want to generate the remaining <strong>{totalCount - completedCount}</strong> items?</p>
                ) : (
                    <p>
                        {isAutoMode 
                            ? "You are about to automatically generate prompts based on your script. This may take some time."
                            : (
                                taskTypeForConfirmation === 'video_prompt_gen'
                                ? <>You are about to generate video prompts for <strong>{imageCount} scenes</strong>. This may take some time.</>
                                : taskTypeForConfirmation === 'visual_remake'
                                ? <>You are about to remake <strong>{imageCount} images</strong>. This may take some time.</>
                                : <>You are about to generate prompts and <strong>{imageCount} images</strong>. This may take some time.</>
                            )
                        }
                    </p>
                )}
                {isAutopilot && <p className="autopilot-warning"><strong>Autopilot is ON.</strong> The app will download the ZIP/prompts when complete.</p>}
                <div className="confirmation-modal-actions">
                    <button onClick={onCancel} className="cancel-btn">Cancel</button>
                    <button onClick={() => onConfirm({})} className="confirm-btn">{isCorrectTaskType || (completedCount !== undefined && completedCount > 0) ? 'Confirm & Resume' : 'Confirm & Generate'}</button>
                </div>
            </div>
        </div>
    );
};


export const RateLimitDecisionModal = ({ provider, onWait, onCancel }: { provider: string, onWait: () => void, onCancel: () => void }) => {
    const isOR = provider.toLowerCase().includes('openrouter');
    const isGemini = provider.toLowerCase().includes('gemini');

    return (
        <div className="confirmation-modal-overlay" style={{ zIndex: 9999 }}>
            <div className="confirmation-modal-content" style={{ maxWidth: '500px' }}>
                <h3 style={{ color: '#eab308', marginBottom: '10px' }}>⏳ {provider} রেট লিমিট/কোটা এ্যালার্ট!</h3>
                {isOR ? (
                    <>
                        <p style={{ fontSize: '15px', marginBottom: '10px', lineHeight: '1.4' }}>
                            ওপেন রাউটারের কোটা শেষ বা রেট লিমিট হয়ে গেছে। <strong>ফ্রি ইউজার</strong> হিসেবে দিনে 50 টি রিকোয়েস্ট করা যায়।
                        </p>
                        <p style={{ fontSize: '15px', marginBottom: '15px', lineHeight: '1.4' }}>
                            যদি আপনি <strong>পেইড ইউজার</strong> হন (দিনে ১০০০ রিকোয়েস্ট), তবে আপনাকে ১০ মিনিট অপেক্ষা করতে হবে। আপনি কি ১০ মিনিট অপেক্ষা করতে রাজি আছেন?
                        </p>
                        <p style={{ fontSize: '14px', marginBottom: '15px', lineHeight: '1.4', color: '#38bdf8' }}>
                            <strong>নোট:</strong> অথবা আপনি মডেল পরিবর্তন করে দেখতে পারেন, কারণ অনেক সময় সার্ভারে লোড বেশি থাকলে কিছু মডেল সাময়িকভাবে কাজ নাও করতে পারে।
                        </p>
                    </>
                ) : (
                    <p style={{ fontSize: '15px', marginBottom: '15px', lineHeight: '1.4' }}>
                        এই মডেল দিয়ে ইউজ করতে গেলে তোমাকে ১০ মিনিট ওয়েট করতে হবে। তুমি কি রাজি আছো? রাজি থাকলে 'Yes, Wait 10 Minutes' চাপো, আর না হলে প্রোসেস স্টপ করে অন্য মডেল সিলেক্ট করো।
                    </p>
                )}
                
                {isOR && (
                    <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '15px' }}>
                         <p style={{ fontSize: '14px', margin: 0, color: '#fbbf24' }}>
                            "Yes" চাপলে টাইমার শুরু হবে, "Stop" চাপলে প্রসেস স্টপ হবে।
                         </p>
                    </div>
                )}
                {isGemini && (
                    <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '15px' }}>
                         <p style={{ fontSize: '14px', margin: 0, color: '#fbbf24' }}>
                            জেমিনির ক্ষেত্রে কোটা প্রবলেম করলে ওপেন রাউটার দিয়ে কাজ করো।
                         </p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={onWait} className="primary-btn" style={{ flex: 1, padding: '10px', background: '#eab308', color: '#111827', border: 'none' }}>Yes, Wait 10 Minutes</button>
                    <button onClick={onCancel} className="secondary-btn" style={{ flex: 1, padding: '10px', background: '#e11d48', color: 'white', border: 'none' }}>Stop</button>
                </div>
            </div>
        </div>
    );
};

// Master Quota Limit Modal
export const QuotaLimitModal = ({ 
    onOk, 
    onSwitchToCustom, 
    limitType,
    isEnvKey,
    providerName = 'API'
}: { 
    onOk: () => void, 
    onSwitchToCustom?: () => void,
    limitType: 'minute' | 'daily' | 'unknown',
    isEnvKey: boolean,
    providerName?: string
}) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [dailyResetTime, setDailyResetTime] = useState('');

    useEffect(() => {
        let timer: number | null = null;
        if (limitType === 'minute') {
            timer = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (timer) clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (limitType === 'daily') {
            const now = new Date();
            const ptString = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
            const ptDate = new Date(ptString);
            ptDate.setHours(24, 0, 0, 0); 
            const msUntilMidnightPT = ptDate.getTime() - new Date(ptString).getTime();
            const localResetDate = new Date(now.getTime() + msUntilMidnightPT);
            setDailyResetTime(localResetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Local Time)");
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [limitType]);

    // Format time left for minute
    const formatMinutes = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Calculate percentage for circular progress
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / 60) * circumference;

    const isOR = providerName.toLowerCase().includes('openrouter');
    const isGemini = providerName.toLowerCase().includes('gemini') || isEnvKey;

    return (
        <div className="confirmation-modal-overlay" style={{zIndex: 3000}}>
            <div className="confirmation-modal-content" style={{border: '2px solid #F39C12', boxShadow: '0 0 30px rgba(243, 156, 18, 0.5)'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                    <ErrorIcon />
                    <h3 style={{color: '#F39C12', marginTop: 0}}>API কোটা লিমিট শেষ</h3>
                </div>
                
                {limitType === 'minute' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0' }}>
                        <p style={{fontSize: '1.1rem', textAlign: 'center', lineHeight: '1.4'}}>
                            এই মিনিটের জন্য লিমিট ওভার হয়ে গেছে। দয়া করে টাইমার শেষ হওয়া পর্যন্ত অপেক্ষা করো।
                        </p>
                        <div style={{ position: 'relative', width: '100px', height: '100px', marginTop: '1rem' }}>
                            <svg className="circular-chart" width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r={radius} fill="none" stroke="#2c3e50" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r={radius} 
                                    fill="none" stroke="#F39C12" strokeWidth="8" 
                                    strokeDasharray={circumference} 
                                    strokeDashoffset={strokeDashoffset} 
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {formatMinutes(timeLeft)}
                            </div>
                        </div>
                    </div>
                )}

                {(limitType === 'daily' || limitType === 'unknown') && (
                    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                        {isOR && (
                            <>
                                <p style={{fontSize: '1.1rem', color: '#fbbf24', marginBottom: '10px', lineHeight: '1.4'}}>
                                    তুমি মনে হয় একটি পেইড মডেল (Custom Model) সিলেক্ট করেছ অথবা তোমার ডেইলি লিমিট শেষ হয়ে গেছে ওপেন রাউটারের আজকের জন্য! তুমি Gemini ইউজ করো।
                                </p>
                                <p style={{color: '#ccc', fontSize: '14px', lineHeight: '1.5', marginTop: '10px'}}>
                                    (ফ্রি ইউজাররা লিমিটেড রিকোয়েস্ট পায়। তুমি যদি ভুল করে কোন পেইড কাস্টম মডেল সিলেক্ট করে থাকো তাহলে সেটি পরিবর্তন করো। অথবা ওপেন রাউটারে $10 ডলার লোড করলে যে কোন মডেল ইউজ করতে পারবে!)
                                </p>
                            </>
                        )}
                        {isGemini && (
                            <>
                                <p style={{fontSize: '1.1rem', color: '#fbbf24', marginBottom: '10px', lineHeight: '1.4'}}>
                                    জেমিনির ক্ষেত্রে কোটা এবং ডেইলি লিমিট শেষ! দয়া করে ওপেন রাউটার দিয়ে কাজ করো।
                                </p>
                            </>
                        )}
                        
                        {limitType === 'daily' && (
                            <p className="description" style={{color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '4px', margin: '1rem 0', fontSize: '1rem'}}>
                                আগামীকাল আনুমানিক এই সময়ে আপনার কোটা রিসেট হবে:<br/>
                                <strong style={{ color: '#F39C12', fontSize: '1.2rem', display: 'block', marginTop: '0.5rem' }}>{dailyResetTime}</strong>
                            </p>
                        )}
                    </div>
                )}

                <div className="confirmation-modal-actions" style={{flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
                    {isEnvKey && onSwitchToCustom && (
                        <button onClick={onSwitchToCustom} className="confirm-btn" style={{backgroundColor: '#2ECC71', width: '100%', padding: '1rem'}}>
                            🔑 কাস্টম API কী কনফিগার করুন
                        </button>
                    )}
                    <button onClick={onOk} className="cancel-btn" style={{width: '100%'}}>
                        আমি বুঝতে পেরেছি
                    </button>
                </div>
            </div>
        </div>
    );
};

// Mismatch Warning Modal Component
export const MismatchWarningModal = ({ onConfirm, onCancel, fromModel, toModel }: { onConfirm: () => void; onCancel: () => void; fromModel: string; toModel: string; }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Prompt Mismatch Warning</h3>
            <p>Your video prompts were generated for the "<strong>{fromModel}</strong>" model, but you are about to generate videos with "<strong>{toModel}</strong>".</p>
            <p>The prompt style may not be optimal. You can cancel to review and edit the video prompts, or proceed with the generation anyway.</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel & Edit</button>
                <button onClick={onConfirm} className="confirm-btn">Proceed Anyway</button>
            </div>
        </div>
    </div>
);

// Delete Confirmation Modal Component
export const ProjectResetReminderModal = ({ onOk, onClearNow }: { onOk: () => void, onClearNow: () => void }) => (
    <div className="confirmation-modal-overlay" style={{zIndex: 3000}}>
        <div className="confirmation-modal-content" style={{maxWidth: '500px', borderLeft: '4px solid #F39C12'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F39C12'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                Important Reminder
            </h3>
            <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '1rem'}}>
                If you are starting a <strong>new project</strong> or pasting completely new content, please make sure to click the <strong style={{color: '#F39C12'}}>Clear All Projects</strong> or <strong>Reset</strong> button (the yellow text at the top right) first.
            </p>
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.8rem'}}>
                This clears previous cached settings, script, and images. If you are just continuing your current work, you can ignore this warning!
            </p>
            <div className="confirmation-modal-actions" style={{display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end'}}>
                <button onClick={onClearNow} className="cancel-btn" style={{backgroundColor: '#e74c3c', color: 'white', border: 'none'}}>
                    Clear Cache Now
                </button>
                <button onClick={onOk} className="confirm-btn">
                    OK, I Understand (Resume)
                </button>
            </div>
        </div>
    </div>
);

export const DeleteConfirmationModal = ({ projectName, onConfirm, onCancel } : { projectName: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Delete Project</h3>
            <p>Are you sure you want to permanently delete the project "<strong>{projectName}</strong>"?</p>
            <p>This action cannot be undone.</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel</button>
                <button onClick={onConfirm} className="confirm-btn delete-confirm-btn">Delete</button>
            </div>
        </div>
    </div>
);

// Clear All Projects Confirmation Modal Component
export const ClearAllProjectsConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
            <h3>Clear All Projects</h3>
            <p>Are you sure you want to permanently delete <strong>ALL</strong> saved projects from your browser?</p>
            <p>This action cannot be undone. Your settings and API keys will not be affected.</p>
            <div className="confirmation-modal-actions">
                <button onClick={onCancel} className="cancel-btn">Cancel</button>
                <button onClick={onConfirm} className="confirm-btn delete-confirm-btn">Confirm & Delete All</button>
            </div>
        </div>
    </div>
);

// LogViewer Component
export const LogViewer = React.forwardRef<HTMLDivElement, { title: string, icon: React.ReactElement, logs: (DetailedError | NotificationLogItem)[], onClear: () => void, type: 'error' | 'notification' }>(({ title, icon, logs, onClear, type }, ref) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);
    if (logs.length === 0) return null;

    const isErrorLog = (log: DetailedError | NotificationLogItem): log is DetailedError => type === 'error';

    const handleCopy = (log: DetailedError | NotificationLogItem) => {
        const textToCopy = isErrorLog(log)
            ? `--- TECHNICAL DETAILS FOR AI ---\nTimestamp: ${log.timestamp}\nProvider: ${log.provider || 'None'}\nModel: ${log.model || 'None'}\nOperation: ${log.operation}\nTitle: ${log.title}\nMessage: ${log.message}\n\nDetails:\n${log.details}\n---------------------------------`
            : `Timestamp: ${log.timestamp}\nProvider: ${log.provider || 'None'}\nModel: ${log.model || 'None'}\nMessage: ${log.message}`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(log.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCopyAll = () => {
        const textToCopy = logs.map(log => 
            isErrorLog(log)
                ? `--- TECHNICAL DETAILS FOR AI ---\nTimestamp: ${log.timestamp}\nProvider: ${log.provider || 'None'}\nModel: ${log.model || 'None'}\nOperation: ${log.operation}\nTitle: ${log.title}\nMessage: ${log.message}\n\nDetails:\n${log.details}\n---------------------------------`
                : `Timestamp: ${log.timestamp}\nProvider: ${log.provider || 'None'}\nModel: ${log.model || 'None'}\nMessage: ${log.message}`
        ).join('\n\n' + '='.repeat(40) + '\n\n');
        
        navigator.clipboard.writeText(textToCopy);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    return (
        <div ref={ref} className={`log-card ${type}-log-card card`}>
            <div className="log-header">
                <h3>{icon} {title} ({logs.length})</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCopyAll} className="clear-log-btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        {copiedAll ? 'Copied' : 'Copy All'} {copiedAll ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <button onClick={onClear} className="clear-log-btn">Clear Log</button>
                </div>
            </div>
            <div className="log-list">
                {logs.map(log => {
                    const summary = isErrorLog(log) ? getErrorMessageSummary(log) : null;
                    return (
                        <details key={`${log.id}-${log.timestamp}`} className="log-item" open style={{ position: 'relative' }}>
                             {isErrorLog(log) && (
                                <button
                                    onClick={() => handleCopy(log)}
                                    title="Copy Log Details"
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    {copiedId === log.id ? <CheckIcon /> : <CopyIcon />}
                                </button>
                            )}
                            <summary>
                                <span className="log-timestamp">{log.timestamp}</span>
                                {isErrorLog(log) && <strong className="log-operation">{log.operation}</strong>}
                                <span className="log-title">{isErrorLog(log) ? log.title : log.message}</span>
                            </summary>
                            
                            <div className="log-details">
                                {isErrorLog(log) && summary && (
                                    <div style={{
                                         background: 'rgba(255, 255, 255, 0.05)',
                                         border: '1px solid var(--border)',
                                         borderRadius: 'var(--base-radius)',
                                         padding: '0.75rem',
                                         margin: '0.75rem 0 0 0',
                                         fontSize: '0.9rem',
                                         whiteSpace: 'pre-wrap'
                                    }}>
                                        <p style={{ color: 'var(--text-primary)', marginBottom: '8px' }}><strong>What Happened:</strong> {summary?.explanation}</p>
                                        <p style={{ color: 'var(--primary)', fontWeight: 500 }}><strong>What To Do:</strong> {summary?.direction}</p>
                                    </div>
                                )}
                                
                                <div style={{ 
                                    display: 'flex', flexWrap: 'wrap', gap: '15px', 
                                    marginTop: isErrorLog(log) ? '0.75rem' : '0.25rem', 
                                    padding: isErrorLog(log) ? '0' : '5px 0',
                                    fontSize: '0.85rem', color: 'var(--text-secondary)' 
                                }}>
                                    <span><strong>Provider:</strong> <span style={{color: 'var(--primary)'}}>{log.provider || 'None'}</span></span>
                                    <span><strong>Model:</strong> <span style={{color: 'var(--primary)'}}>{log.model || 'None'}</span></span>
                                </div>

                                {isErrorLog(log) && (
                                    <>
                                        <p style={{ marginTop: '0.5rem' }}><strong>Message:</strong> {log.message}</p>
                                        {log.details && <pre><strong>Technical Details:</strong><code>{log.details}</code></pre>}
                                    </>
                                )}
                            </div>
                        </details>
                    )
                })}
            </div>
        </div>
    );
});
LogViewer.displayName = 'LogViewer';

// Brainstorming Modal (Pre-Refine)
interface BrainstormingModalProps {
    visible: boolean;
    progress: number;
    onStop: () => void;
}

export const BrainstormingModal: React.FC<BrainstormingModalProps> = ({ visible, progress, onStop }) => {
    if (!visible) return null;

    return (
        <div className="brainstorming-bar-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div className="brainstorming-bar-content" style={{
                width: '90%',
                maxWidth: '600px',
                backgroundColor: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: 'var(--base-radius)',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <h3 style={{ margin: 0, color: '#fff' }}>Brainstorming new story angles...</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#FFA500', fontWeight: 'bold', fontSize: '1.2rem' }}>{progress}%</span>
                        <button 
                            onClick={onStop} 
                            style={{ 
                                background: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem' 
                            }}
                        >
                            &times; Cancel
                        </button>
                     </div>
                </div>
                <div style={{ 
                    width: '100%', 
                    height: '12px', 
                    backgroundColor: '#333', 
                    borderRadius: '6px', 
                    overflow: 'hidden' 
                }}>
                    <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        backgroundColor: '#FFA500', 
                        borderRadius: '6px', 
                        transition: 'width 0.2s ease-out' 
                    }}></div>
                </div>
            </div>
        </div>
    );
};


// NEW: Refine Story Modal (Redesigned)
interface RefineStoryModalProps {
    suggestions: StorySuggestion[];
    onSelect: (suggestion: StorySuggestion) => void;
    onClose: () => void;
    isLoading: boolean;
}

export const RefineStoryModal: React.FC<RefineStoryModalProps> = ({ suggestions, onSelect, onClose, isLoading }) => {
    return (
        <div className="confirmation-modal-overlay" style={{zIndex: 2000}}>
            <div className="confirmation-modal-content refine-modal-content">
                <div className="refine-header">
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>Choose a New Story Angle</h3>
                    <button 
                        className="close-preview-btn" 
                        onClick={onClose}
                        style={{ color: '#888', fontSize: '1.5rem' }}
                    >&times;</button>
                </div>
                
                <div style={{ padding: '1rem 1.5rem 0.5rem', color: '#aaa', fontSize: '0.9rem' }}>
                    AI has analyzed your script and suggests these creative new angles. Select one to rewrite your story.
                </div>

                {isLoading ? (
                    <div className="refine-loading" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className="loader" style={{ margin: '0 auto' }}></div>
                        <p>Generating ideas...</p>
                    </div>
                ) : (
                    <div className="suggestions-grid">
                        {suggestions.map((s) => (
                            <div 
                                key={s.id} 
                                className="suggestion-card" 
                                onClick={() => onSelect(s)}
                            >
                                <div className="suggestion-en">
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{s.id}. {s.en_title} ({s.angle_type})</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, whiteSpace: 'pre-wrap' }}>{s.en_roadmap}</p>
                                </div>
                                <div className="suggestion-bn">
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{s.bn_title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, whiteSpace: 'pre-wrap' }}>{s.bn_roadmap}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Progress Modal
interface ProgressModalProps {
    visible: boolean;
    currentChunk: number;
    totalChunks: number;
    progress: number;
    message: string;
    onStop: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ visible, currentChunk, totalChunks, progress, message, onStop }) => {
    if (!visible) return null;
    
    return (
         <div className="progress-indicator-modal">
            <div className="progress-card">
                <h3>AI Story Refiner</h3>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
                </div>
                <div className="progress-stats">
                    <span>{progress}% Completed</span>
                    <span>Chunk {currentChunk} / {totalChunks}</span>
                </div>
                <p className="progress-message">{message}</p>
                <button className="stop-button" onClick={onStop}>
                    <StopIcon/> Stop Process
                </button>
            </div>
         </div>
    );
};

// Character Consistency Warning Modal
export const CharacterConsistencyModal = ({ onAccept, onDeny, onCancel, providerName = "OpenRouter" }: { onAccept: () => void, onDeny: () => void, onCancel: () => void, providerName?: string }) => (
    <div className="confirmation-modal-overlay" style={{zIndex: 3000}}>
        <div className="confirmation-modal-content" style={{ maxWidth: '450px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Auto-Generate Character Profiles?</h3>
            <p>You have selected <strong>{providerName}</strong>, but your Character Profile boxes are empty.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {providerName} cannot automatically detect and extract characters across the entire video. For perfect character consistency, we highly recommend using <strong>Google Gemini</strong> to auto-generate these profiles first.
            </p>
            <div className="confirmation-modal-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={onAccept} className="confirm-btn" style={{ width: '100%', padding: '0.75rem' }}>
                    Yes, Use Gemini (Recommended)
                </button>
                <button onClick={onDeny} className="cancel-btn" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    No, Continue with {providerName}
                </button>
                <button onClick={onCancel} className="cancel-btn" style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}>
                    Cancel
                </button>
            </div>
        </div>
    </div>
);
