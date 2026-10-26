# A Small Turn: The Camera Wakes Up

An original 24-second, 1920×1080, 30fps product-interaction film. A small still life becomes a focus target; an imaginary compact camera assembles, its focus ring turns, eight aperture blades move, a shutter flashes and the captured still-life card emerges.

## Native editable scene

`index.html` is the Hyperframes composition. Its synchronously registered paused GSAP timeline drives `SmallTurn.render(context, absoluteSeconds)` in `film.js`. The scene is actual projected three-dimensional geometry: beveled body, plates, cylindrical lens, focus-ring details, top shutter cylinder and eight moving blades. Surfaces and line details are depth sorted. 2D editorial graphics and the original still-life illustration complement the geometry. It is a deterministic Canvas software renderer, not WebGL, PBR or a physical camera simulator. The camera is fictional and has no brand or real technical specifications.

`preview.html` is a separate local QA player. Serve this directory over HTTP and open it to play or seek with sound. The Hyperframes host owns playback in the actual composition. The runtime has no full-film video, frame sequence or external CDN dependency.

## Export

The full-source edition includes `render.cjs`, `check.cjs`, `audio.py` and requirements. Run `npm install`, then `python3 audio.py`, then `node render.cjs` with FFmpeg installed. MP4 export uses the exact same deterministic JavaScript draw function through @napi-rs/canvas and FFmpeg H.264/AAC, rather than an official Hyperframes CLI export. Run `node check.cjs` for unordered seek tests and sampled contact sheet.

The runtime-only platform package excludes all local execution helpers, large WAV, MP4, frames, dependencies and build logs. The full source archive includes the helpers separately for local editing and export.

## Audio and timing

Original24-second120BPM synthesized score: wooden plucks, warm bass, dry detents and soft mechanical sounds. Focus ticks8–12s, aperture12–15s, shutter at16.000s, paper glide17s and resolution20s. Audio is deterministic and contains no third-party recording. See audio.py and audio-qc.json in the local project.

## Validation and scope

Hyperframes lint: zero errors and warnings. Browser playback is checked separately by the parent production workflow. Keyframes and half-second motion samples are reviewed; depth ordering, macro label contrast and headline overlap were corrected. Unordered seeks are hash checked. Final MP4 must pass whole-file decoding,720-frame count,24-second duration and audio peak/loudness checks before delivery. Official Hyperframes0.8.186 inspect was attempted but Chromium closed with Protocol error (Target.setDiscoverTargets): Target closed. This stage did not pass; browser playback is independently checked.

The eight-blade iris is a stylized geometric mechanism, not an engineering model. The photograph is an original vector still life, not a photograph of a real object. MIT-0 applies to original work; preserve bundled font and GSAP notices in THIRD_PARTY.md and assets/.
