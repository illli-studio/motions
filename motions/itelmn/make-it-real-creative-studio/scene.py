import bpy, math, os, sys, json, time
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
ROOT=os.path.dirname(os.path.abspath(__file__)); os.makedirs(ROOT+'/frames',exist_ok=True)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
W=int(os.getenv('FILM_W','1920'));H=W*9//16;FPS=30
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='BLENDER_WORKBENCH';s.render.resolution_x=W;s.render.resolution_y=H;s.render.resolution_percentage=100;s.render.fps=FPS
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.film_transparent=True
s.world.color=(0.88,.85,.78)
sh=s.display.shading;sh.light='STUDIO';sh.studio_light='paint.sl';sh.shadow_intensity=.28;sh.studiolight_rotate_z=.45;sh.color_type='MATERIAL';sh.show_shadows=True;sh.show_cavity=True;sh.cavity_type='BOTH';sh.curvature_ridge_factor=1.25;sh.curvature_valley_factor=.75;sh.show_specular_highlight=False;sh.background_type='WORLD';sh.show_object_outline=False
s.display.render_aa='16';s.view_settings.view_transform='Standard';s.view_settings.look='Medium High Contrast';s.view_settings.exposure=-.35
def mat(name,c):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);return m
cream=mat('Porcelain',(.9,.87,.8));dark=mat('Graphite',(.025,.039,.043));teal=mat('Petrol',(.0,.43,.43));orange=mat('Tangerine',(.98,.25,.06));white=mat('Paper',(.99,.97,.91));muted=mat('Mist',(.47,.64,.6));yellow=mat('Acid',(.88,.96,.30))
def cube(name,loc,dim,ma,bevel=.12):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(ma)
 if bevel:
  mod=o.modifiers.new('Machined soft edge','BEVEL');mod.width=bevel;mod.segments=4;o.modifiers.new('Normals','WEIGHTED_NORMAL')
 return o
def sphere(name,loc,r,ma):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=r,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 return o
def torus(name,loc,r,minor,ma):
 bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,location=loc,major_radius=r,minor_radius=minor);o=bpy.context.object;o.name=name;o.data.materials.append(ma)
 for p in o.data.polygons:p.use_smooth=True
 return o
def parent(o,p):o.parent=p;return o
def empty(n,loc=(0,0,0)):
 o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);o.location=loc;return o
def clamp(x):return max(0,min(1,x))
def ease(x):x=clamp(x);return x*x*(3-2*x)
def seg(t,a,b):return ease((t-a)/(b-a))
def vis(o,v):o.hide_render=not v
# Large cyclorama and central creative assembly desk.
floor=cube('Infinite warm paper',(0,0,-.38),(200,200,.4),cream,.0);floor.hide_render=True
base=cube('Studio plinth',(0,0,-.05),(8.6,5.6,.35),white,.25)
rail=cube('Work surface',(0,0,.18),(7.9,4.9,.16),dark,.18)
# Flat UI begins as a tangible slate, then opens into spatial workbench.
back=cube('Fold-out canvas',(0,1.95,1.6),(6.8,.16,2.75),teal,.15)
strips=[]
for i in range(7):
 strips.append(cube('Code line %02d'%i,(-1.5+(i%3)*.2,1.84,2.5-i*.28),(1.8+(.3 if i%2 else -.2),.045,.065),white,.02))
# creative objects left, mid, right
r=empty('FORM station',(-1.9,0,1.3));body=cube('Porcelain form',(0,0,0),(1.3,1.3,1.3),white,.22);parent(body,r)
ring=parent(torus('Orbit stroke',(0,0,0),1.12,.055,orange),r);ring.rotation_euler=(.6,.3,0)
orb=parent(sphere('Orbit dot',(1.12,0,0),.14,yellow),r)
# Typography tile fan; intentional generous geometry.
tiles=[]
for i in range(5):
 tile=cube('Editorial tile %d'%i,(.2+i*.15,.2+i*.15,1+i*.09),(1.6,1.6,.12),[white,teal,orange,white,teal][i],.08);tiles.append(tile)
# Sound bars in spatial rack.
bars=[]
for i in range(17):bars.append(cube('Audio bar %02d'%i,(1.4+i*.16,.25,.7),(.095,.16,.6),orange if i%4 else yellow,.04))
# timeline actual slab strips
clips=[]
for row in range(3):
 for col in range(6):
  clips.append(cube('Cut %d %d'%(row,col),(-2.65+col*.89,-1.35+row*.31,.45),(.77,.23,.13),[teal,orange,white][row],.055))
playhead=cube('Playhead',(-3,-1.05,.62),(.045,1.1,.05),yellow,.01)
# Robot/agent: original orange character, not a flat decal.
rig=empty('Creative agent',(-3,-.3,.75))
parent(cube('Body',(0,0,.35),(.65,.48,.75),orange,.18),rig)
parent(cube('Visor',(0,-.255,.46),(.46,.06,.22),dark,.07),rig)
for x in [-.12,.12]:parent(sphere('Eye',(x,-.3,.48),.035,white),rig)
left=parent(cube('Arm L',(-.42,0,.3),(.16,.2,.48),orange,.07),rig)
right=parent(cube('Arm R',(.42,0,.3),(.16,.2,.48),orange,.07),rig)
for x in [-.19,.19]:parent(cube('Shoe',(x,-.07,-.1),(.23,.36,.17),dark,.05),rig)
parent(sphere('Antenna',(0,0,.92),.095,yellow),rig)
# Hero film case emerges with play symbol.
hero=empty('Finished film',(0,0,1.5))
parent(cube('Movie case',(0,0,0),(3.2,.27,2.0),dark,.2),hero)
parent(cube('Screen',(0,-.16,0),(2.83,.045,1.65),teal,.11),hero)
verts=[(-.25,-.21,-.42),(-.25,-.21,.42),(.45,-.21,0)];mesh=bpy.data.meshes.new('Play glyph mesh');mesh.from_pydata(verts,[],[(0,1,2)]);mesh.materials.append(white);o=bpy.data.objects.new('Play glyph',mesh);bpy.context.collection.objects.link(o);parent(o,hero);o.hide_render=True
# scattered vector-like orbital 3D tokens.
tokens=[]
for i in range(12):
 a=i*math.tau/12;tokens.append(sphere('Idea bead %d'%i,(3.2*math.cos(a),2*math.sin(a),1.0+(i%3)*.3),.09,[teal,orange,yellow][i%3]))
bpy.ops.object.camera_add(location=(9,-12,9));cam=bpy.context.object;cam.data.type='PERSP';cam.data.lens=48;s.camera=cam
AUDIO=json.load(open(ROOT+'/assets/waveform.json'))['peaks']
# Smooth camera keyframes avoid cuts; rapid local reframe then readable settles.
keys=[(0,(8,-11,9),(0,0,.4),49),(1.5,(7.4,-10.4,7.6),(0,0,.5),49),(3.2,(7,-10,6),(0,0,1),47),(5.5,(7,-10,6),(0,0,1),47),(6.3,(2,-7,4),(-1.5,0,1.2),55),(8.8,(1,-6.5,3.5),(-1.6,0,1.3),55),(10,(7,-7,4),(2,0,1.2),55),(12.7,(6,-7,3.7),(2,0,1.1),55),(14,(4,-7,7),(0,-.9,.5),49),(16.4,(2,-7,6),(0,-1,.4),49),(18,(7,-10,6),(0,0,1.3),48),(20,(5,-10,5.3),(0,0,1.4),52),(22,(4,-11,5),(0,0,1.4),53),(24,(4,-11,5),(0,0,1.4),53)]
def update(t):
 # dimensional opening, slate rises from flat to upright
 opening=seg(t,1.5,3.5);back.rotation_euler.x=-(1-opening)*math.pi/2;back.location.z=.45+1.15*opening
 for i,o in enumerate(strips):
  o.scale.x=max(.001,seg(t,2.1+i*.12,2.55+i*.12));o.hide_render=t>17.1
  aa=back.rotation_euler.x;yy=-.11;zz=.9-i*.28
  o.location.y=back.location.y+yy*math.cos(aa)-zz*math.sin(aa);o.location.z=back.location.z+yy*math.sin(aa)+zz*math.cos(aa);o.rotation_euler.x=aa
 for o in [back]:o.hide_render=t>17.1
 r.location.z=1.3+.2*(seg(t,6,6.3)*(1-seg(t,8.7,9.0))+seg(t,10.7,11.0)*(1-seg(t,13.35,13.65)));r.scale=(1,1,1);r.rotation_euler=(t*.15,t*.22,t*.25);ring.rotation_euler.z=t*.8;orb.location=(1.12*math.cos(t*1.3),1.12*math.sin(t*1.3),0)
 amount=seg(t,3.3,5);r.scale=(amount,)*3
 for i,o in enumerate(tiles):
  a=seg(t,3.5+i*.16,4.4+i*.16);o.scale=(a,)*3;o.rotation_euler.z=(i-2)*.17+math.sin(t*.7)*.08
  o.location.z=1+i*.09+.08*math.sin(t*2+i)
 for i,o in enumerate(bars):
  a=seg(t,4+i*.035,4.8+i*.035);height=.25+1.3*AUDIO[max(0,min(959,int(t*40)+i-8))];o.scale.z=height*a;o.scale.x=o.scale.y=a;o.location.z=.52+.3*height
 for i,o in enumerate(clips):
  a=seg(t,13.5+(i%6)*.17+(i//6)*.12,14.1+(i%6)*.17+(i//6)*.12);o.scale=(max(.001,a),)*3;o.location.z=.45+(1-a)*2
 playhead.location.x=-3+6*clamp((t-14.5)/2.6);vis(playhead,14<t<17.3)
 rig.location=(-3+1.1*seg(t,2,3)-1.1*seg(t,5,6)+4.9*seg(t,9,10)-2.5*seg(t,13,14),-1.0,.75+.07*abs(math.sin(t*math.pi*2)))
 rig.rotation_euler.z=.2*math.sin(t*2);left.rotation_euler.y=.3*math.sin(t*5);right.rotation_euler.y=-.7-.5*math.sin(t*3)
 h=seg(t,17,18.2);hero.scale=(max(.001,h),)*3;hero.location.z=1.5+.15*math.sin(t*1.1);hero.rotation_euler.z=.06*math.sin(t*1.3)
 for o in [r,*tiles,*bars,*clips,*tokens]:
  if t>17:o.scale*=max(.001,1-seg(t,17,18))
 for i,o in enumerate(tokens):o.location.z=1.1+(i%3)*.3+.13*math.sin(t*2+i);vis(o,3<t<17)
 rig.scale=(1-.35*seg(t,18,20),)*3;rig.location.x=-2.4 if t>18 else rig.location.x
 for j in range(len(keys)-1):
  a,b=keys[j],keys[j+1]
  if a[0]<=t<=b[0]:
   q=ease((t-a[0])/(b[0]-a[0]));cam.location=Vector(a[1]).lerp(Vector(b[1]),q);target=Vector(a[2]).lerp(Vector(b[2]),q);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=a[3]+(b[3]-a[3])*q;break
def screen_points():
 bpy.context.view_layer.update()
 return [[world_to_camera_view(s,cam,hero.matrix_world@Vector(p)).x*W,(1-world_to_camera_view(s,cam,hero.matrix_world@Vector(p)).y)*H] for p in [(-1.39,-.195,.80),(1.39,-.195,.80),(1.39,-.195,-.80),(-1.39,-.195,-.80)]]
# samples or complete frame range
if args and args[0]=='ringcheck':
 bad=[]
 for f in range(720):
  update(f/FPS);bpy.context.view_layer.update()
  if 3.3<f/FPS<17:
   low=min((ring.matrix_world@v.co).z for v in ring.data.vertices)
   if low<.265:bad.append([f,low])
 print('RING_BELOW_SURFACE',bad)
elif args and args[0]=='meta':
 annotations={}
 for f in range(720):
  update(f/FPS);bpy.context.view_layer.update()
  def project(p):
   v=world_to_camera_view(s,cam,p);return [v.x*1920,(1-v.y)*1080]
  annotations[str(f)]={'form':[project(r.matrix_world@Vector(p)) for p in [(-.7,-.7,.7),(.7,-.7,.7),(.7,-.7,-.7),(-.7,-.7,-.7)]],'hand':project(rig.matrix_world@Vector((.42,-.2,.4))),'streams':[project(r.matrix_world@Vector((0,0,0))),project(tiles[2].location),project(bars[8].location)]}
 json.dump(annotations,open(ROOT+'/annotations.json','w'))
elif args and args[0]=='stills':
 for t in [0,2.5,5,7.5,11,15,19,22]:
  update(t);s.render.filepath=ROOT+'/still-%04d.png'%int(t*100);bpy.ops.render.render(write_still=True);json.dump(screen_points(),open(ROOT+'/still-%04d.json'%int(t*100),'w'))
else:
 start=int(args[0]) if args and args[0]!='repair' else 0;end=int(args[1]) if len(args)>1 else 720
 frame_ids=list(range(180,270))+list(range(321,410)) if args and args[0]=='repair' else range(start,end)
 frame_dir=os.getenv('FILM_FRAME_DIR',ROOT+'/frames');os.makedirs(frame_dir,exist_ok=True)
 for f in frame_ids:
  path=frame_dir+'/%05d.png'%f
  if os.path.exists(path):continue
  update(f/FPS);s.render.filepath=path;bpy.ops.render.render(write_still=True);json.dump(screen_points(),open(path.replace('.png','.json'),'w'))
  if f%30==0:print('PROGRESS',f,flush=True)
