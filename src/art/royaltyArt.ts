import { ROYAL_FAMILY } from '../game/royalty.js';

type Context = CanvasRenderingContext2D;

function dot(ctx: Context, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Individual original 32px royal chouquette sprites, never deployable units. */
export function drawRoyalChouquette(
  ctx: Context, row: number, x: number, y: number,
  time: number, eaten: boolean, afraid: boolean, hit: boolean,
): void {
  if (row < 0 || row >= ROYAL_FAMILY.length) return;
  // A golden embroidered cushion on each little throne.
  dot(ctx, x + 1, y + 24, 28, 4, '#674330');
  dot(ctx, x + 2, y + 23, 26, 2, '#d6ac6b');
  dot(ctx, x + 6, y + 26, 18, 2, '#f5d393');
  dot(ctx, x + 3, y + 28, 24, 3, '#4b382e');

  if (eaten) {
    // Tiny royal crumbs and an abandoned crown remain after a Hooman eats one.
    dot(ctx, x + 7, y + 20, 4, 2, '#b97944');
    dot(ctx, x + 19, y + 20, 3, 2, '#e4b069');
    dot(ctx, x + 13, y + 17, 4, 2, '#ffd889');
    dot(ctx, x + 9, y + 21, 14, 2, '#e7bc56');
    dot(ctx, x + 12, y + 18, 2, 3, '#b98b46');
    dot(ctx, x + 19, y + 17, 2, 4, '#b98b46');
    if (hit) { dot(ctx, x + 3, y + 11, 3, 3, '#fff1d2'); dot(ctx, x + 24, y + 7, 2, 3, '#ffd276'); }
    return;
  }

  const bounce = afraid ? (Math.floor(time * 9) % 2 ? 0 : 1) : Math.round(Math.sin(time * 2.2 + row) * .7);
  const py = y + bounce;
  // A crinkled chou pastry shell made from layers of warm honey-gold pixels.
  dot(ctx, x + 9, py + 8, 14, 16, '#8f542e');
  dot(ctx, x + 6, py + 12, 20, 10, '#aa6537');
  dot(ctx, x + 7, py + 9, 18, 12, '#d4944d');
  dot(ctx, x + 9, py + 7, 14, 14, '#efb86c');
  dot(ctx, x + 12, py + 6, 8, 3, '#f8d38d');
  dot(ctx, x + 8, py + 12, 3, 6, '#f7cf86');
  dot(ctx, x + 21, py + 13, 2, 5, '#b97940');
  for (let i = 0; i < 4; i++) dot(ctx, x + 11 + i * 3, py + 10 + (i % 2) * 2, 2, 1, '#fff4c6');

  // Friendly readable expression, including panic when a breached lane nears.
  dot(ctx, x + 12, py + 15, 2, afraid ? 3 : 2, '#49342e');
  dot(ctx, x + 19, py + 15, 2, afraid ? 3 : 2, '#49342e');
  if (afraid) {
    dot(ctx, x + 15, py + 18, 3, 3, '#9b443b');
    dot(ctx, x + 11, py + 13, 3, 1, '#663b2e');
    dot(ctx, x + 19, py + 13, 3, 1, '#663b2e');
  } else {
    dot(ctx, x + 14, py + 19, 5, 1, '#aa694e');
    dot(ctx, x + 15, py + 20, 3, 1, '#fff5de');
  }
  dot(ctx, x + 8, py + 17, 2, 2, '#e9957f');
  dot(ctx, x + 22, py + 17, 2, 2, '#e9957f');

  if (row === 0) { // Queen: tall jeweled crown and pearly earrings
    dot(ctx, x + 10, py + 2, 13, 5, '#f6d66e');
    dot(ctx, x + 10, py + 0, 3, 5, '#ffc85d');
    dot(ctx, x + 16, py - 1, 3, 6, '#ffe59b');
    dot(ctx, x + 21, py + 0, 3, 5, '#ffc85d');
    dot(ctx, x + 16, py + 3, 3, 2, '#bd6585');
    dot(ctx, x + 7, py + 17, 2, 2, '#fff5ea');
    dot(ctx, x + 25, py + 17, 2, 2, '#fff5ea');
  } else if (row === 1) { // King: chunky golden crown, red jewel
    dot(ctx, x + 9, py + 2, 15, 5, '#d6a03b');
    dot(ctx, x + 9, py - 1, 3, 6, '#ffe177');
    dot(ctx, x + 15, py - 2, 3, 7, '#ffe177');
    dot(ctx, x + 22, py - 1, 3, 6, '#ffe177');
    dot(ctx, x + 16, py + 3, 2, 2, '#e44d45');
    dot(ctx, x + 14, py + 21, 5, 2, '#7d4b35');
  } else if (row === 2) { // Princess: sugar-pink bow and tiny tiara
    dot(ctx, x + 13, py + 2, 7, 2, '#fff0bf');
    dot(ctx, x + 15, py + 0, 3, 3, '#f2b8d4');
    dot(ctx, x + 6, py + 9, 6, 3, '#ed89b6');
    dot(ctx, x + 9, py + 8, 4, 5, '#f9accb');
    dot(ctx, x + 5, py + 7, 3, 5, '#dc6b9f');
    dot(ctx, x + 11, py + 7, 3, 5, '#dc6b9f');
  } else if (row === 3) { // Prince: small blue-gem crown and royal sash
    dot(ctx, x + 11, py + 1, 12, 5, '#eed177');
    dot(ctx, x + 11, py - 1, 3, 4, '#ffd879');
    dot(ctx, x + 18, py - 2, 3, 5, '#ffe9a0');
    dot(ctx, x + 16, py + 2, 3, 2, '#648abd');
    dot(ctx, x + 10, py + 20, 4, 3, '#7294c8');
    dot(ctx, x + 17, py + 20, 6, 2, '#7294c8');
  } else { // Grandpa: tiny spectacles, white eyebrows and cream mustache
    dot(ctx, x + 11, py + 13, 4, 1, '#f6ead5');
    dot(ctx, x + 19, py + 13, 4, 1, '#f6ead5');
    dot(ctx, x + 10, py + 15, 5, 4, '#e6ddbf');
    dot(ctx, x + 18, py + 15, 5, 4, '#e6ddbf');
    dot(ctx, x + 15, py + 16, 3, 1, '#9b8559');
    dot(ctx, x + 12, py + 19, 8, 2, '#f7f0df');
    dot(ctx, x + 15, py + 21, 4, 1, '#ddd8c6');
    dot(ctx, x + 12, py + 3, 10, 3, '#e6ddd0');
  }
  if (hit) { // Brief flour puff while the family reacts to a stolen royal
    dot(ctx, x + 2, y + 8, 3, 2, '#fff7df');
    dot(ctx, x + 25, y + 4, 3, 2, '#fff7df');
    dot(ctx, x + 4, y + 15, 1, 3, '#f7dba7');
  }
}
