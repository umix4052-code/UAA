import { DetailedError } from './types';

// Updated formatTime to handle Hours
export const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}h ${m}m ${s}s`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const fileToBase64 = (file: File, onProgress?: (progress: number) => void): Promise<string> => new Promise((resolve, reject) => { 
    const reader = new FileReader(); 
    if (onProgress) {
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };
    }
    reader.readAsDataURL(file); 
    reader.onload = () => resolve(reader.result as string); 
    reader.onerror = error => reject(error); 
});

export const uploadFileToGemini = async (
    file: File,
    apiKey: string,
    onProgress?: (progress: number) => void
): Promise<{ name: string; uri: string; state: string }> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`);
        
        xhr.setRequestHeader('X-Goog-Upload-Protocol', 'raw');
        xhr.setRequestHeader('X-Goog-Upload-Command', 'start, upload, finalize');
        xhr.setRequestHeader('X-Goog-Upload-Header-Content-Length', file.size.toString());
        xhr.setRequestHeader('X-Goog-Upload-Header-Content-Type', file.type);
        xhr.setRequestHeader('Content-Type', file.type);

        let stalledTimer: number | null = null;
        const resetStalledTimer = () => {
            if (stalledTimer) clearTimeout(stalledTimer);
            stalledTimer = window.setTimeout(() => {
                xhr.abort();
                reject(new Error("Upload stalled"));
            }, 30000); // 30 seconds of inactivity
        };

        if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                resetStalledTimer();
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete);
                }
            };
        }

        resetStalledTimer();

        xhr.onload = () => {
            if (stalledTimer) clearTimeout(stalledTimer);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.file);
                } catch (e) {
                    reject(new Error("Failed to parse upload response"));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => {
            if (stalledTimer) clearTimeout(stalledTimer);
            reject(new Error("Network error during upload"));
        };
        xhr.send(file);
    });
};

export const waitForFileProcessing = async (
    fileName: string,
    apiKey: string,
    onStatusUpdate?: (status: string) => void
): Promise<void> => {
    let state = 'PROCESSING';
    while (state === 'PROCESSING') {
        if (onStatusUpdate) onStatusUpdate("Processing video on AI server... Please wait.");
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to check file status: ${response.statusText}`);
        }
        
        const data = await response.json();
        state = data.state;
        
        if (state === 'FAILED') {
            throw new Error("Video processing failed on Gemini server.");
        }
    }
};

export const formatBytes = (bytes: number, decimals = 2) => { 
    if (bytes === 0) return '0 Bytes'; 
    const k = 1024; 
    const dm = decimals < 0 ? 0 : decimals; 
    const sizes = ['Bytes', 'KB', 'MB', 'GB']; 
    const i = Math.floor(Math.log(bytes) / Math.log(k)); 
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]; 
};

export const getPacificTimeDateStr = () => {
    return new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'America/Los_Angeles', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).format(new Date());
};

export const getDeviceId = () => { 
    let deviceId = localStorage.getItem('deviceId'); 
    if (!deviceId) { 
        deviceId = crypto.randomUUID(); 
        localStorage.setItem('deviceId', deviceId); 
    } 
    return deviceId; 
};

export function decode(base64: string) { 
    const binaryString = atob(base64); 
    const len = binaryString.length; 
    const bytes = new Uint8Array(len); 
    for (let i = 0; i < len; i++) { 
        bytes[i] = binaryString.charCodeAt(i); 
    } 
    return bytes; 
}

// Convert Uint8Array to Base64 String (For Saving to JSON)
export function encodeArrayBufferToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { 
    const dataInt16 = new Int16Array(data.buffer); 
    const frameCount = dataInt16.length / numChannels; 
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); 
    for (let channel = 0; channel < numChannels; channel++) { 
        const channelData = buffer.getChannelData(channel); 
        for (let i = 0; i < frameCount; i++) { 
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; 
        } 
    } 
    return buffer; 
}

export const pcmToWav = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number) => { 
    const dataSize = pcmData.length; 
    const buffer = new ArrayBuffer(44 + dataSize); 
    const view = new DataView(buffer); 
    const writeString = (offset: number, str: string) => { 
        for (let i = 0; i < str.length; i++) { 
            view.setUint8(offset + i, str.charCodeAt(i)); 
        } 
    }; 
    const blockAlign = numChannels * (bitsPerSample / 8); 
    const byteRate = sampleRate * blockAlign; 
    writeString(0, 'RIFF'); 
    view.setUint32(4, 36 + dataSize, true); 
    writeString(8, 'WAVE'); 
    writeString(12, 'fmt '); 
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true); 
    view.setUint32(24, sampleRate, true); 
    view.setUint32(28, byteRate, true); 
    view.setUint16(32, blockAlign, true); 
    view.setUint16(34, bitsPerSample, true); 
    writeString(36, 'data'); 
    view.setUint32(40, dataSize, true); 
    new Uint8Array(buffer, 44).set(pcmData); 
    return new Blob([view], { type: 'audio/wav' }); 
};

export const splitScriptIntoMeaningfulChunks = (text: string, maxChunkLength = 2800): string[] => {
    if (!text || text.trim().length === 0) return [];
    if (text.length <= maxChunkLength) return [text];

    // Split text into sentences, keeping the delimiters (e.g., '.', '!', '?').
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
    if (sentences.length === 0) {
        // Fallback for text without any sentence-ending punctuation.
        // Hard split the text into chunks of maxChunkLength.
        const chunks = [];
        for (let i = 0; i < text.length; i += maxChunkLength) {
            chunks.push(text.substring(i, i + maxChunkLength));
        }
        return chunks;
    }

    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (trimmedSentence.length === 0) continue;

        // If a single sentence itself is larger than the max chunk length,
        // we must split it. We first push any existing chunk.
        if (trimmedSentence.length > maxChunkLength) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
            // Then, hard split the oversized sentence.
            for (let i = 0; i < trimmedSentence.length; i += maxChunkLength) {
                chunks.push(trimmedSentence.substring(i, i + maxChunkLength));
            }
        } 
        // If adding the next sentence would exceed the limit,
        // push the current chunk and start a new one with the current sentence.
        else if (currentChunk.length + trimmedSentence.length + 1 > maxChunkLength) {
            chunks.push(currentChunk.trim());
            currentChunk = trimmedSentence;
        } 
        // Otherwise, add the sentence to the current chunk.
        else {
            currentChunk += (currentChunk.length > 0 ? " " : "") + trimmedSentence;
        }
    }

    // Add the last remaining chunk if it exists.
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};

import { jsonrepair } from 'jsonrepair';

export const jsonValidator = (text: string): boolean => {
    if (!text || text.trim() === '') return false;
    
    // First try our robust extraction method
    try {
        const extracted = extractJsonFromString(text);
        if (extracted) {
             JSON.parse(extracted);
             return true;
        }
    } catch {
        // Fall back to original method if extraction/parsing failed
    }

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleaned) return false;
    try {
        JSON.parse(cleaned);
        return true;
    } catch {
        try {
            JSON.parse(jsonrepair(cleaned));
            return true;
        } catch {
            return false;
        }
    }
};

/**
 * Extracts a valid JSON string from a larger string that might contain extra text or markdown.
 * @param text The raw string from the AI.
 * @returns A string that is likely a valid JSON object, or an empty string if none is found.
 */
// 🚨 CRITICAL ARCHITECTURAL LOCK: JSON Parsing & Validation - STRICT WARNING: DO NOT MODIFY, OVERRIDE, OR REFACTOR THIS LOGIC WITHOUT EXPLICIT ARCHITECTURAL RISK ASSESSMENT AND USER CONFIRMATION.
export const extractJsonFromString = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Strip out <think>...</think> blocks often returned by DeepSeek R1
    let cleanText = text;
    const thinkEnd = text.indexOf('</think>');
    if (thinkEnd !== -1) {
        cleanText = text.substring(thinkEnd + 8).trim();
    }

    // First, try to find a JSON object enclosed in ```json ... ```
    const codeBlockMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
        const potentialJson = codeBlockMatch[1].trim();
        try {
            // Test if the content of the code block is valid JSON
            JSON.parse(potentialJson);
            return potentialJson;
        } catch (e) {
            try {
                // Try to repair the JSON
                const repaired = jsonrepair(potentialJson);
                JSON.parse(repaired);
                return repaired;
            } catch (e) {
                // If parsing the code block fails, fall through to the next method
            }
        }
    }

    // If no code block, or if it was invalid, try to find the first '{' or '[' and the last '}' or ']'
    const firstBraceIndex = cleanText.indexOf('{');
    const firstBracketIndex = cleanText.indexOf('[');
    const lastBraceIndex = cleanText.lastIndexOf('}');
    const lastBracketIndex = cleanText.lastIndexOf(']');

    const startObj = firstBraceIndex !== -1 ? firstBraceIndex : Infinity;
    const startArr = firstBracketIndex !== -1 ? firstBracketIndex : Infinity;
    const startIndex = Math.min(startObj, startArr);

    const endObj = lastBraceIndex !== -1 ? lastBraceIndex : -1;
    const endArr = lastBracketIndex !== -1 ? lastBracketIndex : -1;
    const endIndex = Math.max(endObj, endArr);

    if (startIndex !== Infinity && endIndex !== -1 && endIndex > startIndex) {
        const potentialJson = cleanText.substring(startIndex, endIndex + 1);
        try {
            // Test if this substring is valid JSON
            JSON.parse(potentialJson);
            return potentialJson;
        } catch (e) {
            // Fall through if this is not valid JSON either
            console.error("Failed to parse substring JSON:", e);
            try {
                // Try to repair the JSON
                const repaired = jsonrepair(potentialJson);
                JSON.parse(repaired);
                return repaired;
            } catch (repairErr) {
               console.error("Failed to repair substring JSON:", repairErr);
            }
        }
    }
    
    // Attempt relaxed parsing using bracket matching if simple substring extraction failed
    // We try to find the last valid JSON object by finding a matching brace/bracket pair
    const matchAttemptStart = cleanText.lastIndexOf('{');
    if (matchAttemptStart !== -1) {
        try {
            // Very naive fallback: just match from the last open brace to the last close brace
            const fallbackJson = cleanText.substring(matchAttemptStart, cleanText.lastIndexOf('}') + 1);
            JSON.parse(fallbackJson);
            return fallbackJson;
        } catch(e) {
             try {
                const fallbackJson = cleanText.substring(matchAttemptStart, cleanText.lastIndexOf('}') + 1);
                const repaired = jsonrepair(fallbackJson);
                JSON.parse(repaired);
                return repaired;
            } catch (repairErr) {
            }
        }
    }

    try {
       const repaired = jsonrepair(cleanText.trim());
       JSON.parse(repaired);
       return repaired;
    } catch {
       // As a last resort, return the original text trimmed
       return cleanText.trim();
    }
};

export const getErrorMessageSummary = (log: DetailedError): { explanation: string; direction: string } => {
    // 1. UNIVERSAL HTTP STATUS CODE INTERCEPTOR
    const textToScan = `${log.title || ''} ${log.message || ''} ${typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '')}`;
    const statusCodeMatch = textToScan.match(/\b(400|401|402|403|404|405|408|413|415|422|429|500|502|503|504)\b/);

    if (statusCodeMatch) {
        const code = Number(statusCodeMatch[1]);
        const statusMeaningMap: Record<number, { explanation: string; direction: string }> = {
            400: {
                explanation: "400 Bad Request - Invalid request, JSON বা parameter ভুল।",
                direction: "প্রম্পট টেক্সট বা সেটিংসের প্যারামিটারগুলো ঠিক আছে কিনা চেক করুন।"
            },
            401: {
                explanation: "401 Unauthorized - Invalid/Missing API Key.",
                direction: "আপনার API Key সঠিক এবং সক্রিয় আছে কিনা যাচাই করুন।"
            },
            402: {
                explanation: "402 Error (Insufficient Credits) - অ্যাকাউন্টে টাকা শেষ, অথবা লিমিট/spending cap পার হয়ে গেছে।",
                direction: "প্রোভাইডারের ব্যালেন্স, ক্রেডিট লিমিট বা Spending Cap চেক করুন।"
            },
            403: {
                explanation: "403 Forbidden - Permission denied (Model access নেই, Plan support করে না)।",
                direction: "আপনার অ্যাকাউন্টের এই মডেল ব্যবহারের অনুমতি বা প্ল্যান অ্যাক্সেস আছে কিনা দেখুন।"
            },
            404: {
                explanation: "404 Not Found - Model, Endpoint বা Resource পাওয়া যায়নি।",
                direction: "Model ID বা Base URL বানান ঠিক আছে কিনা এবং মডেলটি সার্ভারে অ্যাভেইলেবল কিনা চেক করুন।"
            },
            405: {
                explanation: "405 Method Not Allowed - ভুল HTTP Method (GET/POST) ব্যবহার করা হয়েছে।",
                direction: "API Endpoint ঠিক আছে কিনা এবং মেথড সাপোর্ট করে কিনা দেখুন।"
            },
            408: {
                explanation: "408 Request Timeout - Request timeout হয়েছে।",
                direction: "সার্ভার রেসপন্স দিতে দেরি করেছে। ইন্টারনেট চেক করে পুনরায় চেষ্টা করুন।"
            },
            413: {
                explanation: "413 Payload Too Large - File/Image অনেক বড়।",
                direction: "চাংক সাইজ বা ফ্রেম সংখ্যা কমিয়ে রিকোয়েস্ট ছোট করুন।"
            },
            415: {
                explanation: "415 Unsupported Media Type - Unsupported file format।",
                direction: "সাপোর্টেড ফরম্যাটের ফাইল বা ইমেজ ব্যবহার করুন।"
            },
            422: {
                explanation: "422 Unprocessable Entity - Request format ঠিক, কিন্তু data invalid।",
                direction: "ইনপুট ডেটা এবং প্যারামিটার ফরম্যাট চেক করুন।"
            },
            429: {
                explanation: "429 Too Many Requests - Rate Limit বা Daily Quota শেষ।",
                direction: "কিছুক্ষণ অপেক্ষা করে পুনরায় চেষ্টা করুন অথবা অন্য কী/মডেল ব্যবহার করুন।"
            },
            500: {
                explanation: "500 Internal Server Error - Server-এর ভেতরের সমস্যা।",
                direction: "AI প্রোভাইডারের সার্ভারে অভ্যন্তরীণ সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।"
            },
            502: {
                explanation: "502 Bad Gateway - Upstream server error।",
                direction: "প্রোভাইডারের সার্ভার ডাউন বা গেটওয়েতে সমস্যা। কিছু সময় পর চেষ্টা করুন।"
            },
            503: {
                explanation: "503 Service Unavailable - Server busy বা maintenance।",
                direction: "সার্ভার অতিরিক্ত লোডে আছে বা মেইনটেন্যান্সে আছে। একটু পর চেষ্টা করুন।"
            },
            504: {
                explanation: "504 Gateway Timeout - Upstream server response দিতে দেরি করেছে।",
                direction: "সার্ভার টাইমআউট হয়েছে। চাংক সাইজ ছোট করে পুনরায় চেষ্টা করুন।"
            }
        };

        if (statusMeaningMap[code]) {
            return statusMeaningMap[code];
        }
    }

    const message = log.message.toLowerCase();
    const operation = log.operation.toLowerCase();

    // --- OpenRouter Specific Errors (Priority Check) ---
    if (operation.includes('openrouter')) {
        if (message.includes('model not found')) {
            return {
                explanation: "The selected OpenRouter model is currently offline, does not exist, or isn't compatible with your current API tier.",
                direction: "Please scroll up to the model selection menu and choose a different model."
            };
        }
        if (message.includes('401') || message.includes('unauthorized')) {
             return {
                explanation: "OpenRouter rejected the request because your API key is invalid or has been revoked.",
                direction: "Go to 'API Key Management' and verify that your OpenRouter API key is correct and active."
            };
        }
        if (message.includes('credit/quota') || message.includes('limit reached')) {
             return {
                explanation: "You have exhausted your available OpenRouter credits or the free limit for this specific model.",
                direction: "You need to add credits to your OpenRouter account or switch to a different free model to continue."
            };
        }
        if (message.includes('rate limit')) {
             return {
                explanation: "The selected OpenRouter model is currently under heavy load and cannot accept more requests right now.",
                direction: "Please wait a few moments and try again, or switch to a less busy model."
            };
        }
        if (message.includes('context length exceeded')) {
             return {
                explanation: "Your script is too large for the selected model's memory (context window).",
                direction: "Use a model with a larger context window or enable the 'Process in Chunks' feature if available."
            };
        }
    }
    
    // --- Gemini & General Errors ---
    if (message.includes('all api keys have been disabled') || message.includes('all keys permanently failed')) {
        return {
            explanation: "The application paused itself because all of your provided API keys failed multiple times.",
            direction: "Look at the previous error logs to find out why. Your keys might be invalid or out of quota. Update them in 'API Key Management' and resume."
        };
    }
    if (message.includes('api key not valid') || message.includes('api_key_invalid')) {
        return {
            explanation: "The Google Gemini API Key you provided is incorrect.",
            direction: "Please check 'API Key Management' and ensure you pasted the correct key without any typos."
        };
    }
    if (message.includes('quota') || message.includes('limit: 0') || message.includes('resource_exhausted')) {
         return {
            explanation: "Your Google Gemini API key has run out of its free usage quota for today.",
            direction: "The app will automatically try another key if you added one. If no keys work, you will have to wait until the quota resets tomorrow."
        };
    }
    if (message.includes('paused_by_circuit_breaker')) {
        return {
            explanation: "To protect your resources, the application paused automatically after facing several identical errors in a row.",
            direction: "Read the earlier errors in this log to see what the actual problem is, fix it, and then click 'Resume Generation'."
        };
    }
     if (message.includes('safety') || message.includes('blocked')) {
        return {
            explanation: "The AI blocked your request because the content triggered its safety and security filters.",
            direction: "Try rewording your prompt or script to remove sensitive or restricted words, then try again."
        };
    }
    if (message.includes('network error') || message.includes('fetch')) {
         return {
            explanation: "The application could not connect to the AI server. This usually happens if your internet is down or the AI server is down.",
            direction: "Check your internet connection and try again."
        };
    }

    // --- Default Fallback ---
    return {
        explanation: log.message || "An unexpected technical error interrupted the process.",
        direction: "Please check your inputs, API limits, or click 'Copy All' to share details for debugging."
    };
};

export function stripTimestamps(text: string): string {
    if (!text) return '';
    // Removes timestamps like [00:02], at 00:02, or [00:02.123] and any single trailing space
    const timestampRegex = /(\[|at\s+)\d{2}:\d{2}(?:\.\d{1,3})?\]?\s?/gi;
    return text.replace(timestampRegex, '');
}


export function sanitizeAiGeneratedScript(text: string): string {
    if (!text) return '';
    let processedText = text;

    // First, try to find a clear separator like *** or ---, which is a reliable way to remove intros.
    const separatorMatch = processedText.match(/(\*\*\*|---|___)/);
    if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index < 300) { // Only if separator is near the start
        processedText = processedText.substring(separatorMatch.index + separatorMatch[0].length);
    } else {
        // If no separator, use regex to find common conversational intros from the AI.
        const introRegex = /^\s*(?:here is|here's|sure|okay|certainly|of course|alright|below is|i have rewritten|the following is)[\s\S]*?(?:the script|your script|the rewritten text|the story|a new version|:)\s*/i;
        processedText = processedText.replace(introRegex, '');
    }

    // Remove markdown-style headers (e.g., # Title, ## Subtitle)
    processedText = processedText.replace(/^#+\s+.*/gm, '');

    // Remove code block fences (like ```json or ```)
    processedText = processedText.replace(/```(?:json|text)?\s*\n?/g, '');
    processedText = processedText.replace(/\n?\s*```/g, '');

    // Finally, trim any leading/trailing whitespace that might be left.
    return processedText.trim();
}


// Clean script for TTS
export function cleanScriptForTTS(text: string): string {
    let cleanedText = text;
    // Remove Markdown headers
    cleanedText = cleanedText.replace(/^#+\s*.*/gm, '');
    // Remove text inside parentheses (music fades, etc)
    cleanedText = cleanedText.replace(/\(.*?\)/g, '');
    // Remove VISUAL cues
    cleanedText = cleanedText.replace(/^VISUAL:.*$/gmi, '');
    // Remove **bold** markers
    cleanedText = cleanedText.replace(/\*\*.*?\*\*/g, '');
    // Remove Speaker tags (e.g. NARRATOR:)
    cleanedText = cleanedText.replace(/^([\w\s]+(\(V\.O\.\))?):\s*/gmi, '');
    // Reduce multiple newlines
    cleanedText = cleanedText.replace(/\n{2,}/g, '\n');
    return cleanedText.trim();
}

// Final processing for Export
export function getCleanTextForExport(text: string): string {
    // Basic clean first
    let processedText = cleanScriptForTTS(text);
    
    // Remove emotion markers [laughs]
    processedText = processedText.replace(/\[.*?\]/g, '');
    
    // INTELLIGENT EXPORT LOGIC:
    // Check if the script is "Mystic Deep Voice" formatted (contains "..." or " - ")
    // If it is, we PRESERVE the formatting.
    const isMysticFormatted = text.includes('...') || text.includes(' - ');

    if (!isMysticFormatted) {
        // Only perform standard aggressive cleaning if it's NOT mystic formatted
        // Replace existing pauses (...) with space to avoid double periods
        processedText = processedText.replace(/\s*\.{3,}\s*/g, ' ');
        // Add natural pauses at end of sentences for TTS engines that rely on punctuation
        processedText = processedText.replace(/([.?!])\s+/g, '$1 ... ');
    } else {
        // If Mystic formatted, we do NOT remove ellipses or hyphens as they are intentional
        // Just trim and ensure spacing is decent
        processedText = processedText.replace(/ \./g, '.'); // Fix accidental space before period
    }
    
    return processedText.trim();
}

export function detectLanguage(text: string): 'Bengali' | 'English' {
    if (!text) return 'English';
    // Check for a significant presence of Bengali Unicode characters
    const bengaliChars = text.match(/[\u0980-\u09FF]/g);
    // If more than 10% of the text is Bengali characters, assume it's Bengali.
    // This avoids false positives on mixed-language text with just a few words.
    if (bengaliChars && (bengaliChars.length / text.length) > 0.1) {
        return 'Bengali';
    }
    return 'English';
}

export const extractFramesFromVideo = (
    videoFile: File,
    framesPerSecond: number,
    onProgress: (progress: { processed: number; total: number }) => void
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frames: string[] = [];

        if (!context) {
            return reject(new Error("Could not create canvas context."));
        }

        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const duration = video.duration;
            if (!isFinite(duration) || duration <= 0) {
                URL.revokeObjectURL(video.src);
                return reject(new Error("Invalid video duration. Cannot extract frames."));
            }

            const interval = 1 / framesPerSecond;
            const totalFrames = Math.floor(duration / interval);
            let processedFrames = 0;
            let currentTime = 0;

            const captureFrame = () => {
                video.currentTime = currentTime;
            };

            video.onseeked = () => {
                if (!context) {
                    URL.revokeObjectURL(video.src);
                    return reject(new Error("Canvas context was lost during frame extraction."));
                }
                
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                frames.push(base64Data);
                
                processedFrames++;
                onProgress({ processed: processedFrames, total: totalFrames });

                currentTime += interval;

                if (currentTime <= duration) {
                    captureFrame();
                } else {
                    URL.revokeObjectURL(video.src);
                    resolve(frames);
                }
            };
            
            // Start the process
            captureFrame();
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(video.src);
            reject(new Error("Error loading video file for frame extraction. It might be corrupt or an unsupported format."));
        };

        video.src = URL.createObjectURL(videoFile);
    });
};