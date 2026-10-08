const fs = require('fs');
let code = fs.readFileSync('ai-prompts.ts', 'utf-8');

const searchStr = `**PHASE 3: JSON OUTPUT STRUCTURE**
The final output MUST be a valid JSON object matching the following structure exactly:
{
  "scenes": [
    {
      "scene_description": "The breakdown of what is happening.",
      "camera_angle": "Select the most appropriate primary camera angle from this list: [\${cameraAngle !== 'Default' ? cameraAngle : 'Cinematic, Wide Shot, Close-up'}]. You may combine this primary angle with a relevant cinematic movement (e.g., tracking, slow pan, push in) to enhance the scene, but keep the core angle consistent.",
      "characters_in_scene": ["char_1", "char_2"], // An array of strings containing ONLY the specific Character IDs that are VISUALLY PRESENT in this specific scene. If no characters are present, return an empty array [].
      "master_prompt": "A highly detailed and structured cinematic master visual prompt."
    }
  ],`;

const replaceStr = `**PHASE 3: JSON OUTPUT STRUCTURE**
Before generating the master_prompt, you MUST strictly determine the 'location_status' and write a short 'status_justification' to logically prove whether a location change is explicitly mentioned in the script.
The final output MUST be a valid JSON object matching the following structure exactly:
{
  "scenes": [
    {
      "scene_number": 1,
      "scene_description": "The breakdown of what is happening.",
      "location_status": "SAME_AS_PREVIOUS or NEW_LOCATION",
      "status_justification": "Briefly explain why the location changed or remained the same based on the script.",
      "camera_angle": "Select the most appropriate primary camera angle from this list: [\${cameraAngle !== 'Default' ? cameraAngle : 'Cinematic, Wide Shot, Close-up'}]. You may combine this primary angle with a relevant cinematic movement (e.g., tracking, slow pan, push in) to enhance the scene, but keep the core angle consistent.",
      "characters_in_scene": ["char_1", "char_2"], // An array of strings containing ONLY the specific Character IDs that are VISUALLY PRESENT in this specific scene. If no characters are present, return an empty array [].
      "master_prompt": "A highly detailed and structured cinematic master visual prompt."
    }
  ],`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    console.log("Fix applied.");
    fs.writeFileSync('ai-prompts.ts', code);
} else {
    console.log("Fix search string not found!");
}
