"""Original deterministic Paper Garden score + tactile Foley, CC0 synthesis only.
20 seconds / 120 BPM / 48 kHz stereo. Two-pass EBU R128 normalization.
"""
from pathlib import Path
import json, subprocess, re
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write, read
ROOT=Path(__file__).resolve().parent; OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)
SR=48000; D=20.; rng=np.random.default_rng(241026); mix=np.zeros((int(SR*D),2)); events=[]
def midi(n): return 440*2**((n-69)/12)
def filt(x, hz, typ='lowpass'): return sosfilt(butter(2,hz,btype=typ,fs=SR,output='sos'),x)
def add(x,t,amp=1,pan=0,kind=None):
    i=int(t*SR); n=min(len(x),len(mix)-i)
    if n<=0:return
    mix[i:i+n,0]+=x[:n]*amp*np.sqrt((1-pan)/2)
    mix[i:i+n,1]+=x[:n]*amp*np.sqrt((1+pan)/2)
    if kind: events.append({'time':round(t,3),'type':kind})
def pluck(note,d=1.7,soft=1):
    t=np.arange(int(d*SR))/SR; f=midi(note); y=np.zeros_like(t)
    # Inharmonic, velocity-sensitive wooden/tine spectrum rather than plain sine.
    for k,a in enumerate([1,.42,.24,.14,.07,.035],1):
        y+=a*np.sin(2*np.pi*f*(k+.0007*k*k)*t)*np.exp(-t*(2.5+k*1.15)/soft)
    transient=filt(rng.normal(size=len(t)),4500)*np.exp(-t*100)*.12
    return (y+transient)*(1-np.exp(-t*850))*.47
chords=[[60,64,67,71,74],[57,60,64,67,71],[53,57,60,64,67],[55,60,62,67,69]]
# Slower diffuse harmonic beds: one smooth voice per chord note.
for ci,ch in enumerate(chords):
    d=5.8; t=np.arange(int(d*SR))/SR; env=np.minimum(t/.8,1)*np.minimum((d-t)/1.25,1)
    for j,note in enumerate(ch[:4]):
        f=midi(note); y=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*2*f*t)+.12*np.sin(2*np.pi*(f+.38)*t))*.026*env
        add(y,ci*5,pan=(j-1.5)*.35)
# Forty beats; increasing detail with a deliberate breath at the end.
for b in range(39):
    tm=b*.5; ci=min(int(tm/5),3); chord=chords[ci]
    rise=.5+.5*min(tm/11,1); release=1 if tm<16 else max(.1,(19.5-tm)/3.5)
    if b<34 and (b%2==0 or 4<=tm<=14):
        note=chord[[0,2,1,4,2,3,1,2][b%8]]+12
        add(pluck(note),tm,.14*rise*release,pan=(-.45 if b%2 else .4),kind='paper-pluck')
    if 5<=tm<14 and b%4 in (1,3):
        add(pluck(chord[(b+1)%5]+24,d=.8,soft=.65),tm+.25,.046,pan=.62 if b%4==1 else -.62,kind='tine-highlight')
    if b%4==0 and tm<17:
        t=np.arange(int(SR*1.5))/SR; f=midi(chord[0]-24)
        bass=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2*t)+.12*np.sin(2*np.pi*f*3*t))*(1-np.exp(-t*55))*np.exp(-t*3.5)
        add(bass,tm,.19*rise,kind='warm-bass')
    if 2<=tm<16 and b%2==0:
        t=np.arange(int(.16*SR))/SR
        knock=(np.sin(2*np.pi*(180*t-35*t*t))*.75+filt(rng.normal(size=len(t)),1800)*.2)*np.exp(-t*42)*(1-np.exp(-t*900))
        add(knock,tm,.1*rise,pan=-.15,kind='wood-tap')
    if 4<=tm<15:
        t=np.arange(int(.075*SR))/SR
        tick=filt(rng.normal(size=len(t)),3900,'highpass')*np.exp(-t*95)*(1-np.exp(-t*1600))
        add(tick,tm+.25,.025*rise,pan=.3 if b%2 else -.3)
# Paper Foley: band-limited crinkly noise with amplitude ridges and short folds.
for tm in [2.3,3.5,5.,7.]:
    d=.48; t=np.arange(int(d*SR))/SR; env=np.sin(np.pi*t/d)**1.6
    noise=filt(filt(rng.normal(size=len(t)),6500),800,'highpass')
    ridge=.35+.65*(.5+.5*np.sin(2*np.pi*(24*t+55*t*t)))**3
    add(noise*env*ridge,tm,.067,pan=-.45 if tm<4 else .5,kind='paper-fold')
for tm,n in [(6,84),(9,88),(12,91),(17.5,84)]:
    add(pluck(n,2.4,1.8),tm,.11 if tm<17 else .14,pan=.2,kind='bloom-chime' if tm<17 else 'closing-accent')
    add(pluck(n-12,2.3,1.5),tm+.035,.065,pan=-.3)
# Graphite scratch opening.
t=np.arange(int(.65*SR))/SR
scratch=filt(filt(rng.normal(size=len(t)),3600),1300,'highpass')*np.sin(np.pi*t/.65)**2*(.45+.55*np.sin(2*np.pi*31*t)**2)
add(scratch,.2,.028,pan=-.3,kind='graphite-scratch')
# Short stereo room reflections and soft diffuse tail, no external impulses.
dry=mix.copy()
for delay,gain,cross in [(.047,.12,True),(.083,.10,False),(.137,.08,True),(.223,.06,False),(.371,.045,True),(.599,.03,False)]:
    shift=int(delay*SR); src=dry[:,::-1] if cross else dry
    for c in range(2): mix[shift:,c]+=filt(src[:-shift,c],4200)*gain
fade=np.ones(len(mix)); fade[:int(.025*SR)]=np.linspace(0,1,int(.025*SR)); fade[-int(.75*SR):]=np.linspace(1,0,int(.75*SR))**1.5
mix*=fade[:,None]; mix*=.75/np.max(np.abs(mix)); write(OUT/'soundtrack-raw.wav',SR,mix.astype(np.float32))
cmd=['ffmpeg','-hide_banner','-y','-i',str(OUT/'soundtrack-raw.wav'),'-af','loudnorm=I=-15:TP=-1.2:LRA=9:print_format=json','-f','null','-']
p=subprocess.run(cmd,capture_output=True,text=True,check=True)
measurement=json.loads(re.findall(r'\{[^{}]+\}',p.stderr)[-1])
af=f"loudnorm=I=-15:TP=-1.2:LRA=9:measured_I={measurement['input_i']}:measured_TP={measurement['input_tp']}:measured_LRA={measurement['input_lra']}:measured_thresh={measurement['input_thresh']}:offset={measurement['target_offset']}:linear=true:print_format=json"
p=subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(OUT/'soundtrack-raw.wav'),'-af',af,'-ar','48000','-ac','2','-c:a','pcm_s24le',str(OUT/'soundtrack.wav')],capture_output=True,text=True,check=True)
p=subprocess.run(['ffmpeg','-hide_banner','-i',str(OUT/'soundtrack.wav'),'-af','loudnorm=I=-15:TP=-1.2:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
qc=json.loads(re.findall(r'\{[^{}]+\}',p.stderr)[-1]); print(json.dumps(qc,indent=2))
# Compact display and animation data; 100 Hz stereo RMS and peak.
rate,data=read(OUT/'soundtrack.wav'); data=data.astype(np.float64)/2147483648
window=480; chunks=data[:len(data)//window*window].reshape(-1,window,2)
wave={'sample_rate':rate,'duration':len(data)/rate,'fps':100,'channels':2,'rms':np.sqrt(np.mean(chunks**2,axis=1)).round(6).tolist(),'peak':np.max(np.abs(chunks),axis=1).round(6).tolist()}
(OUT/'waveform.json').write_text(json.dumps(wave,separators=(',',':')))
beat={'bpm':120,'duration':20,'beats':[{'index':i,'time':i*.5,'bar':i//4,'downbeat':i%4==0} for i in range(40)],'events':sorted(events,key=lambda e:e['time']),'qc':{'integrated_lufs':float(qc['input_i']),'true_peak_dbtp':float(qc['input_tp']),'loudness_range_lu':float(qc['input_lra']),'sample_rate':48000,'channels':2,'duration_seconds':20}}
(OUT/'beat-map.json').write_text(json.dumps(beat,indent=2)); (OUT/'soundtrack-raw.wav').unlink()
