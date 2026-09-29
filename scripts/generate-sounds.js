const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // "data" chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.floor(intSample), 44 + i * 2);
  }

  return buffer;
}

const sampleRate = 22050;
const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 1. Coin sound
{
  const duration = 0.35;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);
  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = t < 0.08 ? 987.77 : 1318.51;
    const env = t < 0.08 ? 0.35 : 0.4 * Math.exp(-(t - 0.08) * 9);
    phase += (2 * Math.PI * freq) / sampleRate;
    const wave = Math.sin(phase) > 0 ? 1 : -1; // square wave
    samples[i] = wave * env;
  }
  fs.writeFileSync(path.join(soundsDir, 'coin.wav'), createWavBuffer(sampleRate, samples));
}

// 2. Thud sound
{
  const duration = 0.22;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);
  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = 140 - (140 - 45) * (t / duration);
    const env = 0.5 * Math.exp(-t * 12);
    phase += (2 * Math.PI * freq) / sampleRate;
    // triangle wave
    const wave = 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1;
    samples[i] = wave * env;
  }
  fs.writeFileSync(path.join(soundsDir, 'thud.wav'), createWavBuffer(sampleRate, samples));
}

// 3. Milestone fanfare
{
  const notes = [523.25, 659.25, 783.99, 1046.5, 1567.98];
  const noteDuration = 0.09;
  const totalDuration = notes.length * noteDuration + 0.3;
  const totalSamples = Math.floor(sampleRate * totalDuration);
  const samples = new Float32Array(totalSamples);

  notes.forEach((freq, idx) => {
    const startT = idx * noteDuration;
    const isLast = idx === notes.length - 1;
    const dur = isLast ? 0.35 : noteDuration;
    const startSample = Math.floor(startT * sampleRate);
    const endSample = Math.min(totalSamples, Math.floor((startT + dur) * sampleRate));
    let phase = 0;
    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      const env = 0.3 * Math.exp(-t * (isLast ? 4 : 8));
      phase += (2 * Math.PI * freq) / sampleRate;
      const wave = Math.sin(phase) > 0 ? 1 : -1;
      samples[i] += wave * env;
    }
  });
  fs.writeFileSync(path.join(soundsDir, 'milestone.wav'), createWavBuffer(sampleRate, samples));
}

// 4. Celebration fanfare chord
{
  const chords = [
    { f: 523.25, t: 0.0 },
    { f: 659.25, t: 0.1 },
    { f: 783.99, t: 0.2 },
    { f: 1046.5, t: 0.3 },
    { f: 1318.5, t: 0.45 },
  ];
  const totalDuration = 1.1;
  const totalSamples = Math.floor(sampleRate * totalDuration);
  const samples = new Float32Array(totalSamples);

  chords.forEach(({ f, t }) => {
    const startSample = Math.floor(t * sampleRate);
    const dur = totalDuration - t;
    const endSample = Math.floor(totalDuration * sampleRate);
    let phase = 0;
    for (let i = startSample; i < endSample; i++) {
      const localT = (i - startSample) / sampleRate;
      const env = 0.2 * Math.exp(-localT * 2.5);
      phase += (2 * Math.PI * f) / sampleRate;
      const wave = 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1;
      samples[i] += wave * env;
    }
  });
  fs.writeFileSync(path.join(soundsDir, 'celebration.wav'), createWavBuffer(sampleRate, samples));
}

// 5. Click sound
{
  const duration = 0.04;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);
  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = 800 - 500 * (t / duration);
    const env = 0.25 * Math.exp(-t * 50);
    phase += (2 * Math.PI * freq) / sampleRate;
    samples[i] = Math.sin(phase) * env;
  }
  fs.writeFileSync(path.join(soundsDir, 'click.wav'), createWavBuffer(sampleRate, samples));
}

console.log('Successfully generated retro 8-bit sound assets in assets/sounds/!');
