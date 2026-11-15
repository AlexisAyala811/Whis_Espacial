import {waliHint,WALI_FACTS} from './core/wali-policy.js';
import {WALI_NASA_FACTS} from './core/wali-nasa-facts.js';

// Text-only companion with local rules; it neither sends data nor acts for the player.
export function createWali({getContext,showAvatar=true}){
  if(!document.head||!document.body||typeof document.querySelector!=='function')return null;
  if(document.querySelector('[data-wali]'))return;
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='./src/wali.css';document.head.append(stylesheet);
  const root=document.createElement('aside');root.className=showAvatar?'wali':'wali wali-anchored';root.dataset.wali='';root.setAttribute('aria-label',"Wali, mission companion");
  const avatar=document.createElement('img');avatar.src='./assets/wali/wali.png';avatar.alt='';avatar.className='wali-avatar';avatar.draggable=false;avatar.hidden=!showAvatar;
  const bubble=document.createElement('section');bubble.className='wali-bubble';bubble.id='wali-bubble';
  const title=document.createElement('strong');title.textContent="WALI · COMPANION";
  const message=document.createElement('p');message.className='wali-message';message.setAttribute('role','status');
  const source=document.createElement('a');source.className='wali-source';source.textContent="Source: NASA ↗";source.target='_blank';source.rel='noopener noreferrer';source.hidden=true;
  const actions=document.createElement('div');actions.className='wali-actions';
  const hint=document.createElement('button');hint.type='button';hint.textContent="Hint · H";hint.setAttribute('aria-label',"Ask Wali for a hint");
  const fact=document.createElement('button');fact.type='button';fact.textContent="A fact";fact.setAttribute('aria-label',"Ask Wali for a fact");
  const toggle=document.createElement('button');toggle.type='button';toggle.className='wali-toggle';toggle.setAttribute('aria-controls','wali-bubble');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label',"Hide Wali messages");toggle.textContent='−';
  actions.append(hint,fact);bubble.append(title,message,source,actions);root.append(avatar,bubble,toggle);document.body.append(root);
  let currentState='',previousErrors=null,lastFact=Date.now(),collapsed=false;const factIndex={};
  const context=()=>{try{return getContext()??{};}catch{return {};}};
  function setCollapsed(value){collapsed=value;bubble.hidden=value;toggle.textContent=value?'+':'−';toggle.setAttribute('aria-expanded',String(!value));toggle.setAttribute('aria-label',value?"Show Wali messages":"Hide Wali messages");}
  function say(text,url){if(text&&message.textContent!==text)message.textContent=text;source.hidden=!url;if(url)source.href=url;}
  function showHint(){setCollapsed(false);say(waliHint(context()));}
  function showFact(){setCollapsed(false);const c=context(),facts=WALI_NASA_FACTS[c.scene];if(facts?.length){const i=factIndex[c.scene]??0;const fact=facts[i%facts.length];factIndex[c.scene]=i+1;say(fact.text,fact.url);}else say(WALI_FACTS[c.scene]??"Every mission decision has consequences. Check the indicators before continuing.");lastFact=Date.now();}
  hint.addEventListener('click',showHint);fact.addEventListener('click',showFact);toggle.addEventListener('click',()=>setCollapsed(!collapsed));
  document.addEventListener('keydown',event=>{if(root.hidden||event.code!=='KeyH'||event.repeat||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;event.preventDefault();showHint();});
  function refresh(){
    const c=context(),scene=c.scene??'',state=`${scene}:${c.stage??''}:${c.sol??''}:${c.completed??false}:${c.finished??false}`;
    if(scene&&state!==currentState){currentState=state;previousErrors=c.errors??null;say(waliHint(c));lastFact=Date.now();return;}
    if(Number.isInteger(c.errors)){if(previousErrors!==null&&c.errors>previousErrors)say(waliHint(c));previousErrors=c.errors;}
    if(!collapsed&&c.active&&!document.hidden&&Date.now()-lastFact>=35000)showFact();
  }
  say("I am Wali. Press H or choose Hint whenever you need help.");refresh();setInterval(refresh,1500);
  function setAnchor(point){
    if(showAvatar)return;
    root.hidden=!point;
    if(!point)return;
    const w=root.offsetWidth,h=root.offsetHeight;
    root.style.left=Math.max(w/2+8,Math.min(innerWidth-w/2-8,point.x))+'px';
    root.style.top=Math.max(h+8,Math.min(innerHeight-8,point.y-8))+'px';
  }
  return {showHint,showFact,setAnchor,isInteracting(){return root.matches(':hover,:focus-within');}};
}
