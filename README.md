# Lunar Command 3D

## Experiencia en primera persona

La página inicial ahora abre una base 3D a pantalla completa inspirada en la interacción
de NightOps/GENIE, con geometría original. Pulsa **Entrar en la base**.
Usa WASD para caminar, Shift para correr, ratón capturado o arrastre para mirar
(flechas como alternativa), E para interactuar y Esc para abrir el menú.
Recorre traje → ARED → ECLSS: tres verificaciones, seis repeticiones a tiempo y una
decisión de prioridad. Los errores reducen la puntuación. El informe final se guarda
localmente cuando el navegador lo permite. Reiniciar restaura la partida.
Esta versión requiere teclado y está diseñada para escritorio; no incluye controles táctiles.
La coordinación ARED es una mecánica de juego, no un modelo fisiológico.

La base usa geometría y materiales originales generados en código: suelo modular con
textura procedural, paredes paneladas, iluminación de techo, monitores operativos,
trajes, equipo ARED y cinta T2. El objetivo visual actual es una sala técnica creíble
sin depender de modelos descargados. Los detalles aún son estilizados; el render no es
una reconstrucción fotográfica de instalaciones reales.

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
