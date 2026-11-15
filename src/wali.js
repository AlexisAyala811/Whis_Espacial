import {waliHint,WALI_FACTS} from './core/wali-policy.js';

// Text-only companion with local rules; it neither sends data nor acts for the player.
export function createWali({getContext}){
  if(!document.head||!document.body||typeof document.querySelector!=='function')return null;
  if(document.querySelector('[data-wali]'))return;
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='./src/wali.css';document.head.append(stylesheet);
  const root=document.createElement('aside');root.className='wali';root.dataset.wali='';root.setAttribute('aria-label','Wali, compañero de misión');
  const avatar=document.createElement('img');avatar.src='./assets/wali/wali.png';avatar.alt='';avatar.className='wali-avatar';avatar.draggable=false;
  const bubble=document.createElement('section');bubble.className='wali-bubble';bubble.id='wali-bubble';
  const title=document.createElement('strong');title.textContent='WALI · COMPAÑERO';
  const message=document.createElement('p');message.className='wali-message';message.setAttribute('role','status');
  const actions=document.createElement('div');actions.className='wali-actions';
  const hint=document.createElement('button');hint.type='button';hint.textContent='Pista · H';hint.setAttribute('aria-label','Pedir una pista a Wali');
  const fact=document.createElement('button');fact.type='button';fact.textContent='Un dato';fact.setAttribute('aria-label','Pedir un dato a Wali');
  const toggle=document.createElement('button');toggle.type='button';toggle.className='wali-toggle';toggle.setAttribute('aria-controls','wali-bubble');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Ocultar mensajes de Wali');toggle.textContent='−';
  actions.append(hint,fact);bubble.append(title,message,actions);root.append(avatar,bubble,toggle);document.body.append(root);
  let currentState='',previousErrors=null,lastFact=Date.now(),collapsed=false;
  const context=()=>{try{return getContext()??{};}catch{return {};}};
  function setCollapsed(value){collapsed=value;bubble.hidden=value;toggle.textContent=value?'+':'−';toggle.setAttribute('aria-expanded',String(!value));toggle.setAttribute('aria-label',value?'Mostrar mensajes de Wali':'Ocultar mensajes de Wali');}
  function say(text){if(text&&message.textContent!==text)message.textContent=text;}
  function showHint(){setCollapsed(false);say(waliHint(context()));}
  function showFact(){setCollapsed(false);const c=context();say(WALI_FACTS[c.scene]??'Cada decisión de la misión tiene consecuencias. Observa los indicadores antes de continuar.');lastFact=Date.now();}
  hint.addEventListener('click',showHint);fact.addEventListener('click',showFact);toggle.addEventListener('click',()=>setCollapsed(!collapsed));
  document.addEventListener('keydown',event=>{if(event.code!=='KeyH'||event.repeat||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;event.preventDefault();showHint();});
  function refresh(){
    const c=context(),scene=c.scene??'',state=`${scene}:${c.stage??''}:${c.sol??''}:${c.completed??false}:${c.finished??false}`;
    if(scene&&state!==currentState){currentState=state;previousErrors=c.errors??null;say(waliHint(c));lastFact=Date.now();return;}
    if(Number.isInteger(c.errors)){if(previousErrors!==null&&c.errors>previousErrors)say(waliHint(c));previousErrors=c.errors;}
    if(!collapsed&&c.active&&!document.hidden&&Date.now()-lastFact>=70000){say(WALI_FACTS[scene]);lastFact=Date.now();}
  }
  say('Soy Wali. Si necesitas ayuda, pulsa H o elige «Pista».');refresh();setInterval(refresh,1500);
  return {showHint,showFact};
}
