import type { P3 } from "../art/sprites.js";
export interface HumanAppearance { s: P3; pa: string; h: P3; x: string }
export interface DefenderDefinition { n: string; c: number; hp: number; cd: number; d: string }
export interface EnemyDefinition { n: string; hp: number; sp: number; o: HumanAppearance; d: string }
export const DEFENDERS: Record<string, DefenderDefinition> = {
  butter: { n: 'Butter Block', c: 50, hp: 60, cd: 5, d: 'Produces butter, the currency of the bakery.' },
  croissant: { n: 'Croissant', c: 100, hp: 60, cd: 4, d: 'Flings crumbs at customers in its lane.' },
  loaf: { n: 'Loaf Bread', c: 50, hp: 400, cd: 12, d: 'A sturdy, crusty whole loaf that blocks hungry Hoomans.' },
  pretzel: { n: 'Pretzel', c: 175, hp: 60, cd: 6, d: 'Shoots icing that slows customers.' },
  pie: { n: 'Pie', c: 150, hp: 1, cd: 18, d: 'Arms after a few seconds, then explodes when customers get close.' },
};
export const ENEMIES: Record<string, EnemyDefinition> = {
  walk: { n: 'Customer', hp: 8, sp: .16, d: 'Hungry and not very fast.', o: { s: ['#6aa4f0', '#3f7fd8', '#2a57a0'], pa: '#2a3a5e', h: ['#a0653a', '#7b4a26', '#4c2c14'], x: '' } },
  jog: { n: 'Jogger', hp: 6, sp: .32, d: 'Fast but fragile.', o: { s: ['#ff7a6e', '#d8403c', '#9c2420'], pa: '#2b2b44', h: ['#fff08a', '#f1c84b', '#b8902a'], x: 'band' } },
  critic: { n: 'Food Critic', hp: 18, sp: .15, d: 'Takes a lot of crumbs to turn away.', o: { s: ['#aab0b8', '#7b818c', '#4f5560'], pa: '#3a3f48', h: ['#555555', '#2b1608', '#111111'], x: 'tie' } },
  insp: { n: 'Health Inspector', hp: 45, sp: .11, d: 'Slow, stubborn and very tough.', o: { s: ['#6fc58a', '#3c8d5a', '#25603a'], pa: '#2a3a2e', h: ['#ffffff', '#e8e8e8', '#bbbbbb'], x: 'hat' } },
};
