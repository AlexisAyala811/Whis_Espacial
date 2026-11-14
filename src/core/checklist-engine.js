import { recordEvent } from './mission-state.js';

export function createChecklist({ id, title, steps, allowOutOfOrder = false }) {
  return {
    id,
    title,
    steps: steps.map((step) => ({
      ...step,
      completedAtMs: null,
      confirmationSource: null,
    })),
    currentIndex: 0,
    allowOutOfOrder,
    status: 'pending',
  };
}

export function activateChecklist(checklist) {
  if (checklist.status === 'pending') {
    checklist.status = 'active';
  }
  return checklist;
}

export function confirmStep(session, checklist, stepId, source = 'panel') {
  activateChecklist(checklist);
  const stepIndex = checklist.steps.findIndex((step) => step.id === stepId);
  if (stepIndex < 0) {
    return { ok: false, reason: 'unknown-step' };
  }
  if (!checklist.allowOutOfOrder && stepIndex !== checklist.currentIndex) {
    recordEvent(session, { type: 'checklist-rejected', stepId, reason: 'out-of-order' });
    return { ok: false, reason: 'out-of-order' };
  }
  const step = checklist.steps[stepIndex];
  if (step.completedAtMs !== null) {
    return { ok: false, reason: 'already-complete' };
  }
  step.completedAtMs = session.missionTimeMs;
  step.confirmationSource = source;
  checklist.currentIndex = Math.max(checklist.currentIndex, stepIndex + 1);
  if (checklist.currentIndex >= checklist.steps.length) {
    checklist.status = 'complete';
  }
  recordEvent(session, { type: 'checklist-confirmed', stepId, source });
  return { ok: true, step };
}
