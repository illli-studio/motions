"""Deterministic 3D voxel actors. Z up; face normal points toward -Y."""
import bpy, math
from mathutils import Vector

_MATS={}
def mat(name,c):
    key=(name,tuple(c))
    if key in _MATS:return _MATS[key]
    m=bpy.data.materials.new(name);m.diffuse_color=c;m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=c;p.inputs['Roughness'].default_value=.43
    _MATS[key]=m;return m

def empty(name,parent=None,loc=(0,0,0)):
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;return o

def cube(name,loc,size,material,parent=None,bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0));o=bpy.context.object;o.name=name
    o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.parent=parent;o.location=loc;o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new('Soft toy edge','BEVEL');mod.width=bevel;mod.segments=2
        mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def create_actor(name,location=(0,0,0),scale=1,color=(.85,.3,.16,1)):
    root=empty(name,loc=location);root.scale=(scale,)*3
    skin=mat('Terracotta enamel',color)
    light=mat('Warm upper facets',(min(color[0]*1.12,1),min(color[1]*1.3,1),min(color[2]*1.3,1),1))
    dark=mat('Orange sole',(color[0]*.7,color[1]*.7,color[2]*.7,1))
    ink=mat('Obsidian eyes',(.035,.042,.042,1))
    face=empty(name+' body rig',root,(0,0,.75))
    body=cube(name+' main body',(0,0,0),(1.12,.59,.63),skin,face,.045)
    # Silhouette has voxel shoulders and crown, rather than a smooth cartoon head.
    crown=cube(name+' crown',(0,.015,.355),(.82,.55,.14),light,face,.022)
    left=cube(name+' left block',(-.64,0,-.055),(.2,.48,.33),skin,face,.026)
    right=cube(name+' right block',(.64,0,-.055),(.2,.48,.33),skin,face,.026)
    eyes=[]
    for x in (-.25,.25):
        eye=cube(name+' square eye',(x,-.309,.035),(.115,.035,.18),ink,face,.008);eyes.append(eye)
    legs=[]
    for i,x in enumerate((-.45,-.16,.16,.45)):
        leg=empty(name+' leg rig '+str(i),root,(x,0,.39))
        cube(name+' leg '+str(i),(0,0,-.16),(.16,.24,.36),skin,leg,.024)
        cube(name+' foot '+str(i),(0,-.065,-.335),(.2,.34,.12),dark,leg,.025)
        legs.append(leg)
    arms=[]
    for i,x in enumerate((-.71,.71)):
        arm=empty(name+' arm rig '+str(i),root,(x,0,.7))
        cube(name+' forearm '+str(i),(0,0,-.12),(.17,.21,.33),skin,arm,.025)
        arms.append(arm)
    return dict(root=root,body=body,body_rig=face,eyes=eyes,legs=legs,arms=arms,base_scale=scale)

def pose_actor(actor,t,mode='idle',phase=0):
    """Call once per frame. Root position/rotation never changed. Phases are seconds."""
    a=t+phase;rig=actor['body_rig'];rig.location=(0,0,.75);rig.rotation_euler=(0,0,0);rig.scale=(1,1,1)
    for j,l in enumerate(actor['legs']):l.rotation_euler=(0,0,0)
    for j,arm in enumerate(actor['arms']):arm.rotation_euler=(0,0,0)
    # Rare smooth blink, deterministic, tiny cube-eyes retain recognizable silhouette.
    blink=1-.88*math.exp(-((a%4.7-3.9)/.055)**2)
    for eye in actor['eyes']:eye.scale.z=blink
    if mode=='walk':
        cyc=a*math.tau*2.1
        rig.location.z+=.045*math.cos(cyc*2);rig.rotation_euler.y=.045*math.sin(cyc)
        for j,l in enumerate(actor['legs']):l.rotation_euler.x=.48*math.sin(cyc+(j%2)*math.pi)
        for j,arm in enumerate(actor['arms']):arm.rotation_euler.x=-.38*math.sin(cyc+j*math.pi)
    elif mode=='anticipate':
        # Anticipation rises smoothly 0..1, then callers may switch into the kick.
        k=max(0,min(1,t));k=k*k*(3-2*k)
        rig.location.z-=.15*k;rig.rotation_euler.x=-.13*k;rig.rotation_euler.z=.13*k
        rig.scale=(1+.07*k,1+.03*k,1-.12*k)
        for j,l in enumerate(actor['legs']):l.rotation_euler.x=.17*k
        for j,arm in enumerate(actor['arms']):arm.rotation_euler.x=.7*k
    elif mode=='kick':
        # t is local action time. Extend, hold very briefly, then settle.
        u=max(0,min(1,t/.65));en=math.sin(math.pi*u)**.65
        actor['legs'][2].rotation_euler.x=-1.28*en;actor['legs'][3].rotation_euler.x=-1.14*en
        rig.rotation_euler.x=.18*en;rig.rotation_euler.z=-.12*en;rig.location.z+=.06*en
        actor['arms'][0].rotation_euler.x=.65*en;actor['arms'][1].rotation_euler.x=-.55*en
    elif mode=='jump':
        # Vertical root trajectory is caller-controlled; this supplies airborne pose.
        k=.5+.5*math.sin(a*math.tau)
        rig.scale=(1-.045*k,1-.025*k,1+.075*k)
        for j,l in enumerate(actor['legs']):l.rotation_euler.x=.32*math.sin(a*math.tau+j)
        for j,arm in enumerate(actor['arms']):arm.rotation_euler.y=(-1 if j==0 else 1)*.7
    elif mode=='ride':
        rig.location.z-=.10;rig.rotation_euler.x=-.12+.045*math.sin(a*5)
        for l in actor['legs']:l.rotation_euler.x=-.7
        for j,arm in enumerate(actor['arms']):arm.rotation_euler.x=-1.6+.12*math.sin(a*4+j)
    else:
        rig.location.z+=.012*math.sin(a*math.tau*.65)
        rig.rotation_euler.z=.018*math.sin(a*math.tau*.32)
    return actor

def create_pointer(name='Pointer'):
    """True extruded arrow lying in XY. Tip points +Y, base at Z=.045."""
    root=empty(name)
    outline=[(0,.95),(.57,-.40),(.20,-.25),(.05,-.78),(-.18,-.70),(-.04,-.20),(-.43,-.36)]
    verts=[(x,y,z) for z in (.045,.13) for x,y in outline];n=len(outline)
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name+' mesh');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name+' solid arrow',mesh);bpy.context.collection.objects.link(obj);obj.parent=root
    obj.data.materials.append(mat('Cursor charcoal',(.04,.047,.047,1)))
    b=obj.modifiers.new('Pointer chamfer','BEVEL');b.width=.025;b.segments=2
    obj.modifiers.new('Normals','WEIGHTED_NORMAL')
    return root
