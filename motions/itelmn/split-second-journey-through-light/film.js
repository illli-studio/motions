/* Split Second — original deterministic geometric animation. MIT-0. */
(function(root){'use strict';
const W=1920,H=1080,PI=Math.PI, colors=['#ef625d','#ed9355','#e3bf54','#79b585','#53b4c7','#638acb','#8d77ce'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t, smooth=v=>{v=clamp(v);return v*v*(3-2*v)},seg=(t,a,b)=>smooth((t-a)/(b-a));
const spectrum=u=>{let z=clamp(u)*6,i=Math.min(5,Math.floor(z)),f=z-i,a=colors[i],b=colors[i+1];return '#'+[1,3,5].map(k=>Math.round(mix(parseInt(a.slice(k,k+2),16),parseInt(b.slice(k,k+2),16),f)).toString(16).padStart(2,'0')).join('')};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{let n=Math.hypot(...a);return a.map(v=>v/n)},lerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
function camera(t){let k=[
[0,[.1,.2,12],[0,0,0],1250],
[4,[.1,.2,12],[0,0,0],1250],
[7,[2.9,2.2,8],[.4,0,0],1500],
[10,[2.8,1.7,11],[1.1,0,0],1350],
[11.7,[2.8,1.7,11],[1.1,0,0],1350],
[13.2,[5.8,.6,3.8],[4.6,-1.1,0],1400],
[16.5,[8.5,.3,4],[7,-1.6,0],1410],
[19.5,[4.7,3.1,12],[1.6,0,0],1320],
[24,[4.7,3.1,12],[1.6,0,0],1320]];
let a=k[0],b=k[1];for(let i=1;i<k.length;i++){if(t<=k[i][0]){a=k[i-1];b=k[i];break}}let u=seg(t,a[0],b[0]),pos=lerp(a[1],b[1],u),target=lerp(a[2],b[2],u),f=norm(sub(target,pos)),r=norm(cross(f,[0,1,0])),up=cross(r,f),focal=mix(a[3],b[3],u);return p=>{let d=sub(p,pos),z=dot(d,f);return [960+dot(d,r)*focal/z,610-dot(d,up)*focal/z,z]};}
function line(c,pts,color,width=2,alpha=1){if(!pts.length)return;c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.restore()}
function text(c,s,x,y,size=24,color='#183b49',font='PrismMono',alpha=1){c.save();c.globalAlpha*=alpha;c.fillStyle=color;c.font=`${size}px ${font}`;c.fillText(s,x,y);c.restore()}
function label(c,s,x,y,a=1){text(c,s,x,y,23,'#365762','PrismMono',a)}
function polygon(c,pts,fill,stroke,alpha=1){c.save();c.globalAlpha*=alpha;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke()}c.restore()}
function pathReveal(c,pts,u,col,w,a=1){let n=Math.max(1,Math.floor((pts.length-1)*clamp(u))),arr=pts.slice(0,n);if(n<pts.length){let f=(pts.length-1)*clamp(u)-(n-1);arr.push(lerp(pts[n-1],pts[n],clamp(f)))}line(c,arr,col,w,a)}
function diagram(c,t){let a=1-seg(t,3.8,4.7);if(a<=0)return;c.save();c.globalAlpha=a;let u=seg(t,.2,1.3);text(c,'A spectrum,',138,224,91,'#183b49','PrismSerif',u);text(c,'hidden in plain light.',138,330,74,'#183b49','PrismSerif',u);label(c,'01  /  WHITE LIGHT',145,404,seg(t,.7,1.5));
let tri=[[1000,460],[827,760],[1173,760],[1000,460]];pathReveal(c,tri,seg(t,1.2,2.7),'#456570',2.5);pathReveal(c,[[140,640],[896.2,640],[1115.47,660]],seg(t,.8,3.3),'#789098',3);let p=seg(t,2.8,3.5);for(let j=0;j<49;j++)polygon(c,[[1115.47,660],[mix(1115.47,1670,p),mix(660,690+j*2.6,p)],[mix(1115.47,1670,p),mix(660,690+(j+1)*2.6,p)]],spectrum(j/48),null,seg(t,2.8,3.5));
label(c,'GLASS',935,833,seg(t,2.3,3.3));label(c,'ONE BEAM. MANY COLOURS.',139,928,seg(t,2.7,3.5));c.restore()}
function render(c,t){t=clamp(t,0,24);c.resetTransform();c.clearRect(0,0,W,H);let dark=seg(t,5.6,6.8)*(1-seg(t,18.4,20));c.fillStyle=`rgb(${mix(243,20,dark)},${mix(239,26,dark)},${mix(230,43,dark)})`;c.fillRect(0,0,W,H);let ink=dark>.55?'#e9edf0':'#183b49',muted=`rgb(${mix(84,180,dark)},${mix(113,197,dark)},${mix(122,207,dark)})`;
// Registration marks are sparse print details, not a dashboard.
line(c,[[90,102],[140,102]],'#879a9f',1);line(c,[[1780,978],[1830,978]],'#879a9f',1);text(c,'SPLIT SECOND / OPTICAL STUDY',145,110,20,muted,'PrismMono',.95);text(c,'STYLISED VISUALISATION · NOT A PHYSICAL SIMULATION',145,1010,18,muted,'PrismMono',.95);
let vis=seg(t,3.6,4.6);if(vis>0){c.save();c.globalAlpha=vis;let P=camera(t),extrude=seg(t,4.1,6.3),rot=mix(0,-.12,seg(t,4,8));let transform=p=>[p[0]*Math.cos(rot)+p[2]*Math.sin(rot),p[1],-p[0]*Math.sin(rot)+p[2]*Math.cos(rot)];
let verts=[[-1.4,-1,-.85*extrude],[1.4,-1,-.85*extrude],[0,1.5,-.85*extrude],[-1.4,-1,.85*extrude],[1.4,-1,.85*extrude],[0,1.5,.85*extrude]].map(transform);
// Quiet contact shadow and base, drawn before elevated geometry.
let sh=P([0,-1.13,0]);c.save();c.translate(sh[0],sh[1]);c.scale(1,.23);let grad=c.createRadialGradient(0,0,5,0,0,210);grad.addColorStop(0,'rgba(22,59,73,.18)');grad.addColorStop(1,'rgba(22,59,73,0)');c.fillStyle=grad;c.beginPath();c.arc(0,0,210,0,PI*2);c.fill();c.restore();
let base=[[-1.8,-1.12,-1.2],[1.8,-1.12,-1.2],[1.8,-1.12,1.2],[-1.8,-1.12,1.2]].map(P);polygon(c,base,`rgb(${mix(216,37,dark)},${mix(222,51,dark)},${mix(217,65,dark)})`,muted,.85);
// Back edges visible through the glass. Faces are genuine projected triangle/quads.
let faces=[[0,1,2],[3,5,4],[0,3,4,1],[1,4,5,2],[2,5,3,0]].map((ids,i)=>({ids,i,z:ids.reduce((s,n)=>s+P(verts[n])[2],0)/ids.length})).sort((a,b)=>b.z-a.z);
for(let f of faces){let a=verts[f.ids[0]],b=verts[f.ids[1]],d=verts[f.ids[2]],n=norm(cross(sub(b,a),sub(d,a))),lit=Math.abs(dot(n,norm([-.6,.9,1]))),g=Math.floor(175+lit*35);polygon(c,f.ids.map(i=>P(verts[i])),`rgba(${g-30},${g+20},${g+26},.31)`,'rgba(59,112,126,.5)');}
// Fine cut bevels on the triangular facets, rather than a flat triangle icon.
for(let side of [0,3]){let v=verts.slice(side,side+3),cen=v.reduce((s,p)=>add(s,p),[0,0,0]).map(v=>v/3);line(c,[...v.map(p=>P(lerp(cen,p,.95))),P(lerp(cen,v[0],.95))],'rgba(255,255,255,.8)',1.8);}
let pIn=transform([-.7,.25,0]),pOut=transform([.784,.1,0]),beam=seg(t,6.6,8.1);let source=transform([-6,.25,0]),inc=lerp(source,pIn,beam);line(c,[P(source),P(inc)],'#a3b4b6',10,.24);line(c,[P(source),P(inc)],'#ffffff',4,1);if(t>7.5){line(c,[P(pIn),P(lerp(pIn,pOut,seg(t,7.5,8.1)))],'#ffffff',5,.9)}
// In the stylised ribbon passage the path becomes a graphic sculpture, not a ray equation.
let unfold=seg(t,8,10.5),ribbon=seg(t,11.2,13),settle=seg(t,17,19.5),width=mix(.012,.075,ribbon)*(1-.5*settle),paths=[];
for(let j=0;j<49;j++){let v=j/48,pts=[],lower=[],upper=[],ex=.784+v*.0224,ey=.1-v*.04;let exit=transform([ex,ey,0]);
if(t>7.5){let entry=P(pIn),out=P(lerp(pIn,exit,seg(t,7.5,8.1)));line(c,[entry,out],spectrum(v),1.6,.45)}
for(let k=0;k<=100;k++){let u=k/100,x=mix(ex,8.2,u),spread=ey-(.16+v*.24)*(x-ex),wave=Math.sin(u*PI*1.35+t*.8+v*.8)*.38*ribbon*smooth(u*3)*(1-.8*settle);let y=spread+wave,z=Math.sin(u*PI)*(Math.sin(v*PI)*.75)*ribbon;let half=((x-ex)*.30/48/2+.003)*(1+ribbon*1.5),p=transform([x,y,z]);pts.push(P(p));lower.push(P(transform([x,y-half,z])));upper.push(P(transform([x,y+half,z])));}
let count=Math.max(1,Math.floor(unfold*101));paths.push({j,pts:pts.slice(0,count),lower:lower.slice(0,count),upper:upper.slice(0,count),z:pts[50][2]});}
paths.sort((a,b)=>b.z-a.z);for(let q of paths){if(q.pts.length<2)continue;let col=spectrum(q.j/48);polygon(c,q.upper.concat([...q.lower].reverse()),col,null,.93);if(q.j===0||q.j===48)line(c,q.pts,col,2,.96);}
// Small glints mark a stylised travelling accent, not a photon speed measurement.
if(t>8&&t<19.5)for(let j of [0,8,16,24,32,40,48]){let q=paths.find(p=>p.j===j),u=((t-8)*.35+j*.004)%1,i=Math.floor(u*(q.pts.length-1));if(i>0&&i<q.pts.length){let pt=q.pts[i];c.fillStyle='#ffffff';c.beginPath();c.arc(pt[0],pt[1],2.7,0,PI*2);c.fill();}}
let flare= Math.exp(-Math.pow((t-8.1)/.22,2));if(flare>.01){let p=P(pOut),g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],130);g.addColorStop(0,`rgba(255,255,255,${flare})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(p[0]-130,p[1]-130,260,260)}
// Callouts remain outside the solid and optically busy region.
let lab=seg(t,4.6,5.3)*(1-seg(t,10.5,11));text(c,'02  /  GLASS REVEALS THE DIFFERENCE',145,205,23,ink,'PrismMono',lab);if(t<11.7){let p=P([0,1.5,0]);line(c,[[p[0],p[1]-18],[p[0]+60,p[1]-90],[p[0]+195,p[1]-90]],'#7b969d',1.3,lab);text(c,'PRISM',p[0]+75,p[1]-105,23,muted,'PrismMono',lab);}
let macro=seg(t,10.9,11.5)*(1-seg(t,11.9,12.3));text(c,'03  /  FOLLOW THE SPECTRUM',145,205,23,ink,'PrismMono',macro);text(c,'Different colours.',145,305,64,ink,'PrismSerif',macro);text(c,'Different paths.',145,384,64,ink,'PrismSerif',macro);
let end=seg(t,19.3,20.2);text(c,'Split Second',145,236,100,'#183b49','PrismSerif',end);label(c,'A JOURNEY THROUGH LIGHT',151,299,end);label(c,'ONE BEAM. A WORLD OF COLOUR.',151,917,end);c.restore();}
diagram(c,t);
}
const api={render,duration:24,width:W,height:H};if(typeof module!=='undefined')module.exports=api;root.PrismLight=api;
})(typeof globalThis!=='undefined'?globalThis:this);
