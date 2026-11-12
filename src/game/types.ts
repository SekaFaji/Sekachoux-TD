export const COLUMNS = 9;
export const ROWS = 5;
export const TILE = 32;
/** World coordinates measured from the playable field's left edge. */
export const STREET_END_X = COLUMNS + 3;
export const STREET_SPAWN_X = COLUMNS + 2.35;
export const OUTSIDE_WALK_SPEED = 1.4;

export interface Defender { kind: string; column: number; row: number; health: number; timer: number }
export interface Enemy { kind: string; x: number; row: number; health: number; slow: number }
export interface Projectile { x: number; row: number; ice: boolean; consumed?: boolean }
export interface ButterDrop { x: number; y: number; targetY: number; life: number }
export interface Effect { x: number; y: number; life: number }
export interface RollingPin { row: number; x: number; active: boolean; used: boolean }

export interface GameState {
  levelIndex: number;
  butter: number;
  defenders: Defender[];
  enemies: Enemy[];
  projectiles: Projectile[];
  drops: ButterDrop[];
  effects: Effect[];
  pins: RollingPin[];
  /** One protected royal per physical shelf row, true after being eaten. */
  royalsEaten: boolean[];
  lastRoyalEaten: number | null;
  royalHitAt: number;
  elapsed: number;
  spawnTimer: number;
  dropTimer: number;
  cooldowns: Record<string, number>;
  firstWave: boolean;
  finalWave: boolean;
  collected: number;
  placed: Record<string, number>;
  kills: number;
  lastDefeated: { x: number; row: number } | null;
  tutorialIndex: number;
  intro: number;
  introLabel: string;
}
export type GameEvent =
  | { type: 'banner'; message: string; duration: number }
  | { type: 'tip'; message: string }
  | { type: 'hooman'; kind: string }
  | { type: 'royal-eaten'; row: number; royalIndex: number; remaining: number }
  | { type: 'win' }
  | { type: 'lose' };
