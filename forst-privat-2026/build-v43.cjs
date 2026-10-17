'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const dir=__dirname;
let h=fs.readFileSync(path.resolve(dir,'../forst-v41/index.html'),'utf8');
let a=h.indexOf('<style id="forst-one-stage">'),b=h.indexOf('</style>',a);
if(a<0||b<0)throw Error('Stage CSS fehlt');
let c=h.slice(a+28,b);
c=c.replace(/#fs-nav #fs-options(?::before)?\{[^}]*\}/g,'');
c=c.replace(/#fs-body \.fs-(?:camp-scene|fire|flame|logs|fire-audio)[^{]*\{[^}]*\}/g,'');
c=c.replace(/#forst-stage\.fs-combat #fs-body\s*(?:#sheetBody|\.fs-combat-grid|\.fs-fight-card|\.battleDice|\.battleReport|\.hpPair)?\{[^}]*\}/g,'');
const css=[
'#fs-nav #fs-options{left:1%!important;top:14.4%!important;width:13%!important;min-width:49px!important;max-width:79px!important;height:12%!important;min-height:65px!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;padding:25px 0 0!important;color:#f0c887!important;font:700 clamp(9px,2.5vw,13px) Georgia,serif!important;text-shadow:-1px -1px #201409,1px 1px 2px #0c0905!important;transform:skewY(-7deg)!important}',
'#fs-nav #fs-options:before{content:none!important;display:none!important}',
'#fs-body .fs-camp-scene{display:block!important;height:auto!important;aspect-ratio:820/455!important;overflow:hidden!important;margin:8px 0!important;border:3px ridge #ad874a!important;background:#152219!important}',
'#fs-body .fs-camp-scene img{width:100%!important;height:100%!important;display:block!important;object-fit:cover!important}',
'#fs-body .fs-fire-audio{min-height:48px!important;background:#274836!important;border:2px ridge #b79051!important;color:#f6e8c3!important}',
'#forst-stage.fs-combat #fs-beast{top:5%!important;height:33%!important;z-index:9!important;display:block!important}',
'#forst-stage.fs-combat #fs-beast>img{object-fit:cover!important;object-position:center 36%!important;-webkit-mask-image:linear-gradient(#000 0%,#000 87%,transparent 100%)!important;mask-image:linear-gradient(#000 0%,#000 87%,transparent 100%)!important}',
'#forst-stage.fs-combat #fs-body{top:36%!important;height:53.3%!important}',
'#forst-stage.fs-combat #fs-body #sheetBody{padding:3px 9px 6px!important}',
'#forst-stage.fs-combat #fs-body .fs-combat-grid{position:static!important;bottom:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin:5px 0!important;padding:0!important;background:none!important}',
'#forst-stage.fs-combat #fs-body .fs-fight-card{min-height:64px!important;height:64px!important;max-height:64px!important;padding:28px 2px 5px!important;font-size:clamp(10px,3vw,13px)!important}',
'#forst-stage.fs-combat #fs-body .battleDice{transform:scale(.7)!important;transform-origin:center!important;min-height:59px!important;margin:0 auto!important}',
'#forst-stage.fs-combat #fs-body .battleReport{margin:3px 0!important;padding:4px!important;font-size:12px!important;line-height:1.13!important}',
'#forst-stage.fs-combat #fs-body .hpPair{margin:3px 0!important}',
'#fs-body .fs-material-audio{display:block;width:100%;margin:9px 0;min-height:46px;border:2px ridge #bd9151;background:#21432f;color:#fff0cd;border-radius:7px;font:700 14px Georgia,serif}',
'#fs-body .fs-w12-result{display:grid;place-items:center;width:85px;height:95px;margin:8px auto;color:#ffebba;background:linear-gradient(145deg,#d7ae73,#63412d);clip-path:polygon(50% 0%,85% 15%,100% 65%,66% 100%,34% 100%,0 65%,15% 15%);font:700 31px Georgia,serif}',
'@media(max-height:730px){#forst-stage.fs-combat #fs-body .fs-fight-card{height:54px!important;min-height:54px!important;max-height:54px!important;padding-top:18px!important}#forst-stage.fs-combat #fs-body .battleDice{transform:scale(.61)!important;min-height:49px!important}}'
].join('\n');
h=h.slice(0,a+28)+c+'\n'+css+h.slice(b);
const open='<script id="forst-one-controller">';
a=h.indexOf(open);b=h.indexOf('</script>',a);
if(a<0||b<0)throw Error('Controller fehlt');
let js=h.slice(a+open.length,b);console.log('V42 diagnostic', {html:h.length,scriptStart:a,scriptEnd:b,scriptLength:js.length,hasV40:js.includes('function v40Camp(){'),old:h.indexOf('function v40Camp(){'),setArt:h.indexOf('function setArt(){')});
function swap(from,to,source){const x=js.indexOf(from),y=js.indexOf(to,x);if(x<0||y<0){if(from==='function v40Camp(){'){js+='\n'+source+'\n';return;}throw Error('Bereich fehlt: '+from);}js=js.slice(0,x)+source+'\n'+js.slice(y);}
swap('function v40Camp(){','function v40Card(){',[
'function v40Camp(){',
' const area=veil.querySelector("#sheetBody");if(!area)return;',
' area.querySelectorAll(".artScene.large,.fs-camp-scene,.fs-fire-audio").forEach(el=>el.remove());',
' const scene=document.createElement("figure");scene.className="fs-camp-scene";',
' const picture=document.createElement("img");picture.src=ART.camp||SCENE_ART.camp_scene;picture.alt="Einsamer Wanderer an einem echten Lagerfeuer";',
' scene.appendChild(picture);area.prepend(scene);',
' const button=document.createElement("button");button.type="button";button.className="fs-fire-audio";',
' const label=()=>{button.textContent=window.__fs42CampOn?"🔊 Feuerknistern ausschalten":"♫ Feuerknistern einschalten";button.setAttribute("aria-pressed",String(!!window.__fs42CampOn))};',
' button.onclick=()=>{fs42CampAudio(!window.__fs42CampOn);label()};label();scene.after(button);',
'}'
].join('\n'));
swap('function setArt(){','function sync(){',[
'function setArt(){',
' const pic=old?.querySelector("img");',
' const scene=old?.dataset.scene||"forest_path";',
' const current=pic?.getAttribute("src")||SCENE_ART[scene]||SCENE_ART.forest_path;',
' if(visiblePanel==="combat"){',
'  const name=String(state.combat?.name||"Gegner");',
'  const key=typeof monsterImage==="function"?monsterImage(name):"beast";',
'  const art=/wildschwein|eber|keiler/i.test(name)?FORST_VISUALS.boar:(SCENE_ART[key]||SCENE_ART.ork_battle||current);',
'  if(img.src!==art)img.src=art;foeImage.src=art;foeImage.alt=name+" im Angriff";',
' }else if(img.src!==current)img.src=current;if(visiblePanel==="camp")queueMicrotask(()=>v40Camp());',
'}'
].join('\n'));
const sound=[
'function fs42CampAudio(on){',
' window.__fs42CampOn=!!on;',
' if(!on){if(window.__fs42CampNode){try{window.__fs42CampNode.source.stop();window.__fs42CampNode.ctx.close()}catch(e){}window.__fs42CampNode=null;}return}',
' try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const ctx=new A();if(ctx.state==="suspended")ctx.resume();',
' const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),a=buffer.getChannelData(0);let v=0;',
' for(let i=0;i<a.length;i++){v=v*.8+(Math.random()*2-1)*.2;a[i]=v*.22+(Math.random()<.001?(Math.random()-.5)*.6:0)}',
' const source=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();source.buffer=buffer;source.loop=true;f.type="lowpass";f.frequency.value=1600;g.gain.value=.35;source.connect(f);f.connect(g);g.connect(ctx.destination);source.start();window.__fs42CampNode={source,ctx}',
' }catch(e){window.__fs42CampOn=false}',
'}',
'const fs42Key="forst-v42-wuerfelton";',
'let fs42SoundOn=localStorage.getItem(fs42Key)!=="off",fs42Audio=null;',
'function fs42DiceSound(mode){',
' if(!fs42SoundOn)return;',
' try{',
' const A=window.AudioContext||window.webkitAudioContext;if(!A)return;',
' const ctx=fs42Audio||(fs42Audio=new A());if(ctx.state==="suspended")ctx.resume();',
' const type=diceProfile.equipped||"classic";',
' const mat=type==="glass"||type==="emerald"?"glass":type==="wood"?"wood":type==="stone"?"stone":type==="metal"?"metal":type==="veteran"?"magic":"bone";',
' const freq={glass:1050,wood:180,bone:510,stone:115,metal:720,magic:930}[mat];',
' const length={glass:.6,wood:.11,bone:.08,stone:.19,metal:.52,magic:.7}[mat];',
' const volume=mode==="shake"?.016:.06;',
' const multipliers=(mat==="glass"||mat==="metal")?[1,1.51,2.13]:[1,1.38];',
' multipliers.forEach((k,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();const t=ctx.currentTime+.003;',
' o.type=mat==="stone"||mat==="wood"?"triangle":"sine";o.frequency.setValueAtTime(freq*k,t);o.frequency.exponentialRampToValueAtTime(freq*k*.86,t+length);',
' f.type=mat==="wood"||mat==="stone"?"lowpass":"highpass";f.frequency.value=mat==="stone"?500:mat==="wood"?800:500;',
' g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume/(i+1),t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+length);',
' o.connect(f);f.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+length+.03);});',
' }catch(e){console.warn("Würfelton",e)}',
'}',
'function fs42ToggleSound(){fs42SoundOn=!fs42SoundOn;localStorage.setItem(fs42Key,fs42SoundOn?"on":"off");renderPanel();}',
'function fs42RollW12(){if(!diceProfile.unlocked.includes("veteran"))return toast("W12 wird erst nach dem Sieg freigeschaltet.");const n=1+Math.floor(Math.random()*12);fs42DiceSound("shake");setTimeout(()=>fs42DiceSound("land"),200);const t=document.getElementById("fs42-w12-value");if(t)t.textContent=String(n);state.lastDice="W12: "+n;save();}',
'window.fs42DiceSound=fs42DiceSound;window.fs42ToggleSound=fs42ToggleSound;window.fs42RollW12=fs42RollW12;'
].join('\n');
if(!js.includes('renderPanel();\n})();'))throw Error('Controller Ende fehlt');
js=js.replace('renderPanel();\n})();',sound+'\nrenderPanel();\n})();');
h=h.slice(0,a+open.length)+js+h.slice(b);
const diceStyle=/emerald:\{name:'Smaragdwürfel'[^}]*\}/;
if(!diceStyle.test(h))throw Error('Wuerfeldefinition fehlt');
h=h.replace(diceStyle,m=>m+",glass:{name:'Glaswürfel',label:'Glaskristall',icon:'◈',hint:'5 Abschnitte besuchen'},stone:{name:'Steinwürfel',label:'Granit',icon:'⬟',hint:'18 Abschnitte besuchen'},veteran:{name:'W12 – Veteranenwürfel',label:'12 Seiten',icon:'✧',hint:'Abenteuer erfolgreich beenden'}");
const reward="['emerald',count>=25]";
if(!h.includes(reward))throw Error('Wuerfel-Meilenstein fehlt');
h=h.replace(reward,reward+",['glass',count>=5],['stone',count>=18],['veteran',localStorage.getItem('forst-v42-w12')==='1']");
h=h.replace('function animateDice(n,after){','function animateDice(n,after){if(window.fs42DiceSound){window.fs42DiceSound("shake");setTimeout(()=>window.fs42DiceSound("land"),300);setTimeout(()=>window.fs42DiceSound("land"),950);}');
h=h.replace("trophyStore.victory=true;saveTrophies();","trophyStore.victory=true;localStorage.setItem('forst-v42-w12','1');syncDiceAchievements(true);saveTrophies();");
h=h.replace("let attack=sum(p)+state.stats.g,defense=","let attack=sum(p)+state.stats.g+(diceProfile.equipped==='veteran'?1:0),defense=");
h=h.replace('<h3 class="bronzeTitle">✦ Deine Würfelsammlung</h3>','<h3 class="bronzeTitle">✦ Deine Würfelsammlung</h3><button class="fs-material-audio" onclick="fs42ToggleSound()">🔊 Würfelklang an/aus · Glas, Holz, Knochen, Stein und Metall</button><button class="fs-material-audio" onclick="fs42RollW12()">✧ W12-Ehrenwürfel · erst nach dem Sieg</button><div id="fs42-w12-value" class="fs-w12-result">12</div>');
h=h.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V42</title>');

// V43: consolidate the actual single stage, not a visual layer over a second stage.
const css43=[
'#fs-nav #fs-options{left:2%!important;top:15.4%!important;width:11.8%!important;min-width:43px!important;max-width:61px!important;height:8%!important;min-height:49px!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;padding:0!important;color:#c7a776!important;font:700 clamp(9px,2.4vw,12px)/1.05 Georgia,serif!important;text-shadow:-1px -1px 1px #271a10,1px 1px #e9d2a6,0 2px 3px #090905!important;transform:perspective(120px) rotateY(-7deg) rotate(-4deg)!important;touch-action:manipulation!important;z-index:31!important}',
'#fs-nav #fs-options::before{content:none!important;display:none!important}',
'#fs-body .v23-quick-icons button{min-height:54px!important;color:#ffe7bf!important;background:linear-gradient(145deg,#355740,#13251d)!important;border:2px ridge #ad8b54!important;box-shadow:inset 0 0 0 1px #dec38e88,0 3px 6px #16110b66!important}',
'#forst-stage.fs-combat #fs-beast{top:3.8%!important;left:11.5%!important;width:85%!important;height:35%!important;z-index:9!important;overflow:visible!important;filter:drop-shadow(0 3px 6px #20140d66)!important}',
'#forst-stage.fs-combat #fs-beast>img{object-fit:cover!important;object-position:center 35%!important;image-rendering:auto!important;filter:contrast(1.05) saturate(1.08)!important;-webkit-mask-image:radial-gradient(ellipse 78% 72% at 50% 45%,black 49%,transparent 98%)!important;mask-image:radial-gradient(ellipse 78% 72% at 50% 45%,black 49%,transparent 98%)!important}',
'#forst-stage.fs-combat #fs-body{top:36.2%!important;height:52.5%!important}',
'#forst-stage.fs-combat #fs-body #sheetBody{padding:2px 9px 4px!important;line-height:1.17!important;scrollbar-width:none!important}',
'#forst-stage.fs-combat #fs-body #sheetBody::-webkit-scrollbar{display:none}',
'#forst-stage.fs-combat #fs-body #veil #sheetTitle{font-size:clamp(18px,4.8vw,23px)!important;line-height:1.05!important;padding:1px 0 3px!important;margin:0!important;min-height:29px!important}',
'#forst-stage.fs-combat #fs-body .hpPair{margin:2px 0 3px!important;gap:7px!important}',
'#forst-stage.fs-combat #fs-body .hpBox{padding:3px 4px!important;min-height:43px!important}',
'#forst-stage.fs-combat #fs-body .battleDiceLabel{margin:2px 0 0!important;font-size:13px!important}',
'#forst-stage.fs-combat #fs-body .battleDice{transform:scale(.62)!important;transform-origin:center!important;min-height:51px!important;margin:-2px auto -1px!important}',
'#forst-stage.fs-combat #fs-body .battleReport{margin:2px 0!important;padding:4px 5px!important;font-size:clamp(11px,3.2vw,13px)!important;line-height:1.16!important}',
'#forst-stage.fs-combat #fs-body .fs-combat-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;position:static!important;bottom:auto!important;z-index:auto!important;margin:5px 0 1px!important;padding:0!important;background:none!important;box-shadow:none!important}',
'#forst-stage.fs-combat #fs-body .fs-fight-card{box-sizing:border-box!important;min-height:60px!important;height:60px!important;max-height:60px!important;padding:24px 2px 4px!important;font-size:clamp(10px,3vw,12px)!important;line-height:1.02!important;margin:0!important}',
'@media(max-height:730px){#forst-stage.fs-combat #fs-body{top:35.8%!important;height:53.9%!important}#forst-stage.fs-combat #fs-body .fs-fight-card{min-height:53px!important;height:53px!important;max-height:53px!important;padding-top:19px!important}#forst-stage.fs-combat #fs-body .battleDice{min-height:45px!important;transform:scale(.57)!important}}'
].join('\n');
h=h.replace(/<style id="forst-one-stage">([\s\S]*?)<\/style>/,(all,style)=>{
 for(const re of [/#fs-nav #fs-options(?::before|::before)?\{[^}]*\}/g,/#forst-stage\.fs-combat #fs-body(?: #sheetBody| #veil #sheetTitle| \.(?:combatScene|hpPair|hpBox|battleDiceLabel|battleDice|battleReport|fs-combat-grid|fs-fight-card))?\{[^}]*\}/g,/#forst-stage\.fs-combat #fs-beast(?:>img)?\{[^}]*\}/g])style=style.replace(re,'');
 return '<style id="forst-one-stage">'+style+'\n'+css43+'</style>';
});
h=h.replace(/<script id="forst-one-controller">([\s\S]*?)<\/script>/,(all,js)=>{
 const start=js.indexOf('function setArt(){'),end=js.indexOf('function sync(){',start);
 if(start<0||end<0)throw Error('V43 art replacement anchor missing');
 const art=[
 'function fs43EnemySource(name){',
 ' const n=String(name||"").toLocaleLowerCase("de");',
 ' if(/wildschwein|eber|keiler|wildsau/.test(n))return FORST_VISUALS.boar;',
 ' const groups=[',
 ' [/waldschrat|baumgeist|baummensch|treant|waldgeist/,["waldschrat_duo","guardian","beast"]],',
 ' [/ork|orc|goblin|bandit|barbar|krieger|räuber/,["ork_battle","battle","beast"]],',
 ' [/wolf|werwolf|wölfe|hund|bär|panther|katze|bestie/,["beast","ork_battle"]],',
 ' [/troll|riese|oger|gigant|golem|wächter/,["guardian","beast"]],',
 ' [/spinne|skorpion|käfer|insek|schlange|wurm|echse/,["slime_pit","cave_blue","guardian"]],',
 ' [/ghul|ghoul|skelett|zombie|geist|untot|dämon|gespenst/,["slime_pit","guardian","finale"]],',
 ' [/magier|zauberer|hex|druide|nekromant/,["tower_chamber","wizard_shop","guardian"]],',
 ' [/fledermaus|vogel|rabe|harpyie/,["beast","meadow"]],',
 ' [/ritter|soldat|zwerg|mensch/,["ork_battle","beast"]]',
 ' ];',
 ' for(const [re,keys] of groups)if(re.test(n))for(const key of keys)if(SCENE_ART[key])return SCENE_ART[key];',
 ' const k=typeof monsterImage==="function"?monsterImage(name):"beast";',
 ' return SCENE_ART[k]||SCENE_ART.beast||SCENE_ART.guardian||SCENE_ART.forest_path;',
 '}',
 'function setArt(){',
 ' const pic=old?.querySelector("img"),scene=old?.dataset.scene||"forest_path";',
 ' const current=pic?.getAttribute("src")||SCENE_ART[scene]||SCENE_ART.forest_path;',
 ' if(img.src!==current)img.src=current;',
 ' if(visiblePanel==="combat"){',
 '  const name=String(state.combat?.name||"Gegner"),source=fs43EnemySource(name);',
 '  if(foeImage.src!==source)foeImage.src=source;',
 '  foeImage.alt=name+" im Angriff";',
 '  foeImage.style.objectPosition=/wildschwein|eber|keiler/i.test(name)?"center 28%":"center 38%";',
 ' }',
 ' if(visiblePanel==="camp")queueMicrotask(()=>v40Camp());',
 '}'
 ].join('\n');
 js=js.slice(0,start)+art+'\n'+js.slice(end);
 js=js.replaceAll("b.style.minHeight='96px'","b.style.removeProperty('min-height')");
 js=js.replaceAll("opt.textContent='OPTIONEN'","opt.textContent='Optionen'");
 const anchor='paintCombat();\n setArt();';
 if(!js.includes(anchor))throw Error('V43 combat anchor missing');
 js=js.replace(anchor,anchor+'\n fs43FitCombat();');
 const fit=[
 'function fs43FitCombat(){',
 ' if(visiblePanel!=="combat")return;',
 ' const area=veil.querySelector("#sheetBody");if(!area)return;',
 ' area.style.zoom="";',
 ' requestAnimationFrame(()=>{',
 '  if(visiblePanel!=="combat"||!area.isConnected)return;',
 '  area.style.zoom="";',
 '  const need=area.scrollHeight,room=area.clientHeight;',
 '  if(room>0&&need>room+3){const ratio=(room-4)/need;if(ratio>=.88)area.style.zoom=String(Math.max(.88,Math.min(1,ratio)));}',
 ' });',
 '}'
 ].join('\n');
 if(!js.includes('renderPanel();\n})();'))throw Error('V43 controller ending missing');
 js=js.replace('renderPanel();\n})();',fit+'\nrenderPanel();\n})();');
 return '<script id="forst-one-controller">'+js+'</script>';
});
h=h.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V43</title>');

const scripts=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'v42-'+i+'.js'}));
if(scripts.length!==6)throw Error('Script-Anzahl falsch');
for(const name of ['../forst-v43/index.html','../forst-final/index.html']){const out=path.resolve(dir,name);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,h,'utf8');}
console.log('V43 verifiziert:',Buffer.byteLength(h),'Bytes',scripts.length,'Skripte');
