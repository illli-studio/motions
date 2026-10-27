/* Original 27 s science film. Actual xyz cylindrical geometry, deterministic time sampling. */
(function(root){'use strict';
const W=1920,H=1080,D=27,PI=Math.PI;
const C={bg:'#E8F1E9',ink:'#20342D',muted:'#617A6E',faint:'#C9DAD0',paper:'#F7FAF5',gas:'#7457BD',water:'#327CA8',peach:'#E9AD88',yellow:'#E5CA74',glass:'#D7E7DE',steel:'#C3D0C6'};
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,q)=>a+(b-a)*q;
function txt(c,s,x,y,size=36,col=C.ink){c.fillStyle=col;c.font='400 '+size+'px CompressionSans, sans-serif';c.textBaseline='alphabetic';c.fillText(s,x,y)}
function line(c,a,b,col=C.ink,w=2){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke()}
function poly(c,p,fill,stroke,w=1){c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}}
function rr(c,x,y,w,h,r,fill,stroke,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function show(c,t,at,fn,d=.65){c.save();let q=ease((t-at)/d);c.globalAlpha*=q;c.translate(0,(1-q)*10);fn();c.restore()}
function label(c,t,at,s,x,y,size=36,col=C.ink){show(c,t,at,()=>txt(c,s,x,y,size,col))}
function pill(c,s,x,y,col=C.ink,w=150){rr(c,x,y-31,w,47,23,col);txt(c,s,x+18,y,27,C.paper)}
function arrow(c,a,b,col=C.peach,w=8,q=1){q=clamp(q);if(!q)return;let x=mix(a[0],b[0],q),y=mix(a[1],b[1],q),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);line(c,a,[x,y],col,w);poly(c,[[x,y],[x-23*Math.cos(ang-.47),y-23*Math.sin(ang-.47)],[x-23*Math.cos(ang+.47),y-23*Math.sin(ang+.47)]],col)}
function dotted(c,a,b,col=C.muted){c.save();c.setLineDash([5,7]);line(c,a,b,col,2);c.restore()}
function base(c,n){c.fillStyle=C.bg;c.fillRect(0,0,W,H);c.fillStyle=C.ink;c.beginPath();c.arc(108,66,7,0,PI*2);c.fill();txt(c,'微观实验室',132,76,29);txt(c,'压 缩 / COMPRESSION',1512,76,25,C.muted);line(c,[104,103],[1816,103],C.faint,1.4);line(c,[104,978],[1816,978],C.faint,1.4);txt(c,'常见条件 · 密封无针注射器 · 定性示意，非实际比例',106,1023,27,C.muted);txt(c,'0'+n+' / 04',1717,1023,27,C.muted)}
function shade(hex,k){let a=hex.replace('#','').match(/../g).map(x=>parseInt(x,16));return '#'+a.map(v=>Math.round(Math.min(255,v*k)).toString(16).padStart(2,'0')).join('')}
// Orthographic camera. Greater returned depth means nearer the viewer.
function camera(cx,cy,s,yaw=.30,pitch=.20){let a=Math.cos(yaw),b=Math.sin(yaw),u=Math.cos(pitch),v=Math.sin(pitch);const P=p=>{let x=p[0]*a-p[2]*b,z=p[0]*b+p[2]*a;return[cx+x*s,cy+(-p[1]*u+z*v)*s,z*u+p[1]*v]};P.view=[b*u,v,a*u];P.scale=s;return P}
function cylinder(m,x0,x1,r0,r1,col,alpha=1,N=56){for(let j=0;j<N;j++){let a=j*2*PI/N,b=(j+1)*2*PI/N,k=(a+b)/2;let n=[-(r1-r0)/(x1-x0),Math.cos(k),Math.sin(k)];m.push({v:[[x0,r0*Math.cos(a),r0*Math.sin(a)],[x1,r1*Math.cos(a),r1*Math.sin(a)],[x1,r1*Math.cos(b),r1*Math.sin(b)],[x0,r0*Math.cos(b),r0*Math.sin(b)]],n,col,alpha})}for(let k=0;k<2;k++){let x=k?x1:x0,r=k?r1:r0,pts=[];for(let j=0;j<N;j++){let a=j*2*PI/N;pts.push([x,r*Math.cos(a),r*Math.sin(a)])}m.push({v:pts,n:[k?1:-1,0,0],col,alpha})}}
function ringMesh(m,x0,x1,ro,ri,col,N=56){for(let j=0;j<N;j++){let a=j*2*PI/N,b=(j+1)*2*PI/N,k=(a+b)/2;for(let e=0;e<2;e++){let x=e?x1:x0;m.push({v:[[x,ro*Math.cos(a),ro*Math.sin(a)],[x,ro*Math.cos(b),ro*Math.sin(b)],[x,ri*Math.cos(b),ri*Math.sin(b)],[x,ri*Math.cos(a),ri*Math.sin(a)]],n:[e?1:-1,0,0],col,alpha:1})}m.push({v:[[x0,ro*Math.cos(a),ro*Math.sin(a)],[x1,ro*Math.cos(a),ro*Math.sin(a)],[x1,ro*Math.cos(b),ro*Math.sin(b)],[x0,ro*Math.cos(b),ro*Math.sin(b)]],n:[0,Math.cos(k),Math.sin(k)],col,alpha:1})}}
function renderMesh(c,mesh,P,side=1){let faces=[];for(let f of mesh){let dot=f.n.reduce((s,v,i)=>s+v*P.view[i],0);if(side===1&&dot<=0)continue;if(side===-1&&dot>=0)continue;let p=f.v.map(P),nlen=Math.hypot(...f.n),light=.84+.17*Math.max(0,(f.n[1]*.72-f.n[2]*.22-f.n[0]*.18)/nlen);faces.push({p,z:p.reduce((s,v)=>s+v[2],0)/p.length,col:shade(f.col,light),alpha:f.alpha??1})}faces.sort((a,b)=>a.z-b.z);for(let f of faces){c.save();c.globalAlpha*=f.alpha;poly(c,f.p,f.col,f.alpha===1?f.col:null,.75);c.restore()}}
function ringLine(c,P,x,r,col,w=1.5,start=0,end=2*PI){let pts=[];for(let i=0;i<=72;i++){let a=mix(start,end,i/72);pts.push(P([x,r*Math.cos(a),r*Math.sin(a)]))}c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function surfaceLine(c,P,x0,x1,r,a,col,w){line(c,P([x0,r*Math.cos(a),r*Math.sin(a)]),P([x1,r*Math.cos(a),r*Math.sin(a)]),col,w)}
function syringe(c,cx,cy,s,piston,kind,t,opt={}){const P=camera(cx,cy,s,opt.yaw??.30,opt.pitch??.20),col=kind==='water'?C.water:C.gas;
 c.save();c.fillStyle='rgba(32,52,45,.075)';c.beginPath();c.ellipse(cx+42,cy+s*1.11,s*4.35,s*.20,.04,0,2*PI);c.fill();
 let glass=[];cylinder(glass,-2.6,2.6,.66,.66,C.paper,.13);renderMesh(c,glass,P,-1);
 let contents=[];cylinder(contents,-2.53,piston,.565,.565,kind==='water'?'#8CB6C8':'#D8D1E8',1);renderMesh(c,contents,P,1);
 // Fine axial content streaks are simply optical shading, not molecular trajectories.
 surfaceLine(c,P,-2.49,piston-.03,.555,.15,kind==='water'?'rgba(218,241,246,.56)':'rgba(116,87,189,.24)',s*.025);
 let m=[];
 // Sealed outlet: shoulder, narrow luer-like neck, solid mint cap with yellow sealing band.
 cylinder(m,-2.86,-2.57,.18,.62,C.steel);cylinder(m,-3.25,-2.82,.16,.16,C.steel);
 cylinder(m,-3.60,-3.18,.27,.27,C.ink);cylinder(m,-3.22,-3.12,.285,.285,C.yellow);
 // Piston gasket and face remain perpendicular to x; the axial rod follows exactly.
 cylinder(m,piston,piston+.20,.575,.575,C.ink);cylinder(m,piston+.035,piston+.08,.587,.587,shade(col,.74));
 cylinder(m,piston+.20,piston+3.10,.13,.13,C.steel);cylinder(m,piston+3.08,piston+3.25,.83,.83,C.ink);cylinder(m,piston+3.24,piston+3.27,.72,.72,C.paper);
 // Fixed finger flange, barrel end collars and real annuli.
 ringMesh(m,2.55,2.70,.93,.68,C.steel);ringMesh(m,-2.65,-2.52,.70,.57,C.steel);ringMesh(m,2.45,2.60,.70,.59,C.steel);
 renderMesh(c,m,P,1);renderMesh(c,glass,P,1);
 ringLine(c,P,-2.57,.661,'rgba(32,52,45,.65)',1.7);ringLine(c,P,2.56,.661,'rgba(32,52,45,.57)',1.7);
 // Parallel barrel edges plus attached engraved arcs produce legible cylindrical construction.
 surfaceLine(c,P,-2.57,2.55,.663,-.21,'rgba(255,255,255,.86)',3.6);surfaceLine(c,P,-2.57,2.55,.663,PI-.21,'rgba(32,52,45,.34)',1.5);
 for(let i=0;i<=14;i++){let x=-2.27+i*.31;ringLine(c,P,x,.669,'rgba(32,52,45,.57)',i%2?1.2:1.8,.49,i%2?.73:.90)}
 ringLine(c,P,piston+.10,.59,'rgba(247,250,245,.58)',1.7,.35,2.65);
 for(let i=0;i<7;i++)ringLine(c,P,-3.53+i*.046,.272,'rgba(232,241,233,.23)',1,.2,2.8);
 c.restore();return{P,tip:P([-3.6,0,0]),piston:P([piston,0,0]),thumb:P([piston+3.27,0,0]),barrelStart:P([-2.6,0,0]),barrelEnd:P([2.6,0,0])}}
function bracket(c,a,b,y,col,words){line(c,[a,y],[b,y],col,2);line(c,[a,y-8],[a,y+8],col,2);line(c,[b,y-8],[b,y+8],col,2);if(words)txt(c,words,(a+b)/2-words.length*15,y+42,30,col)}
function scene0(c,t){base(c,1);label(c,t,.10,'空气能压，',106,260,91);label(c,t,.36,'水为什么难压？',106,370,91);label(c,t,.9,'把出口封住，再推活塞。',111,449,36,C.muted);
 let q=ease((t-2.08)/1.12),xp=mix(2,.15,q),v=syringe(c,1096,680,132,xp,'gas',t);
 show(c,t,.7,()=>{pill(c,'空气',113,575,C.gas,118);txt(c,'同样推一下，',113,652,39);txt(c,'内部会怎样？',113,706,39)});
 show(c,t,1.35,()=>{arrow(c,[v.thumb[0]+125,v.thumb[1]-16],[v.thumb[0]+24,v.thumb[1]-16],C.peach,9,q);txt(c,'推',v.thumb[0]+72,v.thumb[1]-56,32,C.ink)});
 show(c,t,1,()=>{let a=v.tip;line(c,[a[0]-10,a[1]+35],[a[0]-52,a[1]+147],C.muted,2);txt(c,'出口密封',a[0]-105,a[1]+190,32);c.beginPath();c.arc(a[0],a[1],7,0,PI*2);c.strokeStyle=C.yellow;c.lineWidth=3;c.stroke()});
 label(c,t,3.1,'先看：被关住的空气，体积变小了。',884,923,37,C.gas)}
function scene1(c,t){base(c,2);label(c,t,5.12,'相同的推力，结果很不同。',106,229,75);label(c,t,5.47,'同截面活塞 · 相同外加推力 · 两端出口都密封',111,296,34,C.muted);
 let q=ease((t-7.05)/1.90),air=mix(2,-.12,q),water=mix(2,1.985,q),a=syringe(c,1036,495,103,air,'gas',t),b=syringe(c,1036,784,103,water,'water',t);
 pill(c,'空气',111,453,C.gas,123);pill(c,'水',111,742,C.water,95);
 label(c,t,7.45,'明显缩小',112,526,41,C.gas);label(c,t,7.65,'几乎不变',112,816,41,C.water);
 show(c,t,6.0,()=>{for(let v of [a,b]){let end=[v.thumb[0]+28,v.thumb[1]],start=[end[0]+126,end[1]];arrow(c,start,end,C.peach,9,ease((t-6)/.7));txt(c,'同样推力',start[0]-101,start[1]-35,29)}});
 // Dashed references show the original piston station, not a second physical piston.
 show(c,t,7.0,()=>{let p=a.P([2,0,0]);dotted(c,[p[0],p[1]-92],[p[0],p[1]+110],C.gas);txt(c,'原位置',p[0]-36,p[1]+146,25,C.muted)});
 label(c,t,9.05,'空气容易压缩；水在这里的体积变化很小。',450,938,38);}
function sphere(c,x,y,r,col,shine=1){let g=c.createRadialGradient(x-r*.34,y-r*.40,r*.08,x+r*.12,y+r*.1,r);g.addColorStop(0,shade(col,1.20));g.addColorStop(.55,col);g.addColorStop(1,shade(col,.77));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,2*PI);c.fill();if(shine){c.fillStyle='rgba(255,255,255,.32)';c.beginPath();c.arc(x-r*.31,y-r*.35,r*.20,0,2*PI);c.fill()}}
// These viewing chambers are an explanatory xyz cutaway, not a second experiment.
// Deterministic particle paths prevent overlap; gas / liquid radii remain equal.
// Dense disordered liquid: deterministic hard-sphere proxy, not a lattice.
// Precomputed at 60 Hz; elastic neighbour collisions and wall reflections keep radii fixed.
let liquidCache=null;
function buildLiquid(){const width=709,height=318,N=160,dt=1/60,gap=27.2,margin=15.5;let seed=317;
 function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
 let a=[];for(let attempt=0;attempt<250000&&a.length<N;attempt++){let x=17+rnd()*675,y=17+rnd()*284;if(!a.some(p=>Math.hypot(x-p.x,y-p.y)<29.5))a.push({x,y})}
 for(let p of a){let ang=rnd()*PI*2,speed=9+rnd()*8;p.vx=Math.cos(ang)*speed;p.vy=Math.sin(ang)*speed}
 let frames=[];function save(){let f=new Float32Array(a.length*2);a.forEach((p,i)=>{f[2*i]=p.x;f[2*i+1]=p.y});frames.push(f)}save();
 for(let step=1;step<=660;step++){
  for(let p of a){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<margin||p.x>width-margin){p.x=Math.max(margin,Math.min(width-margin,p.x));p.vx=-p.vx}if(p.y<margin||p.y>height-margin){p.y=Math.max(margin,Math.min(height-margin,p.y));p.vy=-p.vy}}
  for(let pass=0;pass<3;pass++)for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){let p=a[i],q=a[j],dx=q.x-p.x,dy=q.y-p.y,d2=dx*dx+dy*dy;if(d2<gap*gap){let d=Math.sqrt(d2)||.001,nx=dx/d,ny=dy/d,corr=(gap-d)/2;p.x-=nx*corr;p.y-=ny*corr;q.x+=nx*corr;q.y+=ny*corr;let rel=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny;if(rel<0){p.vx+=rel*nx;p.vy+=rel*ny;q.vx-=rel*nx;q.vy-=rel*ny}}}
  for(let p of a){p.x=Math.max(margin,Math.min(width-margin,p.x));p.y=Math.max(margin,Math.min(height-margin,p.y))}save();
 }return frames;
}
function liquidState(t){if(!liquidCache)liquidCache=buildLiquid();let f=clamp((t-11)/11)*660,i=Math.min(659,Math.floor(f)),q=f-i,a=liquidCache[i],b=liquidCache[i+1],out=new Float32Array(a.length);for(let k=0;k<a.length;k++)out[k]=mix(a[k],b[k],q);return out}
const gasSeeds=(function(){let seed=941,a=[];function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}for(let k=0;k<100000&&a.length<28;k++){let p={x:26+rnd()*(453.76-52),y:26+rnd()*(318-52)};if(!a.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<52))a.push(p)}return a})();
function particleModel(kind,t,q,w=819,h=440){
 const gas=kind==='gas',radius=13,baseW=w-110,hh=h-122,movingW=baseW*(gas?mix(1,.64,q):mix(1,.994,q)),particles=[];
 if(gas){for(let i=0;i<gasSeeds.length;i++){let p=gasSeeds[i],x=radius+(movingW-2*radius)*(p.x-radius)/(453.76-2*radius)+7*Math.sin(t*1.45+i*2.399),y=p.y+7*Math.cos(t*1.31+i*1.723),z=23*Math.sin(i*3.114+t*.66);particles.push({x,y,z,radius})}}

 else {let state=liquidState(t);for(let i=0;i<state.length/2;i++){particles.push({x:state[i*2]*movingW/baseW,y:state[i*2+1],z:Math.sin(i*2.71+t*.20)*23,radius})}}

 return{radius,width:movingW,height:hh,particles};
}
function micro(c,x,y,w,h,kind,t,q){let gas=kind==='gas',col=gas?C.gas:C.water;rr(c,x,y,w,h,28,C.paper,'rgba(32,52,45,.13)',1.5);
 let left=x+40,top=y+69,baseW=w-110,hh=h-122,movingW=baseW*(gas?mix(1,.64,q):mix(1,.994,q)),right=left+movingW;
 c.save();c.beginPath();c.roundRect(left-4,top-8,baseW+40,hh+27,12);c.clip();
 // A small depth offset makes the cutaway wall and piston genuine projected volumes.
 let P=camera(left+movingW/2,top+hh/2,1,.12,.12),depth=23;
 poly(c,[[left,top],[right,top],[right+17,top-16],[left+17,top-16]],gas?'#E6E0F1':'#DBEAF0');
 poly(c,[[left,top],[left+17,top-16],[left+17,top+hh-16],[left,top+hh]],'#DEE8DF');
 rr(c,left,top,movingW,hh,5,gas?'rgba(116,87,189,.045)':'rgba(50,124,168,.065)');
 let model=particleModel(kind,t,q,w,h),r=model.radius;
 let particles=model.particles.map(p=>({x:left+p.x,y:top+p.y,z:p.z}));
 particles.sort((a,b)=>a.z-b.z);for(let p of particles)sphere(c,p.x,p.y,r,col);
 // Moving piston slab plus its visible top and side; fixed wall at left.
 poly(c,[[right,top-3],[right+18,top-18],[right+34,top-18],[right+17,top-3]],'#8C9E94');
 poly(c,[[right+17,top-3],[right+34,top-18],[right+34,top+hh-15],[right+17,top+hh]],'#748A7E');
 rr(c,right,top-3,18,hh+6,4,C.ink);rr(c,right+18,top+hh/2-8,100,16,5,C.steel);line(c,[left,top-1],[left,top+hh+1],C.ink,5);
 line(c,[left,top-1],[right,top-1],'rgba(32,52,45,.5)',1.6);line(c,[left,top+hh+1],[right,top+hh+1],'rgba(32,52,45,.5)',1.6);
 c.restore();txt(c,gas?'空气：粒子相距较远':'水：粒子已紧密排列',x+29,y+42,32,col);
 // A fixed diameter witness is the same size in both panels and throughout the film.
 sphere(c,x+35,y+h-28,13,col);txt(c,'粒子大小不变',x+58,y+h-18,27,C.muted);
 if(gas){let end=right-8;arrow(c,[right+103,top-36],[right+37,top-36],C.peach,6);txt(c,q>.5?'间距减小':'还有较多间隔',x+w-232,y+h-18,28,col)}else txt(c,'仍有小间隙',x+w-183,y+h-18,28,col);
 return{right,top,hh};}
function scene2(c,t){base(c,3);label(c,t,11.1,'压小的，不是粒子。',106,226,79);label(c,t,11.5,'把内部放大：变化主要在粒子间的距离。',111,293,36,C.muted);
 let q=ease((t-13.1)/3.3);show(c,t,11.65,()=>micro(c,107,366,819,440,'gas',t,q));show(c,t,11.85,()=>micro(c,994,366,819,440,'water',t,q));
 label(c,t,14.1,'间距能明显减小',145,878,41,C.gas);label(c,t,14.4,'可再压小的空间很少',1031,878,41,C.water);
 label(c,t,17.0,'示意粒子持续运动；两图不表示相同粒子数，也不表示实际尺度。',278,943,30,C.muted);}
function scene3(c,t){base(c,4);label(c,t,21.10,'松手，空气还会回弹。',106,232,75);label(c,t,21.55,'压缩气体产生的推力，能把活塞推回来。',111,300,35,C.muted);
 let q=ease((t-21.72)/.82),xp=mix(-.12,2,q),v=syringe(c,1030,560,112,xp,'gas',t);
 show(c,t,21.72,()=>{let p=v.thumb;arrow(c,[p[0]+26,p[1]],[p[0]+126,p[1]],C.gas,8,ease((t-21.72)/.40));txt(c,'释放',p[0]+35,p[1]-43,30,C.gas)});
 show(c,t,23.1,()=>{pill(c,'记住这一点',111,781,C.ink,192);txt(c,'气体易压缩',353,788,56,C.gas);txt(c,'水很难压缩，但不是绝对不可压缩',353,870,51,C.water)});
 label(c,t,25.0,'更大的压力下，水的微小体积变化也能被测量。',355,933,31,C.muted);}
const starts=[0,5,11,21],scenes=[scene0,scene1,scene2,scene3];
function render(c,t){t=Math.max(0,Math.min(D-.001,Number(t)||0));let i=0;for(let j=1;j<starts.length;j++)if(t>=starts[j])i=j;c.save();scenes[i](c,t);if(i>0&&t<starts[i]+.5){c.globalAlpha*=1-ease((t-starts[i])/.5);scenes[i-1](c,t)}c.restore()}
function diagnosticState(t){
 t=Math.max(0,Math.min(D-.001,Number(t)||0));let scene=starts.reduce((s,a,i)=>t>=a?i:s,0),q=ease((t-13.1)/3.3);
 let xp=scene===0?mix(2,.15,ease((t-2.08)/1.12)):scene===1?mix(2,-.12,ease((t-7.05)/1.90)):mix(-.12,2,ease((t-21.72)/.82));
 return{time:t,scene,macro:{barrelBounds:[-2.6,2.6],fluidStart:-2.53,airPiston:xp,waterPiston:mix(2,1.985,ease((t-7.05)/1.90)),pistonThickness:.2,rodLength:2.9,rodEnd:xp+3.1,capSealed:true},gas:particleModel('gas',t,q),water:particleModel('water',t,q)};
}
const api={render,diagnosticState,duration:D,width:W,height:H,camera,geometry:{projection:'fixed xyz orthographic camera, yaw +0.30 / pitch +0.20',syringes:'56-segment cylinders, frustum shoulders, annular collars, axial piston and rod; backface culled, depth sorted; ordered transparent shell',micro:'constant-radius spheres; disordered seeded gas positions with bounded motion, liquid disordered hard-sphere paths; schematic densities and distances only',sceneStarts:starts,heroTimes:[3.9,9.5,18,25.5]}};
if(typeof module!=='undefined')module.exports=api;root.CompressionScience=api;
})(typeof window!=='undefined'?window:globalThis);
