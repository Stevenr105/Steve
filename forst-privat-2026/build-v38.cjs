'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
const original=path.resolve(root,'../forst-v37/index.html');
const toolbar=JSON.parse(fs.readFileSync(path.join(root,'v38-top-tools.json'),'utf8'));
let html=fs.readFileSync(original,'utf8');
if(!html.includes('let BOOK = ')||!html.includes('id="forst-one-stage"')||!html.includes('id="forst-one-controller"'))throw Error('Verified V37 game source missing');
if(!toolbar.css.includes('top:8.1%')||!toolbar.js.includes('showMusic')||!toolbar.js.includes('DeviceOrientationEvent.requestPermission'))throw Error('MP3/3D controls not complete');
const oldSpatial=/<script id="spatialV25Script">[\s\S]*?<\/script>\s*/;
if(!oldSpatial.test(html))throw Error('Legacy hidden 3D controller missing');
html=html.replace(oldSpatial,'');
const style=/<style id="forst-one-stage">([\s\S]*?)<\/style>/;
if(!style.test(html))throw Error('Main stage style missing');
html=html.replace(style,(whole,css)=>'<style id="forst-one-stage">'+css+'\n'+toolbar.css+'</style>');
if(html.includes('id="forst-v38-top-tools"'))throw Error('Duplicated controls');
html=html.replace('</body>','<script id="forst-v38-top-tools">'+toolbar.js+'</script>\n</body>');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Der Forst der Finsternis — V38</title>');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(scripts.length!==6)throw Error('Unexpected script count '+scripts.length);
scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'v38-script-'+i+'.js'}));
if(!html.includes('const FORST_VISUALS=')||!html.includes('forst-v38-top-tools')||!html.includes('function showMusic()'))throw Error('Gameplay or MP3 source missing');
for(const target of ['../forst-v38/index.html','../forst-final/index.html']){
const file=path.resolve(root,target);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html,'utf8');
}
console.log('V38 READY: '+Buffer.byteLength(html)+' bytes, '+scripts.length+' script checks, MP3 player and parallax enabled');
