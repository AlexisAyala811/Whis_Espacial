import test from 'node:test';
import assert from 'node:assert/strict';
import {MarsBase,solarScenario} from '../../src/core/mars-base.js';

test('rejects overspending and invalid inputs without changing state',()=>{
  const m=new MarsBase(),before=JSON.stringify(m);
  assert.equal(m.advance({life:4,crop:4,shield:3,comms:0}),null);
  assert.equal(m.advance({life:-1,crop:2,shield:2,comms:1}),null);
  assert.equal(m.advance({life:1.2,crop:2,shield:2,comms:1}),null);
  assert.equal(JSON.stringify(m),before);
});
test('preview does not change the mission and matches the result',()=>{
  const m=new MarsBase(),a={life:3,crop:2,shield:2,comms:1},before=JSON.stringify(m),preview=m.preview(a);
  assert.equal(JSON.stringify(m),before);assert.deepEqual(m.advance(a),preview);
});
test('crop needs investment over time and message arrives after two sols',()=>{
  const m=new MarsBase(),a={life:3,crop:2,shield:2,comms:1};
  assert.match(m.advance(a).notes.join(' '),/Mensaje enviado/);
  assert.doesNotMatch(m.advance(a).notes.join(' '),/Llegó la respuesta/);
  const third=m.advance(a);assert.match(third.notes.join(' '),/Llegó la respuesta/);assert.match(third.notes.join(' '),/Cosecha/);
  m.advance(a);m.advance(a);assert.equal(m.finished,true);assert.equal(m.failed,false);assert.equal(m.history.length,5);assert.equal(m.advance(a),null);
});
test('unprotected solar exercise and neglect can lead to failure',()=>{
  const m=new MarsBase(),a={life:0,crop:0,shield:0,comms:0};m.advance(a);
  const sol2=m.advance(a);assert.match(sol2.notes.join(' '),/faltó energía/);assert.equal(m.resources.health,82);
  while(!m.finished)m.advance(a);assert.equal(m.failed,true);assert.equal(m.finished,true);
});
test('NASA observation is historical context, invalid or empty data uses fictional exercise',()=>{
  assert.equal(solarScenario(null).kind,'fictional');assert.equal(solarScenario({latest:{classType:'X1.0',beginTime:'bad'}}).kind,'fictional');
  const event={latest:{classType:'M2.1',beginTime:'2026-10-01T01:00:00Z'}};const m=new MarsBase(event);
  assert.equal(m.solar.kind,'historical');assert.equal(m.solar.date,'2026-10-01');assert.equal(m.solar.classType,'M2.1');assert.equal(m.solar.shieldNeeded,2);
  assert.equal(solarScenario({latest:{classType:'X1.0',beginTime:'2026-10-01T01:00:00Z'}}).shieldNeeded,3);
  assert.equal(solarScenario({latest:{classType:'C1.0',beginTime:'2026-10-01T01:00:00Z'}}).shieldNeeded,1);
});
test('the observed class changes only the disclosed game exercise',()=>{
  const weak=new MarsBase({latest:{classType:'C1.0',beginTime:'2026-10-01T01:00:00Z'}});
  const strong=new MarsBase({latest:{classType:'X1.0',beginTime:'2026-10-01T01:00:00Z'}});
  const a={life:3,crop:2,shield:1,comms:1};
  weak.advance(a);strong.advance(a);weak.advance(a);strong.advance(a);
  assert.equal(weak.resources.health,100);assert.equal(strong.resources.health,82);
});
