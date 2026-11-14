# Tasks: Entrenamiento terrestre físico y mental

**Input**: Design documents from `/specs/001-entrenamiento-terrestre/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the Constitution requires deterministic unit tests, contract checks and browser verification for integration changes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar la estructura ejecutable de la demo sin introducir secretos.

- [ ] T001 Add `test` and `start` scripts to `package.json` for `node --test` and `node server/index.js`.
- [ ] T002 [P] Create the planned source directories `src/core/`, `src/rendering/`, `src/ui/`, `src/audio/`, `server/` and test directories `tests/unit/`, `tests/contract/`.
- [ ] T003 [P] Add `.env.example` with placeholder names only for `GEMINI_API_KEY`, `GEMINI_LIVE_MODEL` and `ALLOWED_ORIGIN`, and document that real values stay outside Git in `.env.example`.
- [ ] T004 [P] Add the pinned `@google/genai` dependency to `package.json` and refresh `package-lock.json` with `npm install --save-exact`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear el núcleo determinista, el contrato de estado, el servidor seguro y el shell accesible que bloquean las historias.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 [P] Write the session state contract test in `tests/contract/session-state.test.js` against `specs/001-entrenamiento-terrestre/contracts/session-state.schema.json`.
- [ ] T006 [P] Write fixed-step reproducibility tests in `tests/unit/simulation.test.js` covering a 50 ms step, same seed and same inputs producing the same snapshot.
- [ ] T007 [P] Implement the serializable session entities and transitions in `src/core/mission-state.js` using the exact enums and non-negative constraints from `data-model.md`.
- [ ] T008 Implement the fixed-step clock, seeded event stream and snapshot publication in `src/core/simulation.js` with a 50 ms simulation step independent of rendering.
- [ ] T009 [P] Write checklist ordering and confirmation tests in `tests/unit/checklist-engine.test.js`, including rejection of an out-of-order required step.
- [ ] T010 Implement checklist validation and event recording in `src/core/checklist-engine.js` with `pending`, `active`, `complete` and `blocked` states.
- [ ] T011 [P] Write telemetry transition tests in `tests/unit/telemetry.test.js` for `nominal`, `caution`, `warning` and `alert`.
- [ ] T012 Implement telemetry calculation and trend snapshots in `src/core/telemetry.js` without importing DOM, Three.js, audio or network APIs.
- [ ] T013 [P] Write voice-policy tests in `tests/unit/voice-policy.test.js` for nominal tone, contingency tone, Spanish output and no Markdown or LaTeX in spoken text.
- [ ] T014 Implement the versioned LUMINE policy and structured mission context in `src/core/voice-policy.js`, keeping policy output separate from state transitions.
- [ ] T015 [P] Write token endpoint contract checks in `tests/contract/live-voice.test.js` for success, missing credentials and disallowed origin.
- [ ] T016 Implement static serving and the `GET /api/live-token` endpoint in `server/index.js` and `server/gemini-token.js`, keeping the permanent key server-side and returning sanitized JSON errors.
- [ ] T017 Build the accessible application shell in `index.html`, `src/ui/app.js` and `src/styles.css` with semantic landmarks, visible focus, status text and reduced-motion handling.
- [ ] T018 Implement the Three.js scene lifecycle in `src/rendering/scene.js` and `src/rendering/renderer.js`, including resize, resource disposal and DOM reporting for WebGL context loss.

**Checkpoint**: Foundation ready. The deterministic core, accessible shell, local server and rendering lifecycle can be tested without any user story-specific content.

---

## Phase 3: User Story 1 - Completar acondicionamiento físico (Priority: P1) 🎯 MVP

**Goal**: Entregar la primera sesión jugable con estaciones ARED y T2, telemetría fisiológica simulada y recuperación ante fatiga.

**Independent Test**: Iniciar una sesión física, completar dos estaciones, omitir una alarma, recuperar el estado y obtener un informe sin cargar la historia mental ni la voz.

### Tests for User Story 1

- [ ] T019 [P] [US1] Write physical station tests in `tests/unit/physical-conditioning.test.js` for load, fatigue, heart rate, oxygen saturation and `recovery`/`unsafe` transitions.
- [ ] T020 [P] [US1] Write the P1 browser acceptance checklist in `tests/acceptance/physical-training.md` covering start, two stations, omission, recovery and final report.

### Implementation for User Story 1

- [ ] T021 [US1] Define ARED and T2 stations, limits, durations and recovery actions in `src/core/training-scenarios.js` without medical diagnosis claims.
- [ ] T022 [US1] Integrate physical station updates with `src/core/simulation.js`, `src/core/mission-state.js` and `src/core/telemetry.js` so the clock continues through decisions.
- [ ] T023 [P] [US1] Implement the physical checklist UI in `src/ui/checklist-panel.js` with keyboard navigation, confirmation state and accessible error text.
- [ ] T024 [P] [US1] Implement telemetry cards and alert text in `src/ui/telemetry-panel.js` for load, fatigue, heart rate and oxygen saturation.
- [ ] T025 [US1] Add the training-base scene composition in `src/rendering/scene.js` and connect station selection from `src/ui/app.js`.
- [ ] T026 [US1] Implement report creation and local persistence in `src/core/report.js` and `src/ui/app.js`, including all decisions, omissions and incidents.

**Checkpoint**: User Story 1 is independently playable and is the suggested MVP demo.

---

## Phase 4: User Story 2 - Resolver evaluación mental bajo presión (Priority: P2)

**Goal**: Añadir una evaluación mental con dos avisos concurrentes, prioridades, ventana temporal y recuperación.

**Independent Test**: Ejecutar la evaluación mental sin la estación física, resolver un aviso nominal y uno incorrecto, y obtener un resultado trazable.

### Tests for User Story 2

- [ ] T027 [P] [US2] Write concurrent mental-event tests in `tests/unit/mental-readiness.test.js` for priority ordering, response windows and recoverable versus fatal outcomes.
- [ ] T028 [P] [US2] Write the P2 browser acceptance checklist in `tests/acceptance/mental-readiness.md` covering simultaneous alerts, keyboard flow and recovery.

### Implementation for User Story 2

- [ ] T029 [US2] Define mental-readiness events, valid actions, priorities and consequences in `src/core/training-scenarios.js` using the `Event` constraints from `data-model.md`.
- [ ] T030 [US2] Integrate concurrent event scheduling and response windows in `src/core/simulation.js` and record outcomes in `src/core/mission-state.js`.
- [ ] T031 [P] [US2] Add priority, timer and recovery presentation to `src/ui/checklist-panel.js` and `src/ui/telemetry-panel.js` without removing the physical flow.
- [ ] T032 [US2] Connect the mental scenario selector and result report in `src/ui/app.js` and `src/core/report.js`.

**Checkpoint**: User Stories 1 and 2 both run independently from the same deterministic core.

---

## Phase 5: User Story 3 - Consultar y responder a LUMINE (Priority: P3)

**Goal**: Añadir voz bidireccional contextual con alternativa textual, interrupciones y estado de conexión.

**Independent Test**: Preguntar por telemetría, recibir una respuesta asociada a la fase, interrumpirla y completar el mismo checklist en modo texto cuando la voz no esté disponible.

### Tests for User Story 3

- [ ] T033 [P] [US3] Extend `tests/contract/live-voice.test.js` for session configuration, Spanish instructions, telemetry context and sanitized token responses.
- [ ] T034 [P] [US3] Write voice fallback tests in `tests/unit/voice-client.test.js` for denied microphone, expired token, interruption and text-only completion.
- [ ] T035 [P] [US3] Write the P3 browser acceptance checklist in `tests/acceptance/voice.md` covering connection, query, repeat, interruption and fallback.

### Implementation for User Story 3

- [ ] T036 [US3] Implement microphone capture and 16 kHz PCM chunking in `src/audio/microphone.js`, including permission errors and clean shutdown.
- [ ] T037 [US3] Implement 24 kHz PCM playback and interruption buffer disposal in `src/audio/pcm-player.js`.
- [ ] T038 [US3] Implement the browser Live API client in `src/audio/voice-client.js` using the token endpoint and the `contracts/live-voice.md` lifecycle.
- [ ] T039 [US3] Implement the LUMINE conversation panel, text fallback, connection state and visible transcriptions in `src/ui/voice-panel.js`.
- [ ] T040 [US3] Inject the current mission context and voice-policy output from `src/core/voice-policy.js` into `src/audio/voice-client.js` without allowing voice responses to mutate state directly.
- [ ] T041 [US3] Connect voice confirmations to checklist actions in `src/ui/app.js`, requiring explicit user acceptance before recording a simulator action.

**Checkpoint**: All three stories are independently demonstrable, with voice degradation preserving the simulation state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar calidad, seguridad, rendimiento, accesibilidad y documentación.

- [ ] T042 [P] Add an end-to-end browser validation script and expected results to `tests/acceptance/quickstart.md` based on `specs/001-entrenamiento-terrestre/quickstart.md`.
- [ ] T043 [P] Run keyboard, focus, accessible-name and reduced-motion verification and record evidence in `tests/acceptance/accessibility.md`.
- [ ] T044 [P] Add the 1920 × 1080 CSS, DPR 1, 10-second warm-up and 60-second p95 frame interval measurement procedure to `tests/acceptance/performance.md`.
- [ ] T045 [P] Add WebGL context-loss and resource-disposal checks to `tests/unit/renderer-lifecycle.test.js` and document browser evidence in `tests/acceptance/webgl-recovery.md`.
- [ ] T046 [P] Run `npm audit --omit=dev`, inspect the lockfile and document any high or critical finding in `specs/001-entrenamiento-terrestre/quickstart.md`.
- [ ] T047 Update `README.md` with local setup, environment variables, voice fallback, fictional NASA framing and the current demo scope.
- [ ] T048 Run the complete `quickstart.md`, `node --test`, browser checks and `git diff --check`, then attach results to the release commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational. It may reuse US1 report and UI modules, but must remain independently playable.
- **User Story 3 (Phase 5)**: Depends on Foundational and can be developed independently against the voice contracts. Final integration connects it to US1 and US2.
- **Polish (Phase 6)**: Depends on the stories selected for the demo.

### User Story Dependencies

- **US1** has no dependency on another story after Phase 2.
- **US2** has no runtime dependency on US1, but shares the deterministic core and report format.
- **US3** has no runtime dependency on US1 or US2, but consumes their mission context and checklist actions during integration.

### Parallel Opportunities

- T002, T003 and T004 can run in parallel after Setup starts.
- T005, T006, T009, T011, T013 and T015 can run in parallel before their implementations.
- T023 and T024 can run in parallel after the physical scenario contract exists.
- T027 and T028 can run in parallel.
- T033, T034 and T035 can run in parallel.
- T042 through T046 can run in parallel after the corresponding stories are complete.

## Parallel Example: User Story 1

```text
Task: T019 Write physical station tests in tests/unit/physical-conditioning.test.js
Task: T020 Write the P1 browser acceptance checklist in tests/acceptance/physical-training.md
Task: T023 Implement the physical checklist UI in src/ui/checklist-panel.js
Task: T024 Implement telemetry cards in src/ui/telemetry-panel.js
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete User Story 1.
3. Validate the physical training loop independently.
4. Publish a playable browser demo before adding mental events or live voice.

### Incremental Delivery

1. Add User Story 2 and validate concurrent events without changing the physical loop.
2. Add User Story 3 with token service, audio adapters and text fallback.
3. Run the polish phase and publish the complete training demo.

### Notes

- Every task follows the required checklist format, has a sequential ID and names the file path it changes.
- `[P]` marks tasks that can run independently on different files.
- Commit after each logical group and keep the constitution, specification and plan commits separate from implementation commits.
