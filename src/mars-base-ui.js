import {MarsBase,SYSTEMS,POWER_PER_SOL} from './core/mars-base.js';
import {solarData} from './nasa-panel.js';

const $=id=>document.getElementById(id);
const labels={air:'Aire',water:'Agua',food:'Alimentos',health:'Salud'};
const systems={life:['Soporte vital','Mantiene el aire respirable.'],crop:['Cultivo','Usa agua; al acumular 6 unidades produce alimentos.'],shield:['Refugio',''],comms:['Comunicación','Envía un mensaje; la respuesta tarda 2 soles del juego.']};
const SAVE_KEY='lunar-command-mars-base-v1';
function restoreMission(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(SAVE_KEY));
    if(!saved||!Array.isArray(saved.allocations)||saved.allocations.length>5)return null;
    const candidate=new MarsBase(saved.solar);
    for(const allocation of saved.allocations)if(!candidate.advance(allocation))return null;
    return candidate;
  }catch{return null;}
}
function saveMission(){
  try{
    const solar=mission.solar.kind==='historical'?{latest:{classType:mission.solar.classType,beginTime:mission.solar.date+'T00:00:00Z'}}:null;
    sessionStorage.setItem(SAVE_KEY,JSON.stringify({solar,allocations:mission.history.map(item=>item.allocation)}));
  }catch{/* The current session remains playable when storage is unavailable. */}
}
let solar=null,mission=restoreMission()??new MarsBase(),locked=mission.history.length>0,allocation={life:3,crop:2,shield:2,comms:1};
const resourceNodes={},systemNodes={};
function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
for(const [key,label] of Object.entries(labels)){
  const card=el('div',undefined,'resource'),name=el('span',label),value=el('strong'),meter=document.createElement('meter');
  meter.min=0;meter.max=100;meter.low=25;meter.setAttribute('aria-label',label);card.append(name,value,meter);$('resources').append(card);resourceNodes[key]={value,meter};
}
function spent(){return SYSTEMS.reduce((sum,key)=>sum+allocation[key],0);}
for(const key of SYSTEMS){
  const row=el('div',undefined,'allocation'),description=el('div'),controls=el('div',undefined,'stepper');
  const hint=el('small',systems[key][1]);description.append(el('strong',systems[key][0]),hint);
  const minus=el('button','−'),plus=el('button','+'),value=el('output');minus.type=plus.type='button';minus.setAttribute('aria-label','Reducir energía para '+systems[key][0]);plus.setAttribute('aria-label','Aumentar energía para '+systems[key][0]);
  minus.addEventListener('click',()=>{if(allocation[key]>0){allocation[key]--;render();}});
  plus.addEventListener('click',()=>{if(spent()<POWER_PER_SOL){allocation[key]++;render();}});
  controls.append(minus,value,plus);row.append(description,controls);$('allocations').append(row);systemNodes[key]={minus,plus,value,hint};
}
function showSolarContext(){
  const target=$('solar-context');target.replaceChildren();const scenario=mission.solar;
  if(scenario.kind==='historical')target.append(el('strong','NASA DONKI · registro histórico '),document.createTextNode(`Clase ${scenario.classType}, ${scenario.date} (UTC). Una regla inventada del juego asigna ${scenario.shieldNeeded} unidades de refugio para el ejercicio del sol 2. No es una alerta ni una medición en Marte. `));
  else target.append(el('strong','Ejercicio solar ficticio. '),document.createTextNode('No hay una observación válida disponible para esta partida. Puedes jugar sin conexión a NASA. '));
  const source=el('a','Ver fuente NASA ↗');source.href='https://ccmc.gsfc.nasa.gov/tools/DONKI/';source.target='_blank';source.rel='noopener noreferrer';target.append(source);
}
function render(){
  $('sol-label').textContent=mission.finished?'MISIÓN FINALIZADA':`SOL ${mission.sol} DE 5`;
  $('mission-title').textContent=mission.finished?(mission.failed?'La base necesita ayuda':'¡Cinco soles completados!'):'Cuida a tu tripulación';
  $('mission-status').textContent=mission.finished?(mission.failed?'REINTENTAR':'COMPLETADA'):'EN CURSO';
  const event=mission.finished?(mission.failed?'Una reserva o la salud llegó a cero. Revisa la bitácora y prueba otra estrategia.':'Tu tripulación terminó la misión. Mira qué decisiones ayudaron a conservar los recursos.'):
    mission.sol===2?`Ejercicio solar: asigna al menos ${mission.solar.shieldNeeded} unidades al refugio para proteger a la tripulación.`:`Sol ${mission.sol}: reparte la energía y revisa el efecto previsto antes de continuar.`;
  $('event').textContent=event;
  for(const [key,node] of Object.entries(resourceNodes)){node.value.textContent=mission.resources[key]+' %';node.meter.value=mission.resources[key];}
  for(const key of SYSTEMS){const n=systemNodes[key];n.value.textContent=allocation[key];n.minus.disabled=mission.finished||allocation[key]===0;n.plus.disabled=mission.finished||spent()>=POWER_PER_SOL;}
  systemNodes.shield.hint.textContent=`En el ejercicio solar necesita al menos ${mission.solar.shieldNeeded} unidades.`;
  $('budget').textContent=`${spent()} / ${POWER_PER_SOL} USADAS`;
  const prediction=mission.preview(allocation);
  $('preview').textContent=prediction?'Previsto: '+Object.entries(prediction.changes).map(([key,value])=>`${labels[key]} ${value>0?'+':''}${value}`).join(' · ')+`. Cultivo: ${mission.growth}/6 acumuladas. ${mission.message?`Respuesta de la Tierra prevista para el sol ${mission.message.due}.`:''}`:'';
  $('advance').hidden=mission.finished;$('restart-mars').hidden=!mission.finished;
  const target=$('reports');target.replaceChildren();
  if(!mission.history.length)target.append(el('p','Aquí verás qué pasó después de cada sol.','help'));
  for(const report of [...mission.history].reverse()){
    const article=el('article');article.append(el('strong',`Sol ${report.sol} · ${report.used} unidades usadas`));
    article.append(el('p',`Reparto: aire ${report.allocation.life}, cultivo ${report.allocation.crop}, refugio ${report.allocation.shield}, comunicación ${report.allocation.comms}.`));
    article.append(el('p',Object.entries(report.changes).map(([key,value])=>`${labels[key]} ${value>0?'+':''}${value}`).join(' · ')));
    for(const note of report.notes)article.append(el('p',note));target.append(article);
  }
}
$('advance').addEventListener('click',()=>{if(!locked)showSolarContext();locked=true;const result=mission.advance(allocation);if(!result)return;saveMission();render();if(mission.finished)$('restart-mars').focus();});
$('restart-mars').addEventListener('click',()=>{locked=false;mission=new MarsBase(solar);allocation={life:3,crop:2,shield:2,comms:1};try{sessionStorage.removeItem(SAVE_KEY);}catch{}showSolarContext();render();$('advance').focus();});
render();if(locked)showSolarContext();
solarData().then(data=>{solar=data;if(!locked){mission=new MarsBase(data);showSolarContext();render();}}).catch(()=>{if(!locked){showSolarContext();render();}});
