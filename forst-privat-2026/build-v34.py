#!/usr/bin/env python3
"""Forst V34: exactly ONE interactive presentation stage, retaining the tested game engine.
No inherited foreground bag overlay, no extra active parchment panel, no encrypted book.
"""
from pathlib import Path
import base64,json,re,subprocess,tempfile,html as htmlmodule

root=Path(__file__).resolve().parent
source=root.parent/'forst-v32'/'index.html'
out=root.parent/'forst-v34'/'index.html'
assets=json.loads((root/'v34-one-stage-assets.json').read_text(encoding='utf-8'))
page=source.read_text(encoding='utf-8')
if 'let BOOK = ' not in page or 'forst-v32-only-design' not in page:
    raise RuntimeError('V32 book or previous UI layer missing')

for kind,selector in [('style','forst-v32-only-design'),('script','forst-v32-only-design-script')]:
    pattern=r'<'+kind+r' id="'+selector+r'">[\s\S]*?</'+kind+r'>'
    page,count=re.subn(pattern,'',page,count=1)
    if count!=1:raise RuntimeError('Previous UI layer not removed: '+selector)

if page.count('const SKIN_ASSETS=')!=0 or page.count('forst-v32-only-design')!=0:
    raise RuntimeError('The previous skin still renders')
required=['frame','boar','choiceRuins','choiceClearing','choiceAttack','choiceDodge','choiceInventory']
if set(assets['assets'])!=set(required):
    raise RuntimeError('Seven illustrations expected')
urls={}
for key in required:
    encoded=assets['assets'][key]
    if len(base64.b64decode(encoded,validate=True))<9000:
        raise RuntimeError('Invalid art: '+key)
    urls[key]='data:image/webp;base64,'+encoded
css=assets['css']
controller=assets['js']
if '#forst-stage' not in css or "paintChoices();" not in controller:
    raise RuntimeError('Interactive scene, buttons or chapter controls missing')
code='const FORST_VISUALS='+json.dumps(urls,ensure_ascii=False,separators=(',',':'))+';\n'+controller
addon='<style id="forst-one-stage">'+css+'</style><script id="forst-one-controller">'+code+'</script>'
if page.count('</body>')!=1:raise RuntimeError('Invalid game HTML')
page=page.replace('</body>',addon+'\n</body>')
page=re.sub(r'<title>[^<]*</title>','<title>Der Forst der Finsternis — V34</title>',page,count=1)
parts=re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',page,re.I)
if len(parts)!=6:raise RuntimeError('Expected six complete scripts: '+str(len(parts)))
with tempfile.TemporaryDirectory() as td:
    for i,part in enumerate(parts):
        fp=Path(td)/('script_'+str(i)+'.js');fp.write_text(part,encoding='utf-8')
        subprocess.run(['node','--check',str(fp)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
for path in [out,root.parent/'forst-final'/'index.html']:
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(page,encoding='utf-8')
print('V34 complete:',out,'bytes',len(page.encode('utf-8')),
      'book sections integrated,',len(parts),'scripts checked, one active visible UI')
