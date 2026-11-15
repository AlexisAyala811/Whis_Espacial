import { createMissionAudio } from './audio/mission-audio.js';
import {MarsBase,SYSTEMS,POWER_PER_SOL} from './core/mars-base.js';
import {solarData} from './nasa-panel.js';
import {createWali} from './wali.js';

const audio=createMissionAudio({scene:'mars-base',active:true});
const $=id=>document.getElementById(id);
const labels={air:"Air",water:"Water",food:"Food",health:'Health'};
const systems={life:['Life support',"Keeps the air breathable."],crop:["Crops","Uses water; produces food after accumulating 6 units."],shield:['Shelter',''],comms:["Communications","Sends a message; the reply takes 2 game sols."]};
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
createWali({getContext:()=>({scene:'mars-base',active:!mission.finished,finished:mission.finished,sol:mission.sol,shield:allocation.shield,shieldNeeded:mission.solar.shieldNeeded,air:mission.resources.air})});
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
  const minus=el('button','−'),plus=el('button','+'),value=el('output');minus.type=plus.type='button';minus.setAttribute('aria-label',"Reduce power for "+systems[key][0]);plus.setAttribute('aria-label',"Increase power for "+systems[key][0]);
  minus.addEventListener('click',()=>{if(allocation[key]>0){allocation[key]--;render();}});
  plus.addEventListener('click',()=>{if(spent()<POWER_PER_SOL){allocation[key]++;render();}});
  controls.append(minus,value,plus);row.append(description,controls);$('allocations').append(row);systemNodes[key]={minus,plus,value,hint};
}
function showSolarContext(){
  const target=$('solar-context');target.replaceChildren();const scenario=mission.solar;
  if(scenario.kind==='historical')target.append(el('strong',"NASA DONKI · historical record "),document.createTextNode(`Class ${scenario.classType}, ${scenario.date} (UTC). A fictional game rule assigns ${scenario.shieldNeeded} shelter units for the sol 2 exercise. This is not an alert or a measurement on Mars. `));
  else target.append(el('strong','Fictional solar exercise. '),document.createTextNode("No valid observation is available for this game. You can play without a NASA connection. "));
  const source=el('a',"View NASA source ↗");source.href='https://ccmc.gsfc.nasa.gov/tools/DONKI/';source.target='_blank';source.rel='noopener noreferrer';target.append(source);
}
function render(){
  $('sol-label').textContent=mission.finished?"MISSION ENDED":`SOL ${mission.sol} OF 5`;
  $('mission-title').textContent=mission.finished?(mission.failed?"The base needs help":"Five sols completed!"):"Care for your crew";
  $('mission-status').textContent=mission.finished?(mission.failed?'RETRY':'COMPLETE'):"IN PROGRESS";
  const event=mission.finished?(mission.failed?"A reserve or health reached zero. Review the log and try another strategy.":"Your crew completed the mission. Review which decisions conserved resources."):
    mission.sol===2?`Solar exercise: allocate at least ${mission.solar.shieldNeeded} units to the shelter to protect the crew.`:`Sol ${mission.sol}: allocate power and review the forecast before continuing.`;
  $('event').textContent=event;
  for(const [key,node] of Object.entries(resourceNodes)){node.value.textContent=mission.resources[key]+' %';node.meter.value=mission.resources[key];}
  for(const key of SYSTEMS){const n=systemNodes[key];n.value.textContent=allocation[key];n.minus.disabled=mission.finished||allocation[key]===0;n.plus.disabled=mission.finished||spent()>=POWER_PER_SOL;}
  systemNodes.shield.hint.textContent=`The solar exercise requires at least ${mission.solar.shieldNeeded} units.`;
  $('budget').textContent=`${spent()} / ${POWER_PER_SOL} USED`;
  const prediction=mission.preview(allocation);
  $('preview').textContent=prediction?'Forecast: '+Object.entries(prediction.changes).map(([key,value])=>`${labels[key]} ${value>0?'+':''}${value}`).join(' · ')+`. Crops: ${mission.growth}/6 accumulated. ${mission.message?`Earth’s reply is expected on sol ${mission.message.due}.`:''}`:'';
  $('advance').hidden=mission.finished;$('restart-mars').hidden=!mission.finished;
  const target=$('reports');target.replaceChildren();
  if(!mission.history.length)target.append(el('p',"Results from each sol will appear here.",'help'));
  for(const report of [...mission.history].reverse()){
    const article=el('article');article.append(el('strong',`Sol ${report.sol} · ${report.used} units used`));
    article.append(el('p',`Allocation: air ${report.allocation.life}, crops ${report.allocation.crop}, shelter ${report.allocation.shield}, communications ${report.allocation.comms}.`));
    article.append(el('p',Object.entries(report.changes).map(([key,value])=>`${labels[key]} ${value>0?'+':''}${value}`).join(' · ')));
    for(const note of report.notes)article.append(el('p',note));target.append(article);
  }
}
$('advance').addEventListener('click',()=>{if(!locked)showSolarContext();locked=true;const result=mission.advance(allocation);if(!result)return;audio.cue(mission.failed?'error':'success');saveMission();render();if(mission.finished)$('restart-mars').focus();});
$('restart-mars').addEventListener('click',()=>{locked=false;mission=new MarsBase(solar);allocation={life:3,crop:2,shield:2,comms:1};try{sessionStorage.removeItem(SAVE_KEY);}catch{}showSolarContext();render();$('advance').focus();});
render();if(locked)showSolarContext();
solarData().then(data=>{solar=data;if(!locked){mission=new MarsBase(data);showSolarContext();render();}}).catch(()=>{if(!locked){showSolarContext();render();}});
