import test from 'node:test';
import assert from 'node:assert/strict';
import { FieldTraining } from '../../src/core/field-training.js';

test('route requires suit checks, six timed repetitions and the correct priority', () => {
  const mission = new FieldTraining();
  mission.interact('mental','atmosphere');
  assert.equal(mission.stage,0);
  for(let i=0;i<3;i++) mission.interact('suit');
  assert.equal(mission.stage,1);
  for(let i=0;i<6000&&mission.stage===1;i++){
    mission.advance(.02);
    if(mission.gauge>=.4&&mission.gauge<=.6&&mission.elapsed-mission.lastRep>.6) mission.interact('ared');
  }
  assert.equal(mission.reps,6);
  assert.equal(mission.stage,2);
  mission.interact('mental','power');
  assert.equal(mission.complete,false);
  assert.equal(mission.errors,1);
  mission.interact('mental','atmosphere');
  assert.equal(mission.stage,3);
  mission.interact('eva',{cable:'oxygen',port:'oxygen'});
  mission.interact('eva',{cable:'data',port:'data'});
  mission.interact('eva',{cable:'power',port:'power'});
  assert.equal(mission.stage,4);
  for(const [resource,steps] of [['oxygen',2],['water',2],['energy',-2]])
    for(let i=0;i<Math.abs(steps);i++) mission.interact('habitat',{resource,delta:Math.sign(steps)*10});
  mission.interact('habitat',{submit:true});
  assert.equal(mission.stage,5);
  mission.interact('vab',{switch:0});
  mission.interact('vab',{switch:2});
  assert.equal(mission.stage,6);
  assert.equal(mission.complete,false);
  for(const choice of [0,1,2,0,1]) mission.interact('ship',{choice});
  assert.equal(mission.complete,true);
  assert.equal(mission.score,90);
  const elapsed=mission.elapsed;
  mission.advance(.1);mission.interact('mental','power');
  assert.equal(mission.elapsed,elapsed);
  assert.equal(mission.errors,1);
});

test('EVA, habitat and power tasks reject incorrect procedures without skipping a room', () => {
  const mission = new FieldTraining();
  mission.stage = 3;
  mission.interact('eva',{cable:'oxygen',port:'data'});
  assert.equal(mission.evaLinks.size,0);
  assert.equal(mission.errors,1);
  for(const cable of ['oxygen','data','power']) mission.interact('eva',{cable,port:cable});
  mission.interact('habitat',{submit:true});
  assert.equal(mission.stage,4);
  assert.equal(mission.errors,2);
  for(const [resource,delta] of [['oxygen',20],['water',20],['energy',-20]])
    for(let i=0;i<2;i++) mission.interact('habitat',{resource,delta:Math.sign(delta)*10});
  mission.interact('habitat',{submit:true});
  mission.interact('vab',{switch:1});
  assert.equal(mission.complete,false);
});

test('off-target timing penalizes once, and rapid repeated input is ignored', () => {
  const mission = new FieldTraining();
  for(let i=0;i<3;i++) mission.interact('suit');
  for(let i=0;i<8;i++) mission.advance(.1);
  mission.interact('ared');
  mission.interact('ared');
  assert.equal(mission.reps,0);
  assert.equal(mission.errors,1);
  assert.equal(new FieldTraining().score,100);
});
