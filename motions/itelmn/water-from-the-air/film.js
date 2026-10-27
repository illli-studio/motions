(function(root){'use strict';
const PI=Math.PI,TAU=PI*2,D=28,C={bg:'#F4F5EB',ink:'#153E3E',cyan:'#56AEB7',table:'#C78663',muted:'#54716A',panel:'#D9E7DC'};
const clamp=x=>Math.max(0,Math.min(1,x)),e=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function txt(c,s,x,y,n=40,col=C.ink){c.font=n+'px Field';c.fillStyle=col;c.fillText(s,x,y)}
function path(c,pts,fill,stroke=null,w=2){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}}
function line(c,a,b,col=C.ink,w=2){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function circ(c,x,y,r,fill,stroke=null){c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function arrow(c,a,b,col=C.cyan,w=3){line(c,a,b,col,w);let q=Math.atan2(b[1]-a[1],b[0]-a[0]);line(c,b,[b[0]-18*Math.cos(q-.45),b[1]-18*Math.sin(q-.45)],col,w);line(c,b,[b[0]-18*Math.cos(q+.45),b[1]-18*Math.sin(q+.45)],col,w)}
function inText(c,t,start,s,x,y,n=40,col=C.ink){let a=e((t-start)/.6);c.save();c.globalAlpha*=a;txt(c,s,x+18*(1-a),y,n,col);c.restore()}
function base(c,t){c.fillStyle=C.bg;c.fillRect(0,0,1920,1080);let g=c.createLinearGradient(0,0,1920,1080);g.addColorStop(0,'rgba(255,255,255,.65)');g.addColorStop(1,'rgba(216,230,219,.32)');c.fillStyle=g;c.fillRect(0,0,1920,1080);txt(c,'日常里的科学',86,65,27,C.muted);txt(c,'过程加速；分子与水滴非等比例示意',86,1035,25,C.muted);}
// True xyz geometry, fixed explanatory camera; painter-sorted convex facets.
function camera(cx,cy,s,yaw=.28,pitch=.23){return p=>{let x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw),y=p[1]*Math.cos(pitch)-z*Math.sin(pitch);let depth=p[1]*Math.sin(pitch)+z*Math.cos(pitch);return [cx+s*x,cy-s*y,depth]}}
function poly3(c,vs,P,fill,stroke,w=1){path(c,vs.map(P).map(p=>p.slice(0,2)),fill,stroke,w)}
function ring(c,P,r,y,col,w=2){let pts=[];for(let i=0;i<=100;i++)pts.push(P([r*Math.cos(i*TAU/100),y,r*Math.sin(i*TAU/100)]).slice(0,2));path(c,pts,null,col,w)}
function drop(c,x,y,r){c.save();c.translate(x,y);let g=c.createRadialGradient(-r*.3,-r*.4,r*.05,0,0,r);g.addColorStop(0,'#F8FFFF');g.addColorStop(.35,'#C5EFF0');g.addColorStop(1,'#4D9DA9');c.beginPath();c.ellipse(0,0,r*.8,r,0,0,TAU);c.fillStyle=g;c.fill();c.strokeStyle='rgba(42,108,120,.45)';c.lineWidth=1.2;c.stroke();circ(c,-r*.24,-r*.4,r*.19,'#FFFFFF');c.restore()}
function glass(c,cx,cy,s,t,opt={}){let P=camera(cx,cy,s,opt.yaw??.24,opt.pitch??.22),fac=[];let H=2.4,R=1;
 c.save();c.fillStyle='rgba(41,79,68,.14)';c.beginPath();c.ellipse(cx+60,cy+20,s*1.4,s*.24,-.1,0,TAU);c.fill();c.restore();
 // A continuous intact vessel wall. Interior ice is rendered behind the front wall.
 for(let i=0;i<64;i++){let a=i*TAU/64,b=(i+1)*TAU/64;let vs=[[R*Math.cos(a),0,R*Math.sin(a)],[R*Math.cos(b),0,R*Math.sin(b)],[R*Math.cos(b),H,R*Math.sin(b)],[R*Math.cos(a),H,R*Math.sin(a)]];fac.push({vs,z:vs.map(P).reduce((v,p)=>v+p[2],0)/4,shade:Math.abs(Math.cos(a+.7))});}
 fac.sort((a,b)=>a.z-b.z);for(let f of fac.slice(0,32))poly3(c,f.vs,P,'rgba(79,159,167,.07)');
 // Liquid surface and body are geometric, not a video/image plate.
 let top=[];for(let i=0;i<64;i++)top.push([.88*Math.cos(i*TAU/64),1.52,.88*Math.sin(i*TAU/64)]);poly3(c,top,P,'rgba(121,197,197,.30)','#77B1B2',1.5);
 for(let ice of (opt.warm?[]:[[-.38,1.34,.1,.52,.25],[.36,1.32,-.15,.58,-.2],[0,1.39,.62,.32,.42]])){let[x,y,z,d,a]=ice;let v=[];for(let Y of [-1,1])for(let Z of [-1,1])for(let X of [-1,1]){let xx=X*d/2,zz=Z*d/2;v.push([x+xx*Math.cos(a)+zz*Math.sin(a),y+Y*d/2,z-xx*Math.sin(a)+zz*Math.cos(a)])}let fs=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]].map((is,k)=>({vs:is.map(i=>v[i]),k}));fs.sort((a,b)=>a.vs.map(P).reduce((v,p)=>v+p[2],0)-b.vs.map(P).reduce((v,p)=>v+p[2],0));for(let f of fs)poly3(c,f.vs,P,['#ACD5DA','#E9FFFF','#C5E7EC','#87BCC8','#D7F6F4','#B5DFE1'][f.k],'rgba(255,255,255,.88)',1.8);}
 for(let f of fac.slice(32))poly3(c,f.vs,P,'rgba(91,177,185,'+(.025+.09*f.shade)+')');
 ring(c,P,R,0,'#6FA8A6',3);ring(c,P,R,H,'#5C999A',3);ring(c,P,.92,H-.05,'rgba(255,255,255,.9)',3);
 for(let a of [0,PI])line(c,P([R*Math.cos(a),0,R*Math.sin(a)]).slice(0,2),P([R*Math.cos(a),H,R*Math.sin(a)]).slice(0,2),'rgba(51,122,127,.46)',2);
 for(let a of [.95,1.1])line(c,P([R*Math.cos(a),.23,R*Math.sin(a)]).slice(0,2),P([R*Math.cos(a),2.18,R*Math.sin(a)]).slice(0,2),'rgba(255,255,255,.8)',s*.035);
 if(opt.lid){let lift=opt.lift||0;for(let i=0;i<48;i++){let a=i*TAU/48,b=(i+1)*TAU/48;poly3(c,[[1.06*Math.cos(a),H+lift,1.06*Math.sin(a)],[1.06*Math.cos(b),H+lift,1.06*Math.sin(b)],[1.06*Math.cos(b),H+.07+lift,1.06*Math.sin(b)],[1.06*Math.cos(a),H+.07+lift,1.06*Math.sin(a)]],P,'#AF876A')}let vs=[];for(let i=0;i<80;i++)vs.push([1.06*Math.cos(i*TAU/80),H+.07+lift,1.06*Math.sin(i*TAU/80)]);poly3(c,vs,P,'#DBB797','#A57959',2);ring(c,P,1.06,H+.07+lift,'#8D6C56',2);}
 if(!opt.warm){let wet=opt.wet??e((t-.6)/3);for(let i=0;i<31;i++){let a=.38+(i*.71%2.35),y=.3+(i*.137%1.65);let drift=i===8?.25*e((t-1.5)/2):0;let p=P([1.015*Math.cos(a),y-drift,1.015*Math.sin(a)]);let r=(3+(i%5)*1.6)*s/185*wet; if(r>.1)drop(c,p[0],p[1],r)}}
 return P;
}
function table(c,y=900){c.fillStyle=C.table;c.beginPath();c.moveTo(0,y);c.lineTo(1920,y-105);c.lineTo(1920,1080);c.lineTo(0,1080);c.fill();for(let i=0;i<5;i++)line(c,[0,y+35+i*50],[1920,y-70+i*50],'rgba(120,71,45,.12)',2)}
function s0(c,t){base(c,t);table(c,950);glass(c,1370,mix(835,889,e(t/1.4)),220,t,{lid:true,pitch:.28});inText(c,t,.2,'冰杯外面的水，',92,285,86);inText(c,t,.45,'从哪儿来？',92,400,96);inText(c,t,1.6,'明明没有倒出来……',100,532,43,C.muted);inText(c,t,2.6,'外壁却慢慢湿了。',100,607,43,C.ink);let p=camera(1370,889,220,.24,.28)([.6,1.05,.83]);arrow(c,[1090,710],[p[0]-20,p[1]],'#517E7D',3);inText(c,t,2,'杯外的水滴',790,738,35);}
function s1(c,t){base(c,t);inText(c,t,5.2,'杯子没漏，外壁也会湿。',90,180,76);inText(c,t,5.5,'同一环境 · 完整杯壁 · 盖紧杯盖',96,259,38,C.muted);table(c,941);glass(c,645,883,190,t,{lid:true,wet:e((t-6)/2),lift:.5*(1-e((t-5.5)/.7))});glass(c,1370,883,190,t,{lid:true,warm:true});inText(c,t,6.1,'冰水杯',550,961,43);inText(c,t,6.3,'常温水杯',1255,961,43);inText(c,t,7,'外壁出现水滴',330,360,35,'#287D83');inText(c,t,7.4,'本示意条件下保持干燥',1150,360,33,C.muted);}
function molecule(c,x,y,alpha=1){c.save();c.globalAlpha*=alpha;line(c,[x,y],[x-12,y-10],'#4F8784',2);line(c,[x,y],[x+13,y-8],'#4F8784',2);circ(c,x,y,7,null,'#2E817D');circ(c,x-13,y-11,4,'#F4F5EB','#699D98');circ(c,x+14,y-9,4,'#F4F5EB','#699D98');c.restore()}
function s2(c,t){base(c,t);inText(c,t,10.2,'空气里，藏着看不见的水。',90,185,76);inText(c,t,10.5,'水蒸气，是气态的水。',95,270,43,C.muted);table(c,945);glass(c,445,889,205,t,{lid:true});c.save();let a=e((t-10.5)/.7);c.globalAlpha=a;path(c,[[860,358],[1810,358],[1810,876],[860,876]],'#E5EEE6');txt(c,'杯外空气 · 放大示意',900,421,37);for(let i=0;i<16;i++){let x=965+(i*173%720)+Math.sin(t*.8+i)*18,y=495+(i*83%300)+Math.cos(t+i)*15;molecule(c,x,y)}txt(c,'这些符号不是肉眼可见的水滴',900,831,33,C.muted);line(c,[645,585],[860,503],'#6E9188',2);line(c,[650,790],[860,768],'#6E9188',2);c.restore();}
function s3(c,t){base(c,t);inText(c,t,16.2,'杯壁低于露点，水蒸气凝结。',90,178,69);inText(c,t,16.5,'气态  →  液态',95,264,43,'#287D83');let a=e((t-16)/.6);c.save();c.globalAlpha=a;
 // A local cross section: neither gas nor droplets cross the intact wall.
 path(c,[[115,358],[585,358],[585,875],[115,875]],'#DCEFF0');path(c,[[585,358],[665,380],[665,900],[585,875]],'#8ABFC3');path(c,[[585,358],[665,380],[713,351],[635,330]],'#EFFFFF');path(c,[[115,358],[585,358],[635,330],[165,330]],'#C1E2E4');
 for(let q of [[195,520,100],[380,690,100]]){let[x,y,d]=q;path(c,[[x,y],[x+d,y-30],[x+d+35,y+65],[x+32,y+95]],'#A6D4DE','#F9FFFF',3);line(c,[x,y],[x+32,y+95],'#EFFFFF',3)}
 txt(c,'杯内',255,960,37);txt(c,'完整杯壁',537,960,33);txt(c,'杯外空气',1200,960,37);txt(c,'冰水',217,438,32,C.muted);
 const u=clamp((t-17)/5.2);for(let i=0;i<26;i++){let start=1000+(i*157%760),yy=650+(i*53%135),q=e(clamp(u*1.5-i*.014)),end=696+(i%3)*12;let x=mix(start,end,q);if(q<.88)molecule(c,x,yy,1-q*.7)}
 // Each bead represents accumulated many-molecule condensate, not one molecule.
 for(let i=0;i<8;i++){let w=e((t-18.2-i*.17)/2.5);drop(c,676+(i%2)*5,455+i*49,(10+i%3*3)*w)}
 arrow(c,[1065,610],[790,610],'#2B8583',4);txt(c,'水蒸气在外壁',1030,445,48);txt(c,'聚成液态水滴',1030,516,48);txt(c,'露点随空气中的水汽含量等条件变化',910,862,31,C.muted);c.restore();}
function s4(c,t){base(c,t);table(c,948);glass(c,1370,895,221,t,{lid:true,wet:1,pitch:.27});inText(c,t,23.2,'水，来自空气。',92,293,92);inText(c,t,23.65,'冷，只让它变成水滴。',96,413,59);inText(c,t,24.5,'不是杯子漏了，也不是冷“造”出了水。',100,566,36,C.muted);inText(c,t,25.3,'看是否凝结：',100,718,43);inText(c,t,25.6,'比较杯壁温度与周围空气的露点。',100,790,40,'#287D83');}
const starts=[0,5,10,16,23],scenes=[s0,s1,s2,s3,s4];function render(c,t){t=Math.max(0,Math.min(27.999,t));let i=starts.findLastIndex(x=>x<=t);c.save();scenes[i](c,t);if(i&&t<starts[i]+.55){c.globalAlpha=1-e((t-starts[i])/.55);scenes[i-1](c,t)}c.restore();c.save();c.fillStyle='rgba(244,245,235,.91)';c.fillRect(70,999,695,57);txt(c,'过程加速；分子与水滴非等比例示意',86,1035,25,C.muted);c.restore()}
const api={render,duration:D,geometry:{cup:'64 facet intact xyz cylinder; 80 vertex lid; three xyz cubes; sorted transparent faces',projection:'yaw/pitch orthographic',outerDropletRadius:1.015,wallRadius:1},camera};if(typeof module!=='undefined')module.exports=api;root.CondensationScience=api;
})(typeof window!=='undefined'?window:globalThis);
