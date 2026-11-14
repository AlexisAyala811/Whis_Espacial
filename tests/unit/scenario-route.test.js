import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, canEnterScenario } from '../../src/core/scenario-route.js';

test('doors unlock in mission order and previously visited rooms remain accessible', () => {
  assert.deepEqual(SCENARIOS.map(room => room.station), ['suit', 'ared', 'mental', 'eva', 'habitat', 'vab']);
  assert.equal(canEnterScenario(1, 0), false);
  assert.equal(canEnterScenario(1, 1), true);
  assert.equal(canEnterScenario(2, 1), false);
  assert.equal(canEnterScenario(2, 2), true);
  assert.equal(canEnterScenario(0, 2), true);
  assert.equal(canEnterScenario(3, 2), false);
  assert.equal(canEnterScenario(3, 3), true);
  assert.equal(canEnterScenario(5, 5), true);
  assert.equal(canEnterScenario(-1, 3), false);
  assert.equal(canEnterScenario(6, 6), false);
});
