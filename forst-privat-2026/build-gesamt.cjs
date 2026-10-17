'use strict';
/* Build one self-contained game file from the already committed, private-book-safe sources.
   No network fetch, patch positions or external base HTML at runtime. */
const fs = require('node:fs');
const path = require('node:path');
const dir = __dirname;
const base = fs.readFileSync(path.join(dir,'spiel-luxus-v17.html'),'utf8');
const wrapper = fs.readFileSync(path.join(dir,'spiel-luxus-v25-final.html'),'utf8');

function parseLiteral(s, pos) {
  const quote=s[pos];
  if(quote!=="'" && quote!=='"')throw Error('String literal expected at '+pos);
  let a=[],i=pos+1;
  while(i<s.length){
    const c=s[i++];
    if(c===quote)return {text:a.join(''),end:i};
    if(c!=='\\'){a.push(c);continue;}
    const x=s[i++];
    if(x==='n')a.push('\n');
    else if(x==='r')a.push('\r');
    else if(x==='t')a.push('\t');
    else if(x==='b')a.push('\b');
    else if(x==='f')a.push('\f');
    else if(x==='v')a.push('\v');
    else if(x==='\n'){}
    else if(x==='u'){a.push(String.fromCharCode(parseInt(s.slice(i,i+4),16)));i+=4}
    else if(x==='x'){a.push(String.fromCharCode(parseInt(s.slice(i,i+2),16)));i+=2}
    else a.push(x);
  }
  throw Error('Unclosed string');
}

const patchStart=wrapper.indexOf('const PATCHES=');
const patchEnd=wrapper.indexOf('];\nasync function loadGame',patchStart);
if(patchStart<0||patchEnd<0)throw Error('Patch instructions missing');
const patches=JSON.parse(wrapper.slice(patchStart+'const PATCHES='.length,patchEnd+1));
let game=base;
for(let i=patches.length-1;i>=0;i--){
  const [position,count,added]=patches[i];
  if(position<0||position+count>base.length)throw Error('Invalid patch index '+i);
  game=game.slice(0,position)+added+game.slice(position+count);
}
const encoded=[...wrapper.matchAll(/atob\('([A-Za-z0-9+/=]+)'\)/g)];
if(encoded.length!==3)throw Error('Unexpected number of embedded add-ons: '+encoded.length);
const addOns=encoded.map(m=>Buffer.from(m[1],'base64').toString('utf8'));
const start='game=game.replace(\'</body>\',';
const first=wrapper.indexOf(start);
const second=wrapper.indexOf(start,first+start.length);
if(second<0)throw Error('V23 block missing');
const v23=parseLiteral(wrapper,second+start.length).text;
const suffixStart='game=game.replace(\'</body>\',spatialAddon+';
const last=wrapper.indexOf(suffixStart);
if(last<0)throw Error('Depth refinement missing');
const refinement=parseLiteral(wrapper,last+suffixStart.length).text;
for(const code of [addOns[0],v23,addOns[1],addOns[2]+refinement]){
  if(!game.includes('</body>'))throw Error('No HTML body closing tag');
  game=game.replace('</body>',code+'</body>');
}
game=game.replace('<title>Der Forst der Finsternis — Luxus V17</title>','<title>Der Forst der Finsternis — Gesamtfassung V26</title>');

/* User-provided book: 400 sections remain AES-GCM encrypted in GitHub. */
const privateBook=JSON.parse(fs.readFileSync(path.join(dir,'geschuetzte-buchdaten-v27.json'),'utf8'));
if(privateBook.format!=='forst-private-v1'||privateBook.sectionCount!==400||!/^[A-Za-z0-9+/=]+$/.test(privateBook.ciphertext))
  throw Error('Encrypted book package missing or damaged');
const cipherAnchor=/const ENCRYPTED_STORY = '[A-Za-z0-9+/=]+';/;
const nonceAnchor=/const STORY_NONCE = '[A-Za-z0-9+/=]+';/;
if(!cipherAnchor.test(game)||!nonceAnchor.test(game))throw Error('Gamebook encryption anchors missing');
game=game.replace(cipherAnchor,"const ENCRYPTED_STORY = '"+privateBook.ciphertext+"';");
game=game.replace(nonceAnchor,"const STORY_NONCE = '"+privateBook.nonce+"';");
if(!game.includes(privateBook.ciphertext))throw Error('Encrypted private book was not installed');

// When an old Safari URL with #k=... is used, the encrypted book opens exactly as before.
// No plaintext book is exposed in the public repository.
const unlockHelp=String.raw`
<script id="forst-key-helper">
(function(){
 if(/^[0-9a-f]{64}$/i.test(new URLSearchParams(location.hash.slice(1)).get('k')||''))return;
 function show(){
  if(document.getElementById('forst-key-help'))return;
  const pane=document.createElement('aside');pane.id='forst-key-help';
  pane.style.cssText='position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:18px;background:#080e0ce9;color:#f5e3bd;font:16px Georgia,serif;text-align:center';
  pane.innerHTML='<div style="max-width:430px;width:100%;box-sizing:border-box;border:3px ridge #a8854c;border-radius:14px;padding:22px;background:linear-gradient(#1d332b,#0e1814);box-shadow:0 0 40px #000"><h2 style="font-size:25px;color:#f4d9a3;margin:4px 0 12px">Der Forst der Finsternis</h2><p>Dein Spiel ist vollständig geladen. Füge zum Öffnen deiner 400 Buchabschnitte den bisherigen Safari-Spiellink ein.</p><input id="forst-old-link" aria-label="Bisheriger Safari-Link" placeholder="Bisheriger Safari-Link oder Schlüssel" style="box-sizing:border-box;display:block;width:100%;font:14px sans-serif;padding:13px;border:2px solid #ab8a52;border-radius:6px;background:#f8edda;color:#302012"><button id="forst-unlock" style="margin-top:14px;border:2px ridge #c6a164;border-radius:8px;background:#2a513e;color:#f6e9cb;padding:12px 24px;font:bold 16px Georgia,serif">Buch öffnen</button><p id="forst-key-error" role="status" style="font-size:13px;color:#f9c19c"></p><p style="font-size:12px;opacity:.75">Der Schlüssel bleibt im Browser und wird nicht an GitHub übertragen.</p></div>';
  document.body.appendChild(pane);
  document.getElementById('forst-unlock').addEventListener('click',()=>{
   const v=document.getElementById('forst-old-link').value.trim();
   const m=v.match(/[?#&]k=([0-9a-f]{64})(?:\\b|$)/i)||v.match(/^([0-9a-f]{64})$/i);
   if(!m){document.getElementById('forst-key-error').textContent='Bitte den vollständigen bisherigen Spiellink einschließlich Schlüssel einfügen.';return;}
   location.hash='k='+m[1];location.reload();
  });
 }
 if(document.readyState==='complete')show();
 else window.addEventListener('load',show,{once:true});
})();
</script>`;
// The private book PDF was already supplied by the owner. Bundle readable passages
// directly into the browser game; no key, password, download or network fetch needed.
const plainBook=fs.readFileSync(path.join(dir,'forst-buch-klartext.json'),'utf8');
const sections=JSON.parse(plainBook);
if(Object.keys(sections).length!==400 || !sections['1']?.t || !sections['238']?.t ||
   !sections['238'].t.includes('221') || !sections['400']?.t)throw Error('Plain book is incomplete');
if(plainBook.includes('</script>'))throw Error('Unexpected HTML tag inside book text');
if(!game.includes('let BOOK = {};')||!game.includes('let BOOK_READY = false'))throw Error('Expected locked book state missing');
game=game.replace('let BOOK = {};','let BOOK = '+plainBook+';');
game=game.replace('let BOOK_READY = false','let BOOK_READY = true');
game=game.replace(/const ENCRYPTED_STORY = '[^']+';/,'');
game=game.replace(/const STORY_NONCE = '[^']+';/,'');
const unlockStart=game.indexOf('async function unlockBook(){');
const unlockEnd=game.indexOf('function needBook()',unlockStart);
if(unlockStart<0 || unlockEnd-unlockStart<300 || unlockEnd-unlockStart>1500)throw Error('Unexpected book unlock implementation');
game=game.slice(0,unlockStart)+
  "async function unlockBook(){BOOK_READY=true;BOOK_FAILED=null;const el=document.getElementById('statusText');if(el)el.textContent='400 Abschnitte bereit';return true;}\n"+
  game.slice(unlockEnd);
game=game.replace('<title>Der Forst der Finsternis — Gesamtfassung V26</title>','<title>Der Forst der Finsternis – Sofort spielbar</title>');

const opens=(game.match(/<script\b/gi)||[]).length,closes=(game.match(/<\/script>/gi)||[]).length;
if(opens!==5||closes!==5||!game.startsWith('<!doctype html>'))throw Error('Generated HTML validation failed: '+opens+'/'+closes);
if(game.includes('raw.githack.com'))throw Error('External V17 dependency remains');
if(game.includes('const ENCRYPTED_STORY =')||game.includes('id="forst-key-helper"')||!game.includes('let BOOK = {"1"'))throw Error('Plain book bundle missing or unlock prompt remains');
if(!game.includes('v25BagDepthRefinement')||!game.includes('spatialV25Style'))throw Error('V25 visuals missing');
// QA: reject duplicated embedded images, invalid UTF-8 and old runtime loaders.
const art=[...game.matchAll(/data:image\/(?:png|webp|jpeg|jpg);base64,[A-Za-z0-9+/=]+/g)].map(m=>m[0]);
if(art.length<60 || new Set(art).size!==art.length)throw Error('Illustration assets missing or duplicated');
if(game.includes('\uFFFD'))throw Error('UTF-8 replacement characters found');
if(game.includes('const BASE_URL=')||game.includes('frame.srcdoc='))throw Error('Dynamic wrapper remains');
// The existing ornamental bag is the sole foreground bag layer.
const stableStyle='<style id="forst-depth-order">#app>#v23-bag-ornament{z-index:82!important;pointer-events:none!important}#app>.backpackHotspot{z-index:83!important}#veil{z-index:26!important}</style>';
game=game.replace('</body>',stableStyle+'</body>');
// Check every inline game script, not just HTML tag counts, before publishing.
const vm = require('node:vm');
const inlineScripts=[...game.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(inlineScripts.length!==5)throw Error('Unexpected inline script count: '+inlineScripts.length);
for(let i=0;i<inlineScripts.length;i++){
  try{new vm.Script(inlineScripts[i][1],{filename:'forst-inline-'+(i+1)+'.js'});}
  catch(e){throw Error('Inline JavaScript '+(i+1)+' is invalid: '+e.message)}
}
if(!game.includes('v25BagDepthRefinement')||!game.includes('spatialV25Style')||!game.includes('forst-depth-order'))
  throw Error('Foreground and combat layers missing from final version');
const out=path.join(dir,'Der_Forst_der_Finsternis_Gesamt_V26.html');
fs.writeFileSync(out,game,'utf8');
const liveDir=path.join(dir,'..','forst-final');
fs.mkdirSync(liveDir,{recursive:true});
fs.writeFileSync(path.join(liveDir,'index.html'),game,'utf8');

console.log('Standalone game created:',out,'size',Buffer.byteLength(game,'utf8'),'patches',patches.length,'scripts',opens);
