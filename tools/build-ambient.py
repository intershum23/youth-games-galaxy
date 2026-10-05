"""Original 64-second stereo ambient composition, deterministic and sample-periodic.
No third-party recording. Warm Am9/Fmaj7/Cmaj7/Gsus pads and sparse soft chimes.
"""
from pathlib import Path
import numpy as np, wave, subprocess, hashlib, json
sr=32000;seconds=64;n=sr*seconds;t=np.arange(n)/sr;out=np.zeros((n,2))
def voice(start,duration,freq,amp,pan,attack=3,release=6,bell=False):
    age=(t-start)%seconds
    env=np.where(age<duration,np.minimum(1,age/attack)*np.minimum(1,np.maximum(0,(duration-age)/release)),0)
    if bell:env*=np.exp(-age/2.8)
    tone=np.sin(2*np.pi*freq*age)+.18*np.sin(2*np.pi*freq*2*age)+.05*np.sin(2*np.pi*freq*3*age)
    signal=tone*env*amp
    out[:,0]+=signal*np.sqrt((1-pan)/2);out[:,1]+=signal*np.sqrt((1+pan)/2)
chords=[[45,52,59,60,64],[41,48,52,57,60],[48,55,59,62,64],[43,50,57,60,62]]
for k,chord in enumerate(chords):
    for j,midi in enumerate(chord):
        f=440*2**((midi-69)/12)
        voice(k*16,24,f,.045 if j else .025,(j-2)/3)
        voice(k*16,24,f*1.001,.022,(2-j)/3)
for k,midi in enumerate([81,76,79,84,79,74,76,79]):voice(k*8+5,9,440*2**((midi-69)/12),.023,(-1)**k*.45,.08,3,True)
# Circular echo/reverb makes the loop continuous even across its boundary.
original=out.copy()
for delay,gain in [(0.37,.12),(.73,.1),(1.13,.08),(1.87,.05),(2.41,.025)]:out+=np.roll(original,int(delay*sr),axis=0)[:,::-1]*gain
out*=.55/max(np.max(np.abs(out)),1e-9)
root=Path(__file__).resolve().parents[1];wav=root/'assets/audio/galaxy-ambient.wav';mp3=wav.with_suffix('.mp3')
with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k','-metadata','title=Игровая галактика — тихая орбита','-metadata','comment=Original deterministic ambient composition; no third-party samples',str(mp3)],check=True)
wav.unlink()
print(json.dumps({'seconds':seconds,'peak':float(np.max(np.abs(out))),'rms':float(np.sqrt(np.mean(out**2))),'loop_edge_delta':float(np.max(np.abs(out[0]-out[-1]))),'sha256':hashlib.sha256(mp3.read_bytes()).hexdigest()}))
