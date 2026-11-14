# Feature Specification: Entrenamiento terrestre físico y mental

**Feature Branch**: `001-entrenamiento-terrestre`

**Created**: 2026-11-14

**Status**: Draft

**Input**: Primera demo jugable de navegador para preparar física y mentalmente a un astronauta en una base terrestre ficticia inspirada en operaciones NASA.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completar acondicionamiento físico (Priority: P1)

Como aspirante a comandante, quiero completar una sesión de acondicionamiento físico supervisada para demostrar que puedo seguir el protocolo, vigilar mi estado y actuar ante una señal de fatiga o una anomalía.

**Why this priority**: Establece la primera actividad jugable y presenta el principio central de la simulación, donde el tiempo y el estado del astronauta siguen avanzando.

**Independent Test**: Se puede iniciar una sesión física, completar sus estaciones, responder a una anomalía y recibir un resultado de apto, condicionado o no apto sin necesitar las otras historias.

**Acceptance Scenarios**:

1. **Given** el astronauta está en la base terrestre y la sesión está lista, **When** inicia el protocolo y confirma cada estación, **Then** el sistema muestra el tiempo, la carga de trabajo y los indicadores fisiológicos simulados.
2. **Given** una estación está activa, **When** el astronauta ignora una alarma de fatiga, **Then** la carga y el estado de la sesión cambian sin congelar el entorno y el panel ofrece el procedimiento de recuperación correspondiente.
3. **Given** el astronauta completa las estaciones dentro de los límites definidos, **When** confirma el informe final, **Then** recibe un resultado trazable con las decisiones, incidentes y parámetros alcanzados.

---

### User Story 2 - Resolver evaluación mental bajo presión (Priority: P2)

Como aspirante, quiero resolver una evaluación mental con información incompleta, tiempo limitado y alarmas concurrentes para practicar priorización, memoria de procedimientos y comunicación operacional.

**Why this priority**: Convierte el contexto psicológico y de gestión de carga cognitiva en una actividad que se puede jugar y evaluar dentro de la demo.

**Independent Test**: Se puede ejecutar una evaluación mental desde su estado inicial, resolver sus eventos y obtener una calificación aunque la sesión física no se haya jugado en la misma visita.

**Acceptance Scenarios**:

1. **Given** la evaluación presenta un checklist y dos avisos simultáneos, **When** el astronauta prioriza una acción y confirma el procedimiento, **Then** el sistema registra el orden, el tiempo de respuesta y la consecuencia simulada.
2. **Given** el astronauta selecciona una acción incorrecta, **When** la confirma, **Then** el entorno continúa, la IA informa el estado actualizado y aparece una vía de recuperación si todavía es operativamente viable.

---

### User Story 3 - Consultar y responder a LUMINE (Priority: P3, diferida)

> Estado actual: esta historia se conserva como evolución planificada, pero la demo
> publicada en esta iteración funciona exclusivamente con texto y paneles.

Como aspirante, quiero hablar con LUMINE, la IA de a bordo A.R.E.S., y recibir respuestas tácticas para consultar telemetría, repetir una instrucción o confirmar una decisión sin abandonar la escena de entrenamiento.

**Why this priority**: La conversación de voz define la identidad de la demo y permite que el entrenamiento se sienta como una operación acompañada, sin sustituir los checklists que validan las decisiones.

**Independent Test**: Se puede abrir una sesión de conversación, emitir una consulta, recibir una respuesta contextual y continuar con un checklist. Si el servicio externo no está disponible, la sesión sigue mediante texto y controles equivalentes.

**Acceptance Scenarios**:

1. **Given** una sesión de entrenamiento está activa, **When** el astronauta pregunta por el estado de un parámetro o solicita repetir la instrucción, **Then** LUMINE responde en el contexto de la fase actual y la respuesta queda visible en el panel.
2. **Given** el servicio de voz no responde, **When** el astronauta intenta hablar, **Then** la interfaz informa el estado, permite escribir la consulta y conserva el flujo de la sesión.

### Edge Cases

- El astronauta pierde la conexión de voz durante una anomalía. La sesión conserva su estado y habilita entrada escrita y botones de respuesta.
- El micrófono no existe, está bloqueado o no concede permiso. La demo explica el problema sin impedir la ejecución de los checklists.
- El astronauta tarda más que el límite de una decisión. El tiempo sigue avanzando y la sesión aplica la consecuencia definida para una omisión.
- El astronauta repite una respuesta o envía una orden incompatible con la fase. LUMINE pide confirmación o devuelve el procedimiento permitido.
- La ventana del navegador se reduce o cambia de orientación. Los paneles esenciales siguen siendo utilizables y el estado del entrenamiento no se pierde.
- Una respuesta de voz llega tarde. No debe reemplazar una decisión ya confirmada y debe identificarse como respuesta asociada a la consulta original.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La demo DEBE permitir iniciar una sesión de entrenamiento terrestre desde un estado conocido y mostrar la fase, el tiempo de misión y el objetivo actual.
- **FR-002**: La demo DEBE incluir una actividad de acondicionamiento físico con al menos dos estaciones diferenciadas y un estado fisiológico simulado que cambie con el tiempo, la carga y las decisiones.
- **FR-003**: La demo DEBE incluir una evaluación mental con checklists, avisos concurrentes, límites de respuesta y consecuencias operativas simuladas.
- **FR-004**: El sistema DEBE mantener el tiempo de la sesión durante las decisiones y registrar las omisiones, confirmaciones, cambios de estado y resultados.
- **FR-005**: El usuario DEBE poder seleccionar, confirmar, revisar y corregir una acción mediante paneles de checklist accesibles con teclado y ratón.
- **FR-006**: LUMINE, la identidad conversacional de A.R.E.S., DEBE aceptar consultas habladas y responder con voz contextual durante una sesión activa mediante el proveedor externo de voz de Google configurado para el proyecto.
- **FR-007**: El sistema DEBE ofrecer entrada escrita y respuesta visible como alternativa cuando el micrófono, el permiso de audio o el servicio de voz no estén disponibles.
- **FR-008**: Las respuestas de LUMINE DEBEN respetar el estado de la sesión, distinguir entre información, instrucción y confirmación, y evitar confirmar una acción que el usuario no haya aceptado.
- **FR-009**: LUMINE DEBE mantener un registro conversacional breve, directo y orientado a la acción. En fase nominal puede expresar empatía y humor seco sutil. Durante una contingencia DEBE usar frases cortas, datos precisos y prioridad operacional, sin Markdown complejo ni LaTeX en la salida hablada.
- **FR-010**: LUMINE DEBE iniciar la sesión con un saludo al comandante, el estado inicial y la solicitud de la primera verificación de checklist.
- **FR-011**: El sistema DEBE asociar cada respuesta de LUMINE con la fase de misión, el tiempo metrológico, el estado operativo, el parámetro crítico y la acción requerida cuando ocurra una decisión relevante.
- **FR-012**: El sistema DEBE representar la progresión de la misión mediante fases explícitas, comenzando en el acondicionamiento pre-vuelo de la Tierra y dejando preparadas las transiciones posteriores hacia lanzamiento, tránsito, EDL y superficie.
- **FR-013**: La interfaz DEBE mostrar telemetría esencial, instrucciones actuales, alertas, estado de conexión de voz y resultado de la sesión fuera del lienzo 3D.
- **FR-014**: La demo DEBE comunicar los estados esenciales con texto y no depender solo de color, sonido o movimiento.
- **FR-015**: La demo DEBE permitir reiniciar una sesión desde el estado inicial y conservar un informe de la última sesión en el dispositivo del usuario.
- **FR-016**: Las credenciales y secretos del proveedor externo DEBEN permanecer fuera de los archivos públicos de la demo y de los datos enviados al repositorio.

### Key Entities

- **Sesión de entrenamiento**: Estado temporal de una visita, fase activa, reloj, dificultad, conexión de voz, eventos y resultado.
- **Estación física**: Actividad de acondicionamiento con carga, duración, límites, parámetros fisiológicos simulados y criterios de finalización.
- **Evento mental**: Aviso o decisión con prioridad, ventana temporal, respuestas válidas y consecuencias.
- **Checklist**: Secuencia de acciones verificables asociada a una estación o evento.
- **Telemetría**: Lectura contextual de un parámetro simulado con valor, unidad, estado y momento de la sesión.
- **Intercambio de voz**: Consulta o instrucción del usuario, respuesta de LUMINE/A.R.E.S., fase asociada, estado de entrega y alternativa textual si aplica.
- **Estado de misión**: Fase activa, tiempo metrológico, estado operativo, parámetro crítico y acción requerida que contextualizan la conversación.
- **Informe de entrenamiento**: Resumen de decisiones, tiempos, incidentes, resultado y recomendaciones de la sesión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona nueva puede iniciar la demo, entender el objetivo y comenzar la primera estación en menos de 3 minutos.
- **SC-002**: Una sesión completa de la demo dura entre 10 y 20 minutos sin requerir reiniciar el navegador.
- **SC-003**: Al menos el 90% de las acciones esenciales del checklist se pueden completar usando teclado y ratón, con foco visible y etiquetas comprensibles.
- **SC-004**: En una prueba con el servicio de voz disponible, al menos 8 de cada 10 consultas predefinidas reciben una respuesta contextual o un mensaje de recuperación en menos de 8 segundos.
- **SC-005**: En una prueba sin servicio de voz, el usuario puede completar los mismos checklists mediante texto y paneles, sin perder el estado de la sesión.
- **SC-006**: El informe final identifica el 100% de las decisiones, omisiones e incidentes producidos durante la sesión.
- **SC-007**: La escena de la demo mantiene un percentil 95 de intervalo entre fotogramas de 33,3 ms o menos en el equipo de referencia definido durante la planificación.

## Assumptions

- La primera demo se dirige a una persona en navegador de escritorio con teclado y ratón; la voz y el micrófono quedan fuera del alcance activo de esta iteración.
- La demo cubre la base terrestre y no incluye todavía lanzamiento, crucero, EDL, operaciones de superficie ni ISRU.
- El entrenamiento físico será una representación simulada con controles y telemetría, no una medición médica del usuario ni un diagnóstico.
- NASA, A.R.E.S. y V.I.E.R.N.E.S.-M se usarán como ficción inspirada. La demo no afirmará afiliación, certificación ni validación oficial de NASA.
- La conversación de voz requiere un servicio externo de Google y una configuración de credenciales segura que se definirá durante la planificación.
- El idioma inicial de la interfaz y de la voz será español.
- La primera versión prioriza una escena demostrable y dos actividades conectadas sobre la cobertura completa del currículo descrito en el documento de contexto.
- El prompt de LUMINE se implementará como política de comportamiento versionada y comprobable, mientras que la máquina de estados y las consecuencias seguirán siendo reglas del simulador.
