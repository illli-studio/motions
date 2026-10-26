(function(root){'use strict';
const PI=Math.PI,TAU=2*PI,C=x=>Math.max(0,Math.min(1,x)),E=x=>{x=C(x);return x*x*x*(10+x*(-15+6*x))},L=(a,b,t)=>a+(b-a)*t;
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,s)=>a.map(v=>v*s),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/Math.hypot(...a));
function shade(h,v){return '#'+h.slice(1).match(/../g).map(x=>Math.round(parseInt(x,16)*v).toString(16).padStart(2,'0')).join('')}
function state(t){let open=E((t-2)/3),turn=E((t-10)/4);return{open,turn,on:E((t-5)/.6),a:E((t-5.6)/3.5),b:E((t-14)/4),rest:E((t-19)/3)}}
function render(ctx,t){t=Math.max(0,Math.min(24,t));let S=state(t),meshes=[],bounds=[];ctx.clearRect(0,0,1920,1080);ctx.fillStyle='#201e32';ctx.fillRect(0,0,1920,1080);
let yaw=-.16+.25*E((t-6)/13),el=.42,scale=200+8*Math.sin(E((t-3)/17)*PI);
function proj(p){let x=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),z=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return[880+x*scale,790+z*Math.sin(el)*scale-p[1]*Math.cos(el)*scale,z*Math.cos(el)+p[1]*Math.sin(el)]}
function path(ps){ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath()}
function face(ps,color){meshes.push({ps,color,z:ps.reduce((s,p)=>s+proj(p)[2],0)/ps.length});bounds.push(...ps)}
function cylinder(a,b,ra,rb,colors=['#eac8a5','#d2a98a','#b98a70'],N=40,cap=true){let axis=unit(sub(b,a)),u=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u),rings=[a,b].map((c,k)=>Array.from({length:N},(_,i)=>add(c,add(mul(u,Math.cos(i/N*TAU)*(k?rb:ra)),mul(v,Math.sin(i/N*TAU)*(k?rb:ra))))));for(let i=0;i<N;i++){let n=(i+1)%N;face([rings[0][i],rings[0][n],rings[1][n],rings[1][i]],shade(colors[0],.72+.28*(.5+.5*Math.cos(i/N*TAU-1))))}if(cap){face(rings[0],colors[1]);face(rings[1],colors[0])}return rings}
function line(ps,color,width=1.5){ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
// Ground rings introduce the two dormant worlds as barely visible fine engraving.
let islands=[[.7,0,.35],[3.1,0,.35]],radius=[.86,.88];for(let j=0;j<2;j++){let c=islands[j],a=j?S.b:S.a;ctx.globalAlpha=.16+.7*a;path(Array.from({length:80},(_,i)=>[c[0]+radius[j]*Math.cos(i/80*TAU),.005,c[2]+radius[j]*Math.sin(i/80*TAU)]));ctx.fillStyle=j?'#344447':'#424047';ctx.fill();ctx.strokeStyle='#b6d2b1';ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;}
// Lamp has hinged solid shafts and capped joint barrels.
let base=[-2.0,.16,0],q1=L(.45,1.894,E((t-3.4)/1.6)),q2=L(2.82,.57,E((t-2)/1.6)),elbow=add(base,[1.73*Math.cos(q1),1.73*Math.sin(q1),0]),head=add(elbow,[2.258*Math.cos(q2),2.258*Math.sin(q2),0]),target=[L(.7,3.1,S.turn),0,.35];
let axis=unit(sub(target,head)),aperture=add(head,mul(axis,.61));
// A translucent cone and an elliptical pool tie the reveal to a physical direction.
if(S.on>0){ctx.globalAlpha=S.on*.105;let pts=[proj(aperture),...Array.from({length:80},(_,i)=>proj([target[0]+.98*Math.cos(i/80*TAU),.017,target[2]+.75*Math.sin(i/80*TAU)]))].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];for(let p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let p of pts.slice().reverse()){while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p)}let hull=lo.slice(0,-1).concat(hi.slice(0,-1));ctx.beginPath();hull.forEach((p,i)=>i?ctx.lineTo(...p.slice(0,2)):ctx.moveTo(...p.slice(0,2)));ctx.closePath();ctx.fillStyle='#f6dc91';ctx.fill();ctx.globalAlpha=S.on*.16;path(Array.from({length:80},(_,i)=>[target[0]+.98*Math.cos(i/80*TAU),.017,target[2]+.75*Math.sin(i/80*TAU)]));ctx.fill();ctx.globalAlpha=1;}
// Each garden is drawn as a crisp 2D cut-paper botanical vignette on the ground plane.
function garden(j){let a=j?S.b:S.a;if(a<=0)return;let c=islands[j];ctx.globalAlpha=a;for(let n=0;n<(j?9:7);n++){let x=c[0]-.60+n*(j?.15:.20),z=c[2]+.25*Math.sin(n*2.3),h=(.35+.22*(.5+.5*Math.sin(n*1.7)))*a,sway=.025*Math.sin(t*1.5+n);let stem=[[x,.02,z],[x+sway*.5,h*.55,z],[x+sway,h,z]];line(stem,j?'#f6dc91':'#b6d2b1',2);for(let k=0;k<3;k++){let y=h*(.28+k*.22),sgn=(k+n)%2?1:-1,w=.12*a;let ps=[[x,y,z],[x+sgn*w,y+.1*a,z],[x+sgn*w*1.25,y+.22*a,z],[x+sgn*w*.3,y+.17*a,z]];path(ps);ctx.fillStyle=j?(k%2?'#d59785':'#f6dc91'):(k%2?'#789c98':'#b6d2b1');ctx.fill()}if(j){let p=proj([x+sway,h+.035,z]);ctx.beginPath();ctx.arc(p[0],p[1],3.5*a,0,TAU);ctx.fillStyle='#f5e7bd';ctx.fill()}}
for(let k=0;k<3;k++){let x=c[0]-.45+k*.4,z=c[2]+.58;line(Array.from({length:30},(_,i)=>[x+.13*Math.cos(i/29*PI),.02,z+.08*Math.sin(i/29*PI)]),'#829e96',1)}ctx.globalAlpha=1;}
garden(0);garden(1);
// Contact shadow remains anchored under the ceramic base.
ctx.globalAlpha=.32;path(Array.from({length:64},(_,i)=>[-2+.68*Math.cos(i/64*TAU),0,.5*Math.sin(i/64*TAU)]));ctx.fillStyle='#0c0d18';ctx.fill();ctx.globalAlpha=1;
cylinder([-2,.03,0],[-2,.2,0],.6,.56,['#d8b695','#b68c74','#8c6658']);
cylinder(base,elbow,.075,.075);cylinder(elbow,head,.068,.068);
for(let p of [base,elbow,head]){cylinder(add(p,[0,0,-.115]),add(p,[0,0,.115]),.16,.16,['#c38d66','#8d5d48','#e0b68b']);cylinder(add(p,[0,0,.116]),add(p,[0,0,.13]),.055,.055,['#efd0a7','#e1b78f','#d3a080'])}
// Shade is a hollow truncated cone with a luminous inset aperture, not a solid triangle.
let back=add(head,mul(axis,.08));let rings=cylinder(back,aperture,.16,.43,['#eccbac','#d8ad8d','#ba896c'],48,false);face(rings[0],'#b98768');let inset=add(aperture,mul(axis,-.015));let inner=cylinder(inset,aperture,.39,.39,[S.on>.5?'#f7e2a4':'#665254','#bd926f','#e8c9a0'],48,false);face(inner[0],S.on>.5?'#f7e2a4':'#665254');for(let i=0;i<48;i++){let k=(i+1)%48;face([rings[1][i],rings[1][k],inner[1][k],inner[1][i]],'#e5bf98')}
meshes.sort((a,b)=>a.z-b.z);ctx.lineJoin='round';for(let m of meshes){path(m.ps);ctx.fillStyle=m.color;ctx.fill();ctx.strokeStyle=m.color;ctx.lineWidth=.45;ctx.stroke()}
// Sparse spark points make the second reveal feel alive without obscuring the silhouette.
ctx.globalAlpha=S.b*.75;for(let k=0;k<8;k++){let q=proj([2.55+k*.15,.7+.22*Math.sin(t*.7+k),.1+.22*Math.cos(k)]);ctx.beginPath();ctx.arc(q[0],q[1],1.5+Math.sin(k+t)*.3,0,TAU);ctx.fillStyle='#f6dc91';ctx.fill()}ctx.globalAlpha=1;
let title=E((t-.2)/.8)*(1-E((t-1.7)/.5))+E((t-22)/.8);ctx.globalAlpha=title;ctx.fillStyle='#eac8a5';ctx.font='64px LanternSerif';ctx.fillText('A Little More Light',112,108);ctx.globalAlpha=1;
let screen=bounds.map(proj);return{open:S.open,turn:S.turn,gardenA:S.a,gardenB:S.b,polygons:meshes.length,bounds:{left:Math.min(...screen.map(p=>p[0])),right:Math.max(...screen.map(p=>p[0])),top:Math.min(...screen.map(p=>p[1])),bottom:Math.max(...screen.map(p=>p[1]))}}}
const api={render,state,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.Lantern=api;
})(typeof window!=='undefined'?window:globalThis);
