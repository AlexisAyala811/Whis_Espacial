import test from 'node:test';
import assert from 'node:assert/strict';
import { playLaunchSequence } from '../../src/launch-sequence.js';

function setup(play = () => Promise.resolve()) {
  const video = new EventTarget();
  video.currentTime = 4;
  video.play = play;
  video.pause = () => { video.pausedBySequence = true; };
  const skip = new EventTarget();
  skip.focus = () => { skip.focused = true; };
  return { video, skip, container: { hidden: true }, phase: { textContent: '' }, reducedMotion: false };
}

test('launch footage completes and releases the transition', async () => {
  const view = setup();
  const playing = playLaunchSequence(view);
  assert.equal(view.container.hidden, false);
  assert.equal(view.video.currentTime, 0);
  assert.equal(view.skip.focused, true);
  view.video.dispatchEvent(new Event('playing'));
  view.video.dispatchEvent(new Event('ended'));
  await playing;
  assert.equal(view.container.hidden, true);
  assert.equal(view.video.pausedBySequence, true);
});

test('launch footage can be skipped, including with reduced motion', async () => {
  const view = setup(() => { throw new Error('must not play'); });
  view.reducedMotion = true;
  const playing = playLaunchSequence(view);
  view.skip.dispatchEvent(new Event('click'));
  await playing;
  assert.equal(view.container.hidden, true);
});

test('unavailable video continues to the spacecraft', async () => {
  const view = setup(() => Promise.reject(new Error('blocked')));
  const playing = playLaunchSequence(view);
  await playing;
  assert.match(view.phase.textContent, /VIDEO UNAVAILABLE/);
  assert.equal(view.container.hidden, true);
});
