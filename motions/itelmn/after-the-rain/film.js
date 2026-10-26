(function(root){'use strict';
const PI=Math.PI,TAU=2*PI,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x))},lerp=(a,b,t)=>a+(b-a)*t;
function state(t){const opening=ease((t-3)/3.2),fold=ease((t-18.2)/2.1),lay=ease((t-20.3)/1.4);return {open:opening*(1-fold),lay,warm:ease((t-12.8)/5),drop:Math.pow(1-ease((t-.3)/1.2),2)*2.3};}
function render(ctx,t){t=Math.max(0,Math.min(24,t));const S=state(t),W=1920,H=1080;ctx.clearRect(0,0,W,H);
const mix=(a,b,q)=>a.map((v,i)=>Math.round(lerp(v,b[i],q))),rgb=a=>'rgb('+a.join(',')+')';
ctx.fillStyle=rgb(mix([37,48,76],[234,183,164],S.warm));ctx.fillRect(0,0,W,H);
const glow=ctx.createRadialGradient(1450,180,10,1450,180,700);glow.addColorStop(0,'rgba(255,224,168,'+(S.warm*.55)+')');glow.addColorStop(1,'rgba(255,224,168,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
const yaw=.43+.13*Math.sin((t-4)/24*PI),el=.38+.035*Math.sin(t/24*PI),scale=207+17*Math.sin(t/24*PI);function project(p){const x=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),z=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [960+x*scale,770+z*Math.sin(el)*scale-p[1]*Math.cos(el)*scale,z*Math.cos(el)+p[1]*Math.sin(el)];}
function path(points){ctx.beginPath();points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();}
function ellipseWorld(x,z,rx,rz,fill,stroke,alpha=1){ctx.save();ctx.globalAlpha=alpha;let ps=[];for(let i=0;i<80;i++){let a=i/80*TAU;ps.push([x+rx*Math.cos(a),.012,z+rz*Math.sin(a)])}path(ps);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}ctx.restore();}
// Terrace seams establish a real ground plane without competing with the subject.
ctx.strokeStyle=S.warm>.5?'rgba(88,75,92,.035)':'rgba(174,193,217,.035)';ctx.lineWidth=1;
for(let z=-5;z<7;z+=1.8){let a=project([-10,0,z]),b=project([10,0,z]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
for(let x=-10;x<11;x+=2.7){let a=project([x,0,-5]),b=project([x,0,7]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
// Single shallow puddle, with its outline remaining stationary through the story.
ellipseWorld(.9,.7,2.4,1.45,rgb(mix([46,74,112],[175,174,190],S.warm)),'rgba(202,218,233,.5)');ellipseWorld(1.65,.45,.7,.48,'rgba(255,224,168,'+S.warm*.55+')',null);
for(let j=0;j<12;j++){const age=((t*.75+j*.381)%1);let rain=1-ease((t-13)/4);ellipseWorld(.7+Math.sin(j*7)*1.6,.65+Math.cos(j*4)*.8,.04+age*.38,.04+age*.25,null,'rgba(199,224,243,.75)',(1-age)*rain*.8)}
ellipseWorld(lerp(-.3,-1.5,S.lay),-.05,lerp(1.1,1.5,S.lay),lerp(.55,.18,S.lay),'rgba(21,31,57,.22)',null);
const rain=1-ease((t-12.8)/4.4);ctx.strokeStyle='rgba(190,213,239,'+rain*.42+')';ctx.lineWidth=1.6;for(let i=0;i<90;i++){let x=((i*327.17)%1920),y=((i*197.7+t*(330+i%7*12))%1120)-30;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-9,y+24);ctx.stroke()}
// Geometry: constant-length ribs rotate around hub. Fabric follows the rib meridians;
// scalloped edge occupies distinct sectors, so folding cannot cross the shaft.
let meshes=[],lines=[];const theta=lerp(.09,1.28,S.open),L=1.72,tilt=S.lay*1.54;
let minY=Infinity;for(let i=0;i<=80;i++){let a=PI-i/80*PI,x=.16+.16*Math.cos(a),y=.58-.19*Math.sin(a);minY=Math.min(minY,y*Math.cos(tilt)+x*Math.sin(tilt)-.052)}for(let k=0;k<10;k++){let a=k*TAU/10,x=L*Math.sin(theta)*Math.cos(a),y=2.85-L*Math.cos(theta)-.16*S.open;minY=Math.min(minY,y*Math.cos(tilt)+x*Math.sin(tilt))}const lift=.03-minY+.11*Math.sin(S.lay*PI);
function trans(p){let x=p[0],y=p[1],z=p[2];return [x*Math.cos(tilt)-y*Math.sin(tilt)-.35+S.lay*.2,y*Math.cos(tilt)+x*Math.sin(tilt)+lift+S.drop,z-.1];}
function face(ps,col){ps=ps.map(trans);let z=ps.reduce((s,p)=>s+project(p)[2],0)/ps.length;meshes.push({ps,col,z})}
function line(ps,col,width){ps=ps.map(trans);lines.push({ps,col,width,z:ps.reduce((s,p)=>s+project(p)[2],0)/ps.length})}
function rib(a,u){const radius=.038*(1-u)+L*Math.sin(theta)*u,down=L*Math.cos(theta)*u+.16*S.open*u*u;return [radius*Math.cos(a),2.85-down,radius*Math.sin(a)]}
for(let k=0;k<10;k++)for(let j=0;j<12;j++)for(let n=0;n<4;n++){
 let a=k*TAU/10+n*TAU/40,b=a+TAU/40,u=j/12,v=(j+1)/12;
 function cloth(ang,r){let p=rib(ang,r);p[1]-=.075*S.open*Math.sin((ang-k*TAU/10)*5)*r*r;return p}
 let shade=1+.16*Math.cos((a+b)/2-2)-.1*u;let base=k%2?[36,71,168]:[47,88,190];face([cloth(a,u),cloth(b,u),cloth(b,v),cloth(a,v)],rgb(base.map(q=>Math.round(q*shade))));
}
for(let k=0;k<10;k++){let a=k*TAU/10;line(Array.from({length:17},(_,i)=>rib(a,i/16)),'rgba(150,182,232,'+lerp(.2,.7,S.open)+')',lerp(.45,1.3,S.open));let p=rib(a,.52),runner=[0,lerp(1.25,2.1,S.open),0];tube([runner,p],.012,'#c8c5b8')}
// Shaft and curved J handle are real 3D swept tubular rings, depth sorted with cloth.
function tube(ps,r,col){for(let j=0;j<ps.length-1;j++){let a=ps[j],b=ps[j+1];for(let n=0;n<8;n++){let p=n*TAU/8,q=(n+1)*TAU/8;face([[a[0]+r*Math.cos(p),a[1],a[2]+r*Math.sin(p)],[a[0]+r*Math.cos(q),a[1],a[2]+r*Math.sin(q)],[b[0]+r*Math.cos(q),b[1],b[2]+r*Math.sin(q)],[b[0]+r*Math.cos(p),b[1],b[2]+r*Math.sin(p)]],col)}}}
tube(Array.from({length:50},(_,i)=>[0,.56+i/49*2.4,0]),.025,'#e1c5a5');let handle=[];for(let i=0;i<=28;i++){let a=PI-i/28*PI;handle.push([.16+.16*Math.cos(a),.58-.19*Math.sin(a),0])}tube(handle,.052,'#d0a779');tube([[0,lerp(1.25,2.1,S.open)-.07,0],[0,lerp(1.25,2.1,S.open)+.07,0]],.052,'#b7c0cc');
let lowest=meshes.flatMap(m=>m.ps).sort((a,b)=>a[1]-b[1])[0];if(S.drop<.08){ellipseWorld(lowest[0],lowest[2],.19,.10,'rgba(18,28,48,.24)',null);ellipseWorld(lowest[0],lowest[2],.12,.065,'rgba(18,28,48,.22)',null)}
// Cloth is an opaque envelope around the shaft. Render enclosed metal first
// to avoid average-depth painter artifacts at the narrow folded hub.
meshes.sort((a,b)=>(a.col.startsWith('#')?0:1)-(b.col.startsWith('#')?0:1)||a.z-b.z);for(let m of meshes){path(m.ps);ctx.fillStyle=m.col;ctx.fill();ctx.strokeStyle=m.col;ctx.lineWidth=.5;ctx.stroke()}
// Seam strokes sit on cloth; no visibility through canopy: only front meridians.
for(let m of lines){if(m.ps.length===2)continue;let mid=project(m.ps[10]);let hub=project(trans([0,2.85,0]));if(mid[2]<hub[2])continue;ctx.beginPath();m.ps.forEach((p,i)=>{let q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.strokeStyle=m.col;ctx.lineWidth=m.width;ctx.stroke()}
// Droplets run off the lower rim rather than passing through the canopy.
if(S.open>.8)for(let k=0;k<10;k++){let age=((t*1.5+k*.23)%1);let p=rib(k*TAU/10,1);p[1]-=age*.65;let q=project(trans(p));ctx.globalAlpha=rain*(1-age);ctx.fillStyle='#bfddf4';ctx.beginPath();ctx.ellipse(q[0],q[1],2.4,4,0,0,TAU);ctx.fill()}ctx.globalAlpha=1;
// Editorial title stays in quiet negative space, never over the canopy.
const titleAlpha=(1-ease((t-2.6)/.6))+ease((t-21.5)/.6);ctx.globalAlpha=titleAlpha;ctx.fillStyle=rgb(mix([226,230,237],[58,58,80],S.warm));ctx.font='54px RainSerif';ctx.fillText('After the Rain',122,155);ctx.font='20px RainMono';ctx.globalAlpha=titleAlpha*.7;ctx.fillText('A LITTLE SHELTER. A LITTLE SUN.',126,198);ctx.globalAlpha=1;
const verts=meshes.flatMap(m=>m.ps),screen=verts.map(project);return {minWorldY:Math.min(...verts.map(p=>p[1])),bounds:{left:Math.min(...screen.map(p=>p[0])),right:Math.max(...screen.map(p=>p[0])),top:Math.min(...screen.map(p=>p[1])),bottom:Math.max(...screen.map(p=>p[1]))},polygons:meshes.length,open:S.open,lay:S.lay};
}
const api={render,state,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.AfterRain=api;
})(typeof window!=='undefined'?window:globalThis);
