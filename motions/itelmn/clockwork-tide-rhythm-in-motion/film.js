/* Original deterministic procedural 3D scene. MIT-0. */
(function(root){
'use strict';
const TAU=Math.PI*2, clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), mix=(a,b,t)=>a+(b-a)*t, ease=x=>{x=clamp(x);return x*x*(3-2*x)}, ramp=(t,a,b)=>ease((t-a)/(b-a));
const add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>a.map((v,i)=>v-b[i]), dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0), cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], norm=a=>{let d=Math.hypot(...a)||1;return a.map(x=>x/d)}, scale=(a,s)=>a.map(x=>x*s);
function rotate(v,az,ax){let c=Math.cos(az),s=Math.sin(az),p=[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]],d=Math.cos(ax),e=Math.sin(ax);return[p[0]*d+p[2]*e,p[1],-p[0]*e+p[2]*d]}
function render(ctx,t){
 t=clamp(t,0,24);const W=1920,H=1080;ctx.clearRect(0,0,W,H);ctx.fillStyle='#101d26';ctx.fillRect(0,0,W,H);
 let bg=ctx.createRadialGradient(1020,420,30,960,540,1050);bg.addColorStop(0,'#263b45');bg.addColorStop(1,'#0c1720');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const open=ramp(t,3.5,8), wave=ramp(t,7,9)*(1-ramp(t,16,20)), resolve=ramp(t,16,21), pulse=Math.exp(-((t%.5)/.13));
 const yaw=mix(-.55,.28,ramp(t,0,8))+1.2*ramp(t,9,15)-.7*ramp(t,16,22), elev=.38+.20*Math.sin(t*.18), dist=mix(8.8,11.8,open)-.65*ramp(t,10,13)-2.5*resolve;
 const eye=[Math.sin(yaw)*dist,Math.sin(elev)*dist,Math.cos(yaw)*dist], forward=norm(scale(eye,-1)), right=norm(cross(forward,[0,1,0])), up=cross(right,forward);
 function project(p){let d=sub(p,eye),z=dot(d,forward);return [960+1260*dot(d,right)/z,540-1260*dot(d,up)/z,z]}
 function line(points,color,width=1){ctx.beginPath();points.forEach((v,i)=>{let q=project(v);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
 // Engraved stage, true perspective ground markings.
 ctx.globalAlpha=.23;for(let r of [2,4,6]){let pts=[];for(let j=0;j<=96;j++)pts.push([r*Math.cos(j*TAU/96),-2.15,r*Math.sin(j*TAU/96)]);line(pts,'#78929b',1)}ctx.globalAlpha=1;
 // One continuous sculptural transformation; no mesh intersections (ring separation > tube diameter).
 const centres=[];for(let i=0;i<13;i++){let u=(i-6)/6;let p0=[u*.12,0,u*2.5],p1=[u*5.1,Math.sin(u*3.4-t*TAU)*.85*wave,Math.cos(u*2.8-t*1.8)*.42*wave];let p=p0.map((v,k)=>mix(v,p1[k],open));let theta=i*TAU/13+t*.35;let p2=[Math.cos(theta)*2.05,Math.sin(theta)*2.05,0];p=p.map((v,k)=>mix(v,p2[k],resolve));centres.push(p)}
 // Thin 2D score stroke lifts into space and passes through actual ring centres.
 let trace=[];for(let j=0;j<centres.length;j++)trace.push(centres[j]);ctx.globalAlpha=.25+.4*wave;line(trace,'#65ded0',2.5);ctx.globalAlpha=1;
 const faces=[],light=norm([-3,6,5]);
 function mesh(verts,quads,color){let proj=verts.map(project);for(let f of quads){let a=verts[f[0]],b=verts[f[1]],c=verts[f[2]],n=norm(cross(sub(b,a),sub(c,a))),mid=scale(f.reduce((s,i)=>add(s,verts[i]),[0,0,0]),1/f.length);if(dot(n,sub(eye,mid))<=0)continue;let l=.24+.65*Math.max(0,dot(n,light))+.28*Math.pow(Math.max(0,dot(n,norm(add(norm(sub(eye,mid)),light)))),24);let shade=color.map(v=>Math.min(255,Math.round(v*l)));faces.push({p:f.map(i=>proj[i]),z:project(mid)[2],color:`rgb(${shade.join(',')})`})}}
 function torus(p,r,tube,az,ax,col){let vs=[],fs=[],N=48,M=10;for(let j=0;j<N;j++)for(let k=0;k<M;k++){let a=j*TAU/N,b=k*TAU/M;vs.push(add(p,rotate([(r+tube*Math.cos(b))*Math.cos(a),(r+tube*Math.cos(b))*Math.sin(a),tube*Math.sin(b)],az,ax)))}for(let j=0;j<N;j++)for(let k=0;k<M;k++)fs.push([j*M+k,((j+1)%N)*M+k,((j+1)%N)*M+(k+1)%M,j*M+(k+1)%M]);mesh(vs,fs,col)}
 for(let i=0;i<13;i++){let u=(i-6)/6;torus(centres[i],mix(.70,.36,resolve),.075+(i%3===0?.018:0),.15*Math.sin(t+u),mix(.12*Math.sin(t*.7+i*.3),Math.PI/2,open)*(1-resolve),i%3===1?[76,187,178]:[234,188,115]);}
 // Travelling brass bead: a real faceted sphere, inside the ring aperture rather than intersecting its rim.
 let idx=clamp((t-4)/12)*12,lo=Math.floor(idx),hi=Math.min(12,lo+1),bp=centres[lo].map((v,k)=>mix(v,centres[hi][k],idx-lo));let sphereV=[],sphereF=[];for(let j=0;j<=12;j++)for(let k=0;k<24;k++){let a=j*Math.PI/12,b=k*TAU/24;sphereV.push(add(bp,[.27*Math.sin(a)*Math.cos(b),.27*Math.cos(a),.27*Math.sin(a)*Math.sin(b)]))}for(let j=0;j<12;j++)for(let k=0;k<24;k++)sphereF.push(j===0?[j*24+k,(j+1)*24+(k+1)%24,(j+1)*24+k]:[j*24+k,j*24+(k+1)%24,(j+1)*24+(k+1)%24,(j+1)*24+k]);mesh(sphereV,sphereF,[255,232,184]);
 faces.sort((a,b)=>b.z-a.z);for(let f of faces){ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=f.color;ctx.lineWidth=.45;ctx.stroke()}
 // Rhythm annotation becomes an acoustic ripple on each primary beat.
 if(t>4&&t<20){let q=project(bp),r=(t%.5)*150;ctx.globalAlpha=(1-(t%.5)*2)*.45;ctx.strokeStyle='#e9c586';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(q[0],q[1],22+r,0,TAU);ctx.stroke();ctx.globalAlpha=1}
 // Sparse exhibition typography; no persistent HUD or subtitles.
 function text(s,x,y,size,font,col,alpha=1){ctx.globalAlpha=alpha;ctx.font=`${size}px ${font}`;ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.globalAlpha=1}
 let intro=1-ramp(t,3,4);if(intro>0){text('CLOCKWORK',135,180,66,'ClockSerif','#f2eadc',intro*ramp(t,.1,.9));text('TIDE',135,253,66,'ClockSerif','#f2eadc',intro*ramp(t,.4,1.2));text('A RHYTHM IN MOTION',140,302,20,'ClockMono','#b4c8cb',intro*ramp(t,1,1.7))}
 let end=ramp(t,20,21);if(end>0){text('Everything finds',126,832,57,'ClockSerif','#f2eadc',end);text('its rhythm.',126,901,57,'ClockSerif','#f2eadc',end);text('CLOCKWORK TIDE',131,947,20,'ClockMono','#8eafb6',end)}
 // Lower score only during expansion, graph line synchronized to spatial wave.
 let score=ramp(t,4,6)*(1-ramp(t,12.5,14.5));if(score>0){ctx.globalAlpha=score*.65;ctx.strokeStyle='#718e99';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(520,925);ctx.lineTo(1400,925);ctx.stroke();ctx.strokeStyle='#64cbbf';ctx.lineWidth=2;ctx.beginPath();for(let j=0;j<=200;j++){let x=520+j*4.4,y=925-Math.sin(j/200*TAU*2-t*TAU)*23*wave; j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();for(let j=0;j<17;j++){ctx.fillStyle=j===Math.floor(t*2)%17?'#f2d09a':'#526e78';ctx.fillRect(520+j*55,966,j===Math.floor(t*2)%17?5:2,7)}ctx.globalAlpha=1;}
}
root.ClockworkTide={render,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=root.ClockworkTide;
})(typeof window!=='undefined'?window:globalThis);
