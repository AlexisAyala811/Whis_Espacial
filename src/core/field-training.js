// Browser-independent rules for the first-person training route.
export class FieldTraining {
  constructor() { this.stage = 0; this.checks = 0; this.reps = 0; this.errors = 0; this.elapsed = 0; this.lastRep = -1; }
  get complete() { return this.stage === 3; }
  get target() { return ['suit', 'ared', 'mental'][this.stage] ?? null; }
  get score() { return Math.max(0, 100 - this.errors * 10); }
  get gauge() { return (Math.sin(this.elapsed * 2) + 1) / 2; }
  advance(seconds) { if (!this.complete) this.elapsed += Math.min(Math.max(seconds, 0), .1); }
  interact(station, answer) {
    if (this.complete || station !== this.target) return 'Sigue el objetivo señalado en tu visor.';
    if (station === 'suit') {
      this.checks++;
      if (this.checks === 3) { this.stage++; return 'Traje verificado. Dirígete a ARED, a la izquierda.'; }
      return ['Presión estable. Confirma la reserva de agua.', 'Agua confirmada. Verifica el enlace de telemetría.'][this.checks - 1];
    }
    if (station === 'ared') {
      if (this.elapsed - this.lastRep < .5) return 'Espera el siguiente ciclo.';
      this.lastRep = this.elapsed;
      if (this.gauge < .35 || this.gauge > .65) { this.errors++; return 'Fuera de ritmo. Pulsa E cuando el indicador entre en la zona verde.'; }
      this.reps++;
      if (this.reps === 6) { this.stage++; return 'Coordinación completada. Acude a la consola ECLSS, a la derecha.'; }
      return `Repetición ${this.reps} de 6. Mantén el ritmo.`;
    }
    if (answer !== 'atmosphere') { this.errors++; return 'Prioridad incorrecta: la pérdida de presión afecta al soporte vital. Reintenta.'; }
    this.stage++;
    return 'Atmósfera aislada. Tripulación estable. Entrenamiento completado.';
  }
}
