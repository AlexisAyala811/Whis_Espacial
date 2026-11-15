# Scenario models and physical materials

## Scope
Improve equipment and surfaces in the seven training rooms and Mars habitats without changing the mission, doors, Wali, underwater exclusion, input, or English UI. Use local files and maintain a working scene if a model fails to load.

## Changes
- Replace the two preparation mannequins at Medium and above with an optimized CC0 astronaut model. Low retains the original mannequin; it is also the fallback if loading fails. The static model is AI-assisted, as disclosed by its creator, and does not represent a NASA-issued suit.
- Add CC0 luminaires to preparation, gym, control, training habitat, and cabin. Add tool carts to preparation, gym and vehicle assembly and medical boxes to the training and Mars habitats. These additions are decorative and stay out of the central route.
- Add ambientCG normal and roughness maps to metal materials in the training rooms and Mars habitat. Add fabric normal and roughness maps to the existing articulated astronaut gloves.
- Preserve quality levels, interactions, motion preferences, and teardown of asynchronously loaded room assets.

## Limits
The first-person hands remain the procedural articulated rig. The NASA astronaut glove was evaluated but not integrated because it has no finger rig and its geometry is too simple for the desired close-up. Other architecture, seats, devices and some outdoor elements remain procedural; this is not a fully photorealistic scene conversion.

## Sources
- https://grab3d.com/models/characters/astronaut-in-spacesuit/ (CC0; AI-assisted origin; license alongside the model).
- https://polyhaven.com/license (CC0; individual model credits alongside files).
- https://ambientcg.com/view?id=Fabric034 and https://ambientcg.com/view?id=Metal032 (CC0).

## Verification (2026-11-15)
- 43 automated project tests passed.
- Browser checks covered all seven training rooms, the Mars exterior and habitat, Wali, underwater exclusion, mission interaction, graphics profiles, context recovery, new asset loading, and the astronaut-model failure fallback.
- Edge 157 / ANGLE / NVIDIA RTX 5060 Laptop, 1920x1080, DPR 1, High, standing still: p95 7.5 ms for 60 seconds after 10 seconds warm-up, with approximately 886,000 triangles. This synthetic sample does not guarantee frame rates on other devices or while moving. Low avoids drawing the detailed suits.
