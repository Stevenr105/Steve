'use strict';
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

window.STURMGLAS_WATER=function(canvas,photoUrl){
 try{
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');
 const compile=(kind,code)=>{const s=gl.createShader(kind);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,WATER_VS));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,WATER_FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([5,80,95,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(gl.getUniformLocation(p,'seaTex'),0);
 let loaded=0;const im=new Image();im.onload=()=>{try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);loaded=1;}catch(e){console.warn(e)}};im.src=photoUrl;
 const time=gl.getUniformLocation(p,'t'),strength=gl.getUniformLocation(p,'strength'),has=gl.getUniformLocation(p,'hasTex');
 return {kind:'WebGL – original STURMGLAS Gerstner water',resize(){const d=Math.min(window.devicePixelRatio||1,1.12);canvas.width=Math.round(canvas.clientWidth*d);canvas.height=Math.round(canvas.clientHeight*d);gl.viewport(0,0,canvas.width,canvas.height)},draw(t,s){gl.useProgram(p);gl.uniform1f(time,t);gl.uniform1f(strength,s);gl.uniform1f(has,loaded);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}};
 }catch(e){console.warn('Canvas ocean fallback',e);return null;}
};
