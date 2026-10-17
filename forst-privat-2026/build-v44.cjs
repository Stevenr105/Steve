'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const dir=__dirname;
let html=fs.readFileSync(path.resolve(dir,'../forst-v43/index.html'),'utf8');
const cssAnchor=/<style id="forst-one-stage">([\s\S]*?)<\/style>/;
if(!cssAnchor.test(html))throw Error('V43 single stylesheet missing');
const css=[
'/* V44: replaced option plaque and compact combat graphics in the existing stage. */',
'#fs-nav #fs-options{position:absolute!important;left:1%!important;top:7.5%!important;min-width:62px!important;max-width:78px!important;width:19%!important;height:40px!important;min-height:40px!important;padding:4px 2px!important;transform:none!important;border:2px ridge #bd985c!important;border-radius:4px!important;background:linear-gradient(165deg,#322b1a,#10130f 68%)!important;box-shadow:0 3px 6px #070707a6,inset 0 0 0 1px #e6c88f55!important;color:#f5e0b9!important;font:12px Georgia,serif!important;text-shadow:0 2px 3px #000!important;z-index:22!important;opacity:1!important;touch-action:manipulation!important}',
'#fs-nav #fs-options::before{display:none!important;content:none!important}',
'#forst-stage.fs-combat.fs-active-fight #fs-beast{position:absolute!important;display:block!important;visibility:visible!important;opacity:1!important;left:13%!important;top:1%!important;width:82%!important;height:40.5%!important;z-index:10!important;overflow:visible!important;pointer-events:none!important}',
'#forst-stage.fs-combat.fs-active-fight #fs-beast>img{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center bottom!important;image-rendering:auto!important;filter:contrast(1.08) saturate(1.09)!important;-webkit-mask-image:radial-gradient(ellipse 85% 88% at 50% 43%,#000 55%,transparent 99%)!important;mask-image:radial-gradient(ellipse 85% 88% at 50% 43%,#000 55%,transparent 99%)!important}',
'#forst-stage.fs-combat:not(.fs-active-fight) #fs-beast{display:none!important}',
'#forst-stage.fs-combat:not(.fs-active-fight) #fs-banner{opacity:1!important}',
'#forst-stage.fs-combat #fs-body{top:35.6%!important;height:53.4%!important}',
'#forst-stage.fs-combat #fs-body #sheetBody{padding:2px 9px 4px!important;line-height:1.12!important;overflow-y:auto!important}',
'#forst-stage.fs-combat #fs-body .hpPair{margin:2px 0!important;gap:6px!important}',
'#forst-stage.fs-combat #fs-body .battleDice{min-height:46px!important;transform:scale(.60)!important;margin:-3px auto -2px!important}',
'#forst-stage.fs-combat #fs-body .battleReport{margin:2px 0!important;padding:3px 5px!important;line-height:1.13!important;font-size:clamp(11px,3.1vw,13px)!important}',
'#forst-stage.fs-combat #fs-body .fs-combat-grid{position:static!important;bottom:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;margin:4px 0 1px!important;padding:0!important;background:none!important;box-shadow:none!important}',
'#forst-stage.fs-combat #fs-body .fs-fight-card{height:58px!important;min-height:58px!important;max-height:58px!important;padding:22px 2px 3px!important;font-size:clamp(10px,2.8vw,12.5px)!important;line-height:1.06!important}',
'#fs-body .trophyCard.fs44-openable{cursor:pointer!important;min-height:105px!important;touch-action:manipulation!important}',
'#fs-body .trophyCard.fs44-openable:focus-visible{outline:3px solid #af8748!important;outline-offset:3px!important}',
'#fs-body .trophyCard.fs44-openable .trophyObject img{width:100%!important;height:102px!important;display:block!important;object-fit:cover!important;border:2px ridge #a9844e!important;border-radius:5px!important}',
'#fs-body .fs-bestiary-image img{width:100%!important;max-height:240px!important;object-fit:cover!important;object-position:center 38%!important}',
'#fs-body .cardShelfSlot .creatureArt img{width:100%!important;height:100%!important;object-fit:cover!important}',
'.fs-card-modal .fs-card-inner.fs44-trophy-card{padding:15px!important;text-align:center!important;color:#2e1b0f!important}',
'.fs-card-modal .fs-card-inner.fs44-trophy-card img{width:100%;max-height:55vh;object-fit:contain;display:block;margin:auto auto 13px;border:3px ridge #b18a50}',
'.fs-card-modal .fs-card-inner.fs44-trophy-card h2{font:700 25px Georgia,serif;margin:7px 0;color:#291d0d}',
'.fs-card-modal .fs-card-inner.fs44-trophy-card p{font:16px/1.4 Georgia,serif;margin:5px 0 12px}',
'@media(max-height:720px){#forst-stage.fs-combat #fs-body{top:34.4%!important;height:55%!important}#forst-stage.fs-combat.fs-active-fight #fs-beast{height:39%!important}#forst-stage.fs-combat #fs-body .fs-fight-card{height:52px!important;min-height:52px!important;max-height:52px!important;padding-top:18px!important}}'
].join('\n');
html=html.replace(cssAnchor,(all,old)=>{
 for(const re of [
 /#fs-nav #fs-options(?::before|::before)?\{[^}]*\}/g,
 /#forst-stage\.fs-combat #fs-beast(?:>img)?\{[^}]*\}/g,
 /#forst-stage\.fs-combat #fs-body(?: #sheetBody| #veil #sheetTitle| \.(?:fs-combat-grid|fs-fight-card|battleDice|battleReport|hpPair))?\{[^}]*\}/g
 ])old=old.replace(re,'');
 return '<style id="forst-one-stage">'+old+'\n'+css+'</style>';
});
const baseScript=/<script>([\s\S]*?)<\/script>/;
if(!baseScript.test(html))throw Error('V43 book engine script missing');
html=html.replace(baseScript,(all,js)=>{
 const key='function openPanel(name,btn){';
 if(!js.includes(key))throw Error('openPanel missing');
 js=js.replace(key,key+'\n if(name==="story" && visiblePanel==="combat" && !state.combat){okAction(btn);visiblePanel=state.current?"story":"options";$("veil").classList.add("open");renderPanel();$("sheetBody").scrollTop=0;return;}\n');
 const zoom='function showImage(which){';
 if(!js.includes(zoom))throw Error('showImage missing');
 js=js.replace(zoom,zoom+'if(window.fs44ZoomScene){window.fs44ZoomScene(which);return;}\n');
 const treasure='function showTreasureImage(name){';
 if(js.includes(treasure))js=js.replace(treasure,treasure+'if(window.fs44OpenTrophy){window.fs44OpenTrophy(name);return;}\n');
 return '<script>'+js+'</script>';
});
const controller=/<script id="forst-one-controller">([\s\S]*?)<\/script>/;
if(!controller.test(html))throw Error('Existing game controller missing');
html=html.replace(controller,(all,js)=>{
 const start=js.indexOf('function fs43EnemySource(name){');
 const end=js.indexOf('function sync(){',start);
 if(start<0||end<0)throw Error('V43 enemy controller anchors missing');
 const arts=[
 'function fs44EnemyArt(name){',
 ' const n=String(name||"").toLocaleLowerCase("de");',
 ' if(/wildschwein|eber|keiler|wildsau/.test(n))return FORST_VISUALS.boar;',
 ' const groups=[',
 ' [/waldschrat|baumgeist|baummensch|treant|waldgeist/,["waldschrat_duo","guardian","grove"]],',
 ' [/ork|orc|goblin|bandit|barbar|räuber|krieger/,["ork_battle","battle","guardian"]],',
 ' [/wolf|werwolf|wölfe|hund|bär|panther|katze/,["beast","wolf","wild_boar"]],',
 ' [/troll|riese|oger|gigant|golem|wächter/,["guardian","cave_blue","beast"]],',
 ' [/spinne|skorpion|käfer|insekt|schlange|wurm|echse/,["cave_blue","slime_pit","beast"]],',
 ' [/ghul|ghoul|skelett|zombie|geist|untot|dämon|gespenst/,["secret_door","slime_pit","guardian"]],',
 ' [/magier|zauberer|hex|druide|nekromant/,["tower_chamber","wizard_shop","guardian"]],',
 ' [/fledermaus|vogel|rabe|harpyie/,["beast","misty_meadow","forest_path"]],',
 ' [/ritter|soldat|zwerg|mensch/,["ork_battle","guardian","heroic_path"]]',
 ' ];',
 ' for(const pair of groups)if(pair[0].test(n))for(const key of pair[1])if(SCENE_ART[key])return SCENE_ART[key];',
 ' const key=typeof cardArtKey==="function"?cardArtKey(name):"beast";',
 ' return SCENE_ART[key]||SCENE_ART.beast||SCENE_ART.guardian||SCENE_ART.waldschrat_duo||SCENE_ART.forest_path||img.src;',
 '}',
 'window.fs44EnemyArt=fs44EnemyArt;',
 'function setArt(){',
 ' const pic=old?.querySelector("img"),scene=old?.dataset.scene||"forest_path";',
 ' const current=pic?.getAttribute("src")||SCENE_ART[scene]||SCENE_ART.forest_path;',
 ' if(img.src!==current)img.src=current;',
 ' const active=visiblePanel==="combat"&&!!state.combat;',
 ' stage.classList.toggle("fs-active-fight",active);',
 ' if(active){',
 '  const name=String(state.combat.name||"Gegner");',
 '  const source=fs44EnemyArt(name);',
 '  if(source&&foeImage.src!==source)foeImage.src=source;',
 '  foeImage.alt=name+" im Angriff";',
 '  const box=document.getElementById("fs-beast");',
 '  box.style.setProperty("display","block","important");',
 '  box.style.setProperty("opacity","1","important");',
 '  box.style.setProperty("visibility","visible","important");',
 ' }',
 ' if(visiblePanel==="camp")queueMicrotask(()=>v40Camp());',
 '}'
 ].join('\n');
 js=js.slice(0,start)+arts+'\n'+js.slice(end);
 const prior='const portrait=isBoar?FORST_VISUALS.boar:cardArt(c);';
 if(!js.includes(prior))throw Error('Expanded bestiary portrait anchor missing');
 js=js.replace(prior,'const portrait=fs44EnemyArt(c.name)||cardArt(c);');
 js=js.replaceAll('fs43FitCombat();','fs44FitCombat();');
 js=js.replaceAll("opt.textContent='Optionen'","opt.textContent='OPTIONEN'");
 const oldFit=js.indexOf('function fs43FitCombat(){');
 const suffix=js.indexOf('renderPanel();\n})();',oldFit);
 if(oldFit<0||suffix<0)throw Error('V43 layout/closing anchors missing');
 const patch=[
 'function fs44FitCombat(){',
 ' if(visiblePanel!=="combat"||!state.combat)return;',
 ' const area=veil.querySelector("#sheetBody");if(!area)return;',
 ' area.style.zoom="";',
 ' requestAnimationFrame(()=>{',
 '  if(visiblePanel!=="combat"||!area.isConnected)return;',
 '  const need=area.scrollHeight,room=area.clientHeight;',
 '  if(room>0&&need>room+2){',
 '   const scale=(room-3)/need;',
 '   if(scale>=.88)area.style.zoom=String(Math.max(.88,Math.min(1,scale)));',
 '  }',
 ' });',
 '}',
 'window.fs44ZoomScene=function(which){',
 ' const src=SCENE_ART[which]||ART[which]||SCENE_ART.forest_path;',
 ' const panel=stage.querySelector("#fs-fullscreen");',
 ' const image=panel?.querySelector("#fs-fullscreen-img");',
 ' if(!panel||!image||!src)return;',
 ' image.src=src;image.alt="Vergrößerte Illustration";panel.classList.add("open");',
 '};',
 'window.fs44OpenTrophy=function(name){',
 ' const target=stage.querySelector(".fs-card-modal");',
 ' const inner=target?.querySelector(".fs-card-inner");',
 ' if(!target||!inner)return;',
 ' const foe=Object.values(trophyStore.foes||{}).find(f=>f.name===name);',
 ' const item=(trophyStore.artifacts||{})[name.toLocaleLowerCase("de")];',
 ' const src=foe?fs44EnemyArt(name):(productArt(name)||SCENE_ART.trophy_chamber||SCENE_ART.forest_path);',
 ' const title=document.createElement("h2");title.textContent=name;',
 ' const pic=document.createElement("img");pic.src=src;pic.alt=name;',
 ' const note=document.createElement("p");note.textContent=foe?"Besiegte Kreatur · Abschnitt "+(foe.section||"?"):item?"Gefunden in Abschnitt "+(item.section||"?"):"Erinnerung an dein Abenteuer";',
 ' inner.classList.add("fs44-trophy-card");inner.replaceChildren(title,pic,note);',
 ' target.hidden=false;',
 ' target.querySelector(".fs-card-close")?.focus();',
 '};',
 'function fs44PolishTrophies(){',
 ' if(visiblePanel!=="trophies")return;',
 ' veil.querySelectorAll(".trophyCard:not(.hiddenTrophy)").forEach(card=>{',
 '  const label=card.querySelector("b")?.textContent?.trim();',
 '  if(!label)return;',
 '  const foe=Object.values(trophyStore.foes||{}).find(f=>f.name===label);',
 '  const src=foe?fs44EnemyArt(label):(productArt(label)||SCENE_ART.trophy_chamber||SCENE_ART.forest_path);',
 '  const area=card.querySelector(".trophyObject");',
 '  if(area&&src){const image=document.createElement("img");image.src=src;image.alt=label;area.replaceChildren(image);}',
 '  card.classList.add("fs44-openable");card.tabIndex=0;card.setAttribute("role","button");',
 '  card.setAttribute("aria-label",label+" als Karte ansehen");',
 '  card.onclick=()=>window.fs44OpenTrophy(label);',
 '  card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();window.fs44OpenTrophy(label);}};',
 ' });',
 '}',
 'const fs44OldRender=renderPanel;',
 'renderPanel=function(){',
 ' const result=fs44OldRender.apply(this,arguments);',
 ' fs44PolishTrophies();',
 ' return result;',
 '};'
 ].join('\n');
 js=js.slice(0,oldFit)+patch+'\n'+js.slice(suffix);
 return '<script id="forst-one-controller">'+js+'</script>';
});
html=html.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V44</title>');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'v44-game-'+i+'.js'}));
if(scripts.length!==6||!html.includes('fs44PolishTrophies')||!html.includes('fs-active-fight'))throw Error('V44 validation failed');
if((html.match(/id="forst-one-stage"/g)||[]).length!==1||(html.match(/id="forst-one-controller"/g)||[]).length!==1)throw Error('Multiple active stages');
for(const out of ['../forst-v44/index.html','../forst-final/index.html']){
 const target=path.resolve(dir,out);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html,'utf8');
}
console.log('V44 build checked',Buffer.byteLength(html),'bytes',scripts.length,'scripts');
