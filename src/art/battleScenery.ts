import { COLUMNS, ROWS, TILE, type GameState } from '../game/types.js';
import { laneColor } from './palette.js';
import type { SpriteAtlas } from './render.js';

const SIDE_WIDTH = TILE;
const SIDE_HEIGHT = ROWS * TILE;
type PixelContext = CanvasRenderingContext2D;

function rect(ctx: PixelContext, x: number, y: number, width: number, height: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function prepare(canvas: HTMLCanvasElement): PixelContext | null {
  if (canvas.width !== SIDE_WIDTH) canvas.width = SIDE_WIDTH;
  if (canvas.height !== SIDE_HEIGHT) canvas.height = SIDE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, SIDE_WIDTH, SIDE_HEIGHT);
  return ctx;
}

/**
 * Actual bakery objective: a shelf of five displays, one next to every lane.
 * These are scene props, not extra health or a change to the defeat condition.
 */
function drawShelves(ctx: PixelContext, sprites: SpriteAtlas, state: GameState | null, t: number): void {
  rect(ctx, 0, 0, 32, 160, '#40534a');
  rect(ctx, 0, 0, 3, 160, '#263d37');
  rect(ctx, 3, 0, 4, 160, '#ad8053');
  rect(ctx, 7, 0, 23, 160, '#86633f');
  rect(ctx, 10, 0, 20, 160, '#55432e');
  rect(ctx, 30, 0, 2, 160, '#2a3f34');
  const displayKinds = ['croissant', 'loaf', 'pretzel', 'butter', 'pie'];
  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;
    const threatened = Boolean(state?.enemies.some(e => e.row === row && e.x < 1.15));
    const glint = (Math.sin(t * 1.7 + row * 2.3) + 1) / 2;
    // Five lit wooden bread display compartments, not empty wallpaper.
    rect(ctx, 7, y + 1, 22, 26, '#3c372d');
    rect(ctx, 9, y + 2, 18, 22, '#bfa378');
    rect(ctx, 10, y + 4, 17, 19, '#6b5841');
    rect(ctx, 11, y + 5, 15, 16, '#8b7151');
    rect(ctx, 8, y + 23, 21, 5, threatened ? '#bd6b47' : '#d6ad71');
    rect(ctx, 7, y + 27, 24, 4, '#4f3728');
    rect(ctx, 9, y + 27, 20, 1, '#e4c38c');
    rect(ctx, 12, y + 20, 14, 3, '#e9c598');
    const pastry = sprites.images[displayKinds[row]];
    if (pastry) ctx.drawImage(pastry, 10, y + 2, 19, 19);
    // The narrow glass edge of each case picks up light as the bakery breathes.
    rect(ctx, 10, y + 5, 1, 15, '#dfca9b');
    rect(ctx, 12, y + 7 + Math.floor(glint * 8), 1, 2, '#fff1c5');
    if (threatened && Math.sin(t * 11) > 0) {
      rect(ctx, 5, y + 2, 2, 27, '#ffe49d');
      rect(ctx, 28, y + 12, 2, 8, '#f4ac6c');
    }
  }
  // The protective rail meets the game's existing rolling pins at the seam.
  rect(ctx, 29, 0, 2, SIDE_HEIGHT, '#cfb17f');
  for (let row = 0; row < ROWS; row++) rect(ctx, 29, row * TILE + 25, 2, 3, '#6a4934');
}

/**
 * Doorway shares native 32px cells with the board. Hoomans remain the SAME
 * GameState enemies in transit: no copied actors, no extra random spawns.
 * World x=9 starts at the board/door seam.
 */
function drawEntrance(ctx: PixelContext, sprites: SpriteAtlas, state: GameState | null, t: number): void {
  // Continuing stone lanes let all five game rows meet one tall entrance.
  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;
    rect(ctx, 0, y, SIDE_WIDTH, TILE, laneColor(row));
    rect(ctx, 0, y, SIDE_WIDTH, 2, '#e9d5b2');
    rect(ctx, 0, y + 27, SIDE_WIDTH, 4, '#aa9579');
    for (let x = 5; x < SIDE_WIDTH; x += 11) {
      rect(ctx, x + row % 3, y + 10 + row % 4, 2, 1, '#c0b8a0');
    }
  }

  // One tall open glass bakery entrance beyond the connected lane thresholds.
  rect(ctx, 23, 0, 9, SIDE_HEIGHT, '#5a7e78');
  rect(ctx, 25, 0, 5, SIDE_HEIGHT, '#a2c1b8');
  rect(ctx, 27, 0, 2, SIDE_HEIGHT, '#cde1d4');
  rect(ctx, 30, 0, 2, SIDE_HEIGHT, '#59432e');
  rect(ctx, 0, 0, SIDE_WIDTH, 5, '#58402b');
  rect(ctx, 0, 5, SIDE_WIDTH, 2, '#e3bc80');
  rect(ctx, 0, SIDE_HEIGHT - 6, SIDE_WIDTH, 3, '#bc956b');
  rect(ctx, 0, SIDE_HEIGHT - 3, SIDE_WIDTH, 3, '#6a5039');

  const approaching = Boolean(state?.enemies.some(e => e.x > COLUMNS - .5 && e.x < COLUMNS + 1.4));
  const opening = approaching ? 4 : 0;
  rect(ctx, 28 + opening, 11, 1, SIDE_HEIGHT - 22, '#f3e9ce');

  // Reveal actual running enemies in the hallway BEFORE they enter the board.
  // A crossing sprite is naturally split between the two adjacent canvases.
  const frame = Math.floor(t * 4) % 2;
  for (const enemy of state?.enemies ?? []) {
    if (enemy.x <= COLUMNS - .5 || enemy.x >= COLUMNS + 1.5) continue;
    const sprite = sprites.images[enemy.kind + ((frame + enemy.row) % 2)];
    if (!sprite) continue;
    const localX = Math.round((enemy.x - COLUMNS) * TILE);
    ctx.drawImage(sprite, localX - TILE / 2, enemy.row * TILE - 2);
  }

  // Door frame remains in front, making entry look like walking THROUGH it.
  rect(ctx, 29, 0, 3, SIDE_HEIGHT, '#654930');
  rect(ctx, 29, 4, 1, SIDE_HEIGHT - 8, '#e4c089');
  rect(ctx, 0, 0, 2, SIDE_HEIGHT, '#b28f66');
  for (let row = 0; row < ROWS; row++) {
    rect(ctx, 0, row * TILE + 24, 2, 3, '#6d5941');
  }
}

/**
 * Side panels occupy the unused width at the same pixel density as the board:
 * 32px shelf + 288px battlefield + 32px entrance = 352px world.
 */
export function drawBattleScenery(
  shelvesCanvas: HTMLCanvasElement,
  entranceCanvas: HTMLCanvasElement,
  sprites: SpriteAtlas,
  state: GameState | null = null,
  elapsed = 0,
): void {
  const shelves = prepare(shelvesCanvas);
  const entrance = prepare(entranceCanvas);
  if (!shelves || !entrance) return;
  const t = Number.isFinite(elapsed) ? elapsed : 0;
  drawShelves(shelves, sprites, state, t);
  drawEntrance(entrance, sprites, state, t);
}
