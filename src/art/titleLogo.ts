/**
 * Hand-authored, pixel-exact bakery logo. Not CSS text or a flattened banner.
 * Glyphs are rendered at 4x resolution with toasted outlines, raised dough
 * highlights and a compact red-brown subtitle plaque.
 */
export const LOGO_WIDTH = 288;
export const LOGO_HEIGHT = 48;

const FONT: Record<string, readonly string[]> = {
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
  N: ['10001','11001','10101','10011','10001','10001','10001'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
};
function labelWidth(str: string, scale: number, gap: number): number {
  return [...str].reduce((sum, ch, i) => sum + (i ? gap : 0) + (ch === ' ' ? 3 : 5) * scale, 0);
}
function paint(ctx: CanvasRenderingContext2D, str: string, startX: number, y: number, scale: number, gap: number, fill: (line: number) => string, shadow = true): void {
  let x = startX;
  for (const letter of str) {
    const bitmap = FONT[letter];
    if (!bitmap) { x += 3 * scale + gap; continue; }
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (bitmap[row][col] !== '1') continue;
        const px = x + col * scale;
        const py = y + row * scale;
        if (shadow) {
          ctx.fillStyle = '#39251f';
          ctx.fillRect(px - 1, py - 1, scale + 2, scale + 2);
          ctx.fillStyle = '#73412c';
          ctx.fillRect(px + 2, py + 3, scale, scale);
        }
        ctx.fillStyle = fill(row);
        ctx.fillRect(px, py, scale, scale);
        if (scale >= 3 && row <= 2) {
          ctx.fillStyle = '#fff1bb';
          ctx.fillRect(px + 1, py, scale - 1, 1);
        }
      }
    }
    x += 5 * scale + gap;
  }
}
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x + 3, y, 2, 10);
  ctx.fillRect(x, y + 4, 8, 2);
  ctx.fillRect(x + 2, y + 3, 4, 4);
}

/** Render once at startup. The actual game scene behind it remains animated. */
export function drawBakeryPixelLogo(canvas: HTMLCanvasElement): void {
  if (canvas.width !== LOGO_WIDTH) canvas.width = LOGO_WIDTH;
  if (canvas.height !== LOGO_HEIGHT) canvas.height = LOGO_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Title artwork requires Canvas 2D');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, LOGO_WIDTH, LOGO_HEIGHT);

  // A slim drop shadow gives the text weight without a large flat title box.
  const title = 'SEKACHOUX TD';
  const scale = 4, gap = 2;
  const x = Math.floor((LOGO_WIDTH - labelWidth(title, scale, gap)) / 2);
  paint(ctx, title, x, 3, scale, gap, row =>
    row === 0 ? '#fff4c9' :
    row <= 2 ? '#ffda83' :
    row <= 4 ? '#e6a654' : '#ba7140');

  // Classic pastry-box seal below the logo, with folded corners.
  ctx.fillStyle = '#412b29';
  ctx.fillRect(78, 34, 132, 14);
  ctx.fillStyle = '#8d483c';
  ctx.fillRect(80, 35, 128, 11);
  ctx.fillStyle = '#c56e49';
  ctx.fillRect(82, 36, 124, 2);
  ctx.fillStyle = '#e9b77b';
  ctx.fillRect(86, 45, 116, 1);
  ctx.fillStyle = '#68392f';
  ctx.fillRect(75, 37, 6, 8);
  ctx.fillRect(207, 37, 6, 8);
  const subtitle = 'BAKERY DEFENSE';
  paint(ctx, subtitle, Math.floor((LOGO_WIDTH - labelWidth(subtitle, 1, 1))/2), 38, 1, 1,
    () => '#fff1d0', false);

  // Tiny flour highlights, intentionally away from legibility-critical letters.
  sparkle(ctx, 4, 18, '#f8d996');
  sparkle(ctx, 272, 12, '#f8d996');
  ctx.fillStyle = '#ffe6ab';
  ctx.fillRect(15, 6, 2, 2);
  ctx.fillRect(262, 29, 2, 2);
}
