(function(root){
'use strict';
const W=1920,H=1080,DURATION=27,TAU=Math.PI*2;
const C={bg:'#f2efe9',ink:'#193c42',wine:'#532b43',muted:'#688084',water:'#258c99',light:'#8fcad0',force:'#d35068',white:'#fffdf9'};
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function txt(c,s,x,y,size=40,color=C.ink,weight=400,align='left'){c.fillStyle=color;c.font=`${weight} ${size}px CapillarySans, sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y);}
function line(c,a,b,color=C.ink,width=2,dash=[]){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
function arrow(c,a,b,col=C.force,w=6){line(c,a,b,col,w);let th=Math.atan2(b[1]-a[1],b[0]-a[0]);c.fillStyle=col;c.beginPath();c.moveTo(...b);c.lineTo(b[0]-20*Math.cos(th-.45),b[1]-20*Math.sin(th-.45));c.lineTo(b[0]-20*Math.cos(th+.45),b[1]-20*Math.sin(th+.45));c.closePath();c.fill();}
function poly(c,p,fill,stroke,width=1){if(!p.length)return;c.beginPath();c.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(q=>c.lineTo(q[0],q[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function projector(cx=1150,cy=820,scale=145,yaw=-.22,pitch=.24){return p=>{let x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return[cx+x*scale,cy+(-p[1]*Math.cos(pitch)+z*Math.sin(pitch))*scale,z*Math.cos(pitch)+p[1]*Math.sin(pitch)]}}
function cylinder(x,r,bottom,top,n=64){let faces=[];for(let i=0;i<n;i++){let a=i*TAU/n,b=(i+1)*TAU/n;faces.push([[x+r*Math.cos(a),bottom,r*Math.sin(a)],[x+r*Math.cos(b),bottom,r*Math.sin(b)],[x+r*Math.cos(b),top,r*Math.sin(b)],[x+r*Math.cos(a),top,r*Math.sin(a)]]);}return faces;}
function meniscus(x,r,h,n=64,rings=10){let faces=[];const q=(u,a)=>[x+r*u*Math.cos(a),h+.18*r*u*u,r*u*Math.sin(a)];for(let j=0;j<rings;j++)for(let i=0;i<n;i++)faces.push([q(j/rings,i*TAU/n),q((j+1)/rings,i*TAU/n),q((j+1)/rings,(i+1)*TAU/n),q(j/rings,(i+1)*TAU/n)]);return faces;}
function heights(t){let u=smooth((t-3.6)/5.2);return[.035+2.965*u,.035+1.465*u]}
function mesh(c,faces,pr,paint,seamless=false){let rows=faces.map((f,i)=>({p:f.map(pr),i}));rows.sort((a,b)=>b.p.reduce((s,p)=>s+p[2],0)/b.p.length-a.p.reduce((s,p)=>s+p[2],0)/a.p.length);rows.forEach(({p,i})=>{let col=paint(i);poly(c,p,col,seamless?col:null,seamless?1.1:1)});}
function ring(c,x,r,y,pr,col,w=2){let p=Array.from({length:65},(_,i)=>pr([x+r*Math.cos(i*TAU/64),y,r*Math.sin(i*TAU/64)]));c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function vessel(c,x,r,h,pr){
 // Draw complete cylinder walls and meniscus using actual XYZ surfaces.
 mesh(c,cylinder(x,r,-.35,h),pr,i=>`rgb(${49+Math.round(14*Math.sin(i/64*TAU))},${145+Math.round(15*Math.sin(i/64*TAU))},${157+Math.round(16*Math.sin(i/64*TAU))})`,true);
 mesh(c,meniscus(x,r,h),pr,i=>`rgb(${123+Math.round(14*(i%64)/64)},${202+Math.round(10*(i%64)/64)},${205+Math.round(10*(i%64)/64)})`,true);
 ring(c,x,r,h+.18*r,pr,'#dcffff',3);
 // A restrained transparent cylindrical envelope: back rim, wall highlights, near rim.
 mesh(c,cylinder(x,r+.06,-.4,4.1),pr,i=>`rgba(200,226,226,${.018+.045*Math.pow(Math.cos(i/64*TAU),8)})`);
 ring(c,x,r+.06,4.1,pr,'#7d9fa3',2.5);ring(c,x,r,4.1,pr,'#fffdf9',2);
 for(let a of[0,Math.PI]){let xx=x+(r+.06)*Math.cos(a);line(c,pr([xx,-.4,0]),pr([xx,4.1,0]),'#75989c',2)}
 for(let a of[.2,2.98]){let xx=x+(r+.045)*Math.cos(a),zz=(r+.045)*Math.sin(a);line(c,pr([xx,.05,zz]),pr([xx,4.02,zz]),'rgba(255,255,255,.88)',3)}
}
function apparatus(c,t,{cx=1230,cy=835,scale=147,labels=true}={}){const pr=projector(cx,cy,scale),hs=heights(t);const box=[[-3.05,-.55,-1.2],[3.05,-.55,-1.2],[3.05,-.55,1.2],[-3.05,-.55,1.2]],top=box.map(p=>[p[0],0,p[2]]);
 poly(c,box.map(pr),'#d8d9d0');poly(c,[box[0],box[1],top[1],top[0]].map(pr),'#a8c8c9');poly(c,top.map(pr),'#b6dadd');
 // Back reservoir edge.
 line(c,pr([-3.05,.2,-1.2]),pr([3.05,.2,-1.2]),'#6a969a',2);
 vessel(c,-1.45,.32,hs[0],pr);vessel(c,1.2,.64,hs[1],pr);
 // Transparent near reservoir wall leaves the continuous source water readable.
 poly(c,[[-3.05,-.55,1.2],[3.05,-.55,1.2],[3.05,.2,1.2],[-3.05,.2,1.2]].map(pr),'rgba(228,247,245,.38)','#91b4b5',2);
 line(c,pr([-3.05,0,1.2]),pr([3.05,0,1.2]),'#258c99',3);
 if(labels){let a=pr([-1.45,4.1,0]),b=pr([1.2,4.1,0]);txt(c,'细管',a[0],a[1]-29,34,C.wine,600,'center');txt(c,'粗管',b[0],b[1]-29,34,C.wine,600,'center');}
 return{pr,hs};}
function dim(c,pr,x,h,word){const a=pr([x,0,0]),b=pr([x,h,0]);line(c,a,b,C.wine,2);line(c,[a[0]-9,a[1]],[a[0]+9,a[1]],C.wine,2);line(c,[b[0]-9,b[1]],[b[0]+9,b[1]],C.wine,2);txt(c,word,a[0]+18,(a[1]+b[1])/2+10,30,C.wine,500)}
function footer(c){txt(c,'同种水 · 同种洁净润湿玻璃 · 其他条件相同',76,1007,26,C.muted);txt(c,'空间、液面形状与时间均为示意',1844,1007,25,C.muted,400,'right');}
function opening(c,t){const {pr,hs}=apparatus(c,t);txt(c,'水，为什么会',76,272,66,C.wine,500);txt(c,'自己爬上细管？',76,358,66,C.wine,500);line(c,[79,405],[202,405],C.force,7);txt(c,'没有泵，也没有人在吸。',79,463,33,C.ink);
 if(t>=4){let a=smooth((t-4)/.7);c.save();c.globalAlpha=a;txt(c,'看同一水面的两根玻璃管。',79,550,31,C.ink);if(t>7){dim(c,pr,-2.05,hs[0],'更高');dim(c,pr,2.13,hs[1],'较低');}c.restore();}
 txt(c,'共用水面',1340,943,28,C.water);line(c,[1304,928],pr([1.5,0,1.2]),C.water,2);}
function section(c,t){
 // Longitudinal section of a wetting tube: meniscus edges ABOVE centre.
 const left=200,right=760,base=868,mid=486,edge=414;const p=smooth((t-10)/.8);
 txt(c,'把液面放大，看它怎样被托住。',84,133,57,C.wine,500);
 c.fillStyle='#deebea';c.fillRect(left-32,258,32,base-258);c.fillRect(right,258,32,base-258);
 c.beginPath();c.moveTo(left,edge);c.bezierCurveTo(left+135,mid+20,right-135,mid+20,right,edge);c.lineTo(right,base);c.lineTo(left,base);c.closePath();let gr=c.createLinearGradient(0,edge,0,base);gr.addColorStop(0,'#67bac2');gr.addColorStop(1,'#207a89');c.fillStyle=gr;c.fill();
 c.beginPath();c.moveTo(left,edge);c.bezierCurveTo(left+135,mid+20,right-135,mid+20,right,edge);c.strokeStyle='#fffdf9';c.lineWidth=7;c.stroke();
 line(c,[left,258],[left,base],C.ink,3);line(c,[right,258],[right,base],C.ink,3);
 txt(c,'玻璃壁',174,230,28,C.muted);txt(c,'玻璃壁',718,230,28,C.muted);
 c.save();c.globalAlpha=p;arrow(c,[left,edge],[left,edge-122]);arrow(c,[right,edge],[right,edge-122]);c.restore();
 txt(c,'润湿管壁，液面边缘上翘。',958,319,43,C.ink,500);
 txt(c,'接触线处的表面张力',958,411,40,C.wine,500);txt(c,'有向上的分量。',958,471,40,C.wine,500);
 line(c,[793,354],[914,354],C.force,2);
 if(t>12){let q=smooth((t-12)/1);c.save();c.globalAlpha=q;arrow(c,[480,605],[480,784],C.wine,8);txt(c,'水柱重力',526,721,33,C.white,500);txt(c,'水柱越高，重量越大。',958,605,39,C.ink,500);c.restore();}
 if(t>15){c.save();c.globalAlpha=smooth((t-15)/.7);line(c,[960,682],[1663,682],'#bacac8',2);txt(c,'达到平衡，水就停止上升。',958,757,39,C.wine,500);c.restore();}
 txt(c,'纵向剖面 · 局部放大 · 箭头仅示方向',200,927,26,C.muted);}
function ending(c,t){const {pr,hs}=apparatus(c,9,{cx:632,cy:845,scale:135});dim(c,pr,-2.08,hs[0],'高');dim(c,pr,2.15,hs[1],'低');txt(c,'越细，为什么越高？',1104,264,55,C.wine,500);txt(c,'沿管壁一圈，托住整段水柱。',1106,358,35,C.ink);
 if(t>20){c.save();c.globalAlpha=smooth((t-20)/.8);
 for(const [x,r,word] of [[1238,38,'细管'],[1580,76,'粗管']]){c.beginPath();c.arc(x,495,r,0,TAU);c.fillStyle='#7cbcc3';c.fill();c.lineWidth=7;c.strokeStyle=C.force;c.stroke();txt(c,word,x,398,28,C.wine,500,'center');}
 line(c,[1276,495],[1377,468],C.force,2);txt(c,'接触线',1390,472,25,C.force);line(c,[1580,495],[1700,495],C.water,2);txt(c,'水的截面',1707,503,24,C.water);
 txt(c,'同尺度顶视：细管的周长 / 面积更大。',1106,615,29,C.ink);c.restore();}
 if(t>23){c.save();c.globalAlpha=smooth((t-23)/.7);c.fillStyle=C.wine;c.fillRect(1099,669,713,151);txt(c,'同条件下：管越细，',1131,731,39,C.white,500);txt(c,'平衡液面越高。',1131,787,39,C.white,500);c.restore();}
 txt(c,'毛细现象',1120,923,31,C.water,500);}
function render(c,t){t=Math.max(0,Math.min(DURATION,t));c.save();c.clearRect(0,0,W,H);c.fillStyle=C.bg;c.fillRect(0,0,W,H);
 // Quiet spatial accent, not particles: shallow laboratory daylight.
 let g=c.createLinearGradient(0,0,1920,1080);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(217,227,220,.35)');c.fillStyle=g;c.fillRect(0,0,W,H);
 if(t<10)opening(c,t);else if(t<19)section(c,t);else ending(c,t);footer(c);c.restore();}
const api={render,DURATION,heights,cylinder,meniscus,projector,geometry:{radii:[.32,.64],equilibriumHeights:[3,1.5],reservoirLevel:0,tubeTop:4.1,meniscusEdgeRiseFactor:.18},palette:C};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CapillaryFilm=api;
})(typeof window!=='undefined'?window:globalThis);
