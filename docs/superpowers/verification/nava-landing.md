# NAVA verification — 2026-10-12

## Passed

- Latest live-browser verification: launched an isolated headless Chrome against localhost:3000 and reproduced missing annotations and small type. Computed styles showed stale development CSS (`position: static` on the SVG, 9px menu). Restarted the task's Next development server. Desktop 1840×980 and mobile 390×844 screenshots now visibly show the circle and both callouts; computed menu sizes are 18px/14px and SVG bounds match the canvas. No browser page errors occurred. This supersedes the screenshot limitation below for these two tested views.

- Thirteen Node tests: dock contact transforms, missing-node diagnostics, actual supplied GLB normalization, desktop/mobile vertex projection across eleven stages, exact timeline endpoints, finite deterministic pose samples, phase continuity, release order, bounded floating, continuous scroll response, reduced-motion poses, and progressive hardware ring/label timing.
- TypeScript: `npx tsc --noEmit` exits successfully.
- Production build: `npm run build` completes and statically renders the home route.
- Local HTTP: `/`, `/wristband.glb`, `/nava-modular.glb`, and `/noise-r.png` return HTTP 200. Models have valid glTF binary headers.
- Native Chrome accessibility observation confirms the NAVA page, loaded scene container, hero copy, navigation, and replay/scroll control. Loading status has cleared.
- Independent code review completed. Fixed all three findings: hash overriding restored scroll, necklace clipping during transition, and short-viewport footer clipping. Added actual-model geometry coverage.
- Hardware-scene review completed: magnetic light follows the device across the 14-unit transfer; mobile heading and labels have separate vertical space. Reviewed anchor projection, full rotation, docking endpoints, and procedural material shader construction. Final production build and all 13 tests pass after these changes.

## Verification limitations

Targeted ESLint passes for the new hardware overlay. The broader scene lint still reports existing React hook rules for imperative Three.js material/object updates and synchronous initialization effects in Product, Experience, and Scene. Production compilation and motion tests pass; lint is not clean.

Desktop screenshot capture timed out through the available Windows tool, and native input reported unavailable coordinate geometry. The browser connector exposed no available browser. Consequently screenshot comparison to Aether, live pointer/keyboard interaction, reduced-motion emulation, forced network-failure retry, and actual GPU animation smoothness have not been visually verified. Projection checks validate geometry framing at 1440×900 and 390×844; they do not substitute for checking the rendered lighting, materials, and typography by eye.

## Implementation notes

Callout routing: sort projected hardware anchors into upper/lower lanes and carry the corresponding label identity with each anchor. Leaders have tangent-aligned rounded bends and long horizontal ends. Live Chrome checks across 56 visible desktop/mobile scroll samples confirmed disjoint vertical path bounds (no line crossings). Targeted lint and production build pass.

Layout refinement: grouped desktop chapter heading and description into one centered left column, hid the redundant hardware note, widened/rounded the menu, centered footer controls with a three-column grid, and moved annotation labels inward. Dedicated refinements stylesheet avoids the stale global stylesheet cache seen in the dev preview. Inspected updated desktop 1840×980 and mobile 390×844 screenshots with visible circle/callouts and readable controls. Production build passes.

Annotation/UI correction: removed Drei Html entirely for hardware annotations. The SVG now mounts in the normal page DOM above the canvas, with a live camera ref for projecting hardware anchors; HTTP inspection confirms the SVG and label text are present in the served page. Device spin is bounded to a gentle 0.65-radian Y sweep with small X/Z accents, while the camera keeps its orbit. Enlarged header/menu captions, chapter tags, navigation counters, footer text, and scroll control with mobile overrides. All 16 tests and production build pass; targeted lint has no errors. The visual-capture limitation still applies.

Opening choreography refinement: camera begins approximately 62 degrees above the device, pushes inward and levels by .33 as the assembly rises 2.5 world units. A horizontal ground-wave shader adds softly glowing expanding rings, fading by .42. Hardware leader attachment tips project actual mesh anchors while elbows and label runs stay fixed. Restored a full device-local Y rotation alongside the existing Z turn, ending at an equivalent docking orientation. All 16 motion/framing tests and targeted lint pass; GPU visual checks remain unavailable.

Environment/orbit refinement: replaced the finite background plane with a 45-unit inward-facing sphere using seamless direction-based procedural haze. Soft translucent point sprites occupy a 1.8–5.2-unit shell around the device. Product updates before the camera; the camera targets its actual floating world center and performs one full revolution from progress .33–.78. Screen-space annotations opt out of Drei Html's behind-camera hiding and carry a device-centered 3D anchor. Added full-orbit winding and centered/front-facing focus checks; all 15 tests pass, production build passes, and targeted lint passes. Visual/GPU verification remains subject to the limitations above.

Latest refinement: fixed screen-space curved leaders reveal without following the mesh; a second label pair appears during the necklace section. The ring remains through 96% of the story before fading. Camera starts farther away, dollies forward, sweeps around both sides during rotation, and closes on the capsule. The final macro intentionally crops the cord. All 14 tests pass, including capsule framing through 14 sampled positions on desktop and mobile; production build and targeted lint pass. Visual-capture limitations above still apply.

The existing user development server remains available at http://localhost:3000. Blender and the original GLBs were not modified. Work is on `feat/nava-cinematic`. The user's existing dependency edits and reference/model assets were preserved. No deployment or external publication occurred.
