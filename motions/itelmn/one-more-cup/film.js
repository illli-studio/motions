/* One More Cup — original deterministic projected 3D scene, MIT-0. */
(function(root){'use strict';
const TAU=Math.PI*2, S=1.52, C={cream:'#f4eddf',ink:'#243f3d',teal:'#256b69',amber:'#d6aa59'};
const clamp=x=>Math.max(0,Math.min(1,x)), ease=x=>{x=clamp(x);return x*x*(3-2*x)}, lerp=(a,b,t)=>a+(b-a)*t;
function p(v){return [960+S*(v[0]+.24*v[2]),875+S*(-v[1]+.43*v[2])];}
function rgb(hex,k){let n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,(n>>8)&255,n&255].map(x=>Math.round(Math.min(255,x*k))).join(',')})`;}
function render(ctx,time){let t=Math.max(0,Math.min(24,time)),mesh=[];
function face(v,col){let a=v[0],b=v[1],c=v[2],u=b.map((x,i)=>x-a[i]),w=c.map((x,i)=>x-a[i]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n)||1,light=.84+.19*Math.abs((n[0]*-.5+n[1]*.8+n[2]*.3)/len);mesh.push({v,col:rgb(col,light),d:v.reduce((s,v)=>s+v[2]+v[1]*.43,0)/v.length});}
function box(x,y,z,w,h,d,col){let v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(a=>[x+a[0]*w/2,y+a[1]*h/2,z+a[2]*d/2]);for(let ids of [[0,1,2,3],[4,5,6,7],[0,4,7,3],[1,5,6,2],[3,2,6,7],[0,1,5,4]])face(ids.map(i=>v[i]),col);}
function lathe(profile,col,xf=v=>v,N=64){for(let j=0;j<profile.length-1;j++)for(let i=0;i<N;i++){let a=i*TAU/N,b=(i+1)*TAU/N;face([[profile[j][0]*Math.cos(a),profile[j][1],profile[j][0]*Math.sin(a)],[profile[j][0]*Math.cos(b),profile[j][1],profile[j][0]*Math.sin(b)],[profile[j+1][0]*Math.cos(b),profile[j+1][1],profile[j+1][0]*Math.sin(b)],[profile[j+1][0]*Math.cos(a),profile[j+1][1],profile[j+1][0]*Math.sin(a)]].map(xf),col);}}
function tube(points,r,col,xf=v=>v){for(let j=0;j<points.length-1;j++){let a=points[j],b=points[j+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;for(let k=0;k<12;k++){let ring=(v,q)=>[v[0]-dy/l*r*Math.cos(q),v[1]+dx/l*r*Math.cos(q),v[2]+r*Math.sin(q)];face([ring(a,k*TAU/12),ring(b,k*TAU/12),ring(b,(k+1)*TAU/12),ring(a,(k+1)*TAU/12)].map(xf),col);}}}
function shadow(x,z,rx,rz,a){let q=p([x,0,z]);ctx.save();ctx.translate(...q);ctx.scale(rx*S,rz*S*.43);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(58,48,31,${a})`);g.addColorStop(1,'rgba(58,48,31,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();ctx.restore();}
ctx.clearRect(0,0,1920,1080);ctx.fillStyle=C.cream;ctx.fillRect(0,0,1920,1080);
let warm=ease((t-18)/6),sky=ctx.createLinearGradient(0,0,1920,850);sky.addColorStop(0,'#d6e2da');sky.addColorStop(1,warm>.3?'#e9d5ae':'#e6e8db');ctx.fillStyle=sky;ctx.fillRect(620,0,1300,790);
// Rain is editorial 2D; the window frame is solid projected geometry.
ctx.save();ctx.beginPath();ctx.rect(620,0,1300,790);ctx.clip();for(let i=0;i<75;i++){let x=710+(i*137.19)%1240,y=((i*93.71+t*(90+i%5*9))%950)-100;ctx.strokeStyle=`rgba(106,143,139,${.13+(i%3)*.04})`;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-11,y+55+i%7*5);ctx.stroke();}ctx.restore();
box(260,50,-310,790,18,48,'#d7cdbb');box(260,690,-310,790,18,48,'#d7cdbb');for(let x of [-135,260,655])box(x,370,-310,18,640,48,'#d7cdbb');
box(0,-33,45,1600,64,900,'#c8a97e');
// Render architecture first, then grounding shadows and hero meshes.
paint();mesh=[];
ctx.save();ctx.strokeStyle='rgba(110,76,42,.075)';ctx.lineWidth=1.4;for(let j=0;j<14;j++){let y=640+j*34;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(480,y+14*Math.sin(j),1120,y-12,1920,y+10*Math.cos(j));ctx.stroke();}ctx.restore();
let ax=lerp(-1050,-230,ease((t-1.3)/1.7)),bx=lerp(1050,230,ease((t-13.333)/2.4));
if(t>=1.3)shadow(ax,0,140,125,.24);if(t>=13.333)shadow(bx,0,140,125,.22);
let fillA=clamp((t-7)/3.25),fillB=clamp((t-16.5)/1.9);
function cup(x,col,fill,dir){let xf=v=>[v[0]+x,v[1],v[2]];lathe([[0,5],[66,5],[75,12],[91,140],[92,151],[88,157],[81,157],[78,150],[66,22],[0,22]],col,xf);let pts=[];for(let i=0;i<=36;i++){let a=-Math.PI*.5+i/36*Math.PI;pts.push([dir*(86+5.64*Math.sin(a)+46*Math.cos(a)),80+47*Math.sin(a),0]);}tube(pts,10,col,xf);if(fill>0)lathe([[0,25+fill*109],[67+fill*10,25+fill*109]],'#78502c',xf);}
if(t>=1.3)cup(ax,C.teal,fillA,-1);if(t>=13.333)cup(bx,'#e5c883',fillB,1);
// Kettle's entire mesh and spout endpoint share one rigid transform.
let cycle=t<13.333?0:1,start=cycle?15.7:5.333,end=cycle?19.3:11.8,target=cycle?230:-230,active=t>=start&&t<end;
if(active){let enter=ease((t-start)/1.05),leave=ease((t-(end-1.05))/1.05),tilt=-.38*ease((t-(cycle?16:6.3))/.7)*(1-ease((t-(cycle?18.4:10.25))/.5));let x=target-185-650*(1-enter)+650*leave,y=310,z=-10;let xf=v=>[x+v[0]*Math.cos(tilt)-v[1]*Math.sin(tilt),y+v[0]*Math.sin(tilt)+v[1]*Math.cos(tilt),v[2]+z];let body=[[0,-77]];for(let j=0;j<=28;j++){let yy=-77+j/28*167;body.push([100*Math.sqrt(1-((yy-2)/105)**2),yy]);}body.push([0,90]);lathe(body,C.amber,xf);lathe([[0,92],[70,92],[65,100],[0,100]],'#b08038',xf);lathe([[0,100],[16,100],[17,119],[0,121]],C.teal,xf);let spout=[];for(let j=0;j<=26;j++){let u=j/26,v=1-u;spout.push([v*v*v*73+3*v*v*u*129+3*v*u*u*132+u*u*u*188,v*v*v*-10+3*v*v*u*-5+3*v*u*u*85+u*u*u*88,0]);}tube(spout,14,C.amber,xf);let cap=[];for(let j=0;j<24;j++){let a=j*TAU/24;cap.push(xf([188-.054*12*Math.cos(a),88+.999*12*Math.cos(a),12*Math.sin(a)]));}face(cap,'#76572f');let handle=[];for(let i=0;i<=40;i++){let a=Math.PI*.5+i/40*Math.PI;handle.push([-70+55*Math.cos(a),67*Math.sin(a),0]);}tube(handle,12,C.teal,xf);
let pouring=cycle?(t>=16.5&&t<18.4):(t>=7&&t<10.25);if(pouring){let top=xf([188,88,0]),bot=[target,25+(cycle?fillB:fillA)*109,0];tube([top,[lerp(top[0],bot[0],.45),lerp(top[1],bot[1],.48),0],bot],3.2,'#c4944a');}}
paint();
function paint(){mesh.sort((a,b)=>a.d-b.d);for(let f of mesh){ctx.fillStyle=f.col;ctx.beginPath();f.v.forEach((v,i)=>{let q=p(v);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.closePath();ctx.fill();ctx.strokeStyle=f.col;ctx.lineWidth=.45;ctx.stroke();}}
// Steam as translucent 2D ink, not geometry masquerading as a cup.
function steam(x,amount){if(amount<=0)return;let q=p([x,170,0]);ctx.save();ctx.lineWidth=3.5;for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(255,253,240,${amount*.48})`;ctx.beginPath();for(let j=0;j<=30;j++){let h=j*5,xx=q[0]+(i-1.5)*24+Math.sin(h*.033-t*1.8+i)*12,yy=q[1]-h; j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}ctx.restore();}steam(ax,ease((t-8)/2));steam(bx,ease((t-17.2)/1));
let txt='',alpha=0;if(t<5.333){txt='Some days, rain.';alpha=ease(t/.8)*(1-ease((t-4.4)/.8));}else if(t<13.333){txt='A little warmth.';alpha=ease((t-5.333)/.8)*(1-ease((t-12.3)/.8));}else if(t<21.333){txt='A little room.';alpha=ease((t-13.333)/.8)*(1-ease((t-20.3)/.8));}else{txt='One more cup.';alpha=ease((t-21.333)/.85);}
ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=C.ink;ctx.font='74px CupSerif';ctx.fillText(txt,125,110+18*(1-alpha));if(t>21.333){ctx.font='32px CupSerif';ctx.fillText('Warmth is better shared.',129,175);}ctx.restore();
}
const api={render,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.OneMoreCup=api;
})(typeof window!=='undefined'?window:globalThis);
