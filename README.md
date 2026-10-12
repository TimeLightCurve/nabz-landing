# NAVA landing page

A cinematic, scroll-driven product story built with Next.js and React Three Fiber. NAVA lifts from its wrist cradle, moves toward the necklace, and attaches to its magnetic adapter. Scroll upward to reverse the sequence, or use Explore to jump between chapters.

## Local preview

Run `npm run dev` and open http://localhost:3000. The existing local development server can also serve edits automatically.

## Checks

```sh
node --experimental-strip-types --test tests/nava-assembly.test.ts tests/nava-timeline.test.ts
npx tsc --noEmit
npm run build
```

Node 22.12 or newer supports the test command. The experimental type-stripping warnings on Node 22 are informational.

## Editing

- `app/page.tsx`: chapter copy.
- `app/globals.css`: typography, layout, navigation, and responsive styles.
- `lib/nava/timeline.ts`: scroll phases and responsive product framing.
- `lib/nava/assembly.ts`: model normalization and material appearance.
- `components/nava/scene.tsx`: camera and lighting.
- `components/nava/atmosphere.tsx`: procedural rings, haze, and particles.

Required local assets are `public/wristband.glb`, `public/nava-modular.glb`, and `public/noise-r.png`. The saved `aether-files` directory is reference-only and excluded from TypeScript compilation. The root file named `scene-258.glb` contains JavaScript and is not loaded.

The page includes reduced-motion presentation, loading/error states, model retry, and a WebGL fallback. No backend, purchase flow, or AI service is connected.

See `docs/superpowers/verification/nava-landing.md` for verification evidence and remaining visual checks.
