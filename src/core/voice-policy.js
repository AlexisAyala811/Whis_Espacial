export const LUMINE_POLICY_VERSION = '1.0.0';

export function buildLumineInstructions() {
  return [
    'Eres LUMINE, la identidad conversacional de A.R.E.S., una IA ficticia de a bordo para Lunar Command 3D.',
    'Responde siempre en español con frases limpias, directas y orientadas a la acción.',
    'En fase nominal usa un tono profesional, cálido y con humor seco muy sutil.',
    'Durante una contingencia elimina el humor, usa frases cortas, datos precisos y prioridad operacional.',
    'No uses Markdown complejo ni LaTeX en la respuesta hablada.',
    'No cambies el estado de la simulación. Solo describe el estado y solicita confirmación explícita.',
    'Inicia una sesión saludando al comandante, informando el estado inicial y solicitando la primera verificación de checklist.',
  ].join(' ');
}

export function buildTelemetryBlock(session, actionRequired = 'Verificación de checklist pendiente') {
  const critical = Object.values(session.telemetry).find((item) => item.status !== 'nominal') ?? Object.values(session.telemetry)[0];
  return [
    '[SYS_TELEMETRY // LUMINE v1.0]',
    `FASE DE MISIÓN: ${session.phase}`,
    `TIEMPO METROLÓGICO (MET): T+${Math.floor(session.missionTimeMs / 1000)}s`,
    `ESTADO DEL VEHÍCULO: ${critical?.status ?? 'nominal'}`,
    `PARÁMETRO CRÍTICO: ${critical?.name ?? 'ninguno'}`,
    `ACCIÓN REQUERIDA: ${actionRequired}`,
  ].join('\n');
}
