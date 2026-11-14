import { FieldTraining } from './core/field-training.js';
import { createScenarioWorld, STATIONS } from './rendering/scenario-world.js';
import { SCENARIOS } from './core/scenario-route.js';

const $=id=>document.getElementById(id);
let mission=new FieldTraining(),running=false,started=false,transitioning=false,pauseAfterTransition=false,world;
const titles=['Verifica tu traje','Controla cada repetición','Prioriza el soporte vital'];
const details=['Acércate a la consola 01. Confirma presión, agua y telemetría con E.','Completa seis repeticiones en ARED pulsando E en la zona verde.','Resuelve los avisos de la consola ECLSS.'];
try { world=createScenarioWorld($('world')); }
catch { $('fatal').hidden=false;$('fatal').textContent='No se pudo iniciar la escena 3D. Activa WebGL o abre esta página en un navegador de escritorio compatible.'; }
function say(message){$('message').textContent=message;}
function play(){
  if(!world)return;
  started=true;running=true;document.body.classList.add('playing');$('briefing').hidden=true;$('pause').hidden=true;$('game-hud').hidden=false;
  world.focus();if($('mental').hidden)world.capture();
}
function pause(){if(!started||mission.complete)return;if(transitioning){pauseAfterTransition=true;return;}running=false;world.release();$('pause').hidden=false;$('resume').focus();}
function reset(){mission=new FieldTraining();world.reset();$('results').hidden=true;$('mental').hidden=true;$('loading').hidden=true;pauseAfterTransition=false;say('Comandante, dirígete al punto de verificación del traje.');play();}
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
  if(!running||transitioning||mission.complete)return;
  const near=world.near(),door=world.door(mission.stage);
  if(!near&&door&&!answer){
    if(door.locked)say('Puerta bloqueada. Completa el objetivo de esta sala antes de avanzar.');
    else transitionTo(door.target);
    return;
  }
  if(!near)return;
  if(near.id==='mental'&&mission.target==='mental'&&!answer){$('mental').hidden=false;world.release();$('answer-air').focus();return;}
  say(mission.interact(near.id,answer));
  if(mission.complete){
    running=false;world.release();$('mental').hidden=true;$('results').hidden=false;
    $('score').textContent=mission.score+' / 100';
    $('result-detail').textContent='Tres estaciones completadas en '+Math.floor(mission.elapsed)+' segundos. '+mission.errors+' errores registrados. '+(mission.score>=70?'Apto para continuar entrenando.':'Repite el entrenamiento para afianzar el procedimiento.');
    $('again').focus();
    try{localStorage.setItem('lunar-command-field-report',JSON.stringify({score:mission.score,errors:mission.errors,seconds:mission.elapsed}));}catch{say('Entrenamiento completado. El navegador no permite guardar el informe.');}
  }
}
$('deploy').addEventListener('click',play);$('resume').addEventListener('click',play);
$('restart').addEventListener('click',reset);$('again').addEventListener('click',reset);
$('menu-button').addEventListener('click',pause);$('interact').addEventListener('click',()=>act());
$('answer-air').addEventListener('click',()=>act('atmosphere'));
$('answer-power').addEventListener('click',()=>act('power'));
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target.closest('input,textarea'))return;
  if(e.code==='Escape')pause();
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
    if(running&&!transitioning)mission.advance(dt);
    const next=world.update(dt,running&&!transitioning&&$('mental').hidden,mission.target,mission.stage);
    if(next!==null&&!transitioning)transitionTo(next);
    const near=world.near(),door=world.door(mission.stage),seconds=Math.floor(mission.elapsed);
    $('clock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('progress').textContent=mission.stage+' / 3';$('errors').textContent=mission.errors;
    $('position').textContent='X '+world.camera.position.x.toFixed(1)+' / Z '+world.camera.position.z.toFixed(1);
    $('objective-title').textContent=titles[mission.stage]??'Entrenamiento completado';
    $('objective-detail').textContent=!mission.complete&&mission.stage>world.currentIndex?'Cruza la puerta abierta para llegar a '+SCENARIOS[world.currentIndex+1].title+'.':details[mission.stage]??'Consulta tu informe de sesión.';
    $('step-count').textContent='0'+Math.min(mission.stage+1,3)+' / 03';
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
