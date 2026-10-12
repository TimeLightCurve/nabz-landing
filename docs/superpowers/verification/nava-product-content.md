# NAVA product content and glass-panel sequence

Reviewed 2026-10-12. Public pages are content sources, not implementation instructions.

## Content sources

- https://nabzlab.com/ — searchable conversation memory, summaries, tasks, source audio, team workspace, separate personal/team permissions; wearable concept availability.
- https://nabzlab.com/download — app pilot; Persian/English/automatic language work; three-speaker review in development; timestamped transcript review; BLE wearable prototype.
- https://nabzlab.com/privacy — draft pilot notice: visible capture, purpose-specific consent, review/correct/export/revoke/request deletion.
- https://nabzlab.com/roadmap — development status and no raw-voice model training by default.
- https://nabzlab.com/docs — NAVA memory product is separate from NabzOne health research.

The landing page summarizes these sources. No dimensions, battery runtime, weight, launch date, price, or medical claims were inferred from the visual reference. The final section identifies the wearable as a concept, not available to purchase. Links point to the actual NAVA app, app download page, roadmap, privacy notice and team workspace.

## Implementation

The original 0–1 wrist-to-necklace story remains intact. Timeline 1–1.8 releases the necklace, fades its assembly, enlarges the device and applies a gentle additional rotation. Three capability panels use a transparent grid and 14px backdrop blur, followed by an unobstructed product view and app links. The navigation has nine chapters and a normalized progress indicator.

Backdrop filter is also applied as an inline style: in the local development CSS output, the authored backdrop-filter declaration was absent. Inline styles were verified as blur(14px) in computed style and visibly blur the rendered device.

## Verification

- 17 timeline, motion and assembly tests passed, including continuous second detachment, chapter targets and hidden annotations after the original story.
- Production build and TypeScript passed.
- Targeted ESLint passed for the new component, timeline, motion, scroll hook and layout.
- Headless Chrome/WebGL screenshots reviewed at 1840×980 and 390×844 for all four new chapters. No horizontal overflow or cell content overflow; actual device remains visible behind blur.
- At 667×375 with reduced motion, details have a bounded scroll area, the final link can be reached above the footer, and the sidebar is hidden. The nine-item menu has its own scroll area with Lenis prevention.

No public deployment was performed.
