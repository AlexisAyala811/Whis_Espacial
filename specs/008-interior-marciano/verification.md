# Verificación del interior marciano

- Edge con NVIDIA RTX 5060: se probó el recorrido desde el final de la cabina, descenso, entrada exterior, pantalla de carga, recorrido del interior, apertura de consola, avance de un sol, regreso al interior y reentrada con progreso conservado, salida a la superficie y regreso al informe de entrenamiento.
- Una prueba independiente verificó que el jugador puede avanzar y no atraviesa el módulo de cultivo. La entrada inicial coloca al jugador fuera del radio de salida para no invitar a volver por accidente.
- Se muestra información contextual al acercarse a descanso, cultivo o soporte vital. Es mobiliario educativo: la producción y recursos se gestionan desde el panel de misión, no desde las plantas 3D.
- Medición en Edge Direct3D 11 con NVIDIA RTX 5060 Laptop, escena inmóvil, 1920 × 1080 CSS y DPR 1: 10 segundos de calentamiento, 60 segundos de medida; mediana 6,1 ms, percentil 95 de 6,2 ms. Este resultado es para ese equipo y escena y no garantiza la misma tasa en otros dispositivos.
- El interior es una representación ficticia y estilizada. El panel de pared usa la panorámica histórica del rover Spirit citada en assets/mars/CREDITS.md, no una vista en vivo. No se han validado controles táctiles ni pruebas con estudiantes.

- Después de integrar: npm test, 34 de 34 pruebas aprobadas; el servidor local 127.0.0.1:8000 permitió entrar al interior, abrir la consola y avanzar un sol con NASA simulada como no disponible.
