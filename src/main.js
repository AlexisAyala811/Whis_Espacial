import * as THREE from 'three';
import { Simulation } from './core/simulation.js';
import { confirmStep } from './core/checklist-engine.js';
import { buildTelemetryBlock } from './core/voice-policy.js';
import { createSession } from './core/mission-state.js';
import { createScene } from './rendering/scene.js';

let session = createSession({ seed: 24014 });
let simulation = new Simulation(session);
const scene = createScene(document.querySelector('#scene-container'));
const selectors = { connection: '#connection-status', start: '#start-session', finish: '#finish-session', scenario: '#scenario-select', missionTime: '#mission-time', missionState: '#mission-state', objective: '#mission-objective', phaseProgress: '#phase-progress', phases: '#mission-phases', telemetry: '#telemetry-panel', checklist: '#checklist-panel', checklistProgress: '#checklist-progress', checklistInstruction: '#checklist-instruction', stationPanel: '#station-panel', report: '#report-panel', reportResult: '#report-result', reportContent: '#report-content', conversation: '#conversation-log', voiceStatus: '#voice-status', voiceForm: '#voice-form', voiceInput: '#voice-input' };
const elements = Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, document.querySelector(selector)]));
const missionPhases = [
  'Acondicionamiento terrestre',
  "Systems engineering",
  "Ascent to orbit",
  "Trans-Mars injection",
  "Cruise routine",
  'Mars EDL',
  "Surface operations",
  'Base e ISRU',
];

function formatMissionTime(ms) { const seconds = Math.floor(ms / 1000); return `T+${String(Math.floor(seconds / 60)).padStart(3, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function addConversation(speaker, text) { const entry = document.createElement('p'); entry.className = 'conversation-entry'; entry.innerHTML = `<strong>${speaker}</strong> ${text.replace(/[<>]/g, '')}`; elements.conversation.append(entry); elements.conversation.scrollTop = elements.conversation.scrollHeight; }
function renderPhaseRail(snapshot) { const activePhase = snapshot.phase === 'ground-training' ? 0 : 0; elements.phaseProgress.textContent = `PHASE ${activePhase} / ${missionPhases.length}`; if (!elements.phases.children.length) { missionPhases.forEach((name, index) => { const item = document.createElement('li'); item.dataset.phase = String(index); item.innerHTML = `<span class="phase-number">${String(index).padStart(2, '0')}</span><span class="phase-name">${name}</span>`; elements.phases.append(item); }); } [...elements.phases.children].forEach((item, index) => { item.classList.toggle('is-active', index === activePhase); item.classList.toggle('is-locked', index > activePhase); item.classList.toggle('is-complete', index < activePhase || (index === activePhase && snapshot.status === 'completed')); }); }
function renderTelemetry(snapshot) { elements.telemetry.replaceChildren(); for (const item of Object.values(snapshot.telemetry)) { const card = document.createElement('div'); card.className = 'telemetry-card'; card.dataset.status = item.status; card.innerHTML = `<div class="telemetry-name">${item.name}</div><div class="telemetry-value">${item.value} ${item.unit}</div><div class="telemetry-name">${item.status.toUpperCase()}</div>`; elements.telemetry.append(card); } if (!Object.keys(snapshot.telemetry).length) elements.telemetry.innerHTML = '<p class="muted">No active readings.</p>'; }
function renderChecklist(snapshot) { const checklist = snapshot.checklists[0]; if (!checklist) return; const complete = checklist.steps.filter((step) => step.completedAtMs !== null).length; elements.checklistProgress.textContent = `${complete} / ${checklist.steps.length}`; elements.checklistInstruction.textContent = checklist.status === 'complete' ? "Checklist complete. Select a station to continue." : "Confirm each step in order."; elements.checklist.replaceChildren(); checklist.steps.forEach((step, index) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'checklist-step'; button.disabled = snapshot.status === 'ready' || step.completedAtMs !== null; button.setAttribute('aria-current', index === checklist.currentIndex ? 'step' : 'false'); button.innerHTML = `<span class="step-index">${step.completedAtMs !== null ? '✓' : String(index + 1).padStart(2, '0')}</span><span>${step.label}<span class="step-description">${step.description}</span></span>`; button.addEventListener('click', () => { const currentChecklist = session.checklists[0]; const result = confirmStep(session, currentChecklist, step.id, 'panel'); if (result.ok && session.scenarioId === 'mental-readiness') { if (step.id === 'prioritize-atmosphere') simulation.resolveMentalEvent('simultaneous-alerts', 'atmosphere-first'); if (step.id === 'confirm-recovery') simulation.resolveMentalEvent('thermal-warning', 'hold-power'); } render(); }); elements.checklist.append(button); }); }
function renderStations(snapshot) { elements.stationPanel.replaceChildren(); if (snapshot.scenarioId === 'mental-readiness') { for (const event of simulation.mentalEvents) { const card = document.createElement('div'); card.className = 'station-card'; const copy = document.createElement('div'); const eventStatus = event.activated ? event.outcome.toUpperCase() : `ACTIVATES AT T+${event.triggerAtMs / 1000}s`; copy.innerHTML = `<strong>${event.priority.toUpperCase()} · ${event.id}</strong><small>${eventStatus}</small>`; card.append(copy); elements.stationPanel.append(card); } return; } for (const station of snapshot.stations) { const card = document.createElement('div'); card.className = 'station-card'; const copy = document.createElement('div'); copy.innerHTML = `<strong>${station.name}</strong><small>${station.status.toUpperCase()} · fatigue ${(station.fatigue * 100).toFixed(0)}%</small>`; const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary-button'; button.disabled = snapshot.status !== 'active' || station.status === 'unsafe'; button.textContent = station.status === 'active' ? 'Complete' : station.status === 'complete' ? 'Completed' : 'Activate'; button.addEventListener('click', () => { if (station.status === 'active') simulation.completeStation(station.id); else simulation.activateStation(station.id); render(); }); card.append(copy, button); elements.stationPanel.append(card); } }
function renderReport(report) { if (!report) return; elements.report.hidden = false; elements.reportResult.textContent = `${report.result.toUpperCase()} · ${report.score}/100`; elements.reportContent.innerHTML = `<p>Decisiones registradas: ${report.decisions.length}. Incidentes: ${report.incidents.length}.</p><ul>${report.recommendations.map((item) => `<li>${item}</li>`).join('')}</ul>`; }
function render() { const snapshot = simulation.snapshot(); elements.missionTime.textContent = formatMissionTime(snapshot.missionTimeMs); elements.missionState.textContent = snapshot.status.toUpperCase(); elements.connection.textContent = snapshot.status === 'active' ? "SIMULATION ACTIVE" : "SIMULATION READY"; elements.objective.textContent = snapshot.status === 'active' ? "Follow the checklist and monitor telemetry." : "Confirm the preliminary protocol and prepare the first station."; elements.finish.disabled = snapshot.status !== 'active'; renderPhaseRail(snapshot); renderTelemetry(snapshot); renderChecklist(snapshot); renderStations(snapshot); renderReport(snapshot.lastReport); scene.update(snapshot); }

elements.scenario.addEventListener('change', () => { if (session.status === 'active') return; session = createSession({ seed: 24014, scenarioId: elements.scenario.value }); simulation = new Simulation(session); elements.start.disabled = false; elements.finish.disabled = true; elements.report.hidden = true; elements.conversation.replaceChildren(); render(); });
elements.start.addEventListener('click', () => { simulation.start(); addConversation('LUMINE', "Commander, initial status nominal. Please perform the first checklist verification."); elements.start.disabled = true; render(); });
elements.finish.addEventListener('click', () => { const report = simulation.finish(); addConversation('LUMINE', `Session complete. Score ${report.result}. Review recommended before the next flight.`); render(); });
elements.voiceForm.addEventListener('submit', (event) => { event.preventDefault(); const text = elements.voiceInput.value.trim(); if (!text) return; const context = buildTelemetryBlock(session, "Confirm the active checklist step."); addConversation('COMMANDER', text); addConversation('LUMINE', `Text mode active. ${context}`); elements.voiceInput.value = ''; });
let lastFrame = performance.now();
let lastUiRender = 0;
function animate(now) {
  const delta = now - lastFrame;
  lastFrame = now;
  simulation.advance(delta);
  if (now - lastUiRender >= 200) {
    lastUiRender = now;
    render();
  } else {
    scene.update(simulation.snapshot());
  }
  requestAnimationFrame(animate);
}
render(); requestAnimationFrame(animate);
export { THREE, simulation };
