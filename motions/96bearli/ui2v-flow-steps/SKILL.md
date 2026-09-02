---
name: ui2v-flow-steps
description: A four-step HyperFrames explainer motion lighting green in sequence for the UI2V motion-package flow (Create -> Publish -> Install -> Sync). Use when you want to show how to share motion packages through the UI2V registry as a short animated walkthrough.
metadata:
  short-description: UI2V four-step registry flow explainer
---

# ui2v-flow-steps

A 1920x1080, ~4.5s HyperFrames motion that walks through the UI2V registry flow
as four stages that turn green in sequence with connecting rails. Derived from
the Hero motion style and re-expressed for the UI2V motion-package workflow.

## Steps shown

1. **Create** — author a motion composition in HyperFrames, export a package
   folder (`index.html` + `registry-item.json`).
2. **Publish** — `ui2v login`, then `ui2v motion publish ./my-motion --version 1.0.0`.
3. **Install** — `npx @ui2v/cli@latest install <slug>`.
4. **Sync** — `ui2v sync` to batch-publish or update local motion folders.

## Format

- Entry composition `index.html` with `data-composition-id="main"`,
  `data-duration="4.5"`, `data-width="1920"`, `data-height="1080"`, 30 fps.
- A paused GSAP timeline published at `window.__timelines.main`.
- Four `.stage` cards (`#s1..#s4`) plus `.conn` rails fill after each pass.
- Manifest: `registry-item.json` (`type: "hyperframes:block"`).
- Reuse freely under MIT-0.