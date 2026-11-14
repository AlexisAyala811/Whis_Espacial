# Data Model: Entrenamiento terrestre físico y mental

## Sesión de entrenamiento

Representa una visita jugable completa.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Identificador único de la sesión. |
| `seed` | integer | Semilla no negativa para reproducir eventos. |
| `phase` | enum | `ground-training` en esta demo. |
| `scenarioId` | enum | `physical-conditioning` o `mental-readiness`. |
| `status` | enum | `ready`, `active`, `paused-for-system`, `completed`, `failed`. |
| `missionTimeMs` | integer | Empieza en cero y solo avanza mientras la sesión está activa. |
| `activeChecklistId` | string/null | Checklist actualmente seleccionado. |
| `telemetry` | object | Snapshot de los parámetros actuales. |
| `voice` | object | Estado de conexión y reanudación de voz. |
| `events` | array | Eventos y decisiones ordenados por tiempo. |
| `lastReport` | object/null | Informe creado al completar o fallar. |

## Estación física

Actividad de acondicionamiento con una carga y un conjunto de límites simulados.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Identificador de la estación. |
| `name` | string | Nombre visible en español. |
| `durationMs` | integer | Duración objetivo positiva. |
| `load` | number | Carga normalizada entre 0 y 1. |
| `fatigue` | number | Valor entre 0 y 1. |
| `heartRate` | number | Latidos simulados por minuto, dentro del rango configurado. |
| `oxygenSaturation` | number | Porcentaje simulado entre 0 y 100. |
| `status` | enum | `pending`, `active`, `recovery`, `complete`, `unsafe`. |
| `limits` | object | Umbrales que producen aviso o condición insegura. |

La primera demo incluirá una estación de resistencia tipo ARED y una estación
cardiorrespiratoria tipo T2. Son representaciones de entrenamiento y no mediciones médicas.

## Evento mental

Aviso o decisión concurrente que evalúa priorización y memoria de procedimiento.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Identificador único dentro de la sesión. |
| `priority` | enum | `info`, `caution`, `warning`, `critical`. |
| `triggerAtMs` | integer | Tiempo relativo de activación. |
| `responseWindowMs` | integer | Ventana positiva para responder. |
| `prompt` | string | Instrucción visible y hablada. |
| `validActions` | array | Acciones permitidas por el escenario. |
| `selectedAction` | string/null | Acción elegida por el astronauta. |
| `outcome` | enum | `pending`, `nominal`, `degraded`, `recovered`, `fatal`. |

## Checklist

Secuencia ordenada de acciones que puede ser confirmada con teclado, ratón o voz.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Identificador estable. |
| `title` | string | Título visible. |
| `steps` | array | Al menos un paso ordenado. |
| `currentIndex` | integer | Índice del paso actual. |
| `allowOutOfOrder` | boolean | Falso para procedimientos críticos de la demo. |
| `status` | enum | `pending`, `active`, `complete`, `blocked`. |

Cada paso contiene `id`, `label`, `description`, `required`, `completedAtMs` y
`confirmationSource`. Una acción fuera de orden se registra y no se marca como completada.

## Telemetría

Lectura visible que contextualiza una decisión.

| Campo | Tipo | Reglas |
|---|---|---|
| `name` | string | Nombre estable del parámetro. |
| `value` | number/string | Valor normalizado y serializable. |
| `unit` | string | Unidad visible. |
| `status` | enum | `nominal`, `caution`, `warning`, `alert`. |
| `updatedAtMs` | integer | Tiempo de misión del snapshot. |
| `trend` | enum | `rising`, `falling`, `steady`. |

## Intercambio de voz

Registro de una consulta y su respuesta de LUMINE.

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Identificador del intercambio. |
| `source` | enum | `microphone`, `text`, `system`. |
| `inputText` | string | Transcripción o texto introducido. |
| `outputText` | string | Transcripción visible de la respuesta. |
| `outputAudioStatus` | enum | `pending`, `playing`, `interrupted`, `unavailable`, `complete`. |
| `phaseContext` | object | Fase, tiempo, estado y acción asociada. |
| `createdAtMs` | integer | Tiempo de misión del intercambio. |

## Informe de entrenamiento

Resultado trazable de una sesión.

| Campo | Tipo | Reglas |
|---|---|---|
| `result` | enum | `apt`, `conditional`, `not-apt`. |
| `score` | number | Entre 0 y 100. |
| `completedChecklists` | array | Checklists terminados. |
| `decisions` | array | Decisiones con tiempo y resultado. |
| `incidents` | array | Avisos, omisiones y recuperaciones. |
| `recommendations` | array | Recomendaciones narrativas y accionables. |
| `completedAt` | string | Fecha ISO de cierre. |

## Transiciones principales

```text
ready -> active
active -> active                 evento nominal o decisión en progreso
active -> recovery               procedimiento de recuperación iniciado
active -> completed              objetivos cumplidos
active -> failed                 consecuencia fatal o abandono
active -> paused-for-system      pérdida de WebGL o error recuperable de sesión
paused-for-system -> active      recuperación confirmada
```

La transición `active -> active` no implica pausa del reloj. Solo las transiciones de
recuperación de sistema pueden detener temporalmente la presentación, nunca una omisión
operacional de la historia.
