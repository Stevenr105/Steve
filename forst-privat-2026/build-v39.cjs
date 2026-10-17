'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
let html=fs.readFileSync(path.resolve(root,'../forst-v38/index.html'),'utf8');
if(!html.includes('let BOOK = ')||!html.includes('id="forst-one-stage"')||!html.includes('id="forst-one-controller"')||!html.includes('id="forst-v38-top-tools"'))throw Error('Verified V38 gameplay or MP3/3D controls missing');
const css="\n/* V39: clearer labels and unified fantasy controls in the existing single skin */\n#fs-body .trophyPills{gap:6px!important;row-gap:7px!important;flex-wrap:wrap!important}\n#fs-body .trophyPills button{min-height:41px!important;border:1px solid #b3894e!important;border-radius:6px!important;background:linear-gradient(160deg,#1b3b2b,#0a1c16)!important;color:#f9eacb!important;font:700 clamp(12px,3.2vw,15px)/1.22 Georgia,serif!important;box-shadow:inset 0 0 0 1px #77552c,0 2px 3px #3c210c66!important;text-shadow:0 1px 2px #000!important;padding:8px!important;white-space:normal!important}\n#fs-body .trophyPills button:focus-visible,#fs-body .diceReward:focus-visible,#fs-body button.minibtn:focus-visible{outline:3px solid #b07828!important;outline-offset:2px!important}\n#fs-body .diceCollection{gap:8px!important}\n#fs-body .diceReward{min-height:73px!important;border:2px ridge #aa874a!important;border-radius:7px!important;color:#f8e9bf!important;box-shadow:0 2px 5px #2b170b66!important}\n#fs-body .diceReward:disabled{opacity:.75!important;cursor:not-allowed!important}\n#fs-body .diceReward strong{color:#fff0c6!important;font-size:clamp(13px,3.6vw,16px)!important}\n#fs-body .diceReward small{line-height:1.3!important}\n#fs-body button.engraved,#fs-body button.minibtn{touch-action:manipulation!important}\n#fs-body button.engraved{min-height:42px!important;line-height:1.25!important}\n#fs-body button.minibtn{min-width:32px!important;min-height:38px!important;font:700 18px Georgia,serif!important;color:#2c190d!important}\n#fs-body .fs-bestiary-grid strong{line-height:1.2!important}\n@media(max-width:350px){#fs-body .trophyPills button{font-size:12px!important;min-height:40px!important;padding:6px!important}#fs-body .diceReward{min-height:71px!important}}\n";
const p=/<style id="forst-one-stage">([\s\S]*?)<\/style>/;
if((html.match(/id="forst-one-stage"/g)||[]).length!==1)throw Error('Duplicate or missing stage CSS');
html=html.replace(p,(full,old)=>'<style id="forst-one-stage">'+old+css+'</style>');
const patch="\n const fsPanelTitles={diceSelect:'Die Würfelkammer',options:'Optionen',stats:'Deine Werte',trophies:'Halle der Erinnerungen'};\n if(Object.prototype.hasOwnProperty.call(fsPanelTitles,visiblePanel)){\n  const caption=document.getElementById('sheetTitle');if(caption)caption.textContent=fsPanelTitles[visiblePanel];\n }\n if(visiblePanel==='stats'){\n  veil.querySelectorAll('button.minibtn[onclick^=\"changeStat(\"]').forEach(btn=>{\n   const match=(btn.getAttribute('onclick')||'').match(/changeStat\\('([gsl])',\\s*(-?1)\\)/);\n   if(!match)return;\n   const name={g:'Gewandtheit',s:'Stärke',l:'Glück'}[match[1]];\n   const verb=match[2]==='1'?'erhöhen':'verringern';\n   btn.setAttribute('aria-label',name+' '+verb);btn.setAttribute('title',name+' '+verb);\n  });\n }\n";
const marker="stage.classList.add('fs-'+visiblePanel);";
const q=/<script id="forst-one-controller">([\s\S]*?)<\/script>/;
if((html.match(/id="forst-one-controller"/g)||[]).length!==1)throw Error('Duplicate or missing controller');
html=html.replace(q,(full,code)=>{
 if(code.split(marker).length!==2||code.includes('fsPanelTitles='))throw Error('Incorrect panel renderer anchor');
 return '<script id="forst-one-controller">'+code.replace(marker,marker+patch)+'</script>';
});
html=html.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V39</title>');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(scripts.length!==6)throw Error('Expected six script blocks, found '+scripts.length);
scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'forst-v39-'+i+'.js'}));
for(const k of ['trophyMarkup','viewCreatureCard','creatureCardHTML','diceCollectionMarkup','rollCreationStat','changeStat','showMusic','DeviceOrientationEvent.requestPermission','forst-one-stage','fsPanelTitles='])if(!html.includes(k))throw Error('Expected gameplay feature missing: '+k);
for(const target of ['../forst-v39/index.html','../forst-final/index.html']){
const out=path.resolve(root,target);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html,'utf8');
}
console.log('V39 verified:',Buffer.byteLength(html),'bytes;',scripts.length,'valid scripts; trophies, cards, stats, dice, options, MP3, 3D retained');
