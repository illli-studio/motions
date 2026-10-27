(function(root){'use strict';
const W=1920,H=1080,PI=Math.PI,C={bg:'#190F24',white:'#F3E8DD',sun:'#FFC782',muted:'#AA94C2',earth:'#6CD6CF'};
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const mesh=[];for(let j=0;j<96;j++){let a=-PI/2+j*PI/96,b=a+PI/96;for(let k=0;k<192;k++){let p=k*2*PI/192,q=p+2*PI/192;let v=(lat,lon)=>[Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];let vs=[v(a,p),v(a,q),v(b,q),v(b,p)];let n=v((a+b)/2,(p+q)/2);if(n[2]>0)mesh.push({vs,n});}}
function txt(c,s,x,y,size=40,col=C.white,bold=false){c.fillStyle=col;c.font=(bold?'700 ':'400 ')+size+'px Lunar';c.fillText(s,x,y)}
function line(c,x,y,X,Y,col,w=2){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke()}
function arrow(c,x,y,X,Y,col=C.sun,w=3){line(c,x,y,X,Y,col,w);let a=Math.atan2(Y-y,X-x);line(c,X,Y,X-14*Math.cos(a-.45),Y-14*Math.sin(a-.45),col,w);line(c,X,Y,X-14*Math.cos(a+.45),Y-14*Math.sin(a+.45),col,w)}
function circle(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,2*PI);c.fill()}
function sphere(c,x,y,r,light,earth=false){
 circle(c,x,y,r,earth?'#183B46':'#30243E');
 for(const f of mesh){let n=f.n,d=n[0]*light[0]+n[1]*light[1]+n[2]*light[2];let relief=.92-.22*Math.exp(-((n[0]+.3)**2/.13+(n[1]-.2)**2/.2))-.12*Math.exp(-((n[0]-.4)**2/.08+(n[1]+.25)**2/.12));for(let cr of [[-.48,.35,.11],[.25,.52,.08],[.45,-.28,.14],[-.2,-.54,.075],[.1,-.1,.045]]){let d=Math.hypot(n[0]-cr[0],n[1]-cr[1]);relief-=.09*Math.exp(-Math.pow(d/(cr[2]*.7),4));relief+=.05*Math.exp(-Math.pow((d-cr[2])/.018,2));}let v=d>0?(.17+.83*Math.pow(d,.48))*relief:.055;let color=earth?[90,205,199]:[237,221,208];if(earth&&Math.sin(n[0]*9+n[1]*3)+Math.cos(n[1]*11+n[2]*4)>.5)color=[123,165,122];c.fillStyle='rgb('+color.map(z=>Math.round(18+z*v)).join(',')+')';c.beginPath();f.vs.forEach((p,i)=>i?c.lineTo(x+p[0]*r,y-p[1]*r):c.moveTo(x+p[0]*r,y-p[1]*r));c.closePath();c.fill();c.strokeStyle=c.fillStyle;c.lineWidth=.6;c.stroke();}
}
function phase(c,x,y,r,theta){sphere(c,x,y,r,[Math.sin(theta),0,-Math.cos(theta)]);}
function base(c,t,tag){c.fillStyle=C.bg;c.fillRect(0,0,W,H);let g=c.createRadialGradient(1250,500,20,1250,500,820);g.addColorStop(0,'#2D1C3D');g.addColorStop(1,C.bg);c.fillStyle=g;c.fillRect(0,0,W,H);txt(c,'月 相 / '+tag,90,69,24,C.muted);line(c,90,95,1830,95,'#4A365A');txt(c,'大小、距离、速度非等比例 · 轨道与地形简化示意',90,1032,23,C.muted);c.fillStyle=C.sun;c.fillRect(90,1060,1740*clamp(t/29.5),3);}
function enter(c,t,start){let e=ease((t-start)/.55);c.globalAlpha*=e;c.translate(0,18*(1-e));}
function orbit(c,theta,x,y,r){
 txt(c,'空间位置示意',x-r,y-r-60,28,C.earth);txt(c,'太阳光',x+r+35,y-r+3,26,C.sun);
 for(let off of [-95,0,95])arrow(c,x+r+145,y+off,x+r+30,y+off,C.sun,2);
 c.strokeStyle='#6A4D7A';c.lineWidth=2;c.beginPath();c.ellipse(x,y,r,r*.64,0,0,2*PI);c.stroke();
 // 3D circular orbital plane shown obliquely; display bodies enlarged, no occultation solver.
 let mx=x+r*Math.cos(theta),my=y-r*.64*Math.sin(theta);line(c,x,y,mx,my,C.earth,2);sphere(c,x,y,28,[1,0,.12],true);sphere(c,mx,my,24,[1,0,.05]);circle(c,x,y,5,C.earth);txt(c,'地球',x-32,y+62,25,C.earth);txt(c,'月球',mx-28,my-40,23,C.white);
 txt(c,'位置投影 · 省略遮挡',x-r,y+r*.64+75,22,C.muted);
}
function s0(c,t){base(c,t,'提出问题');let e=ease((t-.15)/.8);c.save();c.globalAlpha=e;txt(c,'月亮为什么',100,310,88,C.white,true);txt(c,'会「变弯」？',100,420,88,C.white,true);txt(c,'是地球的影子挡住了吗？',108,542,40,C.muted);c.restore();phase(c,1395,557,352,mix(.35,.72,ease(t/4.8)));c.save();enter(c,t,2.2);txt(c,'不是。',108,716,70,C.sun,true);txt(c,'月相，来自观看角度。',108,788,41,C.white);c.restore();txt(c,'地球上看到的形状',1180,958,27,C.muted);}
function s1(c,t){base(c,t,'先看受光');txt(c,'月球并没有缺一块',96,205,70,C.white,true);txt(c,'通常，朝向太阳的一半受到照亮。',100,282,38,C.sun);sphere(c,1110,610,277,[-1,0,.06]);
 for(let y of [405,495,585,675,765])arrow(c,100,y,790,y,C.sun,3);txt(c,'太阳光',100,365,32,C.sun);line(c,1110,322,1110,898,'#6C526D',2);txt(c,'受光半球',655,940,34,C.sun);txt(c,'背光半球',1200,940,34,C.muted);txt(c,'不是地球投来的阴影',1430,590,32,C.white);txt(c,'月食另当别论',1430,640,27,C.muted);}
function thetaAt(t){return mix(.55,3.08,ease((t-10.5)/7.6));}
function s2(c,t){base(c,t,'同一轮月球 · 两个视角');let th=thetaAt(t);txt(c,'绕着地球走，看到的亮面就变了',95,190,65,C.white,true);txt(c,'从地球看',130,298,34,C.earth);phase(c,560,618,280,th);txt(c,'北向朝上示意',419,958,25,C.muted);orbit(c,th,1390,590,225);line(c,905,340,905,916,'#4A365A');
 let name=th<1.25?'蛾眉月':th<1.9?'上弦附近':'渐近满月';txt(c,name,420,330,34,C.sun);txt(c,'我们只看见受光半球的一部分',1040,919,32,C.white);}
function s3(c,t){base(c,t,'分清月相与月食');txt(c,'地球的影子，什么时候才有关？',95,193,65,C.white,true);txt(c,'月食：满月附近，还要恰好对齐。',100,273,39,C.sun);
 // Independent side-view alignment lesson, not ordinary phase simulation.
 for(let y of [420,500,580])arrow(c,120,y,550,y,C.sun,3);sphere(c,690,500,69,[-1,0,.04],true);c.fillStyle='#100C18';c.beginPath();c.moveTo(755,435);c.lineTo(1530,470);c.lineTo(1530,530);c.lineTo(755,565);c.fill();txt(c,'地球影区（示意）',1020,605,28,C.muted);let a=ease((t-20)/2.3),my=mix(355,500,a);sphere(c,1370,my,28,[-1,0,.1]);c.save();c.beginPath();c.moveTo(755,435);c.lineTo(1530,470);c.lineTo(1530,530);c.lineTo(755,565);c.closePath();c.clip();circle(c,1370,my,28,'#3E2431');c.restore();txt(c,'太阳光',120,650,30,C.sun);txt(c,'地球',648,650,30,C.earth);txt(c,'月球',1325,650,30,C.white);
 txt(c,'为什么不是每个满月都月食？',100,787,40,C.white,true);txt(c,'月球轨道有倾斜，通常从影区上方或下方经过。',100,864,36,C.white);txt(c,'此处专门演示特殊对齐，并非每月都会发生',100,945,27,C.muted);}
function s4(c,t){base(c,t,'记住这一点');txt(c,'变的是我们看见的亮面',96,222,78,C.white,true);txt(c,'不是月球变形，也不是地影每月来遮挡。',100,306,39,C.sun);let vals=[.65,PI/2,PI,3*PI/2],names=['蛾眉','上弦','满月','下弦'];for(let i=0;i<4;i++){let e=ease((t-25-i*.14)/.55);c.save();c.globalAlpha=e;let x=300+i*440;phase(c,x,600+25*(1-e),150,vals[i]);txt(c,names[i],x-48,825,34,C.white);c.restore();}txt(c,'太阳照亮一半  →  位置改变  →  所见月相改变',290,952,37,C.earth);}
const scenes=[s0,s1,s2,s3,s4],starts=[0,5,10,19,25];
function render(c,t){t=Math.max(0,Math.min(29.499,t));let i=starts.findLastIndex(s=>s<=t);c.save();scenes[i](c,t);if(i>0&&t<starts[i]+.6){let a=ease((t-starts[i])/.6);c.globalAlpha=1-a;scenes[i-1](c,t);c.globalAlpha=1;}c.restore();}
let api={render,phase,thetaAt,duration:29.5,geometry:{type:'analytic sphere tessellation',latitudes:96,longitudes:192,phaseLight:'[sin(theta),0,-cos(theta)]',fraction:'(1-cos(theta))/2'}};if(typeof module!=='undefined')module.exports=api;root.LunarScience=api;
})(typeof window!=='undefined'?window:globalThis);
