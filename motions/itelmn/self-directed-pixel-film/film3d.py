import bpy, math, os, sys, json, time
from mathutils import Vector
from pathlib import Path
P=Path(__file__).resolve().parent
# Materialize Blender lighting from registry-compatible text.
(P/'softbox.sl').write_text((P/'softbox.sl.txt').read_text())
sys.path.insert(0,str(P))
from actors import create_actor, pose_actor, create_pointer
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
S=bpy.context.scene
S.render.engine='BLENDER_WORKBENCH'
S.render.resolution_x=960;S.render.resolution_y=540;S.render.resolution_percentage=100
S.render.image_settings.file_format='PNG';S.render.fps=30
S.display.shading.light='STUDIO';S.display.shading.studio_light='studio.sl'
bpy.context.preferences.studio_lights.load(str(P/'softbox.sl'),'STUDIO')
S.display.shading.studio_light='softbox.sl'
S.display.shading.color_type='MATERIAL';S.display.shading.show_shadows=False
S.display.shading.show_cavity=True;S.display.shading.cavity_type='BOTH'
S.display.shading.curvature_ridge_factor=.3;S.display.shading.curvature_valley_factor=1.1
S.display.shading.cavity_ridge_factor=.3;S.display.shading.cavity_valley_factor=1.1
S.display.shading.show_specular_highlight=False;S.display.shading.show_object_outline=False
S.display.shading.background_type='WORLD';S.world.color=(.89,.85,.77)
S.display.render_aa='5';S.view_settings.view_transform='Standard'
S.render.film_transparent=False
COL={'ivory':(0.89,.85,.77,1),'white':(.98,.96,.91,1),'ink':(.055,.065,.065,1),'orange':(.71,.27,.14,1),'mint':(.38,.62,.49,1),'purple':(.52,.43,.66,1),'gold':(.90,.62,.24,1),'gray':(.48,.47,.43,1)}
mats={}
for k,c in COL.items():
 m=bpy.data.materials.new(k);m.diffuse_color=c;mats[k]=m
font=bpy.data.fonts.load(str(P/'assets/NotoSansCJK-Bold.otf'))
mono=bpy.data.fonts.load(str(P/'assets/DejaVuSansMono.ttf'))
def empty(name,loc=(0,0,0)):
 o=bpy.data.objects.new(name,None);S.collection.objects.link(o);o.location=loc;return o
def cube(name,loc,size,mat='white',bev=.06,parent=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mats[mat] if isinstance(mat,str) else mat)
 if bev:
  mod=o.modifiers.new('Soft crafted edges','BEVEL');mod.width=bev;mod.segments=2
  o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 if parent:o.parent=parent
 return o
def text(body,loc,size=.4,mat='ink',parent=None,align='LEFT',f=None):
 c=bpy.data.curves.new('Type '+body,'FONT');c.body=body;c.font=f or font;c.size=size;c.align_x=align;c.extrude=0;c.bevel_depth=0
 o=bpy.data.objects.new('Type '+body,c);S.collection.objects.link(o);o.location=loc;o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(mats[mat]);o.parent=parent;return o
def line(name,points,rad=.025,mat='ink',parent=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=rad;c.bevel_resolution=1
 sp=c.splines.new('POLY');sp.points.add(len(points)-1)
 for v,p in zip(sp.points,points):v.co=(*p,1)
 o=bpy.data.objects.new(name,c);S.collection.objects.link(o);o.data.materials.append(mats[mat]);o.parent=parent;return o
def panel(name,x,y,z,w,h,label,mat='white'):
 root=empty(name,(x,y,z));cube(name+' housing',(0,.14,0),(w,.24,h),'ink',.10,root);cube(name+' paper',(0,-.005,-.13),(w-.16,.06,h-.4),mat,.045,root)
 text(label,(-w/2+.22,-.1,h/2-.26),.14,'white',root)
 for i in range(3): cube('window control',(-w/2+.15+i*.16,-.06,h/2-.12),(.07,.05,.07),['orange','gold','mint'][i],.02,root)
 return root
# Long sculptural work island, continuous physical geography.
cube('Porcelain world',(38,4,-.55),(400,400,.8),'ivory',.35)
# seamless warm cyclorama
# Dawn plinth and tiled launcher
cube('Dawn stage',(0,0,-.03),(10,6,.22),'white',.2)
for i,k in enumerate(['ink','orange','mint','purple','gold']):cube('launcher '+str(i),(-2+i*.9,-1.1,.15),(.63,.63,.18),k,.08)
text('今天，自己动手。',(-3.8,1.8,2.65),.5)
text('A CURSOR’S FILM',(-3.8,1.79,2.25),.16,'gray',f=mono)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=.45,location=(-4.5,2.7,3.1));bpy.context.object.data.materials.append(mats['gold'])
# Terminal
terminal=panel('terminal',5,2,2.2,6,3.5,'01 / CLAUDE CODE','ink')
text('> Claude Code',(-2.65,-.08,1.05),.24,'orange',terminal,f=mono)
text('~/studio',(-2.65,-.08,.5),.18,'gray',terminal,f=mono)
command=text('',(-2.65,-.08,-.12),.26,'white',terminal)
text('● one idea. infinite possibilities.',(-2.65,-.08,-1.05),.13,'mint',terminal,f=mono)
# Four working stations arranged in spatial fan
stations=[];model_lines=[];code_texts=[];music_bars=[];edit_tiles=[]
for i,(x,y,z,label) in enumerate([(13,2,2.1,'MODEL / 建模'),(18,2.7,2.4,'CODE / 代码'),(13,-2,1.7,'SOUND / 配乐'),(18,-1.5,2,'EDIT / 剪辑')]):
 q=panel('work'+str(i),x,y,z,4.1,2.8,label);stations.append(q)
 if i==0:
  verts=[(-.8,-.18,-.6),(.6,-.18,-.6),(.6,-.18,.7),(-.8,-.18,.7),(-.4,.6,-.2),(1,.6,-.2),(1,.6,1.1),(-.4,.6,1.1)]
  for a,b in [(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),(0,4),(1,5),(2,6),(3,7)]:model_lines.append(line('wire model',[verts[a],verts[b]],.026,'orange',q))
 elif i==1:
  for j,tx in enumerate(['const dream = new World();','camera.follow(you);','timeline.play();','render({ fps: 60 });']):code_texts.append((text(tx,(-1.8,-.08,.62-j*.35),.115,['ink','orange','purple','ink'][j],q,f=mono),tx))
 elif i==2:
  for j in range(28):music_bars.append(cube('tiny sound',(-1.7+j*.12,-.08,-.12),(.065,.08,.1+.6*abs(math.sin(j*1.8))*abs(math.cos(j*.31))),'mint',.008,q))
 else:
  for row in range(3):
   for j in range(4):edit_tiles.append(cube('edit clip',(-1.3+j*.85,-.08,.5-row*.5),(.7,.08,.28),['orange','mint','purple'][row],.025,q))
text('一个想法，四个自己。',(12,4.5,4.8),.58)
# Actual soundtrack waveform bridge
wave=json.load(open(P/'assets/waveform.json'))
print('WAVE_TYPE',type(wave))
if isinstance(wave,dict):
 print('WAVE_KEYS',wave.keys());values=wave.get('peaks',wave.get('waveform',wave.get('samples',[])))
else:values=wave
if not values: values=[.3]*128
if isinstance(values[0],list):values=[max(abs(z) for z in v) for v in values]
wavebars=[]
for i in range(100):
 v=abs(values[int(i/100*len(values))]);v=float(v) if isinstance(v,(int,float)) else .3
 h=.15+min(v,1)*1.9
 wavebars.append(cube('PCM waveform', (23+i*.11,.7,h/2),(.065,.55,h),'mint',.018))
text('节奏，是踩出来的。',(23,2.4,3.4),.5)
text('48,000 samples / second',(23,2.39,2.92),.14,'gray',f=mono)
# Editing table
edit=panel('timeline',35,2,1.9,6.4,3.3,'04 / TIME IS MATERIAL')
for row in range(3):
 cube('track',(0,-.08,.7-row*.65),(5.7,.03,.45),'ivory',.015,edit)
 for j in range(5):cube('timeline material',(-2.25+j*1.1,-.14,.7-row*.65),(.95,.08,.34),['orange','mint','purple'][row],.025,edit)
renderpad=cube('render pedal',(37,-1,.16),(2.2,1.2,.3),'orange',.14)
rt=text('渲染',(36.4,-1.63,.5),.33,'white');rt.rotation_euler=(0,0,0)
# Coaster is true spatial film ribbon, not a 2D graphic
# points from x40 to x63, weaving y and z; build mesh quads for physical film frames
N=180
def track(u):
 return Vector((40+23*u,1.2+2.6*math.sin(u*math.pi*2),1.3+2.7*math.sin(u*math.pi)**2+1.15*math.sin(u*math.pi*4)))
rail=[]
for i in range(N):
 u=i/(N-1);p=track(u);t=(track(min(1,u+.001))-track(max(0,u-.001))).normalized();side=t.cross(Vector((0,0,1))).normalized();rail.append((p,side))
for sideidx,sign in enumerate([-1,1]):line('film edge',[(p+sign*.57*side) for p,side in rail],.052,'ink')
for i in range(0,N-1,2):
 p,side=rail[i];q,side2=rail[min(N-1,i+2)];verts=[p-.55*side,p+.55*side,q+.55*side2,q-.55*side2]
 me=bpy.data.meshes.new('film segment');me.from_pydata(verts,[],[(0,1,2,3)]);me.materials.append(mats[['orange','mint','purple','white'][(i//2)%4]])
 o=bpy.data.objects.new('Film frame',me);S.collection.objects.link(o)
 # Every film frame has dark border, exposed image inset, and two sprocket holes.
 center=(p+q)*.5;forward=(q-p).normalized();up=side.cross(forward).normalized()
 for sg in [-1,1]:
  hp=center+side*.43*sg+Vector((0,0,.025))
  hole=cube('film sprocket',hp,(.09,.09,.015),'white',.012)
 # inset miniature image in center of each photographic cell
 for delta in [-.12,.12]:
  pp=center+side*delta+Vector((0,0,.025))
  dot=cube('image pixel',pp,(.10,.10,.016),'ink' if delta<0 else 'white',.005)
 if i%8==0:
  cube('track support',(p.x,p.y,(p.z-.15)/2),(.055,.055,p.z+.15),'gray',.0)
text('把每一帧，变成旅程。',(41,6.3,5.9),.55)
# Coaster cart
cart=empty('cart');cube('cart body',(0,0,.15),(2.3,1.35,.3),'ink',.15,cart)
for seatx in [-.56,.56]:
 cube('seat back',(seatx+.28,0,.58),(.12,1.12,.4),'orange',.045,cart)
 line('safety bar',[(seatx-.22,-.6,.35),(seatx-.22,-.6,.6),(seatx-.22,.6,.6),(seatx-.22,.6,.35)],.035,'gold',cart)
for x in [-.82,.82]:
 for y in [-.48,.48]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.18,location=(x,y,0));o=bpy.context.object;o.parent=cart;o.data.materials.append(mats['orange'])
# Recursive player: concentric physical portals with synchronized actors
player=panel('player',67,3,3,7.3,4.6,'05 / NOW PLAYING')
text('此刻，就是下一层。',(63.5,4,6.3),.58)
portals=[]
for i in range(1):
 sc=.68**i;root=empty('recursive layer '+str(i),(67,2.65-i*.18,3));root.scale=(sc,sc,sc)
 for x,z,w,h in [(0,1.7,6.2,.14),(0,-1.7,6.2,.14),(-3.05,0,.14,3.4),(3.05,0,.14,3.4)]:cube('recursive bezel',(x,0,z),(w,.13,h),'ink',.025,root)
 portals.append(root)
# Title sculpture
main_title=text('自己动手',(76.8,2.5,3.5),2.4)
text('A CURSOR’S FILM / VOLUME 02',(76.5,2.49,2.9),.2,'orange',f=mono)
stats_title=text('64 秒     1,920 帧     960 × 540',(76.5,2.48,1.8),.44)
text('30 FPS / CAMERA PREVIEW / TRUE 3D',(76.5,2.47,1.2),.15,'ink',f=mono)
# Actors, all actual volumetric meshes
actors=[create_actor('Claude '+str(i),scale=1) for i in range(4)]
for a in actors:a['root'].rotation_euler[2]=0
pointer=create_pointer('Original pointer');pointer.location=(1.4,-1.5,.3)
# moving material tile
material=cube('material to drag',(32,-1,.5),(1.2,.2,.7),'orange',.07)
# Camera lens, smooth cubic interpolated aim
bpy.ops.object.camera_add();cam=bpy.context.object;S.camera=cam;cam.data.lens=32;cam.data.clip_end=250
keys=[(0, (5, -10, 6), (0, 0, 1)), (1.6, (5, -10, 6), (0, 0, 1)), (2.5, (2.8, -4, 1.7), (0.8, -0.7, 0.55)), (2.85, (2.8, -4, 1.7), (0.8, -0.7, 0.55)), (3.5, (2, -6, 5), (-0.2, -0.8, 2.8)), (4.25, (-0.2, -6, 4), (-1.4, -0.7, 2.8)), (4.6, (0.5, -7, 4), (0, 0, 1.8)), (5.5, (8, -8, 5), (5, 1, 1.8)), (7.7, (8, -8, 5), (5, 1, 1.8)), (8.5, (5.5, -4.7, 2.8), (5, 2, 2.2)), (11.5, (5.5, -4.7, 2.8), (5, 2, 2.2)), (12.5, (10, -13, 7), (7, 0, 1.8)), (14, (20, -17, 9), (15.5, 0, 1.6)), (14.5, (20, -17, 9), (15.5, 0, 1.6)), (15, (13, -1.2, 5.7), (13, 2, 2.2)), (15.5, (13, -1.2, 5.7), (13, 2, 2.2)), (16, (18, -0.8, 6), (18, 2.7, 2.5)), (16.5, (18, -0.8, 6), (18, 2.7, 2.5)), (17, (12, -6, 3.4), (13, -2, 1.8)), (17.5, (12, -6, 3.4), (13, -2, 1.8)), (18, (19, -6, 3.5), (18, -1.5, 2)), (18.5, (19, -6, 3.5), (18, -1.5, 2)), (19.5, (24, -9, 4), (22, 0, 1)), (20, (24, -6.8, 2.5), (22.400000000000002, 0.1, 1)), (21, (26, -6.8, 2.5), (23.8, 0.1, 1)), (22.5, (27.5, -5, 2.2), (26, 0.1, 1.1)), (24, (30, -5, 2.4), (28, 0.1, 1.2)), (25.5, (32, -5, 2.2), (30.7, 0.1, 1.1)), (26.5, (34, -5, 3.3), (32.8, 0.5, 1.5)), (27.7, (34, -5, 3.3), (33.5, 0.7, 1.9)), (28.5, (35, -6, 3), (35, 1, 1.8)), (29, (35, -6, 3), (35, 1, 1.8)), (29.7, (39, -4.5, 2), (37, -0.7, 0.8)), (30.3, (39, -4.5, 2), (37, -0.7, 0.8)), (31.3, (41, -6, 4), (39, 1, 1.3)), (32, (42, -3, 2), (40, 1, 1)), (33.5, (47, -10, 8), (43, 1, 2.4)), (35, (48, -6, 5), (46, 1, 3)), (37.5, (53, -6, 6), (51, 1, 3.8)), (40, (62, -9, 7), (57, 0, 2)), (42, (67, -10, 5.8), (64, 1, 2)), (44.25, (68, -9, 5), (67, 1, 2)), (45, (68, -9, 5), (67, 1, 2)), (46, (67.5, -8, 4), (67, 2.6, 3)), (47.5, (67.3, -6, 3.7), (67, 2.6, 3)), (48.5, (67.2, -4.8, 3.4), (67, 2.6, 3)), (49, (67.1, -4, 3.3), (67, 2.6, 3)), (49.5, (67, -3.7, 3.2), (67, 2.6, 3)), (50.3, (73, -8, 4.2), (72, 1, 2)), (51, (76, -6, 3.8), (74, 0, 1.4)), (51.7, (76, -6, 3.8), (74, 0, 1.4)), (53, (80, -7.5, 4.4), (79, 1, 2.1)), (56, (80, -7.5, 4.4), (79, 1, 2.1)), (58, (64, -26, 21), (45, 2, 1)), (60, (26, -29, 20), (20, 1, 1)), (61.5, (3, -11, 6), (-1, 0, 1)), (62.5, (5, -10, 6), (0, 0, 1)), (64, (5, -10, 6), (0, 0, 1))]
def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def lerp(a,b,f):return Vector(a).lerp(Vector(b),f)
def camera_at(t):
 for a,b in zip(keys,keys[1:]):
  if a[0]<=t<=b[0]:
   u=(t-a[0])/(b[0]-a[0]);u=u*u*u*(u*(u*6-15)+10)
   return lerp(a[1],b[1],u),lerp(a[2],b[2],u)
 return Vector(keys[0][1]),Vector(keys[0][2])

def route(t,points):
 for i in range(len(points)-1):
  if points[i][0]<=t<=points[i+1][0]:
   a,b=points[i],points[i+1];return lerp(a[1],b[1],smooth((t-a[0])/(b[0]-a[0])))
 return Vector(points[-1][1] if t>=points[-1][0] else points[0][1])
hero_route=[(0,(0,0,.12)),(2.4,(0,0,.12)),(3.2,(.6,-.4,.12)),(5,(2,0,.12)),(7,(4,-.5,.12)),(12,(4,-.5,.12)),(14,(13,-.3,.12)),(19,(16,-.3,.12)),(20,(23,-.4,.35)),(26,(32,-.4,.35)),(28,(35,-.5,.12)),(30,(37,-1,.5)),(31,(37,-1,.12)),(32,(40,1,.8)),(42,(63,1,.2)),(44,(65,-.3,.12)),(49.5,(67,-.3,.12)),(51,(74,0,.12)),(53,(80,0,.12)),(56,(80,0,.12)),(60,(-2,0,.12)),(61,(-3,-1,.12)),(62,(1,-.5,.12)),(63,(0,0,.12)),(64,(0,0,.12))]
def update(t):
 t=max(0,min(64,t));loc,target=camera_at(t)
 main_title.data.body='自己动手'[:max(0,min(4,int((t-51.5)*3)))]
 stats_title.data.body='64 秒     1,920 帧     960 × 540'[:max(0,int((t-53)*35))]
 if 32<t<41.4:
  u=smooth((t-32)/10);pt=track(u)
  # Offset arc: wheel-level launch, wide reveal, front three-quarter orbit, side chase.
  arc=[(32,(2,-3,1.1)),(33.5,(5,-10,6)),(35,(5,-4,3)),(36,(3,-5,2.6)),(37.5,(-2,-5,3.2)),(39,(-3,-7,4.5)),(40,(4,-10,6)),(41.4,(5,-10,5))]
  off=route(t,arc);blend=smooth((t-32)/.35)*smooth((41.4-t)/.8)
  loc=loc.lerp(pt+off,blend);target=target.lerp(pt+Vector((0,0,.55)),blend)
 cam.location=loc;cam.rotation_euler=(target-loc).to_track_quat('-Z','Y').to_euler()
 terminal.scale=(max(.001,smooth((t-5.2)/1.2)),)*3
 command.data.body='做一条视频，主角是你自己'[:max(0,min(15,int((t-8.2)*3.8)))]
 for j,o in enumerate(model_lines):o.rotation_euler.y=.17*math.sin(t*1.7)
 for j,(o,tx) in enumerate(code_texts):o.data.body=tx[:max(0,int((t-14-j*.55)*18))]
 for j,o in enumerate(music_bars):o.scale.z=.7+.4*abs(math.sin(t*math.pi*4-j*.3))
 for j,o in enumerate(edit_tiles):o.scale.x=.87+.12*math.sin(t*2+j*.3)
 for i,q in enumerate(stations):q.scale=(max(.001,smooth((t-12.5)/1.2)),)*3
 for i,a in enumerate(actors):
  root=a['root'];root.scale=(1,1,1);root.rotation_euler=(0,0,0)
  p=route(t,hero_route);mode='idle'
  if 2.2<t<3.2:mode='anticipate' if t<2.8 else 'kick'
  elif 4<t<7 or 12<t<14 or 19<t<32 or 56<t<63:mode='walk'
  if 12<=t<20:
   dst=[(12,-4.3,.12),(14,-4.3,.12),(17,-4.3,.12),(19,-4.3,.12)][i];p=lerp((4,-.5,.12),dst,smooth((t-12)/3));mode='work'
   if t>18:p=p.lerp(Vector((23-i*1.15,-.4+i*.15,.35)),smooth((t-18)/2));mode='walk'
  elif 20<=t<28:
   p.x-=i*1.15;p.y+=.15*i;p.z+=.36*abs(math.sin((t-20)*math.pi*2-i*.35))*smooth((t-20)/.3);mode='jump'
  elif 28<=t<32:
   p.x-=i*1.2
   if t>31:
    from mathutils import Euler
    tan=track(.001)-track(0);r=Euler((0,-math.atan2(tan.z,math.hypot(tan.x,tan.y)),math.atan2(tan.y,tan.x)),'XYZ');k=smooth(t-31)
    p=p.lerp(track(0)+r.to_matrix()@Vector((-.56 if i<2 else .56,-.34 if i%2==0 else .34,.43)),k);root.rotation_euler=tuple(v*k for v in r)
  elif 32<=t<42:
   u=smooth((t-32)/10);pt=track(u);tan=track(min(1,u+.001))-track(max(0,u-.001))
   pitch=-math.atan2(tan.z,math.hypot(tan.x,tan.y));yaw=math.atan2(tan.y,tan.x)
   from mathutils import Euler
   rot=Euler((0,pitch,yaw),'XYZ');root.rotation_euler=rot
   seat=Vector((-.56 if i<2 else .56,-.34 if i%2==0 else .34,.43))
   p=pt+rot.to_matrix()@seat;mode='ride';root.scale=(.45,)*3
   if t>41.4:
    k=smooth((t-41.4)/.6);landing=route(t,hero_route);landing.x-=i*1.05;p=p.lerp(landing,k);root.rotation_euler=tuple(v*(1-k) for v in rot);root.scale=(.45+.2*k,)*3
  elif 42<=t<51:
   p.x-=i*1.05

  elif 51<=t<53:p.x-=i*1.05*(1-smooth((t-51)/2));root.scale=(.65+.35*smooth((t-51)/2),)*3
  if 12<=t<32:root.scale=(1-.28*smooth(t-12),)*3
  if 31<t<32:root.scale=(.72-.27*smooth(t-31),)*3
  if i>0 and 13<=t<14:root.scale=tuple(v*smooth(t-13) for v in root.scale)
  if 42<=t<51:root.scale=(.65,)*3
  if i>0 and (t<13 or t>=53):root.scale=(.001,)*3
  if 41.4<t<45:p.y-=2*smooth((t-41.4)/.6)*smooth((45-t)/.8)
  root.location=p;pose_actor(a, t-2.2 if mode=='anticipate' else t-2.8 if mode=='kick' else (0 if t>=63.8 else t),mode,i*.7)
 # Original pointer physically kicked and retrieved
 if t<2.9:pointer.location=(1.4,-1.5,.3);pointer.rotation_euler=(0,0,0)
 elif t<5:
  u=(t-2.9)/2.1;pointer.location=(1.4-4.4*u,-1.5+1.0*u,.3+4*math.sin(math.pi*u));pointer.rotation_euler=(u*5,u*2,u*4)
 elif t<61:pointer.location=(-3,-.5,.25);pointer.rotation_euler=(0,0,-.4)
 elif t<63:
  u=smooth((t-61)/2);pointer.location=lerp((-3,-.5,.25),(1.4,-1.5,.3),u)+Vector((0,0,.7*math.sin(math.pi*u)));pointer.rotation_euler=(0,0,-.4*(1-u))
 else:pointer.location=(1.4,-1.5,.3);pointer.rotation_euler=(0,0,0)
 u=smooth((t-26)/2.5);material.location=lerp((32,-.8,.7),(35,1.7,2.6),u);material.rotation_euler=(0,0,.08*math.sin(t*3))
 renderpad.scale.z=1-.22*math.exp(-((t-30)/.16)**2)
 cart.location=track(smooth((t-32)/10));cart.scale=(1,1,1) if 31.5<t<42.5 else (.001,)*3
 if 31.5<t<42:
  u=smooth((t-32)/10);tangent=track(min(1,u+.001))-track(max(0,u-.001));cart.rotation_euler=(0,-math.atan2(tangent.z,math.hypot(tangent.x,tangent.y)),math.atan2(tangent.y,tangent.x))
 for i,o in enumerate(portals):
  o.scale=(.68**i*(1+.11*math.sin((t-44)*1.5)),)*3
 if t>62.8:
  terminal.scale=(.001,)*3
  for q in stations:q.scale=(.001,)*3
 # physically constant shadows, deterministic loop, all nearby state returns
 if t>=63.8:
  command.data.body='';material.location=(32,-.8,.7)
 S.frame_set(round(t*60))
 from bpy_extras.object_utils import world_to_camera_view
 global screen_quad,drag_anchor
 screen_quad=[]
 for v in [(-3.0,-.1,1.65),(3.0,-.1,1.65),(3.0,-.1,-1.65),(-3.0,-.1,-1.65)]:
  co=world_to_camera_view(S,cam,portals[0].matrix_world@Vector(v));screen_quad.append([co.x*960,(1-co.y)*540])
 co=world_to_camera_view(S,cam,actors[0]['root'].matrix_world@Vector((.7,-.4,.75)));drag_anchor=[co.x*960,(1-co.y)*540]
# command interface: --stills or --frames start end folder
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if '--stills' in args:
 folder=P/'qa';folder.mkdir(exist_ok=True)
 for t in [0,2.5,3.5,5.5,8.5,14,15,16,17,18,20,24,26.5,28.5,30,32,33.5,35,37.5,40,42,44.25,46,48.5,49.5,51,53,56,60,64]:
  update(t);S.render.filepath=str(folder/f'{t}.png');bpy.ops.render.render(write_still=True)
  if 42<=t<=51:json.dump(screen_quad,open(folder/f'{t}.quad.json','w'))
else:
 if args and args[0]=='--ranges':frames_to_render=[f for a,b in json.load(open(args[1]))['patches'] for f in range(a,b)]
 else:
  start=int(args[0]) if args else 0;end=int(args[1]) if len(args)>1 else 1;frames_to_render=range(start,end)
 folder=Path(os.environ.get('FRAME_OUTPUT',str(P/'frames-final')));folder.mkdir(exist_ok=True)
 for f in frames_to_render:
  path=folder/f'{f:05d}.png'
  if path.exists():continue
  update(f/30);S.render.filepath=str(path);bpy.ops.render.render(write_still=True)
  if 42*30<=f<=51*30:
   json.dump(screen_quad,open(folder/f'{f:05d}.quad.json','w'));json.dump(drag_anchor,open(folder/f'{f:05d}.anchor.json','w'))
  if f%30==0:print('FRAME',f,'/1920',flush=True)
