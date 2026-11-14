// Educational Moon-outpost exercise. Values are game units, not NASA telemetry.
export const OUTPOST_QUESTIONS = Object.freeze([
  {
    title: 'Sol 1 · Alerta solar',
    question: 'Llega una alerta de actividad solar. ¿Cómo proteges a la tripulación?',
    source: 'DONKI · meteorología espacial',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    options: [
      { text: 'Reforzar el refugio y reducir el trabajo exterior', delta: { power: -12, shield: 22, food: -4 }, correct: true, why: 'El refugio gana protección, pero consume energía y retrasa el cultivo.' },
      { text: 'Continuar el paseo exterior para ahorrar energía', delta: { power: 5, shield: -35, food: 3 }, correct: false, why: 'Se ahorra energía, pero la protección frente a la radiación cae.' },
      { text: 'Apagar el aviso y seguir la rutina', delta: { power: 3, shield: -25, food: -5 }, correct: false, why: 'Ignorar la alerta deja a la tripulación con menos protección.' },
    ],
  },
  {
    title: 'Sol 2 · Aire respirable',
    question: 'El sistema de soporte vital pierde rendimiento. ¿Qué priorizas?',
    source: 'NASA · soporte vital ECLSS',
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
    options: [
      { text: 'Dedicar energía a recuperar el aire', delta: { air: 25, power: -18, food: -3 }, correct: true, why: 'El aire se recupera; queda menos energía para otros sistemas.' },
      { text: 'Dar toda la energía al laboratorio', delta: { air: -32, power: -10, food: 4 }, correct: false, why: 'El laboratorio avanza mientras el aire disponible desciende.' },
      { text: 'Esperar al próximo sol', delta: { air: -25, power: 3, food: -2 }, correct: false, why: 'Aplazar el mantenimiento conserva energía hoy, pero empeora el aire.' },
    ],
  },
  {
    title: 'Sol 3 · Cultivo',
    question: 'El invernadero necesita iluminación. ¿Cómo aseguras alimentos?',
    source: 'CSA · producción de alimentos',
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
    options: [
      { text: 'Asignar energía al cultivo y reducir otra actividad', delta: { food: 24, power: -18, air: -4 }, correct: true, why: 'Crece la reserva de alimentos a cambio de energía y aire.' },
      { text: 'Dejar el cultivo sin luz', delta: { food: -30, power: 8, air: 2 }, correct: false, why: 'La energía aumenta, pero la cosecha se pierde.' },
      { text: 'Consumir las reservas sin replantar', delta: { food: -22, power: 5, air: 1 }, correct: false, why: 'Se ahorra energía a corto plazo y disminuye la comida futura.' },
    ],
  },
  {
    title: 'Sol 4 · Presupuesto eléctrico',
    question: 'No hay energía para todos los equipos. ¿Qué mantienes primero?',
    source: 'NASA · sistemas de base lunar',
    url: 'https://www.nasa.gov/moonbase-systems/',
    options: [
      { text: 'Soporte vital y comunicaciones; posponer ciencia', delta: { air: 12, power: -16, food: -4 }, correct: true, why: 'La tripulación y el enlace siguen operativos; la investigación espera.' },
      { text: 'Solo instrumentos científicos', delta: { air: -27, power: -10, food: 2 }, correct: false, why: 'La ciencia consume energía mientras el soporte vital pierde capacidad.' },
      { text: 'Apagar todos los sistemas', delta: { air: -22, power: 15, food: -12 }, correct: false, why: 'La batería se conserva, pero aire y alimentos se deterioran.' },
    ],
  },
  {
    title: 'Sol 5 · Mensaje a la Tierra',
    question: 'La respuesta desde la Tierra tarda en llegar. ¿Qué hace la tripulación?',
    source: 'NASA · demora de comunicaciones con Marte',
    url: 'https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/',
    options: [
      { text: 'Enviar telemetría y aplicar el plan local de seguridad', delta: { power: -10, air: -4, shield: 5 }, correct: true, why: 'Se paga energía por el enlace y se mantiene una decisión local segura.' },
      { text: 'Esperar instrucciones sin actuar', delta: { power: 3, air: -24, shield: -9 }, correct: false, why: 'La espera consume margen de seguridad mientras llega la respuesta.' },
      { text: 'Desactivar la radio definitivamente', delta: { power: 8, air: -8, shield: -12 }, correct: false, why: 'Se ahorra energía, pero se pierde apoyo y coordinación.' },
    ],
  },
].map((question, index) => ({
  ...question,
  options: question.options.map((_, position) => question.options[(position + 3 - index % 3) % 3]),
})));

export class OutpostTraining {
  constructor() { this.sol = 0; this.resources = { air: 65, power: 95, shield: 60, food: 65 }; this.log = []; this.failed = false; }
  get complete() { return this.sol === OUTPOST_QUESTIONS.length && !this.failed; }
  choose(index) {
    if (this.failed || this.complete || !Number.isInteger(index) || index < 0 || index > 2) return null;
    const question = OUTPOST_QUESTIONS[this.sol], choice = question.options[index];
    for (const [key, change] of Object.entries(choice.delta)) this.resources[key] = Math.max(0, Math.min(100, this.resources[key] + change));
    this.log.push({ title: question.title, choice: choice.text, correct: choice.correct, why: choice.why });
    this.sol++;
    this.failed = Object.values(this.resources).some(value => value < 20);
    return { ...choice, failed: this.failed, complete: this.complete };
  }
}
