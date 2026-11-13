import type { HumanAppearance } from "../game/catalog.js";
import { croissantSprite, loafSprite } from './heroSprites.js';
export type C2 = CanvasRenderingContext2D;
export type P3 = [string, string, string];
export const OL = '#2b1608';
const mkc = (w = 32, h = 32): HTMLCanvasElement => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const px = (g: C2, x: number, y: number, c: string, w = 1, h = 1): void => { g.fillStyle = c; g.fillRect(x, y, w, h); };
export function blob(g: C2, cx: number, cy: number, rx: number, ry: number, p: P3): void {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy > 1) continue;
    const s = -dx * .5 - dy * .8; px(g, x, y, s > .3 ? p[0] : s > -.3 ? p[1] : p[2]);
  }
}
function ring(g: C2, cx: number, cy: number, r: number, p: P3): void {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
    const dx = x + .5 - cx, dy = y + .5 - cy, d = Math.hypot(dx, dy); if (d > r || d < r - 3.2) continue;
    const s = (-dx - dy) / r; px(g, x, y, s > .3 ? p[0] : s > -.3 ? p[1] : p[2]);
  }
}
export function box(g: C2, x: number, y: number, w: number, h: number, p: P3): void {
  const a = Math.max(1, Math.round(h * .25)), b = Math.max(1, Math.round(h * .3));
  px(g, x, y, p[1], w, h); px(g, x, y, p[0], w, a); px(g, x, y + h - b, p[2], w, b);
}
function outline(c: HTMLCanvasElement): HTMLCanvasElement {
  const g = c.getContext('2d')!, w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data;
  const a = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1))) px(g, x, y, OL);
  return c;
}
const art = (f: (g: C2) => void): HTMLCanvasElement => { const c = mkc(); f(c.getContext('2d')!); return outline(c); };
const eye = (g: C2, x: number, y: number): void => { px(g, x, y, '#fff', 3, 3); px(g, x + 1, y + 1, OL, 1, 2); };
const BR: P3 = ['#fbd98a', '#e5a043', '#b3681f'], YL: P3 = ['#fff3a0', '#ffd84a', '#d9a21e'], PZ: P3 = ['#d89a62', '#a8622d', '#6e3c18'];
const CR: P3 = ['#f3c47a', '#d99a45', '#a8651f'], RD: P3 = ['#ff8a7a', '#d8403c', '#9c2420'], SK: P3 = ['#ffe0c2', '#f2b992', '#c98a68'];
export const WD: P3 = ['#ecc890', '#d49a55', '#a8662a'];
export const SPR: Record<string, () => HTMLCanvasElement> = {
  croissant: () => croissantSprite(),
  'croissant-windup': () => croissantSprite('windup'),
  'croissant-attack': () => croissantSprite('fire'),
  'croissant-recoil': () => croissantSprite('recoil'),
  butter: () => art(g => {
    // A characterful wrapped pat of butter, rather than a flat yellow box.
    px(g, 3, 26, '#716052', 26, 2); // warm contact shadow
    px(g, 4, 13, '#fff7e6', 24, 13); // parchment wrapper
    px(g, 5, 12, '#d9c6a7', 22, 1);
    px(g, 5, 14, '#e9ded0', 1, 11);
    px(g, 26, 14, '#c5b19b', 2, 11);
    px(g, 6, 24, '#cdb9a1', 21, 2);
    // Golden butter slab with beveled top, soft shaded right side.
    px(g, 7, 9, '#bc832f', 19, 13);
    px(g, 8, 7, '#ffe9a0', 17, 4);
    px(g, 6, 11, '#ffd36c', 19, 10);
    px(g, 9, 6, '#fff4b9', 14, 2);
    px(g, 24, 11, '#d99a3b', 3, 10);
    px(g, 7, 19, '#e9ae4e', 18, 3);
    px(g, 8, 10, '#fff7d3', 5, 2); // upper glint
    px(g, 10, 12, '#ffe493', 10, 1);
    // Face stays legible at 32px, with a bakery-label bow below.
    px(g, 11, 14, '#514234', 2, 3);
    px(g, 20, 14, '#514234', 2, 3);
    px(g, 14, 18, '#845b38', 5, 1);
    px(g, 15, 19, '#845b38', 3, 1);
    px(g, 12, 22, '#d97868', 8, 2);
    px(g, 15, 22, '#fff8ed', 2, 2);
    px(g, 10, 23, '#f8f0dc', 2, 2);
    px(g, 22, 23, '#f8f0dc', 2, 2);
    // Two tiny pixel sparkle details.
    px(g, 4, 6, '#fff8d4', 1, 5); px(g, 2, 8, '#fff8d4', 5, 1);
    px(g, 27, 4, '#ffe7a1', 1, 3); px(g, 26, 5, '#ffe7a1', 3, 1);
  }),
  'butter-drop': () => art(g => {
    // A collectible miniature butter pat in paper, with a golden gleam.
    px(g, 6, 25, '#7d6b5d', 22, 2); // contact shadow
    px(g, 6, 16, '#f8efe1', 22, 8); // unfolded paper underneath
    px(g, 5, 20, '#e5d2ba', 24, 4);
    px(g, 9, 12, '#9a692e', 17, 11); // bevel outline
    px(g, 8, 15, '#e1a03b', 19, 8);
    px(g, 10, 10, '#fff0a9', 15, 6); // top face
    px(g, 8, 13, '#ffe17c', 18, 7);
    px(g, 12, 9, '#fff9da', 10, 3);
    px(g, 24, 13, '#c78632', 3, 8); // side plane
    px(g, 10, 19, '#e8b14f', 15, 3);
    px(g, 10, 23, '#fcf5e7', 15, 1);
    px(g, 6, 10, '#fff7d6', 1, 5); px(g, 4, 12, '#fff7d6', 5, 1);
    px(g, 27, 7, '#ffe7a2', 1, 4); px(g, 25, 9, '#ffe7a2', 5, 1);
  }),
  loaf: () => loafSprite(),
  'loaf-guard': () => loafSprite(true),
  pretzel: () => art(g => { ring(g, 10, 12, 6.5, PZ); ring(g, 22, 12, 6.5, PZ); blob(g, 16, 21, 9, 6, PZ); for (const [a, b] of [[8, 9], [23, 10], [13, 22], [19, 24]]) px(g, a, b, '#fff', 2, 1); eye(g, 12, 19); eye(g, 17, 19); px(g, 14, 25, OL, 4, 1); }),
  pie: () => art(g => { blob(g, 16, 21, 13, 8, CR); blob(g, 16, 18, 10, 5.5, RD); px(g, 7, 18, CR[0], 18, 1); px(g, 15, 13, CR[0], 1, 10); blob(g, 16, 9, 4, 4, RD); px(g, 16, 3, '#6a4a2a', 1, 3); px(g, 17, 1, '#ffe066', 3, 3); eye(g, 11, 17); eye(g, 18, 17); px(g, 10, 16, OL, 5, 1); px(g, 17, 16, OL, 5, 1); }),
  pin: () => art(g => {
    // Front-facing dough roller: the wooden barrel is vertical, viewed from the bakery.
    // Small side wheels and a centered handle make it readable as a lane-saving machine.
    px(g, 4, 24, '#453021', 24, 3); // tray shadow
    box(g, 3, 22, 26, 5, ['#d5d2c9', '#9d9b93', '#66655e']); // baking tray
    px(g, 4, 27, '#393e41', 5, 3); px(g, 23, 27, '#393e41', 5, 3); // wheels
    px(g, 5, 28, '#a6a9a2', 3, 1); px(g, 24, 28, '#a6a9a2', 3, 1);
    box(g, 14, 2, 4, 6, ['#c58a4d', '#9b5d2b', '#643810']); // upper handle
    px(g, 13, 2, '#f4d39b', 6, 1);
    blob(g, 16, 15, 9, 10, ['#f3d3a0', '#cf9859', '#915324']); // front-facing barrel
    px(g, 10, 9, '#f6deaf', 2, 11); // left sheen
    px(g, 22, 11, '#8f532a', 2, 9); // right edge
    px(g, 12, 7, '#fff0d0', 8, 2);
    px(g, 11, 20, '#8f5027', 10, 2); // lower rounded barrel edge
    px(g, 14, 23, '#a66c32', 4, 3); // lower centered axle
    px(g, 15, 25, '#f0c88b', 2, 2);
    px(g, 2, 20, '#faf0db', 2, 2); px(g, 28, 19, '#fdf1d8', 2, 2); // flour dust
  }),
  shovel: () => art(g => { box(g, 15, 3, 3, 14, WD); box(g, 12, 2, 9, 3, ['#a8662a', '#8a4f1c', '#6a3a10']); box(g, 10, 17, 13, 11, ['#e4eaf0', '#b8c2cc', '#7b8794']); }),
};

/**
 * Original 32px Hooman portraits shared by the title window, approach,
 * battlefield and Recipe Book. All four roles have actual costume details
 * and two grounded walking poses instead of a generic body with new colors.
 */
/**
 * First Hooman art prototype: the ordinary Customer ONLY.
 * A three-quarter, LEFT-facing silhouette: head and hungry jaw lead on the
 * left, rounded coat shoulders and rear foot trail to the right. Both frames
 * are independently readable at native 32x32. No other Hooman is changed.
 */
function drawBasicCustomer(g: C2, frame: number): void {
  const step = frame % 2 !== 0;
  const ink = '#35271f';
  const coatShadow = '#563725';
  const coat = '#825235';
  const coatLight = '#a8784f';
  const skinShadow = '#bd8363';
  const skin = '#e6b18d';
  const skinLight = '#f6d0aa';
  const trousers = '#364c67';
  const shoes = '#44342b';

  // Far leg sits behind the jacket. The feet swap their forward reach.
  if (step) {
    px(g, 17, 23, trousers, 5, 5);
    px(g, 18, 27, '#293c54', 5, 2);
    px(g, 19, 28, ink, 10, 2);
    px(g, 20, 28, shoes, 8, 1);
    px(g, 12, 23, trousers, 5, 5);
    px(g, 10, 27, trousers, 6, 2);
    px(g, 6, 28, ink, 11, 2);
    px(g, 7, 28, shoes, 9, 1);
  } else {
    px(g, 18, 23, '#293c54', 5, 5);
    px(g, 20, 27, trousers, 5, 2);
    px(g, 20, 28, ink, 9, 2);
    px(g, 21, 28, shoes, 7, 1);
    px(g, 12, 23, trousers, 5, 4);
    px(g, 9, 26, trousers, 6, 3);
    px(g, 5, 28, ink, 12, 2);
    px(g, 6, 28, shoes, 10, 1);
  }
  // Subtle shoe toe highlights and one off-centre knee stitch.
  px(g, step ? 8 : 7, 28, '#86694d', 4, 1);
  px(g, 22, 28, '#86694d', 3, 1);
  px(g, 11, 26, '#61758d', 2, 1);

  // Far arm is behind the upper body and swings against the stride.
  px(g, 22, step ? 16 : 18, ink, 5, 8);
  px(g, 23, step ? 17 : 19, coat, 3, 5);
  px(g, 24, step ? 22 : 24, skinShadow, 4, 3);
  px(g, 25, step ? 22 : 24, skin, 2, 2);

  // Asymmetric hunched jacket: shoulder is forward on the LEFT, broad
  // back curves to the right. Pale shirt and striped tie are recessed.
  px(g, 13, 14, ink, 12, 11);
  px(g, 12, 15, coatShadow, 12, 9);
  px(g, 14, 14, coat, 9, 9);
  px(g, 17, 14, coatLight, 4, 3);
  px(g, 23, 17, coatShadow, 3, 6);
  px(g, 15, 16, '#f1dfc6', 5, 7);
  px(g, 16, 17, '#fff0da', 3, 5);
  px(g, 17, 16, '#963d33', 2, 7);
  px(g, 17, 18, '#c96553', 2, 1);
  px(g, 17, 21, '#c96553', 2, 1);
  px(g, 13, 16, coatLight, 3, 4); // left jacket lapel
  px(g, 13, 19, coat, 4, 5);
  px(g, 20, 16, coat, 3, 8);
  px(g, 21, 17, coatLight, 1, 3);
  px(g, 14, 23, coatShadow, 11, 2);
  px(g, 14, 24, ink, 9, 1);

  // Near arm reaches forward with a low open hand, then swings slightly.
  if (step) {
    px(g, 11, 16, ink, 4, 6);
    px(g, 9, 19, coatShadow, 4, 5);
    px(g, 8, 22, skinShadow, 4, 3);
    px(g, 8, 22, skin, 3, 2);
  } else {
    px(g, 10, 17, ink, 5, 6);
    px(g, 8, 20, coatShadow, 5, 5);
    px(g, 7, 23, skinShadow, 5, 3);
    px(g, 7, 23, skin, 4, 2);
  }
  px(g, step ? 8 : 7, step ? 23 : 24, skinLight, 2, 1);

  // An original soft, forward-leaning 3/4 head. The little muzzle/nose
  // projects LEFT, while the rear hairline remains on the RIGHT.
  px(g, 8, 4, ink, 11, 10);
  px(g, 5, 7, ink, 13, 8);
  px(g, 4, 10, skinShadow, 12, 5);
  px(g, 6, 6, skinShadow, 12, 8);
  px(g, 7, 6, skin, 11, 8);
  px(g, 5, 9, skin, 12, 5);
  px(g, 6, 8, skinLight, 7, 3);
  px(g, 4, 11, skin, 5, 2); // forward nose and cheek
  px(g, 4, 12, skinLight, 3, 1);
  px(g, 13, 11, skinShadow, 4, 3);
  px(g, 16, 12, '#b37758', 2, 2);

  // Uneven eyes (near larger than far) make the face three-quarter, not
  // a symmetric forward-facing mask. Tiny jaw, teeth and goofy expression.
  px(g, 6, 8, ink, 5, 5);
  px(g, 7, 8, '#fff3db', 4, 4);
  px(g, 8, 9, '#48372b', 2, 2);
  px(g, 14, 8, ink, 3, 4);
  px(g, 15, 9, '#fff0d6', 2, 2);
  px(g, 15, 9, '#48372b', 1, 2);
  px(g, 5, 13, ink, 9, 3);
  px(g, 6, 13, '#86453b', 7, 2);
  px(g, 7, 13, '#ffefdc', 2, 1);
  px(g, 11, 13, '#ffefdc', 2, 1);
  px(g, 7, 15, skinShadow, 7, 1);
  px(g, 5, 11, '#8b563d', 2, 1); // nostril
  px(g, 12, 11, '#e58f7c', 2, 1); // warm cheek

  // Short uneven hair tufts silhouette the leaning upper head.
  px(g, 8, 3, '#553a2d', 10, 3);
  px(g, 9, 2, '#35271f', 7, 2);
  px(g, 6, 5, '#553a2d', 3, 3);
  px(g, 15, 3, '#7f583d', 4, 3);
  px(g, 19, 6, '#35271f', 2, 3);
  px(g, 18, 4, '#553a2d', 2, 2);
}

export function human(f: number, o: HumanAppearance): HTMLCanvasElement {
  return art(g => {
    // Keep the other three Hoomans pixel-for-pixel unchanged until the
    // new Customer's three-quarter silhouette has been approved.
    if (o.x === '') {
      drawBasicCustomer(g, f);
      return;
    }
    const role = o.x;
    const walking = f % 2 !== 0;
    const lead = walking ? 2 : 0;
    const trail = walking ? 0 : 2;

    // Separate, genuinely different walking frames with real shoes.
    px(g, 11, 23, o.pa, 5, 5 - lead);
    px(g, 18, 23, o.pa, 5, 5 - trail);
    px(g, 10, 28 - lead, '#453a35', 7, 2);
    px(g, 18, 28 - trail, '#453a35', 7, 2);
    px(g, 11, 28 - lead, '#9c8878', 4, 1);
    px(g, 19, 28 - trail, '#9c8878', 4, 1);

    // Coats and tunics share the game's clean three-tone pixel art language,
    // with a contrasting collar and distinct folds.
    box(g, 9, 13, 15, 12, o.s);
    px(g, 10, 23, o.s[2], 13, 2);
    px(g, 11, 14, o.s[0], 10, 2);
    px(g, 15, 14, '#f3d7b5', 3, 3);

    // Different arm phases so Hoomans are not permanently in a T-pose.
    const armLeftY = walking ? 17 : 19;
    const armRightY = walking ? 20 : 17;
    px(g, 5, armLeftY, o.s[1], 5, 5);
    px(g, 23, armRightY, o.s[1], 4, 5);
    px(g, 5, armLeftY + 4, '#e8b78f', 4, 2);
    px(g, 24, armRightY + 4, '#e8b78f', 3, 2);

    // Friendly, softly shaded face and readable small features, matching the
    // bakery's Royal Chouquettes better than the old enormous 3x3 eyes.
    blob(g, 16, 9, 6, 6, SK);
    px(g, 12, 11, '#f9d4b0', 8, 2);
    px(g, 11, 6, o.h[1], 11, 3);
    px(g, 12, 5, o.h[0], 8, 2);
    px(g, 10, 8, o.h[2], 2, 3);
    px(g, 20, 8, o.h[2], 2, 2);
    px(g, 13, 9, '#fff5e3', 2, 2);
    px(g, 18, 9, '#fff5e3', 2, 2);
    px(g, 14, 9, '#443129', 1, 2);
    px(g, 19, 9, '#443129', 1, 2);
    px(g, 12, 12, '#e79a86', 2, 1);
    px(g, 20, 12, '#e79a86', 2, 1);
    px(g, 15, 13, '#895947', 4, 1);

    if (role === '') {
      // Hungry Customer: blue overcoat, bright scarf and paper takeaway bag.
      px(g, 10, 15, '#c8e3f8', 3, 2);
      px(g, 18, 15, '#c8e3f8', 4, 2);
      px(g, 15, 16, '#f2c86e', 3, 5);
      px(g, 16, 19, '#b87835', 2, 2);
      px(g, 3, 20, '#cda978', 6, 8);
      px(g, 4, 21, '#f5deaf', 4, 6);
      px(g, 5, 19, '#775537', 3, 1);
      px(g, 5, 20, '#d0ae7c', 1, 1);
    } else if (role === 'band') {
      // Jogger: athletic headband, diagonal sweater stripe and red sneakers.
      px(g, 11, 6, '#fc7b70', 11, 2);
      px(g, 12, 7, '#fff3d0', 8, 1);
      px(g, 10, 17, '#f8ae94', 4, 2);
      px(g, 17, 18, '#f59e87', 5, 2);
      px(g, 12, 20, '#ffcf9a', 8, 1);
      px(g, 11, 28 - lead, '#f16c5c', 5, 1);
      px(g, 19, 28 - trail, '#f16c5c', 5, 1);
      px(g, 23, 9, '#bde9ed', 2, 3);
    } else if (role === 'tie') {
      // Food Critic: dark jacket lapels, a proper tie and order notebook.
      px(g, 11, 14, '#d5dbe0', 5, 5);
      px(g, 18, 14, '#d5dbe0', 4, 5);
      px(g, 15, 15, '#b64242', 3, 8);
      px(g, 16, 20, '#7a3032', 2, 3);
      px(g, 10, 15, '#4f5560', 3, 6);
      px(g, 21, 15, '#4f5560', 2, 6);
      px(g, 23, 19, '#74594a', 6, 8);
      px(g, 24, 20, '#f4e8cf', 4, 6);
      px(g, 25, 22, '#8d715c', 2, 1);
      px(g, 25, 24, '#8d715c', 2, 1);
      px(g, 11, 8, '#5b5149', 1, 4);
      px(g, 21, 8, '#5b5149', 1, 4);
      px(g, 12, 10, '#5b5149', 4, 1);
      px(g, 18, 10, '#5b5149', 4, 1);
    } else if (role === 'hat') {
      // Health Inspector: white health cap, green check and a clipboard.
      px(g, 9, 3, '#e2e8dc', 15, 4);
      px(g, 11, 2, '#fff7e9', 11, 3);
      px(g, 8, 6, '#d0dccf', 17, 2);
      px(g, 15, 3, '#5b9e70', 2, 4);
      px(g, 13, 5, '#5b9e70', 6, 1);
      px(g, 12, 15, '#e9eee8', 3, 8);
      px(g, 19, 15, '#e9eee8', 3, 8);
      px(g, 16, 15, '#68ad81', 2, 9);
      px(g, 23, 17, '#8f633e', 7, 10);
      px(g, 24, 18, '#f1e7d6', 5, 8);
      px(g, 25, 20, '#8f633e', 3, 1);
      px(g, 25, 22, '#8f633e', 3, 1);
    }
  });
}
