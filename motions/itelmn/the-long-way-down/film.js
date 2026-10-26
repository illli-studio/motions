/* The Long Way Down. Original MIT-0 scene. Seek-pure Canvas software 3D. */
(function(root){'use strict';
const PI=Math.PI,W=1920,H=1080, C={bg:'#251b2b',stage:'#3b2a40',cream:'#eee2cc',mint:'#82e2bd',bronze:'#bc8050',quiet:'#b4a3b7'};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,u)=>a+(b-a)*u,sm=x=>{x=clamp(x);return x*x*(3-2*x)},seg=(t,a,b)=>sm((t-a)/(b-a));
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,k)=>a.map(x=>x*k),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),lerp=(a,b,u)=>a.map((x,i)=>mix(x,b[i],u));
const control=[[-6.8,5.55,-1.5],[-4.3,5.5,-1.5],[-2.3,4.8,-1.4],[.0,2.1,-1],[2.8,1.4,-.3],[4.25,1.16,1.6],[3.1,.94,3.55],[.5,.75,3.9],[-2.1,.58,2.9],[-4.2,.43,3.45],[-5.4,.35,4.6]];
function cat(v0,v1,v2,v3,t){return v1.map((_,i)=>.5*((2*v1[i])+(-v0[i]+v2[i])*t+(2*v0[i]-5*v1[i]+4*v2[i]-v3[i])*t*t+(-v0[i]+3*v1[i]-3*v2[i]+v3[i])*t*t*t));}
function raw(u){let x=clamp(u)*(control.length-1),i=Math.min(control.length-2,Math.floor(x));return cat(control[Math.max(0,i-1)],control[i],control[i+1],control[Math.min(control.length-1,i+2)],x-i)}
let arc=[{p:raw(0),s:0}];for(let i=1;i<=1000;i++){let p=raw(i/1000);arc.push({p,s:arc[i-1].s+Math.hypot(...sub(p,arc[i-1].p))});}const length=arc.at(-1).s;
function path(u){let target=clamp(u)*length,lo=0,hi=1000;while(hi-lo>1){let m=(lo+hi)>>1;if(arc[m].s<target)lo=m;else hi=m;}return lerp(arc[lo].p,arc[hi].p,(target-arc[lo].s)/(arc[hi].s-arc[lo].s));}
function frame(u){let p=path(u),t=norm(sub(path(Math.min(1,u+.001)),path(Math.max(0,u-.001)))),side=norm(cross(t,[0,1,0])),up=norm(cross(side,t));let bank=.42*Math.sin(PI*clamp((u-.4)/.32));if(u<.4||u>.72)bank=0;let right=add(mul(side,Math.cos(bank)),mul(up,Math.sin(bank)));return {p,t,side:right,up:norm(cross(right,t))};}
function progress(t){const k=[[0,.008],[2,.024],[4,.052],[6.6,.116],[8,.18],[10,.335],[12,.52],[14,.7],[16,.85],[17.7,.962],[18.6,1],[24,1]];for(let i=1;i<k.length;i++)if(t<=k[i][0]){let a=k[i-1],b=k[i],u=clamp((t-a[0])/(b[0]-a[0]));return mix(a[1],b[1],u);}return 1;}
function line(c,p,col,w=2){c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()}
function poly(c,p,col){c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=col;c.lineWidth=.45;c.stroke();}
function txt(c,s,x,y,n=24,col=C.cream,font='RunMono',alpha=1){c.save();c.globalAlpha*=alpha;c.fillStyle=col;c.font=n+'px '+font;c.fillText(s,x,y);c.restore();}
function shade(hex,k){return '#'+[1,3,5].map(i=>Math.round(clamp(parseInt(hex.slice(i,i+2),16)*k,0,255)).toString(16).padStart(2,'0')).join('')}
function view(t,b){let close=seg(t,2.8,6.5)*(1-seg(t,19.2,22.4)),tar=lerp([-.4,2.35,1.1],b,.84*close);let angle=mix(.55,.15,seg(t,8.5,20));let radius=mix(16.8,8.5,close),pos=add(tar,[Math.sin(angle)*radius,mix(8,4.4,close),Math.cos(angle)*radius]);let f=norm(sub(tar,pos)),r=norm(cross(f,[0,1,0])),up=cross(r,f);return {pos,P:p=>{let d=sub(p,pos),z=dot(d,f);return [1035+dot(d,r)*1370/z,500-dot(d,up)*1370/z,z]}};}
// Static track is editable 3D geometry: banked cross-section, tubular rail pair, plinths.
const staticFaces=[];function SF(p,col,lit=true){let n=norm(cross(sub(p[1],p[0]),sub(p[2],p[0]))),v=.58+.42*Math.abs(dot(n,norm([-.55,1,.7])));staticFaces.push({p,col:lit?shade(col,v):col});}
function box(x,y,z,w,h,d,col){let v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>[x+p[0]*w/2,y+p[1]*h/2,z+p[2]*d/2]);for(let ids of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])SF(ids.map(i=>v[i]),col);}
function tube(points,r,col,N=7){for(let i=0;i<points.length-1;i++){let t=norm(sub(points[Math.min(i+1,points.length-1)],points[Math.max(0,i-1)])),s=norm(cross(t,[0,1,0])),up=norm(cross(s,t));if(Math.hypot(...s)<.1)s=[1,0,0];for(let j=0;j<N;j++){let a=j*2*PI/N,b=(j+1)*2*PI/N,off=a=>add(mul(s,r*Math.cos(a)),mul(up,r*Math.sin(a)));SF([add(points[i],off(a)),add(points[i+1],off(a)),add(points[i+1],off(b)),add(points[i],off(b))],col);}}}
const N=190,sections=[];for(let i=0;i<=N;i++){let f=frame(i/N);sections.push([[-.5,.17],[-.35,-.035],[0,-.12],[.35,-.035],[.5,.17]].map(([x,y])=>add(f.p,add(mul(f.side,x),mul(f.up,y)))));};
for(let i=0;i<N;i++)for(let j=0;j<4;j++)SF([sections[i][j],sections[i+1][j],sections[i+1][j+1],sections[i][j+1]],j===0||j===3?'#d3bba3':C.cream);
for(let side of [0,4])tube(sections.map(x=>x[side]),.055,C.cream,6);
// Bronze cross-ties make the contour readable as a real structure.
for(let i=0;i<0;i++){let f=frame(i/36);tube([add(f.p,mul(f.side,-.49)),add(f.p,mul(f.side,.49))].map(p=>add(p,[0,-.19,0])),.035,C.bronze,5);}
let supportStart=staticFaces.length;const supports=[.015,.12,.225,.35,.475,.60,.74,.87,.97];
for(let u of supports){let f=frame(u),p=f.p,h=p[1]-.04;box(p[0],h/2-.09,p[2],.14,h,.18,C.bronze);box(p[0],-.15,p[2],.9,.16,.7,'#604153');}
for(let i=supportStart;i<staticFaces.length;i++)staticFaces[i].support=true;let floorStart=staticFaces.length;box(-1.0,-.42,1.5,15,.35,8.3,C.stage);for(let i=floorStart;i<staticFaces.length;i++)staticFaces[i].floor=true;
// Bell frame fixed to the end of the track.
const end=path(1),bell=add(end,add(mul(frame(1).t,.72),[0,.24,0]));box(bell[0],1.15,bell[2]+.48,.09,2.5,.09,C.bronze);box(bell[0],2.37,bell[2]+.2,.09,.08,.65,C.bronze);box(bell[0],(2.34+bell[1]+.75)/2,bell[2],.025,2.34-bell[1]-.75,.025,C.bronze);
function render(c,t){t=clamp(t,0,24);c.resetTransform();c.globalAlpha=1;c.clearRect(0,0,W,H);c.fillStyle=C.bg;c.fillRect(0,0,W,H);
// Localised stage ambience, no full-screen gradient.
let glow=c.createRadialGradient(1160,620,50,1160,620,920);glow.addColorStop(0,'rgba(132,85,119,.17)');glow.addColorStop(1,'rgba(37,27,43,0)');c.fillStyle=glow;c.fillRect(180,0,1740,1080);
let u=progress(t),f=frame(u),ball=add(f.p,mul(f.up,.24)),cam=view(t,ball),P=cam.P,queue=[];
function face(p,col){let q=p.map(P);if(q.some(x=>x[2]<.5))return;queue.push({p:q,col,z:q.reduce((s,x)=>s+x[2],0)/q.length});}
for(let x of staticFaces){face(x.p,x.col);if(x.floor)queue.at(-1).floor=true;if(x.support)queue.at(-1).support=true;}
// Bell: revolved brass shell, visibly swinging at contact (18.6 s).
let ring=Math.max(0,t-18.6),swing=t>=18.6?.13*Math.sin(ring*21)*Math.exp(-ring*.95):0;
function BP(v){let pivot=add(bell,[0,.9,0]),p=add(bell,v),d=sub(p,pivot);return add(pivot,[d[0]*Math.cos(swing)-d[1]*Math.sin(swing),d[0]*Math.sin(swing)+d[1]*Math.cos(swing),d[2]]);}
const profile=[[0,.75],[.12,.71],[.21,.56],[.29,.26],[.4,.05],[.43,0],[.38,-.06]];
for(let i=0;i<profile.length-1;i++)for(let j=0;j<40;j++){let a=j*2*PI/40,b=(j+1)*2*PI/40,p=(v,a)=>BP([v[0]*Math.cos(a),v[1],v[0]*Math.sin(a)]);face([p(profile[i],a),p(profile[i],b),p(profile[i+1],b),p(profile[i+1],a)],shade(C.bronze,.61+.52*Math.max(0,Math.cos(a-2))));}
// Marble is a lit, rotating triangle mesh, not an image or screen-space circle.
let rot=u*length/.3,r=.315;const sphere=(lat,lon)=>{let a=lat*PI/18,b=lon*2*PI/36,point=[r*Math.sin(a)*Math.cos(b),r*Math.cos(a),r*Math.sin(a)*Math.sin(b)];let yy=point[1]*Math.cos(rot)-point[2]*Math.sin(rot),zz=point[1]*Math.sin(rot)+point[2]*Math.cos(rot);return add(ball,[point[0],yy,zz]);};
for(let i=0;i<18;i++)for(let j=0;j<36;j++){let p=[sphere(i,j),sphere(i+1,j),sphere(i+1,j+1),sphere(i,j+1)],n=norm(sub(p.reduce((s,q)=>add(s,q),[0,0,0]).map(x=>x/4),ball));let lit=.38+.55*Math.max(0,dot(n,norm([-.5,1,.8]))),spec=Math.pow(Math.max(0,dot(n,norm(add(norm(sub(cam.pos,ball)),norm([-.5,1,.8]))))),30);let color=(j%12<2?'#326d65':C.mint);face(p,shade(color,lit+.8*spec));}
queue.sort((a,b)=>(a.floor?0:a.support?1:2)-(b.floor?0:b.support?1:2)||b.z-a.z);c.save();c.globalAlpha=seg(t,.1,1.1);for(let x of queue)poly(c,x.p,x.col);c.restore();
// Geometry-anchored vector annotations, restrained enough to retain the sculpture.
let pa=P(ball),pb=P(add(ball,[0,-1.3,0])),annot=seg(t,4.3,5.2)*(1-seg(t,17.2,18));if(annot>0){c.save();c.globalAlpha=annot*.88;let x=pa[0]+100,y=pa[1];line(c,[[x,y],[x,pb[1]]],C.mint,2);poly(c,[[x,pb[1]+8],[x-6,pb[1]-5],[x+6,pb[1]-5]],C.mint);txt(c,'g',x+15,(y+pb[1])/2+8,26,C.mint,'RunSerif');line(c,[[pa[0]+36,pa[1]],[x-13,pa[1]]],'rgba(130,226,189,.36)',1);c.restore();}
// Motion trace is 3D-projected and includes only positions already traversed.
if(t>6.6&&t<18.6){let tr=[];for(let k=0;k<20;k++){let uu=Math.max(0,u-.065+k*.065/19),ff=frame(uu);tr.push(P(add(ff.p,mul(ff.up,.3))));}c.save();c.globalAlpha=.32;line(c,tr,C.mint,2);c.restore();}
let intro=1-seg(t,3.8,5.4);txt(c,'THE LONG',108,225+24*(1-seg(t,.2,1)),86,C.cream,'RunSerif',intro*seg(t,.2,1));txt(c,'WAY DOWN',108,321+20*(1-seg(t,.45,1.5)),86,C.cream,'RunSerif',intro*seg(t,.45,1.5));txt(c,'A STUDY IN STORED POSSIBILITY',114,382,22,C.mint,'RunMono',intro*seg(t,.9,1.8));
// Editorial frame and route diagram are independent 2D geometry.
c.fillStyle=C.bg;c.fillRect(0,0,W,125);c.fillRect(0,925,W,155);c.fillRect(1440,890,450,160);
txt(c,'GRAVITY STUDIES / 001',110,87,21,C.quiet,'RunMono',seg(t,.2,1.0));line(c,[[110,113],[1810,113]],'#6c526d',1);txt(c,'ORIGINAL MOTION + SOUND',1470,87,18,C.quiet,'RunMono',seg(t,.5,1.2));
let stage=t<6.6?'01  /  THE CREST':t<12.5?'02  /  THE DROP':t<18.6?'03  /  THE BANK':'04  /  RESONANCE';txt(c,stage,110,966,25,C.cream,'RunMono',seg(t,.8,1.6));txt(c,t<6.6?'Almost still.':t<12.5?'Height becomes motion.':t<18.6?'The long way is the point.':'One small arrival.',110,1014,24,C.quiet,'RunSerif',seg(t,1,2));
let dx=1470,dy=910,dw=340,dh=70,route=[];for(let i=0;i<=100;i++){let p=path(i/100);route.push([dx+(p[0]+7)/12*dw,dy+(p[2]+1.5)/6.3*dh]);}line(c,route,'#735b77',2);let done=[];for(let i=0;i<=Math.ceil(u*100);i++){let p=path(Math.min(u,i/100));done.push([dx+(p[0]+7)/12*dw,dy+(p[2]+1.5)/6.3*dh]);}line(c,done,C.mint,3);let q=done.at(-1);c.fillStyle=C.mint;c.beginPath();c.arc(q[0],q[1],5,0,2*PI);c.fill();txt(c,'PATH  '+Math.round(u*100).toString().padStart(3,'0')+'%',1470,1020,21,C.quiet);
if(t>=18.6){let a=seg(t,20.5,21.5),ripple=ring*100;for(let k=0;k<3;k++){let rr=(ripple-k*48);if(rr>0&&rr<260){let pp=P(bell);c.save();c.globalAlpha=(1-rr/260)*.45;c.strokeStyle=C.mint;c.lineWidth=1.3;c.beginPath();c.ellipse(pp[0],pp[1],rr,rr*.72,0,0,PI*2);c.stroke();c.restore();}}txt(c,'Worth the wait.',110,230,64,C.cream,'RunSerif',a);txt(c,'THE LONG WAY DOWN',114,290,24,C.mint,'RunMono',a);}
// Small score strip moves for the entire film, with a precise bell transient.
let pulse=.2+.13*Math.sin(t*PI*4),hit=Math.exp(-Math.pow((t-18.6)/.11,2));for(let i=0;i<30;i++){let h=5+12*Math.abs(Math.sin(i*1.4+t*3))*pulse+hit*30*Math.exp(-Math.pow((i-15)/10,2));line(c,[[1220+i*5,1009-h],[1220+i*5,1009+h]],i%3?C.bronze:C.mint,2);}
}
const api={render,progress,path,duration:24,width:W,height:H,trackLength:length};if(typeof module!=='undefined')module.exports=api;root.MarbleRun=api;
})(typeof globalThis!=='undefined'?globalThis:this);
