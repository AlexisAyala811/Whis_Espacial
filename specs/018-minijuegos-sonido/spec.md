# Interactive training and scene audio

## Scope and acceptance
Retain the existing mission rules, scene order and English interface while providing clearer and more interactive exercises. EVA supports dragging or button/keyboard connection and shows per-line status. Habitat resources have accessible meters and controls. Power switch previews use the same neighbor rules as the puzzle. The Mars outpost previews a selected action without mutating state, then requires confirmation. Suit progress, physical exercise and alert feedback are visible.

Provide quiet locally synthesized ambience by scene and brief feedback cues, with no voice, external sound files, microphone, or network transmission. Audio starts only after a user gesture; users can mute or adjust volume, and the preference persists between scenes. Ambience fades on pause and in hidden tabs. Preserve reduced-motion behavior and keyboard alternatives.

## Verification
- Browser flow completed suit feedback, incorrect and correct mental response, EVA drag plus keyboard, habitat adjustments, power puzzle, preview and all five sols, and sound preference across Mars pages.
- Real browser AudioContext started after a gesture; mute and pause were checked at desktop and mobile widths. Sound settings also have unit tests using a fake audio context.
- Automated tests cover power preview versus the actual switches, non-mutating outpost forecasts versus the resulting decision, and audio activation/mute/pause. Full project suite passed.
- RTX 5060 Laptop, Edge 157, High, 1920x1080 DPR 1, standing still: p95 18.2 ms over 10 seconds after 3 seconds warm-up. This short synthetic sample does not establish performance during gameplay or on other devices.
