# 硬币没动，为什么看起来变浅？
28s 1920×1080 30fps editable native HyperFrames composition. MIT-0 original work.

Open with HyperFrames or serve this directory and open preview.html. Edit film.js for geometry, rays, labels and timing. index.html registers paused GSAP timeline. assets/score.mp3 is original sound design. No full-frame prerecorded video exists in runtime.

## Knowledge boundary
Light travels coin→water surface→eye. Water-to-air oblique rays refract away from the normal. The eye traces received directions backward; adjacent rays define a local apparent point shallower than the real coin. Apparent position varies with view angle. Dashed outline is a schematic virtual image, not a second coin or rising object. Flat water; ignore container walls and dispersion. No quantitative image-depth claim.

## Sources
See SOURCES.md for primary institution citations.

## Export
Source archive includes render.cjs and audio.py. npm install then node render.cjs uses the identical deterministic rendering function as the browser and FFmpeg. See RENDER-NOTES.md.
