"""Re-scored 64-second, dynamically paced 120 BPM score and synchronized foley for the 3D film.
Pure deterministic synthesis; no external samples. Python 3 + NumPy + SciPy.
"""
from pathlib import Path
import json, wave
import numpy as np
from scipy.signal import butter, sosfilt
P=Path(__file__).parent/'assets'; P.mkdir(exist_ok=True)
SR=48000; D=64; N=SR*D; rng=np.random.default_rng(61703)
music=np.zeros((N,2)); foley=np.zeros_like(music); cues=[]
def hz(n): return 440*2**((n-69)/12)
def env(t,a=.005,r=.08): return np.minimum(t/a,1)*np.minimum((t[-1]-t)/r,1).clip(0,1)
def filt(x,f=2500,kind='lowpass'): return sosfilt(butter(2,f,fs=SR,btype=kind,output='sos'),x)
def mix(x,at,g=.1,pan=0,bus=music,echo=True):
    ix=(np.arange(len(x))+round(at*SR))%N
    bus[ix,0]+=x*g*np.sqrt((1-pan)/2); bus[ix,1]+=x*g*np.sqrt((1+pan)/2)
    if echo:
        for dt,eg in [(.1875,.19),(.375,.1),(.75,.045)]:
            j=(ix+round(dt*SR))%N
            bus[j,0]+=x*g*eg*np.sqrt((1+pan)/2);bus[j,1]+=x*g*eg*np.sqrt((1-pan)/2)
def tone(n,d=1.4,kind='pluck'):
    t=np.arange(round(d*SR))/SR; f=hz(n)
    if kind=='pluck':
        x=(np.sin(2*np.pi*f*t)+.26*np.sin(2*np.pi*f*2*t)*np.exp(-t*8)+.08*np.sin(2*np.pi*f*3*t)*np.exp(-t*14))*np.exp(-t*4.3)
    elif kind=='bass':
        x=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t))*np.exp(-t*3.8)
    elif kind=='pad':
        x=(np.sin(2*np.pi*f*t)+.28*np.sin(2*np.pi*f*1.002*t)+.16*np.sin(2*np.pi*f*2*t))*np.sin(np.pi*t/d)**1.5
    else:
        x=(np.sin(2*np.pi*f*t)+.17*np.sin(2*np.pi*f*3*t))*np.exp(-t*7)
    return x*env(t,.004 if kind!='pad' else .2,.06)
def kick(d=.32):
    t=np.arange(round(d*SR))/SR
    return np.sin(2*np.pi*(48*t+65*.025*(1-np.exp(-t/.025))))*np.exp(-t*17)*env(t,.001,.02)
def tick(d=.05,f=1400):
    t=np.arange(round(d*SR))/SR
    return (filt(rng.normal(size=len(t)),5000)-filt(rng.normal(size=len(t)),700))*np.exp(-t*95)*env(t,.001,.008)+.25*np.sin(2*np.pi*f*t)*np.exp(-t*110)
def whoosh(at,d=.5,g=.07,pan=0):
    t=np.arange(round(d*SR))/SR
    x=filt(rng.normal(size=len(t)),1800)*np.sin(np.pi*t/d)**2
    mix(x,at,g,pan,foley,False)
def cue(at,name,description):cues.append({'time':at,'event':name,'description':description})
# Camera-led score. 120 BPM grid, breath spaces and fast subdivisions.
chords=[[50,57,61,66],[47,54,57,62],[43,50,54,59],[45,52,57,59]]
lands=[(2.5,'foot closeup'),(2.9,'pointer kick'),(3.5,'pointer flight'),(5.5,'terminal arrival'),(8.5,'typing detail'),(12.5,'split onset'),(14,'four roles wide'),(15,'model closeup'),(16,'code closeup'),(17,'music closeup'),(18,'edit closeup'),(20,'waveform arrival'),(26.5,'material grab'),(28.5,'timeline drop'),(30,'render press'),(32,'coaster wheel'),(33.5,'coaster reveal'),(35,'front orbit'),(37.5,'side tracking'),(40,'descent wide'),(42,'player arrival'),(44.25,'file lands'),(51,'merge starts'),(53,'title resolves'),(56,'retreat begins')]
# Harmonic beds: no regular drum loop across transitions; each scene has its own rhythm.
for bar in range(32):
 at=bar*2; chord=chords[(bar//2)%4]
 energy=.16 if at<4 else .3 if at<12 else .72 if at<20 else .82 if at<30 else .95 if at<42 else .4 if at<46 else .7 if at<50 else .18 if at<56 else .15
 for j,n in enumerate(chord):mix(tone(n+12,3.8,'pad'),at,.021*energy,[-.75,.65,-.3,.4][j],echo=False)
 # Sparse dawn, running workshop sixteenths, rolling arpeggios for coaster.
 if at<12 or at>=56:pat=[0,3,6];step=.25
 elif at<20:pat=[0,2,3,4,6,7];step=.25
 elif at<30:pat=[0,3,4,6];step=.25
 elif at<42:pat=list(range(8));step=.25
 elif at<46:pat=[0,4];step=.25
 elif at<50:pat=list(range(16));step=.125
 else:pat=[];step=.25
 for k in pat:
  beat=at+k*step
  if beat>=49.5:continue
  mix(tone(chord[[0,2,3,1][k%4]]+24,.8),beat,.043*energy,(-.5 if k%2==0 else .5))
 for k in range(4):
  beat=at+k*.5
  if not (12<=beat<42):continue
  # Half-time role shots and full beat wave/coaster; percussion leaves landing room.
  if beat<20 and k%2:continue
  mix(kick(),beat,.13*energy,0,echo=False)
  mix(tone(chord[0]-12,.46,'bass'),beat+.012,.105*energy,0,echo=False)
  if k%2:
   t=np.arange(int(.11*SR))/SR;sn=filt(rng.normal(size=len(t)),3800)*np.exp(-t*48)*env(t,.001,.015)
   mix(sn,beat,.065*energy,.1,echo=False)
 if 12<=at<42:
  for k in range(8):mix(tick(.025,3600),at+k*.25,.011*energy,(-.65 if k%2 else .65),echo=False)
 if 32<=at<42:
  mel=[74,78,81,83,81,78,76,74]
  for k in range(4):mix(tone(mel[(bar*4+k)%8],1.4),at+k*.5,.055, .18*np.sin(k))
# Motivated stereo camera travel: airy acceleration ends on dry tactile landings.
for i,(at,label) in enumerate(lands):
 cue(at,'camera-landing',label)
 if at not in [2.9,53,56]:whoosh(at-.28,.28,.075 if at<42 else .045,(-.55 if i%2 else .55))
 if at<42 and at not in [2.9,30]:
  mix(tick(.055,950+120*(i%5)),at,.035,(-.2 if i%2 else .2),foley,False)
  mix(tone([62,66,69,74][i%4],.35,'bell'),at,.038,0,foley,False)
# Kick, open, keys; actions are dry and legible against the score.
t=np.arange(int(.23*SR))/SR
mix(np.sin(2*np.pi*(200*t+360*.035*(1-np.exp(-t/.035))))*np.exp(-t*19)*env(t,.001,.02),2.9,.21,-.25,foley,False)
whoosh(2.95,.55,.13,.4);cue(2.9,'pointer-kick','Rubber thump, short fly-by')
mix(tone(74,.65,'bell'),5.5,.085,-.1,foley);cue(5.5,'terminal-open','Glass click with resolving tone')
for i,at in enumerate(np.arange(8.2,12.1,1/3.8)):
 mix(tick(.03,1100+i%5*130),float(at),.025,(-.25+i%4*.15),foley,False)
cue(8.2,'typing','Key taps match character reveal cadence of 3.8 characters per second')
for k,n in enumerate([74,78,81,86]):mix(tone(n,.7),12.5+k*.125,.085,-.6+k*.4,foley)
cue(12.5,'split-four','Four rising chimes across stereo')
for k in range(16):
 at=20+k*.5;pan=-.45+k*.06
 mix(kick(.15),at,.13,pan,foley,False);mix(tick(.035,650),at,.025,pan,foley,False)
 cue(at,'waveform-step','Lead actor landing on the 120 BPM half-second grid')
# Material movement, actual pedal at 30 seconds (not original misaligned 28.5).
whoosh(26.25,.25,.055,-.4);mix(tone(81,.3,'bell'),26.5,.045,.2,foley)
mix(tick(.06,800),28.5,.08,.1,foley,False)
mix(kick(.3),30,.28,0,foley,False);mix(tone(62,.7),30.06,.13,0,foley)
cue(30,'render-press','Exact pedal downbeat; rounded sub and confirmation')
for k in range(12):mix(tick(.035,1050+80*k),30.5+k*.125,.02+k*.002,-.5+k/11,foley,False)
whoosh(31.35,.65,.13,0)
for k,n in enumerate([62,66,69,74]):mix(tone(n,1.8),32+k*.04,.08,-.4+k*.25,foley)
for at in np.arange(32,42,.25):mix(tick(.03,500),float(at),.014,.35*np.sin(at*2),foley,False)
for at,d,p in [(33.1,.4,-.65),(34.5,.5,.65),(37,.5,-.65),(39.5,.5,.5)]:whoosh(at,d,.1,p)
# File drop, increasing recursion subdivisions, then a deliberate vacuum.
mix(tick(.06,900),44.25,.07,.1,foley,False);mix(tone(81,.5,'bell'),44.25,.06,0,foley)
cue(44.25,'file-drop','File lands before recursive acceleration')
for start,end,step in [(46,47,.25),(47,48,.1875),(48,49.5,.125)]:
 for j,at in enumerate(np.arange(start,end,step)):
  mix(tone([86,81,78,74][j%4],.24,'bell'),float(at),.05,-.45 if j%2 else .45,foley,False)
  mix(tick(.025,2500),float(at),.018,0,foley,False)
whoosh(48.8,.65,.12,0);cue(49.5,'recursion-vacuum','Abrupt dynamic release; breathing space before merge')
# Merge starts quietly, four converging tones resolve in one cinematic title hit.
for k,n in enumerate([62,66,69,74]):mix(tone(n,1.8,'pad'),51+k*.125,.06,-.6+k*.4,foley,False)
cue(51,'merge','Four voices converge, without a busy percussion bed')
for k,n in enumerate([50,62,66,69,74,78]):mix(tone(n,2.6),53,.075,(-.45+k*.18),foley,False)
mix(kick(.45),53,.21,0,foley,False);cue(53,'title-hit','One warm resolved chord then sustained reading space')
for at in [60.1,60.5,60.9,61.3,61.7,62.1]:mix(tick(.04,750),at,.022,-.35,foley,False)
mix(tick(.035,800),63,.033,-.2,foley,False);cue(63,'pointer-setdown','Gentle closing click before silent loop seam')
# Explicit dynamics envelopes suppress lingering delay tails in the vacuum and title hold.
time=np.arange(N)/SR
control=np.interp(time,[0,1,2.3,2.5,3,3.5,11.7,12.5,29.6,30,30.25,31.5,32,41.6,42,44.1,44.25,46,49.3,49.5,50.8,51,52.8,53,53.2,55.8,56,62,63.2,64],[.12,.5,.65,.35,.6,.8,.45,1,1,.12,.4,.85,1,1,.35,.35,.8,1,1,.01,.01,.15,.15,.05,.08,.08,.25,.1,0,0])
music*=control[:,None]
foley_control=np.interp(time,[0,49.3,49.5,50.8,51,63.4,64],[1,1,.015,.015,1,1,0]);foley*=foley_control[:,None]
out=music+foley;out-=out.mean(axis=0)
out=np.tanh(out*1.35);out*=.85/np.max(np.abs(out))
# A quiet fade at both boundaries makes the AAC loop unobtrusive too.
L=int(.1*SR);fade=np.linspace(0,1,L)[:,None];out[:L]*=fade;out[-L:]*=fade[::-1]
pcm=np.round(out*32767).astype('<i2');pcm[0]=0;pcm[-1]=0
with wave.open(str(P/'soundtrack.wav'),'wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
mono=np.max(np.abs(pcm.astype(np.float64))/32768,axis=1);peaks=mono.reshape(2048,-1).max(axis=1)
data={'sampleRate':SR,'duration':D,'bpm':120,'beats':128,'samples':N,'waveform':np.round(peaks/max(peaks),6).tolist()}
(P/'waveform.json').write_text(json.dumps(data),encoding='utf8')
(P/'sound-cues.json').write_text(json.dumps({'duration':D,'bpm':120,'cues':sorted(cues,key=lambda x:x['time'])},ensure_ascii=False,indent=2),encoding='utf8')
report={'duration':D,'sampleRate':SR,'channels':2,'frames':N,'peak':float(mono.max()),'rms':float(np.sqrt(np.mean((pcm.astype(float)/32768)**2))),'clippedSamples':int(np.sum(np.abs(pcm.astype(int))>=32767)),'boundaryDelta':(pcm[-1].astype(int)-pcm[0].astype(int)).tolist(),'source':'Original deterministic synthesis; camera-led revision; no third-party recordings','sectionRMS':{str(a)+'-'+str(b):float(np.sqrt(np.mean(out[int(a*SR):int(b*SR)]**2))) for a,b in [(0,2),(14,18),(20,26),(32,40),(46,49),(49.5,50.8),(53,56),(62,64)]}}
(P/'audio-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
