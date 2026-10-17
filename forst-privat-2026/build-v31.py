#!/usr/bin/env python3
"""Build one V31 game from V30 data and a single active presentation layer.
Legacy CSS overrides and redundant presentation observers are removed.
Core game mechanics, 400 book sections, three character rolls and assets are retained.
"""
from pathlib import Path
import re
import subprocess
import tempfile

root=Path(__file__).resolve().parent
source=root.parent/'forst-v30'/'index.html'
original=source.read_text(encoding='utf-8')
html=original

def section(tag, name, source=original):
    pattern=rf'<{tag} id="{re.escape(name)}">([\s\S]*?)</{tag}>'
    found=re.search(pattern, source)
    if not found:
        raise RuntimeError('Missing original '+tag+' '+name)
    return found.group(1)

raw=section('script','forst-v30-behavior')
css=section('style','forst-v30-design')
assets, original_controller=raw.split('\n\n(function(){',1)
controller='(function(){'+original_controller
if not assets.startswith('const SKIN_ASSETS=') or not assets.endswith(';'):
    raise RuntimeError('Image asset package missing')

for name in ('v23polish','v24-engraved-skin','spatialV25Style',
             'v25BagDepthRefinement','forst-depth-order',
             'forst-verified-depth-v27','forst-v28-foreground',
             'forst-v29-depth','forst-v30-design'):
    pattern=rf'<style id="{re.escape(name)}">[\s\S]*?</style>'
    html,n=re.subn(pattern,'',html,count=1)
    if n!=1 and name not in ('forst-verified-depth-v27','forst-v28-foreground'):
        raise RuntimeError('Could not discard old style '+name)

for name in ('forst-verified-story-and-combat-v27','forst-v28-script','forst-v30-behavior'):
    pattern=rf'<script id="{re.escape(name)}">[\s\S]*?</script>'
    html,n=re.subn(pattern,'',html,count=1)
    if n!=1 and name not in ('forst-verified-story-and-combat-v27','forst-v28-script'):
        raise RuntimeError('Could not discard old controller '+name)

# Reuse V30's illustrated graphical shell, but ensure it is one stylesheet.
css=css.replace(
    '#skin-satchel{position:absolute;z-index:110;right:-2%;bottom:-8%;width:20%;height:22%;',
    '#skin-satchel{position:absolute;z-index:110;right:-1%;bottom:-2%;width:16%;height:16%;'
)
css=css.replace(
    '#app.skin-battle #skin-satchel{bottom:-8%;width:20%}',
    '#app.skin-battle #skin-satchel{bottom:-2%;width:16%}'
)
css=css.replace(
    '#app>.backpackHotspot{right:0!important;bottom:0!important;width:17%!important;height:11%!important;',
    '#app>.backpackHotspot{right:0!important;bottom:0!important;width:17%!important;height:14%!important;'
)
css=css.replace('padding:4px 12px 17px!important','padding:4px 11px 38px!important')
css=css.replace(
    'margin:12px 0!important;padding:5px 0!important;',
    'margin:16px 0 23px!important;padding:7px 0!important;'
)
css+='''
#veil button:focus-visible,#app .hotspot:focus-visible{outline:3px solid #e6bd6c!important;outline-offset:1px!important}
#skin-satchel{object-fit:contain!important;object-position:bottom right!important}
#app>.backpackHotspot{border-radius:45%!important}
@media(max-height:760px){#veil{top:35%!important;height:52%!important}#veil .sheetBody{padding-bottom:48px!important}#skin-satchel{height:13%!important}}
'''

# Keep the exact scene selected by the original combat engine, not an unrelated monster.
controller=controller.replace(
    'if(sc.dataset.scene!==art)showMainScene(art,Number(state.current)||7);',
    '/* Original game determines the correct opponent scene. */'
)
# Replace V30's two chained renderPanel wrappers with one.
controller=controller.replace(
    "const prevRender=renderPanel;\nrenderPanel=function(){const v=prevRender.apply(this,arguments);renderSkin();return v};",
    ""
)
controller=controller.replace(
    "const lastRender=renderPanel;\nrenderPanel=function(){const r=lastRender.apply(this,arguments);makeCards();return r};\nrenderSkin();makeCards();",
    "const nativeRender=renderPanel;\nrenderPanel=function(){const r=nativeRender.apply(this,arguments);renderSkin();makeCards();return r};\nrenderSkin();makeCards();"
)
controller=controller.replace(
    "const byId=id=>document.getElementById(id);",
    "cleanStory=function(t){return String(t||'').trim()};\nconst byId=id=>document.getElementById(id);"
)
if controller.count('renderPanel=function()')!=1:
    raise RuntimeError('More than one active renderPanel presentation hook')

addon=('<style id="forst-v31-only-design">'+css+'</style>'
       +'<script id="forst-v31-only-design-script">'+assets+'\n'+controller+'</script>')
if html.count('</body>')!=1:
    raise RuntimeError('Invalid HTML skeleton')
html=html.replace('</body>',addon+'\n</body>')
html=re.sub(r'<title>[^<]*</title>',
            '<title>Der Forst der Finsternis — V31</title>',html,count=1)
scripts=re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',html,re.I)
if len(scripts)!=7:
    raise RuntimeError('Unexpected inline script count: '+str(len(scripts)))
with tempfile.TemporaryDirectory() as directory:
    for index,script in enumerate(scripts):
        path=Path(directory)/('script-'+str(index)+'.js')
        path.write_text(script,encoding='utf-8')
        subprocess.run(['node','--check',str(path)],check=True,
                       stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
if ('forst-v29-rolls' not in html or html.count('const SKIN_ASSETS=')!=1
    or 'forst-v30-design' in html or 'forst-v29-depth' in html):
    raise RuntimeError('V31 state or redundant skin check failed')

for dest in (root.parent/'forst-v31'/'index.html',
             root.parent/'forst-final'/'index.html'):
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(html,encoding='utf-8')
print('V31 READY',len(html),'characters;',len(scripts),
      'validated scripts; one active game skin')
