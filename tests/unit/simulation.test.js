import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../../src/core/mission-state.js';
import { Simulation } from '../../src/core/simulation.js';

test('fixed steps reproduce the same physical snapshot from the same seed', () => {
  const first = new Simulation(createSession({ seed: 77 }));
  const second = new Simulation(createSession({ seed: 77 }));
  first.start(); second.start();
  first.activateStation('ared-strength'); second.activateStation('ared-strength');
  for (let index = 0; index < 24; index += 1) {
    first.advance(50);
    second.advance(50);
  }
  assert.deepEqual(first.snapshot(), second.snapshot());
  assert.equal(first.session.missionTimeMs, 1200);
});

test('time does not advance before a session starts', () => {
  const simulation = new Simulation(createSession());
  simulation.advance(5000);
  assert.equal(simulation.session.missionTimeMs, 0);
});
