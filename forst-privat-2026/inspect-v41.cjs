'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=fs.readFileSync(path.resolve(__dirname,'../forst-v41/index.html'),'utf8');
const blocks=[...base.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)];
const styles=[...base.matchAll(/<style\\b[^>]*>([\\s\\S]*?)<\\/style>/gi)];
let lines=['Source length: '+base.length,'Scripts '+blocks.map((x,i)=>i+': '+x[1].length+' '+x[0].slice(0,60)).join(' | '),'Styles '+styles.map((x,i)=>i+': '+x[1].length+' '+x[0].slice(0,60)).join(' | ')];
let js=blocks.find(x=>x[0].includes('id="forst-one-controller"'))?.[1]||'';
let css=styles.find(x=>x[0].includes('id="forst-one-stage"'))?.[1]||'';
lines.push('Controller length: '+js.length,'StageCSS length: '+css.length);
function sample(name,src,re,before=280,after=1100,limit=4){
const matches=[...src.matchAll(re)].slice(0,limit);
lines.push('----- '+name+' matches '+matches.length+' -----');
for(let m of matches){lines.push('POS '+m.index+' '+src.slice(Math.max(0,m.index-before),Math.min(src.length,m.index+after)));}
}
sample('renderPanel',js,/function renderPanel\\s*\\(/g,120,3200,1);
sample('openPanel',js,/function openPanel\\s*\\(/g,200,1500,1);
sample('paintCombat',js,/function paintCombat\\s*\\(/g,120,6500,1);
sample('setArt',js,/function setArt\\s*\\(/g,120,2500,1);
sample('camp',js,/'camp'|===.?camp.?|fs-camp-scene/g,190,480,6);
sample('options',js,/optionsMarkup|case 'options'|===.?options.?|sound|audio|mute/g,190,650,10);
sample('dice',js,/diceCollectionMarkup|diceSelect|function roll|diceReward|diceStyle|diceMaterial/g,280,1300,12);
sample('enemy image',js,/enemyArt|creatureArt|beastArt|fs-beast-img|ENEM|enemyName|encounter/g,220,600,15);
sample('inventory',js,/function .*Inventory|v23-quick-icons|v23-pocket|v23-item/g,160,1000,8);
sample('handlers',js,/function v40Polish|function v40FireAudio|renderPanel\\(\\);\\s*\\}\\)\\(\\);/g,250,1700,4);
sample('CSS combat',css,/#forst-stage\\.fs-combat #fs-body|#fs-nav #fs-options|fs-combat-grid/g,140,380,15);
lines.push('function names: '+[...js.matchAll(/(?:function|const|let)\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*(?:\\(|=)/g)].map(m=>m[1]).join(', '));
lines.push('IDs: '+[...new Set([...js.matchAll(/getElementById\\(['"]([^'"]+)/g)].map(x=>x[1]))].join(','));
const dest=path.resolve(__dirname,'v41-inspection.txt');fs.writeFileSync(dest,lines.join('\\n'),'utf8');
console.log('V41 audit '+base.length+'; controller '+js.length+'; wrote '+fs.statSync(dest).size+' bytes');
