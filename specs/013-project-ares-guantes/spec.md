# Project Ares 3D: brand and astronaut gloves

## Intent
Rename the currently displayed product to Project Ares 3D throughout the interface and current project configuration. Keep existing browser storage keys so settings, reports and mission progress remain compatible. Historical specifications retain their original titles.

## Gloves
Replace the block-shaped palm and flat rectangular pad with a layered, rounded palm, separately shaped digits, finger pads, fabric seams, a positioned thumb and a wrist seal. Keep the existing independently articulated finger pivots, first-person placement, interaction gestures and reduced-motion behavior across training, Mars and the habitat.

Reference supplied by user: `Astronaut Glove.glb`, SHA-256 `E0EFBB818141BB7DFFC29EF0B4148E266ACA4FD407DF3FC36E010FD676069763`, matches https://science.nasa.gov/3d-resources/astronaut-glove/ (source DigitalSpace Corporation). It has one mesh and no skin or animation. Its shape and white protective material informed the procedural design; the actual GLB is not distributed or loaded by the game. This avoids losing independent finger animation.

## Acceptance
- Product name is consistent on the landing page, browser tabs, resource page, Mars pages, in-world signage, server log, current README, package metadata and constitution.
- Existing saved preferences and progress keys still work.
- Hands render and interaction gestures and reduced motion still work across scenes.
- Existing navigation, Wali behavior, and tests continue to pass.

## Results (2026-11-15)
- All 43 automated tests passed. Browser checks covered all training rooms, Mars and habitat, existing save keys, interaction gestures, Wali, quality profiles, reduced motion and missing-model/material fallbacks.
- Edge 157 on NVIDIA RTX 5060 Laptop, High at 1920x1080 and DPR 1: 10-second stationary sample after 3 seconds warm-up, p95 11.5 ms. This is a short synthetic test and does not guarantee performance during play or on other devices.
