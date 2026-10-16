#!/usr/bin/env node
/* Forst V25: preserve the complete V24 standalone game, changing only depth layers. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,src=path.join(root,'spiel-luxus-v24-standalone.html');
let html=fs.readFileSync(src,'utf8');
if(html.length<5800000||!html.includes('id="v24-goldskin"')||!html.includes('backpackHotspot'))throw Error('Standalone V24 invalid');
const additions=String.raw`<style id="v25-bag-and-attack">
/* Reuse identical existing background artwork for the bag; raise only its own visual region. */
#forstBagForeground{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:56;pointer-events:none;user-select:none;-webkit-user-drag:none;clip-path:inset(77% 0 0 76%);-webkit-mask-image:radial-gradient(ellipse 12% 14% at 91% 93%,#000 49%,#000e 67%,transparent 96%);mask-image:radial-gradient(ellipse 12% 14% at 91% 93%,#000 49%,#000e 67%,transparent 96%)}
#app>.backpackHotspot{z-index:57!important;pointer-events:auto!important}
/* An enemy cut from its own existing illustration reaches out over the parchment. */
#forstBattleCharge{position:absolute;z-index:54;pointer-events:none;display:none;object-fit:cover;object-position:center 43%;user-select:none;-webkit-user-drag:none;-webkit-mask-image:radial-gradient(ellipse 43% 45% at 50% 47%,#000 46%,#000e 64%,transparent 100%);mask-image:radial-gradient(ellipse 43% 45% at 50% 47%,#000 46%,#000e 64%,transparent 100%);filter:drop-shadow(0 12px 11px #0009);transform-origin:center 36%}
#forstBattleCharge.is-boar{object-position:center 50%}
@media(prefers-reduced-motion:no-preference){#forstBattleCharge.lunging{animation:forstCharge .7s cubic-bezier(.18,.72,.32,1.12) both}@keyframes forstCharge{0%{opacity:0;transform:scale(.8) translateY(-13%)}75%{opacity:1;transform:scale(1.08) translateY(4%)}100%{opacity:1;transform:scale(1) translateY(0)}}}
</style>
<script id="v25-depth-engine">
(function(){
 'use strict';
 const app=document.getElementById('app'),bg=document.getElementById('bg'),scene=document.getElementById('dynamicScene');
 if(!app||!bg||!scene)return;
 let bag=document.getElementById('forstBagForeground');
 if(!bag){bag=document.createElement('img');bag.id='forstBagForeground';bag.src=bg.src;bag.alt='';bag.setAttribute('aria-hidden','true');app.appendChild(bag)}
 const attack=document.createElement('img');attack.id='forstBattleCharge';attack.alt='';attack.setAttribute('aria-hidden','true');app.appendChild(attack);
 let encounter='';
 function imageForOpponent(){
  const name=String(state?.combat?.name||'').toLocaleLowerCase('de');
  const options=[
   [/wildschwein|keiler|wildsau|wild(?:er|e|es)?\s+eber|\beber\b/,'wild_boar'],
   [/waldschrat|baumgeist/,'waldschrat_duo'],
   [/ork|orc/,'ork_battle'],[/wolf|wölf/,'beast'],
   [/spinne|skorpion/,'cave_blue'],[/troll|oger|riese/,'guardian'],
   [/ghul|ghoul|skelett|zombie|untot/,'secret_chamber']
  ];
  for(const [pattern,key] of options)if(pattern.test(name)&&SCENE_ART[key])return [SCENE_ART[key],key];
  const img=scene.querySelector('img');
  return [img?.currentSrc||img?.src||SCENE_ART.ork_battle||'', 'other'];
 }
 function sync(){
  if(visiblePanel!=='combat'||!state?.combat||state.combat.s<=0){attack.style.display='none';encounter='';return}
  const [src,key]=imageForOpponent(),a=app.getBoundingClientRect(),r=scene.getBoundingClientRect();
  if(!src||r.width<10||r.height<10){attack.style.display='none';return}
  const w=r.width*.94,h=r.height*1.95;
  Object.assign(attack.style,{display:'block',left:(r.left-a.left+(r.width-w)/2)+'px',top:(r.top-a.top-r.height*.13)+'px',width:w+'px',height:h+'px'});
  attack.classList.toggle('is-boar',key==='wild_boar');
  if(attack.src!==src)attack.src=src;
  const signature=key+'|'+state.current+'|'+state.combat.name;
  if(encounter!==signature){encounter=signature;attack.classList.remove('lunging');void attack.offsetWidth;attack.classList.add('lunging')}
 }
 const original=renderPanel;
 renderPanel=function(){const value=original.apply(this,arguments);requestAnimationFrame(sync);return value};
 window.addEventListener('resize',sync,{passive:true});
 window.addEventListener('orientationchange',sync,{passive:true});
 document.getElementById('sheetBody')?.addEventListener('scroll',sync,{passive:true});
 new MutationObserver(()=>requestAnimationFrame(sync)).observe(scene,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 requestAnimationFrame(sync);
})();
</script>`;
html=html.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis – V25</title>');
html=html.replace('</body>',additions+'</body>');
const open=(html.match(/<script(?:\s|>)/gi)||[]).length,close=(html.match(/<\/script>/gi)||[]).length;
if(open!==5||close!==5||html.includes('const PATCHES=')||html.includes('spiel-luxus-v17.html'))throw Error('V25 validation failed');
const dest=path.join(root,'spiel-luxus-v25-eigenstaendig.html');
fs.writeFileSync(dest,html,'utf8');
console.log('Generated V25 standalone:',html.length,'characters');
