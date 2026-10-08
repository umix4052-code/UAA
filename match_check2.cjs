const fs = require('fs');
const content = fs.readFileSync('index.tsx', 'utf8');

const checks = [
    `        if (error instanceof Error) {
            message = error.message;
            if (message.includes('fetch')) {
                title = 'Network Error';
                message = \`Could not connect to API. Raw error: \${message}\`;
            } else if (message.includes('Resource has been exhausted') || message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('permission denied')) {
                title = 'API Quota Limit Reached';
                message = 'API quota or permission limit has been reached. Please wait or check your billing plan.';
                
                // Triggers Global Quota Modal
                let limitType: 'daily' | 'minute' | 'unknown' = 'unknown';
                if (message.toLowerCase().includes('per day') || message.toLowerCase().includes('daily') || message.toLowerCase().includes('env_limit')) {
                    limitType = 'daily';
                } else if (message.toLowerCase().includes('per minute')) {
                    limitType = 'minute';
                } else if (message.includes('429') || message.includes('exhausted')) {
                    limitType = 'minute'; // Usually it's RPM issues on Gemini free tier
                }
                
                setQuotaLimitType(limitType);
                setShowEnvLimitModal(true);
            } else if (message.includes('API key not valid') || message.includes('API_KEY_INVALID')) {
                title = 'Invalid API Key';
                message = 'One of your API keys is invalid. Please check your API Key Management settings.';
            }
        }`,
    `        } catch (e: any) {
            if (e.message !== "stopped" && e.message !== "PAUSED_BY_CIRCUIT_BREAKER" && e.message !== "ENV_LIMIT_REACHED" && e.message !== 'FATAL_STOP' && e.message !== 'OPENROUTER_LIMIT_REACHED') {
                handleError(e, 'generate prompts and images', {});
            }`,
    `        } catch (e: any) { 
            if (e.message !== "stopped" && e.message !== "ENV_LIMIT_REACHED" && e.message !== "FATAL_STOP" && e.message !== "OPENROUTER_LIMIT_REACHED") 
                handleError(e, 'generate image prompts only', {}); 
        } finally { `,
    `setAutopilotProgress(prev => prev ? { ...prev, isError: true, message: \`Error: \${errorMsg}\` } : null); handleError(e, 'Autopilot Process', {}); if (autopilotTimerRef.current) clearInterval(autopilotTimerRef.current); } } };`
];

checks.forEach((str, i) => {
    console.log(`Check ${i}: ${content.includes(str) ? 'MATCH' : 'FAIL'}`);
});
