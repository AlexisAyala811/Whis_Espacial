# Mejora visual y de rendimiento de los escenarios

## Alcance

Mejorar de forma incremental las manos en primera persona, los detalles visuales de las siete salas y la profundidad del exterior de la cabina. Conservar rutas, colisiones, controles, accesibilidad y actividades. No se pretende una reproducción fotorrealista ni una simulación orbital exacta.

## Diseño

- Guantes compartidos entre salas con dedos, palmas y puños en geometría 3D, con el movimiento reducido respetado.
- Preparación: identificadores luminosos y tiradores de casilleros; gimnasio: marcas de ejercicio; control: indicadores y pantallas; NBL: marcas de seguridad; hábitat: iluminación y almacenaje; VAB: balizamiento; cabina: controles iluminados.
- Exterior: fotografías suministradas por el usuario como fondos lejanos y satélite 3D más próximo, que produce paralaje al desplazarse. No representa la posición real de ningún objeto.
- Agrupar las cajas estáticas por material; conservar por separado puertas, avisos y piezas animadas. Limitar a 20 Hz la búsqueda de objetos inspeccionables, actualizando inmediatamente al pulsar F.
- Todos los recursos temporales de cada sala se liberan al cambiar de escena.

## Límites

Las manos y gran parte de la arquitectura se generan con geometría sencilla; no se afirma calidad fotorrealista. La Tierra, la Luna y la Vía Láctea siguen siendo fotografías de fondo. El satélite es una representación artística, no una observación de NASA. La validación de rendimiento debe indicar el adaptador real usado por el navegador y no extrapolar resultados de una tarjeta a otra.

## Verificación

- Edge con GPU Intel UHD Graphics, Direct3D 11, 1920 × 1080 y DPR 1: diez segundos de calentamiento y sesenta segundos medidos. Tras agrupar geometría y limitar las búsquedas: 2400 fotogramas, mediana de 24,2 ms y percentil 95 de 54,6 ms. Antes de limitar las búsquedas, con la misma geometría agrupada: mediana de 24,2 ms y percentil 95 de 54,7 ms. La diferencia es demasiado pequeña para atribuir una mejora concluyente.
- El percentil 95 supera el objetivo de 33,3 ms; queda pendiente optimizar y repetir en hardware de referencia. El equipo también tiene una NVIDIA RTX 5060 Laptop, pero el navegador de la prueba utilizó Intel; no se midió ni se afirma rendimiento en NVIDIA.
- La prueba de navegador recorrió las siete salas, los objetos educativos, las seis transiciones y la actividad final. En la cabina se comprobó paralaje entre satélite y fondo, movimiento, colisiones, consola, recursos y alternativa ante fallos de carga.
- Las capturas corresponden a la escena ejecutada en navegador. Los resultados de las pruebas automáticas generales se actualizan al ejecutar npm test en el proyecto.
- Pruebas generales: npm test, 25 de 25 aprobadas.
