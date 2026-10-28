# Actual validation status
- Reworked 21-second visual sequence and reference cues passed root and independent visual/mechanical review. This is not a promise of user satisfaction.
- Actual Three.js WebGL meshes and materials; no fallback video or frame sequence.
- Final official low-memory, one-worker export completed 630 frames at native 1920×1080 / 30 fps, 21.000 seconds, with original stereo AAC audio. Full MP4 decode completed without errors; decoded audio peak −8.6 dBFS.
- First export failed at 36/630; its automatic fallback failed at 195/630. The fresh documented low-memory recovery succeeded. These failures are retained, not hidden.
- Six official nonsequential native PNG frames at 8.8,16,2,2,16,8.8 produced three pixel-identical repeat pairs.
- Default cloud interactive WebGL was unavailable. A fresh isolated own-cloud Chromium using documented software ANGLE driver (without security-relaxing flags) subsequently rendered and played native Studio from 00:00 to 00:21, after the export completed. Earlier concurrent attempt crashed with error 9; resource pressure is possible, not proven.
- Version 1.1.0 publication is pending final release review; existing online version 1.0.0 remains intact.
- Official lint: 0 errors, 0 warnings. Runtime: 0 errors, 7 ReadPixels performance warnings. Intentional full-bleed Canvas warning retained. Craft warns about the 23 px boundary and infers a 0–3.63 s static stretch, although actual reviewed video shows the wheel moving. DOM contrast: 10 checked, 10 passed. Motion check disabled, 0 samples. Warnings and skipped checks are not presented as clean passes.
