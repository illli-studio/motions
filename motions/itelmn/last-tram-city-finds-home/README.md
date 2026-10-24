# The Last Tram: A City Finds Its Way Home

An original 24-second miniature-city short: a drawn transit route becomes physical rails; an amber tram crosses the river, then slows into a welcoming station. Native 1920 × 1080, 16:9, with an original 120 BPM score.

## Editable native artwork

Serve this directory over HTTP and open `preview.html` for manual Play/Pause, Restart, and seeking. Load `index.html` as the Hyperframes composition. Its paused GSAP timeline is registered as `window.__timelines['last-tram']`; timeline updates call `LastTram.render(context, seconds)` from `film.js`. Geometry, lighting, camera, text, color, and timing remain editable in that JavaScript file.

The scene uses actual three-dimensional vertices and camera projection, face lighting and depth sorting, rasterized on Canvas 2D. It is a stylized software 3D renderer, not WebGL or photorealistic physical simulation. A two-dimensional route and typography share the deterministic scene time. Native canvas dimensions stay 1920 × 1080; the preview wrapper scales only presentation.

All required assets are local: GSAP, two fonts and `assets/score.mp3`. There is no full-video playback source, frame sequence, external runtime asset request or encoded-video workaround. `thumbnail.png` is a single catalog cover, not part of playback.

## Optional official tooling

With Node 22+, `npm install`, then `npm run lint` or `npm run preview`. Official export requires the Hyperframes CLI and a working Chromium environment. Official lint and native browser validation are distinct checks: a browser inspect startup failure is not a successful official render. See `validation.json` for the evidence and limits of this release.

The separate chat-delivered full source ZIP contains optional local CPU-export and original-score build helpers. Those helpers are deliberately absent here: browser playback needs none of them. The independently delivered MP4 is rendered from the same deterministic scene through CPU Canvas and FFmpeg, not represented as an official Chromium export.

## Rights

Original scene, geometry, choreography, score and source are MIT-0 (`LICENSE.txt`). GSAP and fonts remain under their respective third-party licenses in `THIRD_PARTY.md` and `assets/*LICENSE.txt`; they are not relicensed as MIT-0. No external stock media or paid generation service was used.
