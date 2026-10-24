from pathlib import Path
from PIL import Image
from recursion import recursive_frame,film_file_drag
import json,subprocess
P=Path(__file__).resolve().parent
src=P/'frames-final';dst=P/'frames-composited';dst.mkdir(exist_ok=True)
for f in range(1260,1531):
 a=src/f'{f:05d}.png';q=a.with_suffix('.quad.json');b=dst/a.name
 if b.exists():continue
 # Drag UI is authored at1080p; composite at that internal scale, then downsample.
 im=Image.open(a).convert('RGB');quad=json.load(open(q));anchor=json.load(open(a.with_suffix('.anchor.json')))
 big=im.resize((1920,1080),Image.Resampling.BICUBIC)
 big=film_file_drag(big,[[x*2,y*2] for x,y in quad],f/30,[x*2 for x in anchor]);im=big.resize((960,540),Image.Resampling.LANCZOS)
 out=recursive_frame(im,quad,depth=7);t=f/30;fade=min(1,max(0,(t-44.1)/.5),max(0,(51-t)/.5));Image.blend(im,out,fade).save(b)
# Link rendered/composited images into one contiguous source without overwriting originals.
merged=P/'frames-export';merged.mkdir(exist_ok=True)
for f in range(1920):
 name=f'{f:05d}.png';target=dst/name if (dst/name).exists() else src/name;link=merged/name
 if not link.exists():link.symlink_to(target.resolve())
out=P/'自己动手-镜头节奏预演-540p30.mp4'
subprocess.run(['ffmpeg','-y','-framerate','30','-i',str(merged/'%05d.png'),'-i',str(P/'assets/soundtrack.wav'),'-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-t','64','-movflags','+faststart',str(out)],check=True)
print(out,flush=True)

# Refresh the independent silent Hyperframes picture asset.
subprocess.run(['ffmpeg','-y','-i',str(out),'-an','-c:v','copy','-movflags','+faststart',str(P/'assets/film-3d-silent.mp4')],check=True)

# The public registry caps individual files; create the high-bitrate playback soundtrack.
subprocess.run(['ffmpeg','-y','-i',str(P/'assets/soundtrack.wav'),'-c:a','libmp3lame','-b:a','320k','-ar','48000','-ac','2',str(P/'assets/soundtrack.mp3')],check=True)
