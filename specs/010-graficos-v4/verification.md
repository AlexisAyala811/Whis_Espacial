# Verification: visual upgrade V4

## Test environment
- Windows, Edge 157 headless, ANGLE Direct3D 11, NVIDIA GeForce RTX 5060 Laptop GPU.
- Suit preparation, stationary player, 1920×1080 CSS pixels, DPR 1. Ten seconds warm-up and 60 seconds sampled via requestAnimationFrame.
- Before: median 6.1 ms, p95 6.3 ms, 174 draw calls, 36,982 triangles.
- After, High profile and shadows enabled: median 11.9 ms, p95 12.3 ms, 245 draw calls, 49,370 triangles; no page errors. These are specific to this scene and setup; no claim for other GPUs, active movement or other rooms. Both p95 figures are below the constitution's 33.3 ms threshold, with a measurable rendering cost.
- The comparison image and original measurements are in `evidence/performance-comparison.png`, `evidence/before.json` and `evidence/after-high.json`.

## Verified
- `npm test`: 43/43 passed in the staged project.
- Four presets switch renderer pixel ratio and shadow settings, persist between Earth, Mars and habitat, and work through a native labelled select.
- In the selected scene, pressing E while the quality select has focus does not advance the mission. Suit checks remain functional and trigger a visible arm gesture.
- The pool caustic overlay is disabled on Low and enabled on High. Wali remains absent from NBL.
- The CC0 glTF loads and follows the detail setting; an intercepted failure leaves the existing procedural room usable. Intercepted PBR map failures use neutral maps and do not stop the scene.
- The WebGL loss alert appeared during a forced context loss and disappeared after restoration. Reduced motion and the original 3D navigation were checked in a browser.
- The first-person rig is procedural and jointed; it is not a skinned GLB. Walk/run/float and small interaction/inspection gestures are implemented. Accurate hand-to-object reaching, grab/sit gameplay and launch-seat animation remain future work.
- HDR environment maps, metal PBR maps, point/directional lighting and selected shadows improve the existing scenes without replacing them with static images. The pool effect approximates caustics; it is not water refraction.
- Four presets adjust resolution, selected shadow settings, filtering, distance and selected environmental detail. They do not implement texture-resolution streaming or post-processing.
- Wali has an improved shell, mechanical joints, emissive eyes and head movement; its prior autonomous following and text assistance remain.

## Limits
The game remains visually stylized, not photorealistic. It does not yet include high-fidelity skinned astronaut models, a production animation set, full scene-specific PBR asset replacement, physically accurate water, scene-wide LOD/texture compression, or a postprocessing pipeline. Keyboard focus and reduced motion were tested; a full assistive-technology audit was not performed.
