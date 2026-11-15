# Llegada y base en Marte

## Alcance
Al finalizar el entrenamiento y la simulación en cabina, el usuario inicia un descenso ficticio, baja por una rampa en un escenario 3D, camina hasta la puerta del hábitat y, tras una pantalla de carga, administra una base marciana de cinco soles. Conservar la ruta, las tareas y el resultado existente en la página de entrenamiento. Ofrecer cierre de la experiencia de Marte para volver al informe, sin destruir el estado en memoria.

## Arquitectura y calidad
Escena de superficie independiente con Three.js local, controles de teclado y ratón, botón de acceso a la base, iluminación y suelo originales. Una capa de carga precede la base. El panel conserva reglas deterministas separadas del DOM, presupuesto limitado, resultados por turno, retardo simulado y fallback sin NASA. El dato DONKI histórico ajusta un ejercicio con una regla explícitamente ficticia; no es telemetría ni predicción. Usar el fondo estelar Pexels ya acreditado. Soportar movimiento reducido y no exigir audio. Validar tests de reglas, render y recorrido en navegador; medir rendimiento cuando sea posible, e indicar cualquier limitación.
