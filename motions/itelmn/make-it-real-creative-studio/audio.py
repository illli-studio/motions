"""Original 24 s score / foley. Deterministic synthesis, no samples. 120 BPM."""
from pathlib import Path
import json, subprocess, re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
ROOT=Path(__file__).resolve().parent; A=ROOT/'assets'; A.mkdir(exist_ok=True)
SR=48000; DUR=24.; rng=np.random.default_rng(2007)
mix=np.zeros((int(SR*DUR),2),np.float64)
def hz(n): return 440*2**((n-69)/12)
def filt(x,cut,kind='lowpass'): return sosfilt(butter(2,cut,fs=SR,btype=kind,output='sos'),x)
def env(t,a=.006,d=.5): return (1-np.exp(-t/a))*np.exp(-t/d)
def put(x,start,gain=1.,pan=0):
 i=int(start*SR); n=min(len(x),len(mix)-i)
 if n<=0 or i<0:return
 angle=(pan+1)*np.pi/4
 if x.ndim==1: mix[i:i+n,0]+=x[:n]*gain*np.cos(angle);mix[i:i+n,1]+=x[:n]*gain*np.sin(angle)
 else:mix[i:i+n]+=x[:n]*gain

def pluck(note,dur=1.3):
 t=np.arange(int(dur*SR))/SR; f=hz(note)
 x=sum(np.sin(2*np.pi*f*k*t + .12*np.sin(2*np.pi*3*t))/k**1.65*np.exp(-t*k*.7) for k in range(1,7))
 return x*env(t,.003,.36)
def bass(note,dur=.45):
 t=np.arange(int(SR*dur))/SR; f=hz(note)
 x=(np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2*t)+.06*np.sin(2*np.pi*f*3*t))*env(t,.012,.28)
 return x*np.minimum(1,(dur-t)/.035)
def kick():
 t=np.arange(int(SR*.3))/SR
 phase=2*np.pi*(46*t+62*.024*(1-np.exp(-t/.024)))
 return np.sin(phase)*np.exp(-t/ .085)+rng.normal(0,.09,len(t))*np.exp(-t/.003)
def hat(open=False):
 d=.15 if open else .055;t=np.arange(int(SR*d))/SR
 return filt(rng.normal(0,1,len(t)),7000,'highpass')*np.exp(-t/(.035 if open else .012))
def clap():
 t=np.arange(int(SR*.18))/SR
 x=filt(rng.normal(0,1,len(t)),[1100,6200],'bandpass'); e=np.exp(-t/.027)
 for off in [.011,.022]: e+=np.where(t>=off,np.exp(-np.maximum(0,t-off)/.021),0)
 return x*e*.33

def pad(notes,start,duration,gain):
 t=np.arange(int((duration+.7)*SR))/SR; e=np.minimum(1,t/.3)*np.clip((duration+.7-t)/.8,0,1)
 out=np.zeros((len(t),2))
 for j,n in enumerate(notes):
  f=hz(n)
  for ch,det in enumerate([-.0015,.0017]):
   out[:,ch]+=(np.sin(2*np.pi*f*(1+det)*t)+.16*np.sin(2*np.pi*f*2*t))*(.85+.15*np.sin(2*np.pi*.29*t+j))*e/len(notes)
 put(out,start,gain)
# chord journey: Dm9 -> Bbmaj7 -> Fmaj9 -> C6, warm and optimistic.
chords=[[50,57,60,64,69],[46,53,57,60,65],[48,55,57,60,64],[48,55,60,64,69],[50,57,60,64,69]]
for notes,start in zip(chords,[2,6,10,14,18]): pad([n+12 for n in notes],start,3.7,.12)
# Intro isolated tactile typing / creative spark.
for n,t in enumerate([.18,.4,.64,.88,1.12,1.38]):
 x=hat()[:int(SR*.022)];put(x,t,.055,(-1)**n*.25)
put(pluck(81),.35,.2,-.12);put(pluck(76),1.0,.13,.15)
# Tight rhythmic spine, sections grow rather than constantly shouting.
for beat in range(4,42):
 tm=beat*.5; energy=.8 if tm<6 else (1.0 if tm<18 else .85)
 if beat%2==0:put(kick(),tm,.48*energy)
 if beat%4 in [1,3]:put(clap(),tm,.19*energy,.05)
 if tm>=4:
  put(hat(),tm,.075*energy,-.3)
  put(hat(beat%4==3),tm+.25,.06*energy,.3)
 if 14<=tm<18:
  put(hat(),tm+.375,.035,.45)
# Syncopated bass, root/fifth: short and warm.
for sec,root in [(2,38),(6,34),(10,41),(14,36),(18,38)]:
 for off,step in [(0,0),(.75,0),(1.5,7),(2,0),(2.75,12),(3.5,7)]:
  put(bass(root+step),sec+off,.25)
# deliberate melodic contour, not arbitrary beeps
phrases=[(2,[74,77,81,76,74,72,69]),(6,[77,81,84,81,77,74,72]),(10,[76,79,81,84,81,79,76]),(14,[76,79,84,86,84,79,76]),(18,[81,84,86,88,86])]
for start,notes in phrases:
 for k,n in enumerate(notes):
  tm=start+[0,.5,.75,1.5,2,2.75,3.5][k]; pan=.28*np.sin(k*1.3)
  x=pluck(n);put(x,tm,.13,pan);put(x,tm+.1875,.025,-pan);put(x,tm+.375,.015,pan)
# Action foley, layer hand-crafted movement accents at scene pivots.
for j,tm in enumerate([1.8,5.8,9.8,13.8,17.8,20.8]):
 t=np.arange(int(SR*.32))/SR;n=filt(rng.normal(0,1,len(t)),[600,5500],'bandpass')
 e=np.sin(np.pi*np.clip(t/.32,0,1))**2
 stereo=np.stack([n*e*(1-t/.32),n*e*(t/.32)],axis=1)
 put(stereo,tm,.055)
 put(pluck(62+j%3*5,.5),tm+.2,.075,0)
# Final exhale: all rhythmic motion stops at21; spacious resolved D major color.
pad([62,69,73,76,81],21,2.5,.16)
for k,n in enumerate([74,81,85,88]):put(pluck(n,2.6),21+k*.055,.11,(k-1.5)*.16)
# Soft finite tail and peak protection before mastering.
fade=np.clip((DUR-np.arange(len(mix))/SR)/.7,0,1)
mix*=fade[:,None];mix=np.tanh(mix*.88)
raw=A/'soundtrack-premaster.wav';wavfile.write(raw,SR,(mix*32767).astype(np.int16))
cmd=['ffmpeg','-hide_banner','-nostats','-i',str(raw),'-af','loudnorm=I=-15:TP=-1.2:LRA=8:print_format=json','-f','null','-']
p=subprocess.run(cmd,capture_output=True,text=True,check=True); m=json.JSONDecoder().raw_decode(p.stderr[p.stderr.rfind('{'):])[0]
flt=f"loudnorm=I=-15:TP=-1.2:LRA=8:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
out=A/'soundtrack.wav'; p=subprocess.run(['ffmpeg','-y','-hide_banner','-nostats','-i',str(raw),'-af',flt,'-ar',str(SR),'-c:a','pcm_s16le',str(out)],capture_output=True,text=True,check=True)
sr,y=wavfile.read(out); y=y.astype(float)/32768
bins=960; peaks=[float(np.max(np.abs(x))) for x in np.array_split(y,bins)]
(A/'waveform.json').write_text(json.dumps({'source':'soundtrack.wav','sample_rate':SR,'duration':DUR,'bins':bins,'peaks':peaks,'beats':[i*.5 for i in range(48)]}))
check=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(out),'-af','loudnorm=I=-15:TP=-1.2:LRA=8:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
meas=json.JSONDecoder().raw_decode(check.stderr[check.stderr.rfind('{'):])[0];qc={'duration':len(y)/sr,'sample_rate':sr,'channels':y.shape[1],'peak_sample':float(np.max(np.abs(y))),'integrated_lufs':float(meas['input_i']),'true_peak_dbtp':float(meas['input_tp']),'lra':float(meas['input_lra']),'seed':2007,'bpm':120,'original_synthesis':True,'external_samples':False,'actual_listening_verified':False,'sections':{'0-2':'tactile intro','2-6':'opening','6-10':'design','10-14':'sound machine','14-18':'assembly','18-21':'hero','21-24':'resolve'}}
(ROOT/'audio-qc.json').write_text(json.dumps(qc,indent=2));raw.unlink(); print(json.dumps(qc,indent=2))
