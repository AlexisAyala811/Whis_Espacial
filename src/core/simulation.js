import { finishSession, recordEvent, startSession } from './mission-state.js';
import { setTelemetry, TELEMETRY_STATUS } from './telemetry.js';
import { createMentalScenario, createPhysicalScenario } from './training-scenarios.js';
import { createReport } from './report.js';

const STEP_MS = 50;

function seededNoise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export class Simulation {
  constructor(session) {
    this.session = session;
    this.accumulatorMs = 0;
    this.stepCount = 0;
    this.scenario = session.scenarioId === 'mental-readiness' ? createMentalScenario() : createPhysicalScenario();
    this.session.stations = this.scenario.stations ?? [];
    this.session.checklists = [this.scenario.checklist];
    this.session.activeChecklistId = this.scenario.checklist.id;
    this.mentalEvents = this.scenario.events ?? [];
  }

  start() {
    startSession(this.session);
    this.session.checklists[0].status = 'active';
    return this.snapshot();
  }

  advance(deltaMs) {
    if (this.session.status !== 'active') return this.snapshot();
    this.accumulatorMs += Math.max(0, Math.min(deltaMs, 250));
    while (this.accumulatorMs >= STEP_MS) {
      this.accumulatorMs -= STEP_MS;
      this.tick(STEP_MS);
    }
    return this.snapshot();
  }

  tick(stepMs) {
    this.session.missionTimeMs += stepMs;
    this.stepCount += 1;
    if (this.session.scenarioId === 'physical-conditioning') this.tickPhysical(stepMs);
    if (this.session.scenarioId === 'mental-readiness') this.tickMental();
  }

  tickPhysical(stepMs) {
    const active = this.session.stations.find((station) => station.status === 'active');
    if (!active) return;
    active.fatigue = Math.min(1, active.fatigue + (active.load * stepMs) / 1800000);
    active.heartRate += active.load * 0.015;
    active.oxygenSaturation = Math.max(88, active.oxygenSaturation - active.load * 0.0002);
    const status = active.fatigue >= active.limits.fatigueUnsafe
      ? TELEMETRY_STATUS.ALERT
      : active.fatigue >= active.limits.fatigueWarning
        ? TELEMETRY_STATUS.WARNING
        : TELEMETRY_STATUS.NOMINAL;
    setTelemetry(this.session, 'fatigue', Number(active.fatigue.toFixed(3)), 'ratio', status);
    setTelemetry(this.session, 'heartRate', Math.round(active.heartRate), 'bpm', status);
    setTelemetry(this.session, 'oxygenSaturation', Number(active.oxygenSaturation.toFixed(2)), '%', status);
    if (status === TELEMETRY_STATUS.WARNING && !this.session.events.some((event) => event.type === 'fatigue-warning' && event.stationId === active.id)) {
      recordEvent(this.session, { type: 'fatigue-warning', stationId: active.id });
    }
    if (status === TELEMETRY_STATUS.ALERT) {
      active.status = 'unsafe';
      if (!this.session.events.some((event) => event.type === 'fatigue-unsafe' && event.stationId === active.id)) {
        recordEvent(this.session, { type: 'fatigue-unsafe', stationId: active.id });
      }
    }
  }

  tickMental() {
    for (const event of this.mentalEvents) {
      if (!event.activated && this.session.missionTimeMs >= event.triggerAtMs) {
        event.activated = true;
        recordEvent(this.session, { type: 'mental-event', eventId: event.id, priority: event.priority });
        setTelemetry(this.session, 'activeAlerts', this.mentalEvents.filter((item) => item.activated && item.outcome === 'pending').length, 'events', event.priority === 'warning' ? TELEMETRY_STATUS.WARNING : TELEMETRY_STATUS.CAUTION);
      }
    }
  }

  resolveMentalEvent(eventId, action) {
    const event = this.mentalEvents.find((item) => item.id === eventId && item.activated);
    if (!event || !event.validActions.includes(action) || event.outcome !== 'pending') return false;
    event.selectedAction = action;
    event.outcome = action === event.preferredAction ? 'nominal' : 'recovered';
    recordEvent(this.session, { type: 'mental-decision', eventId, action, outcome: event.outcome });
    setTelemetry(this.session, 'activeAlerts', this.mentalEvents.filter((item) => item.activated && item.outcome === 'pending').length, 'events', event.outcome === 'nominal' ? TELEMETRY_STATUS.NOMINAL : TELEMETRY_STATUS.CAUTION);
    return true;
  }

  activateStation(stationId) {
    const station = this.session.stations.find((item) => item.id === stationId);
    if (!station || station.status === 'unsafe') return false;
    this.session.stations.forEach((item) => {
      if (item.status === 'active') item.status = 'complete';
    });
    station.status = 'active';
    recordEvent(this.session, { type: 'station-started', stationId });
    return true;
  }

  completeStation(stationId) {
    const station = this.session.stations.find((item) => item.id === stationId);
    if (!station || station.status !== 'active' || station.status === 'unsafe') return false;
    station.status = 'complete';
    recordEvent(this.session, { type: 'station-completed', stationId });
    return true;
  }

  finish() {
    const report = createReport(this.session);
    finishSession(this.session, report);
    return report;
  }

  snapshot() {
    return structuredClone(this.session);
  }

  deterministicMarker() {
    return seededNoise(this.session.seed + this.stepCount);
  }
}

export { STEP_MS };
