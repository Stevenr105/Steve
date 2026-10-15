'use strict';
const $=id=>document.getElementById(id);
const W=900,H=1600, TAU=Math.PI*2;
const scene=$('scene'),water=$('water'),ctx=scene.getContext('2d',{alpha:true,desynchronized:true});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b,x,y)=>Math.hypot(a-x,b-y);
let state={mode:'menu',time:0,clock:0,phase:'idle',phaseTime:0,phaseCount:1,health:5,maxHealth:5,bossHP:10,bossMax:10,bossX:450,bossY:722,side:1,attackX:450,attackY:900,attackHit:false,inv:0,fireCD:0,dodgeCD:0,dodgeTime:0,ammo:0,hits:0,shake:0,flash:0,mobileTarget:null,msg:'',msgTime:0,last:0,waterLevel:.5,win:false,holdFire:false};
const ship={x:445,y:1075,vx:0,vy:0,roll:0};
const shots=[],sparks=[],bubbles=[],ripples=[],stars=[];
const sprites={};
for(let k of ['crab','ship','bottle','water','trophy-beach']){let im=new Image();im.decoding='async';im.src='/assets/'+k+'.webp';sprites[k]=im;}
function readyImage(im){return im&&im.complete&&im.naturalWidth>0}
function resize(){let d=Math.min(devicePixelRatio||1,1.55);scene.width=Math.max(2,Math.round(scene.clientWidth*d));scene.height=Math.max(2,Math.round(scene.clientHeight*d));ctx.setTransform(scene.width/W,0,0,scene.height/H,0,0);if(ocean)ocean.resize();else{water.width=scene.width;water.height=scene.height;}}
window.addEventListener('resize',resize);
const WATER_VS='attribute vec2 p; varying vec2 v; void main(){v=(p+1.0)*0.5;gl_Position=vec4(p,0.,1.);}';
const WATER_FS=`precision highp float;
varying vec2 v;
uniform float t;
uniform float strength;
uniform sampler2D seaTex;
uniform float hasTex;
const float TAU=6.28318530718;
// Gerstner waves. The *same* surface displacement shapes texture, highlights, foam and objects.
vec4 wave(vec2 q){
 float s=0.45+strength*.46;
 float w1=dot(q,vec2(15.0,4.0))-t*1.08*s;
 float w2=dot(q,vec2(-7.0,22.0))-t*.89*s+1.6;
 float w3=dot(q,vec2(30.0,-10.0))+t*1.39*s+.4;
 float w4=dot(q,vec2(40.0,16.0))-t*1.71*s+2.3;
 float h=.52*sin(w1)+.27*sin(w2)+.15*sin(w3)+.06*sin(w4);
 vec2 d=.52*cos(w1)*vec2(15.,4.)+.27*cos(w2)*vec2(-7.,22.)+.15*cos(w3)*vec2(30.,-10.)+.06*cos(w4)*vec2(40.,16.);
 vec2 disp=.034*(.4+strength*.4)*vec2(.52*cos(w1)-.25*cos(w2)+.13*cos(w3),.42*sin(w1)+.22*cos(w2)-.18*sin(w3));
 return vec4(disp,h,clamp(length(d)*.012,0.,1.));
}
void main(){
 vec2 q=vec2(v.x*1.72,v.y*1.82);
 vec4 w=wave(q);
 vec2 swell=vec2(w.x,w.y);
 // Deform the PHOTOGRAPHIC WAVE IMAGE itself; no second layer or floating foam surface.
 vec2 uv=clamp(vec2(v.x*.78+.10,v.y*.73+.12)+swell*.75,vec2(.006),vec2(.994));
 vec3 photo=texture2D(seaTex,uv).rgb;
 float r=.49+.51*clamp(w.z,-.98,.98);
 vec3 normal=normalize(vec3(-w.x*16.0,-w.y*13.0,1.0));
 vec3 sun=normalize(vec3(-.5,-.7,1.0));
 vec3 eye=vec3(0.,0.,1.);
 float light=clamp(dot(normal,sun),0.,1.);
 float sparkle=pow(max(dot(reflect(-sun,normal),eye),0.),54.);
 float fresnel=pow(1.-max(0.,dot(normal,eye)),3.);
 vec3 teal=mix(vec3(.012,.16,.21),vec3(.064,.53,.58),r);
 vec3 c=mix(teal,photo,hasTex*.78);
 c*=.77+light*.44;
 c+=vec3(.16,.28,.24)*sparkle+vec3(.035,.06,.068)*fresnel;
 // Sea foam comes from the SAME actual moving wave crests and original photograph.
 float breaker=smoothstep(.67,.91,w.z)*(.014+strength*.095);
 c=mix(c,vec3(.76,.94,.9),breaker);
 gl_FragColor=vec4(clamp(c,0.,1.),1.0);
}`;
let ocean=null;
function setupWater(){try{
 const gl=water.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
 if(!gl)return null;
 const shader=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh};
 const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,WATER_VS));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,WATER_FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));gl.useProgram(p);
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([4,66,85,255]));
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(gl.getUniformLocation(p,'seaTex'),0);
 let loaded=0;const photo=sprites.water;
 function upload(){if(!readyImage(photo))return;try{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,photo);loaded=1}catch(e){console.warn('Water photo unavailable',e)}};
 if(photo.complete)upload();else photo.addEventListener('load',upload,{once:true});
 const t=gl.getUniformLocation(p,'t'),strength=gl.getUniformLocation(p,'strength'),has=gl.getUniformLocation(p,'hasTex');
 return {resize(){let d=Math.min(devicePixelRatio||1,1.2);water.width=Math.max(2,Math.round(water.clientWidth*d));water.height=Math.max(2,Math.round(water.clientHeight*d));gl.viewport(0,0,water.width,water.height)},draw(time){gl.useProgram(p);gl.uniform1f(t,time);gl.uniform1f(strength,.72+Math.sin(time*.7)*.1);gl.uniform1f(has,loaded);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}};
}catch(e){console.warn('WebGL off – photo water fallback',e);return null;}}
ocean=setupWater();resize();
let fallback=null;
function drawWater(t){if(ocean){ocean.draw(t);return;}if(!fallback)fallback=water.getContext('2d');if(!fallback)return;fallback.clearRect(0,0,water.width,water.height);let im=sprites.water;if(!readyImage(im)){fallback.fillStyle='#146775';fallback.fillRect(0,0,water.width,water.height);return};let sway=Math.sin(t*1.2)*water.width*.015;fallback.drawImage(im,-water.width*.10+sway,-water.height*.04,water.width*1.2,water.height*1.12)}
function ripple(x,y,rad=18,color='#bdeff4'){ripples.push({x,y,r:rad,life:1,color})}
function particle(x,y,c='#e6f7e9',n=12,speed=180){for(let i=0;i<n;i++){let a=Math.random()*TAU,m=30+Math.random()*speed;sparks.push({x,y,vx:Math.cos(a)*m,vy:Math.sin(a)*m-.24*speed,r:1+Math.random()*4,life:.45+Math.random()*.5,color:c});}}
function beep(freq=300,dur=.09,kind='triangle',volume=.07){try{if(!window.audio)window.audio=new (window.AudioContext||window.webkitAudioContext)();let a=window.audio;if(a.state==='suspended')a.resume();let o=a.createOscillator(),v=a.createGain();o.type=kind;o.frequency.setValueAtTime(freq,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.68),a.currentTime+dur);v.gain.setValueAtTime(volume,a.currentTime);v.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);o.connect(v);v.connect(a.destination);o.start();o.stop(a.currentTime+dur)}catch(e){}}
function vibrate(ms){try{navigator.vibrate?.(ms)}catch(e){}}
function message(s,t=1.3){state.msg=s;state.msgTime=t;}
function reset(){
 Object.assign(state,{mode:'play',time:0,clock:0,phase:'idle',phaseTime:1.25,phaseCount:1,health:5,maxHealth:5,bossHP:10,bossMax:10,bossX:450,bossY:722,side:1,attackX:450,attackY:950,attackHit:false,inv:0,fireCD:0,dodgeCD:0,dodgeTime:0,ammo:0,hits:0,shake:0,flash:0,mobileTarget:null,msg:'',msgTime:0,win:false,holdFire:false});
 Object.assign(ship,{x:445,y:1075,vx:0,vy:0,roll:0});shots.length=0;sparks.length=0;stars.length=0;ripples.length=0;bubbles.length=0;
 $('modal').classList.add('hidden');$('pause').textContent='Ⅱ';message('Achte auf die Scheren!');beep(610,.16,'sine');hud();
}
function showModal(type){state.mode=type;state.holdFire=false;const win=type==='victory',pause=type==='pause';$('modal').classList.remove('hidden');$('trophy').classList.toggle('visible',win);$('modalKicker').textContent=win?'🏆 TROPHÄE FREIGESCHALTET':pause?'KAMPF UNTERBROCHEN':'DER KRABBENKÖNIG HAT GEWONNEN';$('modalTitle').innerHTML=win?'SIEG!':pause?'PAUSE':'SCHIFFBRUCH';$('modalSub').textContent=win?'Die Scheren des Meeres besiegt':pause?'Die Flasche wartet':'Der Krabbenkönig ist noch frei';$('modalText').textContent=win?`Du hast den Krabbenkönig in ${Math.ceil(state.time)} Sekunden besiegt und ${state.hits} Treffer gelandet. Diese Flaschentrophäe gehört dir!`:pause?'Weiche den Scheren aus. Nutze die Schwachphase zum Schießen.':`Du hast ${state.hits} Treffer erzielt. Beim nächsten Versuch erkennst du seine Angriffe schon besser.`;$('start').textContent=win?'NOCH EINMAL KÄMPFEN':pause?'KAMPF FORTSETZEN':'ERNEUT VERSUCHEN';$('rules').textContent=pause?'Zum Fortsetzen antippen':'Finger ziehen · FEUER halten · AUSWEICHEN tippen';}
function hud(){if(state.mode==='menu')return;$('hullFill').style.width=(state.health/state.maxHealth*100)+'%';$('hullText').textContent=Math.round(state.health/state.maxHealth*100)+'%';$('bossFill').style.width=(state.bossHP/state.bossMax*100)+'%';$('bossText').textContent=Math.round(state.bossHP/state.bossMax*100)+'%';let phase=state.bossHP>7?1:state.bossHP>3?2:3;state.phaseCount=phase;$('phaseNum').textContent='PHASE '+phase+'/3';$('shots').textContent='TREFFER '+state.hits+'/10';$('time').textContent=String(Math.floor(state.time/60)).padStart(2,'0')+':'+String(Math.floor(state.time%60)).padStart(2,'0');
 let msg=state.msgTime>0?state.msg:state.phase==='warn'?'⚠ SCHERE KOMMT — AUSWEICHEN!':state.phase==='slam'?'SCHERENSCHLAG!':state.phase==='recover'?'✦ SCHWACHSTELLE OFFEN — FEUER!':'Krabbe beobachtet dich ...';let el=$('phase');el.textContent=msg;el.className='phase'+(state.phase==='warn'||state.phase==='slam'?' warning':state.phase==='recover'?' weak':'');let dodge=$('dodge');dodge.disabled=state.dodgeCD>.05;dodge.innerHTML=state.dodgeCD>0?'<b>↝</b>'+state.dodgeCD.toFixed(1)+' s':'<b>↝</b>AUSWEICHEN';}
function inGlass(x,y){return Math.hypot((x-450)/285,(y-911)/335)}
function pushInGlass(){let dx=(ship.x-450)/281,dy=(ship.y-916)/320,r=Math.hypot(dx,dy);if(r>1){ship.x=450+dx/r*281;ship.y=916+dy/r*320;ship.vx*=-.16;ship.vy*=-.16;ripple(ship.x,ship.y,13);return true}return false;}
function dodge(){if(state.mode!=='play'||state.dodgeCD>0)return;state.dodgeCD=3.1;state.dodgeTime=.56;state.inv=Math.max(state.inv,.60);let dir=state.attackX>ship.x?-1:1;if(state.phase!=='warn'&&state.phase!=='slam')dir=ship.x<450?-1:1;ship.vx+=dir*590;ship.vy+=150;ripple(ship.x,ship.y,35);particle(ship.x,ship.y,'#e6faff',20,180);beep(720,.11,'sine',.1);vibrate(30);}
function shoot(){if(state.mode!=='play'||state.fireCD>0)return;state.fireCD=.32;let targetX=state.bossX,targetY=state.bossY+80;let a=Math.atan2(targetY-ship.y,targetX-ship.x),sx=ship.x,sy=ship.y-40;shots.push({x:sx,y:sy,vx:Math.cos(a)*770,vy:Math.sin(a)*770,life:1.4,trail:[]});ripple(sx,sy,9,'#ffd6a2');particle(sx,sy,'#ffde9f',6,70);beep(130,.11,'sawtooth',.065);}
const keys={};window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='Space')shoot();if(e.code==='ShiftLeft'||e.code==='ShiftRight')dodge();if(e.code==='Escape')togglePause()});window.addEventListener('keyup',e=>{keys[e.code]=false});
function togglePause(){if(state.mode==='play'){showModal('pause')}else if(state.mode==='pause'){$('modal').classList.add('hidden');state.mode='play';state.last=performance.now();}}
$('pause').addEventListener('click',togglePause);
$('start').addEventListener('click',()=>{if(state.mode==='pause'){togglePause();return;}reset();});
const fireButton=$('fire');fireButton.addEventListener('pointerdown',e=>{e.preventDefault();fireButton.setPointerCapture(e.pointerId);state.holdFire=true;shoot();fireButton.classList.add('pressed')});for(const e of ['pointerup','pointercancel','lostpointercapture'])fireButton.addEventListener(e,()=>{state.holdFire=false;fireButton.classList.remove('pressed')});$('dodge').addEventListener('pointerdown',e=>{e.preventDefault();dodge()});
const world=$('world');let touchId=null;
world.addEventListener('pointerdown',e=>{if(state.mode!=='play')return;touchId=e.pointerId;world.setPointerCapture(e.pointerId);aim(e)});world.addEventListener('pointermove',e=>{if(state.mode!=='play'||touchId!==e.pointerId)return;aim(e)});
function aim(e){let rect=world.getBoundingClientRect();state.mobileTarget={x:clamp((e.clientX-rect.left)/rect.width*900,178,722),y:clamp((e.clientY-rect.top)/rect.height*1600,696,1196)}}
for(let et of ['pointercancel','pointerup','lostpointercapture'])world.addEventListener(et,e=>{if(e.pointerId===touchId){touchId=null;state.mobileTarget=null}});
function damage(){if(state.inv>0)return;state.health-=1;state.inv=1.0;state.shake=16;state.flash=.34;ship.vx+=state.side>0?290:-290;ship.vy+=185;particle(ship.x,ship.y,'#ffd3b6',27,240);ripple(ship.x,ship.y,44);beep(125,.33,'sawtooth',.14);vibrate([35,35,60]);if(state.health<=0){state.health=0;showModal('defeat')}else message('RUMPFSCHADEN! · DRÜCK DICH VOM GLAS WEG',1.3);}
function beginWarning(){state.phase='warn';state.phaseTime=state.phaseCount===3?.86:1.20;state.side=Math.random()<.5?-1:1;state.attackX=clamp(ship.x+(ship.vx*.12),205,698);state.attackY=clamp(ship.y+ship.vy*.10,755,1190);state.attackHit=false;beep(400,.12,'triangle',.07);message(state.side>0?'⚠ RECHTE SCHERE — AUSWEICHEN!':'⚠ LINKE SCHERE — AUSWEICHEN!',.8);}
function beginSlam(){state.phase='slam';state.phaseTime=.50;state.attackHit=false;state.shake=5;beep(220,.21,'sawtooth',.09)}
function beginRecovery(){state.phase='recover';state.phaseTime=state.phaseCount===3?2.3:2.9;state.msg='✦ SCHWACHSTELLE FREI — JETZT FEUERN!';state.msgTime=1.8;particle(state.bossX,state.bossY+87,'#ffe09e',26,150);beep(820,.17,'sine',.11);}
function win(){state.win=true;beep(890,.4,'sine',.14);particle(state.bossX,state.bossY,'#ffe0a0',100,300);state.shake=23;showModal('victory');}
function update(dt){state.time+=dt;state.msgTime=Math.max(0,state.msgTime-dt);state.inv=Math.max(0,state.inv-dt);state.fireCD=Math.max(0,state.fireCD-dt);state.dodgeCD=Math.max(0,state.dodgeCD-dt);state.dodgeTime=Math.max(0,state.dodgeTime-dt);state.flash=Math.max(0,state.flash-dt*2);state.shake=Math.max(0,state.shake-dt*35);
 if(state.holdFire)shoot();let kx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);let ky=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);
 let wantedX=kx*260,wantedY=ky*260;if(state.mobileTarget){wantedX=clamp((state.mobileTarget.x-ship.x)*4.5,-300,300);wantedY=clamp((state.mobileTarget.y-ship.y)*4.5,-300,300);}
 ship.vx=lerp(ship.vx,wantedX,Math.min(1,dt*6));ship.vy=lerp(ship.vy,wantedY,Math.min(1,dt*6));ship.x+=ship.vx*dt;ship.y+=ship.vy*dt;ship.roll=lerp(ship.roll,clamp(ship.vx/500,-.38,.38),Math.min(1,dt*6));pushInGlass();
 state.bossX=450+Math.sin(state.time*(.43+state.phaseCount*.07))*60;
 state.bossY=718+Math.sin(state.time*1.4)*17;
 state.phaseTime-=dt;
 switch(state.phase){
  case 'idle':if(state.phaseTime<=0)beginWarning();break;
  case 'warn':if(state.phaseTime<=0)beginSlam();break;
  case 'slam':{let amount=1-state.phaseTime/.5;if(!state.attackHit&&amount>.51){state.attackHit=true;state.shake=12;particle(state.attackX,state.attackY,'#d6faf4',16,155);ripple(state.attackX,state.attackY,59,'#fff0bd');if(dist(ship.x,ship.y,state.attackX,state.attackY)<139)damage();}if(state.phaseTime<=0)beginRecovery();break;}
  case 'recover':if(state.phaseTime<=0){state.phase='idle';state.phaseTime=state.phaseCount===3?.54:.9;}break;
 }
 for(let i=shots.length-1;i>=0;i--){let s=shots[i];s.trail.push([s.x,s.y]);if(s.trail.length>7)s.trail.shift();s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
 if(dist(s.x,s.y,state.bossX,state.bossY+82)<69){if(state.phase==='recover'){state.bossHP=Math.max(0,state.bossHP-1);state.hits++;state.flash=.18;state.shake=6;particle(s.x,s.y,'#ffe0ab',20,160);beep(600,.16,'triangle',.09);message('VOLLtreffer! · PANZER DURCHBROCHEN',.8);if(state.bossHP<=0){win();return;}}else{particle(s.x,s.y,'#97d5da',10,95);message('PANZER ZU! · WARTE AUF SCHWACHPHASE',.9);}shots.splice(i,1);continue;}if(s.life<=0||s.x<0||s.y<0||s.x>W||s.y>H)shots.splice(i,1);
 }
 for(let i=sparks.length-1;i>=0;i--){let p=sparks[i];p.life-=dt;p.vx*=.98;p.vy+=dt*100;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0)sparks.splice(i,1)}
 for(let i=ripples.length-1;i>=0;i--){ripples[i].life-=dt*1.1;ripples[i].r+=dt*140;if(ripples[i].life<=0)ripples.splice(i,1)}
 if(state.time>=185){showModal('defeat')}hud();
}
function image(x,y,w,h,im,rotation=0,alpha=1){if(!readyImage(im))return;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=alpha;ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();}
function glow(x,y,r,c,opacity=1){let gr=ctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'transparent');ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}
function ring(x,y,r,c,w=5,dash=[]){ctx.save();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.restore()}
function clawCut(side,t){let img=sprites.crab;if(!readyImage(img))return;let strong=state.phase==='slam',warn=state.phase==='warn';let power=strong? Math.max(0,Math.sin((1-state.phaseTime/.5)*Math.PI)) : warn?.11:0;let startX=state.bossX+(side<0?-152:152),startY=state.bossY+128;let x=startX+(state.attackX-startX)*power*.73,y=startY+(state.attackY-startY)*power*.83;
 ctx.save();ctx.translate(x,y);ctx.rotate((side<0?-.33:.2)+Math.sin(t*3)*.018+power*(side<0?.42:-.34));ctx.globalAlpha=.93;let sx=side<0?118:338,sy=side<0?348:425,sw=side<0?300:260,sh=side<0?365:350;ctx.drawImage(img,sx,sy,sw,sh,-120,-116,240,232);ctx.restore();}
function draw(){ctx.clearRect(0,0,W,H);ctx.save();if(state.shake>0){ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake)};
 // Deep sea contact haze, animated motes beneath the surface. The sea shader itself remains unchanged.
 glow(450,920,350,'#004a5c',.26);
 for(let i=0;i<22;i++){let x=210+(Math.sin(state.time*.21+i*32.11)*.5+.5)*485,y=550+((i*79.3-state.time*(17+i%3*7)+100000)%640);ctx.fillStyle='rgba(201,248,247,.17)';ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.55,0,TAU);ctx.fill();}
 for(let r of ripples){ring(r.x,r.y,r.r,`rgba(222,250,247,${Math.max(0,r.life)*.7})`,2.5)}
 // Boss glows around armored shell and exposes a soft yellow core only after its claw strike.
 glow(state.bossX,state.bossY,250,'#76ccca',.13);
 let wobble=Math.sin(state.time*1.26)*.055;
 image(state.bossX,state.bossY,506,506,sprites.crab,wobble);
 clawCut(-1,state.time);clawCut(1,state.time);
 if(state.phase==='warn'){
  const sideX=state.bossX+(state.side>0?132:-132),sideY=state.bossY+135;
  ctx.save();ctx.globalAlpha=.45+Math.sin(state.time*18)*.17;ctx.strokeStyle='#ff9287';ctx.lineWidth=10;ctx.setLineDash([22,12]);ctx.beginPath();ctx.moveTo(sideX,sideY);ctx.quadraticCurveTo(state.attackX+state.side*70,state.attackY-115,state.attackX,state.attackY);ctx.stroke();ctx.restore();
  ring(state.attackX,state.attackY,84+Math.sin(state.time*11)*8,'rgba(255,147,120,.88)',6,[13,9]);glow(state.attackX,state.attackY,125,'#e84d40',.32);
 }
 if(state.phase==='slam'){
  let a=1-state.phaseTime/.5,p=Math.min(1,a*1.8),origX=state.bossX+(state.side>0?162:-162),origY=state.bossY+123;
  let x=lerp(origX,state.attackX,p),y=lerp(origY,state.attackY,p);glow(x,y,111,'#ffb889',.13);ring(x,y,37+Math.sin(state.time*10)*8,'rgba(255,219,184,.65)',4);ctx.save();ctx.strokeStyle='rgba(159,237,229,.85)';ctx.lineWidth=28;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(origX,origY);ctx.quadraticCurveTo(lerp(origX,x,.54)+80*state.side,lerp(origY,y,.38),x,y);ctx.stroke();ctx.restore();
  if(readyImage(sprites.crab)){ctx.save();ctx.translate(x,y);ctx.rotate(state.side*.55+a*.35);ctx.drawImage(sprites.crab,state.side>0?339:140,388,290,355,-135,-125,270,275);ctx.restore();}
 }
 if(state.phase==='recover'){
  let coreX=state.bossX,coreY=state.bossY+94;glow(coreX,coreY,150,'#ffda78',.46+Math.sin(state.time*6)*.14);ring(coreX,coreY,87+Math.sin(state.time*7)*5,'rgba(255,235,151,.92)',6,[9,13]);glow(coreX,coreY,40,'#fff2b4',.65);ctx.textAlign='center';ctx.font='700 23px Georgia';ctx.fillStyle='#ffe4a5';ctx.shadowColor='#000';ctx.shadowBlur=10;ctx.fillText('SCHWACH!',coreX,coreY-107);ctx.shadowBlur=0;
 }
 // projectiles pass in front of the boss
 for(let s of shots){ctx.save();ctx.strokeStyle='#ffe1a2';ctx.lineWidth=5;ctx.beginPath();for(let j=0;j<s.trail.length;j++){let p=s.trail[j];if(j===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}ctx.lineTo(s.x,s.y);ctx.stroke();ctx.restore();glow(s.x,s.y,22,'#ffd36c',.9);ctx.fillStyle='#fff1c4';ctx.beginPath();ctx.arc(s.x,s.y,6,0,TAU);ctx.fill();}
 // shadow and ship bobbing in the physically safe lower part of the bottle
 let bob=Math.sin(state.time*3.4)*8;glow(ship.x,ship.y+75,82,'#07131b',.35);
 if(state.inv<=0||Math.floor(state.time*12)%2===0){image(ship.x,ship.y+bob,159,218,sprites.ship,ship.roll*.7+Math.sin(state.time*2)*.027)}
 if(state.dodgeTime>0){glow(ship.x,ship.y,105,'#d0fcff',.12);ring(ship.x,ship.y,59,'rgba(174,247,244,.85)',5)}
 for(let p of sparks){ctx.save();ctx.globalAlpha=clamp(p.life/.45,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();ctx.restore()}
 ctx.restore();}
let last=performance.now();function frame(ms){requestAnimationFrame(frame);let dt=Math.min(.043,Math.max(0,(ms-last)/1000));last=ms;if(state.mode==='play'){update(dt);draw()}else if(state.mode==='menu'){state.time+=dt*.45;draw()}else if(state.mode==='pause'){draw()} else{draw()};drawWater(ms/1000);$('strikeflash').style.opacity=String(state.flash*.55);}
requestAnimationFrame(frame);
window.STURMGLAS_BOSS_TEST={getState:()=>({mode:state.mode,time:state.time,health:state.health,bossHP:state.bossHP,bossPhase:state.phase,shots:shots.length,ship:{x:ship.x,y:ship.y},webglWater:!!ocean,images:Object.fromEntries(Object.entries(sprites).map(([k,v])=>[k,[v.complete,v.naturalWidth]])),phaseCount:state.phaseCount}),start:reset,skipToRecovery:()=>{state.phase='recover';state.phaseTime=6},hitBoss:()=>{state.bossHP=Math.max(0,state.bossHP-1);state.hits++;if(!state.bossHP)win();hud()},takeHit:()=>damage()};