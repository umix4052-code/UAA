export interface NicheConfig {
    id: string;
    dropdownName: string;
    visualRules: string;
    scriptRules?: string;
    audioRules?: string;
    characterExtractionRules?: string;
    lastMileVideoRules?: string;
    defaultNegativePrompt: string;
    forceFixedCamera?: boolean;
    defaultThemes?: string[];
    defaultModifiers?: string[];
    defaultCameraAngles?: string[];
}

export const nicheConfigs: Record<string, NicheConfig> = {
    'StylizedMatteHistory': {
        id: 'StylizedMatteHistory',
        dropdownName: 'Stylized 3D History & Legends',
        visualRules: `Art Style: Stylized 3D animated character design with an extreme caricature aesthetic. Matte skin textures, clay-like smooth shading, and angular geometry. ABSOLUTELY NO glossy, shiny plastic reflections or photorealism.
Environment & Lighting: Epic cinematic lighting with strong atmospheric depth. Softly blurred, painterly 3D backgrounds. Characters MUST have a strong rim light to make them pop from the background.
Camera Movement: Slow establishing pans over historical architecture, tracking medium shots following characters, and dynamic zooms for emphasis on facial expressions.
Core Elements & Focus: The primary subjects are expressive human characters wearing strict, period-accurate clothing, set against monumental historical backdrops.
Character/Subject Constraints: Characters MUST have highly exaggerated, sharp, and blocky facial features, very long thin necks, and large eyes. Expressions must be intense and emotional.`,
        scriptRules: `Hook Strategy: Starts with a highly specific historical question or introduces a specific historical/fictional character by name and exact year to instantly build psychological curiosity.
Voiceover Style: Professional, narrative documentary storyteller. Engaging, authoritative, clear, and slightly dramatic.
Tone & Pacing: Immersive and educational storytelling. The pacing must seamlessly transition from micro-level personal daily routines to macro-level historical events.
Auto-Corrections/Wording: Avoid generic AI intros (e.g., "In today's video"). Use precise geographical locations, dates, and explicit character names in the text. Focus on character actions rather than dry textbook facts.`,
        audioRules: `Primary Ambient: Immersive, era-appropriate ambiance (e.g., bustling medieval markets, desert winds, crackling hearth fires, flowing river water).
SFX: Era-specific triggers related to daily labor and environment (e.g., blacksmith hammers, horse hooves on cobblestones, clinking coins, pouring water, distant church bells).
Music/Score: Epic, era-specific orchestral or traditional instrumental music that builds tension, wonder, and emotional connection.`,
        characterExtractionRules: `All extracted characters must be rendered in a highly expressive, stylized matte 3D caricature format. Strict adherence to historical attire is mandatory. Faces must show strong, exaggerated emotion.`,
        lastMileVideoRules: `Include animated map sequences when transitioning to broader historical or geographical contexts to clearly establish the empire or city.`,
        forceFixedCamera: false,
        defaultNegativePrompt: "glossy, shiny plastic reflections, hyper-realistic 3D, Pixar, Disney, 2d flat vector, live-action, photorealism, modern clothing, modern technology, text, watermark, low contrast, boring plain expressions, robotic TTS voice, sci-fi elements",
        defaultThemes: ["Ancient Empires", "Medieval Daily Life", "Historical Mysteries"],
        defaultModifiers: ["Stylized Matte 3D", "Angular Caricature", "Cinematic Rim Light"],
        defaultCameraAngles: ["Character Close-up", "Wide Establishing Shot", "Low Angle Dramatic"]
    },

    'Default / General': {
        id: 'Default / General',
        dropdownName: 'Default / General (Premium Adaptive)',
        visualRules: `Dynamically analyze the user's core concept and seamlessly adapt the visual aesthetic to perfectly match the underlying subject matter. Regardless of the adapted style, you MUST enforce world-class, premium cinematic production value. Ensure cohesive and mood-appropriate lighting, flawless composition, highly detailed textures, and breathtaking visual fidelity. The visual narrative must feel like a high-budget, award-winning production tailored specifically to the input's context.`,
        scriptRules: `Dynamically adapt the narrative tone and pacing to strictly align with the emotional and thematic core of the user's input. ALWAYS open with a magnetic, high-retention 'Pattern Interrupt' hook. Ensure a flawless, logical flow with professional pacing, compelling transitions, and a resonant conclusion. Automatically refine grammatical structure and elevate the vocabulary to a highly professional standard without losing authentic conversational flow.`,
        audioRules: `Primary Ambient: Dynamically infer and construct a rich, immersive background atmospheric soundscape that perfectly grounds the specific environment of the scene.\nSFX: Inject crisp, high-fidelity, and perfectly timed action-triggered sound effects that elevate the premium cinematic feel of the physical actions occurring on screen.`,
        characterExtractionRules: `Extract characters exactly as dictated by the script's context. If visual details are omitted, intelligently infer a highly consistent, premium, and context-appropriate physical appearance that anchors their role in the narrative. Maintain strict anatomical accuracy and realistic human proportions.`,
        lastMileVideoRules: `Enforce maximum visual fidelity, fluid cinematic motion, and strict thematic adherence to the user's core concept. Absolutely prohibit any unwarranted stylistic mutations, bizarre visual glitches, or arbitrary genre blending right before rendering.`,
        defaultNegativePrompt: "watermark, text, logo, signature, UI, low quality, poorly drawn, blurry, deformed, bad anatomy, unnatural proportions, extra limbs, inconsistent lighting, morphing textures, generic CGI, out of frame, amateur cinematography",
        defaultThemes: ["Dynamic Adaptation", "Premium Production", "Cinematic Narrative"],
        defaultModifiers: ["Award-Winning Cinematography", "Highly Detailed", "Perfect Composition", "8K Resolution", "Dynamic Lighting"],
        defaultCameraAngles: ["Dynamic Camera Movement", "Establishing Wide Shot", "Cinematic Close-up"]
    },
    '3DMythBustingExplainer': {
        id: '3DMythBustingExplainer',
        dropdownName: '3D Explainer & Myth Busting (Facts)',
        visualRules: `Art Style: High-end 3D animation with stylized realism (Strictly NO photorealistic live-action, NO 2D cartoon, NO Pixar/Disney styles). Focus heavily on scientific, biological, or physics-based scenarios (e.g., human anatomy cross-sections, physics simulations, survival mechanisms). Camera: Employ 'Shot-Based Thinking'. Use extreme macro close-ups, dynamic tracking zooms, and slow cinematic dollies. Maintain moody, dramatic, or suspenseful lighting depending on the subject's tension.`,
        scriptRules: `Follow the American Cinematic Narrator framework. Structure: Hook (0-3s 'what if' scenario) -> Escalation -> Climactic Reveal -> Punchline. Keep sentences short (under 15 words) and punchy. Tone must shift dynamically from curious/factual to tense/horrifying based on the escalating facts.`,
        audioRules: `Primary Ambient: Low-frequency dramatic hums or eerie silence to build suspense.\nSFX: Insert highly specific, visceral Foley sounds matching the 3D action (e.g., bone crunching, liquid splashing, heavy thuds, mechanical clicks, sudden whooshes) perfectly timed with the narrator's beats and pauses.`,
        characterExtractionRules: `Characters must be described strictly as generic but highly detailed 3D animated models. Focus on specific physical states and intense emotional reactions (e.g., sweating, eyes wide in shock, jaw clenched, translucent skin showing anatomy). Do NOT generate photorealistic real humans.`,
        lastMileVideoRules: `Strictly maintain the 3D animated cinematic aesthetic. Enforce the '8-second cinematic punch' rule—one clear visual action per prompt. Absolutely NO text overlays, typography, or UI elements inside the video generation.`,
        defaultNegativePrompt: "live action, real photography, 2d cartoon, anime, Pixar, Disney, hyper-realistic real human, text, subtitles, watermark, low poly 3d, messy CGI, uncanny valley, flat lighting",
        defaultThemes: ["3D Science & Facts", "Myth Busting", "Curiosity & Suspense"],
        defaultModifiers: ["High-End 3D Animation", "Stylized Realism", "Macro Detail", "Dramatic Lighting", "Cinematic Composition"],
        defaultCameraAngles: ["Macro Close-up", "Dynamic Zoom", "Dolly-in"]
    },
    IslamicHistory: {
        id: 'IslamicHistory',
        dropdownName: 'Islamic / Religious History',
        visualRules: `- **Visual Style:** Solemn, respectful, and epic. Use cinematic lighting, grand landscapes, and detailed historical Middle Eastern architecture (e.g., ancient mosques, desert cities, sandstone structures).\n- **Hard Constraints (STRICTLY FORBIDDEN):** Never include modern elements. NEVER include Chinese clothing, Chinese architecture, or Chinese/East Asian characters. NEVER include Hindu deities or polytheistic mythological elements. Ensure period-accurate clothing (e.g., thobes, simple desert garments, historical armor) that fits 7th-century or medieval Arabia.\n- **Content Lock:** Avoid direct visual representation of prophets. Instead, use symbolic imagery, calligraphy, light, or focus on followers, environments, and historical events from a respectful distance.\n- **Tone:** The visuals should evoke a sense of reverence, history, and spiritual gravitas.\n\n**RELIGIOUS CHARACTER FACE-PROTECTION SYSTEM (CRITICAL - MUST BE FOLLOWED):**\n1.  **CHARACTER CLASSIFICATION:** If any character represents or implies a Prophet, Messenger, Angel, or any sacred Islamic figure, classify them as a **SPECIAL RELIGIOUS CHARACTER**.\n2.  **FACE VISIBILITY POLICY (STRICT):**\n    - For any **SPECIAL RELIGIOUS CHARACTER**, facial features must NEVER be visible. Eyes, nose, mouth are strictly forbidden.\n    - Do NOT generate a human face, even partially. This rule overrides realism and artistic style.\n3.  **MANDATORY VISUAL SUBSTITUTION:**\n    - The face MUST be replaced with:\n        - Intense divine light (Noor)\n        - Overexposed glowing head region\n        - Radiant white or golden aura\n        - Strong backlight causing a full silhouette\n        - Fog, light, or shadow obscuring the head\n        - Camera angle from behind or above\n4.  **NEGATIVE VISUAL CONSTRAINT (DO NOT GENERATE):**\n    - The following are strictly prohibited for SPECIAL RELIGIOUS CHARACTERS: visible face, human facial features, eyes, nose, mouth, realistic portrait, identifiable human face, facial details.\nCRITICAL RELIGIOUS RULE: It is strictly forbidden to depict Allah in any form. Prophets and Messengers MUST STRICTLY be shown as glowing backlit silhouettes or entirely obscured by blinding Divine Light (Noor). Zero facial features are allowed.`,
        scriptRules: `**NON-NEGOTIABLE ISLAMIC RULES (HARD CONSTRAINTS):**\n1.  **CREATOR NAMING RULE (CRITICAL):**\n    - NEVER use: God, Lord, Creator, My Lord.\n    - ALWAYS use: Allah.\n    - If the source text uses "God", you MUST automatically replace it with "Allah".\n2.  **QURANIC NAME STANDARDIIZATION (AUTO-FIX):**\n    - You MUST ALWAYS use Quran-accurate Islamic names, not Bible-based names.\n    - Automatically replace:\n        - Eve -> Hawwa\n        - Abraham -> Ibrahim\n        - Noah -> Nuh\n        - Moses -> Musa\n        - Aaron -> Harun\n        - Jesus -> Isa\n        - Solomon -> Sulaiman\n        - David -> Dawud\n        - Jonah -> Yunus\n        - Nimrod -> Namrud\n    - If any incorrect naming appears in the source, silently correct it.`,
        characterExtractionRules: `CRITICAL RELIGIOUS RULE (ISLAMIC NICHE ONLY): If a character represents or implies a Prophet, Messenger, Angel (e.g., Prophet Ibrahim, Angel Jibreel), or any sacred figure: 1. You MUST NOT describe their facial features (eyes, nose, mouth, beard, or skin texture). 2. Their visual description MUST STRICTLY substitute the face with: "A radiant divine light (Noor) obscuring the face, intense overexposed glowing head region, or a strong backlit silhouette with zero facial details visible." 3. This rule overrides all realism and artistic style requirements.`,
        lastMileVideoRules: `The setting, architecture, clothing, and overall atmosphere MUST strictly align with ancient/historical Middle Eastern or Islamic historical aesthetics. ABSOLUTELY DO NOT include modern elements, Chinese elements (e.g., Chinese dress, Chinese people), Hindu deities, or unrelated anachronistic visuals.`,
        defaultNegativePrompt: "modern clothing, modern architecture, chinese clothing, chinese people, chinese architecture, ancient chinese, east asian, black people, african american, contemporary, futuristic, hindu deities, polytheistic imagery, inappropriate clothing, depicting Allah, divine form, prophet faces, depicting prophets, messenger faces, visible facial features on holy figures, physical face on prophets",
        defaultThemes: ["Religion", "History", "Cinematic"],
        defaultModifiers: ["Epic Scale", "Golden Hour Lighting", "Unreal Engine 5", "Highly Detailed Architecture", "Cinematic Haze"],
        defaultCameraAngles: ["Establishing Shot", "Drone Shot", "Low Angle"]
    },
    '2DIslamicMoralStory': {
        id: '2DIslamicMoralStory',
        dropdownName: '2D Islamic Moral Story (Animated)',
        visualRules: `- **Art Style:** 2D vector animation style, classic storybook illustration, painterly textures with vibrant but earthy and warm tones.\n- **Environment & Lighting:** Rural Bengali/Middle-Eastern villages, mud houses, riverbanks, traditional bazaars. Lighting strongly reflects the mood (golden hour sunlight for hope/miracles, foggy dark mornings for hardship).\n- **Camera Movement:** Slow panning across landscapes, static medium shots for dialogue, and slow push-ins (zoom) on expressive faces during emotional prayers.\n- **Core Elements & Focus:** Expressive faces showing sorrow, hope, and greed. Traditional modest clothing (kurtas, hijabs, turbans). Magical/divine elements highlighted with a soft, warm glow (e.g., the glowing fish, golden coins).\n- **Character/Subject Constraints:** Characters must wear culturally appropriate, modest, traditional rural attire. No modern elements, gadgets, or vehicles. Clear visual distinction between humble heroes and arrogant villains.`,
        scriptRules: `- **Hook Strategy:** Starts with a slow, atmospheric scene-setter introducing a relatable, pious protagonist in deep struggle or poverty, immediately creating emotional empathy (e.g., "On the banks of a river lived a poor fisherman...").\n- **Voiceover Style:** Deep, soothing, slow-paced, and emotional narrative male voice. Highly empathetic.\n- **Tone & Pacing:** Emotional, suspenseful during hardships, deeply pious, and ultimately uplifting. Deliberate and slow pacing to let the moral sink in.\n- **Auto-Corrections/Wording:** Heavily use Islamic terminology (e.g., 'Ya Allah', 'Rahmat', 'Kudrat', 'Shukriya', 'Nek aamol'). Avoid modern slang or overly casual language.`,
        audioRules: `[Audio Directives: Ambient: soft river and village nature sounds, No musical instruments, Ambient vocal hums (Nasheed style without words) | SFX: net splashes, gold coin clinks, magical chimes, emotional vocal hums]`,
        characterExtractionRules: `Characters must explicitly reflect traditional Islamic/rural archetypes (e.g., pious poor man, arrogant rich merchant, mysterious elderly beggar). Faces must be highly expressive but culturally modest.`,
        lastMileVideoRules: `Ensure lighting dynamically matches the emotional beat of the script (darkness for struggle, radiant light for miracles).`,
        defaultNegativePrompt: `modern clothing, cars, electronics, cities, 3d render, hyper-realistic, loud pop music, musical instruments, fast cuts, jarring transitions, comedy, slapstick, text, watermark, messy environment, futuristic`,
        forceFixedCamera: false,
        defaultThemes: ["Patience & Divine Reward", "Greed vs Piety", "Miracles of Faith", "Honesty in Poverty"],
        defaultModifiers: ["Storybook illustration", "Rural village aesthetic", "Emotional lighting", "Traditional clothing"],
        defaultCameraAngles: ["Wide establishing shot", "Slow pan", "Medium shot", "Close-up on expressive face"]
    },
    'BengaliRuralHorror2D': {
        id: 'BengaliRuralHorror2D',
        dropdownName: '2D Bengali Horror Cartoon (Bhuter Golpo)',
        visualRules: `- **Art Style:** 2D flat vector animation (traditional Bengali cartoon/Softoons style).\n- **Environment & Lighting:** Dark, stormy, and moody. Continuous heavy rain, fog, and lightning flashes. Dim, localized lighting from hurricane lanterns (হ্যারিকেন) or old dim bulbs. Settings include graveyards, muddy village roads, and ruined Zamindar mansions.\n- **Camera Movement:** Static wide shots to establish the eerie environment, slow pans across dark landscapes, and sudden dramatic zoom-ins on terrifying faces or glowing eyes during jump scares.\n- **Core Elements & Focus:** Bullock carts, horse-drawn carriages, skeletons hidden under shawls, corpses with sewn amulets, and traditional rural clothing.\n- **Character/Subject Constraints:** Characters MUST wear traditional Bengali attire (lungi, dhoti, gamcha, sari, kurta). Ghosts/entities should initially appear as normal humans or concealed figures, later revealing glowing red/green eyes, sharp long nails, or skeletal/rotting features.`,
        scriptRules: `- **Hook Strategy:** Start with a desolate, atmospheric rural setting (heavy rain, dark night, isolated muddy road, or old graveyard). Introduce an innocent traveler or villagers facing a sudden, eerie anomaly.\n- **Voiceover Style:** Deep, dramatic Bengali storytelling voice for narration. Expressive character voices (trembling/terrified for victims; raspy, echoing, or creepily calm for ghosts/entities).\n- **Tone & Pacing:** Slow, suspenseful build-up rooted in rural folklore. It begins with mundane rural struggles and gradually escalates into terrifying supernatural encounters driven by past injustices or curses.\n- **Auto-Corrections/Wording:** Use traditional Bengali rural vocabulary (শ্মশান, গোরস্থান, মোড়ল, গরুর গাড়ি, কুপি বাতি, হ্যারিকেন, তাবিজ, জমিদার). STRICTLY AVOID any modern technology terms (drones, smartphones, internet, cars, sci-fi elements).`,
        audioRules: `[Audio Directives: Ambient: heavy rain, thunderstorms, and rural night wildlife | SFX: creepy echoing laughter, lightning crashes, and bone-cracking jump scares]`,
        characterExtractionRules: `All characters must be in 2D vector style wearing traditional rural Bengali attire. Ghosts must have glowing eyes, long sharp nails, or skeletal features. AVOID ALL modern clothing, accessories, and gadgets.`,
        lastMileVideoRules: `Apply a dark, nighttime color grade with heavy shadows. Overlay continuous rain and periodic lightning flash effects to maintain a stormy atmosphere.`,
        defaultNegativePrompt: `modern technology, drones, smartphones, cars, sci-fi elements, 3d render, hyper-realism, bright daylight, western clothing, neon lights, anime style, futuristic cities, modern gadgets, upbeat music`,
        forceFixedCamera: false,
        defaultThemes: ["Haunted Graveyard", "Cursed Zamindar Mansion", "Rainy Night Encounter"],
        defaultModifiers: ["2D vector animation", "Rural Bengali folklore", "Dark stormy lighting"],
        defaultCameraAngles: ["Static wide shot", "Slow zoom on terrified face", "Low angle spooky perspective"]
    },
    'CinematicEpicHistory': {
        id: 'CinematicEpicHistory',
        dropdownName: 'Cinematic Epic History Documentary',
        visualRules: `- **Art Style:** Hyper-realistic cinematic CGI, high-end historical recreation (Unreal Engine 5 style).\n- **Environment & Lighting:** Gloomy atmospheric fog, dramatic chiaroscuro, overcast skies, dusty battlefields, golden hour sunlight cutting through dust, burning ancient villages.\n- **Camera Movement:** Slow drone push-ins, wide epic establishing shots of massive armies, slow pans over tactical ancient maps, static medium shots of generals in command tents.\n- **Core Elements & Focus:** Massive scale armies, period-accurate armor (Roman, Spartan, Persian), tactical battle maps on tables, shields, spears, historical architecture.\n- **Character/Subject Constraints:** Stoic, gritty, heavily armored. Dirt, sweat, and blood on faces. No cartoonish expressions; characters must look like hardened, battle-worn historical figures.`,
        scriptRules: `- **Hook Strategy:** Starts by immediately immersing the viewer in a high-stakes historical moment, often establishing the date, location, and the massive scale of the threat in the first 3 seconds (e.g., "August 480 BCE. Thermopylae, Greece. Picture this... You're standing at the gates of the world...").\n- **Voiceover Style:** Deep documentary male. Authoritative, grave, dramatic, and storytelling-focused.\n- **Tone & Pacing:** Epic, stoic, tense, and melancholic. Pacing is deliberate, using pauses to let the massive scale of armies and historical gravity sink in.\n- **Auto-Corrections/Wording:** Use grandiose, period-accurate military terms (e.g., use 'legions', 'empire', 'annihilated', 'subdue', 'reckoning' instead of 'army', 'country', 'beaten', 'win').`,
        audioRules: `[Audio Directives: Ambient: ominous low wind and distant army murmur | SFX: heavy cinematic boom, rhythmic marching, distant war drums]`,
        characterExtractionRules: `Characters must be extracted with highly period-accurate clothing/armor descriptions (e.g., "Roman general wearing ornate Lorica Squamata armor and red cape"). Expressions must be stoic, serious, or battle-worn.`,
        lastMileVideoRules: `Maintain absolute historical cinematic realism. No modern elements, no text overlays, no unnatural fast movements. Every shot must feel like a multi-million dollar movie.`,
        defaultNegativePrompt: `modern elements, bright cheerful colors, cartoon, 3d low poly, futuristic, sci-fi, smiling faces, fast comedy motion, anachronisms, text, watermark, messy sketches, clean spotless clothing`,
        forceFixedCamera: false,
        defaultThemes: ["Epic Battles", "Ancient History", "Cinematic Documentary"],
        defaultModifiers: ["Unreal Engine 5", "Hyper-realistic", "Cinematic Lighting", "Volumetric Fog", "8K Resolution"],
        defaultCameraAngles: ["Wide Establishing Shot", "Drone Pan", "Slow Push-in"]
    },
    'CinematicScienceDoc': {
        id: 'CinematicScienceDoc',
        dropdownName: 'Premium Science Documentary',
        visualRules: `- **Art Style:** Hyper-realistic 3D render, cinematic CGI, high-end scientific visualization.\n- **Environment & Lighting:** Dramatic cinematic lighting, cosmic lens flares, atmospheric fog, realistic textures (scales, water, leaves, rocky terrains), deep space absolute black levels.\n- **Camera Movement:** Slow panning, majestic orbital fly-bys, slow drone push-ins, static wide landscape shots. Absolutely no fast or shaky camera movements.\n- **Core Elements & Focus:** Extinct prehistoric creatures, cosmic bodies (planets, stars), geological formations, scale and size comparisons.\n- **Character/Subject Constraints:** Scientifically accurate representations of animals, insects, or planets. No modern humans, no modern architecture, no cartoonish features.`,
        scriptRules: `- **Hook Strategy:** Starts with a mind-bending fact or a grand visualization of a completely different reality (e.g., Earth millions of years ago, or deep space). It transports the viewer instantly to another time or dimension.\n- **Voiceover Style:** Deep documentary male, authoritative, calm, perfectly paced (David Attenborough or Morgan Freeman style).\n- **Tone & Pacing:** Awe-inspiring, educational, slow and deliberate. Builds suspense through the sheer scale of time, space, and evolution.\n- **Auto-Corrections/Wording:** Use scientific and grand terms (e.g., 'eons', 'unfathomable', 'majestic', 'primordial'). Avoid all modern slang or hype words (avoid 'insane', 'crazy', 'mind-blowing').`,
        audioRules: `[Audio Directives: Ambient: deep cinematic drone and natural atmospheres | SFX: low-frequency rumbles, realistic nature sounds, and subtle whooshes]`,
        characterExtractionRules: `Only extinct prehistoric animals, microorganisms, or cosmic entities. Absolutely no modern human characters or modern architecture.`,
        lastMileVideoRules: `Apply a subtle cinematic color grade, realistic film grain, and subtle vignette. Ensure high contrast in space scenes and rich, deep greens/browns in prehistoric Earth scenes.`,
        defaultNegativePrompt: `modern humans, modern buildings, cartoon, 2d animation, fast cuts, shaky camera, pop music, bright neon UI, text overlays, visible faces, watermark, loud jarring music, robotic TTS voice, low quality, pixelated`,
        forceFixedCamera: false,
        defaultThemes: ["Prehistoric Earth", "Space Exploration", "Cosmic Mysteries", "Evolutionary Biology"],
        defaultModifiers: ["Cinematic 3D", "Hyper-realistic", "BBC Documentary Style", "8k Resolution"],
        defaultCameraAngles: ["Orbital fly-by", "Slow push-in", "Wide landscape pan"]
    },
    'BackyardBugMyths': {
        id: 'BackyardBugMyths',
        dropdownName: 'Nature & Bug Myths Documentary',
        visualRules: `- **Art Style:** Macro videography, ultra-high-definition nature footage, realistic.\n- **Environment & Lighting:** Everyday backyard environments (porches, brick walls, woodpiles, cracks) combined with extreme macro studio lighting on the insects.\n- **Camera Movement:** Static top-down macro shots, slow dramatic push-ins on the insect's face or "weapons" (stingers/proboscis), and slight handheld POV for human interaction.\n- **Core Elements & Focus:** The anatomy of the insect (e.g., the cone-shaped nose of a kissing bug, the mud nest of a wasp). Human hands are often shown reaching toward the bug to establish scale and danger.\n- **Character/Subject Constraints:** Focus heavily on the insect. When humans are shown, it should strictly be hands, fingers, or arms interacting cautiously with the subject; no full faces.`,
        scriptRules: `- **Hook Strategy:** Start with a dramatic warning or point out a common, overlooked object (e.g., "There is a small mud structure on your wall right now... and your first instinct is wrong").\n- **Voiceover Style:** Deep documentary male. Authoritative, slightly suspenseful, yet highly educational and myth-busting.\n- **Tone & Pacing:** Suspenseful build-up leading to a mind-blowing reveal. Pacing is deliberate, like a nature thriller mixed with rapid-fire scientific facts.\n- **Auto-Corrections/Wording:** Avoid "poisonous" when referring to bites/stings, use "venomous". Use words like "misunderstood", "predator", "myth", "parasite", and "evolution".`,
        audioRules: `[Audio Directives: Ambient: low suspenseful synth hum and night nature | SFX: microscopic bug clicking, cinematic bass booms, subtle whooshes]`,
        characterExtractionRules: `Focus strictly on anatomically accurate insects and spiders. Human elements must be limited to hands/fingers for scale.`,
        lastMileVideoRules: `Ensure macro shots have a shallow depth of field (sharp focus on the insect with a blurred background) to heighten the cinematic documentary feel.`,
        defaultNegativePrompt: `cartoonish, 3d animation, fake CGI bugs, slapstick comedy, fast vlogger pacing, bright pop music, robotic TTS voice, messy text overlays, full human faces, unnatural environments`,
        forceFixedCamera: false,
        defaultThemes: ["Hidden Backyard Dangers", "Myth-Busting Nature", "Misunderstood Predators"],
        defaultModifiers: ["Macro Videography", "Cinematic Documentary", "Suspenseful"],
        defaultCameraAngles: ["Extreme Macro Close-up", "Over-the-shoulder POV", "Static ground-level"]
    },
    'PrehistoricDocumentary': {
        id: 'PrehistoricDocumentary',
        dropdownName: 'Cinematic Prehistory',
        visualRules: `- **Art Style:** Hyper-realistic 3D CGI, high-end BBC/Apple TV documentary style, photorealistic textures (scales, fur, feathers).\n- **Environment & Lighting:** Dramatic and atmospheric. Heavy use of volumetric fog, god rays, volcanic ash skies, golden hour savannas, and dense, misty primordial jungles.\n- **Camera Movement:** Slow, sweeping drone pans over landscapes, low-angle tracking shots to emphasize massive scale, and slight handheld shaky-cam during roars or impacts.\n- **Core Elements & Focus:** Extinct megafauna, apex predators, dramatic scale comparisons (e.g., "snake longer than a school bus"), catastrophic natural events (asteroids, volcanoes).\n- **Character/Subject Constraints:** Scientifically accurate prehistoric animals and early hominids. Absolutely no modern humans, clothing, or architecture.`,
        scriptRules: `- **Hook Strategy:** High-stakes visualization. Drop the viewer immediately into a catastrophic or awe-inspiring moment in deep time (e.g., "Imagine standing on a beach 66 million years ago, the morning after the world ended...").\n- **Voiceover Style:** Deep, authoritative documentary male (e.g., David Attenborough or dramatic History Channel narrator). Slow, resonant, and suspenseful.\n- **Tone & Pacing:** Epic, suspenseful, and awe-inspiring. Uses slow, atmospheric build-ups followed by dramatic reveals of massive scale or brutal nature.\n- **Auto-Corrections/Wording:** Use dramatic temporal scale words ('millions of years', 'epoch', 'apocalypse', 'evolutionary arms race'). Avoid modern colloquialisms. Use scientific names but immediately describe their terrifying/majestic physical traits.`,
        audioRules: `[Audio Directives: Ambient: deep primordial jungle or desolate wind | SFX: heavy cinematic impacts, distant beast roars, earthy footstep thuds]`,
        characterExtractionRules: `All characters must be scientifically accurate extinct animals, dinosaurs, or prehistoric hominids.`,
        lastMileVideoRules: `Apply cinematic color grading, slightly desaturated for apocalyptic scenes (ash/dust), heavy contrast, with hyper-detailed focus on animal eyes and textures.`,
        defaultNegativePrompt: `modern humans, modern cities, buildings, text, 2d animation, cartoon style, bright pop colors, futuristic tech, low quality, watermarks, robotic voiceover, comedic tone, modern vehicles, text overlays`,
        forceFixedCamera: false,
        defaultThemes: ["Mass Extinction", "Apex Predators", "Evolutionary Marvels", "Ice Age Survival"],
        defaultModifiers: ["Cinematic Lighting", "Hyper-realistic 3D", "Documentary Style", "Epic Scale"],
        defaultCameraAngles: ["Low Angle Giant POV", "Sweeping Drone Shot", "Close-up Eye Detail"]
    },
    'HyperRealWildlifeSurvival': {
        id: 'HyperRealWildlifeSurvival',
        dropdownName: 'Hyper-Realistic Wildlife Drama (No Voiceover)',
        visualRules: `- **Art Style:** Ultra-HD hyper-realistic 3D CGI / Macro wildlife videography.\n- **Environment & Lighting:** African savanna, dusty deserts, or murky rivers. Dramatic golden hour sun, heavy volumetric dust, or intense moonlight.\n- **Camera Movement:** Low-angle ground POVs, slow tense push-ins, dynamic slow-motion during action, and split underwater shots.\n- **Core Elements & Focus:** Intense animal facial expressions, predator-prey combat, symbiotic parasite removal, and microscopic details (venom droplets, individual ticks, fur).\n- **Character/Subject Constraints:** Wild animals only. No humans. Extreme anatomical detail and aggressive/defensive posturing required.`,
        scriptRules: `- **Hook Strategy:** 1-3 seconds of extreme macro close-ups showing imminent danger (e.g., cobra rearing, thick tick infestations) before a sudden movement.\n- **Voiceover Style:** NO VOICEOVER - Ambient only.\n- **Tone & Pacing:** High-stakes suspense escalating to rapid, chaotic conflict, followed by a calm, satisfying resolution.\n- **Auto-Corrections/Wording:** Prompts must prioritize "hyper-realistic", "3D cinematic render", "macro photography". Avoid terms like "cartoon", "documentary narrator".`,
        audioRules: `[Audio Directives: Ambient: tense desert winds | SFX: aggressive hissing, heavy cinematic impacts, and macro nature sounds]`,
        characterExtractionRules: `All characters must be anatomically accurate, hyper-detailed wild animals.`,
        lastMileVideoRules: `Maintain ultra-sharp subject focus with a blurred, cinematic depth-of-field background (bokeh).`,
        defaultNegativePrompt: `human, cartoon, 2d animation, flat vector, text, watermark, voiceover, artificial environments, low resolution, unnatural colors, UI elements`,
        forceFixedCamera: false,
        defaultThemes: ["Predator vs Prey", "Symbiotic Parasite Removal", "Desert Showdown"],
        defaultModifiers: ["Hyper-realistic 8k", "Cinematic Slow-Motion", "Macro Detail"],
        defaultCameraAngles: ["Extreme Low-Angle POV", "Macro Close-up", "Underwater Split-Shot"]
    },
    'HistoricalAISurvival': {
        id: 'HistoricalAISurvival',
        dropdownName: 'Historical Survival Reconstruction',
        visualRules: `- **Art Style:** Hyper-realistic AI generation, gritty, dark cinematic.\n- **Environment & Lighting:** Cramped wooden interiors, lantern-lit chiaroscuro, cold blue/gray exterior storms.\n- **Camera Movement:** Static wide shots of cramped spaces, slow push-ins, dramatic close-ups of weathered faces.\n- **Core Elements & Focus:** Period-accurate clothing (wool, linen), rugged wooden structures, harsh weather conditions.\n- **Character/Subject Constraints:** Dirty, weathered faces, historically accurate attire, no clean or modern elements.`,
        scriptRules: `- **Hook Strategy:** High-stakes scenario instantly contradicting modern logic (e.g., freezing weather, zero heating, yet everyone survives).\n- **Voiceover Style:** Deep documentary male, serious and authoritative.\n- **Tone & Pacing:** Suspenseful, myth-busting, methodical build-up.\n- **Auto-Corrections/Wording:** Use period-accurate terms ('hull', 'galley', 'grog', 'timber'); avoid modern slang.`,
        audioRules: `[Audio Directives: Ambient: stormy ocean and creaking wood | SFX: wind howling, water splashing, lantern clinking]`,
        characterExtractionRules: `All characters must appear weathered, unkempt, and strictly in period-accurate clothing.`,
        lastMileVideoRules: `Apply a cold, desaturated color grade with a dark vignette.`,
        defaultNegativePrompt: `modern clothing, bright neon lights, clean environments, anime style, upbeat music, digital tech, visible UI, cheerful tone, modern ships, sunny skies`,
        forceFixedCamera: false,
        defaultThemes: ["Harsh Survival", "Historical Myths", "Extreme Conditions"],
        defaultModifiers: ["Gritty realism", "Cinematic lighting", "Period-accurate"],
        defaultCameraAngles: ["Close-up face", "Wide cramped interior", "Low angle dramatic"]
    },
    'DeepSeaDocumentary': {
        id: 'DeepSeaDocumentary',
        dropdownName: 'Cinematic Deep Sea Documentary',
        visualRules: `- **Art Style:** Photorealistic, high-definition macro videography.\n- **Environment & Lighting:** Pitch-black deep ocean environments. Illumination comes solely from the bioluminescence of the creatures or the harsh, focused beam of an ROV (Remotely Operated Vehicle) spotlight.\n- **Camera Movement:** Slow drifting, gentle panning, and floating POVs that mimic the natural buoyancy and water currents.\n- **Core Elements & Focus:** Bizarre/alien marine life (translucent jellyfish, deep-sea squids, hydrothermal vents), glowing particles (marine snow), and underwater research submersibles.\n- **Character/Subject Constraints:** Only realistic marine life and authentic underwater research vehicles. No humans speaking to the camera, no cartoon characters, and no brightly sunlit surface reefs.`,
        scriptRules: `- **Hook Strategy:** A slow, philosophical statement about the vastness, darkness, or alien nature of the unknown ocean, paired with a visually mesmerizing creature.\n- **Voiceover Style:** Deep documentary male (calm, authoritative, David Attenborough-esque).\n- **Tone & Pacing:** Meditative, awe-inspiring, poetic yet highly scientific. The pacing is intentionally slow to evoke the feeling of drifting in the ocean.\n- **Auto-Corrections/Wording:** Use precise scientific terminology ('abyss', 'pelagic', 'benthos', 'bioluminescence', 'chemosynthesis'). Avoid modern slang, hyper-enthusiastic phrasing, or rushed dialogue.`,
        audioRules: `[Audio Directives: Ambient: deep underwater pressure drone | SFX: subtle water swooshes, sonar pings, and mechanical ROV whirring]`,
        characterExtractionRules: `All subjects must be photorealistic deep-sea marine life or authentic oceanographic research equipment.`,
        lastMileVideoRules: `Ensure deep-sea shots maintain a pure pitch-black background with high contrast on the glowing or spotlight-illuminated subjects.`,
        defaultNegativePrompt: `bright sunlight, shallow coral reefs, fast camera movement, cartoon styles, human faces, loud upbeat music, vibrant UI elements, comedic tone, rapid jump cuts, artificial daylight`,
        forceFixedCamera: false,
        defaultThemes: ["Deep Sea Mysteries", "Bioluminescence", "Ocean Exploration"],
        defaultModifiers: ["Cinematic lighting", "Macro videography", "Pitch black background"],
        defaultCameraAngles: ["Slow tracking shot", "Extreme close-up", "Floating ROV POV"]
    },
    'SleepHistoryStory': {
        id: 'SleepHistoryStory',
        dropdownName: 'History Sleep Stories',
        visualRules: `- **Art Style:** 2D flat vector animation or stylized historical illustrations with a dark, sepia, or night-time color palette.\n- **Environment & Lighting:** Muted, low-light, warm amber and dark shadows. Designed to emit minimal blue light from the screen so it doesn't wake the viewer.\n- **Camera Movement:** Extremely slow, continuous panning or subtle push-ins. No sudden cuts or shaky cam.\n- **Core Elements & Focus:** Historical figures, ancient maps, burning torches, slow-moving ships, ancient architecture.\n- **Character/Subject Constraints:** Characters should have calm or stoic expressions. Minimal rapid movement.`,
        scriptRules: `- **Hook Strategy:** Does not use a traditional high-energy hook. Instead, it uses a "hypnotic induction" hook in the first 10 seconds—asking the viewer to get comfortable, dim the lights, turn on a fan, and prepare for a journey.\n- **Voiceover Style:** Slow-paced, deep, calming, meditative documentary male.\n- **Tone & Pacing:** Meditative, atmospheric, and highly descriptive. The pacing is intentionally slow and rhythmic to induce sleepiness.\n- **Auto-Corrections/Wording:** Use words like 'ease into', 'journey', 'shadows', 'ancient', 'gentle'. Avoid sudden exclamations, modern slang, or high-energy transitions (avoid "Smash that like button!").`,
        audioRules: `[Audio Directives: Ambient: low warm dark drone with soft ocean waves | SFX: muted, distant environmental sounds only]`,
        characterExtractionRules: `All characters must wear period-accurate historical clothing (e.g., Greek armor, medieval robes) and be rendered in a 2D illustrated style with muted colors.`,
        lastMileVideoRules: `Apply a warm, dark color-grading filter (reduce brightness by 20%, decrease blue tones) to ensure the video is sleep-friendly in a dark room.`,
        defaultNegativePrompt: `loud noises, jump scares, fast cuts, bright white lights, neon colors, modern technology, enthusiastic YouTuber voice, jarring transitions, high-energy music, flashing lights, 3d glossy renders`,
        forceFixedCamera: false,
        defaultThemes: ["Greek Mythology", "Ancient Empires", "Medieval Legends", "Lost Civilizations"],
        defaultModifiers: ["Sleep-inducing", "Dark mode", "Atmospheric", "Relaxing", "Slow-burn"],
        defaultCameraAngles: ["Slow continuous pan", "Ultra-slow zoom in", "Static wide shot"]
    },
    'WildlifeBirdDoc': {
        id: 'WildlifeBirdDoc',
        dropdownName: 'Avian Wildlife Documentary',
        visualRules: `- **Art Style:** Hyper-realistic 3D CGI or ultra-high-definition wildlife videography.\n- **Environment & Lighting:** Lush, dense tropical rainforests with dappled sunlight, or grassy, misty marshlands/swamps.\n- **Camera Movement:** Slow panning shots, steady tracking of animal movements, and extreme macro close-ups on eyes, beaks, and eggs.\n- **Core Elements & Focus:** The day-by-day life cycle (nesting, hatching, growing), unique feeding habits, and stand-offs with predators (crocodiles, wild dogs).\n- **Character/Subject Constraints:** Scientifically accurate anatomical details (feathers, casques, heavy beaks). No human presence.`,
        scriptRules: `- **Hook Strategy:** Introduce a bizarre or intimidating physical trait of the bird immediately, placing it in its harsh natural habitat.\n- **Voiceover Style:** Deep documentary male. Calm, authoritative, and highly educational (BBC Earth style).\n- **Tone & Pacing:** Chronological and educational. Slow, steady pacing that builds tension only during predator encounters or harsh weather.\n- **Auto-Corrections/Wording:** Use terms like 'incubation', 'hatchling', 'predator', 'foraging'. Avoid humanizing animals or using cartoonish language.`,
        audioRules: `[Audio Directives: Ambient: dense jungle or marshland | SFX: water splashes, heavy beak claps, leaf rustling]`,
        characterExtractionRules: `Only highly detailed, anatomically correct wild birds, reptiles, and mammals.`,
        lastMileVideoRules: `Enhance natural greens and earthy tones. High contrast on textures like wet feathers, mud, and water reflections.`,
        defaultNegativePrompt: `modern humans, vehicles, buildings, cartoon style, 2d animation, bright unnatural neon colors, text overlays, comedic sound effects, robotic voices`,
        forceFixedCamera: false,
        defaultThemes: ["Life Cycle & Hatching", "Apex Bird Survival", "Jungle Ecosystems"],
        defaultModifiers: ["Hyper-realistic Nature", "BBC Earth Cinematic", "Macro Wildlife"],
        defaultCameraAngles: ["Eye-level Tracking", "Extreme Close-up", "Low Angle Predator View"]
    },
    'SatisfyingCraftASMR': {
        id: 'SatisfyingCraftASMR',
        dropdownName: 'Satisfying DIY & Resin Art (No Voiceover)',
        visualRules: `- **Art Style:** Hyper-realistic, vibrant colors, clean DIY aesthetic.\n- **Environment & Lighting:** Bright natural outdoor daylight or well-lit clean studio spaces. High contrast.\n- **Camera Movement:** Smooth tracking shots following the action, static top-down macro shots.\n- **Core Elements & Focus:** The transformation of raw materials (epoxy resin, concrete, molten metal) into art.\n- **Character/Subject Constraints:** Faces are secondary or obscured. Total focus on gloved hands and body mechanics.`,
        scriptRules: `- **Hook Strategy:** Immediate visual action (pouring, mixing, breaking) within the first 1 second.\n- **Voiceover Style:** NO VOICEOVER - Ambient only.\n- **Tone & Pacing:** Fast-paced visual progression with a relaxing, hypnotic vibe.\n- **Auto-Corrections/Wording:** None (Visual/ASMR focus).`,
        audioRules: `[Audio Directives: Ambient: <dead silence> | SFX: <thick liquid pouring, heavy scraping, sizzling, ASMR tapping>]`,
        characterExtractionRules: `Isolate hands and working posture; faces must remain out of primary focus.`,
        lastMileVideoRules: `Boost color saturation on liquid materials (resin, neon, glowing elements).`,
        defaultNegativePrompt: `voiceover, talking, dark low-lit environments, messy chaotic backgrounds, slow intros, text on screen, robotic TTS voice`,
        forceFixedCamera: false,
        defaultThemes: ["Epoxy Resin", "Concrete Art", "Molten Metal"],
        defaultModifiers: ["Oddly Satisfying", "ASMR", "Hyper-realistic"],
        defaultCameraAngles: ["Top-down macro", "Mid-shot tracking"]
    },
    'DarkMaritimeHistory': {
        id: 'DarkMaritimeHistory',
        dropdownName: 'Dark Maritime Mythology',
        visualRules: `- **Art Style:** Hyper-realistic oil paintings, dark fantasy concept art, cinematic 3D.\n- **Environment & Lighting:** Stormy seas, dense fog, candlelit caves, twilight. High contrast, moody shadows.\n- **Camera Movement:** Slow push-ins, subtle parallax, slow pans across static scenes.\n- **Core Elements & Focus:** Ocean waves, distressed sailors, mystical goddesses, ancient maps, weathered ships.\n- **Character/Subject Constraints:** Ethereal, imposing female figures; weathered, expressive, dirty sailors.`,
        scriptRules: `- **Hook Strategy:** Open with a mysterious, poetic historical premise (e.g., an unnamed map, faded ink) to build immediate intrigue.\n- **Voiceover Style:** Deep documentary male, resonant, slow, authoritative.\n- **Tone & Pacing:** Suspenseful, slow-burn, atmospheric, philosophical.\n- **Auto-Corrections/Wording:** Use archaic/mythic terminology ('abyss', 'realm', 'wrath'). Avoid modern slang or upbeat transitions.`,
        audioRules: `[Audio Directives: Ambient: dark cinematic ocean wind | SFX: wooden ship creaking, distant thunder, heavy cinematic booms]`,
        characterExtractionRules: `Characters must reflect specific historical eras (ancient Greeks, 18th-century pirates) or mythical archetypes.`,
        lastMileVideoRules: `Apply subtle vignette and heavy film grain for historical texture.`,
        defaultNegativePrompt: `modern elements, bright vibrant colors, cartoon style, fast-paced edits, upbeat music, robotic TTS voice, text on screen, pop-culture references, clean pristine clothing, sunny cheerful skies`,
        forceFixedCamera: false,
        defaultThemes: ["Maritime Myths", "Pirate Lore", "Ancient Gods"],
        defaultModifiers: ["Cinematic Lighting", "Dark Fantasy", "Atmospheric Fog"],
        defaultCameraAngles: ["Slow push-in", "Wide establishing shot"]
    },
    'CinematicWildlifeDoc': {
        id: 'CinematicWildlifeDoc',
        dropdownName: 'Epic Nature Documentary',
        visualRules: `- **Art Style:** Hyper-realistic, 8k, National Geographic cinematic wildlife videography.\n- **Environment & Lighting:** African savanna, dusty deserts, golden hour sunsets, and clear underwater macro shots.\n- **Camera Movement:** Slow panning, extreme macro push-ins on eyes/insects, shaky low-angle action during fights, sweeping drone shots.\n- **Core Elements & Focus:** Realistic animal anatomy, predator-prey dynamics, symbiotic relationships, and swarms (bees, flies).\n- **Character/Subject Constraints:** Wild animals only. Highly detailed fur, scales, and biological features. No human presence.`,
        scriptRules: `- **Hook Strategy:** Open with a high-stakes, visceral struggle or a visually striking extreme close-up of a harsh environmental condition (e.g., blood-sucking ticks, a glaring cobra).\n- **Voiceover Style:** Deep, authoritative documentary male voice (Attenborough-style). Slow, deliberate, and dramatic.\n- **Tone & Pacing:** Suspenseful, educational, and majestic. Slow build-ups of tension that erupt into rapid action sequences.\n- **Auto-Corrections/Wording:** Use visceral, dramatic verbs ('enduring', 'assault', 'fury', 'relentless'). Avoid casual, modern, or anthropomorphic slang.`,
        audioRules: `[Audio Directives: Ambient: Wind and savanna wildlife | SFX: animal growls, hisses, heavy buzzing, cinematic action whooshes]`,
        characterExtractionRules: `All characters must be biologically accurate wild animals acting on natural instincts.`,
        lastMileVideoRules: `Ensure cinematic depth of field (blurred backgrounds during close-ups) and warm, golden-hour color grading.`,
        defaultNegativePrompt: `human, anthropogenic items, modern elements, 3d render, cartoon, visible text, watermark, fantasy creatures, robotic TTS voice, low resolution, urban settings`,
        forceFixedCamera: false,
        defaultThemes: ["Survival", "Symbiosis", "Predator vs Prey", "Harsh Nature"],
        defaultModifiers: ["Cinematic", "8k resolution", "National Geographic style", "Macro detail"],
        defaultCameraAngles: ["Extreme close-up", "Low-angle action", "Drone aerial", "Slow pan"]
    },
    '3DAnatomyDigestion': {
        id: '3DAnatomyDigestion',
        dropdownName: '3D Anatomy & Food Science',
        visualRules: `- **Art Style:** Clean, stylized 3D medical animation, holographic biology, anatomical educational rendering.\n- **Environment & Lighting:** Dark or solid neutral background with clinical, bright spotlighting on the organs. Use clean, translucent, stylized educational aesthetics instead of realistic flesh to bypass gore filters. Replace realistic blood/meat with abstract glowing neon colors.\n- **Camera Movement:** Starts with an X-ray transparent view of the human skeleton/muscles, then seamless zoom-in to a macro view inside the specific organ (stomach/intestines), slowly panning as the food travels.\n- **Core Elements & Focus:** The mechanical/chemical transformation of the food. Stylized stomach lining, glowing liquid acid dissolving the food into abstract particles. CRITICAL SAFETY RULE: Must maintain a sterile, family-friendly science-museum aesthetic. Strictly no realistic flesh, blood, or gory details.\n- **Character/Subject Constraints:** Only transparent 3D anatomical human models (bones, muscles, organs). No real human skin, hair, or faces.`,
        scriptRules: `- **Hook Strategy:** Video must start with a direct "You" statement declaring the action. (e.g., "You ate a boiled egg on an empty stomach", "You drank a glass of warm water").\n- **Voiceover Style:** Clear, authoritative, deep documentary male AI voice. Highly educational and clinical.\n- **Tone & Pacing:** Scientific, fascinating, and steady. The pacing perfectly matches the biological breakdown happening on screen.\n- **Auto-Corrections/Wording:** Must use accurate biological terms (e.g., "stomach acid," "digestive enzymes," "peptide fragments," "small intestine," "peristalsis"). Avoid casual or slang language.`,
        audioRules: `[Audio Directives: Ambient: <low heartbeat and bodily hum> | SFX: <wet squishing, liquid splashing, acid sizzling, organic movement>]`,
        characterExtractionRules: `Strictly render abstract 3D anatomical models and internal organs. Do not generate real human beings or real skin.`,
        lastMileVideoRules: `STRICT SAFETY FILTER BYPASS: Ensure absolutely NO generation of blood, gore, open wounds, surgery, or raw meat. Keep all internal biological processes looking like a high-end, sterile, translucent science museum exhibit. Add glowing bioluminescent particle effects when nutrients are absorbed.`,
        defaultNegativePrompt: `blood, gore, surgery, wound, raw meat, realistic flesh, medical horror, visceral, disturbing, violence, red fleshy textures, disease, infection, trypophobia triggers, real humans, real faces, skin, cartoon, 2d animation, outdoor environments, daylight, pop music, fast jarring jump cuts, comedy, non-medical context, text overlays blocking the organ`,
        forceFixedCamera: false,
        defaultThemes: ["Empty Stomach Reactions", "Food Digestion Breakdown", "Nutrient Absorption"],
        defaultModifiers: ["3D Medical Animation", "Clean Holographic Anatomy", "Macro Internal View"],
        defaultCameraAngles: ["X-Ray Body View", "Macro Organ Shot", "Tracking Intestine Shot"]
    },
    '3DAnimalRescue': {
        id: '3DAnimalRescue',
        dropdownName: '3D Animal Rescue (Kids Cartoon)',
        visualRules: `- **Art Style:** Vibrant, extremely colorful, Pixar/Disney 3D style character animation. Characters must have large, expressive, cute eyes (cute chibi aesthetics).
- **Environment:** Brightly-lit tropical jungles, crystal-clear blue seas, or glowing colorful crystal caves. Features high-tech gadgets and cool rescue vehicles.
- **Core Elements:** Visible emotions on animals' faces (crying, laughing, scared), high-tech rescue gear, and friendly cooperative teamwork.
- **Facial Constraints:** Predator characters must NOT look terrifying; designs must remain cartoonish, cute, and 100% child-friendly.`,
        scriptRules: `- **Voiceover Style:** Enthusiastic, emotional, heroic, and tailored for kids.
- **Auto-Corrections:** Automatically replace negative words with positive ones (e.g., replace 'kill', 'die', 'blood' with 'save', 'rescue', 'help').
- **Language/Tone:** Simple, fun, and highly educational. Promotes empathy and teamwork.`,
        defaultNegativePrompt: "photorealistic, scary, terrifying, monstrous shark, blood, violence, weapon, injury, dark environment, night, spooky, realistic animal, low quality, watermark, text, signature",
        defaultThemes: ["3D Animation", "Kids Cartoon", "Adventure"],
        defaultModifiers: ["Pixar 3D Style", "Vibrant Colors", "Octane Render", "Subsurface Scattering", "Soft Global Illumination"],
        defaultCameraAngles: ["Eye-level", "Dynamic Shot"]
    },
    'DangerousOceansDocumentary': {
        id: 'DangerousOceansDocumentary',
        dropdownName: 'Dangerous Oceans Documentary',
        visualRules: `- **Art Style:** Ultra-realistic and cinematic real footage style. Blend of historical archival style and high-quality 3D Map Animation style.
- **Environment:** Turbulent oceans, giant waves crashing on decks, mysterious fog, icy Antarctic settings, or stormy nights.
- **Core Elements:** Epic scale contrast (massive nature vs tiny ships), realistic weather effects, dramatic chiaroscuro lighting.
- **Facial Constraints:** Human faces should show fear, exhaustion, or seriousness. Focus is on the environment, not happy faces.`,
        scriptRules: `- **Voiceover Style:** National Geographic/History channel style—grave, dramatic, and authoritative.
- **Tone:** Extremely serious and descriptive, focusing on nature's power and maritime tragedies.
- **Auto-Corrections:** 'big wave' -> 'towering rogue wave', 'ship' -> 'expedition vessel', 'sailors died' -> 'souls were claimed by the abyss'.`,
        defaultNegativePrompt: "3d cartoon, anime style, bright, vlog vibe, modern objects, smiling face, happy people, cheerful, low quality, watermark, text, signature",
        defaultThemes: ["Nature", "Documentary", "Survival"],
        defaultModifiers: ["Hyper-realistic Marine Footage", "Chiaroscuro Lighting", "Stormy Atmosphere", "8K Resolution", "Epic Scale"],
        defaultCameraAngles: ["Wide Angle", "Drone Shot", "Tracking Shot"]
    },
    'CinematicEarth': {
        id: 'CinematicEarth',
        dropdownName: 'Cinematic Dark Documentary (Earth & Evolution)',
        visualRules: `- **Art Style:** Hyper-realistic cinematic photography, dark fantasy/dark nature style (Unreal Engine 5 / Midjourney v6 aesthetics).
- **Environment:** Deep oceanic abyss, primeval frozen landscapes, foggy prehistoric jungles, heavy dramatic shadows.
- **Core Elements:** Glowing/luminous predator eyes, vicious hunting behaviors, immense scale comparison.
- **Constraints:** Animals must look wild and terrifying (never cute). Human faces should remain hidden in shadows or obscured.`,
        scriptRules: `- **Voiceover Style:** Grave, mysterious, epic, and highly suspenseful documentary style.
- **Tone:** Dark, philosophical, narrative-driven.
- **Auto-Corrections:** 'animal' -> 'ancient beast', 'ocean' -> 'abyss', 'killer' -> 'apex predator'.`,
        defaultNegativePrompt: "cartoon, 3d render, anime, sketch, bright colors, saturated, friendly animal, cute expression, smiling face, cheerful atmosphere, modern technology, watermark, text, signature",
        defaultThemes: ["Dark Nature", "Documentary", "Evolution"],
        defaultModifiers: ["Unreal Engine 5", "Hyper-realistic", "Dark Fantasy", "Chiaroscuro Lighting", "Volumetric Fog", "Macro Details"],
        defaultCameraAngles: ["Wide Angle", "Slow Pan", "Establishing Shot"]
    },
    'CityEvolutionTimelapse': {
        id: 'CityEvolutionTimelapse',
        dropdownName: 'City Evolution Timelapse (No Voice)',
        visualRules: `- **Art Style:** Hyper-realistic cinematic photography.
- **Camera Rule:** Absolutely locked, static camera perspective (fixed camera). No panning or zooming. Ground-level wide landscape shot (Eye-level front angle). STRICTLY NO high-angle, drone, or aerial shots. Ensure a balanced composition where 1/3 of the frame is sky and 2/3 is ground/landscape.
- **Environment:** Seamless evolution of a single landscape over time (wilderness -> medieval -> modern -> cyberpunk).
- **Constraints:** Never close-up on any individual human face. Focus remains entirely on the wide-angle cityscape.`,
        scriptRules: `- **CRITICAL RULE:** NO VOICEOVER. Generate action and ambient sound cues only.\n- **Audio Dynamic Tagger:** You must dynamically append era-specific sound effect tags in the script based on the time period. For example: [SFX: primeval nature, wind], [SFX: medieval horses, sword clashes], [SFX: steam engines, industrial noise], [SFX: futuristic flying cars, cyberpunk hum].\n- **Tone:** Majestic, epic, and highly descriptive to depict the passage of centuries.\n- **CRITICAL WORKFLOW:** Scene 1 must naturally describe the base era and geography. For EVERY subsequent scene (Scene 2 onwards), you MUST start the image prompt with this exact tag: '[IMAGE-TO-VIDEO REFERENCE] Maintain the exact landscape, camera angle, and composition of the base image. Fast-forward the era to [Insert Year]: '. Do not write long geographical descriptions in subsequent scenes; focus entirely on describing the architectural and environmental changes occurring on top of that established landscape.\n- **Transitional Events (CRITICAL):** Do not simply jump from one completed era to another. You MUST generate transitional scenes showing HOW the landscape changed. Include dramatic events like natural disasters (massive earthquakes, floods, devastating fires), epic wars, or rapid construction/reconstruction phases (ruins being cleared, structures being actively built). For example, before a modern city appears, show the previous era's destruction or the active building phase in a fast-paced timelapse manner.\n- **CRITICAL WORKFLOW (Template Enforcement):** You MUST strictly format EVERY image prompt into two isolated sections:\n[FIXED BACKGROUND]: Re-state the exact same geographical landscape word-for-word in every prompt (e.g., 'A wide Nile river on the left, vast golden desert plateau on the right'). Do not alter these words across different eras.\n[DYNAMIC FOREGROUND]: Describe ONLY the changes, human activities, constructions, or ruins happening in this specific era.\nBy isolating the fixed background from the dynamic foreground, the video generator will maintain absolute consistency.\n- **MANDATORY SCENE TAGGING (CRITICAL):** You MUST begin every single new scene or action block with a strict base location and camera angle tag inside brackets, derived from the user's prompt (e.g., [Base Location & Camera: Wide desert landscape, static ground-level shot]). You MUST repeat this EXACT SAME tag at the beginning of EVERY SINGLE SCENE throughout the script to prevent geographical drift during chunking. DO NOT drop this tag.`,
        forceFixedCamera: true,
        defaultNegativePrompt: "camera motion, camera zoom, camera pan, camera tilt, cartoon, 3d animate, anime, sketch, modern cars in ancient times, modern technology in historical settings, close-up face, watermark, text, signature, 3D render, CGI, artificial, fake, plastic, modern outfit, modern clothing, modern dressup in historical or ancient settings",
        defaultThemes: ["History", "Timelapse", "Architecture"],
        defaultModifiers: ["Hyper-realistic 3D", "Unreal Engine 5", "Day-Night Cycle", "Cinematic Lighting", "High-Definition Texture"],
        defaultCameraAngles: ["Fixed-Camera", "Wide-angle Overview", "Eye-level"]
    },
    'FootballTactics': {
        id: 'FootballTactics',
        dropdownName: 'Football Tactics Analysis',
        visualRules: `- **Art Style:** Realistic match footage style, overlaid with technical tactical annotations (red/green circles, movement arrows, tactical lines).
- **Environment:** Brightly lit professional stadium, green grass pitch under floodlights or daylight.
- **Core Elements:** Player positioning, movement tracking, tactical setups, and formations.`,
        scriptRules: `- **Voiceover Style:** Analytical, exciting, resembling a live sports commentary/broadcasting tone.
- **Auto-Corrections:** 'goal' -> 'Incredible Masterpiece' or 'Brilliant Finish'.
- **Tone:** Highly engaging for football fans, technical yet simplified.`,
        defaultNegativePrompt: "cartoon, 3d render, anime, sketch, empty stadium, distorted face, deformed player, fantasy, watermark, text, signature",
        defaultThemes: ["Sports", "Tactical Analysis"],
        defaultModifiers: ["Realistic Match Footage", "Broadcast Quality", "Stadium Floodlights", "Sharp Focus", "Technical Overlay"],
        defaultCameraAngles: ["Wide Angle", "Tracking Shot", "Bird's Eye View"]
    },
    'GeoDocumentaryLifestyle': {
        id: 'GeoDocumentaryLifestyle',
        dropdownName: 'Travel Lifestyle Documentary',
        visualRules: `- **Art Style:** High-definition cinematic travel footage (4K quality). Blend of Drone aerial shots and Candid street-level footage.
- **Environment:** Country-specific geographic diversity (rural life, cityscapes, forests).
- **Core Elements:** Local infrastructure, cultural clothing, markets, daily routines. Warm, vibrant but natural color grading.
- **Constraints:** Show utmost respect to human faces and lifestyles. No mock or degradation of poverty.`,
        scriptRules: `- **Voiceover Style:** BBC/NatGeo style—calm, professional, informative, and objective.
- **Tone:** Analytical and educational.
- **Auto-Corrections:** 'poor village' -> 'remote community', 'backward' -> 'traditional way of life'.`,
        defaultNegativePrompt: "political propaganda, low quality, blurry, disrespectful portrayal, clickbait shock imagery, cartoon, 3d render, watermark, text",
        defaultThemes: ["Travel", "Documentary", "Lifestyle"],
        defaultModifiers: ["4K Drone Footage", "Cinematic Color Grading", "Vibrant Natural Light", "Photorealistic", "BBC Style"],
        defaultCameraAngles: ["Drone Shot", "Eye-level", "Medium Shot"]
    },
    'GunExperiments': {
        id: 'GunExperiments',
        dropdownName: 'Gun Test and Experiment',
        visualRules: `- **Art Style:** Ultra-realistic, high-quality outdoor daylight action photography. Cinematic high-speed/slow-motion capture style.
- **Environment:** Brightly-lit outdoor target practice ranges, safety-controlled grasslands.
- **Core Elements:** Detailed close-ups of firearms, visual impact forces (smoke, sparks, shattering targets), professional safety gear.
- **Constraints:** Shooters must look focused and wear safety glasses/earmuffs. NEVER point a weapon at humans/animals. No indoor shooting.`,
        scriptRules: `- **Voiceover Style:** Extremely energetic, curious, thrilling, and action-packed.
- **Tone:** Highly engaging and curiosity-inducing. Focuses on physical science experiments and ballistics.
- **Auto-Corrections:** 'kill'/'shoot dead' -> 'destroy'/'shatter'/'penetrate'.`,
        defaultNegativePrompt: "cartoon, 3d render, anime, sketch, pointing gun at person, blood, body injury, violence, indoor range, dangerous handling, sci-fi weapon, laser, watermark, text, signature",
        defaultThemes: ["Action", "Science & Experiment"],
        defaultModifiers: ["High-speed Photography", "Slow Motion", "Cinematic Action", "Ultra-realistic 8K", "Outdoor Daylight"],
        defaultCameraAngles: ["Close-up", "Macro View", "Slow Motion"]
    },
    'PaintMixingASMR': {
        id: 'PaintMixingASMR',
        dropdownName: 'Handcraft Paint Mix (No Voice)',
        visualRules: `- **Art Style:** High-definition macro videography style.
- **Environment:** Clean white or marble surface, soft diffused studio lighting (no harsh shadows).
- **Core Elements:** Metallic/glossy/pearlescent textures, smooth blending swirls, slow satisfying strokes.
- **Constraints:** ONLY gloved hands and spatula should be visible. NO human faces or bare hands. No messy environments.`,
        scriptRules: `- **CRITICAL RULE:** NO VOICEOVER. Generate action, ambient sound cues, and macro visual details only. Tone: Relaxing, calming ASMR.`,
        defaultNegativePrompt: "messy environment, dirty, bare hands, human face, fast motion, low quality, blurry, text, watermark, signature",
        defaultThemes: ["ASMR", "Satisfying", "Crafts"],
        defaultModifiers: ["Macro Videography", "8K Resolution", "Soft Diffused Lighting", "Glossy Reflection", "Pearlescent Texture"],
        defaultCameraAngles: ["Extreme Close-up", "Macro View"]
    },
    'CinematicFoodHistory': {
        id: 'CinematicFoodHistory',
        dropdownName: 'Cinematic Food History Documentary',
        visualRules: `- **Art Style:** Museum-quality renaissance oil painting style, hyper-realistic, 8K.
- **Environment & Lighting:** Warm candlelight, volumetric fog, deep shadows, dark cinematic interior.
- **Camera Movement:** Slow push-in or static portrait shot.
- **Core Elements:** Split composition, historical clothing, antique props (e.g., vintage coffee beans, ancient maps).
- **Facial Constraints:** Highly detailed skin, serious expression, looking directly at the camera.`,
        scriptRules: `- **Voiceover Style:** Slow, grave, and mysterious storytelling (male, age 40-50).
- **Tone:** Intriguing, educational, and cinematic.
- **Auto-Corrections:** 'food' -> 'ancient relic', 'old' -> 'historic', 'made' -> 'forged'.`,
        defaultNegativePrompt: "modern, daylight, bright colors, cartoon, anime, 3d render, text, watermark, low quality, CGI, futuristic, smiling, plastic skin, chaotic composition, deformed",
        defaultThemes: ["Ancient History", "Documentary", "Food"],
        defaultModifiers: ["Museum-quality Oil Painting", "Volumetric Fog", "Cinematic Candlelight", "Hyper-realistic 8K", "Depth of Field"],
        defaultCameraAngles: ["Establishing Shot", "Static Portrait", "Extreme Close-up"]
    },
    'CinematicCityReconstruction': {
        id: 'CinematicCityReconstruction',
        dropdownName: 'Cinematic City Reconstruction Documentary',
        visualRules: `- **Art Style:** Hyper-realistic AI reconstruction, 8K documentary quality.
- **Environment & Lighting:** Dynamic weather, smoke, torchlight or fog with historically accurate environment.
- **Camera Movement:** Drone shots, tracking, first-person POV, and slow push-in.
- **Core Elements:** Period-accurate architecture, clothing, daily life, and bustling crowds.
- **Facial Constraints:** Natural expressions, busy with their tasks, not looking directly at the camera.`,
        scriptRules: `- **Voiceover Style:** Immersive, cinematic, and storytelling-focused (Male, Netflix documentary style).
- **Tone:** Educational, suspenseful, and time-travel feeling.
- **Auto-Corrections:** 'old' -> 'ancient', 'city' -> 'civilization', 'people' -> 'citizens'.`,
        defaultNegativePrompt: "modern elements, cartoon, 3d render, static scene, clean clothes, anachronism, empty streets, bad anatomy, text, watermark, bright artificial lighting",
        defaultThemes: ["Historical", "Documentary", "Architecture"],
        defaultModifiers: ["Hyper-realistic AI Reconstruction", "Unreal Engine 5", "Volumetric Fog", "Cinematic Lighting", "8K Resolution"],
        defaultCameraAngles: ["Drone Shot", "First-person POV", "Slow Push-in"]
    },
    'AnthropomorphicCatComedy': {
        id: 'AnthropomorphicCatComedy',
        dropdownName: 'AI Cat Funny Moment (No Voice)',
        visualRules: `- **Art Style (CRITICAL):** 100% hyper-realistic live-action video, raw smartphone recording style (iPhone/TikTok camera look). ABSOLUTELY NO 3D, NO CGI, NO ANIMATION.\n- **Environment & Lighting:** Domestic home setting, dark messy bedroom or living room, realistic home interior. Dimly lit room illuminated rawly by the blue light screen glow of a laptop or phone, creating high-contrast natural lighting.\n- **Camera Movement & Framing (CRITICAL):** Close-up or medium tight shots focusing tightly on the cat's expressions and actions. Raw handheld shaky cam, casual amateur video feel, as if a person is recording their own pet in real-time. No polished or cinematic studio camera setups.\n- **Core Elements:** A real, fluffy domestic cat acting unexpectedly with human-like expressions (eyes widening in fear, opening mouth in anger). Highly detailed and authentic cat fur textures.\n- **Facial Constraints:** The cat's face must be extremely expressive and photorealistic. Humans in the background must have natural, genuine laughing or shocked facial expressions, looking like real people in amateur home videos.`,
        scriptRules: `- **CRITICAL RULE:** NO VOICEOVER. Generate action, facial expression changes, and ambient sound cues only.\n- **SFX & Audio Tone:** Real-time viral audio cues including sudden human wheezing laughter, cat growling or sharp meows, object impact sounds (funny bonk or slam), and ambient indoor silence.\n- **Tone:** Slapstick comedy, viral meme, chaotic pet humor.\n- **Auto-Corrections:** 'cat' -> 'expressive fluffy domestic tabby cat', 'man' -> 'ordinary young guy in casual home clothes', 'monster' -> 'funny cat', 'ocean' -> 'room'.`,
        defaultNegativePrompt: "cartoon, 3d render, anime, animation, Pixar style, Disney style, CGI look, video game graphics, professional studio lighting, clean cinematic look, high-end film cameras, fancy cinematography, vibrant colors, bright daylight, text, watermark, low resolution, deformed paws, unrealistic fur",
        defaultThemes: ["Comedy", "Animal Behavior", "Meme"],
        defaultModifiers: ["Hyper-realistic Live Action", "4K Smartphone Recording", "Screen Glow Lighting", "Raw Handheld Style", "Photorealistic Fur"],
        defaultCameraAngles: ["Handheld Shaky Cam", "Close-up", "Static Mid-shot"]
    },
    'FoundFootageMythos': {
        id: 'FoundFootageMythos',
        dropdownName: 'Found Footage Horror POV (Sudden Attack)',
        visualRules: `- **Art Style:** Hyper-realistic VFX found-footage, raw disaster recording style, 8k.
- **Environment (STRICTLY LOCKED):** You MUST extract the exact primary environment/setting described in the provided script (e.g., flooded swamp, heavy rain) and STRICTLY repeat that EXACT SAME setting in every single scene's image_prompt. DO NOT introduce new locations in later scenes. Maintain 100% geographic consistency.
- **Camera Movement & POV (STRICT):** MUST be a First-Person POV (e.g., looking out from a helicopter, shaking speedboat, or frantic smartphone recording). Apply heavy shaky cam, motion blur, and panic zoom.
- **Core Action (CRITICAL - JUMP-SCARE):** The entity MUST lock its terrifying gaze directly into the camera lens. It triggers a sudden, lightning-fast jump-scare attack, lunging STRAIGHT AT THE CAMERA with extreme high-speed motion blur. It must completely engulf and shatter the frame in a fraction of a second. ABSOLUTELY NO slow-motion movements.
- **Creature Design (CRITICAL):** Must strictly match the deeply disturbing paranormal entity described in the script. ABSOLUTELY NO muscular figures, giants, solid flesh, normal animals, or kaijus.
- **Atmosphere, Weather & Lighting (HARD CONSTRAINT):** ABSOLUTELY NO clear daylight or bright sunny skies. Depending on the script, the weather must be deeply atmospheric: thick fog, heavy overcast gloom, pouring rain, or violent storms. If set at night, use a smoky, hazy, eerie moonlight aesthetic (resembling classic survival horror video games). The environment must always feel damp, hostile, and deeply unsettling.`,
        get scriptRules() {
            const ghostDNAs = [
                "A towering, skeletal demonic entity with gigantic, tattered bat-like wings. Its body features translucent, tightly stretched necrotic skin revealing a horrifyingly visible ribcage underneath. It has completely hollow, pitch-black eye sockets and an exposed, skull-like face with jagged, interlocking fangs. The creature stands in an unnatural, rigid posture, radiating a highly detailed, macabre, sepia-toned demonic aesthetic.",
                "A completely hairless, severely emaciated pale humanoid crawling unnaturally on all fours. Its chalky, cracked white skin is covered in deep red lacerations and bulging dark veins. It possesses a bulbous, oversized head with sunken, soulless black eyes and a disturbing, unnaturally wide, toothy grin framed by a long, wispy white beard. Its elongated, bony fingers end in filthy, cracked nails.",
                "A horrifying, towering entity with two conjoined, twisted heads; one head is frozen in a scream of agony, while the other is a demonic horned skull. Its chest cavity is violently ripped open, exposing a dark, hollow abyss of rotten flesh. The creature is completely drenched in dried, dark blood and black ichor, wearing tattered, ancient ceremonial robes that seem merged with its rotting body.",
                "A grotesque, bloated humanoid wearing ancient, tattered monk robes covered in dirt and grime. It sports a terrifying, ear-to-ear razor-toothed smile. Most disturbingly, multiple grotesque, fleshy, malformed baby-like heads are sprouting directly from its shoulders and upper back. It wears a massive beaded necklace and has pale, bruised, rotting skin oozing with faint black smoke.",
                "A ghastly undead figure with frozen, pale-blue rotting skin covered in deep, bloody gashes. It has glowing white, blind dead eyes and a blood-soaked mouth completely filled with needle-like fangs. The entity is dressed in ancient, ruined red and gold oriental robes, radiating a macabre, hyper-realistic gory vibe.",
                "A towering, terrifying skeletal crone with thin, stringy white hair and pale gray, leathery skin. She has abnormally long, arthritic fingers ending in sharp talons, and massive, grotesque bird-like clawed feet soaked in fresh blood. She carries a woven basket overflowing with bloody gore and wears heavy, ragged, dirt-caked Victorian-era clothing. Her piercing, glowing dead eyes lock onto the viewer.",
                "A completely faceless, translucent pale figure. Its head is tilted at a physically impossible, broken 90-degree angle. It has no eyes and no mouth—just smooth, tight, sickly pale skin with violent, throbbing black veins visible underneath. Its limbs are disproportionately long, fractured at the joints, and twitch violently with a glitchy, fragmented spiritual horror aesthetic.",
                "A severely distorted, towering 9-foot-tall silhouette. Its impossibly long, double-jointed arms drag on the floor with broken, bleeding fingertips. Its face is a blurred, featureless void that seems to absorb all surrounding light. It appears to wear decayed, tight-fitting black fabric that has melted directly into its ashen, cracked, and peeling skin.",
                "A bloated, waterlogged humanoid corpse with pale grey, saponified skin dripping with thick, foul black sludge. Its eyes are milky white, swollen, and bulging grotesquely from their sockets. Murky, foul green water and algae continuously pour from its unnaturally gaping, unhinged jaw. The entity is covered in tangled, rotting seaweed, emitting an aura of deep aquatic decay."
            ];

            // No-Repeat Memory Logic (Tracking the last generated ghost)
            if (typeof (this as any)._lastGhostIndex === 'undefined') {
                (this as any)._lastGhostIndex = -1;
            }
            
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * ghostDNAs.length);
            } while (newIndex === (this as any)._lastGhostIndex);
            
            (this as any)._lastGhostIndex = newIndex;
            const randomDNA = ghostDNAs[newIndex];

            return `- **CRITICAL RULE:** NO VOICEOVER. Generate action and ambient sound cues only (e.g., heavy breathing, engine roaring, splashing, frantic human screams).
- **Tone:** Found-footage horror, thriller, sudden disaster panic.
- **[LOCKED LOCATION]:** The environment MUST remain exactly the same across all scenes based on the user's initial prompt. Do not change geography between scenes.
- **[GHOST VISUAL DNA - CRITICAL]:** When describing the creature in the script, you MUST use this EXACT, highly detailed visual description to ensure maximum terror: "${randomDNA}". Expand on its horrifying movements, textures, and the atmosphere based heavily on this specific description.
- **MANDATORY SCENE TAGGING (CRITICAL):** You MUST begin every single new scene or action block with a strict location tag inside brackets, derived from the user's prompt (e.g., [Location: Flooded Midnight Swamp]). You MUST repeat this EXACT SAME location tag at the beginning of EVERY SINGLE SCENE throughout the script. DO NOT drop this tag.`;
        },
        defaultNegativePrompt: "cartoon, anime, 3d render, bright sunny day, smooth camera, static shot, studio lighting, plastic texture, text, watermark, colorful, cheerful, poorly drawn, unnatural physics, peaceful, generic CGI, dinosaur, animal, regular skeleton, generic zombie, beast, muscular, bodybuilder, kaiju, giant, colossal",
        defaultThemes: ["Horror", "Paranormal", "Found Footage"],
        defaultModifiers: ["Raw-recording Style", "Hyper-realistic VFX", "VHS Glitch", "Motion Blur", "Gloomy Low Light", "8K Resolution"],
        defaultCameraAngles: ["First-person POV", "Handheld Shaky Cam", "Panic Zoom"]
    },
    'CyberpunkMiniatureMacro': {
        id: 'CyberpunkMiniatureMacro',
        dropdownName: 'Cyberpunk Figure Showcase (Unboxing)',
        visualRules: `- **Art Style:** Hyper-realistic macro toy photography, premium miniature action figure showcase, 4K.\n- **Environment & Lighting:** Studio unboxing desk, premium packaging box in the background, soft spotlight, cutting mat.\n- **Camera Movement:** Extreme macro close-ups on miniature parts, slow pans over plastic/metal joints.\n- **Core Elements:** MUST INCLUDE giant human hands holding or assembling the miniature parts, visible articulation joints, miniature scale comparison, unboxing from a premium foam box, snapping parts together.\n- **Facial Constraints:** Miniature painted face, hyper-detailed but clearly a plastic/resin collectible figure, NOT a real living cyborg.`,
        scriptRules: `- **CRITICAL RULE:** Write an engaging script for a premium toy/gadget reviewer unboxing a high-end miniature collectible.\n- **Tone:** Enthusiastic, premium showcase, reviewing build quality, paint job, and details.\n- **Narrative Flow:** 1. Introduce the premium box. 2. Take the figure out and assemble the parts. 3. Showcase the articulation and final pose.\n- **Auto-Corrections:** 'toy' -> 'premium collectible', 'real' -> 'highly detailed miniature'.`,
        defaultNegativePrompt: "real life, living person, actual movie scene, life-size, natural landscape, outside, CGI movie, real human face, 3d render, cartoon, blurry",
        defaultThemes: ["Cyberpunk", "Miniature", "Sci-Fi"],
        defaultModifiers: ["Macro Photography", "Soft Spotlights", "Photorealistic Texture", "Depth of Field", "Hyper-detailed Plastic"],
        defaultCameraAngles: ["Extreme Close-up", "Macro Pan", "Slow Tilt-up"]
    },
    'GhibliSurvivalAnime': {
        id: 'GhibliSurvivalAnime',
        dropdownName: '2D Anime Survival (Ghibli Style) (No Voice)',
        visualRules: `- **Art Style:** 2D anime style, Studio Ghibli or Hayao Miyazaki aesthetic, cel-shading.\n- **Environment & Lighting:** Lush green animated woodland, heavy rain, warm kerosene lamp light inside a train, morning god rays.\n- **Camera Movement:** Slow pans, static wide shots, gentle tracking shots.\n- **Core Elements:** Abandoned rustic train car, overgrown railway tracks, survival gear, warm contrast of fire and rain.\n- **Facial Constraints:** Classic anime proportions, expressive eyes, non-hyper-realistic.`,
        scriptRules: `- **CRITICAL RULE:** NO VOICEOVER. Generate action and ambient sound cues only.\n- **Voiceover Style:** No traditional narration. Focus entirely on rich environmental ASMR (e.g., heavy rain, crackling fire, train creaking, wind).\n- **Tone:** Heartwarming, nature-focused, survival, and highly atmospheric.\n- **Auto-Corrections:** 'real' -> 'hand-drawn', 'forest' -> 'lush animated woodland', 'train' -> 'abandoned rustic train car'.`,
        defaultNegativePrompt: "3d, cgi, photorealistic, hyper-realistic, live action, shaky cam, modern, neon, poorly drawn, distorted anatomy, text, watermark, anime cliché tropes, over-saturated",
        defaultThemes: ["Anime", "Survival", "Nature"],
        defaultModifiers: ["Studio Ghibli Aesthetic", "Cel-shaded", "Painterly Backgrounds", "Warm God Rays", "High-quality 2D Animation"],
        defaultCameraAngles: ["Wide Shot", "Slow Pan", "Gentle Tracking"]
    },
    MeditativeEpicHistory: {
        id: 'MeditativeEpicHistory',
        dropdownName: 'Meditative Cinematic History',
        visualRules: `- **Art Style:** Hyper-realistic cinematic CGI / high-end historical recreation. Looks like a multi-million dollar Hollywood epic or high-fidelity Unreal Engine 5 render.
- **Environment & Lighting:** Volumetric lighting, golden hour sunlight cutting through dust, moody candle-lit chambers, vast sun-scorched deserts, and atmospheric fog. Deep contrast (chiaroscuro).
- **Camera Movement:** Very slow, deliberate movements. Slow push-ins on character faces, slow-motion battle sequences, slow drone pans over vast armies or ruins, and static shots on ancient maps.
- **Core Elements:** Period-accurate armor (Roman legions, Parthian cataphracts), ancient ruins, detailed physical maps with moving elements, weathered statues, and dusty battlefields.
- **Character/Subject Constraints:** Hyper-detailed faces showing exhaustion, stoicism, or determination. Gritty, sweat and dirt on faces. No cartoonish expressions; characters must look like real historical figures.`,
        scriptRules: `- **Hook Strategy:** Open with a visually striking, high-stakes cinematic moment (e.g., a defeated soldier, a burning city) paired with a profound, philosophical statement about the rise and fall of power. No loud intros; grab attention through gravity and scale.
- **Voiceover Style:** Deep documentary male. Slow-paced, meditative, authoritative, and slightly melancholy (like an older scholar reflecting on the past).
- **Tone & Pacing:** Deliberate, stoic, grand, and melancholic. Pacing is slow and rhythmic, allowing the viewer to absorb the epic scale of the history and the tragedy of forgotten empires.
- **Auto-Corrections/Wording:** Avoid modern slang, upbeat transitions, or overly enthusiastic phrases. Use words like "empire," "legion," "antiquity," "oblivion," and "conquest."`,
        defaultNegativePrompt: "modern, fast-paced, chaotic, futuristic, neon, bright colors, cartoon, low quality 3d render, watermark",
        defaultThemes: ["Forgotten Empires", "Ancient Rivalries", "Rise and Fall", "Epic Battles"],
        defaultModifiers: ["Hyper-realistic", "Cinematic lighting", "Unreal Engine 5", "Volumetric fog", "8k resolution"],
        defaultCameraAngles: ["Slow push-in close up", "Wide epic establishing shot", "Low angle heroic"]
    },
    CocomelonKidsRhyme: {
        id: 'CocomelonKidsRhyme',
        dropdownName: '3D Kids Rhyme (Cocomelon Style) (No Voice)',
        visualRules: `- **Art Style:** Glossy 3D CGI, Pixar-adjacent toddler-safe character design. Soft rounded edges, no sharp corners anywhere in the world (buildings, vehicles, furniture all pill-shaped).
- **Environment & Lighting:** Flat, bright, even daylight lighting with zero harsh shadows; oversaturated primary-and-pastel color palette (sky-blue, grass-green, sunshine-yellow).
- **Camera Movement:** Mostly static or slow lateral tracking shots. Everything is smooth and predictable so toddlers don't get disoriented. No shaky cam, no fast whip-pans.
- **Core Elements:** Toddler-proportioned characters (large heads, big eyes, short limbs), always fully visible face-on or 3/4 view.
- **Karaoke Style:** Include bouncing-highlight captions appearing at the bottom of every frame, matched word-for-word to the sung lyric.`,
        scriptRules: `- **NO VOICEOVER** (Triggers Audio-Visual Persona).
- **CRITICAL OVERRIDE - MUSICAL NICHE:** Although this uses the visual persona, this specific niche EXPLICITLY DEMANDS sung lyrics. You MUST generate the script by combining Song Lyrics and Visual Cues. DO NOT write a traditional narrator voiceover.
- **Format Requirement:** For each verse (Verse 1, Verse 2, etc.), write the exact sung lyric, followed immediately by a strict visual direction in brackets.
  Example format:
  Verse 1:
  Lyric: "The wheels on the bus go round and round..."
  [Visual: Bright yellow school bus driving down a sunny suburban street, wheels spinning]
- **Hook Strategy:** No spoken hook. Start directly with the action and the first sung line.
- **Tone & Structure:** Highly repetitive verse-by-verse structure. Each verse must feature ONE clear physical action paired with ONE onomatopoeia sound (e.g., swish, vroom, beep). Use simple, concrete, toddler-friendly words.`,
        defaultNegativePrompt: "realistic proportions, sharp edges, dark shadows, muted colors, desaturated palette, shaky camera, fast cuts, scary faces, empty background, adult themes, violence, text-free captions, mismatched lyric timing, gritty textures, photorealism, horror lighting, cluttered scene, off-model character design",
        defaultThemes: ["Going to school", "Vehicles in motion", "Daily routines", "Family & caregivers", "Friendly community"],
        defaultModifiers: ["glossy 3D render", "bright pastel palette", "toddler-safe rounded design", "soft even daylight", "bouncy karaoke captions"],
        defaultCameraAngles: ["static wide shot", "slow lateral tracking", "gentle push-in on face", "eye-level toddler POV"]
    },
    HistoricalStickfigureExplainer: {
        id: 'HistoricalStickfigureExplainer',
        dropdownName: 'Historical Stick Figure Animation Explainer',
        visualRules: `- **CRITICAL ART STYLE LOCK (MUST APPLY TO EVERY SCENE):** The ENTIRE scene (both characters and background) MUST be described strictly as "2D webcomic cartoon style, clean vector-like artwork, flat colors, thick black outlines". 
- **NO PHOTOREALISM (STRICT BAN):** NEVER describe realistic human hands, real skin textures, or 3D CGI cinematic lighting (like 'chiaroscuro' or 'volumetric light'). Even for macro shots (like holding a tool), you MUST describe it as a flat 2D cartoon drawing.
- **Environment Constraints:** Backgrounds must be strictly 2D flat vector style (e.g., a hand-drawn 2D cave, a 2D vector blizzard). DO NOT mix 3D/realistic backgrounds with 2D characters.
- **Camera & Focus:** Primarily static wide and medium framing. Focus is on the step-by-step visual demonstration of survival mechanics paired with bold, hand-drawn text overlays.`,
        scriptRules: `- **Hook Strategy:** Open immediately within the first 3 seconds by contrasting a relatable, trivial modern inconvenience (e.g., complaining about rain, getting bored, struggling to sleep) with the life-or-death reality of ancient human survival.
- **Voiceover Style:** Fast-paced enthusiastic documentary male (inquisitive, clear, authoritative, and engaging).
- **Tone & Pacing:** Rapid-fire anthropological facts delivered with dry wit, relatable modern comparisons, and structured problem-solution storytelling.
- **Prompt Formatting Rule:** You MUST begin EVERY single scene's master_prompt with the exact phrase: "2D webcomic cartoon style, flat vector art, thick black outlines: ". Do not let the AI image generator assume the style.`,
        defaultNegativePrompt: "3d render, CGI, cinematic lighting, chiaroscuro, hyper-realistic faces, realistic hands, human skin texture, photorealism, complex character anatomy, gradients, messy sketch lines, morphing characters, watermark, low resolution, realistic textures",
        defaultThemes: ["Ancient Survival", "Evolutionary History", "Everyday Anthropology", "Prehistoric Inventions"],
        defaultModifiers: ["2D vector webcomic", "thick black outlines", "flat colors", "humorous educational illustration"],
        defaultCameraAngles: ["Static wide shot", "Slow push-in medium shot", "Macro tool focus"]
    }
};


export function getNicheConfig(nicheId: string): NicheConfig {
    return nicheConfigs[nicheId] || nicheConfigs['Default / General'];
}
