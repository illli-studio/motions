# 桥面，为什么故意留一道缝？ — v1.1 redesign

Original 21-second browser-native science composition, designed for Hyperframes at 1920×1080. Reworked version. Pending publication: final official export and isolated software-ANGLE native Studio playback are verified; public version verification is still pending. Version 1.0.0 remains unchanged online.

Actual Three.js WebGL geometry, standard physically lit materials, deterministic procedural material textures and explicit-time GSAP timeline. No full-frame prerecorded media, frame sequences or Base64.

## Scientific scope
A deliberately simplified expansion-joint and sliding-support example. Material temperature changes make the bridge segment longer or shorter; its chosen left end is constrained, its right end moves relative to a fixed abutment. The strip seal remains connected to both steel edges, changing its fold with the opening. The top bearing assembly follows the moving bridge end while the bottom support remains fixed.

Displacements are exaggerated and the process accelerated. This is not a construction drawing. Real bridges also accommodate shrinkage, creep and other actions. Some integral and semi-integral bridges omit deck expansion joints. The pictured arrangement is not universal.

## Sources
- WSDOT Bridge Design Manual, June 2025, Chapter 9, pp9-1–9-4: https://wsdot.wa.gov/publications/manuals/fulltext/M23-50/Chapter9.pdf
- TxDOT Maintenance Operations Manual, Bridge Joints / Bridge Bearings: https://www.txdot.gov/manuals/mnt/ope/bridges/bridge_maintenance_actions.html
- US DOT, Design of Integral Abutment Bridges for Extreme Climates: https://www.transportation.gov/utc/design-integral-abutment-bridges-extreme-climates

## Timeline
0–4s: close-up wheel crossing a flush joint.
4–14s: one structure warms and cools, revealing changing joint width.
14–21s: camera reveals contacting sliding plates, then returns to the road.

Keep all relative assets available. Run official Hyperframes preview / render from this directory. The exported MP4 is a separate chat deliverable and must not be added to the native publication package.

## Edit and rebuild
The entry loads `scene.bundle.js`, not `scene.js` directly. Edit the readable `scene.js` and then rebuild with esbuild 0.25.12:

```sh
npx --yes esbuild@0.25.12 scene.js --bundle --format=iife --minify --outfile=scene.bundle.js
```

The Three.js 0.186.1 modules are vendored in `assets/`; GSAP is loaded separately. Rebuild before preview/export. No remote runtime dependency is required. `audio.py` in the development source archive regenerates original stereo sound using Python, NumPy and SciPy; it is an optional sound-design helper, not the browser renderer.
