(function(root){'use strict';
const W=1920,H=1080,C={bg:'#241a26',cream:'#eee1cf',red:'#ff8067',mint:'#81d7ce',wood:'#a57450',muted:'#b8a7b5'};
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t;
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
function shade(hex,s){let a=hex.slice(1).match(/../g).map(x=>parseInt(x,16));return '#'+a.map(v=>Math.round(Math.min(255,v*s)).toString(16).padStart(2,'0')).join('')}
function projectImage(p){return [6,-6*p[1]/(-p[0]),-6*p[2]/(-p[0])];}
function objectMesh(yoff=0){let faces=[];const center=[-6,yoff,0];function face(v,c){faces.push({v:v.map(p=>add(p,center)),c})}
// Revolved ceramic body: genuine XYZ surface, not a sprite.
const profile=[[-1.25,.55],[-1.1,.88],[-.65,1.12],[0,1.18],[.65,.98],[.9,.65],[1,.65]];
for(let j=0;j<profile.length-1;j++)for(let i=0;i<40;i++){let a=i*Math.PI/20,b=(i+1)*Math.PI/20;let [y,r]=profile[j],[Y,R]=profile[j+1];face([[r*Math.cos(a),y,r*Math.sin(a)],[r*Math.cos(b),y,r*Math.sin(b)],[R*Math.cos(b),Y,R*Math.sin(b)],[R*Math.cos(a),Y,R*Math.sin(a)]],j<2?C.mint:C.red)}
for(let i=0;i<40;i++){let a=i*Math.PI/20,b=(i+1)*Math.PI/20;face([[.75*Math.cos(a),1.02,.75*Math.sin(a)],[.75*Math.cos(b),1.02,.75*Math.sin(b)],[0,1.4,0]],C.red)}
// Spout points to the right in object coordinates; handle is on the opposite side.
function tube(points,radii,col){for(let j=0;j<points.length-1;j++)for(let i=0;i<16;i++){let a=i*Math.PI/8,b=(i+1)*Math.PI/8;let p=points[j],q=points[j+1];face([[p[0]+radii[j]*Math.cos(a),p[1]+radii[j]*Math.sin(a),p[2]],[p[0]+radii[j]*Math.cos(b),p[1]+radii[j]*Math.sin(b),p[2]],[q[0]+radii[j+1]*Math.cos(b),q[1]+radii[j+1]*Math.sin(b),q[2]],[q[0]+radii[j+1]*Math.cos(a),q[1]+radii[j+1]*Math.sin(a),q[2]]],col)}}
tube([[0,-.3,.8],[0,.2,1.5],[0,.9,2.15]],[.4,.27,.18],C.red);
for(let j=0;j<28;j++){let a=-Math.PI/2+j*Math.PI/28,b=-Math.PI/2+(j+1)*Math.PI/28;for(let k=0;k<10;k++){let u=k*Math.PI/5,v=(k+1)*Math.PI/5;const p=(a,u)=>[.14*Math.sin(u),.7*Math.sin(a)+.1,-1-.85*Math.cos(a)-.14*Math.cos(u)];face([p(a,u),p(a,v),p(b,v),p(b,u)],C.mint)}}return faces;}
function render(ctx,t){ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.lineCap='round';ctx.lineJoin='round';ctx.textAlign='left';t=Math.max(0,Math.min(27,t));ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);const intro=t<7.7,top=t>=17&&t<22,close=t>=22;let az=intro?-.72:top?-.02:-.36,el=intro?.34:top?1.45:0;let reveal=ease((t-4.6)/2);let zoom=intro?78:top?88:92;
const right=[Math.cos(az),0,-Math.sin(az)],up=[-Math.sin(az)*Math.sin(el),Math.cos(el),-Math.cos(az)*Math.sin(el)],view=[Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)];const pr=p=>[960+dot(p,right)*zoom,610-dot(p,up)*zoom];let faces=[];
function poly(v,c,alpha=1,flat=false){faces.push({v,c,alpha,flat})}function box(a,b,c,alpha=1){const [x,y,z]=a,[X,Y,Z]=b;poly([[x,y,z],[X,y,z],[X,Y,z],[x,Y,z]],c,alpha);poly([[x,y,Z],[x,Y,Z],[X,Y,Z],[X,y,Z]],c,alpha);poly([[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]],c,alpha);poly([[x,y,z],[x,y,Z],[X,y,Z],[X,y,z]],c,alpha);poly([[x,y,z],[x,Y,z],[x,Y,Z],[x,y,Z]],c,alpha);poly([[X,y,z],[X,y,Z],[X,Y,Z],[X,Y,z]],c,alpha)}
function line(points,c,width=4,progress=1){let pts=points.map(pr);ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap='round';let lengths=pts.slice(1).map((p,i)=>Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]));let left=lengths.reduce((a,b)=>a+b,0)*clamp(progress);ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=0;i<lengths.length;i++){let f=Math.min(1,left/lengths[i]);ctx.lineTo(lerp(pts[i][0],pts[i+1][0],f),lerp(pts[i][1],pts[i+1][1],f));left-=lengths[i];if(left<=0)break;}ctx.stroke()}
function text(s,x,y,size=38,col=C.cream,align='left'){ctx.font=`${size}px PinholeText`;ctx.fillStyle=col;ctx.textAlign=align;ctx.fillText(s,x,y);ctx.textAlign='left'}
const move=close?.55*Math.sin((t-22)*1.1):t<4.6?.3*Math.sin(t*Math.PI/2.3):0,mesh=objectMesh(move);
// Table and cabinet. Front wall removed visibly for the explanatory cutaway.
if(!close){box([-9,-3.1,-4],[7,-2.9,4],'#4b3038');box([0,-2.9,-3],[6.2,-2.7,3],C.wood);box([0,-2.7,-3.1],[6.2,2.9,-3],'#352936');if(intro){box([0,2.8+reveal*3,-3],[6.2,3+reveal*3,3],C.wood,1-reveal);}
// Opaque aperture plane, four pieces around a small square aperture.
const h=.09;box([-.08,h,-3],[.08,2.9,3],C.wood);box([-.08,-2.7,-3],[.08,-h,3],C.wood);box([-.08,-h,-3],[.08,h,-h],C.wood);box([-.08,-h,h],[.08,h,3],C.wood);
poly([[6,-2.6,-2.9],[6,2.8,-2.9],[6,2.8,2.9],[6,-2.6,2.9]],C.cream,1,true);mesh.forEach(f=>poly(f.v,f.c));
// Selected visible surfaces projected through the same point; flat colors are a schematic image.

faces.sort((a,b)=>dot(a.v.reduce(add,[0,0,0]),view)/a.v.length-dot(b.v.reduce(add,[0,0,0]),view)/b.v.length);for(const f of faces){let n=norm(cross(sub(f.v[1],f.v[0]),sub(f.v[2],f.v[0])));let light=f.flat?1:.72+.28*Math.abs(dot(n,norm([-.5,1,1])));ctx.globalAlpha=f.alpha;ctx.fillStyle=shade(f.c,light);ctx.beginPath();f.v.map(pr).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke()}ctx.globalAlpha=1;
ctx.save();ctx.beginPath();[[6,-2.6,-2.9],[6,2.8,-2.9],[6,2.8,2.9],[6,-2.6,2.9]].map(pr).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();for(const f of [...mesh].sort((a,b)=>a.v.reduce((s,p)=>s+p[0],0)/a.v.length-b.v.reduce((s,p)=>s+p[0],0)/b.v.length)){ctx.fillStyle=shade(f.c,.82);ctx.beginPath();f.v.map(projectImage).map(pr).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke()}ctx.restore();
if(!top)text('屏幕',1470,915,28,C.muted,'center');
// Overlay selected ray paths only after cutaway, so walls cannot suggest transparent real cameras.
if(t>=8&&t<11){ctx.save();ctx.globalAlpha=.75*(1-ease((t-10.2)/.8));line([[-6,1.4,0],[0,1.05,0]],'#d0a68e',4,(t-8)/1.1);if(t>=9.1){let q=pr([0,1.05,0]);ctx.strokeStyle='#d0a68e';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(q[0]-8,q[1]-8);ctx.lineTo(q[0]+8,q[1]+8);ctx.moveTo(q[0]+8,q[1]-8);ctx.lineTo(q[0]-8,q[1]+8);ctx.stroke();text('被箱壁挡住',q[0]+25,q[1]-25,28,'#d0a68e')}ctx.restore()}
if(t>=8&&t<17){const A=[-6,1.4,0],B=[-6,-1.25,0];line([A,[0,0,0],projectImage(A)],C.red,7,(t-8)/3);if(t>=12)line([B,[0,0,0],projectImage(B)],C.mint,7,(t-12)/3);for(const p of [A,B,[0,0,0]]){let q=pr(p);ctx.fillStyle=p===A?C.red:p===B?C.mint:C.cream;ctx.beginPath();ctx.arc(...q,9,0,Math.PI*2);ctx.fill()}text('小孔',960,665,30,C.cream,'center');text('顶部',275,435,32,C.red);if(t>=11)text('像的下方',1585,795,32,C.red);if(t>=12)text('底部',275,785,32,C.mint);if(t>=15)text('像的上方',1585,470,32,C.mint);}
if(top){const A=[-6,.9,2.15],B=[-6,.1,-1.85];line([A,[0,0,0],projectImage(A)],C.red,6,(t-17)/2);line([B,[0,0,0],projectImage(B)],C.mint,6,(t-18.5)/2);text('俯视剖面',960,880,30,C.muted,'center');text('壶把',285,410,30,C.mint);text('壶嘴',285,830,30,C.red);text('壶嘴的像',1530,400,28,C.red);text('壶把的像',1530,800,28,C.mint)}
}else{
// Screen close-up: same pinhole mapping, not a second independently animated image.
ctx.fillStyle=C.cream;ctx.fillRect(850,285,850,570);ctx.strokeStyle=C.wood;ctx.lineWidth=22;ctx.strokeRect(850,285,850,570);
ctx.save();ctx.beginPath();ctx.rect(861,296,828,548);ctx.clip();let screen=objectMesh(move);for(const f of screen){ctx.fillStyle=shade(f.c,.82);ctx.beginPath();f.v.map(projectImage).forEach((p,i)=>{let x=1275+p[2]*140,y=565-p[1]*140;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke()}
ctx.restore();
// Small source-object view explicitly labelled, paired by a single oppositely moving guide.
for(const f of mesh){ctx.fillStyle=f.c;ctx.beginPath();f.v.forEach((p,i)=>{let x=380+p[2]*100,y=580-p[1]*100;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke()}text('物体',380,830,32,C.muted,'center');text('暗箱里的像',1275,925,32,C.muted,'center');text('物与像，反向移动',960,205,50,C.cream,'center');
}
let headline=t<4.6?'光没拐弯，像怎么倒了？':t<8?'打开暗箱，只看一条光路':t<12?'顶部 → 小孔 → 屏幕下方':t<17?'底部 → 小孔 → 屏幕上方':t<22?'左右，也在同一个孔交叉':'光走直线，像就倒立';
text(headline,960,115,58,C.cream,'center');if(t<4.6)text('剖面示意：暗箱内，竟然是倒着的。',960,190,34,C.muted,'center');else if(t<8)text('剖面示意：真实暗箱必须遮光',960,190,32,C.muted,'center');else if(t<17)text('均匀介质中，光沿直线传播',960,200,34,C.muted,'center');else if(t<22)text('不是小孔把光折弯，而是筛选了能通过的光',960,200,34,C.muted,'center');
text('几何光学简化示意 · 非等比例 · 不模拟衍射与曝光',960,1020,25,C.muted,'center');
// Short motivated cut dips separate side, top and screen views without decorative wipes.
for(const cut of [7.7,17,22]){let a=Math.max(0,1-Math.abs(t-cut)/.18)*.75;if(a){ctx.globalAlpha=a;ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}}
}
root.PinholeFilm={render,projectImage,objectMesh};if(typeof module!=='undefined')module.exports=root.PinholeFilm;
})(typeof window!=='undefined'?window:globalThis);
