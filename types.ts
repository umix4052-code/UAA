// বিভিন্ন ধরনের ডেটার জন্য টাইপ নির্ধারণ
export type ReferenceFile = { name: string; size: string; dataUrl?: string | undefined; file?: File | null | undefined; };
export type SceneResult = { scene_description: string; image_prompt: string; characters_in_scene?: string[]; video_prompt?: string; imageUrl?: string; imageStatus: 'pending' | 'loading' | 'completed' | 'failed' | 'retrying'; videoPromptStatus?: 'pending' | 'generating' | 'completed' | 'failed'; error?: string; retryCount?: number; rephrasedForSafety?: boolean; safetyRetryCount?: number; chunk_source_text?: string; target_chunk_count?: number; };
export type DetailedError = { id: number; timestamp: string; title: string; message: string; operation: string; details?: string; provider?: string; model?: string; };
export type Notification = { id: number; message: string; type?: 'info' | 'error' | 'success'; };
export type NotificationLogItem = { id: number; timestamp: string; message: string; provider?: string; model?: string; };
export type StylePreset = { name: string; themes: string[]; modifiers: string[]; angle: string | string[]; };
export type TTSConfig = { voice: string; tone: string; speed: number; };
export type CharacterProfile = { id: string; name?: string; bible_id?: string; userDescription: string; aiDescription: string; image: ReferenceFile | null; };
export type VideoGenerationStatus = { status: 'idle' | 'generating' | 'polling' | 'complete' | 'failed'; videoUrl?: string; error?: string; progressMessage?: string; };
export type AudioChunk = { id: number; text: string; status: 'pending' | 'generating' | 'complete' | 'failed'; audioUrl?: string; audioBytes?: Uint8Array; error?: string; };
export type TTSVoice = { conceptualName: string; apiName: string; gender: 'Male' | 'Female' | 'Child'; category: string; language: 'English' | 'Bengali'; tones: string[]; color: string; use_case: string; };

export type StorySuggestion = {
    id: number;
    angle_type: string;
    en_title: string;
    bn_title: string;
    en_roadmap: string;
    bn_roadmap: string;
};

export interface CinematicOptions {
    enabled: boolean;
    actionBeat: boolean;
    bRoll: boolean;
    dynamicCamera: boolean;
    coreTheme: boolean;
}

export interface ScriptProcessingOptions {
    autoClean: boolean;
    fastSpeak: boolean;
    autoPauses: boolean;
    emotionalCues: boolean;
    podcastMode: boolean;
    documentaryStyle: boolean;
}

export type PromptGenerationProgress = {
    current: number;
    total: number;
    message: string;
    isStalled?: boolean;
};

// NEW: Type for resumable tasks
export type ResumableTask = {
    id: string; // Unique ID for the task (e.g., file name + size, or script hash)
    type: 'visual_remake' | 'auto_scene_gen' | 'video_prompt_gen';
    provider: 'google' | 'openrouter' | 'custom';
    progress: number; // Last completed segment/batch index
    // Context needed to resume
    remakeType?: 'long' | 'shorts' | 'hyper-detailed';
    imageCount?: number; 
};

// IndexedDB Project Data Type
export type ProjectData = {
    projectName: string;
    script: string;
    results: SceneResult[];
    videoDuration: number;
    videoDurationSec: number;
    imageCount: number;
    aspectRatio: string;
    selectedThemes: string[];
    selectedModifiers: string[];
    cameraAngle: string | string[];
    scriptType: string;
    fileName: string;
    referenceFiles: ReferenceFile[];
    characterProfiles: CharacterProfile[];
    videoModel: string;
    videoPromptBasis: string;
    includeDialogue: boolean;
    includeAmbient: boolean;
    includeSfx: boolean;
    stylePresets: StylePreset[];
    projectNiche?: string; // New: Niche setting
    autoBreakdown?: boolean;
    targetSceneDuration?: number | null;

    // API Provider Settings
    apiProvider?: 'google' | 'openrouter' | 'custom';
    openRouterApiKey?: string;
    openRouterImageModel?: string;
    openRouterTextModel?: string;
    openRouterModelMode?: 'standard' | 'free' | 'online';
    // Custom Router Settings (isolated - safe to remove)
    customRouterBaseUrl?: string;
    customRouterApiKey?: string;
    customRouterModelId?: string;
    aiTaskModels?: {
        complexTaskFallback: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        simpleTaskFallback: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        imageStyleAnalysis: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        imageRetrySafety: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        videoUrlDeconstruct: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        videoFileAnalysis: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        visualRemakeSlice: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
        characterImageAnalysis: 'gemini-1.5-flash' | 'gemini-3.5-flash' | 'gemini-3.1-pro-preview';
    };
    
    // Audio / Voiceover Data
    voiceoverScript?: string;
    ttsConfig?: TTSConfig;
    customTtsPrompt?: string;
    voiceoverChunks?: any[];
    cinematicOptions?: CinematicOptions;
};