'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,book=JSON.parse(fs.readFileSync(path.join(root,'forst-book-v28-plain.json'),'utf8'));
if(Object.keys(book).length!==400 || !book['117'].t.includes('bei 176.') || !book['238']) throw Error('Invalid text package');
let html=fs.readFileSync(path.resolve(root,'../forst-final/index.html'),'utf8');
const marker='let BOOK = ',from=html.indexOf(marker);if(from<0)throw Error('Plain BOOK missing');
const first=from+marker.length;let last=-1,depth=0,inStr=false,esc=false;
for(let j=first;j<html.length;j++){const ch=html[j];if(inStr){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch==='"')inStr=false;continue;}if(ch==='"'){inStr=true;continue;}if(ch==='{')depth++;if(ch==='}'){depth--;if(!depth){last=j+1;break;}}}
if(last<0 || Object.keys(JSON.parse(html.slice(first,last))).length!==400)throw Error('Cannot replace book');
html=html.slice(0,first)+JSON.stringify(book)+html.slice(last);
const css=[
'#app{isolation:isolate}',
'#app>#v23-bag-ornament{position:absolute!important;z-index:101!important;right:.2%!important;bottom:5.8%!important;width:23.8%!important;height:17.8%!important;transform:none!important;pointer-events:none!important;filter:sepia(.13) saturate(.85) drop-shadow(-4px 5px 8px #080a07ce)!important}',
'#app>.backpackHotspot{z-index:103!important;right:.2%!important;bottom:5.8%!important;width:23.8%!important;height:17.8%!important}',
'#app>.backpackHotspot::after{right:7%!important;bottom:7%!important}',
'#forst-foe-lunge{position:absolute;left:13.8%;top:13.7%;width:77.5%;height:28.6%;z-index:72;pointer-events:none;display:none;overflow:visible;filter:drop-shadow(0 13px 14px #20150ba8)}',
'#app.forst-battle-active #forst-foe-lunge{display:block}',
'#forst-foe-lunge img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 43%;transform:translateY(4%) scale(1.075);-webkit-mask-image:radial-gradient(ellipse 64% 71% at 50% 50%,black 40%,rgba(0,0,0,.97) 54%,transparent 99%);mask-image:radial-gradient(ellipse 64% 71% at 50% 50%,black 40%,rgba(0,0,0,.97) 54%,transparent 99%);animation:forstFoeBreath 3.4s ease-in-out infinite alternate}',
'@keyframes forstFoeBreath{from{transform:translateY(2%) scale(1.055)}to{transform:translateY(7%) scale(1.10)}',
'#app.forst-battle-active #dynamicScene{opacity:.91!important}',
'#veil.v23Battle .sheetBody{padding-top:clamp(126px,18dvh,160px)!important}',
'@media(prefers-reduced-motion:reduce){#forst-foe-lunge img{animation:none!important}}'
].join('');
const code=[
"(()=>{'use strict';",
"cleanStory=function(t){return String(t||'').trim()};",
"const app=document.getElementById('app'),scene=document.getElementById('dynamicScene');if(!app||!scene)return;",
"const fg=document.createElement('div');fg.id='forst-foe-lunge';fg.setAttribute('aria-hidden','true');const img=document.createElement('img');img.alt='';fg.appendChild(img);app.appendChild(fg);",
"function sync(){const fight=visiblePanel==='combat'&&!!state.combat;app.classList.toggle('forst-battle-active',fight);if(!fight)return;const pic=scene.querySelector('img.changingScene')||scene.querySelector('img');if(pic&&img.src!==pic.src)img.src=pic.src;}",
"const origRender=renderPanel;renderPanel=function(){const r=origRender.apply(this,arguments);sync();return r};",
"const origScene=showMainScene;showMainScene=function(){const r=origScene.apply(this,arguments);sync();return r};sync();",
"})();"
].join('\n');
if(html.includes('forst-v28-foreground'))throw Error('Patch duplicated');
html=html.replace('</body>','<style id="forst-v28-foreground">'+css+'</style><script id="forst-v28-script">'+code+'</script></body>');
html=html.replace('<title>Der Forst der Finsternis — Gesamtfassung V26</title>','<title>Der Forst der Finsternis — V28 spielbereit</title>');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i][1],{filename:'forst-script-'+i+'.js'});
const out=path.resolve(root,'../forst-v28/index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html,'utf8');
console.log('V28 built:',out,Buffer.byteLength(html),'bytes',scripts.length,'valid scripts');
