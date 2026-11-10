import { drawBattlefield, type SpriteAtlas } from './render.js';
import { COLUMNS, ROWS, TILE, type GameState } from '../game/types.js';
import type { Level } from '../game/levels.js';

export const APPROACH_DURATION_MS = 3900;
const VIEW_WIDTH = COLUMNS * TILE;
const VIEW_HEIGHT = ROWS * TILE;
const WORLD_WIDTH = 480;

export interface ApproachCamera {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

/** Hold on the approaching Hoomans, then track and zoom smoothly back to the entire bakery. */
export function approachCamera(progress: number): ApproachCamera {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const t = Math.max(0, Math.min(1, (p - .24) / .72));
  const eased = t * t * (3 - 2 * t);
  const zoom = 1.43 - .43 * eased;
  const sourceWidth = VIEW_WIDTH / zoom;
  const sourceHeight = VIEW_HEIGHT / zoom;
  const center = 355 + (VIEW_WIDTH / 2 - 355) * eased;
  return {
    sourceX: Math.max(0, Math.min(WORLD_WIDTH - sourceWidth, center - sourceWidth / 2)),
    sourceY: (VIEW_HEIGHT - sourceHeight) / 2,
    sourceWidth, sourceHeight,
  };
}

/** Static diorama. These are preview actors, not spawned gameplay enemies or Dex encounters. */
export function drawApproachWorld(level: Level, state: GameState, sprites: SpriteAtlas): HTMLCanvasElement {
  const world = document.createElement('canvas');
  world.width = WORLD_WIDTH;
  world.height = VIEW_HEIGHT;
  const ctx = world.getContext('2d');
  if (!ctx) throw new Error('Cannot render bakery approach');
  ctx.imageSmoothingEnabled = false;

  // Baker's pavement and flour-dusted stones beyond the playable trays.
  ctx.fillStyle = '#b98857';
  ctx.fillRect(VIEW_WIDTH, 0, WORLD_WIDTH - VIEW_WIDTH, VIEW_HEIGHT);
  for (let y = 0; y < VIEW_HEIGHT; y += 32) {
    for (let x = VIEW_WIDTH; x < WORLD_WIDTH; x += 32) {
      ctx.fillStyle = (x / 32 + y / 32) % 2 ? '#b98857' : '#c89762';
      ctx.fillRect(x, y, 32, 32);
      ctx.fillStyle = '#e7c795'; ctx.fillRect(x, y, 31, 2);
      ctx.fillStyle = '#98633f'; ctx.fillRect(x + 31, y + 2, 1, 30);
      ctx.fillStyle = '#dfb47b'; ctx.fillRect(x + 9, y + 12, 6, 2);
      ctx.fillStyle = '#a66e43'; ctx.fillRect(x + 10, y + 14, 3, 2);
    }
  }
  ctx.fillStyle = '#fbe1ad'; ctx.fillRect(VIEW_WIDTH, 0, 4, VIEW_HEIGHT);
  ctx.fillStyle = '#795032'; ctx.fillRect(VIEW_WIDTH + 4, 0, 2, VIEW_HEIGHT);
  ctx.fillStyle = '#80532e'; ctx.fillRect(463, 9, 3, 145);
  ctx.fillStyle = '#f1ce89'; ctx.fillRect(451, 7, 26, 7);
  ctx.fillStyle = '#784526'; ctx.fillRect(454, 15, 21, 10);
  ctx.fillStyle = '#fff0c5'; ctx.font = 'bold 7px monospace'; ctx.fillText('BAKERY', 451, 21);

  const board = document.createElement('canvas');
  board.width = VIEW_WIDTH;
  board.height = VIEW_HEIGHT;
  drawBattlefield(board, state, level, sprites);
  ctx.drawImage(board, 0, 0);

  // Show every type featured in this level together on the far-right approach.
  const kinds = level.previewEnemies;
  const count = kinds.length;
  kinds.forEach((kind, index) => {
    const positionX = count === 1 ? 385 : 315 + index * (137 / (count - 1));
    const baselineY = 72 + (index % 2) * 45;
    ctx.fillStyle = '#573c2e66';
    ctx.fillRect(Math.round(positionX - 14), baselineY + 12, 31, 4);
    ctx.drawImage(sprites.images[`${kind}0`], Math.round(positionX - 21), baselineY - 30, 44, 44);
  });
  return world;
}

/** Draw a camera crop from the approach diorama into the fixed-size gameplay view. */
export function drawApproachFrame(canvas: HTMLCanvasElement, world: HTMLCanvasElement, progress: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot draw approach frame');
  const camera = approachCamera(progress);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(world, camera.sourceX, camera.sourceY, camera.sourceWidth, camera.sourceHeight,
    0, 0, canvas.width, canvas.height);
}
