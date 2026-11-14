import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../../src/core/mission-state.js';
import { setTelemetry, TELEMETRY_STATUS } from '../../src/core/telemetry.js';

test('telemetry stores status, units and trend', () => {
  const session = createSession();
  setTelemetry(session, 'fatigue', 0.2, 'ratio');
  const current = setTelemetry(session, 'fatigue', 0.7, 'ratio', TELEMETRY_STATUS.WARNING);
  assert.equal(current.status, 'warning');
  assert.equal(current.trend, 'rising');
});
