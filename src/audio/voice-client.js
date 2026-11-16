import { PcmPlayer } from './pcm-player.js';

export class VoiceClient {
  constructor({ onStatus, onTranscript, onAudio, onInterrupt }) {
    this.onStatus = onStatus;
    this.onTranscript = onTranscript;
    this.onAudio = onAudio;
    this.onInterrupt = onInterrupt;
    this.socket = null;
    this.player = new PcmPlayer();
    this.model = 'gemini-3.8-live';
  }

  async connect({ instructions, context }) {
    this.onStatus('connecting');
    const response = await fetch('/api/live-token', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('voice-token-unavailable');
    const payload = await response.json();
    this.model = payload.model ?? this.model;
    await new Promise((resolve, reject) => {
      const endpoint = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?access_token=${encodeURIComponent(payload.token)}`;
      this.socket = new WebSocket(endpoint);
      this.socket.addEventListener('open', () => {
        this.socket.send(JSON.stringify({ setup: { model: `models/${this.model}`, generationConfig: { responseModalities: ['AUDIO'] }, systemInstruction: { parts: [{ text: instructions }] }, inputAudioTranscription: {}, outputAudioTranscription: {}, sessionResumption: {} } }));
        this.sendContext(context);
        this.onStatus('connected');
        resolve();
      }, { once: true });
      this.socket.addEventListener('error', () => reject(new Error('voice-websocket-error')), { once: true });
      this.socket.addEventListener('message', (event) => this.handleMessage(event.data));
      this.socket.addEventListener('close', () => this.onStatus('unavailable'));
    });
  }

  handleMessage(raw) {
    const message = JSON.parse(raw);
    const content = message.serverContent;
    if (content?.interrupted) {
      this.player.interrupt();
      this.onInterrupt();
    }
    if (content?.inputTranscription?.text) this.onTranscript('COMMANDER', content.inputTranscription.text);
    if (content?.outputTranscription?.text) this.onTranscript('LUMINE', content.outputTranscription.text);
    for (const part of content?.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) this.onAudio(part.inlineData.data);
    }
  }

  sendContext(context) {
    if (!this.socket || this.socket.readyState !== 1) return;
    this.socket.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: context }] }], turnComplete: true } }));
  }

  sendText(text, context) {
    if (!this.socket || this.socket.readyState !== 1) return false;
    this.socket.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: `${context}\nConsulta: ${text}` }] }], turnComplete: true } }));
    return true;
  }

  sendAudio(base64) {
    if (!this.socket || this.socket.readyState !== 1) return false;
    this.socket.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64 }] } }));
    return true;
  }

  close() {
    this.socket?.close();
    this.player.interrupt();
    this.socket = null;
    this.onStatus('unavailable');
  }
}
