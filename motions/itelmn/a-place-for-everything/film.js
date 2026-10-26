/* A Place for Everything: original deterministic geometric animation, MIT-0. */
(function(root){'use strict';
const TAU=Math.PI*2,C={bg:'#e9edf5',ink:'#23314a',red:'#e87764',blue:'#495bc4',gold:'#e4bd5c',tray:'#f7f3e9'};
const clamp=x=>Math.max(0,Math.min(1,x)),sm=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const pieces=[[-420,-280,0],[0,-280,1],[420,-280,2],[-550,0,1],[550,0,2],[380,320,0],[-380,320,2],[0,320,0],[-490,230,1]];
function render(ctx,time){const t=Math.max(0,Math.min(24,time));let mesh=[],layer=0;
const solid=sm((t-2.4)/2.2),dock=sm((t-16.2)/2.4),yaw=mix(-.05,.30,sm((t-3)/4))- .49*sm((t-17.4)/5.6),pitch=mix(1.45,.69,sm((t-3)/4.1));const sc=mix(1.32,1.54,sm((t-4)/5));
const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
function view(v){let x=v[0]*cy-v[2]*sy,z=v[0]*sy+v[2]*cy;return [x,-v[1]*cp+z*sp,z*cp+v[1]*sp]}
function p(v){let q=view(v);return[960+q[0]*sc,590+q[1]*sc]}
function color(hex,k){let n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,n>>8&255,n&255].map(x=>Math.round(Math.min(255,x*k))).join(',')})`}
function face(v,col){let a=v[0],b=v[1],c=v[2],u=b.map((x,i)=>x-a[i]),w=c.map((x,i)=>x-a[i]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],l=Math.hypot(...n)||1;if(n[0]*sy*cp+n[1]*sp+n[2]*cy*cp<=0)return;let k=.76+.24*Math.abs((n[0]*-.3+n[1]*.93+n[2]*-.2)/l);mesh.push({v,col:color(col,k),layer,d:v.reduce((s,a)=>s+view(a)[2],0)/v.length})}
function box(x,y,z,w,h,d,col){let v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(a=>[x+a[0]*w/2,y+a[1]*h/2,z+a[2]*d/2]);for(let ids of[[3,2,1,0],[4,5,6,7],[0,4,7,3],[2,6,5,1],[7,6,2,3],[0,1,5,4]])face(ids.map(i=>v[i]),col)}
function shape(type,r){let a=[];if(type===1)return[[-r,0],[0,-r],[r,0],[0,r]];if(type===2){for(let i=0;i<=24;i++){let q=-Math.PI/2+i*Math.PI/24;a.push([r*.44+r*.6*Math.cos(q),r*.6*Math.sin(q)])}for(let i=0;i<=24;i++){let q=Math.PI/2+i*Math.PI/24;a.push([-r*.44+r*.6*Math.cos(q),r*.6*Math.sin(q)])}return a}for(let i=0;i<48;i++){let q=i*TAU/48;a.push([r*Math.cos(q),r*Math.sin(q)])}return a}
function token(x,y,z,type,rot,h,col,r=34){let a=shape(type,r),make=(rr,yy)=>a.map(q=>[x+rr*(q[0]*Math.cos(rot)-q[1]*Math.sin(rot)),yy,z+rr*(q[0]*Math.sin(rot)+q[1]*Math.cos(rot))]),rings=[make(1,y),make(1,y+Math.max(0,h-3)),make(h>3?.91:1,y+h)];let v=rings[2],center=[x,y+h,z];for(let i=0;i<a.length;i++){let j=(i+1)%a.length;face([center,v[j],v[i]],col);for(let k=0;k<2;k++)face([rings[k+1][i],rings[k+1][j],rings[k][j],rings[k][i]],col)}}
function line(v,col,width=2,dash=[]){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();v.forEach((a,i)=>{let q=p(a);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.stroke();ctx.restore()}
function groundShadow(x,z,rx,rz,a){let q=p([x,0,z]);ctx.save();ctx.translate(...q);ctx.rotate(yaw*.3);ctx.scale(rx*sc,rz*sc*sp);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(35,49,74,${a})`);g.addColorStop(1,'rgba(35,49,74,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();ctx.restore()}
ctx.clearRect(0,0,1920,1080);ctx.fillStyle=C.bg;ctx.fillRect(0,0,1920,1080);
// An editorial 2D registration grid: dissolves naturally as the flat drawing acquires depth.
ctx.save();ctx.globalAlpha=(1-sm((t-4)/2))*.48;ctx.strokeStyle='#cbd3e2';ctx.lineWidth=1;for(let x=80;x<1920;x+=80){ctx.beginPath();ctx.moveTo(x,190);ctx.lineTo(x,960);ctx.stroke()}for(let y=190;y<1000;y+=80){ctx.beginPath();ctx.moveTo(80,y);ctx.lineTo(1840,y);ctx.stroke()}ctx.restore();
const trayIn=sm((t-5.6)/2.2);if(trayIn>0)groundShadow(0,0,550,295,.17*trayIn);
// Thin modular docking board emerges from below, with physical feet.
let board=sm((t-15)/1.4);if(board>0){box(0,-11-(1-board)*90,0,850,22,394,'#bbc5d5');for(let x of[-350,350])for(let z of[-120,120])box(x,-29-(1-board)*90,z,30,16,28,C.ink)}
let trays=[];for(let j=0;j<3;j++){let tx=(j-1)*mix(305,278,dock),tz=0,ty=-(1-trayIn)*130;trays.push([tx,ty,tz]);if(trayIn>0){layer=1;box(tx,ty+8,tz,250,16,366,C.tray);layer=3;let walls=sm((t-(6.2+j*.3))/1.1);box(tx-119,ty+8+25*walls,tz,12,50*walls,342,C.tray);box(tx+119,ty+8+25*walls,tz,12,50*walls,342,C.tray);box(tx,ty+8+25*walls,tz-177,250,50*walls,12,C.tray);layer=5;box(tx,ty+8+25*walls,tz+177,250,50*walls,12,C.tray);layer=2;for(let row=0;row<3;row++)token(tx,ty+16,-89+row*89,j,0,1,'#d5dae3',43);}}
// Scattered marks retain identity, rise into small solids, and choose matching spaces.
layer=4;let counts=[0,0,0];for(let i=0;i<pieces.length;i++){let [sx,sz,type]=pieces[i],row=counts[type]++,dest=trays[type],start=[8.4,9.6,10.8,11.4,12,12.45,12.9,13.35,13.8][i],u=clamp((t-start)/1.2),e=sm(u),x=mix(sx,dest[0],e),z=mix(sz,-89+row*89,e),y=mix(3+90*sm((t-4.6)/1),18,e)+Math.sin(Math.PI*u)*145,rot=(i*.72-.8)*(1-e),h=mix(0,24,solid);let appear=sm((t-(.15+i*.085))/.55);if(appear>0){layer=u<.93?6:4;groundShadow(x,z,45,35,.10*appear*(1-y/350));token(x,y,z,type,rot,h,[C.red,C.blue,C.gold][type],34*appear);}}
mesh.sort((a,b)=>a.layer-b.layer||a.d-b.d);for(let f of mesh){ctx.fillStyle=f.col;ctx.beginPath();f.v.forEach((v,i)=>{let q=p(v);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.closePath();ctx.fill();ctx.strokeStyle=f.col;ctx.lineWidth=1.1;ctx.stroke();}
// 2D placement ripples are isolated, brief accents, not replacement geometry.
for(let i=0;i<9;i++){let land=[9.6,10.8,12,12.6,13.2,13.65,14.1,14.55,15][i],u=(t-land)/.45;if(u>=0&&u<1){let type=pieces[i][2],row=pieces.slice(0,i).filter(a=>a[2]===type).length,q=p([trays[type][0],45,-89+row*89]);ctx.save();ctx.globalAlpha=(1-u)*.5;ctx.strokeStyle=[C.red,C.blue,C.gold][type];ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(...q,sc*(42+u*20),sc*sp*(42+u*20),0,0,TAU);ctx.stroke();ctx.restore();}}
ctx.save();ctx.fillStyle=C.ink;let title=sm((t-19.2)/1.1);ctx.globalAlpha=title;ctx.font='68px PlaceSerif';ctx.fillText('A place for everything.',140,138+15*(1-title));ctx.font='26px PlaceMono';ctx.fillText('LESS SEARCHING. MORE SPACE.',145,191);ctx.restore();
// Small progress marks show narrative cadence without explaining the content in text.
ctx.save();ctx.globalAlpha=.6;for(let i=0;i<4;i++){ctx.fillStyle=t>i*5.4?C.ink:'#bac4d5';ctx.fillRect(143+i*24,970,12,4)}ctx.restore();
}
const api={render,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.PlaceForEverything=api;
})(typeof window!=='undefined'?window:globalThis);
