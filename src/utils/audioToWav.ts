/**
 * Audio Conversion Utility (Web Audio API)
 * Decodes any browser-supported audio/video format (MP3, WAV, M4A, WebM, MP4, OGG, AAC)
 * and resamples it to standard 16,000 Hz 16-bit Mono PCM WAV format.
 * Optimized for lightweight speech payloads to prevent HTTP 413 errors.
 */

export async function convertAudioToWav(audioInput: Blob | File): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  try {
    const arrayBuffer = await audioInput.slice(0).arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const targetSampleRate = 16000;
    const numChannels = 1;
    const duration = audioBuffer.duration;
    const totalSamples = Math.ceil(duration * targetSampleRate);

    // Resample to 16kHz mono using OfflineAudioContext
    const OfflineAudioCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offlineContext = new OfflineAudioCtxClass(numChannels, totalSamples, targetSampleRate);

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const pcmData = renderedBuffer.getChannelData(0);

    // Convert Float32Array PCM samples to 16-bit PCM WAV container
    const wavBuffer = encodeWAV(pcmData, targetSampleRate);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } finally {
    if (audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier 'RIFF'
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type 'WAVE'
  writeString(view, 8, 'WAVE');
  // format chunk identifier 'fmt '
  writeString(view, 12, 'fmt ');
  // format chunk length (16 for PCM)
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * numChannels * bitsPerSample / 8)
  view.setUint32(28, sampleRate * 2, true);
  // block align (numChannels * bitsPerSample / 8)
  view.setUint16(32, 2, true);
  // bits per sample (16)
  view.setUint16(34, 16, true);
  // data chunk identifier 'data'
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write Float32 samples as 16-bit PCM (clamped to [-32768, 32767])
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

