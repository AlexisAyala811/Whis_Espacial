export const SESSION_STATUS = Object.freeze({
  READY: 'ready',
  ACTIVE: 'active',
  PAUSED_FOR_SYSTEM: 'paused-for-system',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

export const VOICE_STATUS = Object.freeze({
  DISABLED: 'disabled',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  UNAVAILABLE: 'unavailable',
});

export function createSession({ id = 'ground-demo', seed = 1, scenarioId = 'physical-conditioning' } = {}) {
  return {
    id,
    seed,
    phase: 'ground-training',
    scenarioId,
    status: SESSION_STATUS.READY,
    missionTimeMs: 0,
    activeChecklistId: null,
    telemetry: {},
    voice: {
      status: VOICE_STATUS.DISABLED,
      sessionResumeHandle: null,
    },
    events: [],
    stations: [],
    checklists: [],
    lastReport: null,
  };
}

export function cloneSession(session) {
  return structuredClone(session);
}

export function startSession(session) {
  if (session.status !== SESSION_STATUS.READY) {
    return false;
  }
  session.status = SESSION_STATUS.ACTIVE;
  return true;
}

export function pauseForSystem(session) {
  if (session.status !== SESSION_STATUS.ACTIVE) {
    return false;
  }
  session.status = SESSION_STATUS.PAUSED_FOR_SYSTEM;
  return true;
}

export function resumeSession(session) {
  if (session.status !== SESSION_STATUS.PAUSED_FOR_SYSTEM) {
    return false;
  }
  session.status = SESSION_STATUS.ACTIVE;
  return true;
}

export function recordEvent(session, event) {
  session.events.push({
    ...event,
    atMs: session.missionTimeMs,
  });
}

export function finishSession(session, report, status = SESSION_STATUS.COMPLETED) {
  session.lastReport = report;
  session.status = status;
}
