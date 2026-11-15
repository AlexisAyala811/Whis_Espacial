# Technical plan: visual upgrade V4

1. Centralize quality policy and persistent controls; connect it to the three active WebGL renderers without changing simulation state. Add safe context-loss feedback.
2. Improve PBR materials and environmental lighting within budgets. Add shadows selectively and verify collision/raycast behavior after scene changes. Test profile transitions without recreating scenes.
3. Upgrade first-person hands and Wali, using compatible licensed 3D models if available; otherwise use documented modular art as an interim solution. Animation states must follow actual game events and reduced-motion preferences.
4. Enrich the training rooms, Mars surface and habitat with contextual, reusable 3D detail; preserve routes, Wali exclusion in the pool, and all tasks.
5. Run unit and browser checks, compare fixed before/after performance, document remaining limitations and credits.

## Constitutional checks
Rules remain independent of Three.js; HTML controls use English and keyboard focus. Existing fixed-step requirement is not changed by this visual work. Use locally served pinned dependencies and no secrets. Verify GPU disposal/context loss, reduced motion and NASA fallback. Baseline is in the audit; no claim of a successful improvement without measurement.
