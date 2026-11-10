import type { SpriteAtlas } from './render.js';

/**
 * Original hand-authored pixel scene. Navigation is HTML layered over painted
 * fixtures, so keyboard focus, screen readers and touch still work normally.
 * Rendered once at 480x270 and scaled without smoothing.
 */
export function drawBakeryScene(canvas: HTMLCanvasElement, sprites: SpriteAtlas): void {
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Bakery menu canvas unavailable');
  canvas.width = 480; canvas.height = 270; c.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, w: number, h: number, color: string): void => {
    c.fillStyle = color; c.fillRect(x, y, w, h);
  };
  const frame = (x: number, y: number, w: number, h: number, edge: string, face: string, highlight: string): void => {
    rect(x, y, w, h, edge); rect(x + 3, y + 3, w - 6, h - 6, face);
    rect(x + 4, y + 4, w - 8, 2, highlight);
    rect(x + 4, y + 4, 2, h - 8, highlight);
  };
  // Bakery plaster walls with warm skylight and staggered brick details.
  for (let y = 0; y < 190; y++) {
    const glow = Math.round(205 + 25 * (1 - y / 190));
    rect(0, y, 480, 1, `rgb(${glow},${Math.round(glow * .78)},${Math.round(glow * .53)})`);
  }
  for (let y = 8; y < 191; y += 18) {
    rect(0, y, 480, 1, '#b99066');
    for (let x = y % 36 ? 16 : 0; x < 480; x += 34) {
      rect(x, y, 1, 17, '#bd956b'); rect(x + 4, y + 4, 8, 1, '#e7c79e');
    }
  }
  // Ceiling rafters and heavy timber posts.
  rect(0, 0, 480, 12, '#4d2818'); rect(0, 10, 480, 4, '#8e4c2a');
  rect(0, 13, 480, 2, '#e1a260');
  for (const x of [0, 292, 474]) {
    rect(x, 13, 7, 200, '#572c19'); rect(x + 2, 15, 2, 183, '#9d5a2e');
    for (let y = 32; y < 190; y += 37) rect(x + 1, y, 5, 2, '#c18b4f');
  }
  // Window onto the bakery's sunny courtyard. Thick timber frame is deliberately chunky.
  frame(16, 83, 122, 107, '#4d2b1c', '#e1b375', '#f3cf91');
  rect(23, 89, 108, 94, '#7ab7de');
  for (let y = 89; y < 146; y++) rect(24, y, 107, 1, `rgb(${100 + ((y - 89) >> 2)},${173 + ((y - 89) >> 3)},${213 + ((y - 89) >> 3)})`);
  rect(24, 150, 107, 33, '#79a360');
  rect(24, 157, 107, 26, '#6c9256');
  for (let x = 22; x < 130; x += 31) {
    rect(x, 144 + (x % 7), 3, 34, '#e9d9b2'); rect(x + 2, 149, 1, 22, '#ac916b');
  }
  // Distant bakery rooftops beyond the window.
  rect(40, 118, 30, 34, '#eac29c'); rect(39, 115, 32, 4, '#ba6342');
  rect(83, 128, 32, 27, '#e2b995'); rect(81, 124, 37, 5, '#aa5b40');
  rect(48, 133, 7, 11, '#94613d'); rect(94, 137, 8, 11, '#94613d');
  // Crossbars and window sill.
  rect(75, 87, 7, 99, '#704225'); rect(78, 90, 2, 95, '#d2a36a');
  rect(22, 124, 109, 5, '#704225'); rect(24, 125, 104, 2, '#f5cd93');
  rect(9, 181, 133, 9, '#6d3d26'); rect(10, 181, 131, 3, '#dfaa6f');
  // A row of patterned floor tiles recedes behind the bakery counter.
  rect(0, 190, 480, 80, '#a86b42');
  for (let y = 190; y < 270; y += 18) {
    for (let x = 0; x < 480; x += 28) {
      rect(x + ((y / 18) % 2) * 14, y, 27, 17, (x + y) % 3 ? '#c18b62' : '#d9ab80');
    }
    rect(0, y, 480, 2, '#765039');
  }
  // A brick oven is visible behind the pastry display.
  rect(141, 104, 129, 95, '#74432e'); rect(146, 109, 119, 86, '#c78451');
  for (let y = 115; y < 189; y += 13) {
    rect(149, y, 113, 2, '#a05e3b');
    for (let x = 151 + ((y / 13 | 0) % 2) * 13; x < 259; x += 26) rect(x, y + 1, 1, 12, '#a05e3b');
  }
  // Oven arch, inside fire and its metallic baking tray.
  c.fillStyle = '#4b231b'; c.beginPath(); c.arc(208, 156, 39, Math.PI, 0); c.lineTo(247, 191); c.lineTo(169, 191); c.closePath(); c.fill();
  c.fillStyle = '#251610'; c.beginPath(); c.arc(208, 160, 32, Math.PI, 0); c.lineTo(240, 190); c.lineTo(176, 190); c.closePath(); c.fill();
  rect(184, 183, 50, 4, '#be7045'); rect(197, 171, 6, 13, '#faad43'); rect(202, 165, 7, 19, '#ffd16a');
  rect(210, 172, 6, 12, '#ff8331'); rect(216, 176, 6, 8, '#f7a83a');
  rect(177, 191, 62, 6, '#4b291e'); rect(180, 192, 56, 2, '#ecc48a');
  // Baguettes on angled racks to the right of the oven, behind the chalkboard.
  rect(273, 114, 25, 81, '#774627'); rect(275, 116, 20, 75, '#ad7344');
  for (let y = 122; y < 183; y += 16) {
    rect(277, y + 1, 16, 10, '#8c522d'); rect(279, y, 11, 7, '#dc9750');
    rect(281, y + 1, 2, 2, '#ffe0a0'); rect(286, y + 3, 3, 2, '#bc6e32');
  }
  // A glass display case and pastry trays are the visual anchor of the left half.
  rect(29, 183, 259, 49, '#5b3020'); rect(33, 188, 250, 38, '#b57743');
  rect(36, 193, 244, 27, '#d3b58c');
  for (let x = 47; x <= 250; x += 38) {
    rect(x, 210, 32, 4, '#6b4933');
    rect(x + 3, 204, 26, 6, '#e4a655'); rect(x + 7, 201, 18, 4, '#f4cc79');
    rect(x + 9, 202, 4, 1, '#fff3be'); rect(x + 20, 204, 3, 1, '#b5793d');
  }
  rect(35, 186, 246, 5, '#eee6c8'); rect(35, 190, 246, 3, '#8bb1bb');
  rect(35, 193, 2, 29, '#b6dae2'); rect(278, 193, 2, 29, '#6b8991');
  rect(37, 213, 240, 4, '#afc9bf80'); rect(35, 224, 246, 5, '#6e3c22');
  // A couple of larger character pastries displayed on the counter.
  c.drawImage(sprites.images.croissant, 51, 174, 37, 37);
  c.drawImage(sprites.images.butter, 106, 178, 30, 30);
  c.drawImage(sprites.images.pretzel, 226, 179, 31, 31);
  // Lower solid counter panel and inset joinery.
  rect(17, 231, 279, 39, '#4c271b'); rect(21, 231, 270, 35, '#925a35');
  rect(23, 233, 263, 3, '#dfab6e');
  for (const x of [25, 109, 193]) frame(x, 241, 75, 24, '#5d331d', '#764224', '#a76b40');
  // Menu chalkboard is built into the bakery wall. Navigation overlays this fixture.
  frame(302, 68, 165, 179, '#301c14', '#67402b', '#b48456');
  frame(309, 75, 151, 165, '#3b261a', '#273a32', '#677568');
  rect(315, 81, 138, 153, '#1e3029'); rect(318, 83, 132, 148, '#263c31');
  rect(325, 84, 118, 1, '#5f7a5c');
  for (let i = 0; i < 27; i++) {
    const x = 320 + ((i * 43) % 129), y = 91 + ((i * 31) % 126);
    rect(x, y, 1 + (i % 2), 1, i % 3 ? '#385347' : '#465a4c');
  }
  // Chalkboard metal nails and flour-sack emblems.
  for (const [x,y] of [[306,72],[461,72],[306,242],[461,242]]) {
    rect(x, y, 4, 4, '#deb476'); rect(x + 1, y + 1, 1, 1, '#fff0bd');
  }
  // Wooden bakery sign hanging on chains, intentionally aligned with HTML heading.
  rect(41, 14, 2, 12, '#37241b'); rect(261, 14, 2, 12, '#37241b');
  frame(21, 23, 266, 58, '#422215', '#7f4b2c', '#d9a061');
  rect(27, 29, 254, 45, '#a86a3d');
  rect(30, 31, 247, 3, '#e1ab66'); rect(31, 68, 246, 2, '#643520');
  // Brass corner pins and a center-of-sign baker's stamp.
  for (const x of [28, 276]) for (const y of [29, 70]) rect(x, y, 3, 3, '#ffe0a3');
  // Paper shop tags and a small flour sack in the corner.
  frame(17, 233, 165, 32, '#4c2a1c', '#dfb77a', '#fae8b3');
  rect(23, 236, 153, 2, '#fff0c1');
  // The scene has no baked-in button labels. All navigation stays accessible HTML.
}
