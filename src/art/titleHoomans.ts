/**
 * Small deterministic title-only routines, not combat AI. The Hoomans walk to
 * the bakery window, stop, glance inside and occasionally knock or inspect.
 * Using a fixed baseline avoids the unnatural infinite marching/bobbing.
 */
export type TitleHoomanReaction = 'approach' | 'watch' | 'peer' | 'gesture' | 'leave';
export type TitleHoomanRole = 'hungry' | 'impatient' | 'critic';
export interface TitleHoomanPose {
  kind: 'walk' | 'jog' | 'critic';
  role: TitleHoomanRole;
  x: number;
  y: number;
  size: number;
  frame: 0 | 1;
  reaction: TitleHoomanReaction;
  blink: boolean;
  gestureFrame: 0 | 1 | 2;
}
export const TITLE_WINDOW = { x: 222, y: 36, width: 85, height: 88 } as const;
const ACTORS = [
  { kind: 'walk', role: 'hungry', x: 222, baseline: 119, size: 27, period: 12, offset: 0 },
  { kind: 'jog', role: 'impatient', x: 251, baseline: 120, size: 27, period: 13, offset: 3.8 },
  { kind: 'critic', role: 'critic', x: 280, baseline: 119, size: 27, period: 14, offset: 7.2 },
] as const;

function smoothstep(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return p * p * (3 - 2 * p);
}

/** A time-driven pose can be tested without a canvas or requestAnimationFrame. */
export function titleHoomanPose(seconds: number, index: number): TitleHoomanPose {
  const actor = ACTORS[index];
  if (!actor) throw new RangeError('Unknown menu Hooman');
  const time = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const phase = (time + actor.offset) % actor.period;
  let reaction: TitleHoomanReaction = 'watch';
  let shift = 0;
  let frame: 0 | 1 = 0;
  let gestureFrame: 0 | 1 | 2 = 0;
  if (phase < 1.15) {
    // Enter by two or three pixels, not across the adjacent pane.
    reaction = 'approach';
    shift = Math.round(3 * (1 - smoothstep(phase / 1.15)));
    frame = (Math.floor(phase * 6) % 2) as 0 | 1;
  } else if (phase >= 3.6 && phase < 5.0) {
    reaction = 'peer';
    shift = -Math.round(1.5 * Math.sin(Math.PI * (phase - 3.6) / 1.4));
  } else if (phase >= 5.7 && phase < 6.9) {
    reaction = 'gesture';
    // A short animated arm gesture, once per loop.
    const interval = (phase - 5.7) / 1.2;
    gestureFrame = interval < .26 ? 1 : interval < .6 ? 2 : interval < .83 ? 1 : 0;
  } else if (phase >= actor.period - 1.2) {
    reaction = 'leave';
    shift = Math.round(3 * smoothstep((phase - (actor.period - 1.2)) / 1.2));
    frame = (Math.floor(phase * 6) % 2) as 0 | 1;
  }

  const blink = (phase >= 2.75 && phase < 2.88) || (phase >= 8.75 && phase < 8.88);
  return {
    kind: actor.kind,
    role: actor.role,
    x: actor.x + shift,
    y: actor.baseline - actor.size,
    size: actor.size,
    frame,
    reaction,
    blink,
    gestureFrame,
  };
}

export const TITLE_HOOMAN_COUNT = ACTORS.length;
