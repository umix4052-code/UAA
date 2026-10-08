import sys
content = open('index.tsx').read()
content = content.replace('p.userDescription.includes(`ID: ${c.character_id}`)', '(p.userDescription || \'\').includes(`ID: ${c.character_id}`)')
content = content.replace('c.visual_description.substring(0, 20)', '(c.visual_description || \'\').substring(0, 20)')
content = content.replace('name: c.name,', 'name: c.name || \'Unknown Character\',')
open('index.tsx', 'w').write(content)

content2 = open('prompt-engine.ts').read()
content2 = content2.replace('${p.userDescription.trim()}', '${(p.userDescription || \'\').trim()}')
content2 = content2.replace('${p.aiDescription.trim()}', '${(p.aiDescription || \'\').trim()}')
open('prompt-engine.ts', 'w').write(content2)

content3 = open('visual-remake-engine.ts').read()
content3 = content3.replace('${p.userDescription.trim()}', '${(p.userDescription || \'\').trim()}')
content3 = content3.replace('${p.aiDescription.trim()}', '${(p.aiDescription || \'\').trim()}')
open('visual-remake-engine.ts', 'w').write(content3)
