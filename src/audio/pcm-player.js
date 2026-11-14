export class PcmPlayer {
  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
    this.context = null;
    this.nextStartTime = 0;
  }

  ensureContext() {
    this.context ??= new AudioContext({ sampleRate: this.sampleRate });
    return this.context;
  }

  playBase64(base64) {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    const audio = this.ensureContext();
    const buffer = audio.createBuffer(1, bytes.byteLength / 2, this.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = view.getInt16(index * 2, true) / 32768;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);
    const start = Math.max(audio.currentTime, this.nextStartTime);
    source.start(start);
    this.nextStartTime = start + buffer.duration;
  }

  interrupt() {
    this.nextStartTime = 0;
    if (this.context) this.context.close();
    this.context = null;
  }
}
