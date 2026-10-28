import * as T from './assets/three.module.js';
const canvas=document.querySelector('#scene');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1920,1080);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
const scene=new T.Scene();scene.background=new T.Color('#e8e6e0');
const camera=new T.PerspectiveCamera(35,1920/1080,.1,80);camera.position.set(-2.4,3.8,4.1);camera.lookAt(-.15,2.9,-.1);
scene.add(new T.HemisphereLight('#f5f7fc','#a4a59b',2));const sun=new T.DirectionalLight('#fff5df',4);sun.position.set(-4,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.015;sun.shadow.bias=-.0001;sun.shadow.radius=7;sun.shadow.blurSamples=12;scene.add(sun);const fill=new T.DirectionalLight('#d0e5f1',1.1);fill.position.set(6,3,-4);scene.add(fill);
const mat=(color,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});const concrete=mat('#c4c0b3',.93),asphalt=mat('#363f40',.96),steel=mat('#8b9a9c',.34,.7),rubber=mat('#20292b',.85),pale=mat('#e7e5d9',.75),blue=mat('#729090',.38,.4);
function bevel(w,h,d,r=.025){r=Math.min(r,w/5,h/5,d/5);w-=2*r;h-=2*r;let s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);let g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1,curveSegments:8});g.translate(0,0,-d/2+r);return g}
function box(x,y,z,w,h,d,m,r=.02,parent=scene){const o=new T.Mesh(bevel(w,h,d,r),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
// Small deterministic procedural surface maps: material detail, never prerendered footage.
function grain(seed,base,spread){let bytes=new Uint8Array(256*256*4);for(let i=0;i<256*256;i++){seed=(1664525*seed+1013904223)>>>0;let v=Math.max(0,Math.min(255,base+(seed>>>24)/255*spread-spread/2));bytes[i*4]=bytes[i*4+1]=bytes[i*4+2]=v;bytes[i*4+3]=255}let t=new T.DataTexture(bytes,256,256,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(9,5);t.needsUpdate=true;return t}
concrete.map=grain(47,228,20);concrete.bumpMap=concrete.map;concrete.bumpScale=.012;asphalt.map=grain(91,220,48);asphalt.bumpMap=asphalt.map;asphalt.bumpScale=.018;
const moving=new T.Group();scene.add(moving);const ROAD=2.8,DEPTH=3.2;
box(-2.6,2.42,0,4.9,.6,DEPTH,concrete,.035,moving);box(-2.6,2.76,0,4.9,.08,DEPTH,asphalt,.006,moving);
box(2.35,1.36,0,4.4,2.72,DEPTH,concrete,.04);box(2.35,2.76,0,4.4,.08,DEPTH,asphalt,.006);
// Steel wearing surfaces exactly flush with ROAD; no raised transverse barrier.
box(-.205,2.75,0,.11,.1,DEPTH,steel,.006,moving);box(.205,2.75,0,.11,.1,DEPTH,steel,.006);
// Shallow folded elastomer strip; shared z cut planes with both decks.
function sealGeometry(gap=.3){const vertices=[],indices=[],N=32;for(let j=0;j<=N;j++){const z=-DEPTH/2+j*DEPTH/N;for(let i=0;i<=16;i++){const u=i/16;vertices.push(-gap/2+gap*u,2.775-.115*Math.sin(Math.PI*u),z)}}for(let j=0;j<N;j++)for(let i=0;i<16;i++){let a=j*17+i,b=a+17;indices.push(a,b,a+1,b,b+1,a+1)}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g}const seal=new T.Mesh(sealGeometry(),new T.MeshStandardMaterial({color:'#17272a',roughness:.75,side:T.DoubleSide}));seal.castShadow=true;seal.receiveShadow=true;scene.add(seal);
// A compact sliding bearing: three flat contacting faces, all within shared cut plane.
box(-.95,.78,0,1.55,1.56,2.6,concrete,.035);box(-.95,1.63,0,1.7,.14,2.7,steel,.012);box(-.95,1.75,0,1.08,.1,2.35,rubber,.008);box(-.95,1.9,0,1.2,.2,2.45,blue,.015,moving);box(-.95,2.06,0,1.32,.12,2.55,steel,.008,moving);
// Fine ribs on the concrete cut face communicate layers without diagram text.
for(let x=-4.8;x<-.35;x+=.28)box(x,2.27,1.603,.018,.06,.008,mat('#a7a598',1),.002,moving);
// One real circular wheel, cropped vehicle context unnecessary for this joint study.
const wheel=new T.Group();wheel.position.set(-1.05,3.32,.37);scene.add(wheel);let tire=new T.Mesh(new T.CylinderGeometry(.52,.52,.30,64),rubber);tire.rotation.x=Math.PI/2;tire.castShadow=true;tire.receiveShadow=true;wheel.add(tire);for(let z of[-.157,.157]){let hub=new T.Mesh(new T.CylinderGeometry(.34,.34,.018,48),steel);hub.rotation.x=Math.PI/2;hub.position.z=z;wheel.add(hub);let center=new T.Mesh(new T.CylinderGeometry(.105,.105,.03,32),blue);center.rotation.x=Math.PI/2;center.position.z=z*1.1;wheel.add(center);for(let i=0;i<8;i++){let a=i*Math.PI/4;(()=>{let spoke=box(Math.sin(a)*.21,Math.cos(a)*.21,z,.045,.24,.025,pale,.008,wheel);spoke.rotation.z=-a})()}}for(let i=0;i<48;i++){let a=i*Math.PI*2/48;let tread=box(Math.sin(a)*.516,Math.cos(a)*.516,0,.035,.012,.25,mat('#30393a',.9),.003,wheel);tread.rotation.z=-a}
// Cropped vehicle lower body gives the rolling wheel real-world context.
const body=mat('#5c7b80',.28,.25);let profile=new T.Shape();profile.moveTo(-3.1,3.43);profile.lineTo(-1.69,3.43);profile.bezierCurveTo(-1.66,4.16,-.44,4.16,-.41,3.43);profile.lineTo(.65,3.43);profile.quadraticCurveTo(.85,3.45,.85,3.65);profile.lineTo(.85,4.65);profile.lineTo(-3.1,4.65);profile.closePath();let carGeo=new T.ExtrudeGeometry(profile,{depth:1.4,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:5,curveSegments:32});carGeo.translate(0,0,-1.2);let carbody=new T.Mesh(carGeo,body);carbody.castShadow=true;carbody.receiveShadow=true;scene.add(carbody);
const floor=new T.Mesh(new T.PlaneGeometry(200,200),mat('#e8e6e0',1));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
const basePositions=moving.children.map(o=>o.position.clone());
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));const ease=v=>{v=clamp(v);return v*v*(3-2*v)};const lerp=(a,b,t)=>a+(b-a)*t;
const guide=document.querySelector('#guides').getContext('2d');
const label=document.querySelector('#title'),thermo=document.querySelector('#thermo'),mercury=document.querySelector('#mercury');
function extAt(t){if(t<4)return 0;if(t<8.8)return .12*ease((t-4)/4.8);if(t<13.5)return lerp(.12,-.08,ease((t-8.8)/4.7));if(t<17.6)return lerp(-.08,.10,ease((t-13.5)/4.1));if(t<19)return lerp(.10,0,ease((t-17.6)/1.4));return 0}
function pose(pos,target){camera.position.set(...pos);camera.lookAt(...target)}
function blendPose(a,b,u){pose(a[0].map((x,i)=>lerp(x,b[0][i],u)),a[1].map((x,i)=>lerp(x,b[1][i],u)))}
const macro=[[-2.4,3.8,4.1],[-.15,2.9,-.1]],thermal=[[-3.2,4.7,6.0],[-.05,2.35,.1]],bearing=[[-2.8,2.7,4.7],[-.75,1.92,.2]];
function draw(t){t=clamp(t,0,21);const ext=extAt(t),gap=.3-ext;
 moving.children.forEach((o,i)=>{o.position.copy(basePositions[i]);o.scale.set(1,1,1);if(i<2){o.scale.x=(4.9+ext)/4.9;o.position.x+=ext/2}else if(i<5)o.position.x+=ext;else o.position.x+=ext*(basePositions[i].x+5.05)/4.9});
 const positions=seal.geometry.attributes.position;const fold=Math.sqrt(Math.max(.001,.44*.44-gap*gap))*.4;for(let j=0;j<=32;j++)for(let i=0;i<=16;i++){let u=i/16,k=j*17+i;positions.setXYZ(k,-.15+ext+gap*u,2.775-fold*Math.sin(Math.PI*u),-DEPTH/2+j*DEPTH/32)}positions.needsUpdate=true;seal.geometry.computeVertexNormals();
 let wx=t<4?lerp(-2.7,2.4,clamp(t/3.8)):lerp(-2.4,1.8,clamp((t-18.5)/2.5));let closest=wx<-.15?0:wx>.15?0:Math.min(wx+.15,.15-wx);let cy=ROAD+Math.sqrt(.52*.52-closest*closest);wheel.position.set(wx,cy,.37);wheel.rotation.z=-(wx+2.7)/.52;carbody.position.set(wx+1.05,cy-3.32,0);wheel.visible=carbody.visible=(t<4||t>=18.5);
 if(t<3.7)pose(...macro);else if(t<4.5)blendPose(macro,thermal,ease((t-3.7)/.8));else if(t<13.7)pose(...thermal);else if(t<14.6)blendPose(thermal,bearing,ease((t-13.7)/.9));else if(t<18.3)pose(...bearing);else if(t<19.1)blendPose(bearing,macro,ease((t-18.3)/.8));else pose(...macro);
 label.textContent=t<3.7?'为什么留缝？':t<8.8?'升温':t<13.5?'降温':t<18.3?'滑动支座':'为伸缩留空间';
 thermo.style.opacity=t>=4.5&&t<13.5?'1':'0';mercury.style.height=(24+58*(ext+.08)/.2)+'px';mercury.style.background=t<8.8?'#bd5b38':'#548498';
 renderer.render(scene,camera);
 guide.clearRect(0,0,1920,1080);const project=(x,y,z)=>{let v=new T.Vector3(x,y,z).project(camera);return[(v.x+1)*960,(1-v.y)*540]};
 function stroke(a,b,color,width=3,dash=[]){guide.beginPath();guide.setLineDash(dash);guide.strokeStyle=color;guide.lineWidth=width;guide.lineCap='round';guide.moveTo(...a);guide.lineTo(...b);guide.stroke();guide.setLineDash([])}
 if(t>=4.5&&t<13.5){let a=project(-.15+ext,2.8,1.6),b=project(.15,2.8,1.6),n=project(-.15,2.8,1.6);a[1]-=47;b[1]-=47;n[1]-=47;stroke(a,b,'#f5f0d9',4);for(let p of[a,b])stroke([p[0],p[1]-9],[p[0],p[1]+9],'#f5f0d9',3);stroke([n[0],n[1]-24],[n[0],n[1]+26],'#bd9568',2,[4,5])}
 if(t>=14.6&&t<18.3){let fixed=project(-.95,1.66,1.37),upper=project(-.95+ext,1.95,1.25),neutral=project(-.95,1.95,1.25);let ux=fixed[0]+upper[0]-neutral[0],uy=upper[1];stroke([fixed[0],uy-13],[fixed[0],fixed[1]+12],'#d5ded4',2,[3,5]);stroke([fixed[0],fixed[1]-8],[fixed[0],fixed[1]+9],'#f7eed5',5);stroke([ux,uy-9],[ux,uy+9],'#e8a56d',5)}
}
const clock={t:0};const tl=gsap.timeline({paused:true});tl.to(clock,{t:21,duration:21,ease:'none',onUpdate:()=>draw(tl.time())});window.BridgeTimeline=tl;window.BridgeScene={draw,scene,camera,extAt};draw(0);
