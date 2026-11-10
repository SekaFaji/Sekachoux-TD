import { LEVELS } from './levels.js';

/** Pure presentation helpers: future levels/towers never leak into current stages. */
export function campaignLevelLabel(index: number): string {
  return `1-${index + 1}`;
}

export function nextPlayableLevel(unlocked: number): number {
  return Math.max(0, Math.min(LEVELS.length, unlocked) - 1);
}

export function stageCompleteMessage(index: number): string {
  return index === LEVELS.length - 1
    ? 'Every customer has been turned away. The bakery is safe!'
    : 'The hungry customers have retreated. Your next shift awaits!';
}
