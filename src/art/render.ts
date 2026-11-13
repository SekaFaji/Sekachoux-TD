import { SPR, human, OL } from './sprites.js';
import { croissantPoseForTimer } from './heroSprites.js';
import { drawBakeryWorktop } from './worktop.js';
import { DEFENDERS, ENEMIES } from '../game/catalog.js';
import { COLUMNS, ROWS, TILE, LANE_HEIGHT, type GameState } from '../game/types.js';
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

export function drawBattlefield(canvas: HTMLCanvasElement, state: GameState, level: Level, sprites: SpriteAtlas): void {
  const x = canvas.getContext('2d'); if (!x) throw new Error('Cannot draw game'); x.imageSmoothingEnabled = false;
  drawBakeryWorktop(x, level.activeRows);
  // Target oven tray slots glow during teaching steps. The rule lives in the level data.
  const guide = level.tutorial?.[state.tutorialIndex];
  if (state.intro <= 0 && guide?.condition.type === 'placed' && guide.focusRow !== undefined) {
    const left = (guide.minColumn ?? 0) * TILE;
    const right = ((guide.maxColumn ?? COLUMNS - 1) + 1) * TILE;
    const top = guide.focusRow * LANE_HEIGHT;
    x.fillStyle = 'rgba(255,233,135,.14)';
    x.fillRect(left, top, right - left, LANE_HEIGHT);
    x.strokeStyle = '#ffef95'; x.lineWidth = 2;
    x.strokeRect(left + 2, top + 2, right - left - 4, LANE_HEIGHT - 4);
  }
  for (const m of state.pins) if (!m.used) {
    const pxPos = Math.round(m.x * TILE - 16), pyPos = m.row * LANE_HEIGHT + 6;
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
    // Anticipation is shown just before a real shot; firing and recoil only
    // happen after the simulation has reset the Croissant's 1.4s shot timer.
    const hasTarget = p.kind === 'croissant' && state.enemies.some(z =>
      z.row === p.row && z.x > p.column && z.health > 0);
    const pose = p.kind === 'croissant' ? croissantPoseForTimer(p.timer, hasTarget) : 'idle';
    const blocking = p.kind === 'loaf' && state.enemies.some(z =>
      z.row === p.row && Math.abs(z.x - p.column - .6) < .5);
    const poseKey = p.kind === 'croissant' && pose !== 'idle'
      ? 'croissant-' + (pose === 'fire' ? 'attack' : pose)
      : blocking ? 'loaf-guard' : p.kind;
    const drawY = p.row * LANE_HEIGHT + 4 + Math.round(Math.sin(state.elapsed * 3 + p.column + p.row));
    const recoil = pose === 'fire' ? -2 : pose === 'recoil' ? -1 : pose === 'windup' ? 1 : 0;
    x.drawImage(sprites.images[poseKey], p.column * TILE + recoil, drawY);
    if (p.kind === 'croissant' && pose === 'fire') {
      // The croissant's tip releases a quick flaky burst, not a gun muzzle.
      // Its centre lines up with the real crumb projectile at lane +18px.
      const tipX = p.column * TILE + 30, tipY = drawY + 14;
      // A small chouquette-style flour puff from the pastry tip.
      x.fillStyle = '#fff4c6'; x.fillRect(tipX, tipY - 1, 3, 3);
      x.fillStyle = '#f8d38d'; x.fillRect(tipX + 3, tipY, 3, 2);
      x.fillRect(tipX + 1, tipY - 4, 2, 2);
      x.fillRect(tipX + 1, tipY + 3, 2, 2);
      x.fillStyle = '#b97940'; x.fillRect(tipX + 6, tipY - 2, 2, 2);
    }
    x.globalAlpha = 1;
  }
  const fm = Math.floor(state.elapsed * 4) % 2;
  for (const z of state.enemies) {
    const zx = Math.round(z.x * TILE);
    x.drawImage(sprites.images[z.kind + ((fm + z.row) % 2)], zx - 16, z.row * LANE_HEIGHT + 2);
    if (z.health < ENEMIES[z.kind].hp) { x.fillStyle = OL; x.fillRect(zx - 9, z.row * LANE_HEIGHT + 4, 18, 3); x.fillStyle = '#d8403c'; x.fillRect(zx - 8, z.row * LANE_HEIGHT + 5, Math.max(1, 16 * z.health / ENEMIES[z.kind].hp), 1); }
  }
  for (const shot of state.projectiles) {
    const sx = Math.round(shot.x * TILE), sy = shot.row * LANE_HEIGHT + 18;
    if (shot.ice) {
      x.fillStyle = OL; x.fillRect(sx - 1, sy - 1, 6, 6);
      x.fillStyle = '#8fe3ff'; x.fillRect(sx, sy, 4, 4);
    } else {
      // The same golden-pastry palette as the protected Royal Chouquettes.
      const wobble = Math.floor(shot.x * 5) % 2;
      x.fillStyle = '#8f542e'; x.fillRect(sx - 1, sy - 1, 5, 4);
      x.fillStyle = '#d4944d'; x.fillRect(sx, sy - 1, 4, 3);
      x.fillStyle = '#efb86c'; x.fillRect(sx + 1, sy - 1, 2, 2);
      x.fillStyle = '#fff4c6'; x.fillRect(sx + 1, sy - 1, 1, 1);
      x.fillStyle = '#b97940'; x.fillRect(sx - 4, sy + wobble, 2, 1);
      x.fillStyle = '#f8d38d'; x.fillRect(sx - 7, sy - 2 + wobble, 1, 1);
    }
  }
  // Butter is a small collectible pat, with restrained sparkle and transparent silhouette.
  for (const d of state.drops) {
    const cx = Math.round(d.x * TILE);
    const cy = Math.round(d.y * LANE_HEIGHT + Math.sin(state.elapsed * 3.3 + d.x) * 1.3);
    x.globalAlpha = Math.min(1, Math.max(0, d.life / .55));
    x.drawImage(sprites.images['butter-drop'], cx - 16, cy - 16);
    x.globalAlpha = 1;
  }
  for (const f of state.effects) {
    if (f.kind === 'crumb') {
      const spread = (1 - f.life / .18) * 6;
      const cx = Math.round(f.x * TILE), cy = Math.round(f.y * LANE_HEIGHT);
      for (const [dx, dy, color] of [[-1, -1, '#ffefbd'], [1, -2, '#d99648'], [2, 1, '#ae6328'], [-2, 2, '#edc37f']] as const) {
        x.fillStyle = color;
        x.fillRect(cx + Math.round(dx * spread), cy + Math.round(dy * spread), 2, 2);
      }
    } else {
      for (let i = 0; i < 16; i++) {
        const a = i * .39, rad = (.5 - f.life) * 120;
        x.fillStyle = i % 2 ? '#ffb400' : '#e8481c';
        x.fillRect(Math.round(f.x * TILE + Math.cos(a) * rad) - 3,
          Math.round(f.y * LANE_HEIGHT + Math.sin(a) * rad) - 3, 6, 6);
      }
    }
  }
}
