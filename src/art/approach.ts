import { drawBattlefield, type SpriteAtlas } from './render.js';
import { ENEMIES } from '../game/catalog.js';
import { COLUMNS, ROWS, TILE, type GameState } from '../game/types.js';
import type { EnemyKind, Level } from '../game/levels.js';

export const APPROACH_HOLD_MS = 4000;
export const APPROACH_PAN_MS = 2500;
export const APPROACH_READY_MS = 1000;
export const APPROACH_DURATION_MS = APPROACH_HOLD_MS + APPROACH_PAN_MS + APPROACH_READY_MS;
const VIEW_WIDTH = COLUMNS * TILE;
const VIEW_HEIGHT = ROWS * TILE;
const WORLD_WIDTH = 480;

export interface ApproachCamera {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * Show the arriving customer types long enough to recognize them before
 * the constant-zoom pan. The final pause shows "BAKE!" on the actual board.
 */
export function approachCamera(progress: number): ApproachCamera {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const hold = APPROACH_HOLD_MS / APPROACH_DURATION_MS;
  const pan = APPROACH_PAN_MS / APPROACH_DURATION_MS;
  const t = Math.max(0, Math.min(1, (p - hold) / pan));
  const eased = t * t * (3 - 2 * t);
  return {
    sourceX: (WORLD_WIDTH - VIEW_WIDTH) * (1 - eased),
    sourceY: 0,
    sourceWidth: VIEW_WIDTH,
    sourceHeight: VIEW_HEIGHT,
  };
}

/** What CAN attack this shift, derived from actual spawns rather than guessed counts. */
export function incomingKinds(level: Level): EnemyKind[] {
  if (level.tutorial) {
    const spawns = level.tutorial.flatMap(step => step.spawn ?? []);
    return [...new Set(spawns.map(spawn => spawn.kind))];
  }
  const kinds = Object.keys(ENEMIES) as EnemyKind[];
  return kinds.filter((kind, index) => level.weights[index] > 0);
}

/**
 * Preview samples only: ordinary shifts choose enemies randomly, so their
 * exact eventual population cannot be predicted from the level table.
 * Teaching shifts show their actual hand-scripted Hoomans.
 */
export function previewActors(level: Level): EnemyKind[] {
  if (level.tutorial) return level.tutorial.flatMap(step => (step.spawn ?? []).map(actor => actor.kind));
  const kinds = incomingKinds(level);
  if (!kinds.length) return [];
  const previewCount = Math.min(8, Math.max(4, kinds.length * 2));
  return Array.from({ length: previewCount }, (_, index) => kinds[index % kinds.length]);
}

/** Outdoor diorama immediately to the right of the tall bakery entrance. */
export function drawApproachWorld(
  level: Level,
  state: GameState,
  sprites: SpriteAtlas,
  seconds = 0,
): HTMLCanvasElement {
  const world = document.createElement('canvas');
  world.width = WORLD_WIDTH;
  world.height = VIEW_HEIGHT;
  const ctx = world.getContext('2d');
  if (!ctx) throw new Error('Cannot render bakery approach');
  ctx.imageSmoothingEnabled = false;

  // Long shopfront; stone pavement extends the interior rows to the street.
  ctx.fillStyle = '#55776e';
  ctx.fillRect(VIEW_WIDTH, 0, WORLD_WIDTH - VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = '#c29a6a';
  ctx.fillRect(VIEW_WIDTH + 32, 0, WORLD_WIDTH - VIEW_WIDTH - 32, VIEW_HEIGHT);
  for (let y = 0; y < VIEW_HEIGHT; y += 32) {
    for (let x = VIEW_WIDTH + 32; x < WORLD_WIDTH; x += 32) {
      ctx.fillStyle = (x / 32 + y / 32) % 2 ? '#bd986e' : '#d1ae81';
      ctx.fillRect(x, y, 32, 32);
      ctx.fillStyle = '#e5cba1';
      ctx.fillRect(x, y, 31, 2);
      ctx.fillStyle = '#a9815d';
      ctx.fillRect(x + 31, y + 2, 1, 30);
      ctx.fillStyle = '#f2d4a7';
      ctx.fillRect(x + 8, y + 13, 5, 1);
    }
  }

  // Draw a recognizable bakery entrance exactly where the live door begins.
  ctx.fillStyle = '#654a32';
  ctx.fillRect(VIEW_WIDTH, 0, 4, VIEW_HEIGHT);
  ctx.fillStyle = '#d5ac74';
  ctx.fillRect(VIEW_WIDTH + 4, 0, 3, VIEW_HEIGHT);
  ctx.fillStyle = '#7faaa4';
  ctx.fillRect(VIEW_WIDTH + 22, 8, 10, VIEW_HEIGHT - 16);
  ctx.fillStyle = '#e3c38d';
  ctx.fillRect(VIEW_WIDTH + 29, 8, 2, VIEW_HEIGHT - 16);
  ctx.fillStyle = '#755136';
  ctx.fillRect(VIEW_WIDTH, 0, 32, 7);
  ctx.fillStyle = '#d7af7b';
  ctx.fillRect(VIEW_WIDTH, 7, 32, 2);

  const board = document.createElement('canvas');
  board.width = VIEW_WIDTH;
  board.height = VIEW_HEIGHT;
  drawBattlefield(board, state, level, sprites);
  ctx.drawImage(board, 0, 0);

  // Display the real incoming kinds. Extras on random-wave levels are
  // illustrative customers, not secretly generated gameplay enemies.
  const crowd = previewActors(level);
  const count = crowd.length;
  const perRow = Math.min(4, count);
  const upperCount = Math.min(count, perRow);
  for (let index = 0; index < count; index++) {
    const row = count > 4 ? Math.floor(index / 4) : 0;
    const position = count > 4 ? index % 4 : index;
    const unitsInRow = count > 4 ? (row === 0 ? upperCount : count - 4) : count;
    const spread = 135 / Math.max(1, unitsInRow);
    const x = Math.round(334 + (position + .5) * spread);
    const y = (count > 4 ? (row ? 134 : 86) : 116) + Math.round(Math.sin(seconds * 3 + index * 1.5) * 2);
    ctx.fillStyle = '#72513f70';
    ctx.fillRect(x - 13, y - 2, 26, 3);
    const sprite = sprites.images[crowd[index] + (Math.floor(seconds * 4 + index) % 2)];
    if (sprite) ctx.drawImage(sprite, x - 17, y - 35, 34, 34);
  }

  // Shop sign and striped awning, visible while the camera holds outside.
  ctx.fillStyle = '#634732';
  ctx.fillRect(345, 0, 119, 15);
  for (let x = 345; x < 464; x += 16) {
    ctx.fillStyle = (x / 16) % 2 ? '#f0ca89' : '#c77761';
    ctx.fillRect(x, 13, 16, 10);
  }
  ctx.fillStyle = '#ffedb9';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SEKACHOUX BAKERY', 352, 11);
  return world;
}

/** Constant-size camera crop; switching to gameplay never changes the scale. */
export function drawApproachFrame(canvas: HTMLCanvasElement, world: HTMLCanvasElement, progress: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot draw approach frame');
  const camera = approachCamera(progress);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(world, camera.sourceX, camera.sourceY, camera.sourceWidth, camera.sourceHeight,
    0, 0, canvas.width, canvas.height);
}
