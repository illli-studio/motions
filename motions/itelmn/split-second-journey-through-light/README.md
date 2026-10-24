# Split Second: A Journey Through Light

Original 24-second, 1920×1080, 30 fps optical art film. White light enters a triangular glass prism, becomes a continuous colour fan, then transforms into an immersive ribbon sculpture. The film returns to an ivory museum composition.

## Editable native project

`index.html` is the Hyperframes composition. `film.js` draws each frame deterministically from absolute time. It contains actual three-dimensional prism vertices, projected faces, camera position and target interpolation, geometric depth sorting, translucent material shading, and a projected spectral ribbon surface, alongside two-dimensional diagram and typography. It is a Canvas software renderer, not WebGL, not a pre-rendered video plate, and not a physically based ray-tracer. Geometry, camera, colours, text and timing are editable. The platform runtime contains no full-film MP4, WebM, frame sequence, external CDN dependency, or encoded video data.

`preview.html` provides a separate browser QA player with timeline seeking and audio controls. Serve the project using a static HTTP server and open that preview. The main composition registers the paused GSAP timeline synchronously under `window.__timelines['prism-light']`; the Hyperframes host owns normal playback.

## Scientific scope

The explanatory segment uses a straight path in each medium, two boundary refractions, and red-to-violet dispersion with violet deviating farther toward the base. The face contact positions are derived from the actual triangular geometry. Colour is a continuous band, sampled into 49 render strips; it does not imply seven fundamental colours. These are art-directed directions, not a numerical Snell-law solver or a quantitatively accurate material model. Curved ribbons and travelling light accents in the macro passage are explicitly artistic, not light-speed measurements. The film labels itself “STYLISED VISUALISATION · NOT A PHYSICAL SIMULATION.”

References for the qualitative optical principle:
- NASA, Visible Light: https://science.nasa.gov/ems/09_visiblelight/
- University of Nevada Las Vegas, Prism Refraction: https://www.physics.unlv.edu/~jeffery/astro/optics/refraction_prism.html

## Sound

`assets/score.mp3` is an original 24-second, 120 BPM synthesized score. Glass/felt notes, harmonic pads and percussion respond to the diagram, prism extrusion, 8.000-second split, macro movement and final resolution. No stock recording or paid asset was used. The full source edition includes `audio.py`, which regenerates the score with NumPy, SciPy and FFmpeg.

## Export and validation

The local full-source package includes `render.cjs` and `check.cjs`. Install `@napi-rs/canvas` from npm and have FFmpeg on PATH. Run `python3 audio.py`, then `node render.cjs`. MP4 export uses the exact same `film.js` draw function through @napi-rs/canvas, then FFmpeg H.264/AAC. It is not an official Hyperframes CLI export.

Hyperframes 0.8.186 lint passes with zero errors or warnings. Official browser-based inspect was attempted but its Chromium process failed with `Protocol error (Target.setDiscoverTargets): Target closed`; that check is not claimed as passed. Real browser playback is reviewed separately. Unordered time seeks are hashed to verify determinism; keyframes and half-second contact samples are inspected. Final MP4 full decode, frame count and audio loudness/true peak are checked before delivery.

The published runtime deliberately excludes local execution helpers. Full render helpers and original audio generation source remain in the separately delivered editable source archive. MIT-0 applies only to original work. Third-party font and GSAP notices remain in `THIRD_PARTY.md` and `assets/`.
