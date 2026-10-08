# AI Automationer - Work Status Report

## 1. Completed Features (As per Metadata Log)
- **Visual Remake:** Supports both Gemini (time-segments) and OpenRouter (frame-based).
- **Prompt Quality:** Hyper-literal analysis and text filtering implemented.
- **Character Management:** Manual edit of AI descriptions and protection from overwrite.
- **Script Processing:** Line-by-line extraction and natural translation.
- **Chunk System:** Handles large scripts in segments to avoid API limits.
- **Checkpoint System:** Saves progress to localStorage for resuming tasks.
- **UI/UX:** Modern cyan highlights, status indicators, and organized settings.

## 2. Recent Changes (By Assistant - Pending Review)
- Added progress tracking for ZIP downloads.
- Added progress tracking for Video URL Deconstruction.
- **Video Prompt Duration:** Implemented mandatory selection (4s, 8s, 10s) with validation.
- **Enhanced Progress Indicators:** Added detailed live status messages for all major functions (Prompt Gen, Video Analysis, Script Analysis).
- **FIX: Notification Mismatch & Duplicate Uploads:** Fixed a bug where `ai.files.upload` was called in a loop during chunk analysis, causing the top progress bar to falsely switch back to "Uploading..." while the bottom log showed "Analyzing". Video upload now safely occurs exactly *once* before the loop starts.
- **Improved Character Bible Details:** Modified `ai-prompts.ts` to force the AI to return EXHAUSTIVE, high-definition character descriptions (age, facial structure, precise clothing layers, scars) instead of short generic sentences, greatly enhancing visual consistency.
- **Autopilot Voiceover Fix:** Resolved a compilation error when the Autopilot attempts to trigger the `handleAudioAutopilot` function, ensuring end-to-end automation does not break.
- **Veo video generator Environment API Key integration:** Updated `use-veo.ts` to allow users to generate videos using the Environment API Key directly without manually specifying an api key, solving api errors and making it easier to test.

## 3. Known Issues / Limitations
- **API Quota:** Free Gemini API keys hit limits on long videos or high-frequency requests.
- **Visual Remake (URL):** Currently disabled in code to prevent logic conflicts.



## 4. Today's Tasks (2026-05-15)
- [x] **Video Chunking Hang Fix:** Addressed a critical bug where processing large video files would hang indefinitely on the frontend. Added a robust 30-second timeout, error handling, and a fallback mechanism to `getVideoDuration` reading `onloadedmetadata` so that the UI can gracefully recover and proceed with analysis, even when the browser fails to quickly parse large video headers.
- [x] **New Model Additions:** Added testing and configuration for new highly anticipated models: `deepseek/deepseek-v4-flash:free`, `arcee-ai/trinity-large-thinking:free`, and `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`. 
- [x] **Model Upgrades to Free Tier:** Upgraded `nvidia/nemotron-nano-12b-v2-vl`, `z-ai/glm-4.5-air`, and `nvidia/nemotron-3-nano-30b-a3b` to their OpenRouter `:free` variants.
- [x] **Working List Updates:** Promoted the added models to the `workingModels` set in `config-panel.tsx` to automatically grant them the green `(working)` status badge in the UI.
- [x] **Previous Logic Fixes:** Recorded earlier completion of modal translation fixes and remaining modal alignment logic into the correct scopes.

## 5. Previous Tasks (2026-04-25)
- [x] **OpenRouter Rate Limit Throttling:** Added a proactive 2.5s global delay (`globalLastOpenRouterCallTime`) between consecutive OpenRouter API calls to prevent rate-limit (429) errors, especially when generating batches of prompts.
- [x] **Video Prompt Resume Fix:** Fixed a bug where "Resume Video Prompts" was incorrectly skipping scenes or behaving like "Regenerate All". Added robust checking for `videoPromptStatus` as well as validating that the generated text doesn't start with "Error:".
- [x] **Log Viewer Improvement:** Added a "Copy All" button to the Error and Notification log modals to easily copy the entire log stack for debugging.
- [x] **Script-Driven Prompt Generation Fix:** Ensured that manual "Resume Video Prompts" properly respects the "Script-Driven" workflow and generates the right video prompts without resetting the sequence.
- [x] **Project Reset Warning Fix & Modal Alignment:** Fixed the logic so the "Important Reminder" modal is only triggered when enabling the "Built-in Gemini Key" or pasting an API key as requested, rather than showing erroneously during video uploads or script pasting. Also fixed the CSS classes on the `ProjectResetReminderModal` to use `.confirmation-modal-overlay` and `.confirmation-modal-content` so it centers properly on screen instead of shifting left.
- [x] **Character Injection Fix:** Removed the fallback logic in `prompt-engine.ts` that erroneously injected all project characters into the video prompt generation instructions when a scene was generated prior to the exact character tracking feature. This prevents characters (like the old man) from incorrectly appearing in scenes they don't belong in.

## 5. Today's Tasks (2026-05-05)
- [x] **Rate Limit & Quota Modals:** Integrated custom, context-aware Bengali modal warnings for Gemini and OpenRouter when rate lists and daily quotas are exceeded.
- [x] **Non-Blocking Rate Limit Countdown:** Added a smart countdown UI at the top of the screen that tracks retry time logic (e.g., waiting 1-3 minutes for rate limit cooldowns) without hard-blocking user interactions in the application.
- [x] **Enhanced Free-Tier Messaging:** Differentiated OpenRouter vs Gemini quota limits, instructing the user to top up $10 or switch models when the OpenRouter API limits have capped.

## 6. Previous Tasks (2026-04-23)
- [x] **Character Structure Logic & Validation:** Addressed feedback regarding character structuring to ensure detailed character descriptions are strictly preserved without unauthorized model switching overriding the workflow. 
- [x] **Multimodal API Request Formatting:** Created and integrated `OPENROUTER_SPECIAL_MODELS` logic in `index.tsx` and `constants.ts` to support models (like `gemma-4-31b-it:free` and `qwen3-vl`) that strictly require `content` in an array format even for text-only operations.
- [x] **Arcee Models Demotion:** Moved `arcee-ai/trinity-mini` and `arcee-ai/trinity-large-preview` out of `workingModels` and the free sections directly into `paidTextModels` due to trial/free endpoint deprecation.
- [x] **New Model Additions:** Added checking and testing configuration for four new models: `openai/gpt-oss-20b`, `qwen/qwen3-next-80b-a3b-instruct`, `meta-llama/llama-3.3-70b-instruct`, and `tencent/hy3-preview`.
- [x] **Model Upgrades to Free Tier:** Upgraded `openai/gpt-oss-20b`, `qwen/qwen3-next-80b-a3b-instruct`, `meta-llama/llama-3.3-70b-instruct`, and `nousresearch/hermes-3-llama-3.1-405b` to their OpenRouter `:free` variants.
- [x] **Working List Updates:** Added the newly promoted free models (`gpt-oss-20b:free`, `qwen3-next-80b:free`, `llama-3.3-70b:free`, `hermes-3-llama-3.1-405b:free`, `hy3-preview:free`, `gemma-4-31b:free`, and `nemotron-3-super-120b:free`) to the `workingModels` set, automatically granting them the green `(working)` badge in the UI.
- [x] **Story Models Reordering:** Reordered the models in `constants.ts` so the more capable and popular models (Nemotron, Gemma, Llama, Qwen, Hy3) are at the top of the Story Generation list.
- [x] **Fix Duplicate Keys in Dropdown:** Resolved a React `key` collision warning in `config-panel.tsx` caused by appending the exact same model to multiple category arrays.
- [x] **DeepSeek Model Demotion:** Removed all DeepSeek variants (`deepseek-r1-0528`, `deepseek-r1t2-chimera`, `deepseek-r1t-chimera`) from the `workingModels` set and moved them from `storyModels` down to `paidTextModels`, removing their green status and moving them out of the free scope.

## 5. Previous Tasks (2026-04-16)
- [x] **Fix Fake Progress Bar:** Removed the fake `setInterval` progress bar in `handleVideoFileSelect` and replaced it with real-time, step-by-step progress updates.
- [x] **Improve UI/UX for Progress Indicator:** Made the progress notification smaller, non-overlapping, friendly, and centered horizontally at the top.
- [x] **Add Progress Indicators for other actions:** Added progress/loading states for actions like uploading style reference images.
- [x] **Improve Character Details in Video Prompts:** Updated `ai-prompts.ts` to extract highly detailed character descriptions (appearance, clothes, lighting, expressions, vibes) and implemented post-processing to auto-replace character IDs (`char_id` / `[char_1]`) with these visual details in the final video prompts. Added progress notification during post-processing.
- [x] **Fix Video Prompt Button States (Resume vs. Regenerate):** Updated the logic in `video-prompt-settings.tsx` to dynamically and robustly evaluate the actual `results` array. 
  - "Generate Video Prompts" button now accurately reads "Resume Video Prompts" if there are pending/failed items, or "Regenerate All Prompts" if all are complete.
  - "Reset All" button is properly enabled/disabled based directly on whether any video prompts exist in the storyboard, fixing the bug that occurred on page reloads.
- [x] **New Project Data Conflict Warning:** Added a prominent yellow warning alert under the "Clear Browser Cache" button in Project Manager to remind users to clear cache when starting new projects, preventing data leakage between sessions.

## 7. Critical Bugs & Remaining Tasks (Identified 2026-05-05)

### OpenRouter Execution & Rate Limit Flaws
1. **Scope Logic Constraint:** Retry and cooldown loop logic must apply **strictly** and **exclusively** to OpenRouter requests. Global execution delays incorrectly affect Gemini and other providers.
2. **True Adaptive Cooldown Calculation:** Hardcoded short countdowns (4, 8, 16 seconds) do not work for serious OpenRouter timeouts. The system must observe real `429` behavior and adapt to real-world penalty boxes (often up to 10 minutes) instead of purely UI countdowns.
3. **Throttling Queue / 20 Calls per Minute Limit:** OpenRouter free quotas cap at roughly 20 requests per minute. The system currently spams rapid-fire requests. We must implement a strict Sequential Queue (`Task Queue`) or throttling system that rigidly paces requests to stay under 20 Req/Min.
4. **Retry Burst Issue (1-2s gap):** The exponential backoff code is secretly broken—retries are bypassing the delay mechanism and firing instantly. The entire retry execution structure needs to be audited to enforce actual pauses.
5. **Silent Model Switch Failure:** Selecting specific models (e.g., Gemma) causes execution to die completely where no network request is sent at all. Model routing and fallback tracking is failing.
6. **User Interaction Lockout:** During an active cooldown penalty block, the UI must block manual click-spamming by the user to prevent further rate limit penalties on the server.

### Persistence & Pagination Failures
7. **Project "Resume" LocalStorage Desync:** If generation is paused (e.g., at prompt 75 of 126), and the page is refreshed, hitting "Resume" incorrectly starts at item index 0 instead of index 76. The system fails to sync `resumable_task` and `interim_results` properly on initial hydration.

### Miscellaneous Model Configurations
8. **Chunking & Reasoning:** `maxChunkLength` needs to be enforced at 1200, and `reasoning` needs to be explicitly enabled in payloads sent to OpenRouter models capable of it.
9. **API UI Guide:** Add explicit charts/tables detailing limits (like 50 reqs/day free, 1000 paid) directly into the app's info guide UI.

## 8. Older Remaining Tasks (From 2026-03-31)
1. **Auto-update Model Mode:** When a paid model is selected and the user clicks "I Understand", automatically update the "Model Mode" radio button to "Standard (Paid)".
2. **Add New OpenRouter Models:** Add new/latest OpenRouter models to the list.
3. **UI/UX Polish:** Fix minor display issues, adjust color combinations, and correct element sizes.

