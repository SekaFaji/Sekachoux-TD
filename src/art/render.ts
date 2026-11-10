import { SPR, human, OL } from './sprites.js';
import { drawBakeryScene } from './bakeryScene.js';
import { drawBakeryWorktop } from './worktop.js';
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
  drawBakeryWorktop(x, level.activeRows);
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
  // Butter is a small collectible pat, with restrained sparkle and transparent silhouette.
  for (const d of state.drops) {
    const cx = Math.round(d.x * TILE);
    const cy = Math.round(d.y * TILE + Math.sin(state.elapsed * 3.3 + d.x) * 1.3);
    x.globalAlpha = Math.min(1, Math.max(0, d.life / .55));
    x.drawImage(sprites.images['butter-drop'], cx - 16, cy - 16);
    x.globalAlpha = 1;
  }
  for (const f of state.effects) for (let i = 0; i < 16; i++) { const a = i * .39, rad = (.5 - f.life) * 120; x.fillStyle = i % 2 ? '#ffb400' : '#e8481c'; x.fillRect(Math.round(f.x * TILE + Math.cos(a) * rad) - 3, Math.round(f.y * TILE + Math.sin(a) * rad) - 3, 6, 6); }
}
