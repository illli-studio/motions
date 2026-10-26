(function(root){'use strict';
const PI=Math.PI,C=x=>Math.max(0,Math.min(1,x)),E=x=>{x=C(x);return x*x*x*(10+x*(-15+6*x))},L=(a,b,t)=>a+(b-a)*t;
function state(t){return{rails:Array.from({length:7},(_,i)=>E((t-2.2-i*.52)/1.5)),bars:Array.from({length:7},(_,i)=>E((t-8-i*.7)/1.7)),reveal:E((t-15)/6)}}
function render(ctx,t){t=Math.max(0,Math.min(24,t));const S=state(t),faces=[],bounds=[];ctx.clearRect(0,0,1920,1080);ctx.fillStyle='#f2ebdf';ctx.fillRect(0,0,1920,1080);
const yaw=L(-.62,.2,S.reveal),el=L(.37,1.03,S.reveal),scale=L(160,171,S.reveal),cy=L(640,640,S.reveal);
function proj(p){let x=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),z=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return[960+x*scale,cy+z*Math.sin(el)*scale-p[1]*Math.cos(el)*scale,z*Math.cos(el)+p[1]*Math.sin(el)]}
function poly(ps,col,alpha=1){ctx.globalAlpha=alpha;ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();ctx.fillStyle=col;ctx.fill();if(alpha===1){ctx.strokeStyle=col;ctx.lineWidth=.55;ctx.stroke()}ctx.globalAlpha=1}
function line(ps,col,w,alpha=1){ctx.globalAlpha=alpha;ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();ctx.globalAlpha=1}
function face(ps,color,alpha){faces.push({ps,color,alpha,z:ps.reduce((s,p)=>s+proj(p)[2],0)/ps.length});if(alpha>.05)bounds.push(...ps)}
function rail(axis,pos,y,len,offset,alpha,col){const n=Math.ceil(len/.18),w=.36,h=.12,b=.035;function point(u,v,yy){return axis===0?[u+offset,y+yy,pos+v]:[pos+v,y+yy,u+offset]}
const cs=[[-w/2+b,-h/2], [w/2-b,-h/2],[w/2,-h/2+b],[w/2,h/2-b],[w/2-b,h/2],[-w/2+b,h/2],[-w/2,h/2-b],[-w/2,-h/2+b]];
const shades=axis===0?['#8c3939','#9a4140','#b94c46','#d16b5c','#d9806a','#a24440','#8b3838','#a44742']:['#245653','#2a6662','#347a77','#4c9690','#6aa89e','#2b6c68','#235450','#306f6b'];
for(let k=0;k<n;k++){let u=-len/2+len*k/n-(k?0.006:0),v=-len/2+len*(k+1)/n+(k<n-1?0.006:0);for(let j=0;j<8;j++){let a=cs[j],b=cs[(j+1)%8];face([point(u,...a),point(v,...a),point(v,...b),point(u,...b)],shades[j],alpha)}}
face(cs.map(a=>point(-len/2,...a)),col,alpha);face(cs.map(a=>point(len/2,...a)),col,alpha);
}
// Thin drafting routes stay on the floor, clearly separate from the 3D object.
const draft=E((t-.3)/1.2)*(1-.8*E((t-15)/3));for(let i=-3;i<=3;i++){let p=i*.62,len=5.6-.64*Math.abs(i);line([[-len/2,0,p],[len/2,0,p]],'#bc4f49',1.2,draft*.22);line([[p,0,-len/2],[p,0,len/2]],'#347a77',1.2,draft*.22)}
// Subtle shadow strips, not a fake pre-rendered image.
for(let i=0;i<7;i++){let p=(i-3)*.62,len=5.6-.64*Math.abs(i-3);let a=S.rails[i],b=S.bars[i];if(a>0)poly([[-len/2,0,p-.24],[len/2,0,p-.24],[len/2,0,p+.24],[-len/2,0,p+.24]],'#263f42',a*.07);if(b>0)poly([[p-.24,0,-len/2],[p+.24,0,-len/2],[p+.24,0,len/2],[p-.24,0,len/2]],'#263f42',b*.06)}
for(let i=0;i<7;i++){let p=(i-3)*.62,len=5.6-.64*Math.abs(i-3),a=S.rails[i],b=S.bars[i];if(a>0)rail(0,p,i%2?.98:.46,len,-3.4*(1-a),C(a*5),'#bc4f49');if(b>0)rail(1,p,.72,len,3.4*(1-b),C(b*5),'#347a77')}
faces.sort((a,b)=>a.z-b.z);for(let f of faces)poly(f.ps,f.color,f.alpha);
// 2D registration marks and route indicator explain the over/under rhythm without labels.
let diag=E((t-7.5)/.5)*(1-E((t-17)/1));ctx.globalAlpha=diag;ctx.strokeStyle='#263f42';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(132,910);ctx.lineTo(570,910);ctx.stroke();for(let i=0;i<7;i++){let x=157+i*62;ctx.fillStyle=i%2?'#bc4f49':'#d98577';ctx.fillRect(x-10,i%2?879:922,20,9)}let dotx=132+438*C((t-8)/6);ctx.fillStyle='#347a77';ctx.beginPath();ctx.arc(dotx,910,5,0,PI*2);ctx.fill();ctx.globalAlpha=1;
// Title appears in breathing space before and after the assembly.
let title=E((t-.2)/.8)*(1-E((t-2)/.6))+E((t-21.7)/.8);ctx.globalAlpha=title;ctx.fillStyle='#263f42';ctx.font='64px WeaveSerif';ctx.fillText('Over and Under',112,112);ctx.globalAlpha=1;
let ps=bounds.map(proj);return{...S,polygons:faces.length,bounds:ps.length?{left:Math.min(...ps.map(p=>p[0])),right:Math.max(...ps.map(p=>p[0])),top:Math.min(...ps.map(p=>p[1])),bottom:Math.max(...ps.map(p=>p[1]))}:{left:960,right:960,top:640,bottom:640},crossingClearance:.14}}
const api={render,state,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.Weave=api;
})(typeof window!=='undefined'?window:globalThis);
