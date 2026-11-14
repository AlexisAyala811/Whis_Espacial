import test from 'node:test';
import assert from 'node:assert/strict';
import { createChecklist, confirmStep } from '../../src/core/checklist-engine.js';
import { createSession } from '../../src/core/mission-state.js';

test('checklists reject out-of-order steps', () => {
  const session = createSession();
  const checklist = createChecklist({ id: 'test', title: 'Test', steps: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] });
  assert.equal(confirmStep(session, checklist, 'b').reason, 'out-of-order');
  assert.equal(confirmStep(session, checklist, 'a').ok, true);
  assert.equal(confirmStep(session, checklist, 'b').ok, true);
  assert.equal(checklist.status, 'complete');
});
