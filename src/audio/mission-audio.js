// Locally synthesized ambience and cues. No microphone, voice, network or audio files.
const SETTINGS_KEY='ares-audio-settings-v1';
const PROFILES={
  suit:[62,260,125,.11,.22],ared:[72,410,154,.12,.55],mental:[55,330,210,.075,.32],
  eva:[39,150,83,.13,.12],habitat:[64,280,145,.075,.2],vab:[48,190,97,.1,.28],
  ship:[52,225,119,.1,.15],launch:[42,165,65,.17,.65],
  'mars-surface':[36,125,71,.1,.09],'mars-habitat':[58,240,125,.09,.18],'mars-base':[54,230,170,.07,.22]
};
// Gentle synthesized details are scene-specific, not recordings or speech.
const OCCASIONAL={suit:'air',ared:'equipment',mental:'telemetry',eva:'bubble',habitat:'air',vab:'mechanical',ship:'telemetry','mars-surface':'wind','mars-habitat':'air','mars-base':'telemetry'};
export function createMissionAudio({scene='suit',active=true}={}){
  if(typeof document==='undefined'||typeof document.querySelector!=='function'||!document.head||!document.body)return {cue(){},unlock(){},setScene(){},setActive(){},get settings(){return {muted:true,volume:0}}};
  let settings={muted:false,volume:.3};
  try {const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(saved&&typeof saved.muted==='boolean'&&Number.isFinite(saved.volume))settings={muted:saved.muted,volume:Math.max(0,Math.min(1,saved.volume))};}catch{}
  let context=null,master=null,ambient=null,hum=null,filter=null,sceneTone=null,sceneToneGain=null,modulator=null,timer=null,currentScene=scene,playing=active,unavailable=false;
  const host=document.querySelector('header');
  const controls=document.createElement('div');controls.className='mission-audio';controls.setAttribute('role','group');controls.setAttribute('aria-label','Sound settings');
  const toggle=document.createElement('button');toggle.type='button';toggle.className='sound-toggle';
  const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.step='5';slider.setAttribute('aria-label','Sound volume');
  controls.append(toggle,slider);(host??document.body).append(controls);
  if(!document.querySelector('link[data-mission-audio]')){const css=document.createElement('link');css.rel='stylesheet';css.href='./src/audio/mission-audio.css';css.dataset.missionAudio='';document.head.append(css);}
  function save(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{}}
  function refresh(){toggle.textContent=settings.muted?'Sound off':'Sound on';toggle.setAttribute('aria-label',settings.muted?'Turn sound on':'Mute sound');toggle.setAttribute('aria-pressed',String(!settings.muted));slider.value=String(Math.round(settings.volume*100));}
  function updateGain(){if(!context)return;const now=context.currentTime;master.gain.setTargetAtTime(settings.muted?0:settings.volume,now,.04);ambient.gain.setTargetAtTime(playing && !document.hidden ? .042 : 0,now,.25);}
  function applyScene(){if(!context)return;const profile=PROFILES[currentScene]??PROFILES.suit,now=context.currentTime;hum.frequency.setTargetAtTime(profile[0],now,.4);filter.frequency.setTargetAtTime(profile[1],now,.4);sceneTone.frequency.setTargetAtTime(profile[2],now,.4);sceneToneGain.gain.setTargetAtTime(profile[3],now,.4);modulator.frequency.setTargetAtTime(profile[4],now,.4);}
  function unlock(){
    if(unavailable||settings.muted)return;
    try{
      if(!context){
        const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){unavailable=true;toggle.disabled=slider.disabled=true;toggle.textContent='Sound unavailable';return;}
        context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination);
        ambient=context.createGain();ambient.gain.value=0;ambient.connect(master);
        hum=context.createOscillator();hum.type='sine';hum.frequency.value=62;const humGain=context.createGain();humGain.gain.value=.42;hum.connect(humGain);humGain.connect(ambient);hum.start();
        const data=context.createBuffer(1,context.sampleRate*2,context.sampleRate),channel=data.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=(Math.random()*2-1)*.32;
        const noise=context.createBufferSource();noise.buffer=data;noise.loop=true;filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=260;noise.connect(filter);filter.connect(ambient);noise.start();
        sceneTone=context.createOscillator();sceneTone.type='triangle';sceneToneGain=context.createGain();sceneToneGain.gain.value=0;sceneTone.connect(sceneToneGain);sceneToneGain.connect(ambient);sceneTone.start();
        modulator=context.createOscillator();modulator.type='sine';const modulation=context.createGain();modulation.gain.value=.025;modulator.connect(modulation);modulation.connect(sceneToneGain.gain);modulator.start();
        applyScene();updateGain();
        if(typeof window.setInterval==='function'&&timer===null)timer=window.setInterval(()=>{if(playing&&!document.hidden&&context?.state==='running'&&!settings.muted)cue(OCCASIONAL[currentScene]??'air');},6500);
      }
      if(context.state==='suspended')context.resume().catch(()=>{});
    }catch{unavailable=true;toggle.disabled=slider.disabled=true;toggle.textContent='Sound unavailable';}
  }
  function cue(kind='select'){
    if(!context||!playing||settings.muted||document.hidden||context.state!=='running')return;
    const presets={select:[540,440,.045],success:[660,880,.14],error:[220,150,.16],door:[280,420,.24],step:[95,65,.055],launch:[90,55,.45],bubble:[210,470,.22],equipment:[185,125,.12],telemetry:[590,640,.065],mechanical:[110,78,.24],air:[150,115,.3],wind:[80,55,.45]};
    const preset=kind==='step'&&currentScene==='mars-surface'?[70,42,.09]:presets[kind]??presets.select;
    const [start,end,duration]=preset,now=context.currentTime;
    const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=kind==='error'?'triangle':'sine';oscillator.frequency.setValueAtTime(start,now);oscillator.frequency.exponentialRampToValueAtTime(end,now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(['bubble','equipment','telemetry','mechanical','air','wind'].includes(kind)?.018:kind==='step'?.045:.07,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);oscillator.connect(gain);gain.connect(master);oscillator.start(now);oscillator.stop(now+duration+.01);
  }
  toggle.addEventListener('click',()=>{settings.muted=!settings.muted;if(!settings.muted&&settings.volume===0)settings.volume=.3;save();refresh();if(!settings.muted)unlock();updateGain();});
  slider.addEventListener('input',()=>{settings.volume=Number(slider.value)/100;settings.muted=settings.volume===0;save();refresh();unlock();updateGain();});
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
  document.addEventListener('visibilitychange',updateGain);
  document.addEventListener('click',event=>{if(event.target.closest('button')&&!event.target.closest('.mission-audio'))cue('select');});
  window.addEventListener('storage',event=>{if(event.key!==SETTINGS_KEY)return;try{const value=JSON.parse(event.newValue);if(value&&typeof value.muted==='boolean'&&Number.isFinite(value.volume)){settings={muted:value.muted,volume:Math.max(0,Math.min(1,value.volume))};refresh();updateGain();}}catch{}});
  window.addEventListener('pagehide',()=>{if(timer!==null){window.clearInterval(timer);timer=null;}if(context){context.close().catch(()=>{});context=master=ambient=hum=filter=sceneTone=sceneToneGain=modulator=null;}});
  refresh();
  return {cue,unlock,setScene(value){currentScene=value;applyScene();},setActive(value){playing=Boolean(value);updateGain();},get settings(){return {...settings}}};
}
