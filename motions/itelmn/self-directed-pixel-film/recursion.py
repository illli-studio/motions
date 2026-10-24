"""Project the exact current rendered frame back onto its physical player surface."""
from PIL import Image,ImageDraw
import numpy as np,json,sys
from pathlib import Path
def recursive_frame(im,quad,depth=5):
 w,h=im.size;src=[(0,0),(w,0),(w,h),(0,h)];A=[];B=[]
 for (x,y),(u,v) in zip(quad,src):
  A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);B.extend([u,v])
 coeff=np.linalg.solve(np.array(A),np.array(B));mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon([tuple(x) for x in quad],fill=255)
 current=im.copy()
 for _ in range(depth):
  mapped=current.transform(im.size,Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
  current=Image.composite(mapped,im,mask)
 return current
if __name__=='__main__':
 for arg in sys.argv[1:]:
  p=Path(arg);im=Image.open(p).convert('RGB');q=json.load(open(p.with_suffix('.quad.json')));recursive_frame(im,q).save(p.with_name(p.stem+'-recursive.png'))

def film_file_drag(im,quad,t,actor_anchor=None):
 """A tangible UI file lands in the geometric player before feedback starts."""
 from PIL import ImageFont,ImageFilter
 if not 42.1<=t<44.4:return im
 u=max(0,min(1,(t-42.1)/2.2));e=u*u*(3-2*u)
 q=np.array(quad);start=q[3]*.84+q[2]*.16+np.array([0,120]);end=q.mean(axis=0)
 pos=start*(1-e)+end*e+np.array([0,-110*np.sin(np.pi*e)])
 scale=1-.6*e;w,h=int(190*scale),int(126*scale)
 tile=Image.new('RGBA',(230,166));d=ImageDraw.Draw(tile)
 d.rounded_rectangle((20,20,210,146),radius=16,fill=(242,236,223,255),outline=(39,43,43,255),width=4)
 d.rounded_rectangle((36,35,194,100),radius=7,fill=(39,43,43,255))
 for x in [45,185]:
  for y in range(43,96,14):d.rectangle((x,y,x+5,y+7),fill=(242,236,223,255))
 d.rectangle((98,49,139,80),fill=(219,119,87,255));d.rectangle((105,59,111,66),fill=(39,43,43,255));d.rectangle((127,59,133,66),fill=(39,43,43,255))
 font=ImageFont.truetype(str(Path(__file__).resolve().parent/'assets/DejaVuSansMono.ttf'),17);d.text((46,112),'SELF.MP4',fill=(39,43,43,255),font=font)
 tile=tile.resize((max(1,int(230*scale)),max(1,int(166*scale))),Image.Resampling.LANCZOS)
 alpha=max(0,min(1,(t-42.1)/.15,(44.4-t)/.2));tile.putalpha(tile.getchannel('A').point(lambda v:int(v*alpha)))
 out=im.convert('RGBA')
 # Visible cursor-drag tether: a thin warm connection from the lead actor area.
 anchor=np.array(actor_anchor) if actor_anchor is not None else q[3]+np.array([-95,155]);dd=ImageDraw.Draw(out);dd.line([tuple(anchor),tuple(pos)],fill=(219,119,87,170),width=3);dd.ellipse((anchor[0]-5,anchor[1]-5,anchor[0]+5,anchor[1]+5),fill=(219,119,87,220))
 x=int(pos[0]-tile.width/2);y=int(pos[1]-tile.height/2)
 shadow=Image.new('RGBA',tile.size,(39,43,43,0));shadow.putalpha(tile.getchannel('A').point(lambda v:int(v*.2)).filter(ImageFilter.GaussianBlur(8)))
 out.alpha_composite(shadow,(x+8,y+12));out.alpha_composite(tile,(x,y));return out.convert('RGB')
