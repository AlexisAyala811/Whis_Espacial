# Equipment and hands visual improvement

## Scope
Improve the existing interactive training rooms and Mars habitat while preserving the route, interactions, English UI, Wali behavior, accessibility and graphics profiles. The pool remains without Wali. Models are decorative and must not block movement or mission interactions.

## Implementation
- More dimensional consoles with raised keycaps, screen frames and indicator lights.
- Padded office chairs, wheels, armrests and a central support in mission control.
- CC0 glTF plant models in the HERA training habitat and Mars habitat, with a simple fallback if unavailable.
- A CC0 glTF portable computer in mission control.
- Additional shadowless area lighting and details on the existing articulated suit gloves.
- Dispose late-loading resources when a training scene is left; retain existing collisions and exercise mechanics.

## Verification
Run automated tests, exercise all seven rooms and Mars habitat in a browser, check the underwater exception and graphic profiles, and measure performance on available hardware. New glTF resources and their provenance are listed in their CREDITS.md files. Rendering remains stylized; full photorealism requires additional purpose-built, optimized and licensed assets.

## Results (2026-11-15)
- 43 automated tests passed.
- Browser checks covered the seven training rooms, Mars, the Mars habitat, Wali behavior, the underwater exclusion, graphic quality changes, mission interaction and WebGL recovery.
- Edge 157 with ANGLE on NVIDIA RTX 5060 Laptop, 1920x1080 DPR 1, High preset: suit room p95 12.1 ms across 60 seconds after 10 seconds warm-up; training habitat p95 12.0 ms across 10 seconds after 3 seconds warm-up. Both tests are stationary synthetic samples and are not a guarantee of performance on other devices or during play. Research habitat rendered approximately 480,000 triangles.
- External models were loaded from local project files, and their source/license is recorded beside each asset.
