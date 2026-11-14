export const SCENARIOS = Object.freeze([
  { id: 'suit', title: 'Preparación de traje', station: 'suit' },
  { id: 'ared', title: 'Acondicionamiento físico', station: 'ared' },
  { id: 'mental', title: 'Control de misión', station: 'mental' },
  { id: 'eva', title: 'Entrenamiento EVA · NBL', station: 'eva' },
  { id: 'habitat', title: 'Hábitat de investigación', station: 'habitat' },
  { id: 'vab', title: 'Preparación de lanzamiento', station: 'vab' },
  { id: 'ship', title: 'Cabina de la nave · puesto marciano', station: 'ship' },
]);

export function canEnterScenario(index, completedStage) {
  return Number.isInteger(index) && index >= 0 && index < SCENARIOS.length && index <= completedStage;
}
