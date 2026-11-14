# Implementation Plan: Entrenamiento terrestre físico y mental

**Branch**: `001-entrenamiento-terrestre` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-entrenamiento-terrestre/spec.md`

## Summary

La demo será una sesión de entrenamiento terrestre de 10 a 20 minutos con una escena 3D
de la base, dos actividades jugables y una IA de voz táctica llamada LUMINE. El núcleo de
la simulación ejecutará reglas deterministas en pasos fijos y expondrá un estado serializable
para la interfaz. La voz usará Gemini Live API con audio bidireccional y tokens efímeros
emitidos por un servicio local, de modo que la clave permanente no llegue al navegador.

## Technical Context

**Language/Version**: JavaScript ES modules, Node.js 22 LTS o superior compatible con `node --test`

**Primary Dependencies**: Three.js 0.187.0, `@google/genai` fijado en `package-lock.json` para Live API

**Storage**: Estado de sesión en memoria y último informe en `localStorage`. Sin base de datos para la demo.

**Testing**: `node --test` para el núcleo, pruebas de contrato JSON y comprobación manual de navegador para voz, foco, consola y WebGL.

**Target Platform**: Navegador de escritorio con WebGL y micrófono, servido por HTTP local en desarrollo y HTTPS en publicación.

**Project Type**: Aplicación web estática con un servicio Node.js mínimo para servir archivos y emitir tokens efímeros.

**Performance Goals**: Percentil 95 del intervalo entre fotogramas de 33,3 ms o menos a 1920 × 1080 CSS y DPR 1 en la escena de entrenamiento, tras 10 segundos de calentamiento.

**Constraints**: Simulación a paso fijo de 50 ms, tiempo continuo durante decisiones, alternativa textual sin voz, WCAG 2.2 AA para controles DOM, ningún secreto en el cliente, `npm ci` reproducible.

**Scale/Scope**: Una sesión local por navegador, dos estaciones conectadas, una escena 3D, una conversación activa por sesión y hasta 20 minutos de demo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Comprobación inicial | Decisión del plan |
|---|---|---|
| Simulación separada de presentación | Cumple | El núcleo no importa DOM, Three.js, audio ni red. Usa pasos fijos y semilla registrada. |
| Calidad comprobable | Cumple | Cada historia tendrá pruebas unitarias, contratos y una guía de validación de navegador. |
| Interfaz accesible | Cumple | Checklists y telemetría estarán en DOM semántico, con teclado, foco visible y texto equivalente. |
| Rendimiento y recuperación gráfica | Cumple con medición pendiente | Se fija la escena, hardware y navegador en la guía. Se libera la escena y se informa la pérdida de WebGL. |
| Seguridad y dependencias reproducibles | Cumple con servicio justificado | El servicio local emite tokens efímeros. La clave permanente vive en variables de entorno y se revisa `npm audit --omit=dev`. |

No se identifican violaciones que requieran una excepción constitucional.

## Phase 0: Research Decisions

Las decisiones y fuentes están registradas en [research.md](research.md). La integración
seleccionada es Gemini Live API con WebSocket y token efímero. El cliente envía audio PCM
de 16 kHz y recibe audio PCM de 24 kHz. El prompt de LUMINE se pasa como instrucción de
sesión y la lógica de fases permanece en el núcleo determinista.

## Phase 1: Design

Los artefactos de diseño son [data-model.md](data-model.md), [contracts/](contracts/) y
[quickstart.md](quickstart.md). El modelo contiene la sesión, estaciones, eventos,
checklists, telemetría, intercambios de voz e informe.

## Project Structure

### Documentation (this feature)

```text
specs/001-entrenamiento-terrestre/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── live-voice.md
│   └── session-state.schema.json
├── checklists/requirements.md
└── tasks.md                 # Fase /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── simulation.js
│   ├── mission-state.js
│   ├── training-scenarios.js
│   ├── checklist-engine.js
│   ├── telemetry.js
│   └── voice-policy.js
├── rendering/
│   ├── scene.js
│   └── renderer.js
├── ui/
│   ├── app.js
│   ├── checklist-panel.js
│   ├── telemetry-panel.js
│   └── voice-panel.js
├── audio/
│   ├── microphone.js
│   └── pcm-player.js
└── main.js

server/
├── index.js
└── gemini-token.js

tests/
├── unit/
│   ├── simulation.test.js
│   ├── checklist-engine.test.js
│   └── voice-policy.test.js
└── contract/
    └── session-state.test.js
```

**Structure Decision**: Se adopta una aplicación web única con un núcleo de simulación
independiente, una presentación Three.js separada, paneles DOM accesibles, audio aislado
y un servicio Node mínimo. La separación evita que las pruebas del juego dependan de GPU,
DOM, micrófono o red.

## Constitution Check After Design

| Principio | Resultado | Evidencia de diseño |
|---|---|---|
| Simulación separada de presentación | PASS | `src/core/` no depende de browser APIs. La escena consume snapshots del estado. |
| Calidad comprobable | PASS | `tests/unit/`, `tests/contract/` y `quickstart.md` cubren reglas, contratos e integración. |
| Interfaz accesible | PASS | `src/ui/` usa controles DOM con texto, foco, teclado y `prefers-reduced-motion`. |
| Rendimiento y recuperación gráfica | PASS | `renderer.js` administra DPR, resize, limpieza y estado de contexto WebGL. |
| Seguridad y dependencias reproducibles | PASS | `server/gemini-token.js` limita tokens efímeros y nunca expone la clave permanente. |

No se requieren excepciones.

## Complexity Tracking

No hay violaciones constitucionales. El servicio Node separado se justifica por la
emisión segura de tokens efímeros para una API de voz desde el navegador.
