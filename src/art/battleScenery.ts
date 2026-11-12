import { COLUMNS, ROWS, TILE, type GameState } from '../game/types.js';
import { royalsRemaining, ROYAL_FAMILY } from '../game/royalty.js';
import { laneColor } from './palette.js';
import { drawRoyalChouquette } from './royaltyArt.js';
import type { SpriteAtlas } from './render.js';

export const SHELF_WIDTH = TILE;
export const DOOR_WIDTH = TILE;
export const STREET_WIDTH = TILE * 2;
export const ROOM_WIDTH = SHELF_WIDTH + COLUMNS * TILE + DOOR_WIDTH + STREET_WIDTH;
export const ROOM_HEIGHT = ROWS * TILE;

type PixelContext = CanvasRenderingContext2D;

function rect(ctx: PixelContext, x: number, y: number, width: number, height: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function prepare(canvas: HTMLCanvasElement, width: number): PixelContext | null {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== ROOM_HEIGHT) canvas.height = ROOM_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, ROOM_HEIGHT);
  return ctx;
}

function drawShelves(ctx: PixelContext, state: GameState | null, t: number): void {
  rect(ctx, 0, 0, SHELF_WIDTH, ROOM_HEIGHT, '#394b41');
  rect(ctx, 0, 0, 5, ROOM_HEIGHT, '#65472f');
  rect(ctx, 5, 0, 3, ROOM_HEIGHT, '#bb9160');
  rect(ctx, 8, 0, 21, ROOM_HEIGHT, '#755039');
  rect(ctx, 28, 0, 4, ROOM_HEIGHT, '#3e5345');
  rect(ctx, 30, 0, 2, ROOM_HEIGHT, '#e7c78e');

  for (let row = 0; row < ROYAL_FAMILY.length; row++) {
    const y = row * TILE;
    const threatened = Boolean(state?.enemies.some(enemy => enemy.row === row && enemy.x < 1.7));
    const eaten = state?.royalsEaten[row] ?? false;
    const flashing = state?.lastRoyalEaten === row && t - (state?.royalHitAt ?? -100) < .9;
    const afraid = threatened || Boolean(state?.pins.find(pin => pin.row === row && pin.used));
    // Five sculpted wooden royal display alcoves, connected by a service passage.
    rect(ctx, 5, y + 1, 24, 29, '#4b322b');
    rect(ctx, 7, y + 3, 20, 24, eaten ? '#5a4d40' : '#b48a5f');
    rect(ctx, 8, y + 4, 18, 20, eaten ? '#50463e' : '#896a53');
    rect(ctx, 6, y + 26, 23, 4, threatened ? '#e6ab6a' : '#dcaf6e');
    rect(ctx, 7, y + 26, 21, 1, '#ffe5a1');
    drawRoyalChouquette(ctx, row, 0, y, t, eaten, afraid, flashing);
    if (!eaten && threatened && Math.sin(t * 11) > 0) {
      rect(ctx, 5, y + 4, 2, 16, '#fff1b4');
      rect(ctx, 27, y + 6, 2, 13, '#fac987');
    }
    if (eaten) {
      rect(ctx, 7, y + 2, 20, 2, '#725648');
      rect(ctx, 10, y + 5, 14, 1, '#c3a982');
    }
  }
  if (state && royalsRemaining(state.royalsEaten) === 0) {
    rect(ctx, 0, 0, 3, ROOM_HEIGHT, '#c04e3f');
  }
}

/**
 * Outdoor tiles use the SAME world-grid coordinates during gameplay and in
 * the preview camera. startWorldX is the absolute scene pixel coordinate.
 */
export function drawOutdoorPavement(
  ctx: PixelContext, destX: number, width: number, startWorldX: number,
  t: number,
): void {
  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;
    rect(ctx, destX, y, width, TILE, row % 2 ? '#d1baa0' : '#e1c8a8');
    rect(ctx, destX, y + 1, width, 2, '#f5dbb2');
    rect(ctx, destX, y + 27, width, 4, '#ab9075');
    for (let worldX = startWorldX; worldX < startWorldX + width; worldX += 32) {
      const x = destX + worldX - startWorldX;
      rect(ctx, x + 29, y + 2, 1, 24, '#b69e83');
      rect(ctx, x + 11 + row % 3, y + 12 + row % 4, 4, 1, '#f3dec5');
      rect(ctx, x + 19, y + 20, 2, 2, '#c0a68b');
    }
    const shimmer = (Math.sin(t * .8 + row) + 1) / 2;
    rect(ctx, destX + ((row * 11 + 9) % Math.max(1, width)), y + 6, 1, 1,
      shimmer > .7 ? '#fff1da' : '#dbc6aa');
  }
}

/**
 * A glass bakery doorway bridges the interior worktop and outdoor pavement.
 * Hoomans are drawn from the SAME state as the gameplay and street canvases.
 */
function drawDoor(ctx: PixelContext, state: GameState | null, sprites: SpriteAtlas, t: number): void {
  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;
    rect(ctx, 0, y, DOOR_WIDTH, TILE, laneColor(row));
    rect(ctx, 0, y, DOOR_WIDTH, 2, '#f2e1c2');
    rect(ctx, 0, y + 27, DOOR_WIDTH, 4, '#ae9c81');
  }
  // Entry frame and shared lintel. Its opening remains completely passable.
  rect(ctx, 0, 0, DOOR_WIDTH, 4, '#5b4131');
  rect(ctx, 0, 4, DOOR_WIDTH, 2, '#e7c68e');
  rect(ctx, 26, 5, 5, ROOM_HEIGHT - 10, '#8aafa6');
  rect(ctx, 27, 7, 2, ROOM_HEIGHT - 14, '#e1eee0');
  rect(ctx, 30, 0, 2, ROOM_HEIGHT, '#65452d');

  drawActorsInSegment(ctx, 9, 1, state, sprites, t);
  drawWheelInSegment(ctx, 9, state, sprites);
  // Narrow jambs overlay the Hoomans so they clearly step through the door.
  rect(ctx, 0, 0, 2, ROOM_HEIGHT, '#b78d60');
  rect(ctx, 30, 0, 2, ROOM_HEIGHT, '#6e4b35');
  rect(ctx, 0, ROOM_HEIGHT - 3, DOOR_WIDTH, 3, '#684f3b');
}

function drawStreet(
  ctx: PixelContext, state: GameState | null,
  sprites: SpriteAtlas, t: number,
): void {
  drawOutdoorPavement(ctx, 0, STREET_WIDTH, SHELF_WIDTH + COLUMNS * TILE + DOOR_WIDTH, t);
  // Storefront details appear above the pavement, but don't hide any lanes.
  rect(ctx, 0, 0, STREET_WIDTH, 4, '#6b4d37');
  for (let x = 0; x < STREET_WIDTH; x += 16) {
    rect(ctx, x, 4, 16, 4, x % 32 === 0 ? '#d57e61' : '#ffe1a0');
  }
  rect(ctx, STREET_WIDTH - 5, 8, 3, ROOM_HEIGHT - 13, '#587c74');
  rect(ctx, STREET_WIDTH - 6, 8, 1, ROOM_HEIGHT - 13, '#d0e3d8');
  drawActorsInSegment(ctx, COLUMNS + 1, 2, state, sprites, t);
  drawWheelInSegment(ctx, COLUMNS + 1, state, sprites);
}

function drawActorsInSegment(
  ctx: PixelContext, beginX: number, columns: number,
  state: GameState | null, sprites: SpriteAtlas, t: number,
): void {
  const frame = Math.floor(t * 4) % 2;
  for (const enemy of state?.enemies ?? []) {
    if (enemy.x <= beginX - .55 || enemy.x >= beginX + columns + .55) continue;
    const sprite = sprites.images[enemy.kind + ((frame + enemy.row) % 2)];
    if (!sprite) continue;
    const x = Math.round((enemy.x - beginX) * TILE);
    ctx.drawImage(sprite, x - 16, enemy.row * TILE - 2);
  }
}

function drawWheelInSegment(
  ctx: PixelContext, beginX: number, state: GameState | null, sprites: SpriteAtlas,
): void {
  for (const pin of state?.pins ?? []) {
    if (!pin.active || pin.x < beginX - 1 || pin.x > beginX + 3.5) continue;
    const x = Math.round((pin.x - beginX) * TILE);
    ctx.drawImage(sprites.images.pin, x - 16, pin.row * TILE + 2);
  }
}

/**
 * One continuous pixel world: shelf(32) + board(288) + door(32) +
 * outdoor street(64). Each canvas is one exact slice of the same frame.
 */
export function drawBattleScenery(
  shelvesCanvas: HTMLCanvasElement,
  entranceCanvas: HTMLCanvasElement,
  streetCanvas: HTMLCanvasElement,
  sprites: SpriteAtlas,
  state: GameState | null = null,
  elapsed = 0,
): void {
  const shelves = prepare(shelvesCanvas, SHELF_WIDTH);
  const entrance = prepare(entranceCanvas, DOOR_WIDTH);
  const street = prepare(streetCanvas, STREET_WIDTH);
  if (!shelves || !entrance || !street) return;
  const t = Number.isFinite(elapsed) ? elapsed : 0;
  drawShelves(shelves, state, t);
  drawDoor(entrance, state, sprites, t);
  drawStreet(street, state, sprites, t);
}
