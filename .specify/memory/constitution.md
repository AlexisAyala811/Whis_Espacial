<!--
Informe de impacto de sincronización
Versión: plantilla inicial → 1.0.0
Principios incorporados: arquitectura, calidad, accesibilidad, rendimiento y seguridad.
Secciones incorporadas: restricciones técnicas, flujo SDD y gobernanza.
Secciones eliminadas: ninguna. Plantillas de Spec Kit: se consultan en tiempo de ejecución.
Marcadores pendientes: ninguno.
-->
# Constitución de Project Ares 3D

## Principios fundamentales

### I. Simulación separada de la presentación

El cliente web DEBE usar HTML semántico, CSS y módulos JavaScript. Three.js DEBE quedar
en la capa de renderizado y el código de arranque. Las reglas y el estado de partida
DEBEN poder ejecutarse con Node.js sin DOM, GPU ni red. Cuando existan simulación y
renderizado, la simulación DEBE avanzar en pasos fijos y el renderizado DEBE consumir
su estado. Una prueba con entradas y semilla iguales DEBE reproducir el mismo estado
para la misma secuencia de pasos.

### II. Calidad comprobable

Cada cambio funcional DEBE vincular sus criterios de aceptación con pruebas o una
comprobación reproducible. Los cambios de reglas DEBEN incluir pruebas unitarias con
`node --test`. Las correcciones DEBEN incluir una prueba de regresión cuando el fallo
sea automatizable. Los cambios de integración DEBEN verificar en navegador la carga,
la consola y los flujos afectados. La documentación de revisión DEBE registrar los
comandos, el entorno y el resultado de las comprobaciones aplicables.

### III. Interfaz accesible

Los menús y controles DOM DEBEN cumplir WCAG 2.2 AA. Los flujos esenciales DEBEN poder
realizarse con teclado, con foco visible y sin trampas. Los estados esenciales DEBEN
tener texto accesible fuera del lienzo y ninguna señal crítica DEBE depender solo del
color o del sonido. Los efectos no esenciales DEBEN respetar `prefers-reduced-motion`.
Los cambios de interfaz DEBEN incluir comprobación manual de teclado, foco y lectura
de los estados esenciales con tecnología de asistencia.

### IV. Rendimiento y recuperación gráfica

Cuando exista una escena representativa, una sesión de 60 segundos tras 10 segundos
de calentamiento a 1920 × 1080 CSS y DPR 1 DEBE alcanzar un percentil 95 del intervalo
entre fotogramas de 33,3 ms o menos en el equipo de referencia. Antes de medir, se DEBEN
fijar el hardware, navegador y escena en el plan y adjuntar la captura de rendimiento
a cada cambio que afecte al renderizado. El cliente DEBE liberar recursos GPU al
retirar escenas y comunicar en el DOM la indisponibilidad o pérdida del contexto WebGL.

### V. Seguridad y dependencias reproducibles

Las dependencias de ejecución DEBEN fijarse en el archivo de bloqueo e instalarse
con `npm ci` para verificación. El cliente DEBE servir sus módulos desde el mismo
origen y usar HTTPS en producción. Se DEBEN validar los datos importados o persistidos
antes de usarlos, y representar texto externo mediante APIs de texto del DOM.
Los secretos DEBEN permanecer fuera del código cliente, Git y los artefactos.
Los cambios de dependencias DEBEN revisar el resultado de `npm audit --omit=dev`.
Una vulnerabilidad alta o crítica DEBE corregirse o recibir una excepción documentada.

## Restricciones técnicas

La base aprobada para esta fase es una página estática con módulos ES, CSS y Three.js
instalado mediante npm. El desarrollo DEBE usar un servidor HTTP local. La publicación
DEBE exponer los archivos necesarios para ejecutar el cliente, incluidos los módulos
de Three.js que utilice, desde el mismo origen. La incorporación de un servicio remoto
o un proceso de compilación DEBE justificarse en el plan respectivo.

## Flujo de trabajo SDD

- La fase actual concluye con esta Constitución y la estructura inicial.
- Con autorización para continuar, cada cambio funcional DEBE seguir la secuencia
  especificación → plan → tareas → implementación. Las plantillas instaladas por
  Spec Kit sirven de base de trabajo.
- El plan DEBE registrar cómo cumple cada principio aplicable y justificar las
  excepciones antes de implementar. Las tareas DEBEN incluir las pruebas pertinentes.
- Antes de integrar, la revisión DEBE contrastar el cambio con sus criterios de
  aceptación y adjuntar los resultados de pruebas y verificaciones aplicables.

## Gobernanza

Esta Constitución rige las decisiones técnicas y la revisión del proyecto.
Toda enmienda DEBE describir su impacto, los documentos afectados, la migración cuando
proceda y la aprobación de la persona responsable del proyecto.
Una excepción DEBE contar con aprobación previa y registrar motivo, alcance,
mitigación, responsable y fecha de revisión. El versionado DEBE usar MAJOR para
cambios incompatibles, MINOR para reglas nuevas o ampliaciones compatibles y PATCH
para aclaraciones que mantienen las obligaciones. Cada revisión DEBE comprobar la
versión vigente y registrar la evidencia de cumplimiento de los principios aplicables.

**Versión** 1.0.0 | **Ratificada** 2026-11-14 | **Última modificación** 2026-11-14
