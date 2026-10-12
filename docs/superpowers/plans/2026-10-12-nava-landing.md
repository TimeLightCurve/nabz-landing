# NAVA Cinematic Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Native execution is recommended for this tightly coupled visual scene; the user selects the method before implementation.

**Goal:** Replace the starter page with an Aether-style NAVA showcase whose scroll animation transfers the supplied device from wristband to necklace.

**Architecture:** Server-rendered narrative content surrounds a client experience containing one persistent React Three Fiber canvas. A deterministic timeline drives the device, accessories, camera, and effects from one scroll progress value; model docking transforms are resolved separately from visual staging.

**Tech Stack:** Existing Next.js 16.4, React 19.3, TypeScript, Three.js, React Three Fiber, Drei, CSS, and optional installed postprocessing. Use Node's test runner with TypeScript stripping for focused mathematical tests.

**Spec:** `docs/superpowers/specs/2026-10-12-nava-landing-design.md`

## Global Constraints

- The device moves between two accessories. The wrist cradle stays attached to the strap; the necklace adapter receives the device.
- Preserve the supplied device geometry and graphite appearance.
- This is a local repository implementation; deployment is outside this design.
- Do not invent battery life, recording limits, pricing, certifications, or working AI services.
- Neither NAVA model contains baked animation. Author the transfer as deterministic transforms driven by scroll progress.
- Use the supplied wristband model as the primary asset and the necklace assembly from the modular model. Do not render duplicate devices or wrist assemblies.
- Preserve the user's existing assets and dependency changes.
- Read installed Next.js documentation before coding. Do not load `scene-258.glb`: inspection found JavaScript, not GLB content.

## Review Focus

1. Nonmatching GLB origins or scales must not produce a misaligned magnetic connection: Task 1 verifies marker-space transforms using deliberately different parents.
2. Reverse scrolling and large progress jumps must reconstruct identical poses without hidden animation state: Task 2 samples out of order.
3. Refresh halfway down the page or resize during transfer must preserve the correct chapter and pose: Task 3 includes explicit browser checks.
4. Model failure or unavailable WebGL must leave readable content and a working recovery path: Task 4 verifies both conditions.
5. Mobile browser controls and reduced-motion preferences must not obscure the product or trigger continuous motion: Task 4 checks narrow viewports and preference changes.

## File Map

- `app/page.tsx`: semantic chapter content and experience composition.
- `app/layout.tsx`, `app/globals.css`: metadata, fonts, responsive layout, navigation, loading, and fallback styling.
- `components/nava/experience.tsx`: browser-only scene boundary, scroll state, navigation, and status.
- `components/nava/use-story-progress.ts`: progress ref and chapter state derived from native scrolling and resize.
- `components/nava/scene.tsx`: canvas, camera, lighting, environment, quality settings, and scene lifecycle.
- `components/nava/product.tsx`: model loading, assembly, material tuning, and pose application.
- `components/nava/atmosphere.tsx`: rings, particles, haze, and glow.
- `components/nava/scene-boundary.tsx`: load/render errors, recovery, and fallback.
- `lib/nava/assembly.ts`: hierarchy validation and contact alignment.
- `lib/nava/timeline.ts`: phase constants, transform types, and pure pose sampling.
- `tests/nava-assembly.test.ts`, `tests/nava-timeline.test.ts`: mathematical and hierarchy checks.
- `docs/superpowers/verification/nava-landing.md`: concise visual QA evidence and limitations.

## Task 1: Establish Correct Model Assembly and Docking

**Files:** Create `lib/nava/assembly.ts`, `tests/nava-assembly.test.ts`.

**Interfaces:** Export `resolveAssembly(wristScene: Object3D, modularScene: Object3D): Assembly`, where `Assembly` contains cloned `device`, `wrist`, and `necklace` groups plus `deviceContactLocal`, `wristDockWorld`, and `necklaceDockWorld` matrices. Export `solveDockPose(dockWorld: Matrix4, contactLocal: Matrix4): Matrix4`; its result is the device root world transform.

- [ ] Read the spec and execution/worktree skills. Establish isolation without losing the user's uncommitted models and dependency state; copy required untracked inputs into the selected checkout if needed, without altering originals.
- [ ] Write tests asserting `solveDockPose(dock, contact).multiply(contact)` equals `dock` within `1e-6`, including rotated, translated, and uniformly scaled parents. Assert missing required nodes produce an error naming the missing node.
- [ ] Run `node --experimental-strip-types --test tests/nava-assembly.test.ts`; confirm failure because the implementation is absent.
- [ ] Inspect actual GLB node transforms and magnetic-contact geometry. Implement hierarchy validation, cloning, common-space normalization, and `dockWorld * inverse(contactLocal)` alignment. Derive the device contact frame from the supplied wrist rest pose and wrist target, then verify the resulting contact plane against geometry. Preserve scale consistently and do not mutate loader-cached scenes.
- [ ] Run the test command again; expect all tests to pass. Record model bounds and docking orientation for Task 2.
- [ ] Commit only this task's implementation and tests using explicit paths.

## Task 2: Implement the Reversible Motion Timeline

**Files:** Create `lib/nava/timeline.ts`, `tests/nava-timeline.test.ts`.

**Interfaces:** Export `Pose = { position: Vector3; quaternion: Quaternion; scale: Vector3 }`, `Rig = { wristDock: Pose; necklaceDock: Pose; liftDistance: number }`, and `sampleStory(progress: number, rig: Rig): StoryPose`. `StoryPose` contains device pose, wrist/necklace visibility factors, camera position and target, and ring/glow intensity. Inputs are never mutated.

- [ ] Write tests for exact dock poses at progress `0` and `1`, finite values across 1,001 samples, identical results from shuffled sampling order, clamping outside `[0,1]`, and continuity around `0.18`, `0.38`, `0.65`, and `0.8` (position difference below `0.001` normalized scene units at offsets of `1e-6`).
- [ ] Run `node --experimental-strip-types --test tests/nava-timeline.test.ts`; expect a missing implementation failure.
- [ ] Implement phase ranges `0–0.18`, `0.18–0.38`, `0.38–0.65`, `0.65–0.8`, and `0.8–1`. Lift along the cradle outward normal before lateral travel; use a smooth curved transfer and quaternion interpolation; align before the final short snap. Make settling a bounded function of progress that reaches the exact destination. Keep continuous idle outside the pure docking timeline.
- [ ] Run both test files; expect all assertions to pass. Commit the timeline and its tests.

## Task 3: Build the Cinematic Page and Scene

**Files:** Create the experience, progress hook, scene, product, and atmosphere components; modify `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`.

**Interfaces:** `Experience({ children }: { children: ReactNode })` wraps server-rendered chapter content. `useStoryProgress(container: RefObject<HTMLElement | null>)` returns `{ progress: MutableRefObject<number>, chapter: number }`. `Scene({ progress, reducedMotion, onReady }: SceneProps)` consumes that ref. Product and atmosphere read the same sampled story state inside the render loop, avoiding React state updates every frame.

- [ ] Read installed Next.js client-boundary and lazy-loading guides. Keep `ssr: false` dynamic scene loading inside a client component; retain server-rendered headings.
- [ ] Implement five chapter anchors, fixed compact navigation, a progress indicator, and replay. Measure progress as scroll offset divided by the story's actual scrollable range; initialize on mount and refresh on resize and history restoration. Use native scrolling, with no added smooth-scroll dependency initially.
- [ ] Load `/wristband.glb` and the necklace assembly from `/nava-modular.glb`. Integrate Task 1 docking and Task 2 pose sampling. Normalize scene size to a stable camera range and preserve the real product silhouette.
- [ ] Add graphite material tuning, broad studio reflections, cyan rim light, navy haze, animated soft rings, and sparse particles. Reconstruct reference effects as local components; keep earbud-specific texture maps off NAVA. Add restrained bloom only if it improves inspected frames without washing out edges.
- [ ] Style chapter copy using the spec's suggested lines, left-aligned desktop headings, small technical labels, and generous empty space. Update page title and description to NAVA. Give each menu link a working anchor; implement Escape dismissal, focus return, and replay.
- [ ] Run `npx tsc --noEmit` and focused tests; expect no errors. Read the local preview guidance before starting browser QA. In an available supported browser, inspect hero/release/transit/dock/pendant frames; refresh at progress near `0.55`, resize during transfer, and scroll backward. Confirm coherent pose and no clipping or overlap; document unavailable browser access if blocked.
- [ ] Commit only the completed scene/page files.

## Task 4: Add Responsive Framing, Resilience, and Final Verification

**Files:** Create `components/nava/scene-boundary.tsx` and the verification document; update experience, scene, atmosphere, and global styles.

**Interfaces:** `SceneBoundary({ children, onRetry }: { children: ReactNode; onRetry: () => void })` catches scene failures. Retry clears failed GLTF cache entries and remounts the scene. Scene quality derives from viewport and motion preference, with pixel ratio capped at `1.75` desktop and `1.25` narrow screens.

- [ ] Add a visible loading indicator, actionable model-load error, and readable WebGL fallback. Preserve semantic chapters outside the boundary. Do not keep a blocking loading overlay after a failure.
- [ ] At widths below `768px`, reframe device and necklace for portrait screens, relocate copy, and lower particle/effect cost. Use stable viewport sizing and prevent horizontal overflow. Ensure touch scrolling remains native.
- [ ] Respect `prefers-reduced-motion` initially and when changed: use stable chapter poses, disable continuous idle/particle motion, and make replay immediate. Pause rendering while hidden, resume cleanly, and dispose only owned clones and GPU resources.
- [ ] With supported browser tooling, inspect `1440×900` and `390×844` layouts. Check keyboard menu/replay, reduced motion, failed model requests, and disabled WebGL. Verify that content remains accessible and retry recovers after network restoration. Record concrete pass/fail results; do not claim unavailable checks passed.
- [ ] Run `node --experimental-strip-types --test tests/nava-assembly.test.ts tests/nava-timeline.test.ts`, `npx tsc --noEmit`, and `npm run build`. Expect passing tests, no type errors, and a successful production build. Resolve observed failures before broadening tests; lint only if requested.
- [ ] Review against all seven acceptance criteria in the spec, obtain the selected execution workflow's final code review, and fix material findings. Record screenshots or visual-check limitations and commands in the verification document.
- [ ] Commit explicit task paths and provide the local preview address, changes, verification results, and any remaining visual-validation limitation. Do not deploy or stage unrelated user changes.
