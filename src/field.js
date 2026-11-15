import { playLaunchSequence } from './launch-sequence.js';
import { showSolar } from './nasa-panel.js';
import { FieldTraining, affectedPowerBuses } from './core/field-training.js';
import { createScenarioWorld, STATIONS } from './rendering/scenario-world.js';
import { SCENARIOS } from './core/scenario-route.js';
import { OUTPOST_QUESTIONS } from './core/outpost-training.js';
import { createWali } from './wali.js';
import { createMissionAudio } from './audio/mission-audio.js';

import { LEARNING_ROOMS, LearningProgress } from './core/learning-catalog.js';
let learning=new LearningProgress(), inspectMode=false, inspected=null, visiblePoints=[], nearbyPoint=null;
const $=id=>document.getElementById(id);
let mission=new FieldTraining(),running=false,started=false,transitioning=false,pauseAfterTransition=false,launchSeen=false,selectedCable=null,selectedOutpostChoice=null,world,wali;
const audio=createMissionAudio({scene:'suit',active:false});
const titles=["Check your suit","Control each repetition","Prioritize life support","Connect the EVA module","Balance resources","Restore power","Lead the Mars outpost"];
const details=["Approach console 01. Press E to check pressure, water and telemetry.","Complete six ARED repetitions by pressing E in the green zone.","Resolve the alerts on the ECLSS console.","In the NBL, connect each line to its port. Space moves up; Ctrl without W moves down. Ctrl + W moves faster.","Adjust the habitat oxygen, water and power.","Activate all three rocket power buses.","In the cabin, make five decisions for a Mars outpost and observe the consequences."];
try { world=createScenarioWorld($('world')); }
catch { $('fatal').hidden=false;$('fatal').textContent="Unable to start the 3D scene. Enable WebGL or open this page in a supported desktop browser."; }
function closeInspection(recapture=true){
  inspected=null;inspectMode=false;$('object-card').hidden=true;
  if(recapture&&running){world.focus();world.capture();}
}
function openInspection(point){
  world.poseArms('inspect');
  inspected=point;learning.visited.add(point.id);world.release();
  $('object-room').textContent=LEARNING_ROOMS[world.currentIndex].name;
  $('object-name').textContent=point.name;$('object-purpose').textContent=point.purpose;
  $('object-details').textContent=point.details;
  $('nearby-object').hidden=true;
  $('object-question').textContent=point.question;$('object-source').href=point.source;
  $('object-feedback').textContent=learning.mastered.has(point.id)?"You have already answered this question. You can review it.":'';
  const answers=$('object-answers');answers.replaceChildren();
  point.options.forEach((text,index)=>answers.append(taskButton(text,()=>{
    const result=learning.answer(point.id,index);
    $('object-feedback').textContent=(result.correct?"Correct. ":"Review the concept and try again.")+result.explanation;
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
  $('inspect-toggle').textContent=inspectMode?"I · Return to walking":`I · Explore objects (${learning.mastered.size}/19)`;
  nearbyPoint=allowed&&!inspected?world.nearbyLearningPoint():null;
  const nearby=$('nearby-object');nearby.hidden=!nearbyPoint;
  if(nearbyPoint&&nearby.dataset.id!==nearbyPoint.id){
    nearby.dataset.id=nearbyPoint.id;
    $('nearby-name').textContent=nearbyPoint.name;
    $('nearby-purpose').textContent=nearbyPoint.purpose;
    $('nearby-details').textContent=nearbyPoint.details;
  }
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
    button.setAttribute('aria-label',`Inspect ${point.name}`);
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
    $('task-kicker').textContent="NBL / EVA PROCEDURE";$('task-title').textContent="Connect the umbilicals";
    $('task-instruction').textContent="Select a line and then the port with the matching label. Incorrect connections add a penalty.";
    const labels={oxygen:'O₂',data:"DATA",power:"POWER"};
    $('task-instruction').textContent="Drag a line to its matching port, or select a line and then a port using the keyboard.";
    const overview=document.createElement('div');overview.className='eva-overview';overview.setAttribute('aria-label','Connection status');
    for(const key of ['oxygen','data','power']){const item=document.createElement('span');item.className=mission.evaLinks.has(key)?'linked':'';item.textContent=`${labels[key]}  ${mission.evaLinks.has(key)?'✓ Connected':'○ Waiting'}`;overview.append(item);}controls.append(overview);
    const sources=taskSection("MODULE LINES",true);
    for(const key of ['oxygen','data','power']){
      const button=taskButton(labels[key],()=>{selectedCable=key;renderTask();controls.querySelector('[data-port]')?.focus();},selectedCable===key?'selected':mission.evaLinks.has(key)?'done':'');
      button.disabled=mission.evaLinks.has(key);button.setAttribute('aria-pressed',String(selectedCable===key));
      button.draggable=!button.disabled;button.dataset.line=key;
      button.addEventListener('dragstart',event=>{selectedCable=key;event.dataTransfer.setData('text/plain',key);event.dataTransfer.effectAllowed='link';button.classList.add('dragging');});
      button.addEventListener('dragend',()=>button.classList.remove('dragging'));sources.append(button);
    }
    const ports=taskSection("DESTINATION PORTS",true);
    for(const key of ['power','oxygen','data']){
      const button=taskButton(labels[key],()=>{if(!selectedCable){$('task-feedback').textContent="Select a line first.";return;}const cable=selectedCable;selectedCable=null;act({cable,port:key});});
      button.dataset.port=key;button.disabled=mission.evaLinks.has(key);
      button.setAttribute('aria-label',`${labels[key]} destination port${button.disabled?', connected':''}`);
      button.addEventListener('dragover',event=>{if(!button.disabled){event.preventDefault();event.dataTransfer.dropEffect='link';button.classList.add('drop-ready');}});
      button.addEventListener('dragleave',()=>button.classList.remove('drop-ready'));
      button.addEventListener('drop',event=>{event.preventDefault();button.classList.remove('drop-ready');const cable=event.dataTransfer.getData('text/plain');selectedCable=null;if(['oxygen','data','power'].includes(cable))act({cable,port:key});});ports.append(button);
    }
  }else if(mission.stage===4){
    $('task-kicker').textContent="HERA / RESOURCE MANAGEMENT";$('task-title').textContent="Stabilize the habitat";
    $('task-instruction').textContent="Adjust all three systems to their targets and confirm the balance.";
    const labels={oxygen:"Oxygen",water:"Water",energy:"Energy"},targets={oxygen:80,water:60,energy:70};
    const section=taskSection("CURRENT RESOURCES / TARGET");
    for(const key of ['oxygen','water','energy']){
      const row=document.createElement('div');row.className='task-resource';
      const info=document.createElement('div');info.className='resource-reading';
      const value=document.createElement('span');value.textContent=`${labels[key]}  ${mission.resources[key]} %  →  ${targets[key]} %`;
      const meter=document.createElement('meter');meter.min=0;meter.max=100;meter.value=mission.resources[key];meter.setAttribute('aria-label',`${labels[key]} level`);info.append(value,meter);
      const minus=taskButton('−',()=>act({resource:key,delta:-10})),plus=taskButton('+',()=>act({resource:key,delta:10}));
      for(const [button,dir] of [[minus,'decrease'],[plus,'increase']]){button.setAttribute('aria-label',`${dir} ${labels[key]}`);button.dataset.focusKey=`${key}-${dir}`;}
      minus.disabled=mission.resources[key]<=0;plus.disabled=mission.resources[key]>=100;
      row.append(info,minus,plus);section.append(row);
    }
    controls.append(taskButton("Confirm balance",()=>act({submit:true}),'task-confirm'));
  }else if(mission.stage===5){
    $('task-kicker').textContent="VAB / POWER DISTRIBUTION";$('task-title').textContent="Restore all three buses";
    $('task-instruction').textContent="Each switch changes its bus and neighboring buses. Set all three to green.";
    const labels=['MAIN','PROPULSION','SAFETY'];
    const circuit=document.createElement('div');circuit.className='power-circuit';circuit.setAttribute('aria-label','Power bus status');
    for(let i=0;i<3;i++){const node=document.createElement('span');node.className=mission.powerBuses[i]?'energized':'';node.textContent=`${mission.powerBuses[i]?'●':'○'} ${labels[i]}`;circuit.append(node);}controls.append(circuit);
    const preview=document.createElement('p');preview.className='power-preview';preview.textContent='Focus or point at a switch to see which buses it changes.';preview.setAttribute('aria-live','polite');controls.append(preview);
    const section=taskSection(`${mission.powerMoves} ${mission.powerMoves===1?'move':'moves'} · SELECT A SWITCH`,true);
    for(let i=0;i<3;i++){
      const button=taskButton(`${labels[i]} · ${mission.powerBuses[i]?"ACTIVE":"INACTIVE"}`,()=>act({switch:i}),mission.powerBuses[i]?'done':'');button.dataset.focusKey=`bus-${i}`;
      const show=()=>{preview.textContent='This switch changes: '+affectedPowerBuses(i).map(index=>labels[index]).join(' + ')+'.';};button.addEventListener('focus',show);button.addEventListener('mouseenter',show);section.append(button);
    }
  }else if(mission.stage===6){
    const sim=mission.outpost,question=OUTPOST_QUESTIONS[sim.sol];
    $('task-kicker').textContent="CABIN / MARS OUTPOST SIMULATION";
    $('task-title').textContent=sim.failed?"Outpost in critical condition":question?.title??"Mission complete";
    $('task-instruction').textContent=sim.failed?"A resource fell below the game minimum. Retry the five sols with a different strategy.":question?.question??"The crew completed the mission.";
    const section=taskSection("SIMULATED RESOURCES · MINIMUM 20");
    for(const [key,label] of Object.entries({air:"Air",power:"Energy",shield:"Protection",food:"Food"})){
      const row=document.createElement('div');row.className='outpost-resource';
      const name=document.createElement('span');name.textContent=label;
      const meter=document.createElement('meter');meter.min=0;meter.max=100;meter.low=20;meter.value=sim.resources[key];meter.setAttribute('aria-label',label);
      const value=document.createElement('strong');value.textContent=sim.resources[key]+' %';row.append(name,meter,value);section.append(row);
    }
    if(sim.failed){controls.append(taskButton("Retry Mars mission",()=>act({retry:true}),'task-confirm'));return;}
    if(sim.sol===0){const facts=document.createElement('section');facts.className='nasa-data';facts.setAttribute('aria-live','polite');controls.append(facts);showSolar(facts);}
    const choices=taskSection("CHOOSE AN ACTION · EVERY OPTION HAS A COST");choices.classList.add('outpost-options');
    question.options.forEach((option,index)=>{
      const costs=Object.entries(option.delta).map(([key,value])=>`${{air:'air',power:"power",shield:"protection",food:'food'}[key]} ${value>0?'+':''}${value}`).join(' · ');
      const button=taskButton(`${index+1}. ${option.text}  /  ${costs}`,()=>{selectedOutpostChoice=index;renderTask();$('task-controls').querySelector(`[data-choice="${index}"]`)?.focus();},selectedOutpostChoice===index?'selected':'');
      button.dataset.choice=index;button.setAttribute('aria-pressed',String(selectedOutpostChoice===index));choices.append(button);
    });
    const forecast=document.createElement('p');forecast.className='choice-forecast';forecast.setAttribute('aria-live','polite');
    if(selectedOutpostChoice===null)forecast.textContent='Select an option to preview its resource changes before confirming.';
    else{const projected=sim.preview(selectedOutpostChoice).resources;forecast.textContent='Forecast: '+Object.entries(sim.resources).map(([key,value])=>{const next=projected[key];return `${{air:'Air',power:'Energy',shield:'Protection',food:'Food'}[key]} ${value} → ${next}${next<20?' (critical)':''}`;}).join(' · ')+'.';}
    controls.append(forecast);const confirm=taskButton('Confirm decision',()=>{if(selectedOutpostChoice!==null)act({choice:selectedOutpostChoice});},'task-confirm');confirm.disabled=selectedOutpostChoice===null;controls.append(confirm);
    const source=document.createElement('a');source.href=question.url;source.target='_blank';source.rel='noopener noreferrer';source.textContent="View resource: "+question.source+' ↗';source.className='task-source';controls.append(source);
    const note=document.createElement('p');note.className='task-note';note.textContent="Percentages and outcomes are fictional teaching mechanics, not data from a real mission.";controls.append(note);
  }
}
function openTask(){selectedCable=null;selectedOutpostChoice=null;$('task-feedback').textContent="Follow the procedure to unlock the door.";$('task').hidden=false;world.release();renderTask();$('task-controls').querySelector('button')?.focus();}
function closeTask(recapture=true){$('task').hidden=true;selectedCable=null;if(recapture&&running&&!mission.complete){world.focus();world.capture();}}
function play(){
  if(!world)return;
  closeInspection(false);started=true;running=true;audio.setScene(SCENARIOS[world.currentIndex].id);audio.setActive(true);document.body.classList.add('playing');$('briefing').hidden=true;$('pause').hidden=true;$('game-hud').hidden=false;
  if(!wali)wali=createWali({showAvatar:false,getContext:()=>({scene:SCENARIOS[world.currentIndex].id,sceneIndex:world.currentIndex,stage:mission.stage,completed:mission.complete,checks:mission.checks,reps:mission.reps,errors:mission.errors,buses:[...mission.powerBuses],active:running&&!transitioning&&!inspected&&$('task').hidden&&$('mental').hidden})});
  world.focus();if($('mental').hidden)world.capture();
}
function pause(){if(!started||mission.complete)return;if(transitioning){pauseAfterTransition=true;return;}closeInspection(false);running=false;audio.setActive(false);$('task').hidden=true;$('mental').hidden=true;world.release();$('pause').hidden=false;$('resume').focus();}
function reset(){launchSeen=false;learning=new LearningProgress();closeInspection(false);mission=new FieldTraining();world.reset();$('results').hidden=true;$('mental').hidden=true;$('task').hidden=true;$('loading').hidden=true;selectedCable=null;pauseAfterTransition=false;say("Commander, proceed to the suit check station.");play();}
async function transitionTo(index){
  if(transitioning||!running||index<0||index>=SCENARIOS.length)return;
  transitioning=true;
  try{
    if(index===6 && world.currentIndex===5 && !launchSeen){
      world.release();audio.setScene('launch');audio.cue('launch');
      await playLaunchSequence({container:$('launch-sequence'),canvas:$('launch-canvas'),phase:$('launch-phase'),skip:$('launch-skip')});
      launchSeen=true;
    }
    $('loading-title').textContent=SCENARIOS[index].title;
    $('loading').hidden=false;
    await world.load(index);
    audio.setScene(SCENARIOS[index].id);audio.cue('door');
    say("Scene loaded: "+SCENARIOS[index].title+". Continue with the protocol.");
    world.focus();
  }catch{
    say("Unable to load the room. Restart training to try again.");
    pauseAfterTransition=true;
  }finally{
    transitioning=false;$('loading').hidden=true;
    if(pauseAfterTransition||document.hidden){pauseAfterTransition=false;pause();}
  }
}
function act(answer){
  if(!running||transitioning||mission.complete||inspected||inspectMode)return;
  const near=world.near(),door=world.door(mission.stage);
  if(near||door)world.poseArms('interact');
  if(!near&&door&&!answer){
    if(door.locked)say("Door locked. Complete this room’s objective before proceeding.");
    else transitionTo(door.target);
    return;
  }
  if(!near)return;
  if(near.id==='mental'&&mission.target==='mental'&&!answer){$('mental-feedback').textContent='';$('mental').hidden=false;world.release();$('answer-air').focus();return;}
  if(['eva','habitat','vab','ship'].includes(near.id)&&mission.target===near.id&&!answer){openTask();return;}
  const focusKey=document.activeElement?.dataset?.focusKey;
  const previousStage=mission.stage,previousErrors=mission.errors,previousReps=mission.reps,previousSol=mission.outpost.sol,previousChecks=mission.checks,previousLinks=mission.evaLinks.size;
  const response=mission.interact(near.id,answer);
  if(mission.errors>previousErrors)audio.cue('error');
  else if(mission.stage>previousStage||mission.reps>previousReps||mission.outpost.sol>previousSol||mission.checks>previousChecks||mission.evaLinks.size>previousLinks)audio.cue('success');
  if(mission.outpost.sol!==previousSol||answer?.retry)selectedOutpostChoice=null;
  say(response);
  if(!$('task').hidden){$('task-feedback').textContent=response;if(mission.stage!==previousStage)closeTask(!mission.complete);else{renderTask();if(focusKey)$('task-controls').querySelector(`[data-focus-key="${focusKey}"]`)?.focus();}}
  if(!$('mental').hidden&&mission.stage===previousStage)$('mental-feedback').textContent=response;
  if(!$('mental').hidden&&mission.stage!==previousStage){$('mental').hidden=true;world.focus();world.capture();}
  if(mission.complete){
    running=false;audio.setActive(false);world.release();$('mental').hidden=true;$('task').hidden=true;$('results').hidden=false;
    $('score').textContent=mission.score+' / 100';
    $('result-detail').textContent="Seven scenarios and a five-sol simulation completed in "+Math.floor(mission.elapsed)+' seconds. '+mission.errors+" errors recorded. "+(mission.score>=70?"Ready to continue training.":"Repeat training to reinforce the procedure.");
    $('result-detail').textContent+=` Learning: ${learning.mastered.size} of 19 objects mastered.`;
    $('begin-mars').focus();
    try{localStorage.setItem('lunar-command-field-report',JSON.stringify({score:mission.score,errors:mission.errors,seconds:mission.elapsed}));}catch{say("Training complete. The browser could not save the report.");}
  }
}
$('deploy').addEventListener('click',play);$('resume').addEventListener('click',play);
$('restart').addEventListener('click',reset);$('again').addEventListener('click',reset);
$('begin-mars').addEventListener('click',()=>{$('mars-shell').hidden=false;$('mars-shell-loading').hidden=false;$('mars-frame').hidden=true;$('mars-frame').src='./mars.html';$('close-mars').focus();});
$('mars-frame').addEventListener('load',()=>{if($('mars-shell').hidden||!$('mars-frame').getAttribute('src'))return;$('mars-shell-loading').hidden=true;$('mars-frame').hidden=false;$('mars-frame').focus();});
$('close-mars').addEventListener('click',()=>{$('mars-shell').hidden=true;$('mars-frame').hidden=true;$('mars-frame').removeAttribute('src');$('begin-mars').focus();});
$('menu-button').addEventListener('click',pause);$('interact').addEventListener('click',()=>act());$('repeat-exercise').addEventListener('click',()=>act());
$('answer-air').addEventListener('click',()=>act('atmosphere'));
$('answer-power').addEventListener('click',()=>act('power'));
$('object-close').addEventListener('click',()=>closeInspection());
$('nearby-open').addEventListener('click',()=>{const point=world.nearbyLearningPoint();if(point&&running&&!transitioning&&!inspected&&$('task').hidden&&$('mental').hidden)openInspection(point);});
$('inspect-toggle').addEventListener('click',()=>{inspectMode=!inspectMode;if(inspectMode)world.release();else{world.focus();world.capture();}});
$('task-close').addEventListener('click',()=>closeTask());
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(!$('launch-sequence').hidden){if(e.code==='Escape')$('launch-skip').click();return;}
  if(e.code==='KeyI'&&running&&!inspected&&$('task').hidden&&$('mental').hidden){$('inspect-toggle').click();return;}
  if(e.code==='KeyF'&&running&&!inspected&&$('task').hidden&&$('mental').hidden){visiblePoints=world.learningPoints();const point=world.nearbyLearningPoint()??[...visiblePoints].sort((a,b)=>a.aim-b.aim)[0];if(point)openInspection(point);return;}
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
let last=performance.now(),lastLearning=0,lastStepAt=0,lastStepPosition=null;
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(world){
    if(running&&!transitioning&&!inspected&&!inspectMode)mission.advance(dt);
    const next=world.update(dt,running&&!transitioning&&!inspected&&!inspectMode&&$('mental').hidden&&$('task').hidden,mission.target,mission.stage,wali?.isInteracting());
    wali?.setAnchor(world.waliAnchor());
    if(next!==null&&!transitioning)transitionTo(next);
    // Marker visibility requires scene raycasts; update at most 20 times per second.
    if(now-lastLearning>=50){updateLearning();lastLearning=now;}
    if(running&&!transitioning&&!inspected&&$('task').hidden&&$('mental').hidden){
      const pos=world.camera.position;if(lastStepPosition&&world.currentIndex!==3&&Math.hypot(pos.x-lastStepPosition.x,pos.z-lastStepPosition.z)>.65&&now-lastStepAt>300){audio.cue('step');lastStepAt=now;lastStepPosition={x:pos.x,z:pos.z};}else if(!lastStepPosition)lastStepPosition={x:pos.x,z:pos.z};
    }else lastStepPosition=null;
    const near=world.near(),door=world.door(mission.stage),seconds=Math.floor(mission.elapsed);
    $('clock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('progress').textContent=mission.stage+' / '+SCENARIOS.length;$('errors').textContent=mission.errors;
    $('position').textContent='X '+world.camera.position.x.toFixed(1)+' / Y '+world.camera.position.y.toFixed(1)+' / Z '+world.camera.position.z.toFixed(1);
    $('objective-title').textContent=titles[mission.stage]??"Training complete";
    $('objective-detail').textContent=!mission.complete&&mission.stage>world.currentIndex?"Cross the open door to reach "+SCENARIOS[world.currentIndex+1].title+'.':details[mission.stage]??"Review your session report.";
    $('step-count').textContent=String(Math.min(mission.stage+1,SCENARIOS.length)).padStart(2,'0')+' / '+String(SCENARIOS.length).padStart(2,'0');
    $('scene-name').textContent=SCENARIOS[world.currentIndex].title.toUpperCase()+" · ONLINE";
    $('distance').textContent=mission.target?(mission.stage>world.currentIndex?"DOOR / ":STATIONS[world.currentIndex].name+' · ')+world.distance(mission.target).toFixed(1)+' m':'';
    $('interact').disabled=(!near&&!door)||!running||transitioning;
    $('interact').textContent=near?'E · '+near.name+(near.id==='suit'?' · '+mission.checks+'/3':''):door?(door.locked?"DOOR LOCKED · Press E for details":"E · Cross door → "+door.name):"Approach the marked station or door";
    $('suit-checklist').hidden=!(mission.target==='suit'&&near?.id==='suit');
    $('suit-checklist').querySelectorAll('li').forEach((item,index)=>{item.classList.toggle('checked',index<mission.checks);item.setAttribute('aria-current',index===mission.checks?'step':'false');});
    $('exercise').hidden=!(mission.target==='ared'&&near?.id==='ared');
    $('needle').style.left=mission.gauge*100+'%';$('rep-count').textContent=mission.reps+' / 6';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
