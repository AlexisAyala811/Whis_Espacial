# Verificación de gráficos en Marte

- En navegador Edge con WebGL se comprobó la carga de la panorámica NASA y los tres mapas de terreno, las sombras, la salida de la nave, la caminata, la puerta, la transición, el primer sol y la recuperación del progreso. Se verificó por separado que, al bloquear los cuatro recursos, el terreno procedural siga visible y sea posible llegar a la puerta.
- Medición con NVIDIA GeForce RTX 5060 Laptop GPU, Edge Direct3D 11, escena inmóvil, 1920 × 1080 CSS, DPR 1: diez segundos de calentamiento y sesenta segundos de medición. Mediana 6,1 ms; percentil 95 6,2 ms. Cumple el objetivo de 33,3 ms en esta escena y equipo; no garantiza el mismo resultado en otros equipos o en todos los escenarios.
- Las imágenes son recursos locales, no dependen de la red en tiempo de juego. La panorámica fue captada por Spirit en 2005, se recorta y emplea como fondo artístico. La textura se fotografió en la Tierra. El hábitat y la ruta son ficticios. Las fuentes y licencias están en assets/mars/CREDITS.md.
- La iluminación, el terreno y el fondo mejoran el aspecto, pero el hábitat, las manos y las rocas continúan siendo modelos estilizados; el resultado no es fotorrealista.

- Tras integrar, npm test: 34 de 34 pruebas aprobadas. En el servidor local 127.0.0.1:8000 se comprobó la carga de la panorámica y los tres mapas con NVIDIA RTX 5060.
