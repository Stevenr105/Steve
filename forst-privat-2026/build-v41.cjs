'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const source=path.resolve(__dirname,'../forst-v40/index.html');
let html=fs.readFileSync(source,'utf8');
if(!html.includes('id="forst-one-stage"')||!html.includes('id="forst-one-controller"'))throw Error('Missing unified V40 stage');
const combatCSS=`
/* V41: replacement combat layout; action cards remain below, never float over dice. */
#forst-stage.fs-combat #fs-body{top:35%!important;height:54%!important}
#forst-stage.fs-combat #fs-body #sheetBody{padding:5px clamp(10px,4vw,18px) 7px!important;scroll-padding:8px!important}
#forst-stage.fs-combat #fs-body .fs-combat-grid{position:static!important;bottom:auto!important;z-index:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;margin:17px 0 0!important;padding:0!important;background:none!important;box-shadow:none!important;align-items:stretch!important}
#forst-stage.fs-combat #fs-body .fs-fight-card{height:83px!important;min-height:83px!important;max-height:83px!important;padding:37px 3px 8px!important;font-size:clamp(11px,3.1vw,13px)!important;line-height:1.12!important;align-self:stretch!important;overflow:hidden!important}
#forst-stage.fs-combat #fs-body .battleDice{transform:scale(.83)!important;transform-origin:center center!important;min-height:76px!important;margin:1px auto 5px!important}
#forst-stage.fs-combat #fs-body .battleDiceLabel{margin:4px 0 1px!important}
#forst-stage.fs-combat #fs-body .battleReport{margin:4px 0 4px!important;padding:5px 6px!important;line-height:1.2!important;font-size:clamp(11px,3.2vw,13px)!important}
#forst-stage.fs-combat #fs-body .hpPair{margin:4px 0 5px!important;gap:7px!important}
@media(max-height:730px){#forst-stage.fs-combat #fs-body #veil #sheetTitle{min-height:35px!important;font-size:20px!important;line-height:1.1!important;padding:1px 0 2px!important}#forst-stage.fs-combat #fs-body .hpBox{padding:4px!important}#forst-stage.fs-combat #fs-body .fs-fight-card{height:66px!important;min-height:66px!important;max-height:66px!important;padding:29px 2px 6px!important}#forst-stage.fs-combat #fs-body .battleDice{min-height:60px!important;transform:scale(.7)!important;margin:0 auto 0!important}#forst-stage.fs-combat #fs-body .fs-combat-grid{margin-top:8px!important}}
`;
let replacements=0;
html=html.replace(/<style id="forst-one-stage">([\s\S]*?)<\/style>/,(full,css)=>{
  // Replace the V40 combat-specific positioning rules; no new viewport/panel is created.
  let cleaned=css.replace(/#forst-stage\.fs-combat #fs-body \.(?:fs-combat-grid|fs-fight-card|battleDice|hpPair)\{[^}]*\}/g,'');
  cleaned=cleaned.replace(/#fs-body \.fs-combat-grid\{position:sticky!important;[^}]*\}/g,'');
  replacements++;
  return '<style id="forst-one-stage">'+cleaned+'\n'+combatCSS+'</style>';
});
if(replacements!==1)throw Error('Stage stylesheet is not unique');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V41</title>');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'forst-v41-'+i+'.js'}));
if(scripts.length!==6||!html.includes('position:static!important')||!html.includes('paintCombat()'))throw Error('Combat build verification failed');
for(const output of ['../forst-v41/index.html','../forst-final/index.html']){const target=path.resolve(__dirname,output);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html,'utf8');}
console.log('V41 combat fit OK',Buffer.byteLength(html),'bytes',scripts.length,'scripts');
