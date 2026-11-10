import { SPR, human, OL } from './sprites.js';
import { drawBakeryScene } from './bakeryScene.js';
import { DEFENDERS, ENEMIES } from '../game/catalog.js';
import { COLUMNS, ROWS, TILE, type GameState } from '../game/types.js';
import type { Level } from '../game/levels.js';

export interface SpriteAtlas { images: Record<string, HTMLCanvasElement>; url: (kind: string) => string }
export function createSpriteAtlas(): SpriteAtlas {
  const images: Record<string, HTMLCanvasElement> = {};
  for (const [kind, factory] of Object.entries(SPR)) images[kind] = factory();
  for (const [kind, enemy] of Object.entries(ENEMIES)) {
    images[`${kind}0`] = human(0, enemy.o);
    images[`${kind}1`] = human(1, enemy.o);
  }
  return { images, url: kind => images[kind].toDataURL() };
}

export const drawMenuBackground = drawBakeryScene;

export function drawBattlefield(canvas: HTMLCanvasElement, state: GameState, level: Level, sprites: SpriteAtlas): void {
  const x = canvas.getContext('2d'); if (!x) throw new Error('Cannot draw game'); x.imageSmoothingEnabled = false;
  const L = level;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLUMNS; c++) {
      x.fillStyle = (r + c) % 2 ? '#f3dcae' : '#e6c58a'; x.fillRect(c * TILE, r * TILE, TILE, TILE);
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(c * TILE, r * TILE, TILE, 1); x.fillRect(c * TILE, r * TILE, 1, TILE);
      x.fillStyle = 'rgba(110,60,25,.28)'; x.fillRect(c * TILE, r * TILE + TILE - 1, TILE, 1); x.fillRect(c * TILE + TILE - 1, r * TILE, 1, TILE);
    }
    if (!L.activeRows.includes(r)) { x.fillStyle = 'rgba(20,10,5,.5)'; x.fillRect(0, r * TILE, COLUMNS * TILE, TILE); }
  }
  // Target oven tray slots glow during teaching steps. The rule lives in the level data.
  const guide = L.tutorial?.[state.tutorialIndex];
  if (state.intro <= 0 && guide?.condition.type === 'placed' && guide.focusRow !== undefined) {
    const left = (guide.minColumn ?? 0) * TILE;
    const right = ((guide.maxColumn ?? COLUMNS - 1) + 1) * TILE;
    const top = guide.focusRow * TILE;
    x.fillStyle = 'rgba(255,233,135,.14)';
    x.fillRect(left, top, right - left, TILE);
    x.strokeStyle = '#ffef95'; x.lineWidth = 2;
    x.strokeRect(left + 2, top + 2, right - left - 4, TILE - 4);
  }
  for (const m of state.pins) if (!m.used) {
    const pxPos = Math.round(m.x * TILE - 16), pyPos = m.row * TILE + 2;
    if (!m.active) {
      x.fillStyle = 'rgba(60,35,18,.18)';
      x.fillRect(pxPos + 3, pyPos + 23, 24, 4);
    } else {
      x.fillStyle = 'rgba(255,241,207,.7)';
      x.fillRect(pxPos - 10, pyPos + 9, 8, 2);
      x.fillRect(pxPos - 15, pyPos + 13, 12, 2);
      x.fillStyle = 'rgba(222,183,122,.6)';
      x.fillRect(pxPos - 7, pyPos + 20, 7, 3);
      x.fillRect(pxPos - 14, pyPos + 22, 8, 2);
    }
    x.drawImage(sprites.images.pin, pxPos, pyPos);
  }
  for (const p of state.defenders) {
    x.globalAlpha = (p.kind === 'pie' && p.timer > 0 ? .6 : 1) * (.5 + .5 * Math.min(1, p.health / DEFENDERS[p.kind].hp));
    x.drawImage(sprites.images[p.kind], p.column * TILE, p.row * TILE + Math.round(Math.sin(state.elapsed * 3 + p.column + p.row))); x.globalAlpha = 1;
  }
  const fm = Math.floor(state.elapsed * 4) % 2;
  for (const z of state.enemies) {
    const zx = Math.round(z.x * TILE);
    x.drawImage(sprites.images[z.kind + ((fm + z.row) % 2)], zx - 16, z.row * TILE - 2);
    if (z.health < ENEMIES[z.kind].hp) { x.fillStyle = OL; x.fillRect(zx - 9, z.row * TILE, 18, 3); x.fillStyle = '#d8403c'; x.fillRect(zx - 8, z.row * TILE + 1, Math.max(1, 16 * z.health / ENEMIES[z.kind].hp), 1); }
  }
  for (const s of state.projectiles) { const sx = Math.round(s.x * TILE), sy = s.row * TILE + 14; x.fillStyle = OL; x.fillRect(sx - 1, sy - 1, 6, 6); x.fillStyle = s.ice ? '#8fe3ff' : '#e5a043'; x.fillRect(sx, sy, 4, 4); }
  for (const d of state.drops) { const dx = Math.round(d.x * TILE) - 9, dy = Math.round(d.y * TILE) - 6; x.fillStyle = 'rgba(255,230,100,' + (.25 + .15 * Math.sin(state.elapsed * 6)) + ')'; x.fillRect(dx - 3, dy - 3, 24, 18); x.fillStyle = OL; x.fillRect(dx - 1, dy - 1, 20, 14); x.fillStyle = '#ffd84a'; x.fillRect(dx, dy, 18, 12); x.fillStyle = '#fffbd0'; x.fillRect(dx, dy, 18, 3); x.fillStyle = '#d9a21e'; x.fillRect(dx, dy + 9, 18, 3); }
  for (const f of state.effects) for (let i = 0; i < 16; i++) { const a = i * .39, rad = (.5 - f.life) * 120; x.fillStyle = i % 2 ? '#ffb400' : '#e8481c'; x.fillRect(Math.round(f.x * TILE + Math.cos(a) * rad) - 3, Math.round(f.y * TILE + Math.sin(a) * rad) - 3, 6, 6); }
}
