(function(root){'use strict';
const D=28.5,W=1920,H=1080,P={bg:'#20282B',chalk:'#F4EEE1',muted:'#B5C2C2',coral:'#EC957D',teal:'#66C2BA',metal:'#D7D6CB',line:'#566368'};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,q)=>a+(b-a)*q,S=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const leftPoly=[[-1.5,-.12],[.04,-.12],[.04,-.27],[.09,-.32],[.43,-.32],[.48,-.27],[.48,.27],[.43,.32],[.09,.32],[.04,.27],[.04,.12],[-1.5,.12]];
function poly(f,xy,z0,z1,col){let top=xy.map(v=>[v[0],v[1],z1]),bot=xy.map(v=>[v[0],v[1],z0]);f.push({v:bot,c:col,k:.48});for(let i=0;i<xy.length;i++){let j=(i+1)%xy.length;f.push({v:[bot[i],bot[j],top[j],top[i]],c:col,k:.52+.16*Math.abs(xy[j][0]-xy[i][0])/(Math.hypot(xy[j][0]-xy[i][0],xy[j][1]-xy[i][1])||1)})}f.push({v:top,c:col,k:1})}
function box(f,x,y,z,sx,sy,sz,col){poly(f,[[x-sx/2,y-sy/2],[x+sx/2,y-sy/2],[x+sx/2,y+sy/2],[x-sx/2,y+sy/2]],z-sz/2,z+sz/2,col)}
function shade(h,k){let n=parseInt(h.slice(1),16);return`rgb(${[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v*k)).join(',')})`}
function projection(cam){return v=>{let x=v[0]*Math.cos(cam.rot)-v[1]*Math.sin(cam.rot),y=v[0]*Math.sin(cam.rot)+v[1]*Math.cos(cam.rot);return[cam.x+x*cam.scale,cam.y-y*Math.cos(cam.tilt)*cam.scale-v[2]*Math.sin(cam.tilt)*cam.scale,y*Math.sin(cam.tilt)-v[2]*Math.cos(cam.tilt)]}}
function drawMesh(c,f,p){let fs=f.map(o=>({...o,s:o.v.map(p)}));fs.sort((a,b)=>b.s.reduce((n,v)=>n+v[2],0)/b.s.length-a.s.reduce((n,v)=>n+v[2],0)/a.s.length);for(let o of fs){c.beginPath();o.s.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fillStyle=shade(o.c,o.k);c.fill();c.strokeStyle=shade(o.c,o.k*.93);c.lineWidth=.7;c.stroke()}}
function txt(c,s,x,y,size=32,col=P.chalk,align='left'){c.font=`${size}px ZipText`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y)}
function line(c,a,b,col,width=3,dash=[]){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineWidth=width;c.strokeStyle=col;c.setLineDash(dash);c.stroke();c.setLineDash([])}
function arrow(c,pts,col,width=5){c.beginPath();c.moveTo(...pts[0]);for(let q of pts.slice(1))c.lineTo(...q);c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.strokeStyle=col;c.stroke();let b=pts.at(-1),a=pts.at(-2),th=Math.atan2(b[1]-a[1],b[0]-a[0]);c.beginPath();c.moveTo(...b);c.lineTo(b[0]-17*Math.cos(th-.42),b[1]-17*Math.sin(th-.42));c.lineTo(b[0]-17*Math.cos(th+.42),b[1]-17*Math.sin(th+.42));c.closePath();c.fillStyle=col;c.fill()}
function pathArrow(c,p,path,col){arrow(c,path.map(p),col,5)}
function pill(c,s,x,y,w,col=P.chalk){c.fillStyle='#303C40';c.beginPath();c.roundRect(x,y,w,54,12);c.fill();txt(c,s,x+20,y+27,26,col)}
function thread(c,p,x,y,z,len){line(c,p([x,y,z]),p([x,y+len,z]),'#D8D2C4',1.7)}
function tooth(f,side,y,gap,scale=1,shift=0){poly(f,leftPoly.map(v=>[(side===-1?v[0]:-v[0])*scale+side*gap+shift,v[1]*scale+y]),.10,.10+.24*scale,side===-1?P.coral:P.teal)}
function zipper(c,t,mode){let reverse=mode==='reverse',reveal=mode==='channel',end=mode==='end';let slide=reverse?lerp(2.6,-1.9,S(20,22,t)):end?lerp(-1.9,3.1,S(24,26,t)):lerp(-2.9,2.3,S(.6,3.65,t));if(reveal)slide=0;
let cam={x:reveal?1180:end?1210:1190,y:reveal?630:560,scale:reveal?116:67,rot:reveal?-.07:-.26,tilt:reveal?.56:.37};let p=projection(cam),f=[];
const gap=y=>1.40*S(slide-.40,slide+2.5,y);
// Two continuous woven tapes, bent apart ahead of the slider.
for(let side of[-1,1]){let strip=[];for(let i=0;i<=72;i++){let y=-6+i/6;strip.push([side*(1.1+gap(y)),y])}for(let i=72;i>=0;i--){let y=-6+i/6;strip.push([side*(3.05+gap(y)),y])}poly(f,strip,-.18,.105,side===-1?'#B86D5E':'#397D7B');}
for(let i=-6;i<=6;i++){if(!reveal||Math.abs(i-slide-.3)>1.9)tooth(f,-1,i,gap(i),1);if(i<6&&(!reveal||Math.abs(i+.5-slide-.3)>1.9))tooth(f,1,i+.5,gap(i+.5),1)}
// The actual joining area stays under the opaque guide; no fake visible assembly trajectory.
let sy=slide;let shell=[[-.78,sy-1.05],[.78,sy-1.05],[1.50,sy+1.40],[1.25,sy+1.65],[-1.25,sy+1.65],[-1.50,sy+1.40]];
poly(f,shell,.02,.08,'#8B9697');
// Side walls and central diamond form a Y corridor. The raised cap is a cutaway convention.
poly(f,[[-.78,sy-1.05],[-.59,sy-1.05],[-1.15,sy+1.65],[-1.42,sy+1.48]],.18,.62,P.metal);
poly(f,[[.59,sy-1.05],[.78,sy-1.05],[1.42,sy+1.48],[1.15,sy+1.65]],.18,.62,P.metal);
poly(f,[[0,sy+.05],[.37,sy+.75],[.29,sy+1.65],[-.29,sy+1.65],[-.37,sy+.75]],.18,.64,P.metal);
let lift=reveal?lerp(0,2.45,S(4.25,5.55,t)):0;
if(!reveal||t<6.25){poly(f,shell,.68+lift,.87+lift,P.metal);box(f,0,sy+.28,1.01+lift,.33,.65,.28,'#A4ACAB');poly(f,[[-.22,sy+.2],[.22,sy+.2],[.35,sy-1.4],[-.35,sy-1.4]],1.12+lift,1.23+lift,'#A4ACAB');}
// Soft grounded shadow, not a cast-ray scientific model.
c.save();c.beginPath();c.rect(690,140,1200,835);c.clip();c.save();c.globalAlpha=.10;c.fillStyle='#090F11';c.beginPath();c.ellipse(cam.x+45,cam.y+65,320,425,-.26,0,Math.PI*2);c.fill();c.restore();drawMesh(c,f,p);
// Stitching and deterministic woven crosshatch are lightweight vector marks, not frame textures.
for(let side of[-1,1])for(let i=0;i<66;i++){let y=-5.7+i*.175,g=gap(y);thread(c,p,side*(1.62+g),y,.11,.09);if(i%2===0){line(c,p([side*(1.92+g),y,.11]),p([side*(2.77+g),y+.09,.11]),side===-1?'#C68675':'#4D9290',.7)}}
c.restore();if(reveal&&t>=5.8){let q=S(5.8,6.5,t);c.save();c.globalAlpha=q;for(let side of[-1,1]){let path=[[side*.9,sy+1.50,.68],[side*.7,sy+.68,.68],[side*.36,sy-.32,.68],[side*.31,sy-.80,.68]];pathArrow(c,p,path,side===-1?P.coral:P.teal)}c.restore();let target=p([0,sy+.65,.75]);line(c,[714,436],[target[0]-30,target[1]],P.muted,2);txt(c,'Y 形导槽',440,416,40);txt(c,'两路进入，一路合拢',440,477,29,P.muted);pill(c,'空导槽剖面 · 路径示意',1370,890,410);}
if(reverse){pathArrow(c,p,[[0,sy+1,1.6],[0,sy-.8,1.6]],P.chalk);txt(c,'反向',p([0,sy+1.9,1.6])[0],p([0,sy+1.9,1.6])[1],27,P.chalk,'center')}
if(end){let q=p([.6,0,.5]);line(c,[734,586],[q[0]-25,q[1]],P.muted,2);}
return {p,slide};}
function macro(c,t){let q=S(11,12.4,t),cam={x:1210,y:550,scale:lerp(270,310,q),rot:lerp(.02,-.10,q),tilt:.60},p=projection(cam),f=[];
// Exact nonintersecting demonstration configuration: left y integer; right y integer+.5.
// A tiny lateral load closes the .08 clearance but never moves beyond contact.
let pull=.075*S(14.1,15.1,t)*(1-S(16.6,17.3,t));
for(let i=-1;i<=1;i++){tooth(f,-1,i,0,1,-pull);tooth(f,1,i+.5,0,1,0)}
c.save();c.beginPath();c.rect(710,160,1150,720);c.clip();drawMesh(c,f,p);c.restore();
let a=p([.04-pull,.24,.35]),b=p([-.04,.24,.35]);
if(t>13.5){c.save();c.globalAlpha=S(13.5,14,t);c.strokeStyle='#F7D978';c.lineWidth=5;c.beginPath();c.ellipse((a[0]+b[0])/2,(a[1]+b[1])/2,43,65,-.08,0,Math.PI*2);c.stroke();line(c,[783,815],[(a[0]+b[0])/2-24,(a[1]+b[1])/2+50],'#F7D978',2);txt(c,'齿头相互卡住',750,860,31,'#F7D978');c.restore();}
if(t>14.1&&t<17.3){txt(c,'向两侧拉的趋势',1440,105,28,P.muted,'center');arrow(c,[p([-1.15,0,.6]),p([-1.65,0,.6])],P.coral,5);arrow(c,[p([1.15,.5,.6]),p([1.65,.5,.6])],P.teal,5);}
pill(c,'配合关系示意，非装配轨迹',1010,925,510);}
function title(c,small,lines,body){txt(c,small,98,104,24,P.muted);let y=220;for(let s of lines){txt(c,s,98,y,62);y+=85}if(body){let by=y+40;for(let s of body){txt(c,s,100,by,31,P.muted);by+=48}}}
function render(c,t){t=clamp(t,0,D);c.fillStyle=P.bg;c.fillRect(0,0,W,H);let grad=c.createRadialGradient(1210,490,80,1210,490,900);grad.addColorStop(0,'#354247');grad.addColorStop(1,P.bg);c.fillStyle=grad;c.fillRect(0,0,W,H);
// Five purpose-driven shot layouts, joined by brief dark dissolves rather than jump-cuts.
let scene=t<4.2?0:t<10.2?1:t<18.2?2:t<23.7?3:4;
let alpha=1;for(let b of[4.2,10.2,18.2,23.7]){let dist=Math.abs(t-b);if(dist<.22)alpha=Math.min(alpha,.35+.65*dist/.22)}c.save();c.globalAlpha=alpha;
if(scene===0){zipper(c,t,'hero');title(c,'身 边 的 机 械', ['轻轻一拉，','两排齿怎么','合上？'],['关键藏在滑块里面。']);pill(c,'拉链',101,780,130,P.coral);}
if(scene===1){zipper(c,t,'channel');title(c,'01 / 引 导', ['里面是一条','Y 形通道'],[]);txt(c,'导槽把两列齿引到一起。',100,780,33);}
if(scene===2){macro(c,t);title(c,'02 / 啮 合', ['不是粘住，','是齿形配合'],['链齿交错排列，','相邻齿头形成阻挡。']);txt(c,'看齿头，而不是只看缝。',100,780,30,P.coral);}
if(scene===3){zipper(c,t,'reverse');title(c,'03 / 分 开', ['反向一拉，','逐个分离'],['沿分叉路径，','两列齿重新分开。']);}
if(scene===4){zipper(c,t,'end');title(c,'原 理 就 藏 在 结 构 里', ['滑块负责引导','链齿负责啮合'],['拉片带动滑块，','不是把两侧“粘”在一起。']);}
c.restore();line(c,[100,1001],[1820,1001],P.line,1);txt(c,'结构与运动简化示意 · 非制造尺寸 · 不同拉链齿形会有差异',100,1039,24,P.muted);txt(c,'YKK · 结构资料',1820,1039,22,P.muted,'right');}
const api={render,duration:D,leftPoly,projection,tooth};if(typeof module!=='undefined')module.exports=api;root.ZipFilm=api;
})(typeof window!=='undefined'?window:globalThis);
