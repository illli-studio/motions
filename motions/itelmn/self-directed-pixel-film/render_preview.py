import subprocess,concurrent.futures
from pathlib import Path
P=Path(__file__).resolve().parent
(P/'logs').mkdir(exist_ok=True)
# Persistent frame output: restarting skips completed frames.
def run(ab):
 a,b=ab
 with open(P/'logs'/f'render-{a}-{b}.log','w') as f:
  return subprocess.run(['blender','-b','-noaudio','--factory-startup','--python',str(P/'film3d.py'),'--',str(a),str(b)],stdout=f,stderr=subprocess.STDOUT).returncode
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 print(list(pool.map(run,[(0,960),(960,1920)])),flush=True)
missing=[i for i in range(1920) if not (P/'frames-final'/f'{i:05d}.png').exists()]
print('MISSING',missing,flush=True)
