# Mejora visual de la sala de preparación

- Se sustituyeron los dos maniquíes por trajes de entrenamiento 3D con casco, visor, articulaciones, módulo pectoral y mochila. Se comparten geometrías y materiales; la colisión conserva su tamaño anterior.
- Los casilleros incorporan ventilación, cierres e indicadores. El banco tiene una superficie y una estructura más detalladas.
- Se corrigió la condición que impedía mostrar las luminarias del techo en preparación y control de misión. Las luminarias son visibles sin añadir fuentes de luz costosas.
- Los puños del jugador son más discretos en todas las salas. La lógica de navegación y de la misión permanece igual.
- En una prueba de navegador se recorrieron las siete salas, objetos educativos, puertas y tarea final. La captura de preparación es de la escena ejecutada.
- Los modelos son geométricos y estilizados: no se presenta el resultado como fotorrealista. La geometría y los materiales se liberan al cambiar de sala.

- Rendimiento, Edge con Intel UHD en 1920 × 1080 DPR 1: 10 segundos de calentamiento y 60 segundos medidos, 3999 fotogramas, mediana 12,2 ms y percentil 95 de 36,2 ms. La versión provisional con dos luces puntuales adicionales registró 79 ms en el percentil 95; se eliminaron para reducir el coste. La medición final sigue por encima del objetivo de 33,3 ms. No se midió con la GPU NVIDIA.
