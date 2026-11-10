/** Small original synth effects, generated on demand without external audio files. */
export const SOUND_SETTINGS_KEY = 'sekachoux_td_sound_v1';
export interface SoundSettings { volume: number; muted: boolean }
export type SoundCue = 'tap' | 'place' | 'butter' | 'win' | 'lose' | 'roll';

export function normalizeSoundSettings(raw: unknown): SoundSettings {
  const data = typeof raw === 'object' && raw !== null ? raw as Partial<SoundSettings> : {};
  const volume = typeof data.volume === 'number' && Number.isFinite(data.volume) ? data.volume : 0.6;
  return { volume: Math.max(0, Math.min(1, volume)), muted: data.muted === true };
}
export function loadSoundSettings(): SoundSettings {
  try {
    const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
    return stored === null ? normalizeSoundSettings(null) : normalizeSoundSettings(JSON.parse(stored));
  } catch { return normalizeSoundSettings(null); }
}
export function saveSoundSettings(settings: SoundSettings): SoundSettings {
  const clean = normalizeSoundSettings(settings);
  try { localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(clean)); } catch { /* Storage may be unavailable. */ }
  return clean;
}
const CUES: Record<SoundCue, readonly [number, number, number]> = {
  tap: [410, 520, .085], place: [310, 500, .15], butter: [670, 920, .16],
  win: [490, 880, .34], lose: [320, 155, .4], roll: [190, 260, .22],
};

/** Audio is unlocked only after the user interacts with the game. */
export class BakerySound {
  private context: AudioContext | null = null;
  settings: SoundSettings = loadSoundSettings();

  setVolume(volume: number): void {
    this.settings = saveSoundSettings({ ...this.settings, volume });
  }
  setMuted(muted: boolean): void {
    this.settings = saveSoundSettings({ ...this.settings, muted });
  }
  play(cue: SoundCue): void {
    const { volume, muted } = this.settings;
    if (muted || volume <= 0) return;
    try {
      const BrowserContext = window.AudioContext;
      if (!BrowserContext) return;
      if (!this.context) this.context = new BrowserContext();
      const ctx = this.context;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
      const [start, end, duration] = CUES[cue];
      const now = ctx.currentTime + .005;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = cue === 'roll' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume * .12), now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + .015);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Unsupported or blocked audio must never stop gameplay. */ }
  }
}
