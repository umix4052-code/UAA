import React from 'react';
import { Notification, SceneResult, PromptGenerationProgress } from './types';

interface StatusIndicatorsProps {
    notifications: Notification[];
    isLoading: boolean;
    isBatchGenerating: boolean;
    results: SceneResult[];
    isGlobalBusy: boolean;
    promptGenerationProgress?: PromptGenerationProgress | null;
    chunkProcessingProgress?: { currentChunk: number, totalChunks: number, progress: number, message: string } | null;
    rateLimitCountdown?: string | null;
}

export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
    notifications,
    isLoading,
    isBatchGenerating,
    results,
    isGlobalBusy,
    promptGenerationProgress,
    chunkProcessingProgress,
    rateLimitCountdown
}) => {
    // Specific message for top indicator
    let topBusyMessage: string | null = null;
    let isStalled = false;
    let activeProgress: { current: number, total: number } | null = null;

    if (chunkProcessingProgress) {
        topBusyMessage = chunkProcessingProgress.message;
        activeProgress = { current: chunkProcessingProgress.progress, total: 100 };
    } else if (promptGenerationProgress) {
        topBusyMessage = promptGenerationProgress.message;
        isStalled = promptGenerationProgress.isStalled || false;
        activeProgress = promptGenerationProgress;
    } else if (isLoading) {
        const completed = results.filter(r => r && r.imageStatus === 'completed').length;
        topBusyMessage = `Generating... ${completed} / ${results.length}`;
        activeProgress = results.length > 0 ? { current: completed, total: results.length } : null;
    } else if (isBatchGenerating) {
        topBusyMessage = "Processing Batch...";
    }

    // Generic flag for bottom indicator
    // Show if globally busy but no specific message is available for the top bar.
    const showGlobalBusyBar = isGlobalBusy && !topBusyMessage;

    return (
        <>
            <div className="notification-container">
                {notifications.map(n => (
                    <div key={n.id} className={`notification ${n.type === 'error' ? 'notif-error' : n.type === 'success' ? 'notif-success' : 'notif-info'}`}>{n.message}</div>
                ))}
            </div>
            
            {/* Top indicator for SPECIFIC tasks */}
            {topBusyMessage && (
                <div 
                    className="progress-indicator"
                    style={isStalled ? { backgroundColor: '#FFA726', color: '#000' } : {}}
                >
                    <div className="progress-indicator-content">
                        <span>{topBusyMessage}</span>
                        <span className="progress-indicator-wait">Please Wait...</span>
                    </div>
                    {activeProgress && activeProgress.total > 0 && (
                        <div className="progress-indicator-bar-container">
                            <div 
                                className="progress-indicator-bar-fill" 
                                style={{ width: `${Math.min(100, Math.max(0, (activeProgress.current / activeProgress.total) * 100))}%` }}
                            ></div>
                        </div>
                    )}
                    {rateLimitCountdown && (
                        <div style={{ marginTop: '8px', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#eab308', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                            {rateLimitCountdown}
                        </div>
                    )}
                </div>
            )}
            {!topBusyMessage && rateLimitCountdown && (
                <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '6px 16px', borderRadius: '4px', zIndex: 9999, fontWeight: 'bold', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '0.85rem' }}>
                    {rateLimitCountdown}
                </div>
            )}

            {/* Bottom indicator for GENERIC busy state */}
            {showGlobalBusyBar && (
                <div className="global-progress-bar-container">
                    <div className="global-progress-bar"></div>
                    <div className="global-progress-text">AI IS PROCESSING...</div>
                </div>
            )}
        </>
    );
};