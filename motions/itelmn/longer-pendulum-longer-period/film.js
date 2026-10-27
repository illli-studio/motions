(function(root){'use strict';
const D=28,PI=Math.PI,TAU=2*PI,W=1920,H=1080;
const C={bg:'#F4F7F8',ink:'#153C48',muted:'#506D77',short:'#D85C3F',long:'#087F8C',frame:'#CDDCE0',grid:'#DDE7EA'};
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function text(c,s,x,y,n=36,col=C.ink,w=600){c.font=`${w} ${n}px PendulumSans,sans-serif`;c.fillStyle=col;c.textBaseline='alphabetic';c.fillText(s,x,y)}
function line(c,a,b,col,w=3){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function poly(c,p,col){c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=col;c.lineWidth=.6;c.stroke()}
function shade(h,k){return '#'+h.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*k))).toString(16).padStart(2,'0')).join('')}
function view(t){const q=smooth((t-7)/3),az=mix(-.16,-.035,q),el=mix(.17,.055,q),s=1;return p=>{const u=p[0]*Math.cos(az)-p[2]*Math.sin(az),z=p[0]*Math.sin(az)+p[2]*Math.cos(az);return[670+u*s,350+p[1]*Math.cos(el)-z*Math.sin(el),z*Math.cos(el)+p[1]*Math.sin(el)]}}
function box(m,x,y,z,wx,hy,dz,col){const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>[x+v[0]*wx/2,y+v[1]*hy/2,z+v[2]*dz/2]);[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]].forEach((f,i)=>m.push({p:f.map(j=>p[j]),col:shade(col,[.77,.98,1.08,.72,.87,.9][i])}))}
function sphere(m,center,r,col){const lat=16,lon=28;function p(a,b){return[center[0]+r*Math.sin(a)*Math.cos(b),center[1]+r*Math.cos(a),center[2]+r*Math.sin(a)*Math.sin(b)]}for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){const a=i*PI/lat,b=j*TAU/lon,a2=(i+1)*PI/lat,b2=(j+1)*TAU/lon,mid=(a+a2)/2,ang=(b+b2)/2,n=[Math.sin(mid)*Math.cos(ang),Math.cos(mid),Math.sin(mid)*Math.sin(ang)],k=.50+.48*Math.max(0,(-n[0]*.45-n[1]*.65+n[2]*.6));m.push({p:[p(a,b),p(a2,b),p(a2,b2),p(a,b2)],col:shade(col,k)})}}
function drawMesh(c,m,P){m.map(f=>{const p=f.p.map(P);return{p,col:f.col,z:p.reduce((s,v)=>s+v[2],0)/p.length}}).sort((a,b)=>a.z-b.z).forEach(f=>poly(c,f.p,f.col))}
function angle(t,T){return PI*8/180*Math.cos(TAU*Math.max(0,t-4)/T)}
function bob(t,x,L,T){const a=angle(t,T);return[x+L*Math.sin(a),L*Math.cos(a),0]}
function ghost(c,P,x,L){const a=PI*8/180,p=P([x+L*Math.sin(a),L*Math.cos(a),0]);c.save();c.setLineDash([6,7]);c.strokeStyle=C.muted;c.lineWidth=2;c.beginPath();c.arc(p[0],p[1],28,0,TAU);c.stroke();c.restore()}
function trace(c,x,y,w,T,time,col){line(c,[x,y],[x+w,y],C.grid,2);c.beginPath();for(let i=0;i<=160;i++){const u=i/160,tt=u*4;const yy=y-22*Math.cos(TAU*tt/T);i?c.lineTo(x+u*w,yy):c.moveTo(x,yy)}c.strokeStyle=shade(col,1.12);c.lineWidth=3;c.stroke();const q=((Math.max(0,time-4)%4)/4),px=x+w*q,py=y-22*Math.cos(TAU*q*4/T);c.beginPath();c.arc(px,py,6,0,TAU);c.fillStyle=col;c.fill()}
function mechanism(c,t){
text(c,'同样偏角，长摆回复得更缓。',80,174,64);text(c,'比较的是回复角加速度：摆长越长，同偏角下它越小。',83,233,33,C.muted);
for(const [cx,L,col,ratio]of[[500,'L',C.short,'1'],[1400,'4L',C.long,'1/4']]){const P=p=>[cx+p[0],345+p[1],p[2]],a=PI*8/180,pos=[340*Math.sin(a),340*Math.cos(a),0];c.save();c.setLineDash([6,8]);line(c,[cx,345],[cx,715],C.grid,3);c.restore();line(c,P([0,0,0]),P(pos),C.ink,5);const m=[];sphere(m,[0,0,0],9,C.ink);sphere(m,pos,38,col);drawMesh(c,m,P);c.beginPath();c.arc(cx,345,160,PI/2-a,PI/2);c.strokeStyle=col;c.lineWidth=5;c.stroke();text(c,'8°',cx+45,510,35,col);text(c,'摆长 '+L,cx-130,293,38,col);text(c,L==='L'?'局部放大示意（不同比例）':'局部缩小示意（不同比例）',cx-175,328,25,C.muted);text(c,'回复角加速度',cx-155,795,34,C.muted);text(c,ratio,cx+75,885,62,col);
// Equal-thickness bars encode relative magnitude only; no directional arrow.
const barX=cx-155,barY=849,barWidth=L==='L'?180:45;c.fillStyle=C.grid;c.fillRect(barX,barY,180,18);c.fillStyle=col;c.fillRect(barX,barY,barWidth,18);text(c,'相对值',cx-155,914,25,C.muted);

}
text(c,'局部角度比较 · 两图缩放不同 · 大小条示意角加速度相对值',80,974,28,C.muted);text(c,'同重力、小摆角：回复角加速度的大小与摆长成反比。',80,1020,28,C.muted);
}
function render(c,time){const t=Math.max(0,Math.min(D,time)),P=view(t);c.save();c.fillStyle=C.bg;c.fillRect(0,0,W,H);text(c,'时 间 实 验 室',80,65,25,C.muted);text(c,'THE LONG SWING',1500,65,24,C.muted);line(c,[80,94],[1840,94],C.grid,2);if(t>=18&&t<23){c.globalAlpha=Math.min(smooth((t-18)/.28),smooth((23-t)/.28));mechanism(c,t);c.restore();return;}
if(t>=17.72&&t<18)c.globalAlpha=smooth((18-t)/.28);if(t>=23&&t<23.28)c.globalAlpha=smooth((t-23)/.28);
let title=t<8?'长摆，为什么摆得慢？':t<18?'完整来回一次，才算一个周期。':'摆长变成 4 倍，周期约为 2 倍。';let sub=t<8?'同处一地、相同小摆角，同时松手。':t<18?'回到同一侧、同一状态。看橙色与蓝色各自归位。':'同重力、小角度：长摆完成一次来回，需要更久。';let alpha=1;for(const cut of[8,18])if(Math.abs(t-cut)<.22)alpha=Math.abs(t-cut)/.22;c.save();c.globalAlpha=alpha;text(c,title,80,174,64);text(c,sub,83,233,33,C.muted);c.restore();
// Stationary xyz stand, with a platform below both bobs.
const frame=[];box(frame,-470,245,55,25,560,38,C.frame);box(frame,400,245,55,25,560,38,C.frame);box(frame,-35,-35,40,900,24,50,C.frame);box(frame,-35,535,45,970,25,230,'#D4E0E3');for(const x of[-230,160])box(frame,x,-16,20,12,42,60,C.frame);drawMesh(c,frame,P);
// Shadows on the platform shift with the projected xyz bob position.
for(const [x,L,T,col]of[[-230,112,2,C.short],[160,448,4,C.long]]){const pos=bob(t,x,L,T),sh=P([pos[0],520,0]);c.save();c.globalAlpha=.10;c.fillStyle=C.ink;c.beginPath();c.ellipse(sh[0],sh[1],40,8,0,0,TAU);c.fill();c.restore();}
const objects=[];for(const [x,L,T,col]of[[-230,112,2,C.short],[160,448,4,C.long]]){const p=bob(t,x,L,T),a=P([x,0,0]),b=P(p);line(c,a,b,C.ink,4);sphere(objects,[x,0,0],8,C.ink);sphere(objects,p,27,col);}drawMesh(c,objects,P);
// Explicit centre-to-pivot lengths; geometrical ratio exactly four.
for(const [x,L,col,label]of[[-230,112,C.short,'L'],[160,448,C.long,'4L']]){const a=P([x-95,0,0]),b=P([x-95,L,0]);line(c,a,b,col,2);line(c,[a[0]-7,a[1]],[a[0]+7,a[1]],col,2);line(c,[b[0]-7,b[1]],[b[0]+7,b[1]],col,2);text(c,label,a[0]-58,(a[1]+b[1])/2+12,36,col);}
text(c,'短摆',365,290,36,C.short);text(c,'长摆',755,290,36,C.long);
if(t>=4&&t<18){ghost(c,P,-230,112);ghost(c,P,160,448);text(c,'虚线圈：释放位置',1010,304,27,C.muted);const q=Math.max(0,t-4);const n1=Math.floor((q+1e-7)/2),n2=Math.floor((q+1e-7)/4);text(c,'完整来回',1300,370,31,C.muted);text(c,`${n1} 次`,1300,438,58,C.short);text(c,`${n2} 次`,1300,510,58,C.long);trace(c,1280,620,470,2,t,C.short);trace(c,1280,710,470,4,t,C.long);text(c,'圆点：当前摆动相位',1240,793,29,C.muted);}
else if(t>=18){text(c,'摆长',1270,375,31,C.muted);text(c,'L  →  4L',1270,440,58,C.ink);text(c,'周期',1270,530,31,C.muted);text(c,'T  →  2T',1270,600,58,C.long);text(c,'同样偏角，长摆回复的',1180,695,32,C.ink);text(c,'角加速度较小。',1180,742,38,C.long);text(c,'变慢的是来回节奏，不是所有瞬时速度。',1110,816,26,C.muted);}
else{text(c,t<4?'准备，松手':'同样 8° 小摆角',1270,410,42,C.ink);text(c,'两颗摆球大小、质量相同',1230,485,31,C.muted);text(c,'长短改变，节奏不同。',1230,550,36,C.long);}
text(c,'理想单摆近似 · 小摆角 · 同一重力环境 · 忽略阻力 · 几何示意',80,1018,27,C.muted);text(c,'摆长：悬点到摆球中心',80,973,27,C.muted);c.restore();}
const textStrings=['局部放大示意（不同比例）','局部缩小示意（不同比例）','同样偏角，长摆回复得更缓。','比较的是回复角加速度：摆长越长，同偏角下它越小。','摆长','回复角加速度','局部角度比较 · 两图缩放不同 · 大小条示意角加速度相对值','同重力、小摆角：回复角加速度的大小与摆长成反比。','相对值','8°','1/4','时 间 实 验 室','长摆，为什么摆得慢？','同处一地、相同小摆角，同时松手。','完整来回一次，才算一个周期。','回到同一侧、同一状态。看橙色与蓝色各自归位。','摆长变成 4 倍，周期约为 2 倍。','同重力、小角度：长摆完成一次来回，需要更久。','短摆','长摆','虚线圈：释放位置','完整来回','次','圆点：当前摆动相位','摆长','周期','同样偏角，长摆回复的','角加速度较小。','变慢的是来回节奏，不是所有瞬时速度。','准备，松手','同样 8° 小摆角','两颗摆球大小、质量相同','长短改变，节奏不同。','理想单摆近似 · 小摆角 · 同一重力环境 · 忽略阻力 · 几何示意','摆长：悬点到摆球中心'];
const api={render,duration:D,width:W,height:H,textStrings,metadata:{title:'长摆，为什么摆得慢？',font:'PendulumSans',keyframes:[4,11,14,22,27],renderer:'XYZ box stand and shaded polygonal sphere meshes'},model:{lengths:[112,448],periods:[2,4],amplitude:PI*8/180,angle,bob}};root.PendulumScience=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
