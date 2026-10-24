/* Original geometric miniature and deterministic software 3D renderer. MIT-0. */
(function(root){'use strict';
const PI=Math.PI,TAU=PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,ease=v=>{v=clamp(v);return v*v*(3-2*v)},ramp=(t,a,b)=>ease((t-a)/(b-a));
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{let d=Math.hypot(...a)||1;return a.map(v=>v/d)},scale=(a,n)=>a.map(v=>v*n);
function render(ctx,t){t=clamp(t,0,24);ctx.clearRect(0,0,1920,1080);let bg=ctx.createRadialGradient(1000,430,20,960,540,1250);bg.addColorStop(0,'#282940');bg.addColorStop(1,'#0c1022');ctx.fillStyle=bg;ctx.fillRect(0,0,1920,1080);
const arrival=ramp(t,15.5,17.5)*(1-ramp(t,20,23));const rise=ramp(t,3,6.5),travel=ramp(t,6.5,18),tx=mix(-6.3,6.3,travel),close=ramp(t,7,9)*(1-ramp(t,20,23)),ending=ramp(t,21,23),yaw=mix(-.38,.48,ramp(t,3,7))-.55*ramp(t,9,13)+.36*ramp(t,15,20),dist=18-7*close-1.0*ending-7*arrival,target=[mix(tx*close*.90,tx-.12,arrival), .7+.2*close-.15*arrival, .35*ramp(t,16,18)*close-.15*arrival],eye=add(target,[Math.sin(yaw)*dist,dist*(.68-.19*close),Math.cos(yaw)*dist]),forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
function project(p){let d=sub(p,eye),z=dot(d,forward);return[960+(1500+800*arrival)*dot(d,right)/z,570-(1500+800*arrival)*dot(d,up)/z,z]}
let faces=[],priority=0;const light=norm([-4,8,5]);
function mesh(vs,fs,col,emissive=false){let ps=vs.map(project);for(let f of fs){let mid=scale(f.reduce((a,i)=>add(a,vs[i]),[0,0,0]),1/f.length),n=norm(cross(sub(vs[f[1]],vs[f[0]]),sub(vs[f[2]],vs[f[0]])));if(dot(n,sub(eye,mid))<=0)continue;let l=emissive?1:.42+.58*Math.max(0,dot(n,light));faces.push({p:f.map(i=>ps[i]),z:project(mid)[2]-priority,c:`rgb(${col.map(v=>Math.round(v*l)).join(',')})`})}}
function box(x,y,z,w,h,d,c,emit=false){let v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>[x+v[0]*w/2,y+v[1]*h/2,z+v[2]*d/2]);mesh(v,[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]],c,emit)}
function line3(points,c,w=2){ctx.beginPath();points.forEach((p,i)=>{let q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke()}
function rod(a,b,r,c){let dir=norm(sub(b,a)),side=norm(cross(dir,Math.abs(dir[1])>.9?[1,0,0]:[0,1,0])),other=cross(dir,side),vs=[];for(let p of [a,b])for(let k=0;k<4;k++)vs.push(add(p,add(scale(side,(k===0||k===3?1:-1)*r),scale(other,(k<2?1:-1)*r))));mesh(vs,[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],c)}
function wheel(x,z){let v=[],f=[];for(let side of [-1,1])for(let i=0;i<12;i++){let a=i*TAU/12;v.push([x+Math.cos(a)*.12,.21+Math.sin(a)*.12,z+side*.045])}for(let i=0;i<12;i++)f.push([i,(i+1)%12,(i+1)%12+12,i+12]);f.push(Array.from({length:12},(_,i)=>11-i));f.push(Array.from({length:12},(_,i)=>i+12));mesh(v,f,[43,44,62]);}
// Water and two grounded neighbourhood islands. All rails and buildings use real 3D vertices.
ctx.globalAlpha=rise;for(let k=0;k<11;k++){let z=-3.8+k*.68;line3([[-1.7,-.48,z],[1.7,-.48,z]],'#344367',1.5)}ctx.globalAlpha=1;
box(-4.5,-.31,0,5.5,.32*rise,7,[54,58,86]);box(4.5,-.31,0,5.5,.32*rise,7,[54,58,86]);
// Deck, bridge piers, rail sleepers and rails.
box(0,-.05*rise,0,14,.18*rise,1.12,[105,112,148]);for(let x of [-1.5,1.5])box(x,-.46,0,.18,.78*rise,.9,[103,107,143]);
// Ground and deck are a fixed lower layer; draw before small raised meshes to avoid painter-sort occlusion by large floor quads.
ctx.globalAlpha=rise;faces.sort((a,b)=>b.z-a.z);for(let f of faces){ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.c;ctx.fill();}faces=[];ctx.globalAlpha=1;
let spill=ramp(t,18,19.3);if(spill>0){let points=[[tx-.61,.078,.35],[tx-.35,.078,.35],[tx-.14,.078,.98],[tx-.83,.078,.98]].map(project),near=project([tx-.48,.078,.35]),far=project([tx-.48,.078,.98]),gradient=ctx.createLinearGradient(near[0],near[1],far[0],far[1]);gradient.addColorStop(0,'rgba(255,210,132,'+(.65*spill)+')');gradient.addColorStop(1,'rgba(255,210,132,0)');ctx.fillStyle=gradient;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
for(let i=0;i<57;i++){let x=-7+i*.25;if(i/56<=ramp(t,.5,3)){box(x,.065,0,.11,.035,.8,[140,137,154]);}}
for(let z of [-.32,.32])box(mix(-7,0,ramp(t,.5,3)),.10,z,14*ramp(t,.5,3),.05,.045,[239,197,133],true);
// Original reflective strips follow the river perspective, with gentle timed shimmer.
ctx.globalAlpha=rise*.65;for(let k=0;k<12;k++){let z=-2.9+k*.51,xx=.5*Math.sin(k*2.3+t*.6),len=.35+.2*Math.sin(k);line3([[xx-len,-.44,z],[xx+len,-.44,z]],k%3===0?'#a58b71':'#586184',2)}ctx.globalAlpha=1;
// Bridge edge balustrades, kept low enough that the hero tram remains unobscured.
for(let z of [-.61,.61]){box(0,.33*rise,z,3.7,.045,.045,[160,159,183]);for(let i=0;i<13;i++)box(-1.8+i*.3,.18*rise,z,.035,.3*rise,.035,[124,129,166]);}
const buildings=[[-6,-2.1,1.15,2.4,.95],[-4.6,-2.35,1.1,3.1,1.2],[-3.15,-2.1,1.05,1.9,.95],[-6.3,2.25,1.05,1.2,1.1],[-4.9,2.65,1.2,1.5,1.1],[3.05,-2.25,1,2.2,1.1],[4.4,-2.1,1.25,3.3,1],[6,-2.2,1,2.55,1.1],[3.1,2.8,1.05,1.3,.9],[4.5,2.7,1.1,1.5,1]];
buildings.forEach((b,i)=>{let [x,z,w,h,d]=b,g=ramp(t,3.4+i*.12,5.3+i*.12),hh=h*g;box(x,hh/2-.12,z,w,hh,d,i%2?[130,131,174]:[103,115,163]);box(x,hh-.08,z,w+.08,.10*g,d+.08,[161,156,183]);let rows=Math.floor(h/.45),lit=t>7+i*.65;for(let r=0;r<rows;r++)for(let c=0;c<2;c++){let col=lit&&((r+c+i)%3!==0)?[252,193,109]:[63,71,109];box(x+(c-.5)*w*.45,(.3+r*.44)*g,z+d/2+.015,w*.22,.22*g,.022,col,lit);box(x+w/2+.013,(.3+r*.44)*g,z+(c-.5)*d*.45,.022,.22*g,d*.23,col,lit)}});
// Platform and welcoming station, not hidden behind apartment towers.
let sg=ramp(t,5,7);box(6.35,.12,-1.0,1.8,.22*sg,.8,[159,154,169]);for(let x of [5.62,7.08])box(x,.7*sg,-1.3,.06,1.2*sg,.06,[194,184,176]);box(6.35,1.3*sg,-1.1,1.85,.12,.9,[198,147,103]);box(6.35,.8*sg,-1.42,1.25,.65*sg,.055,[52,61,89]);box(6.35,.81*sg,-1.38,.86,.18*sg,.015,t>18?[255,209,135]:[163,151,137],t>18);
// Real street lamps: slender posts, bent neck and warm lantern panes.
for(let x of [-5.8,-2.5,2.5,5.4]){let z=.94;box(x,.58,z,.035,1.2*rise,.035,[154,148,163]);box(x+.13,1.18,z,.28,.035,.035,[154,148,163]);box(x+.25,1.10,z,.15,.1,.15,[255,207,133],true);}
// Platform door opens as the tram stops; a warm threshold provides the arrival beat.
let door=ramp(t,17.2,19);box(6.35,.47,-1.37,.34,.64,.014,[246,193,119],true);box(6.35-.13*door,.47,-1.34,.34*(1-door*.7),.64,.025,[77,87,116]);
// Street trees use faceted conical crowns, not billboard sprites.
for(let x of [-6.8,-3.2,2.6,6.9]){let z=x<0?1.6:-1.3;box(x,.25,z,.07,.5*rise,.07,[132,107,107]);let v=[[x,.5*rise,z],[x-.35,.4*rise,z-.28],[x+.35,.4*rise,z-.28],[x+.35,.4*rise,z+.28],[x-.35,.4*rise,z+.28],[x,1.3*rise,z]];mesh(v,[[1,2,5],[2,3,5],[3,4,5],[4,1,5]],[82,122,137]);}
// Amber electric tram: body, cabin glass, wheels, roof, front lights and door.
let appear=ramp(t,5.5,6.5),y=.40;box(tx,y,0,1.30,.56*appear,.59,[248,166,73]);box(tx,.75,0,1.38,.12*appear,.67,[241,211,160]);box(tx,.22,0,1.2,.14*appear,.63,[80,65,77]);for(let z of [-.31,.31])for(let k=0;k<3;k++){if(z>0&&k===0)continue;box(tx-.4+k*.37,.55,z,.30,.29*appear,.025,[59,64,84]);box(tx-.4+k*.37,.56,z+(z>0?.015:-.015),.245,.225*appear,.018,[145,177,185]);}let open=ramp(t,18,19.3);priority=30;box(tx-.48,.43,.34,.24,.44,.018,[255,219,147],true);box(tx-.48-.20*open,.43,.365,.24,.44,.018,[219,149,77]);box(tx-.48-.20*open,.52,.38,.16,.23,.018,[107,145,162]);box(tx-.4-.20*open,.36,.395,.025,.045,.02,[255,226,168]);priority=0;box(tx,.28,.324,1.23,.035,.018,[254,218,152]);box(tx+.66,.55,0,.02,.28*appear,.44,[121,154,169]);box(tx+.67,.32,-.2,.025,.07*appear,.07,[255,231,172],true);box(tx+.67,.32,.2,.025,.07*appear,.07,[255,231,172],true);for(let x of [-.43,.43])for(let z of [-.32,.32])wheel(tx+x,z);rod([tx-.22,.83,0],[tx+.06,1.03,0],.017,[187,176,169]);rod([tx+.06,1.03,0],[tx-.12,1.22,0],.017,[187,176,169]);box(tx-.12,1.23,0,.48,.025,.035,[222,201,177]);box(tx+.58,.46,.31,.035,.17,.025,[255,217,144],true);
// Opaque geometry is drawn far-to-near, never a flat pre-rendered scene plate.
ctx.globalAlpha=rise;faces.sort((a,b)=>b.z-a.z);for(let f of faces){ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.c;ctx.fill();ctx.strokeStyle=f.c;ctx.lineWidth=.4;ctx.stroke()}
ctx.globalAlpha=1;
// Grounded station markers and a route trace in screen space link 2D graphic design to 3D journey.
let map=1-ramp(t,3,5);if(map>0){ctx.globalAlpha=map;ctx.strokeStyle='#f9bd78';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(290,570);ctx.lineTo(mix(290,1630,ramp(t,.1,2.5)),570);ctx.stroke();for(let i=0;i<5;i++)if(t>i*.32){ctx.fillStyle='#101327';ctx.strokeStyle='#f3bd83';ctx.beginPath();ctx.arc(290+i*335,570,11,0,TAU);ctx.fill();ctx.stroke()}ctx.globalAlpha=1;}
function text(s,x,y,size,font,col,a=1){ctx.globalAlpha=a;ctx.fillStyle=col;ctx.font=`${size}px ${font}`;ctx.fillText(s,x,y);ctx.globalAlpha=1}
let intro=1-ramp(t,3,4.2);text('THE LAST TRAM',130,166,65,'TramSerif','#e8e3da',intro*(.7+.3*ramp(t,0,.6)));text('A CITY FINDS ITS WAY HOME',135,214,20,'TramMono','#b9b3c9',intro*ramp(t,.5,1.2));if(map>0){text('DOWNTOWN',240,625,17,'TramMono','#c7bed4',map);text('RIVER',925,625,17,'TramMono','#c7bed4',map);text('HOME',1590,625,17,'TramMono','#f8ca90',map)}
let en=ramp(t,21.5,22.5);ctx.textAlign='center';text('HOME, AT LAST.',960,172,52,'TramSerif','#ece2d5',en);text('THE LAST TRAM / A CITY FINDS ITS WAY HOME',960,218,18,'TramMono','#d0bda7',en);ctx.textAlign='left';
// Tiny passenger-light pulses on exact half-second beats; no jitter or randomized state.
if(t>8&&t<18){let q=project([tx,.82,0]),a=(1-(t%.5)*2)*.28;ctx.globalAlpha=a;ctx.strokeStyle='#ffd298';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1],12+(t%.5)*30,0,TAU);ctx.stroke();ctx.globalAlpha=1;}
}
root.LastTram={render,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=root.LastTram;
})(typeof window!=='undefined'?window:globalThis);
