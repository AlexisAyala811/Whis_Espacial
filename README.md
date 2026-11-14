# Lunar Command 3D

Demo jugable de navegador para entrenamiento ASCAN terrestre, construida con HTML,
CSS, JavaScript y Three.js. La fase actual se rige por la
[Constitución](.specify/memory/constitution.md) y mantiene separadas la simulación,
la interfaz y el adaptador de voz de LUMINE/A.R.E.S.

## Ejecución local

Requiere Node.js 22+:

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Abre [http://127.0.0.1:8000/](http://127.0.0.1:8000/). Sin `GEMINI_API_KEY`, la demo
continúa operativa con entrada de texto y respuestas locales de contingencia. Para
activar voz bidireccional con Gemini Live, completa `GEMINI_API_KEY` en `.env` sin
subir ese archivo al repositorio.

## Verificación

```powershell
npm test
```

Spec Kit incluye la integración de Claude Code y los scripts para PowerShell. La
habilidad `/speckit-constitution` permite consultar el flujo de enmienda de la Constitución.
