import wave
import math
import struct
import os

SAMPLE_RATE = 44100

def create_wav(filename, samples):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        for s in samples:
            # Clamp to 16-bit signed integer range
            clamped = max(-32767, min(32767, int(s * 32767.0)))
            wav_file.writeframes(struct.pack('<h', clamped))

def generate_coin(duration=0.65):
    # Sparkling dual-frequency metallic chime with rich ringing overtones
    total_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # Envelope: ultra-fast attack, smooth natural exponential ring
        env = math.exp(-6.5 * t)
        
        # Dual main resonances
        tone1 = math.sin(2 * math.pi * 987.77 * t)  # B5
        tone2 = math.sin(2 * math.pi * 1318.51 * t) # E6
        
        # Shimmering harmonic overtones (chorus effect for "catch" / "kilite")
        harm1 = 0.45 * math.sin(2 * math.pi * 2637.0 * t)
        harm2 = 0.25 * math.sin(2 * math.pi * 3951.0 * t)
        chorus = 0.20 * math.sin(2 * math.pi * (1318.51 + 5.0) * t)
        
        # Initial metallic impact click (first 5ms)
        impact = 0.35 * (1.0 - t/0.005) * math.sin(2 * math.pi * 3200 * t) if t < 0.005 else 0.0
        
        val = env * (0.35 * tone1 + 0.35 * tone2 + harm1 + harm2 + chorus) + impact
        samples.append(val * 0.75)
    return samples

def generate_click(duration=0.065):
    # Poppy, bubbly tactile tap with rich punch
    total_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-65.0 * t)
        # Fast pitch glide from 620Hz down to 210Hz
        freq = 210.0 + (620.0 - 210.0) * math.exp(-80.0 * t)
        tone = math.sin(2 * math.pi * freq * t)
        # Subtle acoustic body resonance
        body = 0.25 * math.sin(2 * math.pi * 380.0 * t)
        val = env * (tone + body)
        samples.append(val * 0.85)
    return samples

def generate_milestone(duration=0.85):
    # 5-note uplifting acoustic arpeggio (C5, E5, G5, B5, C6)
    notes = [523.25, 659.25, 783.99, 987.77, 1046.5]
    total_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * total_samples
    spacing = 0.09
    
    for idx, freq in enumerate(notes):
        start_time = idx * spacing
        start_sample = int(start_time * SAMPLE_RATE)
        note_dur = duration - start_time
        note_total = int(note_dur * SAMPLE_RATE)
        
        for i in range(min(note_total, total_samples - start_sample)):
            t = i / SAMPLE_RATE
            env = math.exp(-7.0 * t)
            tone = math.sin(2 * math.pi * freq * t)
            octave = 0.35 * math.sin(2 * math.pi * freq * 2.0 * t)
            val = env * (0.65 * tone + octave)
            samples[start_sample + i] += val * 0.28
            
    # Normalize peak
    max_val = max(abs(s) for s in samples) or 1.0
    return [s / max_val * 0.85 for s in samples]

def generate_celebration(duration=1.3):
    # Grand harmonic chord shimmer (C5, E5, G5, C6, E6, G6)
    notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
    total_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * total_samples
    spacing = 0.08
    
    for idx, freq in enumerate(notes):
        start_time = idx * spacing
        start_sample = int(start_time * SAMPLE_RATE)
        note_dur = duration - start_time
        note_total = int(note_dur * SAMPLE_RATE)
        
        for i in range(min(note_total, total_samples - start_sample)):
            t = i / SAMPLE_RATE
            env = math.exp(-4.5 * t)
            tone = math.sin(2 * math.pi * freq * t)
            harm = 0.3 * math.sin(2 * math.pi * freq * 2 * t)
            samples[start_sample + i] += env * (tone + harm) * 0.22
            
    max_val = max(abs(s) for s in samples) or 1.0
    return [s / max_val * 0.85 for s in samples]

def generate_thud(duration=0.28):
    # Deep, warm bank vault / coin jar deposit thud
    total_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-18.0 * t)
        freq = 42.0 + (135.0 - 42.0) * math.exp(-22.0 * t)
        tone = math.sin(2 * math.pi * freq * t)
        samples.append(env * tone * 0.85)
    return samples

if __name__ == '__main__':
    base_dirs = [
        'assets/sounds',
        'android/app/src/main/res/raw'
    ]
    
    generators = {
        'coin.wav': generate_coin(),
        'click.wav': generate_click(),
        'milestone.wav': generate_milestone(),
        'celebration.wav': generate_celebration(),
        'thud.wav': generate_thud(),
    }
    
    for d in base_dirs:
        for fname, data in generators.items():
            out_path = os.path.join(d, fname)
            create_wav(out_path, data)
            print(f"Generated: {out_path} ({len(data)} samples)")
    print("All audio files generated successfully!")
