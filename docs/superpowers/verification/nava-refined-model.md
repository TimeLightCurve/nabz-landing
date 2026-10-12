# Refined NAVA assets

The landing page now loads `wristband-refined.glb` and `nava-modular-refined.glb`. Original GLBs remain untouched. Regenerate the refined copies with Blender 4.3 using `scripts/refine-nava.py` in background/factory-startup mode.

Changes: small manufactured edge bevels, matte polymer front shell, satin lower housing, polished chrome controls/bezels/dock hardware, microphone grille geometry, and independent microphone/contact light rings. Runtime material treatment adds fine matte grain and subtle thin-film color on chrome.

Callout lighting uses the same timeline envelope as annotations. Microphone emission follows the hardware explanation; contact emission also follows necklace explanations. The emissive rings and contact surfaces return to zero emission outside their sections. This is a visual presentation effect, not a claim that the hardware ships with illuminated magnets.

Validation: production build/TypeScript passed, targeted material/highlight lint passed, all 19 tests passed. Tests cover original and refined docking markers, distinct surface properties, viewport fit, highlight timing and reverse scrolling. Desktop (1840×980) and mobile (390×844) WebGL screenshots were inspected during the microphone, magnet and necklace callouts. No browser runtime errors were observed.

Asset sizes: wrist 536,600 bytes; modular 683,408 bytes. No external texture downloads are needed.
