# Textured first-person forearms

Replace the simple sleeve with a compact textured forearm derived from the same CC0 Grab3D suit as the existing gloves. Keep both hands and forearms in the shared first-person rig across all seven rooms, Mars and the habitat; keep the procedural sleeve and wrist as an independent fallback if the model fails. Preserve motion, interaction, reduced-motion behavior, controls, and saved game state.

The original suit geometry and texture were AI-assisted according to the creator. The cropped forearm retains the original materials and was transformed for the first-person pose; see the asset credits and license. The model is fictional.

Acceptance: two forearms load in every 3D world; gloves and forearms each retain a visible fallback when their own model fails; the existing glove gesture and reduced-motion tests continue to pass; verify the result in the browser and run the full suite.

## Verification (2026-11-15)
- All 48 automated tests passed, including separate forearm and glove loading failures and reduced-motion handling.
- Browser checks passed for both textured forearms and gloves, interaction gesture, seven training rooms, Mars, habitat and glove fallback.
- Edge 157 / NVIDIA RTX 5060 Laptop, High, 1920x1080 DPR 1, stationary: p95 18.1 ms over 10 seconds after 3 seconds warm-up. This short sample does not represent all gameplay or devices; the previous wrist test was 12.6 ms under similar nominal settings. Measure during real play before making performance claims.
