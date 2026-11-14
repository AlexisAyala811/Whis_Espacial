export const SCENARIOS = Object.freeze([
  { id: 'suit', title: 'Preparación de traje', station: 'suit' },
  { id: 'ared', title: 'Acondicionamiento físico', station: 'ared' },
  { id: 'mental', title: 'Control de misión', station: 'mental' },
]);

export function canEnterScenario(index, completedStage) {
  return Number.isInteger(index) && index >= 0 && index < SCENARIOS.length && index <= completedStage;
}
