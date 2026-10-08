import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

const STORAGE_KEYS = {
  SFX_ENABLED: '@kansya_sfx_enabled',
  MUSIC_ENABLED: '@kansya_music_enabled',
};

// Default states: Sound effects ON, Background music OFF
let sfxEnabled = true;
let musicEnabled = false;

// Audio player instances
let coinPlayer: AudioPlayer | null = null;
let tapPlayer: AudioPlayer | null = null;
let celebrationPlayer: AudioPlayer | null = null;
let milestonePlayer: AudioPlayer | null = null;
let musicPlayer: AudioPlayer | null = null;

let isInitialized = false;

export async function initAudioEngine(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const [savedSfx, savedMusic] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SFX_ENABLED),
      AsyncStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED),
    ]);

    if (savedSfx !== null) {
      sfxEnabled = savedSfx === 'true';
    } else {
      sfxEnabled = true; // Default: Sound effects ON
    }

    if (savedMusic !== null) {
      musicEnabled = savedMusic === 'true';
    } else {
      musicEnabled = false; // Default: Background music OFF
    }

    if (Platform.OS !== 'web') {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
          shouldPlayInBackground: false,
        });
      } catch (_) {}

      try {
        coinPlayer = createAudioPlayer(require('../../assets/sounds/coin.wav'));
        if (coinPlayer) coinPlayer.volume = 0.85;
      } catch (_) {}

      try {
        tapPlayer = createAudioPlayer(require('../../assets/sounds/click.wav'));
        if (tapPlayer) tapPlayer.volume = 0.6;
      } catch (_) {}

      try {
        celebrationPlayer = createAudioPlayer(require('../../assets/sounds/celebration.wav'));
        if (celebrationPlayer) celebrationPlayer.volume = 0.9;
      } catch (_) {}

      try {
        milestonePlayer = createAudioPlayer(require('../../assets/sounds/milestone.wav'));
        if (milestonePlayer) milestonePlayer.volume = 0.85;
      } catch (_) {}

      try {
        musicPlayer = createAudioPlayer(require('../../assets/sounds/ambient_loop.mp3'));
        if (musicPlayer) {
          musicPlayer.loop = true;
          musicPlayer.volume = 0.45;
          if (musicEnabled) {
            musicPlayer.play();
          }
        }
      } catch (_) {}
    }

    AppState.addEventListener('change', handleAppStateChange);
  } catch (_) {
    // Graceful fallback for non-native / test environments
  }
}

function handleAppStateChange(nextState: AppStateStatus) {
  if (!musicPlayer) return;
  try {
    if (nextState === 'active') {
      if (musicEnabled && !musicPlayer.playing) {
        musicPlayer.play();
      }
    } else {
      if (musicPlayer.playing) {
        musicPlayer.pause();
      }
    }
  } catch (_) {}
}

export function playCoinSound() {
  if (!sfxEnabled || !coinPlayer) return;
  try {
    coinPlayer.seekTo(0).catch(() => {});
    coinPlayer.play();
  } catch (_) {}
}

export function playTapSound() {
  if (!sfxEnabled || !tapPlayer) return;
  try {
    tapPlayer.seekTo(0).catch(() => {});
    tapPlayer.play();
  } catch (_) {}
}

export function playGoalCompleteSound() {
  if (!sfxEnabled || !celebrationPlayer) return;
  try {
    celebrationPlayer.seekTo(0).catch(() => {});
    celebrationPlayer.play();
  } catch (_) {}
}

export function playMilestoneSound() {
  if (!sfxEnabled || !milestonePlayer) return;
  try {
    milestonePlayer.seekTo(0).catch(() => {});
    milestonePlayer.play();
  } catch (_) {}
}

export async function setSoundEffectsEnabled(enabled: boolean): Promise<void> {
  sfxEnabled = enabled;
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SFX_ENABLED, String(enabled));
  } catch (_) {}
}

export async function setMusicEnabled(enabled: boolean): Promise<void> {
  musicEnabled = enabled;
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, String(enabled));
    if (musicPlayer) {
      if (enabled) {
        musicPlayer.play();
      } else {
        musicPlayer.pause();
      }
    }
  } catch (_) {}
}

export function getSoundEffectsEnabled(): boolean {
  return sfxEnabled;
}

export function getMusicEnabled(): boolean {
  return musicEnabled;
}

export async function toggleSfx(): Promise<boolean> {
  const next = !sfxEnabled;
  await setSoundEffectsEnabled(next);
  return next;
}

export async function toggleMusic(): Promise<boolean> {
  const next = !musicEnabled;
  await setMusicEnabled(next);
  return next;
}

export const isSfxEnabled = getSoundEffectsEnabled;
export const isMusicEnabled = getMusicEnabled;

