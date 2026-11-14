export const TELEMETRY_STATUS = Object.freeze({
  NOMINAL: 'nominal',
  CAUTION: 'caution',
  WARNING: 'warning',
  ALERT: 'alert',
});

export function createTelemetry(name, value, unit, status = TELEMETRY_STATUS.NOMINAL, updatedAtMs = 0, previousValue = value) {
  return {
    name,
    value,
    unit,
    status,
    updatedAtMs,
    trend: value > previousValue ? 'rising' : value < previousValue ? 'falling' : 'steady',
  };
}

export function setTelemetry(session, name, value, unit, status = TELEMETRY_STATUS.NOMINAL) {
  const previous = session.telemetry[name];
  session.telemetry[name] = createTelemetry(
    name,
    value,
    unit,
    status,
    session.missionTimeMs,
    previous?.value ?? value,
  );
  return session.telemetry[name];
}
