# Research: Entrenamiento terrestre físico y mental

**Fecha**: 2026-11-14

## Decisión 1: Gemini Live API para la conversación de voz

**Decision**: Usar Gemini Live API por WebSocket para una sesión bidireccional de audio.
El navegador enviará audio PCM mono de 16 kHz y reproducirá audio PCM de 24 kHz. La
sesión también recibirá transcripciones para mostrar la conversación en el panel.

**Rationale**: La demo necesita conversación voz a voz con interrupciones, baja latencia
y contexto de fase. Live API expone entrada y salida de audio en una sesión persistente,
además de entrada de texto para la alternativa sin micrófono.

**Alternatives considered**:

- Cadena independiente de reconocimiento de voz, modelo de texto y síntesis de voz. Tiene
  más componentes y mayor latencia para la primera demo.
- Voz simulada local. Sirve para pruebas sin red, pero no cumple la conversación externa
  solicitada. Se conserva como adaptador de pruebas y fallback textual.

## Decisión 2: Tokens efímeros desde un servicio local

**Decision**: El servicio Node solicitará un token efímero a Google usando una variable de
entorno privada y el cliente lo usará para abrir el WebSocket. El token tendrá duración y
restricciones de sesión, y nunca se incluirá la clave permanente en archivos públicos.

**Rationale**: Una aplicación de navegador no puede proteger una API key permanente. El
token efímero limita la exposición y permite que el audio vaya directamente del navegador
a Live API con menor latencia.

**Alternatives considered**:

- Enviar la API key al navegador. Rechazado por el principio de seguridad de la Constitución.
- Proxy de audio completo en el servidor. Protege la clave, pero aumenta complejidad y
  latencia para una demo local.

## Decisión 3: Política de LUMINE separada de las reglas del simulador

**Decision**: El prompt define identidad, tono, idioma, formato hablado y prioridades de
respuesta. El núcleo del juego decide la fase, telemetría, acciones válidas, consecuencias
y transición de estados. Antes de cada respuesta se envía a LUMINE un contexto mínimo y
estructurado, sin permitir que la voz cambie directamente las reglas.

**Rationale**: El personaje necesita inmersión, pero las decisiones de la simulación deben
ser deterministas, comprobables y resistentes a respuestas ambiguas del modelo.

**Alternatives considered**:

- Permitir que LUMINE modifique libremente el estado. Rechazado porque hace la partida no
  reproducible y dificulta las pruebas.
- Usar solo texto preescrito. Rechazado porque elimina la conversación contextual solicitada.

## Decisión 4: Sesión de audio limitada y recuperable

**Decision**: La sesión mostrará su estado de conexión, gestionará interrupciones del
usuario, descartará audio pendiente cuando el modelo sea interrumpido y conservará el
último identificador de reanudación. El entrenamiento seguirá funcionando en modo texto
si la sesión se desconecta.

**Rationale**: Las sesiones de voz tienen límites de duración y pueden cerrarse. La demo
debe conservar el estado de la misión aunque falle la red o expire el token.

**Alternatives considered**:

- Reiniciar toda la partida al perder voz. Rechazado porque contradice el flujo continuo.
- Mantener audio ilimitado sin compresión ni reanudación. Rechazado por los límites de sesión.

## Decisión 5: Simulación determinista a 20 Hz

**Decision**: El núcleo avanza en pasos fijos de 50 ms. Cada evento usa una semilla de
sesión y entradas normalizadas. La vista puede renderizar a una frecuencia distinta, pero
solo consume snapshots del núcleo.

**Rationale**: Permite reproducir una sesión, probar consecuencias y medir rendimiento
sin mezclar el reloj de renderizado con el de las reglas.

**Alternatives considered**:

- Actualizar reglas con el tiempo variable de cada fotograma. Rechazado por variaciones de
  hardware y resultados no reproducibles.
- Simular a 60 Hz desde el inicio. Rechazado porque aumenta trabajo de reglas sin aportar
  valor a los eventos de checklist de la primera demo.

## Fuentes consultadas

- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [Tokens efímeros para Live API](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens)
- [Buenas prácticas de Live API](https://ai.google.dev/gemini-api/docs/live-api/best-practices)
- [SDK JavaScript de Google Gen AI](https://github.com/googleapis/js-genai)

La consulta de Context7 resolvió el SDK JavaScript de Google Gen AI. La consulta detallada
de documentación no devolvió contenido en el entorno, por lo que se contrastaron las
decisiones con la documentación oficial de Google enlazada arriba.

## Decisión 6: Referencias de producto y arquitectura

**Decision**: Tomar [Lunar Habitat ACT](https://lunaract.space/) como referencia de
presentación técnica y [GENIE](https://github.com/XiRoSe/genie-engine) como referencia
de organización de un proyecto Three.js, sin copiar código, textos, imágenes ni identidad
visual de terceros.

**Patrones adoptados para Lunar Command 3D**:

- De Lunar Habitat ACT: narrar la base como un sistema operativo de supervivencia,
  exponer métricas verificables, presentar subsistemas con contexto y convertir la
  escena 3D en un explorador de decisiones, no en un fondo decorativo.
- De GENIE: mantener límites explícitos entre motor genérico, contenido de escenario y
  ejecución del juego; mover el balance y los niveles a datos; y conservar verificaciones
  reproducibles en navegador y pruebas automatizadas.

**Aplicación en esta demo**: `src/core/` contiene reglas deterministas y datos de
escenario, `src/rendering/` contiene la escena Three.js, la interfaz accesible se sirve
desde `index.html`/`src/main.js`, y `server/` se limita al servicio local de tokens. Las
referencias quedan documentadas para orientar futuras iteraciones de módulos, no como
dependencias runtime.

## Decisión 7: Mantener la instalación oficial de GitHub Spec Kit

**Decision**: Conservar la estructura oficial de [GitHub Spec Kit](https://github.com/github/spec-kit)
para Claude Code: Constitución por proyecto y artefactos de cada feature bajo `specs/`,
sin introducir comandos o carpetas propietarias que desplacen `.specify/` o `.claude/`.

**Aplicación**: esta feature ya completó Constitution, Specify, Plan, Tasks e Implement.
Las siguientes iteraciones deben actualizar los artefactos existentes y ejecutar las
verificaciones correspondientes antes de declarar convergencia; no se generarán fases
paralelas fuera del flujo documentado.
