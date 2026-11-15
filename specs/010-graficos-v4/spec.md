# Specification: visual upgrade V4

## User scenarios
- A player can select Low, Medium, High or Ultra using a keyboard-accessible control, retain the selection between scenes, and continue the mission without losing progress.
- The seven training rooms, Mars surface and habitat keep their existing routes, tasks, HUD, Wali behavior and English text while receiving progressively improved 3D lighting, materials and details.
- Player arms and Wali remain usable, legible and respectful of reduced-motion settings; the NBL keeps Wali absent.
- The user receives a DOM message if WebGL is lost; a reload is an available recovery path.

## Acceptance criteria
- Profiles change rendering resolution and shadow settings; quality-dependent features are actually connected to the active renderer and unsupported settings are not advertised.
- Existing mission and educational tests pass, and a browser run covers scene changes, interactions, quality changes and WebGL fallback.
- Visual upgrades use real 3D geometry, compatible PBR assets where licensed, and documented provenance and fallback; no full-room image substitution.
- The fixed reference run is Earth suit preparation, Edge with RTX 5060, 1920×1080 CSS, DPR 1; compare 10 s warm-up + 60 s sampling. Baseline p95 6.3 ms, median 6.1 ms, 174 draw calls, 36,982 triangles, player stationary. Headless results do not represent other devices or active gameplay.
- Record actual results and remaining gaps; no photorealism or rigged-animation claims without evidence.
