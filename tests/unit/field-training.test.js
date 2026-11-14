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
  assert.equal(mission.complete,true);
  assert.equal(mission.score,90);
  const elapsed=mission.elapsed;
  mission.advance(.1);mission.interact('mental','power');
  assert.equal(mission.elapsed,elapsed);
  assert.equal(mission.errors,1);
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
