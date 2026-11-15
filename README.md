# Lunar Command 3D

## Secuencia de despegue

La primera vez que cruces del VAB a la cabina aparece una animación sin voz que
representa la verificación, cuenta regresiva, despegue y ascenso. Puedes omitirla
con el botón o Esc; se reproduce de nuevo al reiniciar el entrenamiento. Es una
representación original del juego, no un video de un lanzamiento real. Con la
opción de movimiento reducido se muestra una versión corta.

## Controles y vista desde la nave

Mantén Ctrl + W para correr hacia delante; Shift también permite correr.
La cabina tiene una ventana panorámica con la Tierra, la Luna, el Sol, estrellas
y representaciones de Orión y la Osa Mayor. Es una composición artística: las
distancias, posiciones y tamaños no corresponden a una vista astronómica real.

## Cabina de observación

La cabina conserva la navegación, la consola de misión y las fichas, y utiliza
asientos biselados, paneles de metal y luces cálidas y frías. La ventana izquierda
muestra la imagen de Tierra y Luna proporcionada; la derecha, la imagen de estrellas.
Son composiciones artísticas, no datos astronómicos en vivo ni vistas a escala.
El modelo de instrumento glTF y la iluminación HDR se cargan al entrar en la cabina;
si fallan, la cabina permanece utilizable. Véase [créditos](assets/cabin/CREDITS.md).
Las manos mantienen sus formas y animaciones existentes: no hay rig articulado.

## Texturas por espacio

Las superficies usan texturas procedurales originales para metal cepillado,
paneles de pared, tejido y goma. Cada sala recibe un suelo apropiado: paneles,
goma de gimnasio, moqueta de control, baldosas de piscina, vinilo de hábitat o
acabado industrial de ensamblaje. Los materiales y texturas se liberan al salir
de cada sala. Las geometrías siguen siendo una base estilizada para mejorar.

## Materiales y movimiento ambiental

Los equipos incorporan superficies metálicas, indicadores de colores y detalles de
traje; los suelos usan texturas generadas para cada sala. Las pantallas muestran
telemetría animada simulada; en el gimnasio se mueve la cinta y en NBL ascienden
burbujas. La caminata y la carrera son más rápidas, con desplazamiento más lento
en el agua simulada. Las animaciones se detienen con las pausas y respetan la preferencia de
movimiento reducido del sistema. Las texturas son originales y procedurales.

## Exploración educativa y escenarios

La revisión del audio del 15 de noviembre de 2026 incorpora 19 objetos educativos
distribuidos entre siete salas. Acércate a un punto y pulsa **F** para consultar su
nombre, función y una pregunta con explicación. **I** libera el cursor para elegir
un punto con el ratón; vuelve a pulsarlo para caminar. **Esc** cierra la ficha.
Las preguntas permiten reintentar y cada aprendizaje se cuenta una sola vez.
La ficha detiene el movimiento y el reloj del entrenamiento mientras se lee.

Cada sala tiene una identidad espacial propia: vestuario con armarios y esclusa,
gimnasio con pistas y bicicleta, centro de control con filas de consolas,
piscina con módulo sumergido y escalera, hábitat con costillas estructurales y
comedor, edificio de ensamblaje alto y cabina con instrumentos. La geometría es
un blockout original para futuras mejoras visuales; no reproduce una instalación
NASA exacta. Cada objeto enlaza una fuente NASA, ESA o CSA cuando corresponde.

El título superior identifica la sala y una franja explica su función. Las puertas,
la pantalla de carga y las actividades principales del recorrido siguen disponibles.

## Experiencia en primera persona

La página inicial ahora abre una base 3D a pantalla completa inspirada en la interacción
de NightOps/GENIE, con geometría original. Pulsa **Entrar en la base**.
Usa WASD para caminar, Ctrl + W o Shift para correr, ratón capturado o arrastre para mirar
(flechas como alternativa), E para interactuar y Esc para abrir el menú.
Recorre siete escenarios: preparación de traje → acondicionamiento físico (ARED y T2)
→ control de misión (ECLSS) → entrenamiento EVA en NBL → hábitat de investigación
→ preparación de lanzamiento en VAB → cabina de la nave. Completa el objetivo para abrir la puerta siguiente;
atraviésala o pulsa E junto a ella. Una pantalla de carga aparece mientras se genera
la nueva sala. Puedes volver por la puerta anterior sin perder progreso.
El recorrido incluye tres verificaciones, seis repeticiones a tiempo, una decisión
de prioridad y tres minijuegos originales de procedimientos: conectar umbilicales EVA,
equilibrar recursos del hábitat y restablecer buses eléctricos. En la cabina diriges
un puesto marciano durante cinco soles con decisiones sobre aire, radiación, energía,
alimentos y demora de comunicaciones. Todas las opciones tienen costos visibles.
Los errores reducen
la puntuación. El informe final se guarda
localmente cuando el navegador lo permite. Reiniciar restaura la partida.
Esta versión requiere teclado y está diseñada para escritorio; no incluye controles táctiles.
En NBL, Espacio sube y Ctrl sin W baja en el agua simulada; Ctrl + W permite avanzar más rápido sin descender.
La coordinación ARED es una mecánica de juego, no un modelo fisiológico.

Cada sala se construye al entrar y libera los recursos de la anterior. La base usa
geometría y materiales originales generados en código: suelo modular, paredes
paneladas, iluminación de techo, monitores operativos, trajes, equipo ARED, cinta T2,
módulo de entrenamiento EVA, literas y cultivos del hábitat, y cohete de entrenamiento.
El objetivo visual actual es una instalación técnica creíble
sin depender de modelos descargados. Los detalles aún son estilizados; el render no es
una reconstrucción fotográfica de instalaciones reales. La cabina y el cohete son
diseños originales basados en las imágenes de referencia proporcionadas. Los valores
de la misión lunar son ficticios y educativos, no datos NASA en vivo.

Los objetivos y los siete recursos del reto
[Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)
están enlazados en [resources.html](resources.html), accesible desde la pantalla de
inicio y el informe final. La página oficial no respondió a la lectura automatizada;
el desglose se cotejó con la [página del evento local HackAthlone](https://hackathlone.com/challenges/junior-astronaut-mission-trainer),
que reproduce el reto y sus enlaces. El juego atribuye cada pregunta a una fuente
y consulta DONKI y APOD como se explica más abajo.

Demo jugable de navegador para entrenamiento ASCAN terrestre, construida con HTML,
CSS, JavaScript y Three.js. La fase actual se rige por la
[Constitución](.specify/memory/constitution.md) y mantiene separadas la simulación,
la interfaz y el adaptador futuro de voz de LUMINE/A.R.E.S.

## Datos reales de NASA

La primera decisión de la misión marciana consulta erupciones solares de los
últimos 30 días mediante [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/).
La página **Fuentes** también muestra la última erupción, un gráfico con los días
que registraron erupciones y la imagen astronómica del día (APOD), cuando NASA
proporciona una imagen alojada en su dominio; otros formatos se enlazan a NASA.
Las fechas son UTC y se muestra la fecha
de consulta; las erupciones son observaciones, no pronósticos de riesgo.
El evento de la partida y los porcentajes de recursos son simulados.
Si NASA no responde, se indica y la simulación sigue disponible.

DONKI usa el servicio público directo de NASA, sin clave. APOD usa DEMO_KEY
si no configuras una clave. Para una clave propia, solicítala en
[NASA Open APIs](https://api.nasa.gov/), copia `.env.example` a `.env` si no
existe y coloca `NASA_API_KEY=tu_clave` en ese archivo local. Reinicia el servidor.
El archivo `.env` no debe subirse a Git ni compartirse. El servidor mantiene
la clave en el servidor; la página nunca la recibe. Las otras fuentes OSDR,
RadLab y CSA están enlazadas como consulta, aún no alimentan la simulación.

## Ejecución local

Requiere Node.js 22+:

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm start
```

Abre [http://127.0.0.1:8000/](http://127.0.0.1:8000/). La versión actual opera
deliberadamente en modo texto y paneles; no solicita permisos de micrófono ni requiere
`GEMINI_API_KEY`. El adaptador Gemini Live permanece aislado para una iteración futura.

## Verificación

```powershell
npm test
```

Spec Kit incluye la integración de Claude Code y los scripts para PowerShell. La
habilidad `/speckit-constitution` permite consultar el flujo de enmienda de la Constitución.

## Descenso y base marciana

Después de completar el entrenamiento y la simulación de cabina, pulsa **Descender a Marte** en el informe. Puedes saltar la secuencia de descenso, salir de la nave, caminar por la rampa y usar **E** junto a la puerta iluminada para entrar al hábitat. La superficie es una escena 3D ficticia: WASD camina, Ctrl + W o Shift corre y el arrastre del ratón o las flechas permiten mirar. El botón superior vuelve al informe sin reiniciar el entrenamiento.

La puerta muestra una pantalla de carga y conduce a un interior 3D con zonas de descanso, cultivo y soporte vital. Camina hacia la consola central y pulsa E para abrir el panel de administración de cinco soles. Desde el panel puedes volver al interior, y desde la esclusa puedes regresar a la superficie. Reparte diez unidades de energía entre aire, cultivo, refugio y comunicaciones; consulta la previsión y la bitácora. Las decisiones guardadas se recuperan en la misma pestaña al volver a la superficie y entrar otra vez. La simulación funciona si no hay conexión a NASA. Si existe un registro DONKI válido, una regla del juego ajusta el ejercicio solar según su clase; el panel aclara que el umbral es ficticio, no una predicción ni una dosis real. Se enlaza el estudio NASA OSD-684 como contexto, sin convertirlo en valores de salud. La fotografía estelar se acredita en `assets/cabin/CREDITS.md`.

El escenario exterior y el planeta ilustrado son estilizados, no recreaciones fotográficas ni datos de ubicación en Marte. No se ha validado la experiencia con estudiantes de 7 a 12 años.

## Mejoras visuales de Marte

La superficie utiliza una panorámica histórica recortada del rover Spirit como fondo artístico, y textura 1K de suelo con mapas de normales y rugosidad. El hábitat incorpora sombras, detalles metálicos y paneles solares. Si no se cargan los recursos, permanece disponible el terreno procedural. No representa una vista en directo ni el lugar exacto de una misión real. Consulta fuentes y licencias en [créditos de Marte](assets/mars/CREDITS.md).

## Wali y materiales interiores

Wali acompaña en los siete escenarios de entrenamiento, la superficie, el hábitat y el panel de Marte. Pulsa **H** para pedir una pista, selecciona **Un dato** para aprender algo o usa el botón − para minimizar su nube. Wali reacciona a errores y muestra datos ocasionalmente. Sus respuestas son texto local predefinido, no voz ni una conversación con IA; no completa actividades por el jugador.

Las habitaciones combinan sus texturas procedurales con fotografías locales de superficies, adaptadas a cada espacio; el suelo y las paredes conservan alternativas si no cargan los archivos. Los modelos siguen siendo estilizados. Consulta [créditos de interiores](assets/interiors/CREDITS.md).
