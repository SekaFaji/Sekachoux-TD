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
  assert.ok(sprites.includes('same bakery-character family as the Royal'));
  assert.ok(sprites.includes('CROISSANT_ROYAL_PALETTE'));
});

test('Croissant keeps the established shooting timing and four sprite frames', async () => {
  const { croissantPoseForTimer } = await import('../dist/art/heroSprites.js');
  assert.equal(croissantPoseForTimer(.07, true), 'windup');
  assert.equal(croissantPoseForTimer(.07, false), 'idle');
  assert.equal(croissantPoseForTimer(1.39, true), 'fire');
  assert.equal(croissantPoseForTimer(1.18, true), 'recoil');
  assert.equal(croissantPoseForTimer(.7, true), 'idle');
  const { SPR } = await import('../dist/art/sprites.js');
  for (const name of ['croissant','croissant-windup','croissant-attack','croissant-recoil'])
    assert.equal(typeof SPR[name], 'function', name + ' must remain available');
  const renderer = readFileSync(new URL('../dist/art/render.js',import.meta.url),'utf8');
  assert.ok(renderer.includes('croissantPoseForTimer(p.timer, hasTarget)'));
  assert.ok(renderer.includes('tipY = drawY + 14'));
  assert.ok(renderer.includes("pose === 'fire'"));
  assert.ok(renderer.includes('Math.floor(shot.x * 5)'));
});

test('Croissant uses real Royal Chouquette palette and shares their expressive pixel-art face', async () => {
  const { croissantSprite, CROISSANT_ROYAL_PALETTE: P } = await import('../dist/art/heroSprites.js');
  const royalArt = readFileSync(new URL('../dist/art/royaltyArt.js', import.meta.url), 'utf8');
  for (const color of Object.values(P)) {
    assert.ok(royalArt.includes(color), 'Croissant color must come from the Royal Chouquettes: ' + color);
  }

  // Exercise the actual 32x32 sprite painter, retaining every colored pixel.
  const oldDocument = globalThis.document;
  const makePixels = pose => {
    const pixels = new Map();
    const ctx = {
      fillStyle: '',
      fillRect(x, y, width, height) {
        for (let dy = 0; dy < height; dy++) for (let dx = 0; dx < width; dx++)
          pixels.set((x + dx) + ',' + (y + dy), this.fillStyle);
      },
    };
    globalThis.document = {
      createElement: tag => {
        assert.equal(tag, 'canvas');
        return { width: 0, height: 0, getContext: mode => mode === '2d' ? ctx : null };
      },
    };
    const canvas = croissantSprite(pose);
    assert.equal(canvas.width, 32);
    assert.equal(canvas.height, 32);
    return pixels;
  };
  try {
    const idle = makePixels('idle');
    const windup = makePixels('windup');
    const fire = makePixels('fire');
    const recoil = makePixels('recoil');
    const occupied = [...idle.keys()].sort();

    assert.ok(occupied.length > 350 && occupied.length < 510, 'Royal-sized pastry fills its sprite');
    for (const frame of [windup, fire, recoil]) {
      assert.deepEqual([...frame.keys()].sort(), occupied, 'poses preserve Croissant shape without guns or extra limbs');
    }

    assert.ok(idle.has('17,6'), 'rounded top arch of the pastry is visible');
    assert.ok(idle.has('29,14'), 'right-hand pastry tip remains visible');
    assert.ok(!idle.has('29,20'), 'curled opening underneath the forward tip stays empty');
    assert.ok(idle.has('10,29'), 'hanging tail curves down');
    assert.ok(!idle.has('20,28'), 'lower-right space remains empty');
    assert.equal(idle.get('7,18'), P.eye, 'left eye matches Royal');
    assert.equal(idle.get('13,18'), P.eye, 'right eye matches Royal');
    assert.equal(idle.get('5,20'), P.cheek, 'left pink Royal cheek');
    assert.equal(idle.get('15,20'), P.cheek, 'right pink Royal cheek');
    assert.equal(idle.get('11,22'), P.cream, 'cream Royal smile');
    assert.equal(idle.get('18,9'), P.flour, 'crisp Royal pastry glint');
    assert.notEqual(fire.get('11,22'), idle.get('11,22'), 'firing changes the expression');
    assert.notEqual(windup.get('7,19'), idle.get('7,19'), 'windup squints');
    assert.notEqual(fire.get('27,13'), idle.get('27,13'), 'only pastry tip glows while firing');
    assert.ok(new Set(idle.values()).size >= 9, 'warm Royal shading must not flatten into one color');
  } finally {
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  }
});
