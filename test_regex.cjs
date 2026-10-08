let newImgPrompt = "Style: Default / General Themes: None - A cinematic shot of [Character: Roy].";
const prefixMatch = newImgPrompt.match(/^(?:\\**Style:\\**|\\**Themes?:\\**|\\**General Themes?:\\**)[\\s\\S]{0,100}?(?:-)\\s*/i);
if (prefixMatch) {
    newImgPrompt = newImgPrompt.substring(prefixMatch[0].length).trim();
}
console.log(newImgPrompt);

let prompt2 = "**Style:** Default / **General Themes:** None - A cinematic shot.";
const m2 = prompt2.match(/^(?:\\**Style:\\**|\\**Themes?:\\**|\\**General Themes?:\\**)[\\s\\S]{0,100}?(?:-)\\s*/i);
if (m2) prompt2 = prompt2.substring(m2[0].length).trim();
console.log(prompt2);

let prompt3 = "Style: Cinematic / General Themes: Dark, Moody. A cinematic shot.";
const m3 = prompt3.match(/^(?:\\**Style:\\**.*?(?:\\/)\\s*)?(?:\\**General Themes?:\\**.*?(?:\\/|\\.|-)\\s*)/i);
if (m3 && m3[0].length < 150) prompt3 = prompt3.substring(m3[0].length).trim();
console.log(prompt3);

