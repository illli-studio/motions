(function(root){'use strict';
const W=1920,H=1080,P={bg:'#FFF7E6',ink:'#2F317A',orange:'#D96913',yellow:'#F6C74A',muted:'#6A6F88'};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/Math.hypot(...a));
const A=.12,K=2*Math.PI/3.8,OMEGA=2*Math.PI/3.2;
function displacement(X,t){return A*Math.sin(K*(X+4)-OMEGA*t)}
function density(X,t){return 1/(1+A*K*Math.cos(K*(X+4)-OMEGA*t))}
function camera(t){let close=smooth(4.5,6,t)*(1-smooth(19,21,t)),track=smooth(10.5,12,t)*(1-smooth(18,20,t));return{yaw:mix(-.65,-.30,close),pitch:mix(.24,.14,close),scale:mix(114,125,close),cx:mix(900,900,close),cy:mix(650,655,close),track};}
function projector(cam){return p=>{let x=p[0]*Math.cos(cam.yaw)+p[2]*Math.sin(cam.yaw),z=-p[0]*Math.sin(cam.yaw)+p[2]*Math.cos(cam.yaw),y=p[1]*Math.cos(cam.pitch)-z*Math.sin(cam.pitch),depth=p[1]*Math.sin(cam.pitch)+z*Math.cos(cam.pitch);return[cam.cx+x*cam.scale,cam.cy-y*cam.scale,depth]}}
function shade(hex,l){let n=parseInt(hex.slice(1),16);return`rgb(${[n>>16,(n>>8)&255,n&255].map(v=>Math.round(clamp(v*l,0,255))).join(',')})`}
function mesh(faces,verts,inds,color,alpha=1){for(let ii of inds){let vs=ii.map(i=>verts[i]),raw=cross(sub(vs[1],vs[0]),sub(vs[2],vs[0]));if(Math.hypot(...raw)<1e-10)raw=cross(sub(vs[2],vs[0]),sub(vs[vs.length-1],vs[0]));if(Math.hypot(...raw)<1e-10)continue;let n=norm(raw);faces.push({layer:faces.layer||0,v:vs,color:shade(color,.68+.32*Math.abs(dot(n,norm([-.4,1,1])))),alpha})}}
function box(faces,c,s,color){let v=[];for(let z of[-1,1])for(let y of[-1,1])for(let x of[-1,1])v.push(add(c,[x*s[0]/2,y*s[1]/2,z*s[2]/2]));mesh(faces,v,[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]],color)}
function ring(faces,x,r0,r1,color,depth=.05){let v=[];for(let r of[r0,r1])for(let j=0;j<32;j++){let a=j*Math.PI/16;v.push([x+(r===r0?depth:0),r*Math.cos(a),r*Math.sin(a)])}let ids=[];for(let j=0;j<32;j++)ids.push([j,(j+1)%32,(j+1)%32+32,j+32]);mesh(faces,v,ids,color)}
function sphere(faces,c,r,color){let v=[],ids=[];for(let j=0;j<=5;j++)for(let i=0;i<8;i++){let a=j*Math.PI/5,b=i*Math.PI/4;v.push(add(c,[r*Math.sin(a)*Math.cos(b),r*Math.cos(a),r*Math.sin(a)*Math.sin(b)]))}for(let j=0;j<5;j++)for(let i=0;i<8;i++)ids.push([j*8+i,j*8+(i+1)%8,(j+1)*8+(i+1)%8,(j+1)*8+i]);mesh(faces,v,ids,color)}
function text(c,s,x,y,size=32,color=P.ink,align='left'){c.fillStyle=color;c.font=`${size}px SoundText`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y)}
function line(c,a,b,col,width=3,dash=[]){c.strokeStyle=col;c.lineWidth=width;c.setLineDash(dash);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.setLineDash([])}
function arrow(c,a,b,col,width=4){line(c,a,b,col,width);let q=Math.atan2(b[1]-a[1],b[0]-a[0]);c.fillStyle=col;c.beginPath();c.moveTo(...b);c.lineTo(b[0]-15*Math.cos(q-.45),b[1]-15*Math.sin(q-.45));c.lineTo(b[0]-15*Math.cos(q+.45),b[1]-15*Math.sin(q+.45));c.closePath();c.fill()}
function render(c,t){t=clamp(t,0,26);c.clearRect(0,0,W,H);c.fillStyle=P.bg;c.fillRect(0,0,W,H);let cam=camera(t),p=projector(cam),faces=[];
// horizontal acoustic bench, not a graph of transverse displacement
box(faces,[.3,-1.25,0],[14,.13,3.2],'#DDD3BF');faces.layer=1;box(faces,[-5.55,0,0],[1.1,2.6,2.6],P.ink);box(faces,[-5.55,-1.55,0],[.45,.7,.7],P.ink);
faces.layer=2;let sx=-4.95+displacement(-4,t);ring(faces,-4.96,.98,1.17,'#111941');ring(faces,sx,.18,.97,'#716FA1',-.25);ring(faces,sx-.25,0,.19,'#DDD5D5');
// receiver capsule and stem
faces.layer=4;box(faces,[7,-.65,0],[.13,1.2,.13],P.muted);sphere(faces,[7,.12,0],.33,P.ink);
faces.layer=3;for(let i=0;i<=36;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){let X=-4+i*.285,y=j*.54,z=k*.54,selected=i===15&&j===0&&k===1;let rho=density(X,t);sphere(faces,[X+displacement(X,t),y,z],selected?.14:.055,selected?P.yellow:(rho>1.08?P.orange:'#7C86B5'))}
c.save();c.beginPath();c.rect(0,330,1920,545);c.clip();faces.map(f=>({...f,screen:f.v.map(p)})).sort((a,b)=>a.layer-b.layer||a.screen.reduce((s,v)=>s+v[2],0)/a.screen.length-b.screen.reduce((s,v)=>s+v[2],0)/b.screen.length).forEach(f=>{c.globalAlpha=f.alpha;c.fillStyle=f.color;c.beginPath();f.screen.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fill()});c.globalAlpha=1;c.restore();
text(c,'声 学  /  空 气 中 的 纵 波',100,76,24,P.muted);line(c,[100,112],[1820,112],'#D8D0BE',2);
let head,subhead;if(t<5){head='声音到了，空气也一路跑来了吗？';subhead='看扬声器前的一小团空气。'}else if(t<11){head='前进的是疏密变化';subhead='振膜往返推挤空气，形成交替的压缩与稀疏。'}else if(t<19){head='盯住黄色这一小团';subhead='它在平衡位置附近往返，并不跟着声波一路向前。'}else{head='局部往返，扰动前进';subhead='声波传递能量；空气体积元没有随波长途迁移。'}text(c,head,100,186,62);text(c,subhead,100,272,33);
if(t<5){text(c,'振膜',610,430,28);text(c,'接收端',p([7,1.1,0])[0],440,28,P.ink,'center');arrow(c,[1260,360],[1690,360],P.orange,5);text(c,'声传播方向',1475,320,27,P.orange,'center');}
if(t>=5&&t<11){let xComp=((OMEGA*t+Math.PI)/K)%3.8-4;while(xComp<-.5)xComp+=3.8;let xc=p([xComp,1.1,0])[0],xr=p([xComp-1.9,1.1,0])[0];text(c,'压缩',xc,430,31,P.orange,'center');text(c,'稀疏',xr,430,31,P.muted,'center');line(c,[xc,462],p([xComp,.65,0]),P.orange,2);line(c,[xr,462],p([xComp-1.9,.65,0]),P.muted,2);arrow(c,[1160,355],[1690,355],P.orange);text(c,'疏密图样向右传播',1425,318,28,P.orange,'center');}
let selX=-4+15*.285,pt=p([selX+displacement(selX,t),0,.54]),eq=p([selX,0,.54]);
if(t>=11&&t<19){let ox=960,oy=410,ux=displacement(selX,t)*850;c.fillStyle='#E8DFCE';c.fillRect(690,342,540,137);line(c,[ox,350],[ox,470],P.ink,2,[5,6]);arrow(c,[ox-105,oy],[ox+105,oy],P.muted,2);arrow(c,[ox+105,oy],[ox-105,oy],P.muted,2);c.fillStyle=P.yellow;c.beginPath();c.arc(ox+ux,oy,20,0,Math.PI*2);c.fill();c.strokeStyle=P.ink;c.lineWidth=3;c.stroke();text(c,'平衡位置',ox,509,25,P.muted,'center');text(c,'往返范围 · 位移放大',1270,409,26,P.muted);line(c,[ox,530],[pt[0],pt[1]-22],'#9D9BB2',2,[5,6]);c.strokeStyle=P.ink;c.lineWidth=3;c.beginPath();c.arc(pt[0],pt[1],24,0,Math.PI*2);c.stroke();}
if(t>=19){text(c,'空气局部往返',eq[0],420,34,P.ink,'center');text(c,'扰动向前传播',1395,420,34,P.orange,'center');arrow(c,[1145,475],[1655,475],P.orange,5);arrow(c,[eq[0]-60,475],[eq[0]+60,475],P.ink,3);arrow(c,[eq[0]+60,475],[eq[0]-60,475],P.ink,3);line(c,[eq[0],500],[eq[0],eq[1]-45],'#9D9BB2',2,[4,6]);line(c,[eq[0],eq[1]-45],[eq[0],eq[1]+45],P.ink,2,[4,6]);}
text(c,'小球代表空气体积元，并非单个分子',100,911,28);text(c,'小振幅、无背景气流的简化示意 · 忽略热运动 · 运动已放慢，声音为示意',100,962,25,P.muted);
let stage=t<5?0:t<11?1:t<19?2:3;for(let i=0;i<4;i++){c.fillStyle=i===stage?P.orange:'#DAD3C4';c.fillRect(100+i*437,1032,405,5)}
}
const api={render,displacement,density,A,K,OMEGA,camera};if(typeof module!=='undefined')module.exports=api;root.SoundFilm=api;
})(typeof window!=='undefined'?window:globalThis);
