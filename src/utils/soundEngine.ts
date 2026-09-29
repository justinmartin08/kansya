/**
 * SoundEngine - Audio decommissioned.
 * All sound playback has been permanently silenced across Kansya.
 */
class SoundEngine {
  public setMuted(_muted: boolean): void {}
  public getMuted(): boolean {
    return true;
  }
  public playCoin(): void {}
  public playThud(): void {}
  public playMilestone(): void {}
  public playCelebration(): void {}
  public playClick(): void {}
}

export const soundEffects = new SoundEngine();
