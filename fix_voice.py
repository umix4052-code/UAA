import sys

files = ["use-voiceover.ts", "voiceover-generator.tsx"]
for f in files:
    try:
        with open(f, 'r') as file:
            content = file.read()
            
        comment = "\n// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC\n"
        
        if not content.startswith("// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC"):
            content = "// 🚫 STRICTLY RESTRICTED - DO NOT TOUCH OR MODIFY THIS LOGIC\n" + content
            
        with open(f, 'w') as file:
            file.write(content)
    except FileNotFoundError:
        pass
