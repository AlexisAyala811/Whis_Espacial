import test from 'node:test';
import assert from 'node:assert/strict';
import { OutpostTraining, OUTPOST_QUESTIONS } from '../../src/core/outpost-training.js';

test('five informed decisions complete a viable Mars outpost with visible resource costs', () => {
  const mission = new OutpostTraining();
  assert.equal(OUTPOST_QUESTIONS.length, 5);
  for (let sol = 0; sol < 5; sol++) {
    const before = { ...mission.resources };
    const result = mission.choose([0,1,2,0,1][sol]);
    assert.equal(result.correct, true);
    assert.notDeepEqual(mission.resources, before);
    assert.ok(Object.values(mission.resources).every(value => value >= 20));
  }
  assert.equal(mission.complete, true);
  assert.equal(mission.resources.power, 21);
  assert.equal(mission.log.length, 5);
});

test('unsafe choices can fail, and invalid input cannot skip a sol', () => {
  const mission = new OutpostTraining();
  assert.equal(mission.choose(99), null);
  assert.equal(mission.sol, 0);
  mission.choose(1);
  assert.equal(mission.resources.shield, 25);
  mission.choose(2);
  mission.choose(1);
  mission.choose(1);
  assert.equal(mission.failed, true);
  assert.equal(mission.complete, false);
  assert.equal(mission.choose(0), null);
});
