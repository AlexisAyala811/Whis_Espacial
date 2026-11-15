# Lunar Command 3D

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
Usa WASD para caminar, Shift para correr, ratón capturado o arrastre para mirar
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
En NBL, Espacio y Ctrl permiten ajustar la altura en el agua simulada.
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
que reproduce el reto y sus enlaces. El juego atribuye cada pregunta a una fuente,
pero todavía no consume sus datos.

Demo jugable de navegador para entrenamiento ASCAN terrestre, construida con HTML,
CSS, JavaScript y Three.js. La fase actual se rige por la
[Constitución](.specify/memory/constitution.md) y mantiene separadas la simulación,
la interfaz y el adaptador futuro de voz de LUMINE/A.R.E.S.

## Ejecución local

Requiere Node.js 22+:

```powershell
npm ci
Copy-Item .env.example .env
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
