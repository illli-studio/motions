# Paper Garden: A Line Learns to Bloom

A graphite line rises into folded paper, opens into a coral flower, and spreads into a small kinetic garden.

**20 seconds · native 1920×1080 · 16:9 · 30fps · original music and tactile sound design**

This original short combines genuine Blender origami geometry and a spatial camera with camera-projected 2D crease lines, a drawn seed path, restrained Chinese typography and a quiet paper-like texture. It is an artistic interpretation, not a scientific simulation of plant growth or a physically accurate origami instruction.

## Playback

`index.html` is a Hyperframes media composition with separate silent picture and soundtrack tracks. `assets/visual.mp4` is the native-resolution rendered picture, not an upscaled preview. `assets/soundtrack.mp3` is a 320 kbps distribution copy of the original generated WAV.

Install this package with the current UI2V registry client, then preview it in a compatible Hyperframes environment. The project pins Hyperframes 0.8.186. Browser playback and re-export require a working local Chromium environment.

## Editable production sources

- `scene.py`: deterministic Blender geometry, folded petals and leaves, growth, camera motion, and projected attachment coordinates.
- `composite.py`: 2D ink paths, projected crease strokes, paper grain, typography, and final image composition.
- `audio.py`: original deterministic score and paper-like Foley, generating the source WAV and beat map.
- `DESIGN.md`: visual concept, palette, typography and movement direction.
- `assets/beat-map.json`: soundtrack timing and technical measurements.
- `assets/waveform.json`: data derived from the finished PCM soundtrack.

The video is prerendered. It is **not** a real-time WebGL or Three.js scene. Changes to folded geometry, camera movement or baked typography require rerendering the Blender/Python production source. The Hyperframes entry can independently adjust media timing and audio placement.

## Rebuild

Requires Blender 4.3.2, Python with `numpy`, `scipy` and `Pillow`, plus FFmpeg. Run from this package directory. Bundled fonts keep the original typography available.

1. `python audio.py`
2. `FILM_W=1920 blender -b -t 6 -P scene.py -- 0 600`
3. `python composite.py | ffmpeg -y -f rawvideo -pixel_format rgb24 -video_size 1920x1080 -framerate 30 -i - -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -an assets/visual.mp4`
4. `ffmpeg -y -i assets/visual.mp4 -i assets/soundtrack.wav -c:v copy -c:a aac -b:a 256k -t 20 -movflags +faststart Paper-Garden.mp4`
5. For a registry-sized soundtrack: `ffmpeg -y -i assets/soundtrack.wav -c:a libmp3lame -b:a 320k assets/soundtrack.mp3`.

Alternatively, run `bash encode.sh` after the 600 native frame PNGs and source WAV have been generated.

The scene renderer preserves completed frame files for resuming. Move an existing `frames/` directory aside before rebuilding changed geometry or cameras; stale frames must not be reused as if newly rendered.

## Verification and honest limits

See `validation.json` for the final delivered MP4's verification scope, and `registry-media-qc.json` for the distribution audio and picture checks. Technical tests are not a guarantee of artistic quality. No certified human listening pass is claimed.

The actual production path is Blender Workbench stylized 3D shading, Python/Pillow 2D compositing, and FFmpeg encoding. The delivered MP4 is **not** claimed to be an official Hyperframes CLI render. Static Hyperframes lint and any browser check are recorded separately; a static lint pass must not be described as proof of successful browser playback.

## License

The original film, score, production code and package documentation are offered under MIT-0 for this UI2V release. See `LICENSE.txt` and https://spdx.org/licenses/MIT-0.html .

Bundled third-party software and fonts retain their own licenses:
- GSAP 3.15.0: copyright GreenSock; https://gsap.com/standard-license . The distribution header is retained in `assets/gsap.min.js`.
- Noto Sans CJK subset: see `assets/fonts/NOTO-LICENSE.txt`.
- DejaVu Sans: see `assets/fonts/DEJAVU-LICENSE.txt` if those font files are included.

No paid services, external generated imagery, stock video or third-party audio samples were used for this concept.
