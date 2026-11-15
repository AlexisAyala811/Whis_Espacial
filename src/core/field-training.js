// Browser-independent rules for the first-person training route.
import { OutpostTraining } from './outpost-training.js';
export class FieldTraining {
  constructor() {
    this.stage = 0; this.checks = 0; this.reps = 0; this.errors = 0; this.elapsed = 0; this.lastRep = -1;
    this.evaLinks = new Set();
    this.resources = { oxygen: 60, water: 40, energy: 90 };
    this.powerBuses = [false, true, false]; this.powerMoves = 0;
    this.outpost = new OutpostTraining();
  }
  get complete() { return this.stage === 7; }
  get target() { return ['suit', 'ared', 'mental', 'eva', 'habitat', 'vab', 'ship'][this.stage] ?? null; }
  get score() { return Math.max(0, 100 - this.errors * 10); }
  get gauge() { return (Math.sin(this.elapsed * 2) + 1) / 2; }
  advance(seconds) { if (!this.complete) this.elapsed += Math.min(Math.max(seconds, 0), .1); }
  interact(station, answer) {
    if (this.complete || station !== this.target) return "Follow the objective displayed on your visor.";
    if (station === 'suit') {
      this.checks++;
      if (this.checks === 3) { this.stage++; return "Suit verified. Go through the door to physical training."; }
      return ["Pressure is stable. Confirm the water supply.", "Water confirmed. Check the telemetry link."][this.checks - 1];
    }
    if (station === 'ared') {
      if (this.elapsed - this.lastRep < .5) return "Wait for the next cycle.";
      this.lastRep = this.elapsed;
      if (this.gauge < .35 || this.gauge > .65) { this.errors++; return "Out of rhythm. Press E when the indicator enters the green zone."; }
      this.reps++;
      if (this.reps === 6) { this.stage++; return "Coordination complete. Proceed to mission control."; }
      return `Repetition ${this.reps} of 6. Keep the rhythm.`;
    }
    if (station === 'mental') {
      if (answer !== 'atmosphere') { this.errors++; return "Incorrect priority: loss of pressure affects life support. Try again."; }
      this.stage++;
      return "Atmosphere leak isolated. Proceed to the EVA training pool.";
    }
    if (station === 'eva') {
      const cable = answer?.cable, port = answer?.port;
      if (!['oxygen', 'data', 'power'].includes(cable) || !['oxygen', 'data', 'power'].includes(port)) return "Select a line and then its connection.";
      if (this.evaLinks.has(cable)) return "That line is already connected.";
      if (cable !== port) { this.errors++; return "Incorrect connection. Isolate the line and check its label."; }
      this.evaLinks.add(cable);
      if (this.evaLinks.size === 3) { this.stage++; return "EVA umbilicals verified. Proceed to the habitat."; }
      return `Line ${this.evaLinks.size} of 3 secured.`;
    }
    if (station === 'habitat') {
      const targets = { oxygen: 80, water: 60, energy: 70 };
      if (answer?.submit) {
        if (Object.keys(targets).some(key => this.resources[key] !== targets[key])) { this.errors++; return "Balance out of range. Adjust all three resources before confirming."; }
        this.stage++; return "Resources stabilized. Proceed to launch preparation.";
      }
      if (!Object.hasOwn(targets, answer?.resource) || ![-10, 10].includes(answer?.delta)) return "Select a resource and apply a valid adjustment.";
      const key = answer.resource;
      this.resources[key] = Math.max(0, Math.min(100, this.resources[key] + answer.delta));
      return `${{ oxygen: "Oxygen", water: "Water", energy: "Energy" }[key]}: ${this.resources[key]} %. Target ${targets[key]} %.`;
    }
    if (station === 'vab') {
      const switchIndex = answer?.switch;
      if (!Number.isInteger(switchIndex) || switchIndex < 0 || switchIndex > 2) return "Select a power bus.";
      for (let i = Math.max(0, switchIndex - 1); i <= Math.min(2, switchIndex + 1); i++) this.powerBuses[i] = !this.powerBuses[i];
      this.powerMoves++;
      if (this.powerBuses.every(Boolean)) { this.stage++; return "Power buses stable. Proceed to the spacecraft cabin."; }
      if (this.powerMoves > 4) this.errors++;
      return "Power distribution changed. Check all three buses before continuing.";
    }
    if (station === 'ship') {
      if (answer?.retry) { this.outpost = new OutpostTraining(); return "Mars outpost simulation restarted. Review the cost of each decision."; }
      const result = this.outpost.choose(answer?.choice);
      if (!result) return "Select one of the three mission decisions.";
      if (!result.correct) this.errors++;
      if (result.complete) { this.stage++; return result.why + " Mars mission complete. Review the report."; }
      return result.why + (result.failed ? " The outpost lost a critical resource. Restart this exercise." : " Continue to the next sol.");
    }
    return "Follow the objective displayed on your visor.";
  }
}
