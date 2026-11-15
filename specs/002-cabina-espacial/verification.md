# Verificación de la cabina

- Recursos: fotografías proporcionadas por el usuario, modelo glTF 1K con mapa normal y entorno HDR 1K, con licencias y créditos en `assets/cabin/CREDITS.md`.
- Pruebas del proyecto: `npm test`, 25 de 25 aprobadas.
- Navegador: se comprobó la carga de las dos imágenes, el modelo y el HDR; la consola de misión y los cambios de escenario siguieron funcionando. Se probó el recorrido completo de los siete escenarios y la misión final.
- Rendimiento: prueba a 1920 × 1080, DPR 1, 10 segundos de calentamiento y 60 de medición en Edge sin interfaz con SwiftShader por software. Resultado: 127 fotogramas, mediana 550,9 ms y percentil 95 de 593,7 ms. No cumple el objetivo de 33,3 ms; esta medición no representa el rendimiento de una GPU física. Queda pendiente medir y optimizar en hardware gráfico real.
- Comparación visual: hay nuevos ventanales curvos, fotografías, materiales, iluminación, asientos y un instrumento 3D; la cabina sigue incluyendo geometría estilizada y no alcanza fotorrealismo. Las imágenes de los ventanales son fondos 2D sobre superficies curvas: no representan órbitas reales ni producen paralaje independiente de los astros. Quedan pendientes modelos detallados de cabina y manos, y exterior espacial con profundidad.
- El entorno HDR es de estudio y se utiliza para reflejos, no es un fondo astronómico. No se afirma que los modelos o imágenes sean datos en vivo de NASA.
