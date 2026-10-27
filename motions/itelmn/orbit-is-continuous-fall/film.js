(function(root){'use strict';
const W=1920,H=1080,D=28,PI=Math.PI,TAU=2*PI;
const C={bg:'#06131F',ink:'#F0F8FA',muted:'#A5BCC8',cyan:'#5DE0E6',warm:'#FFBD7A',ocean:'#174B64',land:'#397D85',line:'#244455'};
const E=230,R=390,OMEGA=.14,PHASE=2.0,INC=.29,EPOCH=10;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a),norm=a=>mul(a,1/len(a));
const U=[1,0,0],V=[0,Math.cos(INC),Math.sin(INC)],N=[0,-Math.sin(INC),Math.cos(INC)];
const theta=t=>PHASE-OMEGA*t;
const radial=t=>add(mul(U,Math.cos(theta(t))),mul(V,Math.sin(theta(t))));
const tangent=t=>add(mul(U,Math.sin(theta(t))),mul(V,-Math.cos(theta(t))));
const position=t=>mul(radial(t),R),velocity=t=>mul(tangent(t),R*OMEGA),acceleration=t=>mul(position(t),-OMEGA*OMEGA);
const noGravityPosition=t=>add(position(EPOCH),mul(velocity(EPOCH),t-EPOCH));
function color(h,k){return '#'+h.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*k))).toString(16).padStart(2,'0')).join('')}
function text(c,s,x,y,size=32,col=C.ink,weight=500){c.font=`${weight} ${size}px OrbitSans,sans-serif`;c.textBaseline='alphabetic';c.fillStyle=col;c.fillText(s,x,y)}
function line(c,a,b,col,w=2){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function polygon(c,p,col,stroke){c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.8;c.stroke()}}
function disc(c,p,r,col){c.beginPath();c.arc(p[0],p[1],r,0,TAU);c.fillStyle=col;c.fill()}
function arrow(c,a,b,col,w=4,head=15){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d;line(c,a,[b[0]-ux*head*.55,b[1]-uy*head*.55],col,w);polygon(c,[b,[b[0]-ux*head-uy*head*.5,b[1]-uy*head+ux*head*.5],[b[0]-ux*head+uy*head*.5,b[1]-uy*head-ux*head*.5]],col)}
function camera(t){
 const close=ease((t-5.4)/3.0),pull=ease((t-14.9)/3.1),wide=ease((t-21.0)/2.6);
 let scale=mix(1.08,2.12,close),cx=mix(1260,910,close),cy=mix(595,1290,close);
 scale=mix(scale,1.36,pull);cx=mix(cx,1230,pull);cy=mix(cy,666,pull);
 scale=mix(scale,1.08,wide);cx=mix(cx,640,wide);cy=mix(cy,595,wide);
 const beta=(theta(Math.min(t,EPOCH))-PI/2)*close,el=mix(.42,.31,close);
 const right=add(mul(U,Math.cos(beta)),mul(V,Math.sin(beta)));
 const up=add(add(mul(U,-Math.sin(beta)*Math.cos(el)),mul(V,Math.cos(beta)*Math.cos(el))),mul(N,Math.sin(el)));
 const depth=add(add(mul(U,Math.sin(beta)*Math.sin(el)),mul(V,-Math.cos(beta)*Math.sin(el))),mul(N,Math.cos(el)));
 const project=p=>[cx+scale*dot(p,right),cy-scale*dot(p,up),dot(p,depth)];
 return {cx,cy,scale,beta,el,right,up,depth,project};
}
// Hand-drawn schematic continent boundaries. Geometry is an actual spherical mesh.
const continents=[
 [[-168,70],[-145,72],[-126,56],[-128,45],[-115,31],[-103,22],[-85,10],[-78,9],[-83,22],[-66,46],[-53,52],[-61,63],[-88,73]],
 [[-81,12],[-63,10],[-48,-2],[-36,-8],[-42,-22],[-54,-37],[-68,-55],[-75,-38],[-80,-12]],
 [[-18,34],[1,37],[20,32],[36,31],[51,11],[42,-13],[30,-34],[18,-35],[8,-20],[-5,1],[-17,15]],
 [[-11,36],[-9,58],[10,71],[34,69],[53,56],[74,73],[105,77],[142,66],[174,52],[151,45],[140,33],[124,19],[106,5],[94,17],[78,9],[66,24],[48,30],[38,43],[20,42]],
 [[112,-12],[130,-10],[152,-24],[146,-39],[117,-35]],
 [[-52,60],[-43,61],[-24,76],[-41,83],[-62,76]],
 [[45,-13],[50,-16],[49,-26],[44,-24]]
];
function inside(x,y,p){let k=false;for(let i=0,j=p.length-1;i<p.length;j=i++){if(((p[i][1]>y)!==(p[j][1]>y))&&(x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0]))k=!k}return k}
function globePoint(lat,lon,r=E){return[r*Math.cos(lat)*Math.cos(lon),r*Math.sin(lat),r*Math.cos(lat)*Math.sin(lon)]}
const earthFaces=[];
for(let i=0;i<36;i++)for(let j=0;j<72;j++){
 const a=-PI/2+i*PI/36,b=-PI+j*TAU/72,a2=a+PI/36,b2=b+TAU/72,n=globePoint((a+a2)/2,(b+b2)/2,1);
 const lng=((b+b2)/2)*180/PI,lat=((a+a2)/2)*180/PI,land=continents.some(p=>inside(lng,lat,p)),polar=lat<-72||lat>80;
 const light=.39+.68*Math.max(0,dot(n,norm([-.7,.8,.85]))),base=polar?'#A2C6CD':land?C.land:C.ocean;
 earthFaces.push({p:[globePoint(a,b),globePoint(a2,b),globePoint(a2,b2),globePoint(a,b2)],n,col:color(base,light)});
}
function globe(c,cam){const P=cam.project,r=E*cam.scale,cp=P([0,0,0]);c.save();const g=c.createRadialGradient(cp[0],cp[1],r*.94,cp[0],cp[1],r*1.13);g.addColorStop(0,'rgba(70,174,211,0)');g.addColorStop(.44,'rgba(70,174,211,.18)');g.addColorStop(1,'rgba(70,174,211,0)');c.fillStyle=g;c.beginPath();c.arc(cp[0],cp[1],r*1.13,0,TAU);c.fill();c.restore();
 earthFaces.filter(f=>dot(f.n,cam.depth)>-.06).map(f=>({p:f.p.map(P),col:f.col,z:dot(f.n,cam.depth)})).sort((a,b)=>a.z-b.z).forEach(f=>polygon(c,f.p,f.col,f.col));
 c.save();c.strokeStyle='rgba(145,211,224,.14)';c.lineWidth=1.1;
 function curve(points){c.beginPath();let on=false;points.forEach(p=>{const v=P(p);if(dot(p,cam.depth)>2){on?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]);on=true}else on=false});c.stroke()}
 for(let lat=-60;lat<=60;lat+=30)curve(Array.from({length:145},(_,i)=>globePoint(lat*PI/180,i*TAU/144,E+1)));
 for(let lon=0;lon<180;lon+=30)curve(Array.from({length:145},(_,i)=>{const a=i*TAU/144,l=lon*PI/180;return[(E+1)*Math.cos(a)*Math.cos(l),(E+1)*Math.sin(a),(E+1)*Math.cos(a)*Math.sin(l)]}));
 c.strokeStyle='rgba(120,216,239,.42)';c.lineWidth=2.1;c.beginPath();c.arc(cp[0],cp[1],r,0,TAU);c.stroke();c.restore();
}
function orbitPath(c,cam,t,back){const P=cam.project;c.save();c.lineWidth=2;c.strokeStyle=back?'rgba(127,184,202,.16)':'rgba(127,184,202,.30)';c.beginPath();let on=false;for(let i=0;i<=240;i++){const a=i*TAU/240,p=mul(add(mul(U,Math.cos(a)),mul(V,Math.sin(a))),R),q=P(p),isBack=q[2]<0;if(isBack===back){on?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);on=true}else on=false}c.stroke();c.restore()}
function segment(c,cam,t0,t1,col,w=4){c.beginPath();for(let i=0;i<=100;i++){const p=cam.project(position(mix(t0,t1,i/100)));i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function addBox(mesh,center,axes,dims,col){const ps=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(a=>a.reduce((p,v,i)=>add(p,mul(axes[i],v*dims[i]/2)),center));const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]];faces.forEach((f,i)=>mesh.push({p:f.map(j=>ps[j]),col:color(col,[.62,.94,.77,1.08,.83,.72][i])}))}
function satellite(c,cam,t,alpha=1){const p=position(t),T=tangent(t),A=radial(t),axes=[T,A,N],m=[],loc=(x,y,z)=>add(add(add(p,mul(T,x)),mul(A,y)),mul(N,z));
 addBox(m,p,axes,[29,30,34],'#CCD8D9');addBox(m,loc(0,-1,18),axes,[24,23,3],'#C69B5F');
 addBox(m,loc(0,0,0),axes,[133,4,5],'#91ADB8');
 for(const s of[-1,1]){addBox(m,loc(s*51,1,0),axes,[55,4,61],'#2B5D7D');
  for(let x=0;x<4;x++)for(let z=0;z<4;z++)addBox(m,loc(s*51-25+x*13,3.3,-27+z*15),axes,[11.3,.55,13.2],(x+z)%2?'#18466D':'#1E5279');}
 addBox(m,loc(0,28,0),axes,[3,28,3],'#BCCBD0');
 // A small faceted paraboloid communication dish in true xyz.
 for(let j=0;j<16;j++){const a=j*TAU/16,b=(j+1)*TAU/16;m.push({p:[loc(0,38,0),loc(11*Math.cos(a),43,11*Math.sin(a)),loc(11*Math.cos(b),43,11*Math.sin(b))],col:color('#E3DDC9',.71+.24*Math.cos(a))})}
 c.save();c.globalAlpha*=alpha;m.map(f=>({p:f.p.map(cam.project),col:f.col,z:f.p.reduce((s,q)=>s+dot(q,cam.depth),0)/f.p.length})).sort((a,b)=>a.z-b.z).forEach(f=>polygon(c,f.p,f.col,'rgba(7,20,31,.35)'));c.restore();return cam.project(p);
}
function origin(c,p){disc(c,p,6,C.bg);c.beginPath();c.arc(p[0],p[1],6,0,TAU);c.strokeStyle=C.ink;c.lineWidth=2;c.stroke()}
function mechanismVectors(c,cam,t,alpha){if(alpha<=0)return;c.save();c.globalAlpha=alpha;const p=position(t),q=cam.project(p),v=cam.project(add(p,mul(tangent(t),142))),g=cam.project(add(p,mul(radial(t),-125)));
 arrow(c,q,v,C.cyan,4.5,17);arrow(c,q,g,C.warm,4.5,17);origin(c,q);
 text(c,'速度方向',v[0]+23,v[1]+7,31,C.cyan,600);text(c,'沿切线',v[0]+23,v[1]+47,25,C.muted);
 text(c,'引力',g[0]-80,g[1]+15,33,C.warm,600);text(c,'指向地心',g[0]-80,g[1]+56,26,C.muted);c.restore();
}
function counterfactual(c,cam,t){const a=ease((t-10.2)/.6)*(1-ease((t-14.6)/.4));if(a<=0)return;const start=cam.project(position(EPOCH)),end=cam.project(noGravityPosition(18)),ghost=cam.project(noGravityPosition(t));c.save();c.globalAlpha=a;c.setLineDash([11,11]);line(c,start,end,'rgba(193,213,222,.70)',2.5);c.setLineDash([]);c.strokeStyle=C.muted;c.lineWidth=2.5;c.beginPath();c.arc(ghost[0],ghost[1],10,0,TAU);c.stroke();text(c,'假如没有引力：沿切线',1010,421,30,C.muted,500);
 segment(c,cam,EPOCH,t,C.cyan,5);const q=cam.project(position(t));const g=cam.project(add(position(t),mul(radial(t),-90)));arrow(c,q,g,C.warm,4,15);origin(c,q);text(c,'有引力：轨迹弯曲',1010,897,31,C.cyan,600);line(c,[1020,858],[q[0]-24,q[1]+47],'rgba(93,224,230,.45)',1.5);c.restore()}
function fallTrace(c,cam,t){const a=ease((t-16.2)/.8)*(1-ease((t-22.1)/.7));if(a<=0)return;c.save();c.globalAlpha=a;segment(c,cam,t-10,t,C.cyan,4);for(let j=1;j<=3;j++){const tt=t-j*2.8,p=position(tt),q=cam.project(p),end=cam.project(mul(p,.72));c.globalAlpha=a*(1-j*.15);disc(c,q,6,C.cyan);arrow(c,q,end,C.warm,3,12)}c.globalAlpha=a;const p=position(t),q=cam.project(p),end=cam.project(mul(p,.72));arrow(c,q,end,C.warm,4.5,16);origin(c,q);c.restore()}
const copy=[
 {start:0,end:6.2,title:['卫星为什么','不会掉下来？'],sub:['它并没有摆脱引力。'],x:86,y:604},
 {start:6.2,end:10.2,title:['先看两个方向。'],sub:['速度沿切线；引力指向地心。'],x:635,y:206},
 {start:10.2,end:15.4,title:['假如引力消失，','它会沿切线前进。'],sub:['本模型忽略其他力；引力让速度方向不断改变。'],x:506,y:155},
 {start:15.4,end:22.3,title:['下落的方向，','一直在转。'],sub:['每一刻，引力都指向地心。'],x:86,y:280},
 {start:23.1,end:28.1,title:['一直在下落，','却不断错过地面。'],sub:['侧向速度让它前进；','引力让它转弯。'],x:1110,y:354}
];
function typography(c,t){for(const s of copy){const fade=ease((t-s.start)/.55)*(1-ease((t-(s.end-.35))/.35));if(fade<=0)continue;c.save();c.globalAlpha=fade;const enter=(1-ease((t-s.start)/.7))*18;const headline=s.start===10.2?62:s.start===23.1?65:70;s.title.forEach((v,i)=>text(c,v,s.x,s.y+i*99+enter,headline,s.start===23.1&&i===1?C.cyan:C.ink,600));let sy=s.y+(s.title.length-1)*99+97;s.sub.forEach((v,i)=>text(c,v,s.x+4,sy+i*47+enter,32,C.muted));
 if(s.start===0){line(c,[90,298],[180,298],C.cyan,3);text(c,'轨道，是持续的自由下落。',90,350,31,C.cyan,500)}
 if(s.start===15.4){text(c,'不是逃离重力，',90,615,29,C.muted);text(c,'而是在重力中前进。',90,663,32,C.cyan)}
 if(s.start===23.1){line(c,[1114,708],[1212,708],C.cyan,3);text(c,'圆轨道上，高度不变，',1114,767,29,C.muted);text(c,'速度方向却不断改变。',1114,810,29,C.muted)}
 c.restore();}}
function background(c,t){c.fillStyle=C.bg;c.fillRect(0,0,W,H);for(let i=0;i<74;i++){const x=72+(i*643%1780),y=116+(i*379%814),a=.10+(i%5)*.035;disc(c,[x,y],i%7===0?1.8:1,'rgba(172,216,232,'+a+')')}}
function render(c,time){const t=Math.max(0,Math.min(D,time)),cam=camera(t);c.save();background(c,t);orbitPath(c,cam,t,true);globe(c,cam);orbitPath(c,cam,t,false);
 // A persistent short trail establishes motion without pretending to be a force.
 c.save();c.globalAlpha=.6;segment(c,cam,t-2.6,t,C.cyan,3);c.restore();
 fallTrace(c,cam,t);counterfactual(c,cam,t);satellite(c,cam,t);
 const vecAlpha=ease((t-7.8)/.6)*(1-ease((t-10.0)/.35));mechanismVectors(c,cam,t,vecAlpha);
 typography(c,t);
 c.save();c.globalAlpha=t<6.2?ease(t/.8)*(1-ease((t-5.6)/.6)):ease((t-23)/.8);text(c,'轨 道 笔 记',86,80,25,C.muted,500);text(c,'FALLING, FOREVER',1535,80,23,C.muted,500);c.restore();
 text(c,'理想圆轨道 · 忽略空气阻力 · 尺寸与时间为示意',86,1022,25,C.muted,400);
 const stage=t<6.2?'观察轨道':t<10.2?'速度与引力':t<15.4?'短暂的假设':t<22.3?'持续的下落':'重新看轨道';c.textAlign='right';text(c,stage,1834,1022,25,C.muted);c.textAlign='left';line(c,[86,1050],[1834,1050],'rgba(110,158,180,.20)',2);line(c,[86,1050],[86+1748*t/D,1050],C.cyan,2);c.restore();}
const textStrings=[...copy.flatMap(v=>[...v.title,...v.sub]),'轨 道 笔 记','FALLING, FOREVER','速度方向','沿切线','引力','指向地心','假如没有引力：沿切线','有引力：轨迹弯曲','轨道，是持续的自由下落。','不是逃离重力，','而是在重力中前进。','圆轨道上，高度不变，','速度方向却不断改变。','理想圆轨道 · 忽略空气阻力 · 尺寸与时间为示意','观察轨道','速度与引力','短暂的假设','持续的下落','重新看轨道'];
const api={render,duration:D,width:W,height:H,textStrings,metadata:{title:'卫星为什么不会掉下来？',font:'OrbitSans',keyframes:[4,8.8,13.8,19,25],heroFrames:[4,13.8,25],renderer:'Deterministic xyz orthographic camera; shaded 2592-face sphere, spherical geographic curves, rigid-body satellite box and dish meshes',assumptions:'Ideal circular orbit; no drag; dimensions, vector lengths, and time illustrative'},model:{earthRadius:E,orbitRadius:R,omega:OMEGA,angularVelocity:-OMEGA,phase:PHASE,period:TAU/OMEGA,inclination:INC,basis:{U,V,N},counterfactualEpoch:EPOCH,theta,position,velocity,acceleration,noGravityPosition,camera,earthCenter:[0,0,0],gravityDirection:t=>mul(radial(t),-1)}};root.OrbitScience=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
