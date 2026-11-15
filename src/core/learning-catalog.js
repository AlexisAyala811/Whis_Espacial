import { PREPARATION_SUIT_POSITIONS } from './preparation-layout.js';
import { OBJECT_DETAILS } from './object-details.js';

const sources = {
  suit: 'https://www.nasa.gov/directorates/esdmd/hhp/space-suits-and-exploration-operations/',
  exercise: 'https://www.esa.int/media/staying-strong-in-orbit-with-ared',
  air: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
  training: 'https://www.nasa.gov/reference/jsc-crew-operations-training/',
  analog: 'https://www.nasa.gov/reference/jsc-analogs-mockups/',
  food: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
  mission: 'https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/',
};
const object = (id, name, position, purpose, question, options, answer, explanation, source) => ({id,name,position,purpose,details:OBJECT_DETAILS[id] ?? '',question,options,answer,explanation,source});
export const LEARNING_ROOMS = [
  { name:'Vestuario y esclusa de preparación', purpose:'Inspecciona el equipo que protege al astronauta antes de salir.', objects:[
    object('suit-console','Banco de verificación',[-3.7,2.2,-1.4],'Compara las lecturas del traje antes de autorizar una actividad.','¿Qué haces si una lectura no coincide con la lista?',['Ignorar la lectura','Detener la revisión y comprobarla'],1,'Una lista de comprobación sirve para detectar diferencias antes de continuar.',sources.training),
    object('suit-display','Traje de entrenamiento',[PREPARATION_SUIT_POSITIONS[0].x,2.4,PREPARATION_SUIT_POSITIONS[0].z],'Permite practicar el uso de guantes, casco y conexiones en un entorno controlado.','¿Para qué se ensayan los movimientos con el traje?',['Para reconocer sus límites de movimiento','Para aprender a respirar sin aire'],0,'El traje cambia el alcance y la destreza; practicar ayuda a planificar cada tarea.',sources.suit),
    object('suit-locker','Armario de equipo',[6.1,2,3],'Guarda herramientas identificadas para encontrarlas durante una comprobación.','¿Cómo reduces errores al preparar el equipo?',['Mezclando todas las piezas','Identificando y contando las herramientas'],1,'El inventario ayuda a detectar herramientas faltantes y evita confundir conexiones.',sources.training),
  ]},
  { name:'Gimnasio de acondicionamiento', purpose:'Relaciona resistencia, actividad cardiovascular y control de movimiento.', objects:[
    object('ared-device','ARED · ejercicio de resistencia',[-3.7,2.5,-3.4],'Genera resistencia para ejercitar músculos y huesos; aquí practicamos coordinación en tierra.','¿Qué entrena principalmente el ejercicio de resistencia?',['La fuerza muscular','La orientación de la antena'],0,'En órbita, los músculos trabajan menos contra la gravedad. ARED permite hacer ejercicio de resistencia.',sources.exercise),
    object('t2-device','T2 · cinta de entrenamiento',[4,1.8,-2.4],'La cinta permite caminar o correr. En órbita se usa sujeción para mantener el contacto.','¿Por qué hace falta una sujeción en la cinta orbital?',['Para producir oxígeno','Para mantener al astronauta sobre la cinta'],1,'En microgravedad no basta con el peso corporal para mantenerse sobre la banda.',sources.exercise),
    object('exercise-bike','Bicicleta de acondicionamiento',[4.3,1.6,3.8],'Complementa la resistencia con ejercicio cardiovascular.','¿Conviene entrenar siempre una sola capacidad?',['No, se combinan distintos ejercicios','Sí, solo importan los brazos'],0,'La preparación combina diferentes capacidades físicas; este juego no prescribe rutinas médicas.',sources.exercise),
  ]},
  { name:'Centro de control de misión', purpose:'Interpreta información y decide qué sistema necesita atención primero.', objects:[
    object('control-air','Puesto de soporte vital',[-3.7,2,-1.4],'Reúne avisos del aire, presión y agua para que el operador priorice una respuesta.','¿Basta con tener oxígeno para mantener aire respirable?',['Sí, no hace falta nada más','No, también se debe retirar CO₂ y controlar otros factores'],1,'El soporte vital controla varios procesos conectados; el oxígeno es solo uno de ellos.',sources.air),
    object('control-wall','Pantalla de situación',[4.2,3.4,-8.6],'Resume las lecturas para que distintos operadores compartan la misma situación.','¿Qué es la telemetría?',['Datos enviados por los equipos','Una orden de despegar'],0,'La telemetría comunica mediciones. El equipo debe interpretarlas antes de actuar.',sources.training),
    object('control-desk','Consola de operador',[4.6,1.9,.6],'Un operador revisa su área y coordina cambios con el resto del equipo.','Si detectas una anomalía, ¿qué debes comunicar?',['Una suposición sin datos','La lectura observada y el sistema afectado'],1,'Una comunicación concreta ayuda a distinguir hechos de suposiciones.',sources.training),
  ]},
  { name:'Piscina de flotabilidad neutra · NBL', purpose:'Practica desplazamientos lentos y conexiones alrededor de un módulo sumergido.', objects:[
    object('eva-panel','Panel de conexiones EVA',[-3.7,2,-1.4],'Este tablero didáctico distingue líneas de oxígeno, datos y energía.','¿Cómo eliges una conexión?',['Por su rótulo y función','Por cuál está más cerca'],0,'Los rótulos y verificaciones evitan confundir sistemas. El tablero es una simplificación del juego.',sources.training),
    object('eva-module','Módulo de ensayo sumergido',[4.2,3,-.3],'Permite ensayar tareas exteriores mientras el agua ayuda a equilibrar el peso.','¿Estar bajo el agua elimina realmente la gravedad?',['Sí, desaparece por completo','No, la flotabilidad compensa el peso'],1,'La piscina permite ensayar algunos movimientos, pero conserva gravedad y resistencia del agua.',sources.analog),
    object('eva-rail','Pasamanos de trabajo',[6.1,1.8,.2],'Da un punto de referencia y apoyo alrededor del módulo.','¿Por qué conviene planificar los puntos de apoyo?',['Para controlar el movimiento durante la tarea','Para moverse sin observar el entorno'],0,'Planificar el movimiento ayuda a llegar al lugar de trabajo con control.',sources.training),
  ]},
  { name:'Hábitat de convivencia e investigación', purpose:'Explora cómo se organizan el descanso, los alimentos y los recursos compartidos.', objects:[
    object('habitat-rack','Panel ambiental',[-3.7,2,-1.4],'Muestra los recursos de la tripulación para repartirlos sin agotar una reserva.','¿Qué debes revisar antes de aumentar un consumo?',['Solo que el botón funcione','Su efecto sobre los demás recursos'],1,'Los sistemas comparten recursos: una mejora puede tener un costo en otro sistema.',sources.mission),
    object('habitat-bunks','Literas de descanso',[4.8,2.3,-3.9],'Separan una zona de sueño del área de trabajo y de los equipos.','¿Por qué un hábitat necesita áreas de descanso?',['Porque la recuperación forma parte de la misión','Porque los astronautas no necesitan dormir'],0,'Los análogos terrestres permiten estudiar la convivencia y el trabajo en espacios aislados.',sources.analog),
    object('habitat-crops','Bandejas de cultivo',[6.2,2.3,2.8],'Representan un experimento de producción de alimentos que necesita luz, agua y atención.','¿Qué necesita un cultivo además de semillas?',['Nada, crece sin recursos','Condiciones adecuadas, agua y luz'],1,'Producir comida exige recursos y tiempo. No sustituye inmediatamente a las reservas.',sources.food),
  ]},
  { name:'Edificio de ensamblaje · VAB', purpose:'Reconoce el vehículo y sus plataformas antes de verificar los sistemas eléctricos.', objects:[
    object('vab-check','Mesa de integración',[-3.7,2,-1.4],'Centraliza la revisión de los distintos sistemas antes de pasar a la cabina.','¿Un sistema activo implica que todo está listo?',['No, deben verificarse todos los sistemas previstos','Sí, basta una luz verde'],0,'La preparación exige comprobar el conjunto. El rompecabezas eléctrico es una actividad didáctica.',sources.training),
    object('vab-rocket','Vehículo de entrenamiento',[4.1,5,-2.8],'El modelo permite reconocer tanque central, propulsores laterales y sección superior.','¿Por qué hay plataformas a distintas alturas?',['Para reemplazar el motor','Para acceder a diferentes zonas del vehículo'],1,'Las plataformas permiten el acceso de equipos de integración y revisión.',sources.training),
  ]},
  { name:'Cabina de mando y simulación', purpose:'Dirige desde la nave una misión de cinco soles en un puesto marciano.', objects:[
    object('ship-console','Consola de misión',[-3.7,2,-1.4],'Presenta decisiones cuyos costos afectan al aire, alimentos, energía y protección.','¿Qué debes comparar antes de elegir una acción?',['Beneficio inmediato y costo futuro','Solo cuál botón es más grande'],0,'Gestionar una misión significa comparar recursos y consecuencias a lo largo del tiempo.',sources.mission),
    object('ship-seat','Asiento de tripulación',[2.5,1.8,-2.1],'Organiza la posición de trabajo frente a los instrumentos de la cabina.','¿Por qué deben quedar accesibles los instrumentos?',['Para poder leerlos y actuar desde el puesto','Solo para decorar la nave'],0,'La disposición de un puesto debe facilitar la lectura y la interacción.',sources.training),
  ]},
];

export class LearningProgress {
  constructor(){ this.visited=new Set();this.mastered=new Set(); }
  answer(id,index){
    const item=LEARNING_ROOMS.flatMap(room=>room.objects).find(item=>item.id===id);
    if(!item||!Number.isInteger(index)||index<0||index>=item.options.length)return null;
    this.visited.add(id);
    const correct=index===item.answer;
    if(correct)this.mastered.add(id);
    return {correct,explanation:item.explanation};
  }
}
