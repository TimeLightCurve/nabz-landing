# NAVA verification — 2026-10-12

## Passed

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

The existing user development server remains available at http://localhost:3000. Blender and the original GLBs were not modified. Work is on `feat/nava-cinematic`. The user's existing dependency edits and reference/model assets were preserved. No deployment or external publication occurred.
