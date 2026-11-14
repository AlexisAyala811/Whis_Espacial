import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSession } from '../../src/core/mission-state.js';

test('session state contract declares required fields and enums', async () => {
  const schema = JSON.parse(await readFile(new URL('../../specs/001-entrenamiento-terrestre/contracts/session-state.schema.json', import.meta.url)));
  const session = createSession();
  for (const field of schema.required) assert.ok(field in session, `missing ${field}`);
  assert.equal(session.phase, schema.properties.phase.const);
  assert.ok(schema.properties.status.enum.includes(session.status));
});
