#!/usr/bin/env python3
"""Forst V32: one active illustrated skin, no duplicated satchel/panels and readable full chapters."""
from pathlib import Path
import re,subprocess,tempfile

root=Path(__file__).resolve().parent
src=root.parent/'forst-v31'/'index.html'
html=src.read_text(encoding='utf-8')
if 'let BOOK = ' not in html or 'forst-v31-only-design' not in html:raise RuntimeError('V31 source missing')
# Retire the second panel renderer: original menus, actions and three character rolls remain.
html,n=re.subn(r'<script id="v24-functional-polish">[\s\S]*?</script>','',html,count=1)
if n!=1:raise RuntimeError('Duplicate V24 menu renderer not found')
old="if(visiblePanel==='story'&&state.current)requestAnimationFrame(paginateStoryLeaves);"
if html.count(old)!=1:raise RuntimeError('Old leaf pagination missing')
html=html.replace(old,'/* One scrollable, complete book section */')

pat=r'<style id="forst-v31-only-design">([\s\S]*?)</style>'
m=re.search(pat,html)
if not m:raise RuntimeError('Existing single V31 skin missing')
css=m.group(1)
css=css.replace('#forestFx,#frontOrnaments,#v23-bag-ornament,#forst-foe-lunge{',
                '#forestFx,#frontOrnaments,#v23-bag-ornament,#v23-skull-ornament,#forst-foe-lunge{')
changes=[
 ('white-space:pre-wrap!important','white-space:pre-line!important'),
 ('font:clamp(15px,4.1vw,19px)/1.49','font:clamp(16px,4.42vw,19px)/1.55'),
 ('color:#291a10!important','color:#1e130a!important'),
 ('font:clamp(15px,4vw,18px)/1.45','font:clamp(16px,4.25vw,18px)/1.5'),
 ('padding:4px 11px 38px!important','padding:8px 12px 35px!important'),
 ('left:18%!important;width:71.5%!important;height:51%!important;z-index:55',
  'left:17%!important;width:76%!important;height:53%!important;z-index:55'),
 ('left:18.5%!important;top:17%!important;width:71.5%!important;',
  'left:17.6%!important;top:17%!important;width:75%!important;'),
 ('min-height:34px!important;','min-height:42px!important;'),
 ('font:12px Georgia,serif!important;padding:6px 7px!important',
  'font:14px Georgia,serif!important;padding:8px 10px!important'),
 ('font:13px Georgia,serif!important;color:#714e2e!important',
  'font:15px Georgia,serif!important;color:#4c2d17!important'),
 ('font:10px Georgia,serif!important','font:12px Georgia,serif!important'),
 ('font:11px/1.15 Georgia,serif','font:12px/1.18 Georgia,serif'),
 ('font-size:15px;color:#fff1cc','font-size:17px;color:#fff1cc'),
 ('font:700 clamp(22px,6.2vw,33px)/1.12','font:700 clamp(23px,6.45vw,34px)/1.17')
]
for before,after in changes:css=css.replace(before,after)
# The forest frame already includes a finished satchel in front.
# Delete the separately rendered second satchel instead of stacking another layer.
css=re.sub(r'#skin-satchel\{[^}]*\}','',css)
css=re.sub(r'#app\.skin-battle #skin-satchel\{[^}]*\}','',css)
css=css.replace('#skin-satchel{height:13%!important}','')
css+="""
#veil .storyChoice img.choiceArt{display:block!important}
#veil .hpBox *,#veil .hpBox.enemy *{color:#f8e6c0!important;text-shadow:0 1px 2px #000!important}
#veil .storyText{letter-spacing:.005em!important;hyphens:auto!important;overflow-wrap:break-word!important}
#veil .choices{margin-bottom:24px!important}
#veil .sheetActions button,#veil .forst-stat-roll button{font-size:14px!important;min-height:44px!important}
#veil .storyChoice{min-height:146px!important}
#veil .forst-stat-roll{border:1px solid #a88a55!important;border-radius:8px!important;padding:8px!important;margin:9px 0!important}
#skin-ui-title{font-size:clamp(19px,5.6vw,27px)!important}
@media(max-width:350px){#veil{left:16.5%!important;width:77%!important}#veil .sheetBody{padding-left:10px!important;padding-right:10px!important}#veil .storyText{font-size:16px!important;line-height:1.48!important}#veil .storyChoice{min-height:133px!important}}
"""
html=html.replace(m.group(0),'<style id="forst-v32-only-design">'+css+'</style>')

pat=r'<script id="forst-v31-only-design-script">([\s\S]*?)</script>'
m=re.search(pat,html)
if not m:raise RuntimeError('V31 design controller missing')
js=m.group(1)
js,n=re.subn(r"const bag=document\.createElement\('img'\);bag\.id='skin-satchel';bag\.src=SKIN_ASSETS\.bag;bag\.alt='';",'',js)
if n!=1:raise RuntimeError('Duplicated satchel reference not found')
js=js.replace('app.append(wrap,stats,boar,bag);','app.append(wrap,stats,boar);')
before="const art=card.querySelector('img.choiceArt');\n  if(!art)continue;"
after="let art=card.querySelector('img.choiceArt');\n  if(!art){art=document.createElement('img');art.className='choiceArt';art.alt='';card.prepend(art);}"
if before not in js:raise RuntimeError('Choice-card control missing')
js=js.replace(before,after)
before="""else if(i%3===0)art.src=SKIN_ASSETS.cards.attack;
  else if(i%3===1)art.src=SKIN_ASSETS.cards.dodge;
  else art.src=SKIN_ASSETS.cards.inventory;"""
after=r"""else art.src=SCENE_ART[choiceArtKey(label,Number((card.getAttribute('onclick')||'').match(/choose\((\d+)/)?.[1]||0))]||SCENE_ART.forest_path;"""
if before not in js:raise RuntimeError('Incorrect default choice art missing')
js=js.replace(before,after)
before="const nativeRender=renderPanel;\nrenderPanel=function(){const r=nativeRender.apply(this,arguments);renderSkin();makeCards();return r};"
after=r"""function reflowChapter(){
 if(visiblePanel!=='story')return;
 const t=byId('sheetBody')?.querySelector('.storyText');if(!t)return;
 const raw=t.textContent, token='\uE000';
 t.textContent=raw.replace(/\r/g,'').replace(/\n[ \t]*\n+/g,token).replace(/[ \t]*\n[ \t]*/g,' ').replaceAll(token,'\n\n').replace(/[ \t]{2,}/g,' ');
}
const nativeRender=renderPanel;
renderPanel=function(){const r=nativeRender.apply(this,arguments);renderSkin();makeCards();reflowChapter();return r};"""
if before not in js:raise RuntimeError('Original skin render wrapper missing')
js=js.replace(before,after)
if js.count('renderPanel=function()')!=1:raise RuntimeError('Multiple presentation render wrappers')
html=html.replace(m.group(0),'<script id="forst-v32-only-design-script">'+js+'</script>')
if 'skin-satchel' in html or 'forst-v31-only-design' in html or html.count('const SKIN_ASSETS=')!=1:raise RuntimeError('Old visual code remains')
html=re.sub(r'<title>[^<]*</title>','<title>Der Forst der Finsternis — V32</title>',html,count=1)
scripts=re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',html,re.I)
if len(scripts)!=6:raise RuntimeError('Unexpected scripts: '+str(len(scripts)))
with tempfile.TemporaryDirectory() as d:
 for i,code in enumerate(scripts):
  file=Path(d)/('forst-'+str(i)+'.js');file.write_text(code,encoding='utf-8')
  subprocess.run(['node','--check',str(file)],check=True,stdout=subprocess.DEVNULL)
for out in [root.parent/'forst-v32'/'index.html',root.parent/'forst-final'/'index.html']:
 out.parent.mkdir(parents=True,exist_ok=True);out.write_text(html,encoding='utf-8')
print('V32 clean game published:',len(html),'characters;',len(scripts),'scripts; one UI skin; full text scroll')
