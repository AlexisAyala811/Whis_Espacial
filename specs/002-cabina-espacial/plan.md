# Plan técnico: cabina espacial

Base: Three.js 0.187.0, módulos ES, motor actual en `scenario-world.js`, geometría de `room-identity.js`, estado independiente en `src/core`. Sin modelos GLB/HDRI del proyecto ni rig de manos articulado; no se agregarán dependencias.

1. Conservar las dimensiones, rutas de colisión, consola, puerta, asientos, HUD y motor de misión. Encapsular el nuevo exterior y el detalle de cabina en un módulo de renderizado cargado solo cuando se crea la sala 6.
2. Usar los dos archivos aportados por el usuario para las vistas izquierda y derecha, optimizados localmente y citados por autor y licencia Pexels. Colocarlos en superficies curvas lejanas de una escena exterior 3D común, con una capa de estrellas a distancia distinta, reflejos discretos y fallback procedural. Los tamaños no representan distancias reales.
3. Añadir paneles 3D y biseles, asientos con detalles, escotilla reforzada, iluminación fría y cálida, perfiles metálicos y elementos de control, conservando la geometría existente o transformándola de forma coherente. Evitar modelos de toda la cabina como imagen.
4. Manejar texturas asíncronas y errores, liberar geometrías, materiales y mapas al cerrar la sala, incluidos los recursos de las imágenes compartidas. Mantener un presupuesto moderado de geometría y DPR existente, sin activar sombras globales costosas.
5. Comprobar recorrido, puertas, consola, fichas, despegue, reducción de movimiento, errores de consola, fallback y disposiciones visuales con capturas reales. Ejecutar `npm test`; no hay compilación configurada.

## Constitución y riesgos

Reglas y misiones permanecen fuera de Three.js; controles DOM y estados siguen disponibles. La cabina puede diferir del concepto: no hay modelos articulados, mapas normales o HDRI preparados. Registrar medición de rendimiento si se puede medir en hardware de referencia; no afirmar 60 FPS sin datos. Se documentará la brecha restante.

## Recursos autorizados para esta iteración

El usuario autorizó instalar los recursos necesarios. Se incorporará el modelo glTF 'Vintage Spacecraft Instrument' (Michał Wiśniewski) y el HDR 'Studio Small 09' (Sergej Majboroda), ambos de Poly Haven bajo CC0, variantes 1K. Los datos de origen y créditos se documentarán en el proyecto. Se cargarán solo en la cabina, con alternativa procedural y liberación de recursos. No se agregan dependencias npm; GLTFLoader, RGBELoader y RoundedBoxGeometry proceden de Three.js ya instalado.

## Resultado y desviaciones

Se utilizó HDRLoader, incluido en Three.js, y no RGBELoader. Los ventanales finales son superficies curvas con fotografías, sin una capa adicional de estrellas ni paralaje astronómico independiente. El instrumento incluye mapa normal y HDR de entorno; el conjunto no alcanza aún el aspecto fotorrealista. El resultado de rendimiento y las tareas pendientes se documentan en verification.md.
