import test from 'node:test';
import assert from 'node:assert/strict';
import { createMissionAudio } from '../../src/audio/mission-audio.js';

test('scene ambience follows the current room and stops when paused, hidden, muted or closed',()=>{
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  const events={},windowEvents={},nodes=[];let periodic,cleared=false;
  class Element {constructor(){this.dataset={};this.children=[];this.handlers={};}setAttribute(){}append(...x){this.children.push(...x)}addEventListener(k,v){this.handlers[k]=v}closest(){return null}}
  class Param {constructor(){this.value=0;this.first=null}setTargetAtTime(v){this.value=v}setValueAtTime(v){this.value=v;if(this.first===null)this.first=v}exponentialRampToValueAtTime(v){this.value=v}}
  class AudioNode {constructor(){this.gain=new Param();this.frequency=new Param();nodes.push(this)}connect(){}start(){}stop(){}}
  class Audio {constructor(){this.sampleRate=8;this.currentTime=0;this.state='running';this.destination={};}createGain(){return new AudioNode()}createOscillator(){return new AudioNode()}createBufferSource(){return new AudioNode()}createBiquadFilter(){return new AudioNode()}createBuffer(_c,n){return{getChannelData:()=>new Float32Array(n)}}resume(){return Promise.resolve()}close(){return Promise.resolve()}}
  try {
    const header=new Element(),head=new Element(),body=new Element();
    globalThis.document={head,body,hidden:false,createElement:()=>new Element(),querySelector:q=>q==='header'?header:null,addEventListener:(k,v)=>events[k]=v};
    globalThis.window={AudioContext:Audio,addEventListener:(k,v)=>windowEvents[k]=v,setInterval:fn=>(periodic=fn,7),clearInterval:id=>{assert.equal(id,7);cleared=true}};
    globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
    const audio=createMissionAudio({scene:'eva'});events.pointerdown();assert.equal(typeof periodic,'function');
    let before=nodes.length;periodic();assert.equal(nodes.length,before+2);assert.equal(nodes[before].frequency.first,210);
    audio.setScene('mental');before=nodes.length;periodic();assert.equal(nodes[before].frequency.first,590);
    audio.setActive(false);before=nodes.length;periodic();assert.equal(nodes.length,before);
    audio.setActive(true);document.hidden=true;periodic();assert.equal(nodes.length,before);
    document.hidden=false;header.children[0].children[0].handlers.click();periodic();assert.equal(nodes.length,before);
    windowEvents.pagehide();assert.equal(cleared,true);
  } finally {globalThis.document=old.document;globalThis.window=old.window;globalThis.localStorage=old.localStorage;}
});
