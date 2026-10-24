import os, math, json, sys, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=os.path.dirname(os.path.abspath(__file__));W,H=1920,1080
ANNOT=json.load(open(ROOT+'/annotations.json')) if os.path.exists(ROOT+'/annotations.json') else {}
FONT=ROOT+'/assets/fonts/DejaVuSans.ttf';BOLD=ROOT+'/assets/fonts/DejaVuSans-Bold.ttf';CJK=ROOT+'/assets/fonts/NotoSansCJK-subset.otf'
def f(n,b=False,c=False):return ImageFont.truetype(CJK if c else BOLD if b else FONT,n)
def cl(x):return max(0,min(1,x))
def ease(x):x=cl(x);return x*x*(3-2*x)
def tx(d,p,s,n=40,fill='#183a38',bold=False,c=False):d.text(p,s,font=f(n,bold,c),fill=fill)
def overlay(im,t):
 im=im.resize((W,H)).convert('RGBA');bg=Image.new('RGBA',(W,H),'#f2ecdf');im=Image.alpha_composite(bg,im);L=Image.new('RGBA',(W,H));d=ImageDraw.Draw(L)
 # Chinese-led editorial typography with no permanent bars, HUD or decorative frames.
 beats=[(3.0,5.7,'一句话\n一间工作室',(95,110)),(6.2,8.7,'让想法\n站起来',(95,110)),(10.2,12.7,'给灵感\n一个节拍',(1330,120)),(14.2,16.5,'把想象\n剪成作品',(1340,120)),(21.0,24,'从一句话，到一部作品。',(95,100))]
 for a,b,title,p in beats:
  if a<t<b:
   q=ease((t-a)/.4)*ease((b-t)/.3);layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer)
   
   if 14<t<18:ld.rounded_rectangle((p[0]-25,p[1]-18,p[0]+335,p[1]+185),18,fill='#163e37')
   tx(ld,(p[0],p[1]+int(24*(1-q))),title,60,('#f6f0e5' if 10<t<18 else '#163e37'),c=True)
   layer.putalpha(layer.getchannel('A').point(lambda v:int(v*q)));L.alpha_composite(layer)
 # The actual 2D interface seed expands into the physical studio.
 if t<2.2:
  q=ease((t-1.2)/1.0);card=Image.new('RGBA',(1400,580));cd=ImageDraw.Draw(card)
  cd.rounded_rectangle((0,0,1399,579),32,fill='#f6f1e7',outline='#17403a',width=3)
  tx(cd,(62,48),'A SMALL INPUT.  AN ENTIRE WORLD.',23,'#3c7068',True)
  tx(cd,(60,145),'做一条视频'[:min(5,int(t*8)+1)],78,'#153d37',c=True)
  tx(cd,(62,263),'主角，是你的想象力。',42,'#2e655b',c=True)
  cd.rounded_rectangle((62,393,1338,510),18,fill='#183d38');tx(cd,(95,428),'Create something worth watching',33,'#f9f4e9')
  cd.rounded_rectangle((1155,412,1317,491),14,fill='#ef6d39');tx(cd,(1190,425),'↵',44,'#fff8e9',True)
  if t<1.5:
   end=60+min(5,int(t*8)+1)*78;cd.line((end+8,178,end+8,243),fill='#f06c37',width=5)
  if .4<t<1.5:
   move=ease((t-.4)/.55);px=900+330*move;py=290+170*move
   cd.polygon([(px,py),(px+10,py+48),(px+22,py+32),(px+48,py+28)],fill='#f6f0e5',outline='#143d37')
   if .95<t<1.2:
    rr=12+35*(t-.95)/.25;cd.ellipse((px-rr,py-rr,px+rr,py+rr),outline='#f6f0e5',width=3)
  w=int(1400*(1-.6*q));h=int(580*(1-.6*q));card=card.resize((w,h));card.putalpha(card.getchannel('A').point(lambda v:int(v*(1-q))));L.alpha_composite(card,((W-w)//2,int(180-100*q)))
 # A sentence releases three graphic paths; packets become spatial objects.
 if 2.0<t<4.5:
  ends=ANNOT.get(str(int(t*30)),{}).get('streams',[])
  for j,(ex,ey) in enumerate(ends):
   q=ease((t-2-j*.12)/1.6);fade=ease((4.5-t)/.4);sx,sy=1040,270
   curve=[]
   for z in range(61):
    u=z/60*q;x=(1-u)**2*sx+2*(1-u)*u*(ex-120)+u*u*ex;y=(1-u)**2*sy+2*(1-u)*u*(ey-150)+u*u*ey;curve.append((x,y))
   d.line(curve,fill=(22,128,120,int(190*fade)),width=3)
   px,py=curve[-1];rr=8+4*math.sin(t*6+j);d.ellipse((px-rr,py-rr,px+rr,py+rr),fill='#ee713b')
 # Temporary vector construction marks / control handles drive the spatial form.
 if 6.0<t<9.8:
  q=ease((t-6)/.5)*ease((9.8-t)/.4)
  marks=ANNOT.get(str(int(t*30)),{});points=marks.get('form',[])
  for i,(x,y) in enumerate(points):
   nx,ny=points[(i+1)%4];d.line((x,y,nx,ny),fill=(238,112,58,int(200*q)),width=3)
   d.rectangle((x-7,y-7,x+7,y+7),fill='#f5efdf',outline='#ed703b',width=3)
  if points:
   hx,hy=marks['hand'];d.line((hx,hy,*points[3]),fill='#ef703c',width=3);d.ellipse((hx-6,hy-6,hx+6,hy+6),fill='#f6eddf')
  for i,col in enumerate(['#153f39','#0a8f88','#ee713b']):d.ellipse((100+i*56,365,137+i*56,402),fill=col)
 if 10.1<t<13.8:
  wave=json.load(open(ROOT+'/assets/waveform.json'))['peaks']
  pts=[]
  for i in range(101):
   v=wave[max(0,min(959,int(t*40)+i-50))];pts.append((105+i*8,860+(-1 if i%2 else 1)*v*75))
  d.line(pts,fill='#f6edda',width=3);d.ellipse((493,848,517,872),fill='#ef703c')
 # 2D motion design is attached to a real3D screen in the last section.
 if t>=18:
  try:
   meta=ROOT+'/frames/%05d.json'%int(round(t*30))
   if not os.path.exists(meta):meta=ROOT+'/still-%04d.json'%int(t*100)
   pts=json.load(open(meta));scale=W/(960 if 'still-' in meta else 1920);pts=[(x*scale,y*scale) for x,y in pts]
   frame=Image.new('RGB',(1120,640),'#113d37');fd=ImageDraw.Draw(frame)
   if t<21:
    source=int(cl((t-18)/3)*539)
    path=ROOT+'/frames/%05d.png'%source
    if not os.path.exists(path):path=ROOT+'/still-0500.png'
    raw=Image.open(path).convert('RGBA');raw=Image.alpha_composite(Image.new('RGBA',raw.size,'#f2ecdf'),raw);frame=raw.convert('RGB').resize((1120,640));fd=ImageDraw.Draw(frame)
    fd.rectangle((0,550,1120,640),fill='#173d39');tx(fd,(40,574),'IMAGINATION → REALITY',36,'#f7f0df',True)
   else:
    tx(fd,(78,100),'MAKE IT',135,'#f6f0e3',True);tx(fd,(78,265),'REAL.',175,'#f6f0e3',True)
    fd.rounded_rectangle((80,525,1038,552),12,fill='#315e52');fd.rounded_rectangle((80,525,80+int(958*cl((t-21)/2.1)),552),12,fill='#ec7844')
   src=[(0,0),(1120,0),(1120,640),(0,640)];A=[];B=[]
   for (x,y),(u,v) in zip(pts,src):
    A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);B.extend([u,v])
   coeff=np.linalg.solve(np.array(A),np.array(B));warped=frame.convert('RGBA').transform((W,H),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
   L.alpha_composite(warped)
  except FileNotFoundError:pass
 return Image.alpha_composite(im.convert('RGBA'),L).convert('RGB')
if __name__=='__main__':
 if sys.argv[1:] and sys.argv[1]=='stills':
  ims=[]
  for t in [0,2.5,5,7.5,11,15,19,22]:
   im=overlay(Image.open(ROOT+'/still-%04d.png'%int(t*100)),t);im.save(ROOT+'/proof-%04d.jpg'%int(t*100),quality=92);ims.append(im.resize((640,360)))
  board=Image.new('RGB',(1280,1440),'#eee');
  for i,im in enumerate(ims):board.paste(im,((i%2)*640,(i//2)*360))
  board.save(ROOT+'/proof-board.jpg',quality=93)
 else:
  for i in range(int(os.getenv('FRAME_START','0')),int(os.getenv('FRAME_END','720'))):
   if os.getenv('WAIT_FOR_FRAMES')=='1':
    start=time.monotonic()
    while not os.path.exists(ROOT+'/frames/%05d.json'%i):
     if time.monotonic()-start>300:raise RuntimeError('Frame render stalled: '+str(i))
     time.sleep(.5)
   result=overlay(Image.open(ROOT+'/frames/%05d.png'%i),i/30)
   if os.getenv('RAW_PIPE')=='1':sys.stdout.buffer.write(result.tobytes())
   else:result.save(sys.stdout.buffer,format='JPEG',quality=94)
