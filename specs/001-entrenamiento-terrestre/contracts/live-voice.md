# Contrato de voz de LUMINE

## Roles

- `browser`: captura audio, envía consultas, reproduce audio y muestra transcripciones.
- `token-service`: autentica el navegador con la aplicación y solicita un token efímero.
- `gemini-live`: mantiene la conversación de audio por WebSocket.
- `simulation-core`: fuente de verdad de fase, telemetría, acciones y consecuencias.

## Token efímero

`GET /api/live-token`

Respuesta nominal:

```json
{
  "token": "ephemeral-token",
  "expiresAt": "2026-11-14T18:00:00.000Z",
  "model": "gemini-3.8-live"
}
```

La respuesta no incluye la API key permanente. El servicio debe rechazar solicitudes sin
origen permitido, no registrar el token y responder con un error JSON sin secretos.

## Configuración de sesión

La aplicación crea una sesión Live con modalidad de respuesta `AUDIO`, idioma español y
la política de LUMINE. La configuración incluye el contexto de misión actual, que solo
contiene valores de telemetría necesarios para la respuesta.

La instrucción de sistema debe incluir estas reglas:

1. Identidad `LUMINE`, nombre técnico `A.R.E.S.` y ficción inspirada en NASA.
2. Respuestas en español, limpias, directas y orientadas a la acción.
3. Voz nominal con empatía y humor seco sutil. Voz de contingencia sin humor, con frases
   cortas y datos precisos.
4. No usar Markdown complejo ni LaTeX en la salida hablada.
5. No cambiar estados del simulador sin una acción explícita confirmada por el usuario.
6. Usar el bloque de telemetría para decisiones relevantes.

## Entrada

- Audio de micrófono como PCM 16-bit, mono, 16 kHz, enviado en fragmentos pequeños.
- Texto como alternativa cuando el micrófono o Live API no están disponibles.
- Contexto de misión enviado como texto estructurado al cambiar de fase, alarma o acción.

## Salida

- Audio PCM 16-bit, mono, 24 kHz para reproducción.
- Transcripción de entrada y salida para el panel accesible.
- Evento de interrupción que obliga a descartar el búfer de audio pendiente.
- Evento de finalización de generación para cerrar el estado de respuesta.

## Degradación

Si el token expira, el WebSocket se cierra o el navegador bloquea el micrófono:

1. La sesión de simulación continúa con su reloj y reglas.
2. El panel marca la voz como `unavailable` o `reconnecting`.
3. Se habilita entrada escrita y respuesta visible.
4. El informe registra el incidente y no lo convierte en fallo de misión.
