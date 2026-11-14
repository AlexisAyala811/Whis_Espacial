import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../../src/core/mission-state.js';
import { Simulation } from '../../src/core/simulation.js';

test('mental scenario activates concurrent alerts at the defined trigger', () => {
  const simulation = new Simulation(createSession({ scenarioId: 'mental-readiness', seed: 11 }));
  simulation.start();
  for (let index = 0; index < 300; index += 1) simulation.advance(50);
  assert.equal(simulation.session.telemetry.activeAlerts.value, 2);
  assert.equal(simulation.mentalEvents.every((event) => event.activated), true);
});

test('preferred mental actions recover both concurrent alerts', () => {
  const simulation = new Simulation(createSession({ scenarioId: 'mental-readiness', seed: 11 }));
  simulation.start();
  for (let index = 0; index < 300; index += 1) simulation.advance(50);
  assert.equal(simulation.resolveMentalEvent('simultaneous-alerts', 'atmosphere-first'), true);
  assert.equal(simulation.resolveMentalEvent('thermal-warning', 'hold-power'), true);
  assert.equal(simulation.session.telemetry.activeAlerts.value, 0);
  assert.equal(simulation.mentalEvents.every((event) => event.outcome === 'nominal'), true);
});
