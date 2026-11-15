import test from 'node:test';
import assert from 'node:assert/strict';

test('mission remains playable for five turns when NASA is unavailable',async()=>{
  class Node {
    constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.textContent='';this.hidden=false;}
    append(...items){this.children.push(...items);}
    replaceChildren(...items){this.children=[...items];}
    setAttribute(name,value){this[name]=value;}
    addEventListener(name,fn){this.listeners[name]=fn;}
    focus(){this.focused=true;}
    click(){this.listeners.click?.();}
  }
  const ids=['resources','allocations','sol-label','mission-title','mission-status','event','budget','preview','advance','restart-mars','reports','solar-context'];
  const nodes=Object.fromEntries(ids.map(id=>[id,new Node()]));
  globalThis.document={getElementById:id=>nodes[id],createElement:tag=>new Node(tag),createTextNode:text=>({textContent:text})};
  globalThis.fetch=async()=>({ok:false});
  await import('../../src/mars-base-ui.js');
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(nodes['sol-label'].textContent,'SOL 1 DE 5');
  assert.match(nodes.preview.textContent,/Previsto/);
  for(let i=0;i<5;i++)nodes.advance.click();
  assert.equal(nodes['mission-status'].textContent,'COMPLETADA');
  assert.equal(nodes.reports.children.length,5);
  nodes['restart-mars'].click();assert.equal(nodes['sol-label'].textContent,'SOL 1 DE 5');
});
