# Make It Real: From Prompt to Creative Studio

A 24-second film about turning one sentence into a creative workspace, then into a finished piece.

**1920×1080 native · 16:9 · 30fps · 720 frames · original music and action sound design**

An orange helper opens a spatial studio. Flat control handles shape a real 3D object, waveform graphics respond to the actual soundtrack, clips assemble into a physical timeline, and the finished screen plays earlier footage from the film.

## Package and playback

This is a Hyperframes media composition. `index.html` combines `assets/visual.mp4` and `assets/soundtrack.mp3` on separate tracks. The silent visual is the exact native-resolution master visual, not an upscaled preview. The 320 kbps MP3 is derived from the original WAV for registry distribution.

Install with the UI2V registry client, then use a compatible Hyperframes environment to preview the composition. The local project uses Hyperframes 0.8.186. Browser playback/render capability depends on the local Chromium environment.

## Editable production sources

- `scene.py`: genuine Blender geometry, character, deterministic motion and spatial camera.
- `composite.py`: Chinese typography, interface seed, vector control handles, PCM-derived waveform and perspective-mapped playback.
- `audio.py`: original score and action SFX; recreates the WAV and waveform data.
- `annotations.json`: camera-projected attachment points for the 2D/3D interaction.
- `brief.json`, `PRODUCTION_NOTES.md`: story beats and review corrections.

The film uses prerendered 3D and 2D compositing. It is **not** a native browser real-time 3D scene. Changing models, cameras or baked typography requires rerendering the source.

## Rebuild from source

Requires Blender 4.3.2, Python with the packages in `requirements.txt`, and FFmpeg. Run from this package folder. Bundled fonts keep typography reproducible.

1. `python audio.py`
2. `FILM_W=1920 blender -b -t 6 -P scene.py -- 0 720`
3. `RAW_PIPE=1 python composite.py | ffmpeg -y -f rawvideo -pixel_format rgb24 -video_size 1920x1080 -framerate 30 -i - -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -an assets/visual.mp4`
4. `ffmpeg -y -i assets/visual.mp4 -i assets/soundtrack.wav -c:v copy -c:a aac -b:a 256k -t 24 -movflags +faststart Make-It-Real.mp4`
5. Optional: regenerate the registry MP3 with `ffmpeg -y -i assets/soundtrack.wav -c:a libmp3lame -b:a 320k assets/soundtrack.mp3`.

The renderer preserves completed frames for resuming. Move existing `frames/` aside before rebuilding changed geometry or camera; do not reuse stale frames.

## Verified scope and limitations

The original delivered MP4 passed full FFmpeg decode, exact dimensions/frame-count/duration checks and audio peak/loudness checks. Its report is `validation.json`; it describes that original AAC master, not a browser-rendered export or this MP3 derivative. Registry MP3 decode and media metadata are checked separately in `registry-media-qc.json`.

Production used Blender Workbench stylized shading + Python/Pillow compositing + FFmpeg. It was not rendered with the official Hyperframes CLI. Hyperframes static lint passed. Browser visual validation did not complete because Chromium returned `Target closed`; no successful browser playback or official CLI render is claimed. No human listening pass is claimed.

## License and attribution

Original film, original score, original production code and this package documentation are offered under MIT-0 for this UI2V release. See `LICENSE.txt`.

Bundled third-party software and fonts retain their own terms, not MIT-0:
- GSAP 3.15.0: copyright GreenSock; https://gsap.com/standard-license (copyright/license header preserved in `assets/gsap.min.js`).
- Noto Sans CJK subset: license in `assets/fonts/NOTO-LICENSE.txt`.
- DejaVu Sans: license in `assets/fonts/DEJAVU-LICENSE.txt`.

No paid or external AI-generated assets were used. The orange helper is an original geometric character, not an official product mascot.
