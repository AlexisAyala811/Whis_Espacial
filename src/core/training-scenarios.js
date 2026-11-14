import { createChecklist } from './checklist-engine.js';

export function createPhysicalScenario() {
  return {
    id: 'physical-conditioning',
    title: 'Acondicionamiento físico ASCAN',
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
      title: 'Verificación previa al acondicionamiento',
      steps: [
        { id: 'suit-integrity', label: 'Confirmar integridad del traje', description: 'Presión diferencial estable.' },
        { id: 'hydration-check', label: 'Confirmar hidratación', description: 'Reserva de agua disponible.' },
        { id: 'station-ready', label: 'Confirmar estación activa', description: 'Instrumentación de la estación en línea.' },
      ],
    }),
  };
}

export function createMentalScenario() {
  return {
    id: 'mental-readiness',
    title: 'Evaluación mental bajo presión',
    events: [
      {
        id: 'simultaneous-alerts',
        priority: 'warning',
        triggerAtMs: 15000,
        responseWindowMs: 20000,
        prompt: 'Dos avisos simultáneos. Priorice el control de atmósfera antes de continuar.',
        validActions: ['atmosphere-first', 'power-first'],
        selectedAction: null,
        outcome: 'pending',
      },
    ],
    checklist: createChecklist({
      id: 'mental-response',
      title: 'Respuesta a avisos concurrentes',
      steps: [
        { id: 'acknowledge-alerts', label: 'Reconocer avisos', description: 'Confirmar recepción de ambas alertas.' },
        { id: 'prioritize-atmosphere', label: 'Priorizar atmósfera', description: 'Seleccionar el sistema con riesgo inmediato.' },
        { id: 'confirm-recovery', label: 'Confirmar recuperación', description: 'Ejecutar la acción de recuperación.' },
      ],
    }),
  };
}
