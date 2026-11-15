const NAMES=['izquierdo','central','derecho'];
export const WALI_FACTS={
  suit:'Un traje espacial combina protección y soporte vital. Antes de usarlo hay que revisar sus sistemas.',
  ared:'El ejercicio de resistencia ayuda a trabajar los músculos cuando cambia la gravedad.',
  mental:'El soporte vital controla varios elementos del aire, no solo el oxígeno.',
  eva:'En la piscina, la flotabilidad compensa parte del peso; la gravedad no desaparece.',
  habitat:'En un hábitat, el aire, el agua y la energía dependen de sistemas conectados.',
  vab:'Las plataformas de un edificio de ensamblaje permiten llegar a distintas partes del vehículo.',
  ship:'Un sol es un día en Marte. Una misión necesita reservar recursos para lo que pueda ocurrir después.',
  'mars-surface':'Esta escena es ficticia; el horizonte incluye una fotografía histórica del rover Spirit.',
  'mars-habitat':'Los espacios de descanso y cultivo ayudan a organizar la vida de la tripulación.',
  'mars-base':'Producir comida requiere recursos y tiempo. Los números de esta misión son simulados.',
};

export function nextPowerMove(buses){
  if(!Array.isArray(buses)||buses.length!==3||!buses.every(v=>typeof v==='boolean'))return null;
  const queue=[{bits:buses,first:null}],seen=new Set();
  while(queue.length){const item=queue.shift(),key=item.bits.map(Number).join('');if(seen.has(key))continue;seen.add(key);if(item.bits.every(Boolean))return item.first;
    for(let move=0;move<3;move++){const bits=[...item.bits];for(let i=Math.max(0,move-1);i<=Math.min(2,move+1);i++)bits[i]=!bits[i];queue.push({bits,first:item.first??move});}
  }return null;
}

export function waliHint(context={}){
  const scene=context.scene;
  if(context.completed)return 'Entrenamiento completado. En el informe puedes elegir «Descender a Marte» para continuar.';
  if(Number.isInteger(context.stage)&&Number.isInteger(context.sceneIndex)&&context.stage>context.sceneIndex)return 'La actividad de esta sala ya está terminada. Busca la puerta abierta para continuar.';
  switch(scene){
    case 'suit':return `Acércate a la consola del traje y pulsa E. Has completado ${context.checks??0} de 3 verificaciones.`;
    case 'ared':return `En ARED, espera a que la aguja esté en la zona verde y pulsa E una vez. Llevas ${context.reps??0} de 6 repeticiones.`;
    case 'mental':return 'Si hay una fuga de presión y un aviso térmico, atiende primero la pérdida de atmósfera.';
    case 'eva':return 'Selecciona una línea y después el puerto con el mismo nombre: oxígeno con O₂, datos con datos y energía con energía.';
    case 'habitat':return 'Ajusta los tres indicadores: oxígeno a 80 %, agua a 60 % y energía a 70 %. Luego confirma el balance.';
    case 'vab':{const move=nextPowerMove(context.buses);return move===null?'Revisa los tres buses; deben quedar activos.':`Prueba el interruptor ${NAMES[move]}. Cada uno también cambia los buses vecinos.`;}
    case 'ship':return 'Lee el costo de cada opción. Protege el aire y la tripulación sin gastar toda la energía.';
    case 'mars-surface':return context.near?'Estás cerca de la puerta: pulsa E para entrar al hábitat.':'Baja por la rampa y sigue las luces hacia la puerta del hábitat. Usa WASD para caminar.';
    case 'mars-habitat':return context.near==='console'?'Pulsa E para abrir el control de misión.':context.near==='exit'?'Pulsa E si quieres salir a la superficie.':'La consola está al fondo, siguiendo la línea clara del suelo. Acércate y pulsa E.';
    case 'mars-base':{
      if(context.finished)return 'Revisa la bitácora para aprender de tus decisiones. Puedes intentar de nuevo la misión.';
      if(context.sol===2&&(context.shield??0)<(context.shieldNeeded??2))return `En el ejercicio solar, asigna al menos ${context.shieldNeeded??2} unidades al refugio. La regla es una simulación.`;
      if((context.air??100)<40)return 'El aire está bajo. Considera asignar más energía al soporte vital y revisa la previsión.';
      return 'Reparte hasta 10 unidades. El cultivo necesita energía y agua; la protección y las comunicaciones también compiten por energía.';
    }
    default:return 'Estoy aquí para ayudarte. Pulsa H o selecciona «Pista» cuando necesites orientación.';
  }
}
