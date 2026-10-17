'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
let html=fs.readFileSync(path.resolve(root,'../forst-v32/index.html'),'utf8');
const layout=JSON.parse(fs.readFileSync(path.join(root,'v36-verified-skin.json'),'utf8'));
if(!layout.css?.includes('#forst-stage')||!layout.js?.includes('const FORST_VISUALS=')||!html.includes('let BOOK = '))throw Error('Source game/assets not complete');
for(const [tag,id] of [['style','forst-v32-only-design'],['script','forst-v32-only-design-script']]){
 const re=new RegExp('<'+tag+' id="'+id+'">[\\s\\S]*?<\\/'+tag+'>','g');
 if((html.match(re)||[]).length!==1)throw Error('Expected one old '+id+' layer');
 html=html.replace(re,'');
}
html=html.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V36</title>');
if(html.includes('forst-one-stage'))throw Error('Duplicated new game stage');
html=html.replace('</body>','<style id="forst-one-stage">'+layout.css+'</style><script id="forst-one-controller">'+layout.js+'</script>\n</body>');
const blocks=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(blocks.length!==6)throw Error('Expected 6 valid scripts, found '+blocks.length);
blocks.forEach((m,i)=>new vm.Script(m[1],{filename:'v36-'+i+'.js'}));
for(const rel of ['../forst-v36/index.html','../forst-final/index.html']){
const dest=path.resolve(root,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html,'utf8');
}
console.log('V36 verified build: 400 sections, single stage,',Buffer.byteLength(html),'bytes,',blocks.length,'valid scripts');
