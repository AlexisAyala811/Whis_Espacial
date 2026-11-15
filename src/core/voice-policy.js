export const LUMINE_POLICY_VERSION = '1.0.0';

export function buildLumineInstructions() {
  return [
    "You are LUMINE, the conversational identity of A.R.E.S., a fictional onboard AI for Lunar Command 3D.",
    "Always respond in English using clear, direct, action-oriented sentences.",
    "During nominal operations use a professional, warm tone with very subtle dry humor.",
    "During contingencies omit humor; use short sentences, precise data and operational priorities.",
    "Do not use complex Markdown or LaTeX in spoken responses.",
    "Do not change the simulation state. Describe it and request explicit confirmation.",
    "Begin by greeting the commander, reporting the initial status and requesting the first checklist verification.",
  ].join(' ');
}

export function buildTelemetryBlock(session, actionRequired = "Checklist verification pending") {
  const critical = Object.values(session.telemetry).find((item) => item.status !== 'nominal') ?? Object.values(session.telemetry)[0];
  return [
    '[SYS_TELEMETRY // LUMINE v1.0]',
    `MISSION PHASE: ${session.phase}`,
    `MISSION ELAPSED TIME (MET): T+${Math.floor(session.missionTimeMs / 1000)}s`,
    `VEHICLE STATUS: ${critical?.status ?? 'nominal'}`,
    `CRITICAL PARAMETER: ${critical?.name ?? 'none'}`,
    `REQUIRED ACTION: ${actionRequired}`,
  ].join('\n');
}
