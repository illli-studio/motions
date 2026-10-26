# The Long Way Down

An original 24-second, 1920×1080, 30fps marble-run animation with synchronized original music and sound. A mint marble hesitates on a porcelain crest, descends a banked S-shaped track, and contacts the rim of a suspended brass bell at **18.600 seconds**. The camera continuously follows and then pulls back to the whole sculpture.

## Editable native scene

`index.html` is the Hyperframes composition. It synchronously registers a paused GSAP timeline under `window.__timelines['marble-run']`. The timeline invokes `MarbleRun.render(context, absoluteSeconds)` in `film.js`.

The track is a true 3D banked cross-section with tubular rails. The marble is a rotating lit mesh; the bell is a revolved shell. Projection, simple lighting and painter ordering are performed by a deterministic Canvas software renderer. The geometry, materials, control points, time-remapped path progress, camera and 2D annotations are all editable JavaScript. This is not WebGL, PBR or a calibrated physics simulation. The progress diagram is normalized arc length; the gravity arrow indicates direction only. No numerical physical speed is claimed.

`preview.html` is a local QA player with play, pause and arbitrary seeking. Serve the directory over HTTP. The actual Hyperframes composition leaves media playback to its host. No runtime video, frame sequence, embedded Base64, remote font or external CDN is used.

## Editing and export

Full-source edition: install the pinned JavaScript dependencies with `npm ci`, install `requirements.txt`, run `python3 audio.py`, and run `node render.cjs` with FFmpeg available. `node check.cjs` creates deterministic unordered-seek evidence and a half-second contact sheet. `node render.cjs --stills` renders selected full-resolution stills.

The delivered full MP4 is exported by the **same JavaScript draw function through @napi-rs/canvas and FFmpeg H.264/AAC**, not by the official Hyperframes CLI renderer. The initial native-browser preflight and the project's full CLI check both encountered `Protocol error (Target.setDiscoverTargets): Target closed` while starting Chromium. Thus automated CLI runtime/layout/contrast inspection did **not** pass. The lint stage reported 0 errors and 0 warnings. Actual cloud-browser playback was independently inspected by the parent production workflow, including visual corrections and arbitrary seeking.

## Original sound

`audio.py` synthesizes an original D-minor plucked motif, bass, rolling texture, ceramic ticks, bank air movement and a bell strike. No recording or stock music is used. It is deterministic with seed 4917. Audio is stereo, 48 kHz, 24 seconds. `assets/score.mp3` is the browser score; `soundtrack.wav` is the export master.

## Deliverable separation

- Full MP4: delivered separately, never inside the runtime.
- Full source archive: runtime assets, editing/export scripts, score master and factual QC reports; excludes dependencies, rendered frames and full MP4.
- Runtime archive: native composition, local fonts/GSAP/score, docs and licenses only. No rendering helpers, dependencies, WAV master, video or images.

MIT-0 applies to original geometry, animation, graphics, score and scripts. Preserve the bundled GSAP and DejaVu licenses. See `THIRD_PARTY.md`.
