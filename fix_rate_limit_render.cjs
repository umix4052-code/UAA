const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf-8');

const searchStr = `            {rateLimitCountdown && (
                <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '6px 16px', borderRadius: '4px', zIndex: 9999, fontWeight: 'bold', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '0.85rem' }}>
                    {rateLimitCountdown}
                </div>
            )}
            <StatusIndicators 
                notifications={notifications}
                isLoading={isLoading}
                isBatchGenerating={isBatchGenerating}
                results={results}
                isGlobalBusy={isGlobalBusy} 
                promptGenerationProgress={promptGenerationProgress} 
                chunkProcessingProgress={chunkProcessingProgress}
            />`;

const replaceStr = `            <StatusIndicators 
                notifications={notifications}
                isLoading={isLoading}
                isBatchGenerating={isBatchGenerating}
                results={results}
                isGlobalBusy={isGlobalBusy} 
                promptGenerationProgress={promptGenerationProgress} 
                chunkProcessingProgress={chunkProcessingProgress}
                rateLimitCountdown={rateLimitCountdown}
            />`;

code = code.split(searchStr).join(replaceStr);
fs.writeFileSync('index.tsx', code);
console.log("Replaced in index.tsx");
