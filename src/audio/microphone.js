function downsample(input, sourceRate, targetRate) {
  if (sourceRate === targetRate) return input;
  const ratio = sourceRate / targetRate;
  const length = Math.round(input.length / ratio);
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) output[index] = input[Math.min(input.length - 1, Math.round(index * ratio))];
  return output;
}

function toPcm16(input) {
  const output = new Int16Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    const value = Math.max(-1, Math.min(1, input[index]));
    output[index] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return output;
}

export function pcmToBase64(pcm) {
  const bytes = new Uint8Array(pcm.buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function startMicrophone(onChunk) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(2048, 1, 1);
  processor.onaudioprocess = (event) => {
    const mono = event.inputBuffer.getChannelData(0);
    const pcm = toPcm16(downsample(mono, audioContext.sampleRate, 16000));
    onChunk(pcmToBase64(pcm));
  };
  source.connect(processor);
  processor.connect(audioContext.destination);
  return () => {
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    audioContext.close();
  };
}
