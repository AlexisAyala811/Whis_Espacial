import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../../src/core/mission-state.js';
import { Simulation } from '../../src/core/simulation.js';

test('physical stations update fatigue telemetry while active', () => {
  const simulation = new Simulation(createSession({ seed: 3 }));
  simulation.start();
  simulation.activateStation('ared-strength');
  for (let index = 0; index < 100; index += 1) simulation.advance(50);
  assert.ok(simulation.session.telemetry.fatigue.value > 0.12);
  assert.ok(simulation.session.telemetry.heartRate.value > 92);
});

test('physical station can be completed after activation', () => {
  const simulation = new Simulation(createSession());
  simulation.start();
  assert.equal(simulation.activateStation('t2-cardio'), true);
  assert.equal(simulation.completeStation('t2-cardio'), true);
  assert.equal(simulation.session.stations.find((station) => station.id === 't2-cardio').status, 'complete');
});
