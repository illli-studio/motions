# Clockwork Tide: A Rhythm in Motion
An original 24-second kinetic abstraction. Brass and sea-glass rings release a travelling tone into a spatial wave, then gather into a circular cadence.

## Native browser artwork
Open preview.html through a local HTTP server for playback and visible time controls. index.html is the clean 1920×1080 Hyperframes composition. It registers a paused GSAP timeline as window.__timelines['clockwork-tide']. Its onUpdate calls ClockworkTide.render(context, timeline.time()). Hyperframes 0.8.186 seeks with callbacks enabled, so arbitrary seeks draw deterministic states.

film.js contains actual torus and sphere vertices, mesh topology, camera basis, perspective projection, normals, directional/specular lighting, backface rejection, and painter's depth sorting. This is custom software 3D on Canvas 2D, NOT WebGL, Blender, physical simulation, or a pre-rendered visual plate. A projected spatial trace and screen-space engraved score share the same time. Light and surface detail are stylized rather than photoreal.

All runtime assets are local. The only media is an original lightweight MP3 soundtrack. No video or image sequence is required for browser playback. Canvas width/height remain native1080p; the QA wrapper scales presentation only.

## Editing and native tooling
- Edit geometry, camera, palette, typography, and choreography in `film.js`; time is deterministic in seconds.
- Runtime needs no installation: serve this directory over HTTP and open `preview.html`.
- For optional official tooling, run `npm install`, then `npm run preview` or `npm run lint`. For official export, use the Hyperframes CLI render command. Official render requires a functioning Chromium environment and is not claimed verified here.
- The separate chat-delivered full source ZIP retains the original audio synthesizer and optional CPU export build tools. They are not present in this platform runtime package. The browser composition remains fully editable without them.

## Known validation limits
Official Hyperframes lint0.8.186 passed with0errors/0warnings. Official inspect/check browser startup failed in this sandbox: Protocol error(Target.setDiscoverTargets): Targetclosed. This is recorded rather than bypassed. Native CPU export is an independent render route, not a claim of successful official Chromium export. Browser and finalMP4 validation are recorded in validation.json when completed.

## Licensing and publishing
Original work MIT-0; retain THIRD_PARTY.md and assets/*LICENSE.txt. Publish only native composition/runtime assets, not the MP4, soundtrack.wav, stills, render logs, environment files, or credentials. MP4 is a separate chat deliverable. No physical/scientific accuracy claims.


## Release contents and QA
This independent runtime release is version 1.0.1. Runtime uses `index.html`, `film.js`, GSAP, two local fonts, and `assets/score.mp3`. `preview.html` is an optional manual playback wrapper; `thumbnail.png` is one static catalog cover, never a visual playback source. No video or image sequence is bundled. Build dependencies are declared but not vendored. Serve the directory over HTTP (`python3 -m http.server 8000`) and open `/preview.html`.

The final code was manually verified in cloud Chrome: Play advanced 10–24 seconds, seek at 10/15/23 seconds showed distinct frames, Restart returned to zero, and the revised 15-second framing and sphere cap were checked. This is local browser QA, not proof of deployed platform playback. Official Hyperframes 0.8.186 lint passed; official inspect could not start Chromium (Target closed), so official Chromium export is not claimed. A separate 24-second 1920×1080, 30 fps, 720-frame MP4 was exported from the same deterministic JavaScript scene through a CPU Canvas renderer and FFmpeg. Full decode passed; measured audio was −15.14 LUFS and −1.82 dBTP. This MP4 is intentionally absent from this package.

Original material is MIT-0. The GSAP standard license and DejaVu notices remain separate and must be retained. No credentials, machine configuration, or workspace archives are included.

## Runtime-only patch 1.0.1
The public 1.0.0 scan identified `render.cjs`, line 1: `suspicious.dangerous_exec`, “Shell command execution detected (child_process).” That build-only FFmpeg launcher, the optional Python score generator, Python dependency list, and CPU-export npm dependency/scripts have been removed from this platform package. They were never used by browser playback. No execution code has been renamed, hidden, or replaced to circumvent scanning. Runtime HTML, drawing code, fonts, GSAP, score, and cover are byte-identical to version 1.0.0. The prior warning is documented here; the new platform scan result must be checked separately after publication.
