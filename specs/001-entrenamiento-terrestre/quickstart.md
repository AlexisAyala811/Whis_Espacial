# Quickstart de validación: Entrenamiento terrestre

Esta guía se ejecutará cuando la implementación de la demo esté completa. Su objetivo
es comprobar el flujo desde el navegador, la simulación y la voz.

## Prerrequisitos

- Node.js 22 LTS o superior.
- Navegador de escritorio con WebGL, teclado, ratón y micrófono.
- Acceso opcional a Gemini Live API para las pruebas de voz.
- Variables de entorno del servicio local, configuradas fuera del repositorio:
  `GEMINI_API_KEY`, `GEMINI_LIVE_MODEL` y `ALLOWED_ORIGIN`.

## Instalación y arranque

```powershell
npm ci
node server/index.js
```

Abrir `http://127.0.0.1:8000/` en el navegador. El servicio debe servir la página, los
módulos de Three.js y el endpoint local de token en el mismo origen.

## Validación de historia P1

1. Seleccionar entrenamiento físico.
2. Iniciar sesión y confirmar la primera estación.
3. Verificar que el reloj, carga, fatiga y saturación simulada cambian con pasos fijos.
4. Omitir deliberadamente una alarma y comprobar que el entorno continúa y registra la
   consecuencia.
5. Completar recuperación y cerrar la sesión.
6. Comprobar que el informe muestra decisiones, incidentes y resultado.

Resultado esperado: la historia se puede completar sin recargar la página y el informe
identifica todas las decisiones de la sesión.

## Validación de historia P2

1. Seleccionar evaluación mental.
2. Esperar la activación de dos avisos concurrentes.
3. Resolverlos mediante el checklist usando teclado y ratón.
4. Repetir con una acción incorrecta y verificar que aparece una recuperación válida.

Resultado esperado: el tiempo no se congela, la prioridad queda registrada y el resultado
de la decisión es visible en telemetría y en el informe.

## Validación de historia P3

1. Conectar el micrófono y habilitar voz.
2. Preguntar a LUMINE por un parámetro visible y solicitar que repita una instrucción.
3. Interrumpir una respuesta hablando de nuevo y comprobar que se descarta el audio
   pendiente.
4. Revocar el permiso del micrófono o detener el servicio de token.
5. Completar el mismo checklist escribiendo la consulta y usando los controles del panel.

Resultado esperado: la simulación mantiene el estado en ambos modos y el informe marca
la degradación de voz como incidente recuperable.

## Verificación automatizada

```powershell
npm test
npm audit --omit=dev
```

Las pruebas unitarias deben verificar que una semilla y una secuencia de entradas iguales
producen el mismo estado. Las pruebas de contrato deben validar el JSON de sesión con
`contracts/session-state.schema.json`.

## Verificación de accesibilidad y rendimiento

- Completar las historias P1 y P2 solo con teclado.
- Confirmar foco visible, nombres accesibles y texto equivalente a las alertas sonoras.
- Activar `prefers-reduced-motion` y comprobar que no se pierde información.
- Ejecutar una escena representativa a 1920 × 1080 CSS y DPR 1 después de 10 segundos de
  calentamiento. Registrar una sesión de 60 segundos y adjuntar la captura del percentil
  95 del intervalo entre fotogramas.
- Simular pérdida de contexto WebGL y verificar que el DOM informa la indisponibilidad.
