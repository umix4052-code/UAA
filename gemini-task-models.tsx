import React, { useState } from 'react';
import { InfoIcon } from './icons';

export const MODEL_CONFIG_VERSION = 'v3.8-smart-free-2';

export const DEFAULT_AI_TASK_MODELS = {
    complexTaskFallback: 'gemini-3.7-flash',
    simpleTaskFallback: 'gemini-3.1-flash-lite',
    scriptSceneBreakdown: 'gemini-3.8-flash',
    scriptParaphrasing: 'gemini-3.8-flash',
    uniqueStoryGeneration: 'gemini-3.8-flash',
    voiceoverAudioGeneration: 'gemini-2.5-flash-preview-tts',
    imageStyleAnalysis: 'gemini-3.7-flash',
    imageRetrySafety: 'gemini-3.5-flash-lite',
    videoUrlDeconstruct: 'gemini-3.8-flash',
    videoFileAnalysis: 'gemini-3.8-flash',
    visualRemakeSlice: 'gemini-3.8-flash',
    characterImageAnalysis: 'gemini-3.7-flash',
};

export const GEMINI_TEXT_MODEL_OPTIONS = [
    { value: 'gemini-3.8-flash', label: 'Google Gemini 3.8 Flash (Deep Logic & Video - Free)' },
    { value: 'gemini-3.7-flash', label: 'Google Gemini 3.7 Flash (High-Speed Multimodal - Free)' },
    { value: 'gemini-3.5-flash-lite', label: 'Google Gemini 3.5 Flash-Lite (Ultrafast Safety & Quota Saver - Free)' },
    { value: 'gemini-3.1-flash-lite', label: 'Google Gemini 3.1 Flash-Lite (Translation & Lightweight - Free)' },
    { value: 'gemini-3.1-pro-preview', label: 'Google Gemini 3.1 Pro Preview (Deep Reasoning - Free Preview)' },
    { value: 'gemini-3.5-transcribe', label: 'Google Gemini 3.5 Transcribe (Audio Speech-to-Text - Free)' },
    { value: 'gemini-3.5-flash', label: 'Google Gemini 3.5 Flash (Legacy - Paid API Only)' },
    { value: 'gemini-3.6-flash', label: 'Google Gemini 3.6 Flash (Legacy - Paid API Only)' },
];

export const resolveGeminiTaskModel = (
    operation: string,
    explicitModel: string | undefined,
    taskModels?: Partial<typeof DEFAULT_AI_TASK_MODELS>
): string => {
    if (explicitModel && explicitModel.trim() !== '') {
        return explicitModel.trim();
    }
    const models = { ...DEFAULT_AI_TASK_MODELS, ...(taskModels || {}) };
    const opLower = (operation || '').toLowerCase();

    // ১. ভয়েসওভার অডিও (TTS)
    if (opLower.includes('voiceover') && !opLower.includes('auto-configure')) {
        return models.voiceoverAudioGeneration;
    }
    if (opLower.includes('tts')) {
        return models.voiceoverAudioGeneration;
    }
    // ২. ভিজ্যুয়াল রিমেক সাব-ব্যাচ / স্লাইস
    if (opLower.includes('remake group') || opLower.includes('visual remake')) {
        return models.visualRemakeSlice;
    }
    // ৩. সিন ব্রেকডাউন, স্টোরিবোর্ড, ইমেজ ও ভিডিও প্রম্পট এবং স্ক্রিপ্ট ক্যারেক্টার এক্সট্র্যাকশন
    if (
        opLower.includes('breakdown') ||
        opLower.includes('split') ||
        opLower.includes('video prompt') ||
        opLower.includes('generate prompts') ||
        opLower.includes('image prompts only') ||
        opLower.includes('resume chunk') ||
        opLower.includes('analyze script characters')
    ) {
        return models.scriptSceneBreakdown;
    }
    // ৪. কপিরাইট-ফ্রি স্ক্রিপ্ট প্যারাফ্রেসিং, ডকুমেন্টারি রিরাইট, ডিউরেশন ফিট ও স্ক্রিপ্ট ক্লিনিং
    if (
        opLower.includes('rephrase') ||
        opLower.includes('paraphras') ||
        opLower.includes('tonal') ||
        opLower.includes('documentary') ||
        opLower.includes('fit script') ||
        opLower.includes('script processing')
    ) {
        return models.scriptParaphrasing;
    }
    // ৫. স্টোরি রিফাইনমেন্ট সাজেশন ও অ্যাপ্লাই
    if (opLower.includes('refin')) {
        return models.complexTaskFallback;
    }
    // ৬. ইউনিক স্টোরি ও স্ক্রিপ্ট জেনারেশন
    if (opLower.includes('story') || opLower.includes('generate script')) {
        return models.uniqueStoryGeneration;
    }
    // ৭. ট্রান্সলেশন, গ্লোবাল সামারি, ভিজ্যুয়াল সেটিংস এবং অটো-কনফিগার ভয়েসওভার (হালকা কাজ)
    if (
        opLower.includes('translat') ||
        opLower.includes('global summary') ||
        opLower.includes('visual settings') ||
        opLower.includes('auto-configure voiceover')
    ) {
        return models.simpleTaskFallback;
    }
    // ৮. ডিফল্ট ফলব্যাক
    const isComplexTask = opLower.includes('script') || opLower.includes('prompts') || opLower.includes('analy');
    return isComplexTask ? models.complexTaskFallback : models.simpleTaskFallback;
};

interface GeminiTaskModelsProps {
    aiTaskModels: typeof DEFAULT_AI_TASK_MODELS;
    setAiTaskModels: React.Dispatch<React.SetStateAction<any>>;
    disabled?: boolean;
}

export const GeminiTaskModelsCard: React.FC<GeminiTaskModelsProps> = ({
    aiTaskModels,
    setAiTaskModels,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(() => {
        const savedLock = localStorage.getItem('aiTaskModelsLocked');
        return savedLock === 'true';
    });

    const taskDefinitions = [
        {
            key: 'complexTaskFallback',
            label: 'Complex Task Fallback Model',
            bengali: 'জতিলাত্মক টেক্সট কাজ (যেমন স্ক্রিপ্ট রিফাইনমেন্ট, গল্প তৈরি) এর জন্য ব্যবহৃত মডেল।',
            defaultLabel: 'Gemini 3.7 Flash (Default)',
        },
        {
            key: 'simpleTaskFallback',
            label: 'Simple Task Fallback Model',
            bengali: 'সাধারণ টেক্সট রিরাইট, ট্রান্সলেশন এবং ছোটখাটো কুয়েরি সম্পন্ন করার জন্য ব্যবহৃত মডেল।',
            defaultLabel: 'Gemini 3.1 Flash-Lite (Default)',
        },
        {
            key: 'scriptSceneBreakdown',
            label: 'Script & Video Prompts Engine',
            bengali: 'স্ক্রিপ্ট থেকে সিন ব্রেকডাউন, ইমেজ প্রম্পট এবং সিনেমাটিক ভিডিও প্রম্পট তৈরির মূল ইঞ্জিন।',
            defaultLabel: 'Gemini 3.8 Flash (Default)',
        },
        {
            key: 'scriptParaphrasing',
            label: 'Script Paraphrasing & Refinement',
            bengali: 'স্ক্রিপ্ট প্যারাফ্রেসিং, টোন এডিট, ডিউরেশন ফিটিং এবং ডকুমেন্টারি রিরাইটের জন্য ব্যবহৃত মডেল।',
            defaultLabel: 'Gemini 3.8 Flash (Default)',
        },
        {
            key: 'uniqueStoryGeneration',
            label: 'Unique Story & Script Generation',
            bengali: 'বিবরণ বা আইডিয়া থেকে একদম ইউনিক গল্প বানানোর জন্য ব্যবহৃত মডেল।',
            defaultLabel: 'Gemini 3.8 Flash (Default)',
        },
        {
            key: 'voiceoverAudioGeneration',
            label: 'Voiceover Audio Generation',
            bengali: 'টিটিএস (TTS/Audio Chunks) ভয়েসওভার তৈরির জন্য ব্যবহৃত স্পেশাল মডেল।',
            defaultLabel: 'Gemini 2.5 TTS (Default)',
        },
        {
            key: 'imageStyleAnalysis',
            label: 'Image Style Analysis',
            bengali: 'সংযুক্ত রেফারেন্স ইমেজের ভিজ্যুয়াল আর্ট স্টাইল এবং লিজেন্ড বিশ্লেষণ করতে।',
            defaultLabel: 'Gemini 3.7 Flash (Default)',
        },
        {
            key: 'imageRetrySafety',
            label: 'Image Safety Auto-Rephraser',
            bengali: 'ইমেজ জেনারেশনের সময় কোনো সেফটি পলিসি ভাঙলে, প্রম্পট স্বয়ংক্রিয়ভাবে মডিফাই করার জন্য।',
            defaultLabel: 'Gemini 3.5 Flash-Lite (Default)',
        },
        {
            key: 'videoUrlDeconstruct',
            label: 'Video URL Deconstruction',
            bengali: 'ইউটিউব লিঙ্ক বা ভিডিও লিঙ্ক দিলে তার উপাদান, ভিজ্যুয়াল টোন এবং স্ক্রিপ্ট বিশ্লেষণ করার জন্য।',
            defaultLabel: 'Gemini 3.8 Flash (Default)',
        },
        {
            key: 'videoFileAnalysis',
            label: 'Video File Analysis & Transcription',
            bengali: 'আপনার আপলোড করা মূল ভিডিও ফাইলের অডিও স্ক্রিপ্ট এবং সাবটাইটেল টেমপ্লেট ডিকোড করতে।',
            defaultLabel: 'Gemini 3.8 Flash (Default)',
        },
        {
            key: 'visualRemakeSlice',
            label: 'Visual Remake Section Sorter',
            bengali: 'ভিডিয়ো রিমেকে মূল ভিডিওর দৃশ্য-বাই-দৃশ্য ভিজ্যুয়াল ডিটেইলিং এবং রি-শুটিং প্রম্পট তৈরির জন্য।',
            defaultLabel: 'Gemini 3.8 Flash (Default)',
        },
        {
            key: 'characterImageAnalysis',
            label: 'Character Reference Analysis',
            bengali: 'সংযুক্ত চরিত্রের স্টোরিবোর্ড রেফারেন্স থেকে কন্সিস্টেন্ট ফেস ইলাস্ট্রেশন ডেসক্রিপশন তৈরি করতে।',
            defaultLabel: 'Gemini 3.7 Flash (Default)',
        },
    ];

    const getModelOptions = (taskKey: string) => {
        if (taskKey === 'voiceoverAudioGeneration') {
            return [
                { value: 'gemini-2.5-flash-preview-tts', label: 'Google Gemini 2.5 Flash Preview TTS (Default Audio)' },
                { value: 'gemini-3.1-flash-tts-preview', label: 'Google Gemini 3.1 Flash TTS Preview (Experimental Audio)' },
                { value: 'gemini-2.5-pro-preview-tts', label: 'Google Gemini 2.5 Pro Preview TTS (Experimental Audio)' }
            ];
        }
        return GEMINI_TEXT_MODEL_OPTIONS;
    };

    const getDetails = (val: string, taskKey: string) => {
        if (val.includes('tts') || val.includes('voice')) {
            return {
                badgeColor: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.05)', badgeBorder: 'rgba(59, 130, 246, 0.3)',
                title: '🎙️ Voice TTS (টিটিএস)', rpm: '100', rpd: '15,000',
                pros: 'প্রফেশনাল বাংলা ভয়েসওভার ডাইরেক্ট অডিও ফরম্যাটে জেনারেট করে। চমৎকার বাংলা উচ্চারণ সহ একদম হিউম্যান-লাইক স্পিচ পিচ ও টোন গতি।',
                cons: 'শুধুমাত্র পিওর টেক্সট-টু-স্পিচ (Audio Modality) তৈরি করতে সক্ষম। ইমেজ এনালাইসিস বা প্রম্পট এজেন্টের জন্য অনুপযোগী।'
            };
        }
        if (val === 'gemini-3.7-flash') {
            return {
                badgeColor: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.05)', badgeBorder: 'rgba(16, 185, 129, 0.3)',
                title: '⚡ 3.7 Flash (হাই-স্পিড মাল্টিমোডাল)', rpm: '15', rpd: '1,500',
                pros: 'লেটেস্ট হাই-স্পিড মাল্টিমোডাল মডেল। রেফারেন্স ইমেজ বিশ্লেষণ, ক্যারেক্টার ট্রেইট এক্সট্র্যাকশন ও ভিজ্যুয়াল স্টাইল রিকগনিশনে অতুলনীয়।',
                cons: 'অতি দীর্ঘ ডিপ রিজনিনংয়ের ক্ষেত্রে ৩.৮ ফ্ল্যাশের তুলনায় কিছুটা কনসাইজ রেসপন্স প্রদান করতে পারে।'
            };
        }
        if (val === 'gemini-3.1-flash-lite') {
            return {
                badgeColor: '#06b6d4', badgeBg: 'rgba(6, 182, 212, 0.05)', badgeBorder: 'rgba(6, 182, 212, 0.3)',
                title: '🌐 3.1 Flash-Lite (ট্রান্সলেশন ও লাইটওয়েট)', rpm: '30', rpd: '3,000',
                pros: 'সর্বোচ্চ দ্রুত গতির লাইটওয়েট মডেল। স্ক্রিপ্ট ট্রান্সলেশন, গ্লোবাল সামারি এবং দ্রুত ডেটা ম্যাপিংয়ে জিরো-ল্যাগ স্পিড ও কোটা সাশ্রয় করে।',
                cons: 'জটিল চিত্রনাট্য বা স্টোরি রাইটিংয়ের ডিপ লজিকের জন্য উপযুক্ত নয়।'
            };
        }
        if (val === 'gemini-3.5-transcribe') {
            return {
                badgeColor: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.05)', badgeBorder: 'rgba(245, 158, 11, 0.3)',
                title: '🎧 3.5 Transcribe (অডিও স্পিচ-টু-টেক্সট)', rpm: '15', rpd: '1,500',
                pros: 'ভিডিও ও অডিও ফাইল থেকে নিখুঁত টেক্সট ট্রান্সক্রিপশন ও সংলাপ ডিকোড করতে বিশেষভাবে অপ্টিমাইজড।',
                cons: 'ক্রিয়েটিভ প্রম্পট তৈরি বা সিন ব্রেকডাউনের জন্য প্রযোজ্য নয়।'
            };
        }
        if (val === 'gemini-3.1-pro-preview') {
            return {
                badgeColor: '#ef4444', badgeBg: 'rgba(239, 68, 68, 0.05)', badgeBorder: 'rgba(239, 68, 68, 0.3)',
                title: '💎 Pro Mode (প্রো মডেল)', rpm: '2', rpd: '50',
                pros: '১০-১২ মিনিটের বড় ভিডিওর জটিল চিত্রনাট্য বিশ্লেষণ, সূক্ষ্ম ক্যারেক্টার বডি-ল্যাংগুয়েজ ম্যাপিং এবং ডিপ রিজনিনং ডিকোডিংয়ের জন্য অপ্রতিদ্বন্দ্বী।',
                cons: 'দৈনিক ফ্রি লিমিট মাত্র ৫০টি রিকোয়েস্ট। ভয়েসওভারে ব্যবহার করলে এটি অডিও জেনারেশনের জন্য অফিশিয়াল ডাইরেক্ট মডেল নয় (Experimental Voice)।'
            };
        }
        if (val === 'gemini-3.8-flash') {
            if (taskKey === 'videoUrlDeconstruct' || taskKey === 'videoFileAnalysis') {
                return {
                    badgeColor: '#8b5cf6', badgeBg: 'rgba(139, 92, 246, 0.05)', badgeBorder: 'rgba(139, 92, 246, 0.3)',
                    title: '🧠 3.8 Flash (ভিডিও অ্যানালাইসিস)', rpm: '15', rpd: '1,500',
                    pros: 'লেটেস্ট ইন্টেলিজেন্ট মডেল। এজেন্টিক ভিডিও স্ক্যানিংয়ের মাধ্যমে লম্বা ভিডিও থেকে নিখুঁত ডেটা ডিকোড করতে পারে।',
                    cons: 'হাই-কোয়ালিটি প্রসেসিংয়ের কারণে টোকেন খরচ বেশি হতে পারে।'
                };
            } else {
                return {
                    badgeColor: '#8b5cf6', badgeBg: 'rgba(139, 92, 246, 0.05)', badgeBorder: 'rgba(139, 92, 246, 0.3)',
                    title: '🧠 3.8 Flash (ডিপ লজিক ও প্রম্পট)', rpm: '15', rpd: '1,500',
                    pros: 'লেটেস্ট ইন্টেলিজেন্ট মডেল। জটিল লজিক, ক্রিয়েটিভ স্টোরি টেলিং এবং ডিপ প্রম্পট রাইটিংয়ে সেরা।',
                    cons: 'হাই-কোয়ালিটি রিজনিনংয়ের কারণে রেসপন্স জেনারেট হতে সামান্য বেশি সময় লাগতে পারে।'
                };
            }
        }
        if (val === 'gemini-3.5-flash-lite') {
            return {
                badgeColor: '#06b6d4', badgeBg: 'rgba(6, 182, 212, 0.05)', badgeBorder: 'rgba(6, 182, 212, 0.3)',
                title: '🚀 3.5 Flash-Lite (আল্ট্রা-ফাস্ট)', rpm: '30', rpd: '3,000',
                pros: 'সবচেয়ে দ্রুত গতির এবং টোকেন-সাশ্রয়ী মডেল। বেসিক সেফটি চেকিং ও ছোট রিরাইটে জিরো ল্যাগ প্রোভাইড করে।',
                cons: 'ক্রিয়েটিভ স্টোরি রাইটিং বা জটিল লজিক বিল্ডিংয়ের জন্য উপযুক্ত নয়।'
            };
        }
        if (val === 'gemini-3.5-flash' || val === 'gemini-3.6-flash') {
            return {
                badgeColor: '#64748b', badgeBg: 'rgba(100, 116, 139, 0.05)', badgeBorder: 'rgba(100, 116, 139, 0.3)',
                title: '💳 Legacy Flash (পেইড এপিআই)', rpm: '15', rpd: '1,500',
                pros: 'ক্লাসিক জেমিনি ফ্ল্যাশ মডেল। সাধারণ টেক্সট ও প্যারাফ্রেসিংয়ে পরিচিত আউটপুট প্রদান করে।',
                cons: 'বর্তমানে ফ্রি জিমেইল এপিআই-তে কোটা সীমাবদ্ধ অথবা পেইড বিলিং প্রয়োজন হতে পারে।'
            };
        }
        // Fallback
        return {
            badgeColor: '#8b5cf6', badgeBg: 'rgba(139, 92, 246, 0.05)', badgeBorder: 'rgba(139, 92, 246, 0.3)',
            title: '⚡ Custom Model Selection', rpm: '15', rpd: '1,500',
            pros: 'ইউজার কর্তৃক নির্বাচিত কাস্টম মডেল।',
            cons: 'টোকেন খরচ ও স্পিড মডেলের ধরনের উপর নির্ভর করবে।'
        };
    };

    const handleModelChange = (key: string, val: string) => {
        setAiTaskModels((prev: any) => ({
            ...prev,
            [key]: val,
        }));
    };

    const toggleLock = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextState = !isLocked;
        setIsLocked(nextState);
        localStorage.setItem('aiTaskModelsLocked', nextState ? 'true' : 'false');
    };

    const handleResetAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAiTaskModels({ ...DEFAULT_AI_TASK_MODELS });
        setIsLocked(false);
        localStorage.setItem('aiTaskModelsLocked', 'false');
    };

    return (
        <div className="card gemini-task-models-section" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)} 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⚙️ Advanced AI Task Routing (Google Gemini)
                    </h2>
                    <p className="description" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                        গুগল জেমিনির বিশেষ ১২টি ইন্টারনাল ফিচারের জন্য মডেল নির্বাচন করুন। (কাজের ধরন অনুযায়ী সেরা ফ্রি মডেল সেট করা আছে)।
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={toggleLock}
                        style={{
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.8rem',
                            backgroundColor: isLocked ? '#e53935' : '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {isLocked ? '🔒 Locked (লকড)' : '🔓 Unlocked (আনলকড)'}
                    </button>
                    <span style={{
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.6rem',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                    }}>
                        {taskDefinitions.length} Tasks
                    </span>
                    <span style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s', 
                        display: 'inline-block',
                        fontSize: '1.2rem',
                        color: 'var(--primary)'
                    }}>
                        ▼
                    </span>
                </div>
            </div>

            {isOpen && (
                <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        backgroundColor: isLocked ? 'rgba(229, 57, 53, 0.05)' : 'rgba(76, 175, 80, 0.05)', 
                        border: `1px solid ${isLocked ? '#e53935' : '#4caf50'}`, 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--base-radius)', 
                        marginBottom: '1rem' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{isLocked ? '🔒' : '🔓'}</span>
                            <div>
                                <strong style={{ fontSize: '0.9rem', color: isLocked ? '#e53935' : '#4caf50' }}>
                                    {isLocked ? 'Configuration Lock Active (মডেল সেটিংস লকড আছে)' : 'Configuration Unlocked (মডেল সেটিংস পরিবর্তনযোগ্য)'}
                                </strong>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, color: 'var(--text-primary)' }}>
                                    {isLocked ? 'বর্তমানে সমস্ত মডেল নির্বাচন লক করা আছে। পরিবর্তন করতে ডান পাশের বাটন থেকে আনলক করুন।' : 'যেকোনো পরিবর্তন করার পর এটিকে ভুলবশত পরিবর্তন হওয়া রোধে আবার লক করুন।'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={handleResetAll}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid rgb(245, 158, 11)',
                                    color: 'rgb(245, 158, 11)',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    transition: 'all 0.2s'
                                }}
                                title="সমস্ত মডেলকে পুনরায় ডিফল্ট কনফিগারেশনে ফিরিয়ে আনুন (রিসেট করুন)"
                            >
                                🔄 Reset to Original (রিসেট করুন)
                            </button>
                            <button
                                type="button"
                                onClick={toggleLock}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    backgroundColor: isLocked ? 'rgba(76, 175, 80, 0.15)' : 'rgba(229, 57, 53, 0.15)',
                                    border: `1px solid ${isLocked ? '#4caf50' : '#e53935'}`,
                                    color: isLocked ? '#4caf50' : '#e53935',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isLocked ? '🔓 Open Lock (আনলক করুন)' : '🔒 Lock Input (লক করুন)'}
                            </button>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                        padding: '0.75rem', 
                        borderRadius: 'var(--base-radius)', 
                        border: '1px solid #ef4444',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)'
                    }}>
                        <InfoIcon />
                        <span>
                            <strong>Note on Model Selection:</strong> কাজের গুরুত্ব ও ফ্রি কোটা বজায় রাখতে বাই-ডিফল্ট <strong>Google Gemini 3.8 Flash</strong>, <strong>3.7 Flash</strong> এবং <strong>Flash-Lite</strong> মডেলগুলো স্মার্টলি কনফিগার করা হয়েছে যাতে কোনো এরর ছাড়াই প্রসেসিং দ্রুত ও নিখুঁত হয়। আপনি চাইলে আনলক করে যেকোনো কার্ডের ড্রপডাউন থেকে আপনার পছন্দের মডেল নির্বাচন করতে পারেন; <strong>তবে মনে রাখবেন:</strong> যত উচ্চমানের মডেল নির্বাচন করবেন, টোকেন খরচ ও ফ্রি কোটা ব্যবহারের দিকে খেয়াল রাখতে হবে।
                        </span>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: '1.25rem' 
                    }}>
                        {taskDefinitions.map((task) => {
                            const currentValue = (aiTaskModels as any)[task.key] || (DEFAULT_AI_TASK_MODELS as any)[task.key];
                            return (
                                <div 
                                    key={task.key} 
                                    style={{ 
                                        backgroundColor: 'var(--bg-main)', 
                                        padding: '1rem', 
                                        borderRadius: 'var(--base-radius)', 
                                        border: '1px solid var(--border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        opacity: isLocked ? 0.85 : 1,
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.95rem' }}>
                                                {task.label}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                                ({task.defaultLabel})
                                            </span>
                                        </div>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            {task.bengali}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto', paddingTop: '1rem' }}>
                                        <select
                                            value={currentValue}
                                            onChange={(e) => handleModelChange(task.key, e.target.value)}
                                            disabled={disabled || isLocked}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                border: `1px solid ${isLocked ? 'var(--border)' : 'var(--primary)'}`,
                                                backgroundColor: isLocked ? 'var(--bg-main)' : 'var(--bg-card)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem',
                                                cursor: (disabled || isLocked) ? 'not-allowed' : 'pointer',
                                                opacity: isLocked ? 0.75 : 1
                                            }}
                                        >
                                            {getModelOptions(task.key).map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>

                                        {(() => {
                                            const info = getDetails(currentValue, task.key);
                                            return (
                                                <div style={{
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '6px',
                                                    backgroundColor: info.badgeBg,
                                                    border: `1px dashed ${info.badgeBorder}`,
                                                    fontSize: '0.75rem',
                                                    marginTop: '0.4rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.35rem'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                                                        <span style={{ color: info.badgeColor, fontSize: '0.8rem' }}>
                                                            {info.title}
                                                        </span>
                                                        <span style={{ opacity: 0.8, color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                                                            RPM: {info.rpm} | RPD: {info.rpd}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                        <div>💡 <strong style={{ color: 'var(--primary)' }}>সুবিধা:</strong> {info.pros}</div>
                                                        <div style={{ marginTop: '0.15rem' }}>⚠️ <strong style={{ color: '#f59e0b' }}>সীমাবদ্ধতা:</strong> {info.cons}</div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
