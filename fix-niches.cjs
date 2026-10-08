const fs = require('fs');
let code = fs.readFileSync('niche-directives.ts', 'utf-8');

const newCode = `export const nicheConfigs: Record<string, NicheConfig> = {
    'Default / General': {
        id: 'Default / General',
        dropdownName: 'Default / General',
        scriptRules: \`- **Hook & Retention:** Start with a strong, attention-grabbing hook. \\n- **Tone:** Engaging, natural, and professional storytelling. \\n- **Flow:** Ensure smooth, logical transitions between sentences and paragraphs to maintain viewer retention.\\n- **Structure:** Follow a clear Beginning-Middle-End narrative structure.\`,
        visualRules: \`- **Visual Style:** Ultra-detailed, photorealistic, cohesive cinematic lighting, 8k resolution, award-winning composition.\\n- **Camera:** Cinematic, smooth, and intentional movements that match the narrative pacing.\`,
        defaultNegativePrompt: "watermark, text, logo, signature, low quality, blurry, ugly, bad anatomy, bad proportions, deformed, inconsistent details, sudden style changes",
        defaultThemes: ["Cinematic", "Documentary", "Narrative"],
        defaultModifiers: ["Unreal Engine 5", "Photorealistic", "8K Resolution", "Volumetric Lighting", "Shot on 35mm lens", "Depth of Field"],
        defaultCameraAngles: ["Eye-level", "Medium Shot", "Cinematic Pan"]
    },
    '3DAnimatedExplainer': {
        id: '3DAnimatedExplainer',
        dropdownName: '3D Animated Explainer (Facts)',
        visualRules: \`- **Art Style:** Bright, highly engaging 3D animation (similar to Pixar/modern YouTube explainers).\\n- **Environment:** Clean, colorful, and visually metaphoric backgrounds.\\n- **Camera:** Dynamic, fast-paced transitions and zooms to hold retention.\\n- **Constraints:** Not photorealistic. No gritty or dark elements.\`,
        scriptRules: \`- **Voiceover Style:** Enthusiastic, fast-paced, and highly engaging.\\n- **Tone:** Educational but entertaining.\`,
        defaultNegativePrompt: "photographic realism, live action, serious, dark, gritty, boring, plain, text heavy, messy, chaotic, low quality 3d, watermark",
        defaultThemes: ["3D Animation", "Educational", "Explainer"],
        defaultModifiers: ["Unreal Engine 5", "Octane Render", "Ray Tracing", "Subsurface Scattering", "Vibrant Colors", "Studio Lighting"],
        defaultCameraAngles: ["Dynamic Zoom", "Fast Pan", "Wide Angle"]
    },
    'MythBustingRealistic': {
        id: 'MythBustingRealistic',
        dropdownName: 'Myth Busting (Realistic)',
        visualRules: \`- **Art Style:** Ultra-realistic, modern documentary or science-lab footage.\\n- **Environment:** High-tech labs, testing grounds, or realistic historical settings.\\n- **Camera:** Handheld documentary style, slow-motion impacts, macro shots of evidence.\`,
        scriptRules: \`- **Voiceover Style:** Analytical, curious, and authoritative (Science Communicator style).\\n- **Tone:** Scientific, suspenseful, "Let's find out".\`,
        defaultNegativePrompt: "3d render, cartoon, anime, illustration, magic, fantasy, messy, low quality, watermark, text",
        defaultThemes: ["Documentary", "Science & Experiment"],
        defaultModifiers: ["Hyper-realistic", "8K Resolution", "Macro Detail", "Sharp Focus", "Documentary Photography"],
        defaultCameraAngles: ["Eye-level", "Close-up", "Handheld Shaky Cam"]
    },
    WW2History: {
        id: 'WW2History',
        dropdownName: 'WW2 / Historical Documentary',
        visualRules: \`- **Visual Style:** STRICTLY adhere to a 1940s historical documentary aesthetic. All visuals must be described as **black and white footage**, with **film grain**, **scratches**, and a slightly **damaged newsreel texture**.\\n- **Content Lock:** NO modern technology, clothing, or architecture. All elements must be period-accurate for World War II. Use terms like "archival footage of...", "grainy shot of...".\\n- **Camera:** Mix static, archival-style shots with shaky, handheld "combat cameraman" perspectives.\`,
        defaultNegativePrompt: "modern clothing, modern architecture, smartphones, modern cars, futuristic, sci-fi, anime, cartoon, 3d render, fantasy, magic, anachronistic",
        defaultThemes: ["History", "War", "Documentary"],
        defaultModifiers: ["1940s Vintage Look", "Film Grain", "Black and White", "Archival Footage", "Damaged Newsreel", "High Contrast"],
        defaultCameraAngles: ["Handheld Shaky Cam", "Wide Angle", "Drone Shot"]
    },
    'HumanSocialDoc': {
        id: 'HumanSocialDoc',
        dropdownName: 'Human Realistic Documentary',
        visualRules: \`- **Art Style:** Photorealistic, high-end Netflix/BBC documentary footage.\\n- **Environment:** Natural, authentic environments with natural lighting.\\n- **Camera:** Medium close-ups with shallow depth of field (blurred backgrounds), stable gimbal shots.\`,
        defaultNegativePrompt: "3d render, cartoon, anime, illustration, painting, hyper-stylized, fantasy, magic, sci-fi, neon, watermark",
        defaultThemes: ["Documentary", "Lifestyle", "Human Interest"],
        defaultModifiers: ["Netflix Documentary Style", "Natural Lighting", "Shallow Depth of Field", "Photorealistic", "Cinematic Color Grading"],
        defaultCameraAngles: ["Medium Close-up", "Eye-level", "Stable Gimbal Shot"]
    },
    'WildlifeUltraRealistic': {
        id: 'WildlifeUltraRealistic',
        dropdownName: 'Wildlife Documentary (Ultra-Realistic)',
        visualRules: \`- **Art Style:** Ultra-realistic, National Geographic-style wildlife photography. 4K resolution.\\n- **Environment:** Authentic natural habitats.\\n- **Camera:** Telephoto lenses for extreme close-ups (fur, scales, eyes), wide landscape shots, slow-motion action.\\n- **Constraints:** MUST look like real camera footage. No 3D look.\`,
        defaultNegativePrompt: "human elements, buildings, cars, roads, fences, artificial lighting, cartoon, 3d render, unnatural behavior, CGI look, watermark",
        defaultThemes: ["Nature", "Wildlife", "Documentary"],
        defaultModifiers: ["National Geographic Style", "Ultra-realistic 4K", "Telephoto Lens", "Macro Photography", "Depth of Field"],
        defaultCameraAngles: ["Wide Angle", "Extreme Close-up", "Tracking Shot"]
    },
    IslamicHistory: {
        id: 'IslamicHistory',
        dropdownName: 'Islamic / Religious History',
        visualRules: \`- **Visual Style:** Solemn, respectful, and epic. Use cinematic lighting, grand landscapes, and detailed historical Middle Eastern architecture (e.g., ancient mosques, desert cities, sandstone structures).\\n- **Hard Constraints (STRICTLY FORBIDDEN):** Never include modern elements. NEVER include Chinese clothing, Chinese architecture, or Chinese/East Asian characters. NEVER include Hindu deities or polytheistic mythological elements. Ensure period-accurate clothing (e.g., thobes, simple desert garments, historical armor) that fits 7th-century or medieval Arabia.\\n- **Content Lock:** Avoid direct visual representation of prophets. Instead, use symbolic imagery, calligraphy, light, or focus on followers, environments, and historical events from a respectful distance.\\n- **Tone:** The visuals should evoke a sense of reverence, history, and spiritual gravitas.\\n\\n**RELIGIOUS CHARACTER FACE-PROTECTION SYSTEM (CRITICAL - MUST BE FOLLOWED):**\\n1.  **CHARACTER CLASSIFICATION:** If any character represents or implies a Prophet, Messenger, Angel, or any sacred Islamic figure, classify them as a **SPECIAL RELIGIOUS CHARACTER**.\\n2.  **FACE VISIBILITY POLICY (STRICT):**\\n    - For any **SPECIAL RELIGIOUS CHARACTER**, facial features must NEVER be visible. Eyes, nose, mouth are strictly forbidden.\\n    - Do NOT generate a human face, even partially. This rule overrides realism and artistic style.\\n3.  **MANDATORY VISUAL SUBSTITUTION:**\\n    - The face MUST be replaced with:\\n        - Intense divine light (Noor)\\n        - Overexposed glowing head region\\n        - Radiant white or golden aura\\n        - Strong backlight causing a full silhouette\\n        - Fog, light, or shadow obscuring the head\\n        - Camera angle from behind or above\\n4.  **NEGATIVE VISUAL CONSTRAINT (DO NOT GENERATE):**\\n    - The following are strictly prohibited for SPECIAL RELIGIOUS CHARACTERS: visible face, human facial features, eyes, nose, mouth, realistic portrait, identifiable human face, facial details.\`,
        scriptRules: \`**NON-NEGOTIABLE ISLAMIC RULES (HARD CONSTRAINTS):**\\n1.  **CREATOR NAMING RULE (CRITICAL):**\\n    - NEVER use: God, Lord, Creator, My Lord.\\n    - ALWAYS use: Allah.\\n    - If the source text uses "God", you MUST automatically replace it with "Allah".\\n2.  **QURANIC NAME STANDARDIIZATION (AUTO-FIX):**\\n    - You MUST ALWAYS use Quran-accurate Islamic names, not Bible-based names.\\n    - Automatically replace:\\n        - Eve -> Hawwa\\n        - Abraham -> Ibrahim\\n        - Noah -> Nuh\\n        - Moses -> Musa\\n        - Aaron -> Harun\\n        - Jesus -> Isa\\n        - Solomon -> Sulaiman\\n        - David -> Dawud\\n        - Jonah -> Yunus\\n        - Nimrod -> Namrud\\n    - If any incorrect naming appears in the source, silently correct it.\`,
        defaultNegativePrompt: "modern clothing, modern architecture, chinese clothing, chinese people, chinese architecture, ancient chinese, east asian, black people, african american, contemporary, futuristic, hindu deities, polytheistic imagery, inappropriate clothing",
        defaultThemes: ["Religion", "History", "Cinematic"],
        defaultModifiers: ["Epic Scale", "Golden Hour Lighting", "Unreal Engine 5", "Highly Detailed Architecture", "Cinematic Haze"],
        defaultCameraAngles: ["Establishing Shot", "Drone Shot", "Low Angle"]
    },
    'SleepingStoryMagical': {
        id: 'SleepingStoryMagical',
        dropdownName: 'Sleeping Story (Magical)',
        visualRules: \`- **Art Style:** Dreamy, soft-focus, magical, and cozy.\\n- **Environment:** Serene landscapes, starlit skies, cozy cabins, glowing fireflies. Warm, gentle lighting.\\n- **Camera:** Extremely slow pans, static shots. No fast movements.\`,
        scriptRules: \`- **Voiceover Style:** Very soft, slow, whispering, and calming.\\n- **Tone:** Soothing, bedtime storytelling.\`,
        defaultNegativePrompt: "violence, action, scary, horror, blood, intense, neon, loud, noisy, chaotic, crowded, disturbing, messy, fast movement",
        defaultThemes: ["Bedtime Story", "Fantasy", "Magic"],
        defaultModifiers: ["Ethereal", "Bioluminescence", "Soft Dreamy Lighting", "Pastel Colors", "Fairy Tale Aesthetic", "Bokeh"],
        defaultCameraAngles: ["Slow Pan", "Static Shot", "Wide Shot"]
    },
    'MeditationRelaxation': {
        id: 'MeditationRelaxation',
        dropdownName: 'Meditation & Relaxation (Nature)',
        visualRules: \`- **Art Style:** Ultra-realistic, peaceful nature videography. \\n- **Environment:** Flowing rivers, gentle rain, zen gardens, sunset over the ocean.\\n- **Camera:** Completely static or imperceptibly slow drone drift.\\n- **Constraints:** NO human characters, NO animals, pure ambient nature.\`,
        scriptRules: \`- **CRITICAL RULE:** NO VOICEOVER. Generate ambient sound cues only (e.g., [Audio: Gentle rain falling, soft wind]).\`,
        defaultNegativePrompt: "human, person, animal, city, loud, fast, action, violence, text, 3d, cartoon, messy",
        defaultThemes: ["Relaxation", "Nature", "ASMR"],
        defaultModifiers: ["Ethereal", "Soft Focus", "Warm Golden Light", "Cinematic Landscape", "Ultra-detailed Nature"],
        defaultCameraAngles: ["Static Shot", "Slow Drone Drift", "Wide Angle"]
    },
    'TrueCrimeDoc': {
        id: 'TrueCrimeDoc',
        dropdownName: 'True Crime Documentary',
        visualRules: \`- **Art Style:** Dark, gritty, suspenseful, realistic crime documentary footage.\\n- **Environment:** Dimly lit interrogation rooms, rainy streets, police tape, macro shots of evidence.\\n- **Camera:** Slow creeping zooms, high contrast lighting (chiaroscuro).\`,
        scriptRules: \`- **Voiceover Style:** Grave, serious, investigative.\`,
        defaultNegativePrompt: "bright colors, cheerful, cartoon, anime, 3d render, fantasy, magic, sci-fi, comedy, lighthearted, colorful",
        defaultThemes: ["Crime", "Documentary", "Mystery"],
        defaultModifiers: ["Gritty Texture", "Chiaroscuro Lighting", "Noir", "High Contrast", "Moody Vibe", "Desaturated"],
        defaultCameraAngles: ["Close-up", "Low Angle", "Slow Push-in"]
    },
    'MysteryThriller': {
        id: 'MysteryThriller',
        dropdownName: 'Cinematic Mystery & Thriller',
        visualRules: \`- **Art Style:** High-end Hollywood cinematic thriller style.\\n- **Environment:** Foggy forests, abandoned mansions, eerie lighting, supernatural hints.\\n- **Camera:** Dutch angles, tracking shots, suspenseful reveals.\`,
        defaultNegativePrompt: "bright, sunny, cheerful, cartoon, 3d render, comedy, flat lighting, text, watermark",
        defaultThemes: ["Mystery", "Thriller", "Cinematic"],
        defaultModifiers: ["Cinematic Lighting", "Dark Fantasy", "Foggy Atmosphere", "Moody Color Palette", "Shot on 35mm lens"],
        defaultCameraAngles: ["Dutch Angle", "Slow Push-in", "Tracking Shot"]
    },
    'SciFiCyberpunk': {
        id: 'SciFiCyberpunk',
        dropdownName: 'Sci-Fi (Cyberpunk / Dystopian)',
        visualRules: \`- **Art Style:** High-tech, futuristic, gritty cinematic style (Blade Runner aesthetic).\\n- **Environment:** Neon-lit rainy streets, towering holograms, cyborgs, dystopian megacities.\\n- **Camera:** Dynamic street-level tracking, volumetric neon lighting.\`,
        defaultNegativePrompt: "medieval, historical, ancient, fantasy, magic, contemporary, nature, cartoon, 3d low poly",
        defaultThemes: ["Sci-Fi", "Cyberpunk", "Dystopian"],
        defaultModifiers: ["Volumetric Neon Lighting", "Unreal Engine 5", "Ray Tracing", "Cyberpunk Aesthetic", "Hyper-realistic"],
        defaultCameraAngles: ["Tracking Shot", "Drone Shot", "Low Angle"]
    },
    'DeepSpaceDoc': {
        id: 'DeepSpaceDoc',
        dropdownName: 'Deep Space Exploration',
        visualRules: \`- **Art Style:** Ultra-realistic space photography (NASA/James Webb style).\\n- **Environment:** Glowing nebulas, black holes, massive planets, highly detailed spaceships.\\n- **Camera:** Epic wide shots showing massive scale, slow cinematic orbits.\`,
        defaultNegativePrompt: "earth landscapes, humans without spacesuits, cartoon, fantasy, 2d, sketch, watermark",
        defaultThemes: ["Space", "Astronomy", "Documentary"],
        defaultModifiers: ["James Webb Telescope Style", "Photorealistic 8K", "Glowing Nebulas", "Deep Black Space", "Epic Scale"],
        defaultCameraAngles: ["Establishing Shot", "Slow Orbit", "Wide Shot"]
    },
    'Cartoon2D_Ghibli': {
        id: 'Cartoon2D_Ghibli',
        dropdownName: '2D Anime (Ghibli Style)',
        visualRules: \`- **Art Style:** Beautiful, hand-drawn, painterly 2D animation inspired by Studio Ghibli.\\n- **Environment:** Lush detailed nature, whimsical elements, soft natural lighting.\\n- **Camera:** Classic 2D animation framing.\`,
        defaultNegativePrompt: "3d render, realistic, photographic, live action, cinematic, dark, gritty, horror, violence, low quality, CGI",
        defaultThemes: ["Anime", "Fantasy", "Animation"],
        defaultModifiers: ["Studio Ghibli Aesthetic", "Hand-drawn", "Painterly Backgrounds", "Cel-shaded", "Warm Natural Light"],
        defaultCameraAngles: ["Static Shot", "Eye-level", "Wide Shot"]
    },
    '3DAnimalRescue': {
        id: '3DAnimalRescue',
        dropdownName: '3D Animal Rescue (Kids Cartoon)',
        visualRules: \`- **Art Style:** Vibrant, extremely colorful, Pixar/Disney 3D style character animation. Characters must have large, expressive, cute eyes (cute chibi aesthetics).
- **Environment:** Brightly-lit tropical jungles, crystal-clear blue seas, or glowing colorful crystal caves. Features high-tech gadgets and cool rescue vehicles.
- **Core Elements:** Visible emotions on animals' faces (crying, laughing, scared), high-tech rescue gear, and friendly cooperative teamwork.
- **Facial Constraints:** Predator characters must NOT look terrifying; designs must remain cartoonish, cute, and 100% child-friendly.\`,
        scriptRules: \`- **Voiceover Style:** Enthusiastic, emotional, heroic, and tailored for kids.
- **Auto-Corrections:** Automatically replace negative words with positive ones (e.g., replace 'kill', 'die', 'blood' with 'save', 'rescue', 'help').
- **Language/Tone:** Simple, fun, and highly educational. Promotes empathy and teamwork.\`,
        defaultNegativePrompt: "photorealistic, scary, terrifying, monstrous shark, blood, violence, weapon, injury, dark environment, night, spooky, realistic animal, low quality, watermark, text, signature",
        defaultThemes: ["3D Animation", "Kids Cartoon", "Adventure"],
        defaultModifiers: ["Pixar 3D Style", "Vibrant Colors", "Octane Render", "Subsurface Scattering", "Soft Global Illumination"],
        defaultCameraAngles: ["Eye-level", "Dynamic Shot"]
    },
    'DangerousOceansDocumentary': {
        id: 'DangerousOceansDocumentary',
        dropdownName: 'Dangerous Oceans Documentary',
        visualRules: \`- **Art Style:** Ultra-realistic and cinematic real footage style. Blend of historical archival style and high-quality 3D Map Animation style.
- **Environment:** Turbulent oceans, giant waves crashing on decks, mysterious fog, icy Antarctic settings, or stormy nights.
- **Core Elements:** Epic scale contrast (massive nature vs tiny ships), realistic weather effects, dramatic chiaroscuro lighting.
- **Facial Constraints:** Human faces should show fear, exhaustion, or seriousness. Focus is on the environment, not happy faces.\`,
        scriptRules: \`- **Voiceover Style:** National Geographic/History channel style—grave, dramatic, and authoritative.
- **Tone:** Extremely serious and descriptive, focusing on nature's power and maritime tragedies.
- **Auto-Corrections:** 'big wave' -> 'towering rogue wave', 'ship' -> 'expedition vessel', 'sailors died' -> 'souls were claimed by the abyss'.\`,
        defaultNegativePrompt: "3d cartoon, anime style, bright, vlog vibe, modern objects, smiling face, happy people, cheerful, low quality, watermark, text, signature",
        defaultThemes: ["Nature", "Documentary", "Survival"],
        defaultModifiers: ["Hyper-realistic Marine Footage", "Chiaroscuro Lighting", "Stormy Atmosphere", "8K Resolution", "Epic Scale"],
        defaultCameraAngles: ["Wide Angle", "Drone Shot", "Tracking Shot"]
    },
    'CinematicEarth': {
        id: 'CinematicEarth',
        dropdownName: 'Cinematic Dark Documentary (Earth & Evolution)',
        visualRules: \`- **Art Style:** Hyper-realistic cinematic photography, dark fantasy/dark nature style (Unreal Engine 5 / Midjourney v6 aesthetics).
- **Environment:** Deep oceanic abyss, primeval frozen landscapes, foggy prehistoric jungles, heavy dramatic shadows.
- **Core Elements:** Glowing/luminous predator eyes, vicious hunting behaviors, immense scale comparison.
- **Constraints:** Animals must look wild and terrifying (never cute). Human faces should remain hidden in shadows or obscured.\`,
        scriptRules: \`- **Voiceover Style:** Grave, mysterious, epic, and highly suspenseful documentary style.
- **Tone:** Dark, philosophical, narrative-driven.
- **Auto-Corrections:** 'animal' -> 'ancient beast', 'ocean' -> 'abyss', 'killer' -> 'apex predator'.\`,
        defaultNegativePrompt: "cartoon, 3d render, anime, sketch, bright colors, saturated, friendly animal, cute expression, smiling face, cheerful atmosphere, modern technology, watermark, text, signature",
        defaultThemes: ["Dark Nature", "Documentary", "Evolution"],
        defaultModifiers: ["Unreal Engine 5", "Hyper-realistic", "Dark Fantasy", "Chiaroscuro Lighting", "Volumetric Fog", "Macro Details"],
        defaultCameraAngles: ["Wide Angle", "Slow Pan", "Establishing Shot"]
    },
    'CityEvolutionTimelapse': {
        id: 'CityEvolutionTimelapse',
        dropdownName: 'City Evolution Timelapse (No Voice)',
        visualRules: \`- **Art Style:** Hyper-realistic cinematic photography.
- **Camera Rule:** Absolutely locked, static camera perspective (fixed camera). No panning or zooming. Ground-level wide landscape shot (Eye-level front angle). STRICTLY NO high-angle, drone, or aerial shots. Ensure a balanced composition where 1/3 of the frame is sky and 2/3 is ground/landscape.
- **Environment:** Seamless evolution of a single landscape over time (wilderness -> medieval -> modern -> cyberpunk).
- **Constraints:** Never close-up on any individual human face. Focus remains entirely on the wide-angle cityscape.\`,
        scriptRules: \`- **CRITICAL RULE:** NO VOICEOVER. Generate action and ambient sound cues only.\\n- **Audio Dynamic Tagger:** You must dynamically append era-specific sound effect tags in the script based on the time period. For example: [SFX: primeval nature, wind], [SFX: medieval horses, sword clashes], [SFX: steam engines, industrial noise], [SFX: futuristic flying cars, cyberpunk hum].\\n- **Tone:** Majestic, epic, and highly descriptive to depict the passage of centuries.\\n- **CRITICAL WORKFLOW:** Scene 1 must naturally describe the base era and geography. For EVERY subsequent scene (Scene 2 onwards), you MUST start the image prompt with this exact tag: '[IMAGE-TO-VIDEO REFERENCE] Maintain the exact landscape, camera angle, and composition of the base image. Fast-forward the era to [Insert Year]: '. Do not write long geographical descriptions in subsequent scenes; focus entirely on describing the architectural and environmental changes occurring on top of that established landscape.\\n- **Transitional Events (CRITICAL):** Do not simply jump from one completed era to another. You MUST generate transitional scenes showing HOW the landscape changed. Include dramatic events like natural disasters (massive earthquakes, floods, devastating fires), epic wars, or rapid construction/reconstruction phases (ruins being cleared, structures being actively built). For example, before a modern city appears, show the previous era's destruction or the active building phase in a fast-paced timelapse manner.\\n- **CRITICAL WORKFLOW (Template Enforcement):** You MUST strictly format EVERY image prompt into two isolated sections:\\n[FIXED BACKGROUND]: Re-state the exact same geographical landscape word-for-word in every prompt (e.g., 'A wide Nile river on the left, vast golden desert plateau on the right'). Do not alter these words across different eras.\\n[DYNAMIC FOREGROUND]: Describe ONLY the changes, human activities, constructions, or ruins happening in this specific era.\\nBy isolating the fixed background from the dynamic foreground, the video generator will maintain absolute consistency.\\n- **MANDATORY SCENE TAGGING (CRITICAL):** You MUST begin every single new scene or action block with a strict base location and camera angle tag inside brackets, derived from the user's prompt (e.g., [Base Location & Camera: Wide desert landscape, static ground-level shot]). You MUST repeat this EXACT SAME tag at the beginning of EVERY SINGLE SCENE throughout the script to prevent geographical drift during chunking. DO NOT drop this tag.\`,
        forceFixedCamera: true,
        defaultNegativePrompt: "camera motion, camera zoom, camera pan, camera tilt, cartoon, 3d animate, anime, sketch, modern cars in ancient times, modern technology in historical settings, close-up face, watermark, text, signature, 3D render, CGI, artificial, fake, plastic, modern outfit, modern clothing, modern dressup in historical or ancient settings",
        defaultThemes: ["History", "Timelapse", "Architecture"],
        defaultModifiers: ["Hyper-realistic 3D", "Unreal Engine 5", "Day-Night Cycle", "Cinematic Lighting", "High-Definition Texture"],
        defaultCameraAngles: ["Fixed-Camera", "Wide-angle Overview", "Eye-level"]
    },
    'FootballTactics': {
        id: 'FootballTactics',
        dropdownName: 'Football Tactics Analysis',
        visualRules: \`- **Art Style:** Realistic match footage style, overlaid with technical tactical annotations (red/green circles, movement arrows, tactical lines).
- **Environment:** Brightly lit professional stadium, green grass pitch under floodlights or daylight.
- **Core Elements:** Player positioning, movement tracking, tactical setups, and formations.\`,
        scriptRules: \`- **Voiceover Style:** Analytical, exciting, resembling a live sports commentary/broadcasting tone.
- **Auto-Corrections:** 'goal' -> 'Incredible Masterpiece' or 'Brilliant Finish'.
- **Tone:** Highly engaging for football fans, technical yet simplified.\`,
        defaultNegativePrompt: "cartoon, 3d render, anime, sketch, empty stadium, distorted face, deformed player, fantasy, watermark, text, signature",
        defaultThemes: ["Sports", "Tactical Analysis"],
        defaultModifiers: ["Realistic Match Footage", "Broadcast Quality", "Stadium Floodlights", "Sharp Focus", "Technical Overlay"],
        defaultCameraAngles: ["Wide Angle", "Tracking Shot", "Bird's Eye View"]
    },
    'GeoDocumentaryLifestyle': {
        id: 'GeoDocumentaryLifestyle',
        dropdownName: 'Travel Lifestyle Documentary',
        visualRules: \`- **Art Style:** High-definition cinematic travel footage (4K quality). Blend of Drone aerial shots and Candid street-level footage.
- **Environment:** Country-specific geographic diversity (rural life, cityscapes, forests).
- **Core Elements:** Local infrastructure, cultural clothing, markets, daily routines. Warm, vibrant but natural color grading.
- **Constraints:** Show utmost respect to human faces and lifestyles. No mock or degradation of poverty.\`,
        scriptRules: \`- **Voiceover Style:** BBC/NatGeo style—calm, professional, informative, and objective.
- **Tone:** Analytical and educational.
- **Auto-Corrections:** 'poor village' -> 'remote community', 'backward' -> 'traditional way of life'.\`,
        defaultNegativePrompt: "political propaganda, low quality, blurry, disrespectful portrayal, clickbait shock imagery, cartoon, 3d render, watermark, text",
        defaultThemes: ["Travel", "Documentary", "Lifestyle"],
        defaultModifiers: ["4K Drone Footage", "Cinematic Color Grading", "Vibrant Natural Light", "Photorealistic", "BBC Style"],
        defaultCameraAngles: ["Drone Shot", "Eye-level", "Medium Shot"]
    },
    'GunExperiments': {
        id: 'GunExperiments',
        dropdownName: 'Gun Test and Experiment',
        visualRules: \`- **Art Style:** Ultra-realistic, high-quality outdoor daylight action photography. Cinematic high-speed/slow-motion capture style.
- **Environment:** Brightly-lit outdoor target practice ranges, safety-controlled grasslands.
- **Core Elements:** Detailed close-ups of firearms, visual impact forces (smoke, sparks, shattering targets), professional safety gear.
- **Constraints:** Shooters must look focused and wear safety glasses/earmuffs. NEVER point a weapon at humans/animals. No indoor shooting.\`,
        scriptRules: \`- **Voiceover Style:** Extremely energetic, curious, thrilling, and action-packed.
- **Tone:** Highly engaging and curiosity-inducing. Focuses on physical science experiments and ballistics.
- **Auto-Corrections:** 'kill'/'shoot dead' -> 'destroy'/'shatter'/'penetrate'.\`,
        defaultNegativePrompt: "cartoon, 3d render, anime, sketch, pointing gun at person, blood, body injury, violence, indoor range, dangerous handling, sci-fi weapon, laser, watermark, text, signature",
        defaultThemes: ["Action", "Science & Experiment"],
        defaultModifiers: ["High-speed Photography", "Slow Motion", "Cinematic Action", "Ultra-realistic 8K", "Outdoor Daylight"],
        defaultCameraAngles: ["Close-up", "Macro View", "Slow Motion"]
    },
    'PaintMixingASMR': {
        id: 'PaintMixingASMR',
        dropdownName: 'Handcraft Paint Mix (No Voice)',
        visualRules: \`- **Art Style:** High-definition macro videography style.
- **Environment:** Clean white or marble surface, soft diffused studio lighting (no harsh shadows).
- **Core Elements:** Metallic/glossy/pearlescent textures, smooth blending swirls, slow satisfying strokes.
- **Constraints:** ONLY gloved hands and spatula should be visible. NO human faces or bare hands. No messy environments.\`,
        scriptRules: \`- **CRITICAL RULE:** NO VOICEOVER. Generate action, ambient sound cues, and macro visual details only. Tone: Relaxing, calming ASMR.\`,
        defaultNegativePrompt: "messy environment, dirty, bare hands, human face, fast motion, low quality, blurry, text, watermark, signature",
        defaultThemes: ["ASMR", "Satisfying", "Crafts"],
        defaultModifiers: ["Macro Videography", "8K Resolution", "Soft Diffused Lighting", "Glossy Reflection", "Pearlescent Texture"],
        defaultCameraAngles: ["Extreme Close-up", "Macro View"]
    },
    'CinematicFoodHistory': {
        id: 'CinematicFoodHistory',
        dropdownName: 'Cinematic Food History Documentary',
        visualRules: \`- **Art Style:** Museum-quality renaissance oil painting style, hyper-realistic, 8K.
- **Environment & Lighting:** Warm candlelight, volumetric fog, deep shadows, dark cinematic interior.
- **Camera Movement:** Slow push-in or static portrait shot.
- **Core Elements:** Split composition, historical clothing, antique props (e.g., vintage coffee beans, ancient maps).
- **Facial Constraints:** Highly detailed skin, serious expression, looking directly at the camera.\`,
        scriptRules: \`- **Voiceover Style:** Slow, grave, and mysterious storytelling (male, age 40-50).
- **Tone:** Intriguing, educational, and cinematic.
- **Auto-Corrections:** 'food' -> 'ancient relic', 'old' -> 'historic', 'made' -> 'forged'.\`,
        defaultNegativePrompt: "modern, daylight, bright colors, cartoon, anime, 3d render, text, watermark, low quality, CGI, futuristic, smiling, plastic skin, chaotic composition, deformed",
        defaultThemes: ["Ancient History", "Documentary", "Food"],
        defaultModifiers: ["Museum-quality Oil Painting", "Volumetric Fog", "Cinematic Candlelight", "Hyper-realistic 8K", "Depth of Field"],
        defaultCameraAngles: ["Establishing Shot", "Static Portrait", "Extreme Close-up"]
    },
    'CinematicCityReconstruction': {
        id: 'CinematicCityReconstruction',
        dropdownName: 'Cinematic City Reconstruction Documentary',
        visualRules: \`- **Art Style:** Hyper-realistic AI reconstruction, 8K documentary quality.
- **Environment & Lighting:** Dynamic weather, smoke, torchlight or fog with historically accurate environment.
- **Camera Movement:** Drone shots, tracking, first-person POV, and slow push-in.
- **Core Elements:** Period-accurate architecture, clothing, daily life, and bustling crowds.
- **Facial Constraints:** Natural expressions, busy with their tasks, not looking directly at the camera.\`,
        scriptRules: \`- **Voiceover Style:** Immersive, cinematic, and storytelling-focused (Male, Netflix documentary style).
- **Tone:** Educational, suspenseful, and time-travel feeling.
- **Auto-Corrections:** 'old' -> 'ancient', 'city' -> 'civilization', 'people' -> 'citizens'.\`,
        defaultNegativePrompt: "modern elements, cartoon, 3d render, static scene, clean clothes, anachronism, empty streets, bad anatomy, text, watermark, bright artificial lighting",
        defaultThemes: ["Historical", "Documentary", "Architecture"],
        defaultModifiers: ["Hyper-realistic AI Reconstruction", "Unreal Engine 5", "Volumetric Fog", "Cinematic Lighting", "8K Resolution"],
        defaultCameraAngles: ["Drone Shot", "First-person POV", "Slow Push-in"]
    },
    'AnthropomorphicCatComedy': {
        id: 'AnthropomorphicCatComedy',
        dropdownName: 'AI Cat Funny Moment (No Voice)',
        visualRules: \`- **Art Style (CRITICAL):** 100% hyper-realistic live-action video, raw smartphone recording style (iPhone/TikTok camera look). ABSOLUTELY NO 3D, NO CGI, NO ANIMATION.\\n- **Environment & Lighting:** Domestic home setting, dark messy bedroom or living room, realistic home interior. Dimly lit room illuminated rawly by the blue light screen glow of a laptop or phone, creating high-contrast natural lighting.\\n- **Camera Movement & Framing (CRITICAL):** Close-up or medium tight shots focusing tightly on the cat's expressions and actions. Raw handheld shaky cam, casual amateur video feel, as if a person is recording their own pet in real-time. No polished or cinematic studio camera setups.\\n- **Core Elements:** A real, fluffy domestic cat acting unexpectedly with human-like expressions (eyes widening in fear, opening mouth in anger). Highly detailed and authentic cat fur textures.\\n- **Facial Constraints:** The cat's face must be extremely expressive and photorealistic. Humans in the background must have natural, genuine laughing or shocked facial expressions, looking like real people in amateur home videos.\`,
        scriptRules: \`- **CRITICAL RULE:** NO VOICEOVER. Generate action, facial expression changes, and ambient sound cues only.\\n- **SFX & Audio Tone:** Real-time viral audio cues including sudden human wheezing laughter, cat growling or sharp meows, object impact sounds (funny bonk or slam), and ambient indoor silence.\\n- **Tone:** Slapstick comedy, viral meme, chaotic pet humor.\\n- **Auto-Corrections:** 'cat' -> 'expressive fluffy domestic tabby cat', 'man' -> 'ordinary young guy in casual home clothes', 'monster' -> 'funny cat', 'ocean' -> 'room'.\`,
        defaultNegativePrompt: "cartoon, 3d render, anime, animation, Pixar style, Disney style, CGI look, video game graphics, professional studio lighting, clean cinematic look, high-end film cameras, fancy cinematography, vibrant colors, bright daylight, text, watermark, low resolution, deformed paws, unrealistic fur",
        defaultThemes: ["Comedy", "Animal Behavior", "Meme"],
        defaultModifiers: ["Hyper-realistic Live Action", "4K Smartphone Recording", "Screen Glow Lighting", "Raw Handheld Style", "Photorealistic Fur"],
        defaultCameraAngles: ["Handheld Shaky Cam", "Close-up", "Static Mid-shot"]
    },
    'FoundFootageMythos': {
        id: 'FoundFootageMythos',
        dropdownName: 'Found Footage Horror POV (Sudden Attack)',
        visualRules: \`- **Art Style:** Hyper-realistic VFX found-footage, raw disaster recording style, 8k.
- **Environment (STRICTLY LOCKED):** You MUST extract the exact primary environment/setting described in the provided script (e.g., flooded swamp, heavy rain) and STRICTLY repeat that EXACT SAME setting in every single scene's image_prompt. DO NOT introduce new locations in later scenes. Maintain 100% geographic consistency.
- **Camera Movement & POV (STRICT):** MUST be a First-Person POV (e.g., looking out from a helicopter, shaking speedboat, or frantic smartphone recording). Apply heavy shaky cam, motion blur, and panic zoom.
- **Core Action (CRITICAL - JUMP-SCARE):** The entity MUST lock its terrifying gaze directly into the camera lens. It triggers a sudden, lightning-fast jump-scare attack, lunging STRAIGHT AT THE CAMERA with extreme high-speed motion blur. It must completely engulf and shatter the frame in a fraction of a second. ABSOLUTELY NO slow-motion movements.
- **Creature Design (CRITICAL):** Must strictly match the deeply disturbing paranormal entity described in the script. ABSOLUTELY NO muscular figures, giants, solid flesh, normal animals, or kaijus.\`,
        get scriptRules() {
            const ghostDNAs = [
                "A towering, skeletal demonic entity with gigantic, tattered bat-like wings. Its body features translucent, tightly stretched necrotic skin revealing a horrifyingly visible ribcage underneath. It has completely hollow, pitch-black eye sockets and an exposed, skull-like face with jagged, interlocking fangs. The creature stands in an unnatural, rigid posture, radiating a highly detailed, macabre, sepia-toned demonic aesthetic.",
                "A completely hairless, severely emaciated pale humanoid crawling unnaturally on all fours. Its chalky, cracked white skin is covered in deep red lacerations and bulging dark veins. It possesses a bulbous, oversized head with sunken, soulless black eyes and a disturbing, unnaturally wide, toothy grin framed by a long, wispy white beard. Its elongated, bony fingers end in filthy, cracked nails.",
                "A horrifying, towering entity with two conjoined, twisted heads; one head is frozen in a scream of agony, while the other is a demonic horned skull. Its chest cavity is violently ripped open, exposing a dark, hollow abyss of rotten flesh. The creature is completely drenched in dried, dark blood and black ichor, wearing tattered, ancient ceremonial robes that seem merged with its rotting body.",
                "A grotesque, bloated humanoid wearing ancient, tattered monk robes covered in dirt and grime. It sports a terrifying, ear-to-ear razor-toothed smile. Most disturbingly, multiple grotesque, fleshy, malformed baby-like heads are sprouting directly from its shoulders and upper back. It wears a massive beaded necklace and has pale, bruised, rotting skin oozing with faint black smoke.",
                "A ghastly undead figure with frozen, pale-blue rotting skin covered in deep, bloody gashes. It has glowing white, blind dead eyes and a blood-soaked mouth completely filled with needle-like fangs. The entity is dressed in ancient, ruined red and gold oriental robes. A yellow paper talisman with glowing red blood runes is stuck to forehead, adding to its macabre, hyper-realistic gory details.",
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

            return \`- **CRITICAL RULE:** NO VOICEOVER. Generate action and ambient sound cues only (e.g., heavy breathing, engine roaring, splashing, frantic human screams).
- **Tone:** Found-footage horror, thriller, sudden disaster panic.
- **[LOCKED LOCATION]:** The environment MUST remain exactly the same across all scenes based on the user's initial prompt. Do not change geography between scenes.
- **[GHOST VISUAL DNA - CRITICAL]:** When describing the creature in the script, you MUST use this EXACT, highly detailed visual description to ensure maximum terror: "\${randomDNA}". Expand on its horrifying movements, textures, and the atmosphere based heavily on this specific description.
- **MANDATORY SCENE TAGGING (CRITICAL):** You MUST begin every single new scene or action block with a strict location tag inside brackets, derived from the user's prompt (e.g., [Location: Flooded Midnight Swamp]). You MUST repeat this EXACT SAME location tag at the beginning of EVERY SINGLE SCENE throughout the script. DO NOT drop this tag.\`;
        },
        defaultNegativePrompt: "cartoon, anime, 3d render, bright sunny day, smooth camera, static shot, studio lighting, plastic texture, text, watermark, colorful, cheerful, poorly drawn, unnatural physics, peaceful, generic CGI, dinosaur, animal, regular skeleton, generic zombie, beast, muscular, bodybuilder, kaiju, giant, colossal",
        defaultThemes: ["Horror", "Paranormal", "Found Footage"],
        defaultModifiers: ["Raw-recording Style", "Hyper-realistic VFX", "VHS Glitch", "Motion Blur", "Gloomy Low Light", "8K Resolution"],
        defaultCameraAngles: ["First-person POV", "Handheld Shaky Cam", "Panic Zoom"]
    },
    'CyberpunkMiniatureMacro': {
        id: 'CyberpunkMiniatureMacro',
        dropdownName: 'Cyberpunk Figure Showcase (Unboxing)',
        visualRules: \`- **Art Style:** Hyper-realistic macro toy photography, premium miniature action figure showcase, 4K.\\n- **Environment & Lighting:** Studio unboxing desk, premium packaging box in the background, soft spotlight, cutting mat.\\n- **Camera Movement:** Extreme macro close-ups on miniature parts, slow pans over plastic/metal joints.\\n- **Core Elements:** MUST INCLUDE giant human hands holding or assembling the miniature parts, visible articulation joints, miniature scale comparison, unboxing from a premium foam box, snapping parts together.\\n- **Facial Constraints:** Miniature painted face, hyper-detailed but clearly a plastic/resin collectible figure, NOT a real living cyborg.\`,
        scriptRules: \`- **CRITICAL RULE:** Write an engaging script for a premium toy/gadget reviewer unboxing a high-end miniature collectible.\\n- **Tone:** Enthusiastic, premium showcase, reviewing build quality, paint job, and details.\\n- **Narrative Flow:** 1. Introduce the premium box. 2. Take the figure out and assemble the parts. 3. Showcase the articulation and final pose.\\n- **Auto-Corrections:** 'toy' -> 'premium collectible', 'real' -> 'highly detailed miniature'.\`,
        defaultNegativePrompt: "real life, living person, actual movie scene, life-size, natural landscape, outside, CGI movie, real human face, 3d render, cartoon, blurry",
        defaultThemes: ["Cyberpunk", "Miniature", "Sci-Fi"],
        defaultModifiers: ["Macro Photography", "Soft Spotlights", "Photorealistic Texture", "Depth of Field", "Hyper-detailed Plastic"],
        defaultCameraAngles: ["Extreme Close-up", "Macro Pan", "Slow Tilt-up"]
    },
    'GhibliSurvivalAnime': {
        id: 'GhibliSurvivalAnime',
        dropdownName: '2D Anime Survival (Ghibli Style) (No Voice)',
        visualRules: \`- **Art Style:** 2D anime style, Studio Ghibli or Hayao Miyazaki aesthetic, cel-shading.\\n- **Environment & Lighting:** Lush green animated woodland, heavy rain, warm kerosene lamp light inside a train, morning god rays.\\n- **Camera Movement:** Slow pans, static wide shots, gentle tracking shots.\\n- **Core Elements:** Abandoned rustic train car, overgrown railway tracks, survival gear, warm contrast of fire and rain.\\n- **Facial Constraints:** Classic anime proportions, expressive eyes, non-hyper-realistic.\`,
        scriptRules: \`- **CRITICAL RULE:** NO VOICEOVER. Generate action and ambient sound cues only.\\n- **Voiceover Style:** No traditional narration. Focus entirely on rich environmental ASMR (e.g., heavy rain, crackling fire, train creaking, wind).\\n- **Tone:** Heartwarming, nature-focused, survival, and highly atmospheric.\\n- **Auto-Corrections:** 'real' -> 'hand-drawn', 'forest' -> 'lush animated woodland', 'train' -> 'abandoned rustic train car'.\`,
        defaultNegativePrompt: "3d, cgi, photorealistic, hyper-realistic, live action, shaky cam, modern, neon, poorly drawn, distorted anatomy, text, watermark, anime cliché tropes, over-saturated",
        defaultThemes: ["Anime", "Survival", "Nature"],
        defaultModifiers: ["Studio Ghibli Aesthetic", "Cel-shaded", "Painterly Backgrounds", "Warm God Rays", "High-quality 2D Animation"],
        defaultCameraAngles: ["Wide Shot", "Slow Pan", "Gentle Tracking"]
    }
};`;

const before = code.substring(0, code.indexOf('export const nicheConfigs: Record<string, NicheConfig> = {'));
const afterMatch = code.match(/};\s*export function getNicheConfig/);
const after = code.substring(afterMatch.index + 2); // get everything from "export function getNicheConfig"

fs.writeFileSync('niche-directives.ts', before + newCode + '\n\n' + after.trimStart());
console.log('Success');
