import test from 'node:test';
import assert from 'node:assert/strict';
import { VoiceClient } from '../../src/audio/voice-client.js';

test('voice client safely falls back when no WebSocket is connected', () => {
  const client = new VoiceClient({ onStatus() {}, onTranscript() {}, onAudio() {}, onInterrupt() {} });
  assert.equal(client.sendText('estado', 'contexto'), false);
  assert.equal(client.sendAudio('AQ=='), false);
});
