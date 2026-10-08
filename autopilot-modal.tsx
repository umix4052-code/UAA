
import React from 'react';
import { MasterAutopilotIcon, CheckIcon, ErrorIcon } from './icons';
import { formatTime } from './utils';

interface AutopilotStep {
    id: number;
    text: string;
}

interface AutopilotProgress {
    step: number;
    totalSteps: number;
    stepId: number;
    message: string;
    isError: boolean;
}

interface AutopilotModalProps {
    isVisible: boolean;
    onClose: () => void;
    autopilotProgress: AutopilotProgress | null;
    autopilotCompleted: boolean;
    autopilotElapsedTime: number;
    autopilotSteps: AutopilotStep[];
    generateUniqueStory: boolean;
    
    // Config State & Setters
    rephraseInAutopilot: boolean;
    setRephraseInAutopilot: (val: boolean) => void;
    
    // NEW: Refine Story Config
    refineStoryInAutopilot: boolean;
    setRefineStoryInAutopilot: (val: boolean) => void;

    // NEW: Analyze Script Config (Now optional)
    analyzeScriptInAutopilot: boolean;
    setAnalyzeScriptInAutopilot: (val: boolean) => void;

    useAiToAutoConfigureVoiceover: boolean;
    setUseAiToAutoConfigureVoiceover: (val: boolean) => void;
    useUserSelectedVoiceInAutopilot: boolean;
    setUseUserSelectedVoiceInAutopilot: (val: boolean) => void;
    autopilotVoiceGender: 'any' | 'male' | 'female';
    setAutopilotVoiceGender: (val: 'any' | 'male' | 'female') => void;
    
    // Actions
    isAutopilotPaused: boolean;
    onStart: () => void;
    onStop: () => void;
    onPauseResume: () => void;
    onSkip: () => void;
    onRetry: () => void;
    onReset: () => void;
}

export const AutopilotModal: React.FC<AutopilotModalProps> = ({
    isVisible, onClose, autopilotProgress, autopilotCompleted, autopilotElapsedTime,
    autopilotSteps, generateUniqueStory,
    rephraseInAutopilot, setRephraseInAutopilot,
    refineStoryInAutopilot, setRefineStoryInAutopilot,
    analyzeScriptInAutopilot, setAnalyzeScriptInAutopilot,
    useAiToAutoConfigureVoiceover, setUseAiToAutoConfigureVoiceover,
    useUserSelectedVoiceInAutopilot, setUseUserSelectedVoiceInAutopilot,
    autopilotVoiceGender, setAutopilotVoiceGender,
    isAutopilotPaused, onStart, onStop, onPauseResume, onSkip, onRetry, onReset
}) => {
    if (!isVisible) return null;

    const autopilotProgressPercentage = autopilotCompleted ? 1 : autopilotProgress ? (autopilotProgress.step - 1) / autopilotProgress.totalSteps : 0;
    const autopilotProgressText = autopilotCompleted ? '100%' : autopilotProgress ? `${Math.round(((autopilotProgress.step - 1) / autopilotProgress.totalSteps) * 100)}%` : '0%';
    
    const dynamicAutopilotSteps = autopilotSteps.map(step => { 
        if (step.id === 1) { 
            if (refineStoryInAutopilot) return { ...step, text: 'Refine Story (AI Rewriter)' };
            return { ...step, text: generateUniqueStory ? 'Generate New Unique Story' : 'Rephrase Script for Copyright' }; 
        }
        return step; 
    });

    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content autopilot-modal-content">
                <div className="autopilot-header">
                    <h3><MasterAutopilotIcon /> Master Autopilot</h3>
                    <div className="autopilot-timer-display">Elapsed Time: <strong>{formatTime(autopilotElapsedTime)}</strong></div>
                </div>
                <div className="autopilot-main-content">
                    <div className="autopilot-progress-status-container">
                        <div className="autopilot-progress-ring">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={(2 * Math.PI * 54) * (1 - autopilotProgressPercentage)} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }} />
                            </svg>
                            <div className="autopilot-progress-text">{autopilotProgressText}</div>
                        </div>
                        <div className="autopilot-workflow">
                            <ol>
                                {dynamicAutopilotSteps.map(step => { 
                                    // Step 1 is conditional
                                    const isStep1Active = step.id === 1 && (rephraseInAutopilot || refineStoryInAutopilot || generateUniqueStory);
                                    // Step 2 is conditional: Enabled if Analyze Script is active.
                                    const isStep2Active = step.id === 2 && analyzeScriptInAutopilot;
                                    // Step 3 is conditional: Voice Config
                                    const isStep3Active = step.id === 3 && useAiToAutoConfigureVoiceover;
                                    
                                    // Other steps are enabled unless specific logic (like 2/3)
                                    const isEnabled = (step.id === 1 ? isStep1Active : step.id === 2 ? isStep2Active : step.id === 3 ? isStep3Active : true);

                                    if (!isEnabled) return null; 
                                    
                                    const isCompleted = autopilotCompleted || (autopilotProgress ? step.id < autopilotProgress.stepId : false); 
                                    const isActive = autopilotProgress ? step.id === autopilotProgress.stepId && !autopilotCompleted && !autopilotProgress.isError : false; 
                                    const isError = autopilotProgress ? step.id === autopilotProgress.stepId && autopilotProgress.isError : false; 
                                    let className = ''; 
                                    if (isCompleted) className = 'completed'; 
                                    if (isActive) className = 'active'; 
                                    if (isError) className = 'error';
                                    return ( 
                                        <li key={step.id} className={className}> 
                                            {isCompleted ? <CheckIcon /> : <div className="step-placeholder-icon"></div>} 
                                            {step.text} 
                                        </li> 
                                    );
                                })}
                            </ol>
                        </div>
                    </div>
                    <div className="autopilot-controls-config-panel">
                        <div className="autopilot-config-box">
                             <div className="config-item-autopilot"> 
                                <input 
                                    type="checkbox" 
                                    id="refine-autopilot" 
                                    checked={refineStoryInAutopilot} 
                                    onChange={(e) => {
                                        setRefineStoryInAutopilot(e.target.checked);
                                        if(e.target.checked) setRephraseInAutopilot(false); // Mutually exclusive
                                    }} 
                                    disabled={!!autopilotProgress}
                                /> 
                                <label htmlFor="refine-autopilot">Refine Story with AI (10 Angles)</label> 
                            </div>
                            <div className="config-item-autopilot"> 
                                <input 
                                    type="checkbox" 
                                    id="rephrase-autopilot" 
                                    checked={rephraseInAutopilot} 
                                    onChange={(e) => {
                                        setRephraseInAutopilot(e.target.checked);
                                        if(e.target.checked) setRefineStoryInAutopilot(false);
                                    }} 
                                    disabled={!!autopilotProgress}
                                /> 
                                <label htmlFor="rephrase-autopilot">{generateUniqueStory ? 'Generate New Unique Story' : 'Rephrase Script for Copyright'}</label> 
                            </div>
                            
                             <div className="config-item-autopilot"> 
                                <input 
                                    type="checkbox" 
                                    id="analyze-autopilot" 
                                    checked={analyzeScriptInAutopilot} 
                                    onChange={(e) => setAnalyzeScriptInAutopilot(e.target.checked)} 
                                    disabled={!!autopilotProgress}
                                /> 
                                <label htmlFor="analyze-autopilot">Analyze Script for Characters</label> 
                            </div>

                            <div className="config-item-autopilot"> 
                                <input 
                                    type="checkbox" 
                                    id="auto-config-voice-autopilot" 
                                    checked={useAiToAutoConfigureVoiceover} 
                                    onChange={(e) => setUseAiToAutoConfigureVoiceover(e.target.checked)} 
                                    disabled={!!autopilotProgress}
                                /> 
                                <label htmlFor="auto-config-voice-autopilot">Auto-Configure Voiceover</label> 
                            </div>
                            <div className="config-item-autopilot sub-option-autopilot" style={{marginLeft: '1.5rem'}}> 
                                <input 
                                    type="checkbox" 
                                    id="use-user-voice-autopilot" 
                                    checked={useUserSelectedVoiceInAutopilot} 
                                    onChange={(e) => setUseUserSelectedVoiceInAutopilot(e.target.checked)} 
                                    disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}
                                /> 
                                <label htmlFor="use-user-voice-autopilot">Use User Selected Voice</label> 
                            </div>
                        </div>
                        <div className="autopilot-config-box voice-gender-box">
                            <p className="config-title">Voice Gender Preference:</p>
                            <div className="autopilot-voice-pref-radios"> 
                                <label><input type="radio" name="autopilot-gender" value="any" checked={autopilotVoiceGender === 'any'} onChange={(e) => setAutopilotVoiceGender(e.target.value as 'any' | 'male' | 'female')} disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}/> Any</label> 
                                <label><input type="radio" name="autopilot-gender" value="male" checked={autopilotVoiceGender === 'male'} onChange={(e) => setAutopilotVoiceGender(e.target.value as 'any' | 'male' | 'female')} disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}/> Male</label> 
                                <label><input type="radio" name="autopilot-gender" value="female" checked={autopilotVoiceGender === 'female'} onChange={(e) => setAutopilotVoiceGender(e.target.value as 'any' | 'male' | 'female')} disabled={!!autopilotProgress || !useAiToAutoConfigureVoiceover}/> Female</label> 
                            </div>
                        </div>
                    </div>
                </div>
                {autopilotProgress && ( 
                    <div className={`autopilot-current-step-status ${autopilotProgress.isError ? 'error' : ''} ${autopilotCompleted ? 'completed' : ''}`}> 
                        <div className="status-indicator-bar"> 
                            {autopilotCompleted ? <CheckIcon/> : autopilotProgress.isError ? <ErrorIcon/> : <div className="loader small-loader"></div>} 
                        </div> 
                        <span style={{ flexGrow: 1 }}>
                            <strong>{autopilotCompleted ? 'Master Autopilot Complete!' : `Step ${autopilotProgress.step}/${autopilotProgress.totalSteps}: ${dynamicAutopilotSteps.find(s => s.id === autopilotProgress.stepId)?.text || '...'}`}</strong><br/>
                            {autopilotProgress.message}
                        </span> 
                        {autopilotProgress && !autopilotCompleted && !autopilotProgress.isError && ( 
                            <button onClick={onSkip} style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--border)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }} title="Skip this stage and move to the next one"> Skip This Stage </button> 
                        )} 
                    </div> 
                )}
                <div className="confirmation-modal-actions"> 
                    <button onClick={onClose} className="cancel-btn"> 
                        {autopilotProgress && !autopilotCompleted && !autopilotProgress.isError ? 'Hide' : 'Close'} 
                    </button> 
                    {autopilotCompleted ? ( 
                        <button onClick={onReset} className="confirm-btn">OK</button> 
                    ) : autopilotProgress && autopilotProgress.isError ? ( 
                        <> 
                            <button onClick={onStop} className="stop-button">Cancel Autopilot</button> 
                            <button onClick={onSkip} style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)', }} className="cancel-btn"> Skip This Stage </button> 
                            {(autopilotProgress.stepId === 4 || autopilotProgress.stepId === 7) && <button onClick={onRetry} className="confirm-btn">Retry & Resume</button>} 
                        </> 
                    ) : autopilotProgress ? ( 
                        <> 
                            <button onClick={onPauseResume} className="confirm-btn">{isAutopilotPaused ? 'Resume' : 'Pause'}</button> 
                            <button onClick={onStop} className="stop-button">Stop Autopilot</button> 
                        </> 
                    ) : ( 
                        <button onClick={onStart} className="confirm-btn"> Start Autopilot </button> 
                    )} 
                </div>
            </div>
        </div>
    );
};
