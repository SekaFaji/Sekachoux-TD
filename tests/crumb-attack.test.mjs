import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../dist/game/engine.js';
import { DEFENDERS } from '../dist/game/catalog.js';
import { LANE_HEIGHT, ROWS } from '../dist/game/types.js';
import { ROOM_HEIGHT } from '../dist/art/battleScenery.js';

test('expanded lanes use extra background space rather than stretching 32px pastry sprites', () => {
  assert.equal(ROWS, 5);
  assert.equal(LANE_HEIGHT, 40);
  assert.equal(ROOM_HEIGHT, 200);
  const sprites = readFileSync(new URL('../dist/art/heroSprites.js', import.meta.url), 'utf8');
  const renderer = readFileSync(new URL('../dist/art/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.ok(sprites.includes('canvas.width = 32'));
  assert.ok(sprites.includes('canvas.height = 32'));
  assert.ok(renderer.includes('p.row * LANE_HEIGHT + 4'));
  assert.ok(css.includes('aspect-ratio: 36 / 25'));
});

test('Croissant sends crumb projectiles and makes a small hit burst without changing balance', () => {
  assert.equal(DEFENDERS.croissant.c, 100);
  assert.equal(DEFENDERS.croissant.hp, 60);
  const engine = new GameEngine(4, () => .5);
  engine.state.intro = 0;
  engine.state.butter = 200;
  assert.equal(engine.place('croissant', 1, 2), true);
  const target = { kind: 'walk', row: 2, x: 3.8, health: 8, slow: 0 };
  engine.state.enemies.push(target);
  let struck = false;
  for (let i = 0; i < 80; i++) {
    engine.update(.05);
    if (target.health < 8) {
      struck = true;
      assert.equal(target.health, 7, 'one crumb is one damage');
      assert.ok(engine.state.effects.some(effect => effect.kind === 'crumb'), 'hit makes crumb flecks');
      break;
    }
  }
  assert.ok(struck, 'Croissant should fire and hit a customer in its lane');
  const renderer = readFileSync(new URL('../dist/art/render.js', import.meta.url), 'utf8');
  const sprites = readFileSync(new URL('../dist/art/heroSprites.js', import.meta.url), 'utf8');
  const atlas = readFileSync(new URL('../dist/art/sprites.js', import.meta.url), 'utf8');
  assert.ok(atlas.includes("'croissant-attack'"));
  assert.ok(renderer.includes('croissantPoseForTimer(p.timer, hasTarget)'));
  assert.ok(renderer.includes("if (shot.ice)"));
  assert.ok(renderer.includes("if (f.kind === 'crumb')"));
  assert.ok(sprites.includes('No blaster, arm or other accessory'));
  assert.ok(sprites.includes('the pastry is always the silhouette'));
});

test('Croissant windup, muzzle blast, and recoil are distinct and timed to real shots', async () => {
  const { croissantPoseForTimer } = await import('../dist/art/heroSprites.js');
  assert.equal(croissantPoseForTimer(.07, true), 'windup');
  assert.equal(croissantPoseForTimer(.07, false), 'idle');
  assert.equal(croissantPoseForTimer(1.39, true), 'fire');
  assert.equal(croissantPoseForTimer(1.18, true), 'recoil');
  assert.equal(croissantPoseForTimer(.7, true), 'idle');

  const { SPR } = await import('../dist/art/sprites.js');
  for (const key of ['croissant', 'croissant-windup', 'croissant-attack', 'croissant-recoil']) {
    assert.equal(typeof SPR[key], 'function', key + ' must have a 32px frame');
  }
  const art = readFileSync(new URL('../dist/art/heroSprites.js', import.meta.url), 'utf8');
  const renderer = readFileSync(new URL('../dist/art/render.js', import.meta.url), 'utf8');
  assert.ok(art.includes('A single unmistakable croissant outline'));
  assert.ok(art.includes('Left tapered end'));
  assert.ok(art.includes('Right tapered end'));
  assert.ok(art.includes('Lamination:'));
  assert.ok(art.includes('No blaster, arm or other accessory'));
  assert.ok(renderer.includes('tipY = drawY + 14'));
  assert.ok(renderer.includes("croissantPoseForTimer(p.timer, hasTarget)"));
  assert.ok(renderer.includes("pose === 'fire'"));
  assert.ok(renderer.includes("pose === 'windup'"));
  assert.ok(renderer.includes('Math.floor(shot.x * 5)'));
});
