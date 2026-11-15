import { createChecklist } from './checklist-engine.js';

export function createPhysicalScenario() {
  return {
    id: 'physical-conditioning',
    title: "ASCAN physical conditioning",
    stations: [
      {
        id: 'ared-strength',
        name: 'ARED · Fuerza axial',
        durationMs: 180000,
        load: 0.55,
        fatigue: 0.12,
        heartRate: 92,
        oxygenSaturation: 99,
        status: 'pending',
        limits: { fatigueWarning: 0.72, fatigueUnsafe: 0.9 },
      },
      {
        id: 't2-cardio',
        name: 'T2 · Resistencia cardiorrespiratoria',
        durationMs: 180000,
        load: 0.65,
        fatigue: 0.18,
        heartRate: 108,
        oxygenSaturation: 98,
        status: 'pending',
        limits: { fatigueWarning: 0.72, fatigueUnsafe: 0.9 },
      },
    ],
    checklist: createChecklist({
      id: 'physical-start',
      title: "Pre-conditioning check",
      steps: [
        { id: 'suit-integrity', label: "Confirm suit integrity", description: "Differential pressure stable." },
        { id: 'hydration-check', label: "Confirm hydration", description: "Water reserve available." },
        { id: 'station-ready', label: "Confirm station is active", description: "Station instruments online." },
      ],
    }),
  };
}

export function createMentalScenario() {
  return {
    id: 'mental-readiness',
    title: "Mental assessment under pressure",
    events: [
      {
        id: 'simultaneous-alerts',
        priority: 'warning',
        triggerAtMs: 15000,
        responseWindowMs: 20000,
        prompt: "Two simultaneous alerts. Prioritize atmosphere control before continuing.",
        validActions: ['atmosphere-first', 'power-first'],
        preferredAction: 'atmosphere-first',
        selectedAction: null,
        outcome: 'pending',
      },
      {
        id: 'thermal-warning',
        priority: 'caution',
        triggerAtMs: 15000,
        responseWindowMs: 20000,
        prompt: "Concurrent thermal alert. Maintain power while stabilizing the atmosphere.",
        validActions: ['hold-power', 'power-first'],
        preferredAction: 'hold-power',
        selectedAction: null,
        outcome: 'pending',
      },
    ],
    checklist: createChecklist({
      id: 'mental-response',
      title: 'Respuesta a avisos concurrentes',
      steps: [
        { id: 'acknowledge-alerts', label: 'Acknowledge alerts', description: "Confirm receipt of both alerts." },
        { id: 'prioritize-atmosphere', label: "Prioritize atmosphere", description: "Select the system at immediate risk." },
        { id: 'confirm-recovery', label: "Confirm recovery", description: "Perform the recovery action." },
      ],
    }),
  };
}
