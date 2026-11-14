# Lunar Command 3D

Base web estática en HTML, CSS y JavaScript con Three.js. La fase actual del proyecto
se rige por la [Constitución](.specify/memory/constitution.md).

## Comprobación local

Con Node.js, npm y Python disponibles, ejecuta en la raíz del proyecto:

```powershell
npm ci
py -m http.server 8000 --bind 127.0.0.1
```

Abre [la página local](http://127.0.0.1:8000/). La página muestra el título del proyecto
y carga Three.js como módulo local. En la consola del navegador puedes comprobarlo
con `(await import('./src/main.js')).threeRevision`.

Spec Kit incluye la integración de Claude Code y los scripts para PowerShell. La
habilidad `/speckit-constitution` permite consultar el flujo de enmienda de la Constitución.
