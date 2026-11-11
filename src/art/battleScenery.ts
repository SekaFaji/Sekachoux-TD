import type { SpriteAtlas } from './render.js';

const WIDTH = 320;
const HEIGHT = 180;
type CanvasContext = CanvasRenderingContext2D;

function block(ctx: CanvasContext, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * The playable nine-by-five worktop floats inside the SAME living bakery as
 * the main menu. All animation is decoration and never modifies game state.
 * The board is drawn in its own fixed-ratio viewport above this background.
 */
export function drawBattleScenery(canvas: HTMLCanvasElement, sprites: SpriteAtlas, elapsed = 0): void {
  if (canvas.width !== WIDTH) canvas.width = WIDTH;
  if (canvas.height !== HEIGHT) canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const t = Number.isFinite(elapsed) ? elapsed : 0;
  const flicker = .5 + .5 * Math.sin(t * 4.2);
  const glow = .5 + .5 * Math.sin(t * 2.1 + 1.6);

  // Bricked sage walls and warm stone countertop continue behind the board.
  block(ctx, 0, 0, WIDTH, HEIGHT, '#425b51');
  for (let y = 8; y < 126; y += 18) {
    block(ctx, 0, y, WIDTH, 1, '#708174');
    for (let x = ((y / 18) % 2 ? 12 : 0); x < WIDTH; x += 40) {
      block(ctx, x, y + 2, 1, 16, '#314b45');
    }
  }
  block(ctx, 0, 0, WIDTH, 5, '#263f37');
  block(ctx, 0, 5, WIDTH, 2, '#b6b69b');
  block(ctx, 0, 126, WIDTH, 5, '#ac8a69');
  block(ctx, 0, 131, WIDTH, 49, '#6c675b');
  for (let y = 136; y < HEIGHT; y += 12) {
    block(ctx, 0, y, WIDTH, 1, '#9a9680');
    for (let x = y % 24 ? 10 : 0; x < WIDTH; x += 35) block(ctx, x, y + 1, 1, 11, '#5c5b54');
  }

  // Left: a genuine warm oven, with an animated ember rather than an emoji.
  block(ctx, 0, 29, 37, 112, '#2b3e38');
  block(ctx, 0, 31, 34, 7, '#c6aa7e');
  block(ctx, 1, 39, 31, 91, '#6c6555');
  block(ctx, 3, 43, 27, 79, '#c3aa89');
  block(ctx, 5, 48, 23, 60, '#3a332f');
  block(ctx, 7, 51, 19, 54, '#6c3a25');
  block(ctx, 8, 58, 17, 39, '#c16e30');
  const oven = ctx.createRadialGradient(16, 85, 1, 16, 85, 33);
  oven.addColorStop(0, 'rgba(255,202,91,' + (.6 + flicker * .2) + ')');
  oven.addColorStop(1, 'rgba(255,132,49,0)');
  ctx.fillStyle = oven;
  ctx.fillRect(0, 50, 38, 78);
  block(ctx, 11, 88 - Math.floor(flicker * 4), 4, 12 + flicker * 4, '#ffe5a0');
  block(ctx, 17, 82 - Math.floor(glow * 3), 4, 17 + glow * 3, '#ffc366');
  block(ctx, 8, 111, 19, 2, '#e5c99d');
  block(ctx, 6, 118, 24, 5, '#56463b');
  block(ctx, 8, 121, 5, 2, '#dbbd8d');
  block(ctx, 22, 121, 5, 2, '#dbbd8d');

  // Right: the customer entrance, a glimpse of the street and its awning.
  block(ctx, 289, 24, 31, 117, '#2f4a43');
  block(ctx, 293, 31, 27, 99, '#aa916f');
  block(ctx, 295, 35, 25, 85, '#6e9697');
  block(ctx, 296, 76, 24, 44, '#94a8a0');
  block(ctx, 296, 103, 24, 17, '#aa9f7e');
  block(ctx, 291, 26, 29, 7, '#d2b486');
  for (let x = 294; x < 320; x += 8) block(ctx, x, 27, 4, 7, '#b75f48');
  block(ctx, 292, 119, 28, 6, '#5b5145');
  block(ctx, 294, 124, 26, 3, '#d9bea0');
  block(ctx, 295, 38, 2, 77, '#e7d8b5');
  block(ctx, 303, 66, 1, 45, '#e7dbc1');
  block(ctx, 293, 17, 27, 7, '#e6c994');
  block(ctx, 296, 19, 23, 2, '#7b5235');
  // Moving shadow outside the glass implies passing customers.
  ctx.globalAlpha = .18 + .09 * Math.sin(t * .8);
  block(ctx, 308 + 3 * Math.sin(t * .4), 89, 7, 22, '#283e3d');
  ctx.globalAlpha = 1;

  // Bakery shelves and recognizable pastry shapes that tie back to the menu.
  block(ctx, 34, 13, 21, 4, '#cead81');
  block(ctx, 35, 17, 19, 1, '#6b4939');
  if (sprites.images.croissant) ctx.drawImage(sprites.images.croissant, 36, 1, 16, 16);
  block(ctx, 269, 14, 22, 4, '#cead81');
  block(ctx, 271, 17, 18, 1, '#6b4939');
  if (sprites.images.loaf) ctx.drawImage(sprites.images.loaf, 271, 1, 16, 16);

  // Occasional tiny flour dust flecks in the frame only.
  for (let i = 0; i < 7; i++) {
    const x = i % 2 ? 304 + i : 7 + i;
    const y = 10 + ((i * 23 + t * (1 + i % 3)) % 116);
    ctx.globalAlpha = .16 + .12 * Math.sin(t * 1.2 + i);
    block(ctx, x, y, 1, 1, '#fff4d7');
  }
  ctx.globalAlpha = 1;
}
