(function(root){'use strict';const PI=Math.PI,C=x=>Math.max(0,Math.min(1,x)),E=x=>{x=C(x);return x*x*x*(10+x*(-15+6*x))},L=(a,b,t)=>a+(b-a)*t;
function state(t){let open=E((t-2.6)/3.4)*(1-E((t-19)/3));return{open,city:E((t-6)/3)*(1-E((t-17.2)/1.7)),arrive:E((t-.2)/1.6),yaw:-.55+.72*E((t-8)/8),zoom:1+.22*E((t-9)/4)*(1-E((t-17)/3))}}
function render(ctx,t){t=Math.max(0,Math.min(24,t));let s=state(t),faces=[],bounds=[],scale=170*s.zoom,cy=680,el=.58;ctx.clearRect(0,0,1920,1080);ctx.fillStyle='#e9f0f2';ctx.fillRect(0,0,1920,1080);
function world(p){return[p[0]+L(-1.7,0,s.arrive),p[1],p[2]]}
function proj(p){p=world(p);let x=p[0]*Math.cos(s.yaw)-p[2]*Math.sin(s.yaw),z=p[0]*Math.sin(s.yaw)+p[2]*Math.cos(s.yaw);return[960+x*scale,cy+z*Math.sin(el)*scale-p[1]*Math.cos(el)*scale,z*Math.cos(el)+p[1]*Math.sin(el)]}
function face(ps,col,stroke){let f={ps,col,stroke,z:ps.reduce((a,p)=>a+proj(p)[2],0)/ps.length};faces.push(f);bounds.push(...ps);return f}
function panel(ps,col){let f=face(ps,col);f.flap=true;f.upper=ps[0][1]===.96;f.frontFlap=ps[0][2]===1.3&&!f.upper;}
function box(x,y,z,w,h,d,col){let p=[[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y+h,z-d/2],[x-w/2,y+h,z-d/2],[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y+h,z+d/2],[x-w/2,y+h,z+d/2]];face([p[0],p[1],p[2],p[3]],col[0]);let front=face([p[4],p[5],p[6],p[7]],col[1]);face([p[0],p[4],p[7],p[3]],col[2]);face([p[1],p[5],p[6],p[2]],col[0]);face([p[3],p[2],p[6],p[7]],col[3]);return front;}
function line(ps,color,w=2,a=1){ctx.globalAlpha=a;ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke();ctx.globalAlpha=1}
// Flat postal route illustration provides the opening cause and becomes a street plan.
let pathA=E((t-.1)/1.4);ctx.setLineDash([7,10]);ctx.strokeStyle='#7e9ea6';ctx.lineWidth=2;ctx.globalAlpha=.55*(1-E((t-5)/2));ctx.beginPath();ctx.moveTo(115,790);ctx.bezierCurveTo(330,920,400,530,640,675);ctx.lineTo(960,675);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
let shadow=proj([0,0,0]);ctx.fillStyle='#506b75';ctx.globalAlpha=.13;ctx.beginPath();ctx.ellipse(shadow[0],shadow[1]+15,325*scale/170,76*scale/170,0,0,2*PI);ctx.fill();ctx.globalAlpha=1;
const cardboard=['#a65b46','#bd7556','#cb8867','#e7b88c'];
box(0,0,0,3.5,.12,2.7,cardboard);
// Hollow walls, not a solid box hiding the city.
box(0,.12,-1.3,3.5,.82,.1,cardboard);let frontWall=box(0,.12,1.3,3.5,.82,.1,cardboard);frontWall.frontWall=true;box(-1.7,.12,0,.1,.82,2.5,cardboard);box(1.7,.12,0,.1,.82,2.5,cardboard);
face([[-1.6,.14,-1.2],[1.6,.14,-1.2],[1.6,.14,1.2],[-1.6,.14,1.2]],'#e9cba6');
// Every flap rotates about its fixed top-wall hinge; city retracts before closure.
let theta=2.32*E((t-2.6)/1.6)*(1-E((t-20.5)/1.5));for(let side of [-1,1]){let x=side*1.7,tip=x-side*1.7*Math.cos(theta),y=.96+1.7*Math.sin(theta);panel([[x,.96,-1.3],[x,.96,1.3],[tip,y,1.3],[tip,y,-1.3]],side===1?'#d08b67':'#dca279','#af6d51');}
theta=2.32*E((t-4.3)/1.6)*(1-E((t-19)/1.4));for(let side of [-1,1]){let z=side*1.3,tip=z-side*1.28*Math.cos(theta),y=.95+1.28*Math.sin(theta);panel([[-1.66,.95,z],[1.66,.95,z],[1.66,y,tip],[-1.66,y,tip]],side===1?'#bb7354':'#cf946c','#af6d51');}
// Buildings remain entirely inside the parcel footprint and rise only after flaps clear.
let buildings=[[-1,-.65,.5,.5,1.2],[-.25,-.65,.55,.5,1.7],[.6,-.65,.55,.5,.95],[1.15,.15,.45,.5,1.4],[-1,.65,.55,.5,.8],[-.25,.65,.55,.5,1.2],[.5,.65,.55,.5,.75]];
for(let i=0;i<buildings.length;i++){let[x,z,w,d,h]=buildings[i],grow=E((t-6-i*.16)/1.5)*(1-E((t-17.2)/1.7)),hh=h*grow;if(hh<.002)continue;let colors=i%2?['#4c7d87','#5e9ba1','#397681','#a2c4bb']:['#cc8c70','#e0ab88','#b97d68','#f3d2a7'];let front=box(x,.16,z,w,hh,d,colors);front.windows=[];for(let j=0;j<3;j++){let y=.3+j*.35;if(y+.10>.16+hh-.02)continue;for(let k of [-1,1])front.windows.push([[x+k*.13-.035,y,z+d/2+.002],[x+k*.13+.035,y,z+d/2+.002],[x+k*.13+.035,y+.10,z+d/2+.002],[x+k*.13-.035,y+.10,z+d/2+.002]])}}
// Street markings lie on the inner floor and are occluded by city and walls.
for(let z of [-.12,.15])face([[-1.55,.15,z-.018],[1.55,.15,z-.018],[1.55,.15,z+.018],[-1.55,.15,z+.018]],'#598d92');
for(let f of faces.sort((a,b)=>{let lift=f=>f.flap&&s.city<.001?100+(f.upper?2:1):f.frontFlap?60:f.frontWall?50:0;return lift(a)-lift(b)||a.z-b.z})){ctx.beginPath();f.ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();ctx.fillStyle=f.col;ctx.fill();ctx.strokeStyle=f.stroke||f.col;ctx.lineWidth=f.stroke?1.3:.5;ctx.stroke();for(let ps of f.windows||[]){ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();ctx.fillStyle='#ffe3a2';ctx.fill()}}
// Closing gift retains a warm little window printed on the front face.
let glow=E((t-21)/1);if(glow){ctx.globalAlpha=glow;let a=proj([-.17,.37,1.353]),b=proj([.17,.37,1.353]),c=proj([.17,.68,1.353]),d=proj([-.17,.68,1.353]);ctx.beginPath();ctx.moveTo(...a.slice(0,2));for(let p of [b,c,d])ctx.lineTo(...p.slice(0,2));ctx.closePath();ctx.fillStyle='#ffd784';ctx.fill();ctx.globalAlpha=1;line([[0,.37,1.356],[0,.68,1.356]],'#98664e',2,glow);line([[-.17,.52,1.356],[.17,.52,1.356]],'#98664e',2,glow)}
let title=E((t-.2)/.8)*(1-E((t-2.1)/.6))+E((t-21.6)/.8);ctx.globalAlpha=title;ctx.fillStyle='#355666';ctx.font='64px ParcelSerif';ctx.fillText('Handle with Wonder',112,112);ctx.globalAlpha=1;
let ps=bounds.map(proj);return{...s,polygons:faces.length,bounds:{left:Math.min(...ps.map(p=>p[0])),right:Math.max(...ps.map(p=>p[0])),top:Math.min(...ps.map(p=>p[1])),bottom:Math.max(...ps.map(p=>p[1]))},cityClearBeforeClose:t<19||s.city===0}}
const api={render,state,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.Parcel=api;})(typeof window!=='undefined'?window:globalThis);
