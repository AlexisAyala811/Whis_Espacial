import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLumineInstructions, buildTelemetryBlock } from '../../src/core/voice-policy.js';
import { createSession } from '../../src/core/mission-state.js';

test('LUMINE policy is Spanish and avoids complex spoken formatting', () => {
  const instructions = buildLumineInstructions();
  assert.match(instructions, /LUMINE/);
  assert.match(instructions, /español/);
  assert.match(instructions, /LaTeX/);
});

test('telemetry block carries the active mission context', () => {
  const session = createSession();
  session.missionTimeMs = 1250;
  const block = buildTelemetryBlock(session, 'Confirmar protocolo');
  assert.match(block, /FASE DE MISIÓN: ground-training/);
  assert.match(block, /T\+1s/);
  assert.match(block, /Confirmar protocolo/);
});
