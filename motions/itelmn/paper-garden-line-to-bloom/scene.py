import bpy, math, os, sys, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
ROOT=os.path.dirname(os.path.abspath(__file__));FPS=30;DURATION=20
W=int(os.getenv('FILM_W','1920'));H=W*9//16
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='BLENDER_WORKBENCH';s.render.resolution_x=W;s.render.resolution_y=H;s.render.resolution_percentage=100;s.render.fps=FPS;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.film_transparent=True
sh=s.display.shading;sh.light='STUDIO';sh.studio_light='paint.sl';sh.studiolight_rotate_z=.6;sh.color_type='MATERIAL';sh.show_shadows=True;sh.shadow_intensity=.17;sh.show_cavity=True;sh.cavity_type='WORLD';sh.cavity_ridge_factor=1.0;sh.cavity_valley_factor=.8;sh.show_specular_highlight=False;sh.show_object_outline=False
s.display.render_aa='16';s.view_settings.view_transform='Standard';s.view_settings.look='Medium High Contrast';s.view_settings.exposure=-.2

def mat(n,c):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);return m
paper=mat('Warm cotton paper',(.88,.83,.72));ivory=mat('Ivory fold',(.94,.91,.82));ink=mat('Graphite',(.027,.065,.045));green=mat('Forest paper',(.095,.24,.14));sage=mat('Sage paper',(.4,.57,.32));coral=mat('Coral paper',(.8,.24,.15));rose=mat('Petal crease light',(.94,.42,.28));gold=mat('Pollen paper',(.9,.61,.16))
def clamp(x):return max(0,min(1,x))
def e(x):x=clamp(x);return x*x*(3-2*x)
def seg(t,a,b):return e((t-a)/(b-a))
def empty(n,loc=(0,0,0)):
 o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);o.location=loc;return o
def line(n,points,rad,ma):
 c=bpy.data.curves.new(n,'CURVE');c.dimensions='3D';c.bevel_depth=rad;c.bevel_resolution=1;p=c.splines.new('POLY');p.points.add(len(points)-1)
 for v,co in zip(p.points,points):v.co=(*co,1)
 o=bpy.data.objects.new(n,c);bpy.context.collection.objects.link(o);o.data.materials.append(ma);return o
# Floating sheet is the world, clipped edges never dominate the frame.
verts=[(-100,-100,-.035),(100,-100,-.035),(100,100,-.035),(-100,100,-.035)]
m=bpy.data.meshes.new('Sheet mesh');m.from_pydata(verts,[],[(0,1,2,3)]);o=bpy.data.objects.new('Paper sheet',m);bpy.context.collection.objects.link(o);o.data.materials.append(paper);o.display.show_shadows=False;sol=o.modifiers.new('Paper thickness','SOLIDIFY');sol.thickness=.045
# Origami petal with a raised central crease and faceted side planes.
def petal(n,length,width,ma,accent):
 v=[(0,0,0),(length*.42,-width*.5,.04),(length,0,.10),(length*.42,width*.5,.04),(length*.47,0,.24)]
 me=bpy.data.meshes.new(n);me.from_pydata(v,[],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)]);me.materials.append(ma);me.materials.append(accent)
 for i,p in enumerate(me.polygons):p.material_index=i%2
 ob=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(ob);so=ob.modifiers.new('Folded paper thickness','SOLIDIFY');so.thickness=.012
 return ob
flowers=[]
for idx,(x,y,h,size,start) in enumerate([(0,0,2.3,1,2.0),(-2.15,.6,1.5,.67,8.8),(2.1,1.05,1.75,.78,10.0),(-1.05,2.4,1.1,.5,11.2),(1.8,-.65,.85,.43,12.2)]):
 root=empty('Flower %d'%idx,(x,y,0));stem=line('Folded stem %d'%idx,[(0,0,0),(-.13,.04,h*.42),(.06,-.03,h*.76),(0,0,h)],.027,green);stem.parent=root
 head=empty('Bloom %d'%idx,(0,0,h));head.parent=root
 leaves=[]
 for j in range(3):
  hinge=empty('Leaf hinge %d %d'%(idx,j),(-.13*(.25+j*.17)/.42 if .25+j*.17<=.42 else -.13+.19*((.25+j*.17)-.42)/.34,.04, h*(.25+j*.17)));hinge.parent=root;hinge.rotation_euler.z=j*2.7+.2
  p=petal('Leaf %d %d'%(idx,j),.95*size,.57*size,green,sage);p.parent=hinge;leaves.append(hinge)
 petals=[]
 for layer,count in [(0,6),(1,3)]:
  for j in range(count):
   hinge=empty('Petal hinge %d %d %d'%(idx,layer,j));hinge.parent=head;hinge.rotation_euler.z=j*math.tau/count+layer*.45;hinge.location=(.22*size*math.cos(hinge.rotation_euler.z),.22*size*math.sin(hinge.rotation_euler.z),layer*.12*size)
   p=petal('Petal %d %d %d'%(idx,layer,j),(1.05 if layer==0 else .55)*size,(.65 if layer==0 else .36)*size,coral if idx%2==0 else ivory,rose if idx%2==0 else sage);p.parent=hinge;petals.append((hinge,layer,j))
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.256*size);core=bpy.context.object;core.name='Folded pollen %d'%idx;core.parent=head;core.location=(0,0,.16);core.data.materials.append(gold)
 flowers.append((root,stem,head,leaves,petals,core,h,size,start))
# Real loose paper fragments punctuate unfolding; deterministic flight.
frags=[]
for i in range(10):
 p=petal('Loose fold %d'%i,.22,.13,ivory,coral);frags.append(p)
bpy.ops.object.camera_add(location=(6,-9,8));cam=bpy.context.object;cam.data.type='PERSP';s.camera=cam
keys=[(0,(0,-.01,11),(0,0,0),48),(1.7,(0,-.01,11),(0,0,0),48),(3.6,(5,-8,7),(0,0,1.5),45),(5.2,(4.3,-7.8,5.8),(0,0,1.7),48),(7.6,(3.2,-5.2,4.4),(0,0,2.1),56),(9.0,(-4.5,-6,4.5),(-.6,0,1.6),47),(11.7,(-5,-7,6),(0,.4,1.2),48),(14,(7,-11,9),(0,.5,1.2),47),(16.5,(5,-8,12),(0,.5,1.2),48),(18,(7,-12,10),(0,.5,1.2),49),(20,(7,-12,10),(0,.5,1.2),49)]
def update(t):
 for idx,(root,stem,head,leaves,petals,core,h,size,start) in enumerate(flowers):
  growth=seg(t,start,start+2);root.scale=(max(.001,growth),)*3
  root.rotation_euler.z=.035*math.sin(t*1.3+idx)*(seg(t,6,8));head.location.z=h
  for j,leaf in enumerate(leaves):leaf.rotation_euler.y=-.85+.48*seg(t,start+.7+j*.2,start+1.7+j*.2);leaf.scale=(max(.001,seg(t,start+.4+j*.2,start+1.3+j*.2)),)*3
  opening=seg(t,start+2.4,start+4.0)
  for hinge,layer,j in petals:
   q=seg(t,start+2.1+j*.045+layer*.2,start+3.8+j*.045+layer*.2)
   hinge.rotation_euler.y=-1.42+(1.30 if layer==0 else .95)*q
   hinge.rotation_euler.x=.06*math.sin(t*1.2+j)*q
  core.scale=(max(.001,opening),)*3
 for i,p in enumerate(frags):
  phase=(t-4.0-i*.08)/2.0;q=clamp(phase);p.hide_render=not(0<phase<1)
  a=i*2.399;p.location=(math.cos(a)*(1+q*1.6),math.sin(a)*(1+q*1.6),1.2+2.3*math.sin(q*math.pi));p.rotation_euler=(q*5+i,q*4,q*6);p.scale=(math.sin(q*math.pi),)*3
 for a,b in zip(keys,keys[1:]):
  if a[0]<=t<=b[0]:
   q=e((t-a[0])/(b[0]-a[0]));cam.location=Vector(a[1]).lerp(Vector(b[1]),q);target=Vector(a[2]).lerp(Vector(b[2]),q);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=a[3]+(b[3]-a[3])*q;break
 bpy.context.view_layer.update()
def project(p):
 v=world_to_camera_view(s,cam,Vector(p));return [v.x*1920,(1-v.y)*1080]
def metadata(t):
 return {'creases':[[project(ob.matrix_world@v.co) for v in ob.data.vertices] for ob in bpy.data.objects if ob.type=='MESH' and ob.name.startswith('Petal 0 ')],'seed':project((0,0,.02)),'path':[project((-3.3+3.3*j/60,.42*math.sin(j/60*math.tau),.035)) for j in range(61)],'stem':[project((0,0,j*2.3/40)) for j in range(41)],'flower':[project((f[0].location.x,f[0].location.y,f[6]+.12)) for f in flowers],'ground':[project((2.7*math.cos(i*math.tau/100),2.7*math.sin(i*math.tau/100),.02)) for i in range(101)]}
if args and args[0]=='stills':
 for t in [0.8,2.8,4.7,6.5,9.5,12.5,15.5,18.5]:
  update(t);s.render.filepath=ROOT+'/still-%04d.png'%int(t*100);bpy.ops.render.render(write_still=True);json.dump(metadata(t),open(ROOT+'/still-%04d.json'%int(t*100),'w'))
elif args and args[0]=='meta':
 data={}
 for f in range(600):update(f/30);data[str(f)]=metadata(f/30)
 json.dump(data,open(ROOT+'/annotations.json','w'))
else:
 start=int(args[0]) if args else 0;end=int(args[1]) if len(args)>1 else 600
 os.makedirs(ROOT+'/frames',exist_ok=True)
 for f in range(start,end):
  path=ROOT+'/frames/%05d.png'%f
  if os.path.exists(path):continue
  update(f/30);s.render.filepath=path;bpy.ops.render.render(write_still=True);json.dump(metadata(f/30),open(path.replace('.png','.json'),'w'))
  if f%30==0:print('PROGRESS',f,flush=True)
