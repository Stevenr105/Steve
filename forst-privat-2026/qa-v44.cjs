'use strict';
const path=require('path');
const fs=require('fs');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright-core');
(async()=>{
 const choices=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'];
 const binary=choices.find(x=>fs.existsSync(x));
 if(!binary)throw Error('No browser installed; cannot claim browser smoke success');
 const browser=await chromium.launch({headless:true,executablePath:binary,args:['--no-sandbox','--disable-dev-shm-usage']});
 const failures=[],notes=[];
 try{
  for(const width of [390,320]){
   const page=await browser.newPage({viewport:{width,height:width===390?844:700},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   page.on('pageerror',e=>failures.push(width+'px JS error: '+e.message));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../forst-v44/index.html')).href,{waitUntil:'load'});
   await page.waitForSelector('#forst-stage',{timeout:12000});
   await page.waitForTimeout(150);
   const ready=await page.evaluate(()=>!!document.querySelector('#fs-nav #fs-options')&&!!document.querySelector('#fs-beast-img'));
   if(!ready)failures.push(width+'px: options/enemy surface missing');
   const options=page.locator('#fs-nav #fs-options');
   await options.click({timeout:4000});
   const title=await page.locator('#sheetTitle').textContent();
   if(!/Optionen/i.test(title||''))failures.push(width+'px: options button has no response: '+title);
   await page.evaluate(()=>{
    const s=state;
    s.current=317;s.rolled=true;s.stats.g=10;s.stats.s=17;s.stats.l=10;
    s.max.g=10;s.max.s=18;s.max.l=10;
    s.combat={name:'Waldschrat I',g:6,s:6,max:6,foes:[{name:'Waldschrat I',g:6,s:6}],index:0,section:317,pending:null,msg:'Der Kampf beginnt!'};
    visiblePanel='combat';renderPanel();
   });
   await page.waitForTimeout(350);
   const art=await page.evaluate(()=>{
    const img=document.querySelector('#fs-beast-img'),box=document.querySelector('#fs-beast');
    return {width:img?.naturalWidth,src:img?.getAttribute('src')?.slice(0,25),box:box?getComputedStyle(box).display:'absent',stage:document.getElementById('forst-stage')?.className};
   });
   if(!(art.width>0)||art.box==='none'||!art.stage.includes('fs-active-fight'))failures.push(width+'px: Waldschrat image invisible '+JSON.stringify(art));
   else notes.push(width+'px: Waldschrat artwork '+art.width+'px loaded');
   const overflow=await page.evaluate(()=>{
    const c=document.getElementById('sheetBody');
    return {scroll:c.scrollHeight,client:c.clientHeight};
   });
   if(overflow.scroll>overflow.client+7)notes.push(width+'px: long combat may scroll '+JSON.stringify(overflow));
   await page.evaluate(()=>{state.combat=null;visiblePanel='combat';renderPanel()});
   const escape=page.getByRole('button',{name:/Zurück zum Abenteuer/i});
   await escape.click({timeout:5000});
   const escapeOk=await page.evaluate(()=>visiblePanel==='story'||visiblePanel==='options');
   if(!escapeOk)failures.push(width+'px: exit from empty combat failed');
   await page.evaluate(()=>{
    trophyStore.foes['waldschrat i']={name:'Waldschrat I',section:317};
    trophyTab='foes';visiblePanel='trophies';renderPanel();
   });
   const tile=page.locator('.trophyCard.fs44-openable').first();
   await tile.click({timeout:5000});
   const modal=await page.evaluate(()=>{
    const x=document.querySelector('.fs-card-modal'),img=x?.querySelector('.fs-card-inner img');
    return {shown:!!x&&!x.hidden,imgWidth:img?.naturalWidth||0};
   });
   if(!modal.shown||!modal.imgWidth)failures.push(width+'px: bestiary trophy failed '+JSON.stringify(modal));
   await page.locator('.fs-card-modal .fs-card-close').click({timeout:4000});
   notes.push(width+'px: return button and trophy card are clickable');
   await page.close();
  }
 }finally{await browser.close()}
 notes.forEach(x=>console.log('PASS:',x));
 failures.forEach(x=>console.error('FAIL:',x));
 if(failures.length)process.exitCode=1;
 else console.log('V44 BROWSER SMOKE SUCCEEDED');
})().catch(e=>{console.error(e);process.exit(1)});
