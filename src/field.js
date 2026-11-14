import { FieldTraining } from './core/field-training.js';
import { createFieldScene, STATIONS } from './rendering/field-scene.js';

const $=id=>document.getElementById(id);
let mission=new FieldTraining(),running=false,started=false,world;
const titles=['Verifica tu traje','Controla cada repetición','Prioriza el soporte vital'];
const details=['Acércate a la consola 01. Confirma presión, agua y telemetría con E.','Busca ARED a la izquierda. Completa seis repeticiones pulsando E en la zona verde.','Busca la consola ECLSS a la derecha y resuelve los avisos concurrentes.'];
try { world=createFieldScene($('world')); }
catch { $('fatal').hidden=false;$('fatal').textContent='No se pudo iniciar la escena 3D. Activa WebGL o abre esta página en un navegador de escritorio compatible.'; }
function say(message){$('message').textContent=message;}
function play(){
  if(!world)return;
  started=true;running=true;document.body.classList.add('playing');$('briefing').hidden=true;$('pause').hidden=true;$('game-hud').hidden=false;
  world.focus();if($('mental').hidden)world.capture();
}
function pause(){if(!started||mission.complete)return;running=false;world.release();$('pause').hidden=false;$('resume').focus();}
function reset(){mission=new FieldTraining();world.reset();$('results').hidden=true;$('mental').hidden=true;say('Comandante, dirígete al punto de verificación del traje.');play();}
function act(answer){
  if(!running||mission.complete)return;
  const near=world.near();if(!near)return;
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
    if(running)mission.advance(dt);
    world.update(dt,running&&$('mental').hidden,mission.target);
    const near=world.near(),seconds=Math.floor(mission.elapsed);
    $('clock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('progress').textContent=mission.stage+' / 3';$('errors').textContent=mission.errors;
    $('position').textContent='X '+world.camera.position.x.toFixed(1)+' / Z '+world.camera.position.z.toFixed(1);
    $('objective-title').textContent=titles[mission.stage]??'Entrenamiento completado';
    $('objective-detail').textContent=details[mission.stage]??'Consulta tu informe de sesión.';
    $('step-count').textContent='0'+Math.min(mission.stage+1,3)+' / 03';
    $('distance').textContent=mission.target?STATIONS.find(s=>s.id===mission.target).name+' · '+world.distance(mission.target).toFixed(1)+' m':'';
    $('interact').disabled=!near||!running;
    $('interact').textContent=near?'E · '+near.name+(near.id==='suit'?' · '+mission.checks+'/3':''):'Acércate a la estación señalizada';
    $('exercise').hidden=!(mission.target==='ared'&&near?.id==='ared');
    $('needle').style.left=mission.gauge*100+'%';$('rep-count').textContent=mission.reps+' / 6';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
