// Browser-independent rules for the first-person training route.
export class FieldTraining {
  constructor() {
    this.stage = 0; this.checks = 0; this.reps = 0; this.errors = 0; this.elapsed = 0; this.lastRep = -1;
    this.evaLinks = new Set();
    this.resources = { oxygen: 60, water: 40, energy: 90 };
    this.powerBuses = [false, true, false]; this.powerMoves = 0;
  }
  get complete() { return this.stage === 6; }
  get target() { return ['suit', 'ared', 'mental', 'eva', 'habitat', 'vab'][this.stage] ?? null; }
  get score() { return Math.max(0, 100 - this.errors * 10); }
  get gauge() { return (Math.sin(this.elapsed * 2) + 1) / 2; }
  advance(seconds) { if (!this.complete) this.elapsed += Math.min(Math.max(seconds, 0), .1); }
  interact(station, answer) {
    if (this.complete || station !== this.target) return 'Sigue el objetivo señalado en tu visor.';
    if (station === 'suit') {
      this.checks++;
      if (this.checks === 3) { this.stage++; return 'Traje verificado. Cruza la puerta hacia el entrenamiento físico.'; }
      return ['Presión estable. Confirma la reserva de agua.', 'Agua confirmada. Verifica el enlace de telemetría.'][this.checks - 1];
    }
    if (station === 'ared') {
      if (this.elapsed - this.lastRep < .5) return 'Espera el siguiente ciclo.';
      this.lastRep = this.elapsed;
      if (this.gauge < .35 || this.gauge > .65) { this.errors++; return 'Fuera de ritmo. Pulsa E cuando el indicador entre en la zona verde.'; }
      this.reps++;
      if (this.reps === 6) { this.stage++; return 'Coordinación completada. Cruza la puerta hacia control de misión.'; }
      return `Repetición ${this.reps} de 6. Mantén el ritmo.`;
    }
    if (station === 'mental') {
      if (answer !== 'atmosphere') { this.errors++; return 'Prioridad incorrecta: la pérdida de presión afecta al soporte vital. Reintenta.'; }
      this.stage++;
      return 'Atmósfera aislada. Cruza a la piscina de entrenamiento EVA.';
    }
    if (station === 'eva') {
      const cable = answer?.cable, port = answer?.port;
      if (!['oxygen', 'data', 'power'].includes(cable) || !['oxygen', 'data', 'power'].includes(port)) return 'Selecciona una línea y después su conexión.';
      if (this.evaLinks.has(cable)) return 'Esa línea ya está conectada.';
      if (cable !== port) { this.errors++; return 'Conexión incorrecta. Aísla la línea y verifica el rótulo.'; }
      this.evaLinks.add(cable);
      if (this.evaLinks.size === 3) { this.stage++; return 'Umbilicales EVA verificados. Cruza al hábitat.'; }
      return `Línea ${this.evaLinks.size} de 3 asegurada.`;
    }
    if (station === 'habitat') {
      const targets = { oxygen: 80, water: 60, energy: 70 };
      if (answer?.submit) {
        if (Object.keys(targets).some(key => this.resources[key] !== targets[key])) { this.errors++; return 'Balance fuera de rango. Ajusta los tres recursos antes de confirmar.'; }
        this.stage++; return 'Recursos estabilizados. Dirígete a preparación de lanzamiento.';
      }
      if (!Object.hasOwn(targets, answer?.resource) || ![-10, 10].includes(answer?.delta)) return 'Selecciona un recurso y aplica un ajuste válido.';
      const key = answer.resource;
      this.resources[key] = Math.max(0, Math.min(100, this.resources[key] + answer.delta));
      return `${{ oxygen: 'Oxígeno', water: 'Agua', energy: 'Energía' }[key]}: ${this.resources[key]} %. Objetivo ${targets[key]} %.`;
    }
    if (station === 'vab') {
      const switchIndex = answer?.switch;
      if (!Number.isInteger(switchIndex) || switchIndex < 0 || switchIndex > 2) return 'Selecciona un bus de distribución.';
      for (let i = Math.max(0, switchIndex - 1); i <= Math.min(2, switchIndex + 1); i++) this.powerBuses[i] = !this.powerBuses[i];
      this.powerMoves++;
      if (this.powerBuses.every(Boolean)) { this.stage++; return 'Buses estables. Preparación completada; vehículo listo para revisión final.'; }
      if (this.powerMoves > 4) this.errors++;
      return 'Distribución modificada. Verifica los tres buses antes de continuar.';
    }
    return 'Sigue el objetivo señalado en tu visor.';
  }
}
