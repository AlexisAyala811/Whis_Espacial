# Iteración: base explorable en primera persona

Fecha: 2026-11-14. Cambio solicitado: aspecto e interacción tipo NightOps / GENIE.

La entrada activa es ahora src/field.js. El núcleo FieldTraining conserva las reglas
fuera de Three.js; field-scene.js controla cámara, colisiones y geometría procedural.
Los archivos anteriores se conservan como base del prototipo, pero no se cargan
desde index.html. La voz sigue aplazada.

Alcance verificable: caminar con WASD, mirar con ratón o flechas, no atravesar paredes
ni consolas, interactuar a menos de 3.1 metros, completar traje/ARED/ECLSS en orden,
penalizar entradas fuera de ritmo y prioridades incorrectas, obtener informe y reiniciar.
Esc o pérdida de foco pausan esta nueva ruta. Las pruebas largas de fisiología,
las alarmas concurrentes temporizadas y la campaña de ocho fases quedan pendientes
de integración; la nueva ruta breve no implica que esos requisitos estén terminados.

Referencia: https://github.com/XiRoSe/genie-engine
Se adopta la experiencia en primera persona; no se copiaron código ni activos externos.
