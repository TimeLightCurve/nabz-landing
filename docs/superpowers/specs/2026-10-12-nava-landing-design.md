# NAVA cinematic landing page

## Approved intent

Build a NAVA AI note-taker product landing page in the existing Next.js project, closely matching the visual atmosphere and scroll-driven presentation of https://aether1.ai/ and the supplied recording. The user approved the sequence: assembled wristband reveal, magnetic device release, transfer toward a necklace, magnetic attachment, and necklace showcase.

The device moves between two accessories. The wrist cradle stays attached to the strap; the necklace adapter receives the device. Preserve the supplied device geometry and graphite appearance. Present it with blue reflections and cyan edge illumination. This is a local repository implementation; deployment is outside this design.

## Evidence and assets

- The current app is the Next.js starter. React Three Fiber, Drei, Three.js, postprocessing, Lenis, and Motion are already declared dependencies.
- `public/wristband.glb` includes separate `DEVICE_ROOT`, `WRIST_ROOT`, and `WRIST_DOCK_TARGET` nodes.
- `public/nava-modular.glb` adds `NECKLACE_ROOT` and `NECKLACE_DOCK_TARGET`. Use the supplied wristband model as the primary asset and the necklace assembly from the modular model. Do not render duplicate devices or wrist assemblies.
- Neither NAVA model contains baked animation. Author the transfer as deterministic transforms driven by scroll progress.
- `aether-files/app.js` includes an inline source map with original project sources, including scroll, scene, material, and fluid-effect code. The separately saved source directory is incomplete, but the embedded source provides additional reference coverage.
- A file named `scene-258.glb` is present at repository root, but inspection found JavaScript bundle content rather than a GLB header. It cannot supply reference animation clips. The valid original model would improve access to exact camera timing, but is not required to create the approved NAVA sequence using the recording and source code.
- The reference recording is approximately 77 seconds. Its defining composition is a persistent full-screen 3D scene, dark blue atmosphere, illuminated rings, drifting particles, sparse white headings, fine annotations, and restrained fixed navigation.
- Reference earbud texture maps are tied to earbud UVs. Do not apply them blindly to NAVA. Generic noise and glow assets may support the atmosphere.

## Visual direction

Use a near-black navy background, layered blue haze, luminous cyan highlights, soft concentric rings, and sparse floating particles. Keep the graphite device readable through broad studio reflections and rim light. Avoid turning the solid product into transparent glass. Retain generous empty space and the reference's cinematic scale.

Desktop composition places short chapter headings toward the left, the product centrally or slightly right, and compact supporting text and technical callouts away from the silhouette. A compact NAVA wordmark, accessible chapter menu, and scroll progress remain available. Use the existing Geist fonts, with small monospaced labels. Keep text in the DOM for readability and accessibility.

Suggested editorial progression: “Your thoughts. Within reach.”, “Made to move with you.”, “One device. Two ways to wear.”, and “Keep the moment.” These are product-positioning lines, not claims about unprovided features. Do not invent battery life, recording limits, pricing, certifications, or working AI services.

## Scroll choreography

One normalized progress value drives the scene, camera, atmospheric intensity, and text transitions. Approximate phase ranges are tuning anchors, not fixed timing promises.

| Progress | Scene behavior |
| --- | --- |
| 0–18% | Reveal the complete wristband at a flattering three-quarter angle. Slow, low-amplitude idle movement and a soft ring establish the hero. |
| 18–38% | Move closer. Lift the device along the cradle's outward axis before any lateral travel, exposing the magnetic contacts without intersecting the retaining rim. |
| 38–65% | Recede the wristband while the device follows a smooth curved path. Bring in the necklace and adapter, and rotate the device to match the destination docking orientation. |
| 65–80% | Slow near alignment, then accelerate across the final small gap with a restrained settling motion and localized glow. The device remains outside the adapter geometry throughout. |
| 80–100% | Hold the assembled pendant in a readable necklace composition. Finish with the product message and a working replay/back-to-start action. |

Calculate docking transforms from the actual model hierarchy and marker orientations, including any offset between the device root and its contact plane. Preserve original transforms before regrouping. Do not assume both GLBs share identical origins or scale. Resolve positions in a common coordinate space and interpolate rotations with quaternions.

The sequence reverses cleanly when scrolling upward. Derive the attachment and settling pose from progress rather than launching independent time-based docking animations. Refresh at any scroll position must reconstruct the correct pose. Limit idle motion during the contact sequence so the parts cannot drift apart.

## Implementation structure

- `app/page.tsx`: page entry and semantic content composition.
- `app/layout.tsx` and `app/globals.css`: NAVA metadata, typography, full-page layout, responsive styles, and motion preferences.
- A client experience component owns chapter layout, navigation, loading/error state, and scroll progress.
- A scene component owns the canvas, camera, lighting, rendering quality, and environment.
- A product assembly component loads and groups the supplied model parts, preserves their rest transforms, and applies the sampled pose.
- A small timeline module owns phase ranges, easing, docking calculations, and deterministic pose sampling.
- An atmosphere component owns rings, particles, noise/haze, and restrained glow independently of product movement.

Use the installed React/Three stack. Adapt reference rendering techniques where they fit, rather than importing the entire Webflow application and its DOM assumptions. Recover source-map files only to a clearly designated reference location if needed. Do not execute bundled external application code merely to inspect it.

Read the installed Next.js guides required by `AGENTS.md` before coding. Keep server-rendered copy independent from browser-only WebGL loading. Preserve the user's existing assets and dependency changes.

## Interaction, accessibility, and resilience

Use native page scrolling with one progress source; smooth it conservatively if needed. Chapter menu links navigate to actual chapter anchors. Menu controls support keyboard operation, Escape dismissal, and visible focus. Avoid dead preorder, chat, or purchase buttons. Replay returns to the beginning.

On narrow screens, frame the product above or between copy blocks, fit the necklace without horizontal clipping, and reduce particle count, pixel ratio, and expensive effects. Preserve all five narrative stages. Use viewport dimensions that remain stable with mobile browser controls.

Respect reduced-motion preferences by disabling continuous idle/particle motion and presenting stable chapter poses with minimal transitions. Keep the narrative readable if WebGL is unsupported or a model fails. Show a useful loading state and an explicit recovery action for load errors; never leave an indefinite blank canvas. Pause unnecessary rendering when the tab is hidden and dispose of owned GPU resources on teardown.

## Verification and acceptance

1. The actual supplied NAVA geometry appears in both assembled configurations; the wrist cradle and necklace adapter remain distinct.
2. Device lift, rotation, travel, alignment, and final contact are visually continuous, reversible, and free of obvious intersections or endpoint jumps.
3. Hero, release, transit, docking, and final pendant frames are checked against the recording for composition, atmosphere, lighting, typography, and product prominence.
4. Desktop and mobile layouts keep copy legible and the product in frame. Navigation, replay, refresh at mid-scroll, and resize preserve coherent state.
5. Reduced-motion and model-load/WebGL failure paths retain useful content.
6. Focused timeline checks validate endpoint transforms, finite sampled transforms, and continuity at phase boundaries. Avoid tests that merely duplicate styling or component implementation.
7. Type checking and a production build succeed. Inspect runtime errors and asset requests during browser QA when browser access is available. If unavailable, state that visual/runtime verification remains incomplete rather than claiming it passed.

The primary acceptance standard is a convincing NAVA adaptation of the supplied visual reference, with a physically readable magnetic transfer. Exact Aether motion cannot be reused unchanged because the geometry and attachment sequence differ.
