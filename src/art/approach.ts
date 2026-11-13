import { drawBattlefield, type SpriteAtlas } from './render.js';
import { drawBattleScenery, drawOutdoorPavement, ROOM_WIDTH, ROOM_HEIGHT, SHELF_WIDTH, DOOR_WIDTH, STREET_WIDTH } from './battleScenery.js';
import { ENEMIES } from '../game/catalog.js';
import { COLUMNS, TILE, type GameState } from '../game/types.js';
import type { EnemyKind, Level } from '../game/levels.js';

export const APPROACH_HOLD_MS = 4000;
export const APPROACH_PAN_MS = 2500;
export const APPROACH_READY_MS = 1000;
export const APPROACH_DURATION_MS = APPROACH_HOLD_MS + APPROACH_PAN_MS + APPROACH_READY_MS;
const VIEW_WIDTH = ROOM_WIDTH; // 416px, exactly the same world as live gameplay.
const VIEW_HEIGHT = ROOM_HEIGHT;
const EXTRA_STREET_WIDTH = TILE * 6;
const WORLD_WIDTH = VIEW_WIDTH + EXTRA_STREET_WIDTH; // 608px.

export interface ApproachCamera {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * Camera pans over ONE scene: royal shelves, 9x5 board, pass-through door
 * and outdoor street. At progress=1 every pixel matches the live scene.
 */
export function approachCamera(progress: number): ApproachCamera {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const hold = APPROACH_HOLD_MS / APPROACH_DURATION_MS;
  const pan = APPROACH_PAN_MS / APPROACH_DURATION_MS;
  const t = Math.max(0, Math.min(1, (p - hold) / pan));
  const eased = t * t * (3 - 2 * t);
  return {
    sourceX: EXTRA_STREET_WIDTH * (1 - eased),
    sourceY: 0,
    sourceWidth: VIEW_WIDTH,
    sourceHeight: VIEW_HEIGHT,
  };
}

/** Actual enemy kinds with nonzero weights or tutorial-scripted spawns. */
export function incomingKinds(level: Level): EnemyKind[] {
  if (level.tutorial) {
    const spawns = level.tutorial.flatMap(step => step.spawn ?? []);
    return [...new Set(spawns.map(spawn => spawn.kind))];
  }
  const kinds = Object.keys(ENEMIES) as EnemyKind[];
  return kinds.filter((kind, index) => level.weights[index] > 0);
}

/**
 * One sample actor per Hooman in the level's final-wave size.
 * Tutorials use each exact scripted spawn, including duplicates. Rush waves
 * have random composition, so a sample includes every possible enemy kind
 * then fills the remaining positions using the level's actual spawn weights.
 * The sample count is exact for finalWaveSize, not a claim about the
 * randomized composition or the total number spawned across the shift.
 */
export function previewActors(level: Level): EnemyKind[] {
  if (level.tutorial)
    return level.tutorial.flatMap(step => (step.spawn ?? []).map(actor => actor.kind));
  const kinds = incomingKinds(level);
  if (!kinds.length || level.finalWaveSize <= 0) return [];
  const target = Math.max(kinds.length, level.finalWaveSize);
  const lineup: EnemyKind[] = [...kinds];
  const orderedKinds = Object.keys(ENEMIES) as EnemyKind[];
  const relativeWeight = (kind: EnemyKind) => level.weights[orderedKinds.indexOf(kind)] ?? 0;
  const totalWeight = kinds.reduce((sum, kind) => sum + relativeWeight(kind), 0);
  while (lineup.length < target) {
    // Choose whichever kind is most under-represented relative to the
    // actual weights, tie-breaking by the stable catalog order.
    let next = kinds[0], greatestShortfall = -Infinity;
    for (const kind of kinds) {
      const expected = totalWeight ? relativeWeight(kind) / totalWeight * target : target / kinds.length;
      const shortfall = expected - lineup.filter(existing => existing === kind).length;
      if (shortfall > greatestShortfall) { next = kind; greatestShortfall = shortfall; }
    }
    lineup.push(next);
  }
  return lineup;
}

/** Persistent live scene drawn once per preview frame, with a long street beyond it. */
export function drawApproachWorld(
  level: Level, state: GameState, sprites: SpriteAtlas, seconds = 0,
): HTMLCanvasElement {
  const world = document.createElement('canvas');
  world.width = WORLD_WIDTH;
  world.height = VIEW_HEIGHT;
  const ctx = world.getContext('2d');
  if (!ctx) throw new Error('Cannot render bakery approach');
  ctx.imageSmoothingEnabled = false;
  const time = Number.isFinite(seconds) ? seconds : 0;

  drawOutdoorPavement(ctx, ROOM_WIDTH, EXTRA_STREET_WIDTH, ROOM_WIDTH, time);

  const shelf = document.createElement('canvas');
  const door = document.createElement('canvas');
  const street = document.createElement('canvas');
  drawBattleScenery(shelf, door, street, sprites, state, time);
  const board = document.createElement('canvas');
  board.width = COLUMNS * TILE;
  board.height = VIEW_HEIGHT;
  drawBattlefield(board, state, level, sprites);

  // Identical slices and offsets to #battle-room: no scene swap at the cut.
  ctx.drawImage(shelf, 0, 0);
  ctx.drawImage(board, SHELF_WIDTH, 0);
  ctx.drawImage(door, SHELF_WIDTH + COLUMNS * TILE, 0);
  ctx.drawImage(street, SHELF_WIDTH + COLUMNS * TILE + DOOR_WIDTH, 0);

  // Full enemy-type introduction is BEYOND the same visible exterior.
  // These decorative samples are never treated as real spawned wave members.
  const crowd = previewActors(level);
  const count = crowd.length;
  const perRow = Math.min(4, count);
  for (let index = 0; index < count; index++) {
    const row = count > 4 ? Math.floor(index / 4) : 0;
    const position = count > 4 ? index % 4 : index;
    const unitsInRow = count > 4 ? (row === 0 ? perRow : count - 4) : count;
    const spread = (EXTRA_STREET_WIDTH - 36) / Math.max(1, unitsInRow);
    const x = Math.round(ROOM_WIDTH + 18 + (position + .5) * spread);
    const y = (count > 4 ? (row ? 172 : 108) : 146) +
      Math.round(Math.sin(time * 3 + index * 1.5) * 2);
    ctx.fillStyle = '#72513f70';
    ctx.fillRect(x - 13, y - 2, 26, 3);
    const sprite = sprites.images[crowd[index] + (Math.floor(time * 4 + index) % 2)];
    if (sprite) ctx.drawImage(sprite, x - 17, y - 35, 34, 34);
  }

  // Market street and striped awning beyond the same real bakery entrance.
  const signX = ROOM_WIDTH + 6;
  ctx.fillStyle = '#634732';
  ctx.fillRect(signX, 0, EXTRA_STREET_WIDTH - 12, 15);
  for (let x = signX; x < WORLD_WIDTH - 6; x += 16) {
    ctx.fillStyle = (Math.floor(x / 16) % 2) ? '#f0ca89' : '#c77761';
    ctx.fillRect(x, 13, Math.min(16, WORLD_WIDTH - x - 6), 10);
  }
  ctx.fillStyle = '#ffedb9';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SEKACHOUX BAKERY', signX + 8, 11);
  return world;
}

/** The source region is always the full 416x160 world, never stretched. */
export function drawApproachFrame(
  canvas: HTMLCanvasElement, world: HTMLCanvasElement, progress: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot draw approach frame');
  const camera = approachCamera(progress);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(world, camera.sourceX, camera.sourceY, camera.sourceWidth, camera.sourceHeight,
    0, 0, canvas.width, canvas.height);
}
