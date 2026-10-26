(function(root){'use strict';
const PI=Math.PI,TAU=2*PI,C=x=>Math.max(0,Math.min(1,x)),E=x=>{x=C(x);return x*x*x*(10+x*(-15+6*x))},L=(a,b,t)=>a+(b-a)*t;
function state(t){const opened=E((t-2)/3)*(1-E((t-19)/3));return {opened,theta:PI*(1-opened),ink:E((t-5)/2.8),ribbon:E((t-8)/2),travel:E((t-10)/6.5),settle:E((t-16.5)/2.5)};}
function render(ctx,t){t=Math.max(0,Math.min(24,t));let S=state(t);ctx.clearRect(0,0,1920,1080);ctx.fillStyle='#eee7d9';ctx.fillRect(0,0,1920,1080);
const yaw=-.32+.5*E((t-5)/11)-.25*E((t-19)/3),el=.7+.12*E((t-7)/8),scale=(225+12*Math.sin(E((t-4)/16)*PI))*(1-.18*Math.sin(S.theta)**2),cx=1.17*(1-S.opened),meshes=[],bound=[];
function proj(p){let xx=p[0]-cx,x=xx*Math.cos(yaw)-p[2]*Math.sin(yaw),z=xx*Math.sin(yaw)+p[2]*Math.cos(yaw);return[960+x*scale,675+z*Math.sin(el)*scale-p[1]*Math.cos(el)*scale,z*Math.cos(el)+p[1]*Math.sin(el)]}
function poly(ps){ctx.beginPath();ps.forEach((p,i)=>{let q=proj(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath()}
function face(ps,col,layer=0,alpha=1){meshes.push({ps,col,layer,alpha,z:ps.reduce((v,p)=>v+proj(p)[2],0)/ps.length});bound.push(...ps)}
function block(map,w,d,h,colors,layer){const p=[[0,0,-d],[w,0,-d],[w,0,d],[0,0,d],[0,-h,-d],[w,-h,-d],[w,-h,d],[0,-h,d]].map(a=>map(...a));for(let [ids,c] of [[[0,1,2,3],colors[0]],[[4,7,6,5],colors[1]],[[0,4,5,1],colors[1]],[[1,5,6,2],colors[2]],[[2,6,7,3],colors[2]],[[3,7,4,0],colors[1]]])face(ids.map(i=>p[i]),c,layer);}
const right=(u,h,z)=>[u,.32+h,z],left=(u,h,z)=>[-u*Math.cos(S.theta)+h*Math.sin(S.theta),.325+u*Math.sin(S.theta)+h*Math.cos(S.theta),z];
ctx.save();ctx.shadowColor='rgba(33,42,38,.19)';ctx.shadowBlur=34;ctx.shadowOffsetY=16;ctx.fillStyle='rgba(33,42,38,.05)';let shadowLeft=L(0,-2.5,S.opened);poly([[shadowLeft,0,-1.78],[2.52,0,-1.78],[2.52,0,1.82],[shadowLeft,0,1.82]]);ctx.fill();ctx.restore();
// Right board and paper block. Each is an actual closed six-face solid.
block((u,h,z)=>right(u,h-.15,z),2.52,1.83,.12,['#713b45','#4b2731','#824955'],0);
block(right,2.4,1.72,.15,['#fff8e8','#c5b79e','#e2d5bc'],1);
// Fine page edge laminations on the visible fore-edge and bottom edge.
for(let n=0;n<7;n++){let y=.32-.015-n*.019;face([[.05,y,1.722],[2.39,y,1.722],[2.39,y-.003,1.722],[.05,y-.003,1.722]],'#bcae96',2);}
function inkFace(ps,col,side,alpha=1){const map=side?right:left;face(ps.map(p=>map(p[0],.003,p[1])),col,side?3:6,alpha)}
function landscape(side){let a=S.ink;if(a<=0)return;const background=side?'#dce8df':'#e8dec8';inkFace([[.17,-1.48],[2.2,-1.48],[2.2,1.43],[.17,1.43]],background,side,a);
let sunx=side?1.7:.68,sunz=side?-1.02:-.94;inkFace(Array.from({length:48},(_,i)=>[sunx+.23*Math.cos(i/48*TAU),sunz+.23*Math.sin(i/48*TAU)]),side?'#f9f1db':'#e6b451',side,a);
if(!side){
 inkFace([[.17,.32],[.65,-.52],[1.14,.19],[1.55,-.8],[2.2,.22],[2.2,1.43],[.17,1.43]],'#779c94',0,a);
 inkFace([[.17,.72],[.75,.2],[1.25,.65],[1.83,.03],[2.2,.47],[2.2,1.43],[.17,1.43]],'#426e71',0,a);
 inkFace([[.17,1.08],[.8,.88],[1.36,1.12],[2.2,.73],[2.2,1.43],[.17,1.43]],'#173d49',0,a);
 for(let i=0;i<10;i++){let u=.27+i*.195,z=1.27+.03*Math.sin(i);inkFace([[u,z],[u+.07,z-.16],[u+.14,z]],'#b4c1a3',0,a*.75)}
}else{
 inkFace([[.17,-.15],[.55,-.27],[.95,-.18],[1.33,-.33],[1.7,-.25],[2.2,-.4],[2.2,1.43],[.17,1.43]],'#779c94',1,a);
 for(let j=0;j<8;j++){let z=.05+j*.17;const ps=[];for(let k=0;k<=35;k++){let u=.18+2.01*k/35;ps.push([u,z+.025*Math.sin(u*9+j+t*.7)])}inkFace([...ps,...ps.slice().reverse().map(p=>[p[0],p[1]+.012])],j%2?'#e4e8cf':'#426e71',1,a*.85)}
 inkFace([[.66,.48],[.96,.48],[.9,.58],[.73,.58]],'#713b45',1,a);inkFace([[.81,.42],[.81,-.02],[1.02,.42]],'#fff8e8',1,a);inkFace([[.79,.42],[.79,.12],[.64,.42]],'#e6b451',1,a);
}
// Printed border and spine margins stay within each paper rectangle.
for(let z of [-1.57,1.53])inkFace([[.16,z],[2.23,z],[2.23,z+.009],[.16,z+.009]],'#a99a7b',side,a*.65);
}
landscape(1);
// Hinged left paper and cloth, including closed outer cover ornament.
block(left,2.4,1.72,.15,['#fff8e8','#c5b79e','#e2d5bc'],4);
block((u,h,z)=>left(u,h-.15,z),2.52,1.83,.12,['#713b45','#4b2731','#824955'],5);
// Draw paper above board when open, board above paper when closed using per-surface depth ordering.
landscape(0);
const covermap=(u,z)=>left(u,-.273,z);let border=[[.22,-1.57],[2.27,-1.57],[2.27,1.57],[.22,1.57]];for(let i=0;i<4;i++){let a=border[i],b=border[(i+1)%4],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=[-dz/len*.012,dx/len*.012];face([a,b,[b[0]+n[0],b[1]+n[1]],[a[0]+n[0],a[1]+n[1]]].map(p=>covermap(...p)),'#d7ae65',7)}
for(let j=0;j<7;j++){let z=-.72+j*.23,u=1.2;face([[u,z-.17],[u+.28,z],[u,z+.13],[u-.28,z]].map(p=>covermap(...p)),'#c99955',7)}
// A continuous 3D fabric strip: moving bookmark, not a frame sequence.
let rb=[];if(S.ribbon>0){let center=L(-2.9,1.42,S.travel),lift=(.55+.22*Math.sin(t*1.2))*(1-S.settle),startz=L(-2.5,-1.68,S.settle),endz=L(-.1,2.1,S.settle);for(let i=0;i<=56;i++){let q=i/56,z=L(startz,endz,q),wave=Math.sin(q*TAU*1.4-t*2)*.13*(1-S.settle),x=center+wave,y=.345+lift+Math.sin(q*PI)*.18*(1-S.settle);rb.push([[x-.105,y,z],[x+.105,y,z]])}
 // During closure the ribbon's inner section lies beneath the cover; only the tail stays visible.
 for(let i=0;i<rb.length-1;i++){let ps=[rb[i][0],rb[i][1],rb[i+1][1],rb[i+1][0]];face(ps,i%2?'#e6b451':'#e4b04a',t>=19?3.5:8,S.ribbon)}
}
// Surface-aware painter order. Camera remains above the pages.
for(let m of meshes){if(m.layer>=4&&m.layer<8){m.sort=4+m.z*.001; const facing=Math.sin(S.theta)*Math.sin(yaw)*Math.cos(el)+Math.cos(S.theta)*Math.sin(el);if(m.layer===6)m.sort+=facing>0?.5:-.5;if(m.layer===7)m.sort+=facing>0?-.5:.5;}else m.sort=m.layer+m.z*.0001}
meshes.sort((a,b)=>a.sort-b.sort);ctx.lineJoin='round';for(let m of meshes){ctx.globalAlpha=m.alpha;poly(m.ps);ctx.fillStyle=m.col;ctx.fill();ctx.strokeStyle=m.col;ctx.lineWidth=.35;ctx.stroke()}
ctx.globalAlpha=1;
ctx.globalAlpha=1;let title=E((t-.15)/.7)*(1-E((t-1.9)/.5))+E((t-22)/.7);ctx.globalAlpha=title;ctx.fillStyle='#173d49';ctx.font='64px BookmarkSerif';ctx.fillText('Between the Pages',112,102);ctx.globalAlpha=1;let screen=bound.map(proj);return{theta:S.theta,opened:S.opened,polygons:meshes.length,ribbonVisible:rb.length>0,bounds:{left:Math.min(...screen.map(p=>p[0])),right:Math.max(...screen.map(p=>p[0])),top:Math.min(...screen.map(p=>p[1])),bottom:Math.max(...screen.map(p=>p[1]))}};
}
const api={render,state,duration:24,width:1920,height:1080};if(typeof module!=='undefined')module.exports=api;root.Bookmark=api;
})(typeof window!=='undefined'?window:globalThis);
