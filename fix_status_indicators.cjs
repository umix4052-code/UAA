const fs = require('fs');
let code = fs.readFileSync('status-indicators.tsx', 'utf-8');

const searchPropsStr = `    promptGenerationProgress?: PromptGenerationProgress | null;
    chunkProcessingProgress?: { currentChunk: number, totalChunks: number, progress: number, message: string } | null;
}`;

const replacePropsStr = `    promptGenerationProgress?: PromptGenerationProgress | null;
    chunkProcessingProgress?: { currentChunk: number, totalChunks: number, progress: number, message: string } | null;
    rateLimitCountdown?: string | null;
}`;

code = code.split(searchPropsStr).join(replacePropsStr);

const searchArgsStr = `    promptGenerationProgress,
    chunkProcessingProgress
}) => {`;

const replaceArgsStr = `    promptGenerationProgress,
    chunkProcessingProgress,
    rateLimitCountdown
}) => {`;

code = code.split(searchArgsStr).join(replaceArgsStr);

const searchRenderStr = `                    {activeProgress && activeProgress.total > 0 && (
                        <div className="progress-indicator-bar-container">
                            <div 
                                className="progress-indicator-bar-fill" 
                                style={{ width: \`\${Math.min(100, Math.max(0, (activeProgress.current / activeProgress.total) * 100))}%\` }}
                            ></div>
                        </div>
                    )}
                </div>
            )}`;

const replaceRenderStr = `                    {activeProgress && activeProgress.total > 0 && (
                        <div className="progress-indicator-bar-container">
                            <div 
                                className="progress-indicator-bar-fill" 
                                style={{ width: \`\${Math.min(100, Math.max(0, (activeProgress.current / activeProgress.total) * 100))}%\` }}
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
            )}`;

code = code.split(searchRenderStr).join(replaceRenderStr);

fs.writeFileSync('status-indicators.tsx', code);
console.log("Replaced in status-indicators.tsx");
