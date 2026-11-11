import { COLUMNS, ROWS, TILE } from '../game/types.js';
import { BAKERY_PALETTE as P, laneColor, laneShadow } from './palette.js';

/**
 * A continuous linen-and-stone pastry worktop, framed as five baking lanes.
 * Small corner registration marks show valid placement cells without a checkerboard.
 */
export function drawBakeryWorktop(ctx: CanvasRenderingContext2D, activeRows: readonly number[]): void {
  const width = COLUMNS * TILE;
  const height = ROWS * TILE;
  ctx.save();
  ctx.fillStyle = P.ink;
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < ROWS; row++) {
    const y = row * TILE;
    const active = activeRows.includes(row);

    // Soft recessed tray edging and the uninterrupted working surface.
    ctx.fillStyle = '#605650'; ctx.fillRect(0, y, width, TILE);
    ctx.fillStyle = P.copper; ctx.fillRect(0, y, width, 2);
    ctx.fillStyle = P.copperLight; ctx.fillRect(0, y + 2, width, 1);
    ctx.fillStyle = laneColor(row); ctx.fillRect(2, y + 3, width - 4, 25);
    ctx.fillStyle = laneShadow(row); ctx.fillRect(2, y + 25, width - 4, 3);
    ctx.fillStyle = '#8d756c'; ctx.fillRect(0, y + 28, width, 3);
    ctx.fillStyle = '#5e5853'; ctx.fillRect(0, y + 31, width, 1);

    // Fine fabric lines: evenly spaced, faint, and not random noise.
    ctx.fillStyle = row % 2 === 0 ? '#f2ead9' : '#eaf0e7';
    for (let xx = 8; xx < width - 8; xx += 16) {
      ctx.fillRect(xx, y + 8, 3, 1);
      ctx.fillRect(xx + 5, y + 21, 2, 1);
    }

    // Small copper registration marks leave the center of each tile unobscured.
    for (let column = 1; column < COLUMNS; column++) {
      const x = column * TILE;
      ctx.fillStyle = row % 2 === 0 ? '#c8bbaa' : '#b7c9bd';
      ctx.fillRect(x, y + 5, 1, 4);
      ctx.fillRect(x, y + 22, 1, 4);
      ctx.fillStyle = '#fffaf2';
      ctx.fillRect(x + 1, y + 6, 1, 2);
    }
    // Subtle raised copper end-caps frame the pastry tray.
    ctx.fillStyle = P.copper; ctx.fillRect(0, y + 3, 3, 25); ctx.fillRect(width - 3, y + 3, 3, 25);
    ctx.fillStyle = P.copperLight; ctx.fillRect(3, y + 6, 1, 17); ctx.fillRect(width - 4, y + 6, 1, 17);
    for (const x of [1, width - 2]) {
      ctx.fillStyle = '#f8d8a9'; ctx.fillRect(x, y + 10, 1, 2); ctx.fillRect(x, y + 21, 1, 2);
    }

    if (active) {
      // Very small, deterministic flour flecks add life without obscuring units.
      for (let fleck = 0; fleck < 12; fleck++) {
        const fx = 7 + (fleck * 47 + row * 19) % (width - 14);
        const fy = y + 7 + (fleck * 7 + row * 3) % 14;
        ctx.fillStyle = fleck % 3 === 0 ? '#fff8e7' : '#cbbda8';
        ctx.fillRect(fx, fy, fleck % 4 === 0 ? 2 : 1, 1);
      }
    }

    if (!active) {
      // Covered linen still shows an inviting worktop in early one-lane lessons.
      ctx.fillStyle = 'rgba(65,77,72,.48)';
      ctx.fillRect(3, y + 3, width - 6, 25);
      ctx.fillStyle = '#adbaae'; ctx.fillRect(10, y + 15, width - 20, 1);
      for (let x = 14; x < width - 8; x += 24) {
        ctx.fillStyle = '#81958a'; ctx.fillRect(x, y + 11, 6, 1); ctx.fillRect(x + 4, y + 20, 5, 1);
        ctx.fillStyle = '#d2d9ca'; ctx.fillRect(x + 7, y + 14, 4, 1);
      }
    }
  }

  // Top and bottom edging ties the five trays together.
  ctx.fillStyle = P.cocoa; ctx.fillRect(0, 0, width, 1);
  ctx.fillStyle = P.copperLight; ctx.fillRect(0, height - 2, width, 1);
  ctx.restore();
}
