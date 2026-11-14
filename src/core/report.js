export function createReport(session) {
  const completed = session.checklists.filter((checklist) => checklist.status === 'complete');
  const rejected = session.events.filter((event) => event.type === 'checklist-rejected');
  const incidents = session.events.filter((event) => event.type === 'fatigue-warning' || event.type === 'fatigue-unsafe' || event.type === 'checklist-rejected');
  const score = Math.max(0, 100 - rejected.length * 15 - incidents.length * 5);
  return {
    result: score >= 85 ? 'apt' : score >= 60 ? 'conditional' : 'not-apt',
    score,
    completedChecklists: completed.map(({ id }) => id),
    decisions: session.events.filter((event) => event.type === 'checklist-confirmed'),
    incidents,
    recommendations: incidents.length ? ['Revisar los avisos de fatiga antes de la próxima sesión.'] : ['Mantener la disciplina de checklist y la comunicación operacional.'],
    completedAt: new Date().toISOString(),
  };
}

export function saveReport(report, storage = globalThis.localStorage) {
  if (!storage) return false;
  storage.setItem('lunar-command-last-report', JSON.stringify(report));
  return true;
}
