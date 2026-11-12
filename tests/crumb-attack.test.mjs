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
  assert.ok(renderer.includes("croissant-attack"));
  assert.ok(renderer.includes("if (shot.ice)"));
  assert.ok(renderer.includes("if (f.kind === 'crumb')"));
  assert.ok(sprites.includes('crumb-spitting muzzle'));
});
