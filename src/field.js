import { FieldTraining } from './core/field-training.js';
import { createScenarioWorld, STATIONS } from './rendering/scenario-world.js';
import { SCENARIOS } from './core/scenario-route.js';
import { OUTPOST_QUESTIONS } from './core/outpost-training.js';

import { LEARNING_ROOMS, LearningProgress } from './core/learning-catalog.js';
let learning=new LearningProgress(), inspectMode=false, inspected=null, visiblePoints=[];
const $=id=>document.getElementById(id);
let mission=new FieldTraining(),running=false,started=false,transitioning=false,pauseAfterTransition=false,selectedCable=null,world;
const titles=['Verifica tu traje','Controla cada repetición','Prioriza el soporte vital','Conecta el módulo EVA','Equilibra los recursos','Restablece la energía','Dirige el puesto marciano'];
const details=['Acércate a la consola 01. Confirma presión, agua y telemetría con E.','Completa seis repeticiones en ARED pulsando E en la zona verde.','Resuelve los avisos de la consola ECLSS.','En NBL, une cada línea con su puerto. Espacio y Ctrl ajustan la altura.','Ajusta oxígeno, agua y energía del hábitat.','Activa los tres buses eléctricos del cohete.','En la cabina, toma cinco decisiones sobre un puesto marciano y observa sus consecuencias.'];
try { world=createScenarioWorld($('world')); }
catch { $('fatal').hidden=false;$('fatal').textContent='No se pudo iniciar la escena 3D. Activa WebGL o abre esta página en un navegador de escritorio compatible.'; }
function closeInspection(recapture=true){
  inspected=null;inspectMode=false;$('object-card').hidden=true;
  if(recapture&&running){world.focus();world.capture();}
}
function openInspection(point){
  inspected=point;learning.visited.add(point.id);world.release();
  $('object-room').textContent=LEARNING_ROOMS[world.currentIndex].name;
  $('object-name').textContent=point.name;$('object-purpose').textContent=point.purpose;
  $('object-question').textContent=point.question;$('object-source').href=point.source;
  $('object-feedback').textContent=learning.mastered.has(point.id)?'Ya resolviste esta pregunta. Puedes repasarla.':'';
  const answers=$('object-answers');answers.replaceChildren();
  point.options.forEach((text,index)=>answers.append(taskButton(text,()=>{
    const result=learning.answer(point.id,index);
    $('object-feedback').textContent=(result.correct?'Correcto. ':'Revisa la idea y vuelve a intentar. ')+result.explanation;
  })));
  const card=$('object-card');card.hidden=false;
  card.style.left=Math.max(12,Math.min(point.x+24,innerWidth-Math.min(360,innerWidth-24)-12))+'px';
  card.style.top=Math.max(90,Math.min(point.y-60,innerHeight-card.offsetHeight-16))+'px';
  card.style.maxHeight=(innerHeight-parseFloat(card.style.top)-16)+'px';
  answers.querySelector('button')?.focus();
}
function updateLearning(){
  const allowed=running&&!transitioning&&$('task').hidden&&$('mental').hidden;
  const container=$('learning-points');container.hidden=!allowed||!!inspected;
  $('inspect-toggle').hidden=!allowed||!!inspected;
  $('room-purpose').textContent=LEARNING_ROOMS[world.currentIndex].purpose;
  $('inspect-toggle').textContent=inspectMode?'I · Volver a caminar':`I · Explorar objetos (${learning.mastered.size}/19)`;
  visiblePoints=allowed?world.learningPoints():[];
  const signature=visiblePoints.map(point=>point.id).join(',');
  if(container.dataset.signature!==signature){
    container.dataset.signature=signature;container.replaceChildren();
    visiblePoints.forEach(point=>{
      const button=taskButton('＋ '+point.name,()=>openInspection(visiblePoints.find(p=>p.id===point.id)??point),'object-point');
      button.dataset.id=point.id;container.append(button);
    });
  }
  for(const point of visiblePoints){
    const button=container.querySelector(`[data-id="${point.id}"]`);
    button.style.left=Math.max(125,Math.min(innerWidth-125,point.x))+'px';button.style.top=point.y+'px';
    button.setAttribute('aria-label',`Inspeccionar ${point.name}`);
  }
}
function say(message){$('message').textContent=message;}
function taskButton(label, action, className=''){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.className=className;button.addEventListener('click',action);return button;
}
function taskSection(title, grid=false){
  const section=document.createElement('div');section.className='task-section';
  const heading=document.createElement('small');heading.textContent=title;section.append(heading);$('task-controls').append(section);
  if(!grid)return section;
  const buttons=document.createElement('div');buttons.className='task-grid';section.append(buttons);return buttons;
}
function renderTask(){
  const controls=$('task-controls');controls.replaceChildren();
  if(mission.stage===3){
    $('task-kicker').textContent='NBL / PROCEDIMIENTO EVA';$('task-title').textContent='Conecta los umbilicales';
    $('task-instruction').textContent='Selecciona una línea y luego el puerto con el mismo rótulo. Cada conexión incorrecta penaliza la sesión.';
    const labels={oxygen:'O₂',data:'DATOS',power:'ENERGÍA'};
    const sources=taskSection('LÍNEAS DEL MÓDULO',true);
    for(const key of ['oxygen','data','power']){
      const button=taskButton(labels[key],()=>{selectedCable=key;renderTask();controls.querySelector('[data-port]')?.focus();},selectedCable===key?'selected':mission.evaLinks.has(key)?'done':'');
      button.disabled=mission.evaLinks.has(key);sources.append(button);
    }
    const ports=taskSection('PUERTOS DE DESTINO',true);
    for(const key of ['power','oxygen','data']){
      const button=taskButton(labels[key],()=>{if(!selectedCable){$('task-feedback').textContent='Elige primero una línea.';return;}const cable=selectedCable;selectedCable=null;act({cable,port:key});});
      button.dataset.port=key;button.disabled=mission.evaLinks.has(key);ports.append(button);
    }
  }else if(mission.stage===4){
    $('task-kicker').textContent='HERA / GESTIÓN DE RECURSOS';$('task-title').textContent='Estabiliza el hábitat';
    $('task-instruction').textContent='Ajusta los tres sistemas hasta su objetivo y confirma el balance.';
    const labels={oxygen:'Oxígeno',water:'Agua',energy:'Energía'},targets={oxygen:80,water:60,energy:70};
    const section=taskSection('RECURSOS ACTUALES / OBJETIVO');
    for(const key of ['oxygen','water','energy']){
      const row=document.createElement('div');row.className='task-resource';
      const value=document.createElement('span');value.textContent=`${labels[key]}  ${mission.resources[key]} %  →  ${targets[key]} %`;
      row.append(value,taskButton('−',()=>act({resource:key,delta:-10})),taskButton('+',()=>act({resource:key,delta:10})));section.append(row);
    }
    controls.append(taskButton('Confirmar balance',()=>act({submit:true}),'task-confirm'));
  }else if(mission.stage===5){
    $('task-kicker').textContent='VAB / DISTRIBUCIÓN ELÉCTRICA';$('task-title').textContent='Restablece los tres buses';
    $('task-instruction').textContent='Cada interruptor cambia su bus y los buses vecinos. Deja los tres en verde.';
    const section=taskSection(`BUS PRINCIPAL · PROPULSIÓN · SEGURIDAD  /  ${mission.powerMoves} ${mission.powerMoves===1?'maniobra':'maniobras'}`,true);
    for(let i=0;i<3;i++) section.append(taskButton(`${['PRINCIPAL','PROPULSIÓN','SEGURIDAD'][i]} · ${mission.powerBuses[i]?'ACTIVO':'INACTIVO'}`,()=>act({switch:i}),mission.powerBuses[i]?'done':''));
  }else if(mission.stage===6){
    const sim=mission.outpost,question=OUTPOST_QUESTIONS[sim.sol];
    $('task-kicker').textContent='CABINA / SIMULACIÓN DE PUESTO MARCIANO';
    $('task-title').textContent=sim.failed?'Puesto en estado crítico':question?.title??'Misión completada';
    $('task-instruction').textContent=sim.failed?'Un recurso cayó por debajo del mínimo de juego. Repite los cinco soles con otra estrategia.':question?.question??'La tripulación completó la misión.';
    const section=taskSection('RECURSOS SIMULADOS · MÍNIMO 20');
    for(const [key,label] of Object.entries({air:'Aire',power:'Energía',shield:'Protección',food:'Alimentos'})){
      const row=document.createElement('div');row.className='outpost-resource';
      const name=document.createElement('span');name.textContent=label;
      const meter=document.createElement('meter');meter.min=0;meter.max=100;meter.low=20;meter.value=sim.resources[key];meter.setAttribute('aria-label',label);
      const value=document.createElement('strong');value.textContent=sim.resources[key]+' %';row.append(name,meter,value);section.append(row);
    }
    if(sim.failed){controls.append(taskButton('Reintentar misión marciana',()=>act({retry:true}),'task-confirm'));return;}
    const choices=taskSection('ELIGE UNA ACCIÓN · CADA OPCIÓN TIENE COSTO');choices.classList.add('outpost-options');
    question.options.forEach((option,index)=>{
      const costs=Object.entries(option.delta).map(([key,value])=>`${{air:'aire',power:'energía',shield:'protección',food:'alimentos'}[key]} ${value>0?'+':''}${value}`).join(' · ');
      choices.append(taskButton(`${index+1}. ${option.text}  /  ${costs}`,()=>act({choice:index})));
    });
    const source=document.createElement('a');source.href=question.url;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Consultar recurso: '+question.source+' ↗';source.className='task-source';controls.append(source);
    const note=document.createElement('p');note.className='task-note';note.textContent='Los porcentajes y resultados son mecánicas ficticias para aprender a comparar costos; no son datos de una misión real.';controls.append(note);
  }
}
function openTask(){selectedCable=null;$('task-feedback').textContent='Sigue el procedimiento para desbloquear la puerta.';$('task').hidden=false;world.release();renderTask();$('task-controls').querySelector('button')?.focus();}
function closeTask(recapture=true){$('task').hidden=true;selectedCable=null;if(recapture&&running&&!mission.complete){world.focus();world.capture();}}
function play(){
  if(!world)return;
  closeInspection(false);started=true;running=true;document.body.classList.add('playing');$('briefing').hidden=true;$('pause').hidden=true;$('game-hud').hidden=false;
  world.focus();if($('mental').hidden)world.capture();
}
function pause(){if(!started||mission.complete)return;if(transitioning){pauseAfterTransition=true;return;}closeInspection(false);running=false;$('task').hidden=true;$('mental').hidden=true;world.release();$('pause').hidden=false;$('resume').focus();}
function reset(){learning=new LearningProgress();closeInspection(false);mission=new FieldTraining();world.reset();$('results').hidden=true;$('mental').hidden=true;$('task').hidden=true;$('loading').hidden=true;selectedCable=null;pauseAfterTransition=false;say('Comandante, dirígete al punto de verificación del traje.');play();}
async function transitionTo(index){
  if(transitioning||!running||index<0||index>=SCENARIOS.length)return;
  transitioning=true;
  $('loading-title').textContent=SCENARIOS[index].title;
  $('loading').hidden=false;
  try{
    await world.load(index);
    say('Escenario cargado: '+SCENARIOS[index].title+'. Continúa con el protocolo.');
    world.focus();
  }catch{
    say('No se pudo cargar la sala. Reinicia el entrenamiento para intentarlo de nuevo.');
    pauseAfterTransition=true;
  }finally{
    transitioning=false;$('loading').hidden=true;
    if(pauseAfterTransition||document.hidden){pauseAfterTransition=false;pause();}
  }
}
function act(answer){
  if(!running||transitioning||mission.complete||inspected||inspectMode)return;
  const near=world.near(),door=world.door(mission.stage);
  if(!near&&door&&!answer){
    if(door.locked)say('Puerta bloqueada. Completa el objetivo de esta sala antes de avanzar.');
    else transitionTo(door.target);
    return;
  }
  if(!near)return;
  if(near.id==='mental'&&mission.target==='mental'&&!answer){$('mental').hidden=false;world.release();$('answer-air').focus();return;}
  if(['eva','habitat','vab','ship'].includes(near.id)&&mission.target===near.id&&!answer){openTask();return;}
  const previousStage=mission.stage;
  const response=mission.interact(near.id,answer);
  say(response);
  if(!$('task').hidden){$('task-feedback').textContent=response;if(mission.stage!==previousStage)closeTask(!mission.complete);else renderTask();}
  if(!$('mental').hidden&&mission.stage!==previousStage){$('mental').hidden=true;world.focus();world.capture();}
  if(mission.complete){
    running=false;world.release();$('mental').hidden=true;$('task').hidden=true;$('results').hidden=false;
    $('score').textContent=mission.score+' / 100';
    $('result-detail').textContent='Siete escenarios y cinco soles de misión completados en '+Math.floor(mission.elapsed)+' segundos. '+mission.errors+' errores registrados. '+(mission.score>=70?'Apto para continuar entrenando.':'Repite el entrenamiento para afianzar el procedimiento.');
    $('result-detail').textContent+=` Aprendizaje: ${learning.mastered.size} de 19 objetos comprendidos.`;
    $('again').focus();
    try{localStorage.setItem('lunar-command-field-report',JSON.stringify({score:mission.score,errors:mission.errors,seconds:mission.elapsed}));}catch{say('Entrenamiento completado. El navegador no permite guardar el informe.');}
  }
}
$('deploy').addEventListener('click',play);$('resume').addEventListener('click',play);
$('restart').addEventListener('click',reset);$('again').addEventListener('click',reset);
$('menu-button').addEventListener('click',pause);$('interact').addEventListener('click',()=>act());
$('answer-air').addEventListener('click',()=>act('atmosphere'));
$('answer-power').addEventListener('click',()=>act('power'));
$('object-close').addEventListener('click',()=>closeInspection());
$('inspect-toggle').addEventListener('click',()=>{inspectMode=!inspectMode;if(inspectMode)world.release();else{world.focus();world.capture();}});
$('task-close').addEventListener('click',()=>closeTask());
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target.closest('input,textarea'))return;
  if(e.code==='KeyI'&&running&&!inspected&&$('task').hidden&&$('mental').hidden){$('inspect-toggle').click();return;}
  if(e.code==='KeyF'&&running&&!inspected&&$('task').hidden&&$('mental').hidden){const point=[...visiblePoints].sort((a,b)=>a.aim-b.aim)[0];if(point)openInspection(point);return;}
  if(inspected){
    if(e.code==='Escape'){closeInspection();return;}
    if(e.code==='Tab'){const list=[...$('object-card').querySelectorAll('button,a')];const index=list.indexOf(document.activeElement);e.preventDefault();list[(index+(e.shiftKey?-1:1)+list.length)%list.length].focus();}
    return;
  }
  if(e.code==='Escape'){if(!$('task').hidden)closeTask();else pause();return;}
  if(e.code==='KeyE')act();
  if(!$('mental').hidden&&e.code==='Digit1')act('atmosphere');
  if(!$('mental').hidden&&e.code==='Digit2')act('power');
});
window.addEventListener('blur',()=>{if(running)pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause();});
let last=performance.now();
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(world){
    if(running&&!transitioning&&!inspected&&!inspectMode)mission.advance(dt);
    const next=world.update(dt,running&&!transitioning&&!inspected&&!inspectMode&&$('mental').hidden&&$('task').hidden,mission.target,mission.stage);
    if(next!==null&&!transitioning)transitionTo(next);
    updateLearning();
    const near=world.near(),door=world.door(mission.stage),seconds=Math.floor(mission.elapsed);
    $('clock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('progress').textContent=mission.stage+' / '+SCENARIOS.length;$('errors').textContent=mission.errors;
    $('position').textContent='X '+world.camera.position.x.toFixed(1)+' / Y '+world.camera.position.y.toFixed(1)+' / Z '+world.camera.position.z.toFixed(1);
    $('objective-title').textContent=titles[mission.stage]??'Entrenamiento completado';
    $('objective-detail').textContent=!mission.complete&&mission.stage>world.currentIndex?'Cruza la puerta abierta para llegar a '+SCENARIOS[world.currentIndex+1].title+'.':details[mission.stage]??'Consulta tu informe de sesión.';
    $('step-count').textContent=String(Math.min(mission.stage+1,SCENARIOS.length)).padStart(2,'0')+' / '+String(SCENARIOS.length).padStart(2,'0');
    $('scene-name').textContent=SCENARIOS[world.currentIndex].title.toUpperCase()+' · EN LÍNEA';
    $('distance').textContent=mission.target?(mission.stage>world.currentIndex?'PUERTA / ':STATIONS[world.currentIndex].name+' · ')+world.distance(mission.target).toFixed(1)+' m':'';
    $('interact').disabled=(!near&&!door)||!running||transitioning;
    $('interact').textContent=near?'E · '+near.name+(near.id==='suit'?' · '+mission.checks+'/3':''):door?(door.locked?'PUERTA BLOQUEADA · E para consultar':'E · Cruzar puerta → '+door.name):'Acércate a la estación o puerta señalizada';
    $('exercise').hidden=!(mission.target==='ared'&&near?.id==='ared');
    $('needle').style.left=mission.gauge*100+'%';$('rep-count').textContent=mission.reps+' / 6';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
