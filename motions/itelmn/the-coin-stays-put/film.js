/* Original deterministic geometric optics. Water/air only, a narrow pair of rays. */
(function(root){'use strict';
const W=1920,H=1080,D=28,PI=Math.PI,C={bg:'#FAE7DB',ink:'#352A45',muted:'#786C7F',water:'#A8CED3',edge:'#5D99A6',gold:'#D88C26',plum:'#9B5A91',white:'#FFF8F2'};
const clamp=x=>Math.max(0,Math.min(1,x)),sm=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,q)=>a+(b-a)*q;
let textAlpha=1;
function text(c,s,x,y,n=38,col=C.ink){c.save();c.globalAlpha*=textAlpha;c.font=`600 ${n}px OpticsSerif, serif`;c.textBaseline='alphabetic';c.fillStyle=col;c.fillText(s,x,y);c.restore()}
function line(c,a,b,col=C.ink,w=3,dash=false){c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';if(dash)c.setLineDash([12,11]);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.restore()}
function poly(c,p,col,stroke){c.beginPath();p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();if(col){c.fillStyle=col;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function arrow(c,a,b,col=C.gold,w=5){line(c,a,b,col,w);let q=Math.atan2(b[1]-a[1],b[0]-a[0]);poly(c,[b,[b[0]-18*Math.cos(q-.45),b[1]-18*Math.sin(q-.45)],[b[0]-18*Math.cos(q+.45),b[1]-18*Math.sin(q+.45)]],col)}
function fade(c,q,fn){c.save();c.globalAlpha*=clamp(q);fn();c.restore()}
function view(ox,oy,s,az=-.30,el=.70){let ca=Math.cos(az),sa=Math.sin(az),ce=Math.cos(el),se=Math.sin(el);return p=>{let u=p[0]*ca-p[1]*sa,v=p[0]*sa+p[1]*ca;return [ox+s*u,oy-s*(v*se+p[2]*ce),-v*ce+p[2]*se]}}
function face(c,P,p,col,stroke){poly(c,p.map(P),col,stroke)}
function coin(c,P,x,y,z,r=.30,ghost=false){let rings=[];for(let i=0;i<64;i++){let a=i/64*PI*2;rings.push([x+r*Math.cos(a),y+r*Math.sin(a),z])}c.save();if(ghost)c.setLineDash([8,7]);face(c,P,rings,ghost?null:C.gold,ghost?C.plum:'#A56920');if(!ghost){let inner=rings.map(p=>[x+(p[0]-x)*.72,y+(p[1]-y)*.72,z+.002]);face(c,P,inner,null,'#F1BC66')}c.restore()}
function basin(c,t,ox=670,oy=780,s=175,fill=sm((t-1.3)/2.4),showGhost=true,showLabel=true){let P=view(ox,oy,s),L=3.8,B=2.2,hh=1.6,water=1.18*fill;
// Opaque bottom and far walls precede contents; front walls are clear overlays.
face(c,P,[[-L/2,-B/2,0],[L/2,-B/2,0],[L/2,B/2,0],[-L/2,B/2,0]],'#E6CCBF','#A898A3');
face(c,P,[[-L/2,B/2,0],[L/2,B/2,0],[L/2,B/2,hh],[-L/2,B/2,hh]],'#EBDDD9','#AEADB4');
face(c,P,[[-L/2,-B/2,0],[-L/2,B/2,0],[-L/2,B/2,hh],[-L/2,-B/2,hh]],'#F2E7E2','#AEADB4');
coin(c,P,-.5,0,.03,.30,false);
if(fill>0){face(c,P,[[-L/2,-B/2,water],[L/2,-B/2,water],[L/2,B/2,water],[-L/2,B/2,water]],'rgba(126,187,199,.25)',C.edge);face(c,P,[[-L/2,-B/2,0],[L/2,-B/2,0],[L/2,-B/2,water],[-L/2,-B/2,water]],'rgba(119,183,196,.23)');}
face(c,P,[[L/2,-B/2,0],[L/2,B/2,0],[L/2,B/2,hh],[L/2,-B/2,hh]],'rgba(255,255,255,.13)','#8E9DA8');
face(c,P,[[-L/2,-B/2,0],[L/2,-B/2,0],[L/2,-B/2,hh],[-L/2,-B/2,hh]],'rgba(255,255,255,.08)','#8E9DA8');
for(let z of [0,hh])line(c,P([-L/2,-B/2,z]),P([L/2,-B/2,z]),'#FFF9F4',4);
if(showGhost&&fill>.5){let a=sm((t-3.7)/.9),pos=P([-.45,0,water*.32+.03]),real=P([-.5,0,.03]);fade(c,a,()=>{coin(c,P,-.45,0,water*.32+.03,.30,true);line(c,real,pos,C.plum,2,true);if(showLabel){text(c,'虚线：看起来的位置',ox+330,oy-290,34,C.plum);line(c,[ox+315,oy-300],[pos[0]+45,pos[1]],C.plum,2,true)}})}
return P}
const O=[560,815],SY=485,depth=330,n=4/3;
function ray(theta){let a=theta*PI/180,qx=O[0]+depth*Math.tan(a),r=Math.asin(n*Math.sin(a));return {a,r,q:[qx,SY],slope:Math.tan(r)}}
const R=[ray(18),ray(21)],backDist=(R[1].q[0]-R[0].q[0])/(R[1].slope-R[0].slope),V=[R[0].q[0]-backDist*R[0].slope,SY+backDist];
function rayDiagram(c,t,small=false){let local=t-8,realPhase=sm((local-.8)/3),virtualPhase=sm((local-6)/2),eyeY=240;
c.fillStyle='rgba(139,197,207,.27)';c.fillRect(100,SY,1720,465);line(c,[100,SY],[1820,SY],C.edge,4);text(c,'空气',130,SY-32,36,C.muted);text(c,'水',130,SY+58,36,C.edge);
// Real object and virtual-image positions are distinct; no object moves.
c.beginPath();c.ellipse(O[0],O[1],49,18,0,0,2*PI);c.fillStyle=C.gold;c.fill();text(c,'硬币真实位置',O[0]-205,O[1]+75,36);
R.forEach((r,i)=>{const end=[r.q[0]+(SY-eyeY)*r.slope,eyeY],path=[O,r.q,end];let lens=[Math.hypot(r.q[0]-O[0],SY-O[1]),Math.hypot(end[0]-r.q[0],end[1]-SY)],total=lens[0]+lens[1],travel=realPhase*total;for(let k=0;k<2;k++){let q=clamp(travel/lens[k]);if(q>0)arrow(c,path[k],[mix(path[k][0],path[k+1][0],q),mix(path[k][1],path[k+1][1],q)],C.gold,5);travel-=lens[k]}
if(local>5)fade(c,virtualPhase,()=>line(c,r.q,V,C.plum,4,true));
if(i===1){line(c,[r.q[0],SY-165],[r.q[0],SY+160],C.muted,2,true);text(c,'法线',r.q[0]+20,SY+150,30,C.muted)}
});
// The paired rays enter a stylized pupil aperture, not a literal eyeball ray trace.
let ex=(R[0].q[0]+(SY-eyeY)*R[0].slope+R[1].q[0]+(SY-eyeY)*R[1].slope)/2,ey=eyeY-18;
c.beginPath();c.ellipse(ex,ey,77,38,0,0,2*PI);c.fillStyle=C.white;c.fill();c.strokeStyle=C.ink;c.lineWidth=3;c.stroke();c.beginPath();c.arc(ex,ey,19,0,2*PI);c.fillStyle=C.ink;c.fill();text(c,'眼睛接收出水的光',ex+110,ey+11,36);
fade(c,sm((local-3.5)/.5),()=>{text(c,'光从水进入空气，斜射时改变方向。',1070,620,37);text(c,'出水光线：偏离法线',1070,679,36,'#92520C')});
fade(c,virtualPhase,()=>{c.save();c.setLineDash([8,7]);c.beginPath();c.ellipse(V[0],V[1],49,18,0,0,2*PI);c.strokeStyle=C.plum;c.lineWidth=4;c.stroke();c.restore();text(c,'沿出射光反向延长',1070,788,35,C.plum);text(c,'虚线交会处：局部视位置',1070,842,35,C.plum);line(c,[V[0]-90,V[1]],[V[0]-90,O[1]],C.plum,2);text(c,'看起来更浅',V[0]-340,V[1]+20,39,C.plum)});
}
function render(c,time){let t=Math.max(0,Math.min(D,time));c.save();c.fillStyle=C.bg;c.fillRect(0,0,W,H);textAlpha=1;text(c,'光 路 观 察',80,65,26,C.muted);text(c,'REFRACTION / 28 s',1530,65,24,C.muted);line(c,[80,90],[1840,90],'#DCC9CB',2);text(c,'平水面示意 · 忽略容器壁 · 非等比例 · 视位置随观察角度变化',80,1044,26,C.muted);
if(t<8.8){textAlpha=1-sm((t-8)/.32);let q=1-sm((t-8)/.8);fade(c,q,()=>{text(c,'硬币没动，',90,205,72);text(c,'为什么看起来变浅？',90,301,72);let P=basin(c,t);text(c,'加水',1360,510,44,C.edge);text(c,'真实硬币仍在池底',1260,775,40);line(c,[1230,765],P([-.5,0,.03]),C.muted,2);fade(c,sm((t-4.8)/.7),()=>text(c,'虚像位置示意，不是另一枚硬币。',1030,913,34,C.plum))})}
if(t>=8&&t<21.3){textAlpha=sm((t-8.48)/.32)*(1-sm((t-20.5)/.32));fade(c,sm((t-8)/.8)*(1-sm((t-20.5)/.8)),()=>{text(c,t<14?'看光怎样到达眼睛。':'把出水光线反向延长。',90,187,65);rayDiagram(c,t)})}
if(t>=20.5){textAlpha=sm((t-20.98)/.32);fade(c,sm((t-20.5)/.8),()=>{text(c,'变浅的是视位置，',90,205,70);text(c,'不是硬币真的上浮。',90,300,70);basin(c,7,620,790,180,1,true,false);text(c,'水面让光改变方向',1230,490,43,'#92520C');text(c,'眼睛沿出射方向判断位置',1230,570,37);text(c,'硬币始终留在原处',1230,650,43);text(c,'虚线仅表示视位置',1230,735,34,C.plum);text(c,'观察方向变了，视位置也会变。',1110,882,35,C.plum)})}
textAlpha=1;c.restore()}
const api={render,duration:D,width:W,height:H,rayGeometry:{object:O,surfaceY:SY,nWater:n,nAir:1,rays:R,virtual:V}};if(typeof module!=='undefined')module.exports=api;root.RefractionScience=api;
})(typeof window!=='undefined'?window:globalThis);
