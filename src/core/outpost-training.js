// Educational Moon-outpost exercise. Values are game units, not NASA telemetry.
export const OUTPOST_QUESTIONS = Object.freeze([
  {
    title: "Sol 1 · Solar alert",
    question: "A solar activity alert arrives. How do you protect the crew?",
    source: "DONKI · space weather",
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    options: [
      { text: "Reinforce the shelter and reduce exterior work", delta: { power: -12, shield: 22, food: -4 }, correct: true, why: "The shelter gains protection but uses power and delays crops." },
      { text: "Continue the spacewalk to save power", delta: { power: 5, shield: -35, food: 3 }, correct: false, why: "Power is saved, but radiation protection falls." },
      { text: "Dismiss the warning and continue as usual", delta: { power: 3, shield: -25, food: -5 }, correct: false, why: "Ignoring the alert leaves the crew less protected." },
    ],
  },
  {
    title: "Sol 2 · Breathable air",
    question: "Life support performance is declining. What do you prioritize?",
    source: "NASA · ECLSS life support",
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
    options: [
      { text: "Allocate power to restore the air", delta: { air: 25, power: -18, food: -3 }, correct: true, why: "Air recovers; less power remains for other systems." },
      { text: "Give all power to the laboratory", delta: { air: -32, power: -10, food: 4 }, correct: false, why: "Laboratory work progresses while available air falls." },
      { text: "Wait until the next sol", delta: { air: -25, power: 3, food: -2 }, correct: false, why: "Delaying maintenance saves power today but worsens air quality." },
    ],
  },
  {
    title: "Sol 3 · Crops",
    question: "The greenhouse needs light. How do you secure food?",
    source: "CSA · food production",
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
    options: [
      { text: "Power the crops and reduce another activity", delta: { food: 24, power: -18, air: -4 }, correct: true, why: "Food reserves grow at the cost of power and air." },
      { text: "Leave the crops without light", delta: { food: -30, power: 8, air: 2 }, correct: false, why: "Power increases, but the crop is lost." },
      { text: "Consume reserves without replanting", delta: { food: -22, power: 5, air: 1 }, correct: false, why: "Power is saved in the short term, but future food decreases." },
    ],
  },
  {
    title: "Sol 4 · Power budget",
    question: "There is not enough power for every system. What do you maintain first?",
    source: "NASA · Moon base systems",
    url: 'https://www.nasa.gov/moonbase-systems/',
    options: [
      { text: "Life support and communications; postpone science", delta: { air: 12, power: -16, food: -4 }, correct: true, why: "The crew and communications remain operational; research must wait." },
      { text: "Scientific instruments only", delta: { air: -27, power: -10, food: 2 }, correct: false, why: "Science uses power while life support loses capacity." },
      { text: "Shut down all systems", delta: { air: -22, power: 15, food: -12 }, correct: false, why: "The battery is conserved, but air and food decline." },
    ],
  },
  {
    title: "Sol 5 · Message to Earth",
    question: "A response from Earth takes time. What does the crew do?",
    source: "NASA · Mars communication delay",
    url: 'https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/',
    options: [
      { text: "Send telemetry and apply the local safety plan", delta: { power: -10, air: -4, shield: 5 }, correct: true, why: "The link uses power and the crew makes a safe local decision." },
      { text: "Wait for instructions without acting", delta: { power: 3, air: -24, shield: -9 }, correct: false, why: "Waiting uses up safety margins while the response is in transit." },
      { text: "Permanently disable the radio", delta: { power: 8, air: -8, shield: -12 }, correct: false, why: "Power is saved, but support and coordination are lost." },
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
