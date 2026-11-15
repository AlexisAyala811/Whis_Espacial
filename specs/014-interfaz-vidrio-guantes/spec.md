# Glass interface and astronaut glove refinement

## Scope
Use a restrained space-themed glass style across mission HUD, dialogs, Mars, habitat, outpost, source cards and Wali while retaining readable text, focus outlines, mission interactions and mobile layouts. Dialogs must not be obscured by Wali's thought bubble. Preserve the current English UI and existing browser saves.

Refine the first-person gloves in all 3D scenes with tighter wrist seals, small cloth folds and a natural finger resting pose. The prior user-provided NASA `Astronaut Glove.glb` (DigitalSpace Corporation) is a visual reference; it is static and is not incorporated into the project. The existing articulated hand rig remains and supports interaction and reduced motion.

## Verification
Check desktop and narrow viewports, dialog and Wali overlap, Wali restoration, mission controls, graphics profiles, reduced-motion mode, room transitions, Mars/habitat, WebGL recovery and automated tests. Capture a short GPU sample without implying it represents every device or gameplay situation.

## Results (2026-11-15)
- All 43 automated tests passed. Browser checks covered training rooms, Mars, habitat, outpost, Wali, task interaction, graphics quality, reduced motion, scene transitions and graphics-context recovery.
- At 1440x900 and 390x844 the pause card stayed within the viewport, Wali did not overlap it, and Wali returned after resuming. Buttons retained keyboard focus indicators.
- Edge 157 on NVIDIA RTX 5060 Laptop, High, 1920x1080 DPR 1: a stationary 10-second sample after 3 seconds warm-up recorded p95 11.3 ms. This short sample does not predict performance on other devices or during play.
