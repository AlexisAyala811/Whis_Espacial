import test from 'node:test';
import assert from 'node:assert/strict';
import { affectedPowerBuses, FieldTraining } from '../../src/core/field-training.js';
import { OutpostTraining } from '../../src/core/outpost-training.js';
import { createMissionAudio } from '../../src/audio/mission-audio.js';

test('power preview identifies exactly the buses the switch changes',()=>{
  for(let index=0;index<3;index++){
    const mission=new FieldTraining();mission.stage=5;const before=[...mission.powerBuses];
    const affected=affectedPowerBuses(index);mission.interact('vab',{switch:index});
    assert.deepEqual(mission.powerBuses.map((value,i)=>value!==before[i]?i:null).filter(value=>value!==null),affected);
  }
  assert.deepEqual(affectedPowerBuses(-1),[]);assert.deepEqual(affectedPowerBuses(3),[]);
});

test('outpost forecast is read-only and matches the committed decision',()=>{
  for(let choice=0;choice<3;choice++){
    const sim=new OutpostTraining(),before=structuredClone(sim.resources),forecast=sim.preview(choice);
    assert.deepEqual(sim.resources,before);assert.equal(sim.sol,0);assert.equal(sim.log.length,0);
    const result=sim.choose(choice);assert.deepEqual(sim.resources,forecast.resources);assert.equal(result.failed,forecast.failed);
  }
  const sim=new OutpostTraining();assert.equal(sim.preview(-1),null);assert.equal(sim.preview(3),null);
});

test('sound starts after a gesture and honors mute, scene and pause',()=>{
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  const events={},windowEvents={},store=new Map(),created=[];
  class Element{constructor(tag){this.tag=tag;this.dataset={};this.handlers={};this.attrs={};this.children=[]}setAttribute(k,v){this.attrs[k]=v}append(...v){this.children.push(...v)}addEventListener(k,v){this.handlers[k]=v}closest(){return null}}
  class Param{constructor(){this.value=0}setTargetAtTime(v){this.value=v}setValueAtTime(v){this.value=v}exponentialRampToValueAtTime(v){this.value=v}}
  class AudioNode{constructor(){this.gain=new Param();this.frequency=new Param()}connect(){}start(){}stop(){}}
  class FakeAudio{constructor(){this.sampleRate=8;this.currentTime=0;this.state='running';this.destination={};this.nodes=[];created.push(this)}make(){const n=new AudioNode();this.nodes.push(n);return n}createGain(){return this.make()}createOscillator(){return this.make()}createBufferSource(){return this.make()}createBiquadFilter(){return this.make()}createBuffer(_a,n){return{getChannelData:()=>new Float32Array(n)}}resume(){return Promise.resolve()}close(){return Promise.resolve()}}
  try{
    const header=new Element('header'),head=new Element('head'),body=new Element('body');
    globalThis.document={head,body,hidden:false,createElement:tag=>new Element(tag),querySelector:q=>q==='header'?header:null,addEventListener:(type,fn)=>events[type]=fn};
    globalThis.window={AudioContext:FakeAudio,addEventListener:(type,fn)=>windowEvents[type]=fn};
    globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
    const audio=createMissionAudio({scene:'suit',active:true});assert.equal(created.length,0);
    events.pointerdown();assert.equal(created.length,1);const context=created[0];assert.equal(context.nodes[0].gain.value,.3);assert.equal(context.nodes[1].gain.value,.042);
    audio.setScene('eva');assert.equal(context.nodes[2].frequency.value,39);
    audio.setActive(false);assert.equal(context.nodes[1].gain.value,0);
    const controls=header.children[0],toggle=controls.children[0];toggle.handlers.click();assert.equal(audio.settings.muted,true);assert.equal(context.nodes[0].gain.value,0);
    const count=context.nodes.length;audio.cue('success');assert.equal(context.nodes.length,count);assert.equal(JSON.parse(store.get('ares-audio-settings-v1')).muted,true);
    const slider=controls.children[1];slider.value='0';slider.handlers.input();assert.equal(audio.settings.muted,true);toggle.handlers.click();assert.equal(audio.settings.volume,.3);assert.equal(audio.settings.muted,false);
    windowEvents.pagehide();events.pointerdown();assert.equal(created.length,2);
  }finally{globalThis.document=old.document;globalThis.window=old.window;globalThis.localStorage=old.localStorage;}
});
