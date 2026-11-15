export const SCENARIOS = Object.freeze([
  { id: 'suit', title: "Suit preparation", station: 'suit' },
  { id: 'ared', title: "Physical conditioning", station: 'ared' },
  { id: 'mental', title: "Mission control", station: 'mental' },
  { id: 'eva', title: "EVA training · NBL", station: 'eva' },
  { id: 'habitat', title: "Research habitat", station: 'habitat' },
  { id: 'vab', title: "Launch preparation", station: 'vab' },
  { id: 'ship', title: "Spacecraft cabin · Mars outpost", station: 'ship' },
]);

export function canEnterScenario(index, completedStage) {
  return Number.isInteger(index) && index >= 0 && index < SCENARIOS.length && index <= completedStage;
}
