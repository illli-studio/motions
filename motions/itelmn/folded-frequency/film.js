/* Folded Frequency — original geometric study, MIT-0. */
(function(root){
const PI=Math.PI,TAU=2*PI,W=1920,H=1080;
const clamp=x=>Math.max(0,Math.min(1,x));const smooth=(a,b,t)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const lerp=(a,b,t)=>a+(b-a)*t;
function render(c,t){
 t=Math.max(0,Math.min(22,t));c.globalAlpha=1;c.setTransform(1,0,0,1,0,0);c.fillStyle='#101621';c.fillRect(0,0,W,H);
 let fold=smooth(3.2,7.4,t)*(1-smooth(16,19.7,t)),reveal=smooth(.15,1.2,t),energy=(1-smooth(17,20,t));
 let yaw=-.22+smooth(5.5,9,t)*1.15+smooth(9,14,t)*.3+smooth(14,16,t)*1.4;
 yaw*=fold;let pitch=(-.25+ .15*Math.sin(t*.31))*fold;
 let zoom=1+smooth(7,9,t)*.12-smooth(12.7,15.3,t)*.12;
 function project(v){let [x,y,z]=v;let xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw);let yy=y*Math.cos(pitch)-zz*Math.sin(pitch),z2=y*Math.sin(pitch)+zz*Math.cos(pitch);let s=1350/(1350+z2)*zoom;return [960+xx*s,560+yy*s,z2];}
 function vertex(u,w){let a=(u-.5)*TAU*1.1;let wave=95*Math.sin(u*TAU*3-t*TAU*1.5)*Math.sin(PI*u)*energy;let base=[(u-.5)*1350,w*5+wave,0];let center=[330*Math.sin(a),480*(u-.5),230*Math.cos(a)];let twist=a*.67+t*.11;let width=74*(.65+.35*Math.sin(PI*u));let v=[center[0]+w*width*Math.cos(twist),center[1]+w*width*.2*Math.sin(a),center[2]+w*width*Math.sin(twist)];return [lerp(base[0],v[0],fold),lerp(base[1],v[1],fold),lerp(base[2],v[2],fold)];}
 // The restrained grid provides spatial reference without simulating a physical floor.
 c.globalAlpha=.12*reveal;c.strokeStyle='#9aa8b8';c.lineWidth=1;for(let x=120;x<1920;x+=120){c.beginPath();c.moveTo(x,170);c.lineTo(x,910);c.stroke()}for(let y=190;y<950;y+=120){c.beginPath();c.moveTo(100,y);c.lineTo(1820,y);c.stroke()}c.globalAlpha=1;
 let glow=c.createRadialGradient(960,600,10,960,600,620);glow.addColorStop(0,'rgba(38,65,98,.27)');glow.addColorStop(1,'rgba(16,22,33,0)');c.fillStyle=glow;c.fillRect(200,160,1520,850);
 // Floating ellipse shadow.
 c.save();c.translate(960,850);c.scale(1,.12);let sh=c.createRadialGradient(0,0,0,0,0,560);sh.addColorStop(0,'rgba(0,0,0,.48)');sh.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sh;c.globalAlpha=fold;c.beginPath();c.arc(0,0,560,0,TAU);c.fill();c.restore();
 const N=190,M=14,faces=[];let points=[];for(let i=0;i<=N;i++){points[i]=[];for(let j=0;j<=M;j++)points[i][j]=project(vertex(i/N,(j/M-.5)*2));}
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){let p=[points[i][j],points[i+1][j],points[i+1][j+1],points[i][j+1]];let cross=(p[1][0]-p[0][0])*(p[3][1]-p[0][1])-(p[1][1]-p[0][1])*(p[3][0]-p[0][0]);faces.push({p,z:p.reduce((s,v)=>s+v[2],0)/4,u:i/N,v:j/M,front:cross>0});}faces.sort((a,b)=>b.z-a.z);
 c.globalAlpha=reveal;for(let f of faces){let phase=(f.u*2-t*1.5)%1;phase=(phase+1)%1;let pulse=Math.exp(-Math.pow((phase-.5)*12,2))*energy;let shine=.7+.3*Math.cos(f.v*PI*2-.7);let base=f.front?[255,121,94]:[115,185,219];let lit=shine*(.79+.14*Math.cos(f.u*12+t*.2));let col=base.map((v,k)=>Math.round(lerp(v*lit,[205,232,255][k],pulse*.67)));c.fillStyle=`rgb(${col})`;c.strokeStyle=c.fillStyle;c.lineWidth=.65;c.beginPath();f.p.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fill();c.stroke();}
 // Continuous edge highlights are actual projected ribbon boundaries.
 for(let j of [0,M]){c.strokeStyle=j?'rgba(255,230,207,.65)':'rgba(165,216,255,.65)';c.lineWidth=1.4;c.beginPath();for(let i=0;i<=N;i++){let p=points[i][j];i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.stroke();}
 c.globalAlpha=1;
 function text(str,x,y,size,family,color='#f4ead8',alpha=1){c.globalAlpha=alpha;c.fillStyle=color;c.font=`${size}px ${family}`;c.fillText(str,x,y);c.globalAlpha=1;}
 let entry=smooth(.2,1.5,t);text('FOLDED FREQUENCY',102,108+20*(1-entry),48,'FoldMono','#f4ead8',entry);text('SOUND / GIVEN FORM',1420,108,21,'FoldMono','#9faebe',entry);
 c.strokeStyle='#5b6675';c.lineWidth=1;c.beginPath();c.moveTo(100,140);c.lineTo(1820,140);c.stroke();
 let stage=t<3.2?0:t<7.4?1:t<16?2:3;let labels=['01  /  SIGNAL','02  /  SURFACE','03  /  RESONANCE','04  /  STILLNESS'];text(labels[stage],104,950,24,'FoldMono','#b3c1ce',entry);
 let phrases=['A line learns to move.','Frequency becomes volume.','Let the surface carry the rhythm.','And returns to quiet.'];text(phrases[stage],104,1010,32,'FoldSerif','#f4ead8',entry);
 text('90 BPM',1620,950,23,'FoldMono','#b3c1ce',entry);text('STUDY  /  001',1532,1010,23,'FoldMono','#b3c1ce',entry);
 // Progress strip, distinct from playback UI.
 c.fillStyle='#3b4758';c.fillRect(104,882,1712,2);c.fillStyle='#ff795e';c.fillRect(104,882,1712*t/22,2);
 let intro=smooth(.2,1.1,t)*(1-smooth(2.7,3.7,t));text('Hear the shape of sound.',405,340,78,'FoldSerif','#f4ead8',intro);
 let end=smooth(19.3,20.4,t);text('Less motion. More feeling.',350,370+20*(1-end),86,'FoldSerif','#f4ead8',end);
}
const api={render,duration:22,width:W,height:H};if(typeof module!=='undefined')module.exports=api;root.FoldedFrequency=api;
})(typeof window==='undefined'?globalThis:window);
