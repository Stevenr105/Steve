'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
const gameFile=path.resolve(root,'../forst-v29/index.html');
const addonFile=path.resolve(root,'v30-rendered-skin.html');
let game=fs.readFileSync(gameFile,'utf8');
const addon=fs.readFileSync(addonFile,'utf8');
if(!game.startsWith('<!doctype html>'))throw Error('V29 game document missing');
if(!game.includes('let BOOK = ')||!game.includes('forst-v29-rolls'))throw Error('V29 adventure or dice not present');
if(!addon.startsWith('<style id="forst-v30-design">')||!addon.includes('const SKIN_ASSETS=')||!addon.includes('creatureCardHTML=function'))throw Error('Illustrated addon incomplete');
if(game.includes('forst-v30-design'))throw Error('V30 applied twice');
game=game.replace('</body>',addon+'\n</body>').replace(/<title>[^<]*<\/title>/i,'<title>Der Forst der Finsternis — V30</title>');
const scripts=[...game.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(scripts.length!==8)throw Error('Unexpected script count '+scripts.length);
for(let i=0;i<scripts.length;i++){new vm.Script(scripts[i][1],{filename:'forst-v30-inline-'+(i+1)+'.js'});}
if(!game.includes('wild-boar')&&!game.includes('skin-creature-lunge'))throw Error('Creature artwork missing');
if(!game.includes('rollCreationStat'))throw Error('Individual character rolls missing');
if(!game.includes('forst-v30-design'))throw Error('V30 design missing');
for(const target of ['../forst-v30/index.html','../forst-final/index.html']){
 const out=path.resolve(root,target);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,game,'utf8');
}
console.log('V30 built:',Buffer.byteLength(game),'bytes,',scripts.length,'valid scripts');
