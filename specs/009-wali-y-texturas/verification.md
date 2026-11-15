# Verificación de Wali y texturas

- Se comprobó la presencia de Wali, su imagen, la tecla H, los datos y el minimizado en los siete escenarios de entrenamiento, la superficie, el interior y el panel de Marte. Las pistas usan reglas locales y Wali no actúa por el jugador ni tiene voz.
- La prueba completa recorrió el final del entrenamiento, descenso, exterior, interior, consola, primer sol, recuperación de progreso y salida; se probó además la alternativa procedural al bloquear las fotografías de interiores.
- Cada sala terrestre recibió una mezcla con una fotografía de suelo apropiada y textura de pared; el hábitat marciano utiliza la variante correspondiente. Se conserva el terreno y la panorámica de Marte ya existentes. Las fotografías se mezclan con texturas procedurales de 512 px, no representan reconstrucciones fotográficas de instalaciones reales. Fuentes y licencias en assets/interiors/CREDITS.md.
- Medición en Edge Direct3D 11 con NVIDIA RTX 5060 Laptop, 1920 × 1080 CSS, DPR 1, 10 s de calentamiento y 60 s de muestra: hábitat inmóvil, mediana 6,1 ms y percentil 95 de 6,3 ms; VAB inmóvil, mediana 6,1 ms y percentil 95 de 6,4 ms. Cumplen 33,3 ms en esas escenas y ese equipo; no garantizan igual rendimiento en otros.
- El movimiento de Wali respeta la preferencia de movimiento reducido. Las pistas se pueden solicitar con H y el panel se puede minimizar. No se ha validado con lectores de pantalla ni estudiantes de 7 a 12 años; los modelos y gráficos siguen siendo estilizados.

- Tras integrar: npm test, 37 de 37 pruebas aprobadas. En el servidor local se comprobó la imagen de Wali, la carga de texturas y las pistas en entrenamiento, hábitat y panel.
