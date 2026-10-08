import React from 'react';
import { InfoIcon, FacebookIcon, YoutubeIcon, WebsiteIcon, WhatsAppIcon, TelegramIcon } from './icons';

interface InfoSectionProps {
    usageVisible: boolean;
    setUsageVisible: (visible: boolean) => void;
    apiUsageVisible: boolean;
    setApiUsageVisible: (visible: boolean) => void;
    aboutVisible: boolean;
    setAboutVisible: (visible: boolean) => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
    usageVisible, setUsageVisible,
    apiUsageVisible, setApiUsageVisible,
    aboutVisible, setAboutVisible
}) => {
    return (
        <>
            <div className="card usage-guide-card collapsible">
                    <h2 onClick={() => setUsageVisible(!usageVisible)}>
                    <div className="collapsible-title"><InfoIcon /> Usage Guide</div>
                    <span>{usageVisible ? '[-]' : '[+]'}</span>
                </h2>
                {usageVisible && (
                    <div className="collapsible-content">
                        <table className="usage-table">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Master Autopilot</strong></td>
                                    <td>The core feature. Provide a script, and it will automatically handle rephrasing, analysis, image/video prompt generation, and voiceover creation.</td>
                                </tr>
                                <tr>
                                    <td><strong>Project Management</strong></td>
                                    <td>Save and load your entire project state, including scripts, settings, and generated results, directly in your browser.</td>
                                </tr>
                                <tr>
                                    <td><strong>API Key Management</strong></td>
                                    <td>Add multiple Gemini API keys. The app will automatically rotate between them to avoid rate limits and retry on failures.</td>
                                </tr>
                                <tr>
                                    <td><strong>Script Assistant</strong></td>
                                    <td>Generate a complete script from a simple idea or rephrase your existing script to avoid copyright issues.</td>
                                </tr>
                                <tr>
                                    <td><strong>Style & Character Control</strong></td>
                                    <td>Use reference images, detailed character profiles, and a vast library of themes/modifiers to ensure visual consistency.</td>
                                </tr>
                                    <tr>
                                    <td><strong>AI Voiceover</strong></td>
                                    <td>Generate high-quality voiceovers from your script. Choose from a library of voices, control tone and speed, or use AI to auto-configure the best settings. You can generate audio in chunks for long scripts to ensure reliability.</td>
                                </tr>
                            </tbody>
                        </table>
                            <div className="important-note">
                            <strong>Important:</strong> All project data is stored locally in your browser&apos;s IndexedDB. Clearing your browser data will delete your saved projects. API keys are also stored locally. Learn more about IndexedDB <a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" target="_blank" rel="noopener noreferrer">here</a>.
                        </div>
                    </div>
                )}
            </div>

            <div className="card usage-guide-card collapsible">
                    <h2 onClick={() => setApiUsageVisible(!apiUsageVisible)}>
                    <div className="collapsible-title"><InfoIcon /> API Usage & Limits Guide</div>
                    <span>{apiUsageVisible ? '[-]' : '[+]'}</span>
                </h2>
                {apiUsageVisible && (
                    <div className="collapsible-content">
                            <p>This app uses the Google Gemini API. Your usage is subject to certain limits, especially on the free tier provided by Google AI Studio.</p>
                        <table className="usage-table">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th>Model Used</th>
                                    <th>Free Tier Limit (per minute)</th>
                                    <th>Notes / Cost Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Image Generation (High Quality)</strong></td>
                                    <td>Imagen 4</td>
                                    <td>~5 Requests</td>
                                    <td>Paid plans are charged per image. Cost depends on resolution.</td>
                                </tr>
                                    <tr>
                                    <td><strong>Image Generation (Fast)</strong></td>
                                    <td>Nano Banana</td>
                                    <td>~15 Requests</td>
                                    <td>Cheaper than Imagen. Good for quick previews.</td>
                                </tr>
                                <tr>
                                    <td><strong>Script/Text Analysis & Gen</strong></td>
                                    <td>Gemini 2.5 Pro</td>
                                    <td>~15 Requests</td>
                                    <td>Paid plans are charged per 1,000 characters (input + output).</td>
                                </tr>
                                <tr>
                                    <td><strong>AI Voiceover (TTS)</strong></td>
                                    <td>TTS Model</td>
                                    <td>~15 Requests</td>
                                    <td>Paid plans are charged per 1,000 characters.</td>
                                </tr>
                                <tr>
                                    <td><strong>Video Generation</strong></td>
                                    <td>Veo 3.1</td>
                                    <td>N/A (Requires Paid Plan)</td>
                                    <td>Requires a Veo-enabled API key with a billing account. Charged per second of video generated.</td>
                                </tr>
                            </tbody>
                        </table>
                            <div className="important-note">
                            <strong>Important:</strong> The limits above are estimates and can change. The &quot;per minute&quot; quota resets every 60 seconds. For large-scale projects, it is highly recommended to set up a <a href="https://cloud.google.com/billing/docs/how-to/create-billing-account" target="_blank" rel="noopener noreferrer">Google Cloud Billing Account</a> to avoid interruptions. This app is designed to cycle through multiple API keys to help manage free tier limits.
                        </div>
                    </div>
                )}
            </div>
            
            <div className="card about-card collapsible">
                <h2 onClick={() => setAboutVisible(!aboutVisible)}>
                    <div className="collapsible-title"><InfoIcon /> About This App & Developer</div>
                    <span>{aboutVisible ? '[-]' : '[+]'}</span>
                </h2>
                {aboutVisible && (
                    <div className="collapsible-content">
                        <h3>About This Application</h3>
                        <p>This Ultimate AI Automationer was created to empower creators, filmmakers, and storytellers by simplifying the complex process of turning a script into a visual and auditory experience. By leveraging the power of powerful AI, this tool automates everything from scene breakdown, prompt generation, to image creation and voiceover synthesis. The goal is to save you countless hours of manual work, allowing you to focus on what truly matters: your creativity.</p>
                        
                        <h3>About Me</h3>
                        <p>Hello! I&apos;m <strong>Tasin</strong>, a creative strategist and tech enthusiast passionate about the intersection of technology and creativity.</p>
                        <p>As a YouTuber, AI-Driven Content Creator, and Prompt Engineer, I explore the cutting edge of digital innovation. The <a href="https://techseekeracademy.com/" target="_blank" rel="noopener noreferrer"><span className="tech">Tech</span> <span className="seeker">Seeker</span> <span className="academy">Academy</span></a> and YouTube channel <a href="https://www.youtube.com/@techseeker-tasin" target="_blank" rel="noopener noreferrer"><span className="tech">Tech</span> <span className="seeker">Seeker</span></a> is your guide to the future, offering in-depth tech reviews, tutorials on AI and automation, and strategies to enhance your creative workflow.</p>
                        <p>My goal is to educate and empower fellow creators and enthusiasts by making complex technologies accessible and practical. Join me as we explore the tools and ideas shaping our world.</p>
                        
                        <div className="social-links">
                            <a href="https://www.whatsapp.com/channel/0029VbB1wvIB4hdaHwPZg224" target="_blank" rel="noopener noreferrer" className="social-link"><WhatsAppIcon /> WhatsApp Channel</a>
                            <a href="https://t.me/techseekertasin" target="_blank" rel="noopener noreferrer" className="social-link"><TelegramIcon /> Telegram Channel</a>
                            <a href="https://shorturl.at/RqzYI" target="_blank" rel="noopener noreferrer" className="social-link"><FacebookIcon /> Facebook</a>
                            <a href="https://www.youtube.com/@techseeker-tasin" target="_blank" rel="noopener noreferrer" className="social-link"><YoutubeIcon /> YouTube</a>
                            <a href="https://techseekeracademy.com/" target="_blank" rel="noopener noreferrer" className="social-link"><WebsiteIcon /> Website</a>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};