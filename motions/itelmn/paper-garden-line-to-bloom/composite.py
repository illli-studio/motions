import os,sys,json,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent;W=1920;H=1080;FPS=30
FONT=ROOT/'assets/fonts/NotoSansCJK-subset.otf';FULL=Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc')
if not FONT.exists():FONT=FULL
INK=(32,58,50);CORAL=(205,88,65);PAPER=(241,235,220)
def font(size):return ImageFont.truetype(str(FONT),size)
def clamp(x):return max(0,min(1,x))
def ease(x):x=clamp(x);return x*x*(3-2*x)
def seg(t,a,b):return ease((t-a)/(b-a))
def window(t,a,b,fade=.35):return seg(t,a,a+fade)*(1-seg(t,b-fade,b))
# Stable, weak grain: no temporal flicker, no expensive externally sourced texture.
rng=np.random.default_rng(20261024);grain=rng.integers(-2,3,(H,W,1),dtype=np.int16)
def render(f,source=None,meta=None):
 t=f/FPS;p=Path(source) if source else ROOT/'frames'/f'{f:05}.png'
 im=Image.open(p).convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
 bg=Image.new('RGBA',(W,H),PAPER+(255,));bg.alpha_composite(im);im=bg.convert('RGB')
 # Matte paper lift keeps dark fold facets yet raises the shaded sheet to warm ivory.
 ar=np.asarray(im).astype(np.int16);ar=np.clip(ar+grain,0,255).astype(np.uint8);im=Image.fromarray(ar).convert('RGBA')
 data=json.load(open(meta or p.with_suffix('.json')));lay=Image.new('RGBA',(W,H));d=ImageDraw.Draw(lay)
 def line(points,fill,width=3):
  if len(points)>1:d.line([tuple(p) for p in points],fill=fill,width=width,joint='curve')
 # The graphite seed is the first actor. Its stroke becomes the spatial stem.
 q=seg(t,.12,1.65);pts=data['path'];line(pts[:max(2,int(len(pts)*q))],INK+(int(255*(1-seg(t,2.4,3.8))),),6)
 x,y=pts[max(1,min(len(pts)-1,int(len(pts)*q)-1))];a=window(t,.3,3.5)
 if a>0:
  rr=11+4*math.sin(t*math.pi*2);d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=CORAL+(int(255*a),))
 alpha=int(220*window(t,1.55,4.8));q=seg(t,1.65,3.8);line(data['stem'][:max(2,int(41*q))],INK+(alpha,),4)
 # Draft creases are precisely camera-projected onto the real paper mesh.
 a=window(t,4.2,8.4)
 if a:
  for k,v in enumerate(data['creases']):
   count=int(4*seg(t,4.2+k*.035,5.4+k*.035));path=[v[0],v[4],v[2]]
   line(path[:max(2,count+1)],INK+(int(75*a),),2)
 # Branching ink paths extend along the paper floor to the growing satellites.
 a=window(t,8.2,15.6)
 if a:
  pts=data['ground'];n=int(len(pts)*seg(t,8.3,12.4))
  for j in range(0,n-1,5):line(pts[j:min(n,j+3)],INK+(int(75*a),),2)
 def text(txt,xy,size,a=1,color=INK):
  if a>0:d.text(xy,txt,font=font(size),fill=color+(int(255*a),),stroke_width=0)
 a=window(t,.15,2.25);text('一条线，能长出什么？',(120,120),66,a)
 a=window(t,5.8,8.5);text('把平面，折成生命。',(120,925),54,a)
 a=window(t,11.2,14.2);text('让想象蔓延。',(120,925),54,a)
 a=seg(t,17.1,17.7)
 text('一线生花',(120,132),80,a);text('PAPER GARDEN',(124,240),32,a)
 text('从一笔，到一座花园。',(125,960),38,a)
 im.alpha_composite(lay);return im.convert('RGB')
if __name__=='__main__':
 if len(sys.argv)>1 and sys.argv[1]=='proof':
  ims=[]
  for t in [.8,2.8,4.7,6.5,9.5,12.5,15.5,18.5]:
   p=ROOT/f'still-{int(t*100):04}.png';im=render(round(t*30),p,p.with_suffix('.json'));im.save(ROOT/f'proof-{int(t*100):04}.jpg',quality=94);ims.append(im.resize((640,360)))
  board=Image.new('RGB',(1280,1440),PAPER)
  for i,im in enumerate(ims):board.paste(im,((i%2)*640,(i//2)*360))
  board.save(ROOT/'proof-board.jpg',quality=94)
 else:
  start=int(os.getenv('START_FRAME','0'));end=int(os.getenv('END_FRAME','600'))
  for f in range(start,end):sys.stdout.buffer.write(render(f).tobytes())
