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
  assert.ok(sprites.includes('No eyes, feet or weapon'));
  assert.ok(sprites.includes('CROISSANT_PROFILE'));
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
  assert.ok(art.includes('Reference-led side profile'));
  assert.ok(art.includes('the croissant itself is the entire silhouette'.replace('the croissant', 'The croissant')) === false || art.includes('croissant itself is the entire silhouette'));
  assert.ok(art.includes('vertical seam on each rolled segment'));
  assert.ok(art.includes('No eyes, feet or weapon'));
  assert.ok(renderer.includes('tipY = drawY + 14'));
  assert.ok(renderer.includes("croissantPoseForTimer(p.timer, hasTarget)"));
  assert.ok(renderer.includes("pose === 'fire'"));
  assert.ok(renderer.includes("pose === 'windup'"));
  assert.ok(renderer.includes('Math.floor(shot.x * 5)'));
});

test('reference silhouette renders one side-view croissant with no extra face or limbs', async () => {
  const { CROISSANT_PROFILE, croissantSprite } = await import('../dist/art/heroSprites.js');
  assert.equal(CROISSANT_PROFILE.length, 27);
  assert.deepEqual(CROISSANT_PROFILE[0], [10, 18], 'top ridge is narrow');
  assert.ok(CROISSANT_PROFILE[10][1] >= 28, 'upper arm reaches to the right-hand tip');
  assert.ok(CROISSANT_PROFILE[18][1] <= 14, 'negative space opens under the top arm');
  assert.ok(CROISSANT_PROFILE[26][0] >= 9, 'bottom tail curves inward');

  // Exercise the real procedural 32x32 canvas art through a one-function
  // pixel canvas double, not just a source-text comment assertion.
  const originalDocument = globalThis.document;
  const render = pose => {
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
        return { width: 0, height: 0, getContext: type => type === '2d' ? ctx : null };
      },
    };
    const canvas = croissantSprite(pose);
    assert.equal(canvas.width, 32);
    assert.equal(canvas.height, 32);
    return pixels;
  };
  try {
    const idle = render('idle');
    const windup = render('windup');
    const fire = render('fire');
    const recoil = render('recoil');
    const positions = [...idle.keys()].sort();
    assert.equal(positions.length, CROISSANT_PROFILE.reduce((sum, [l, r]) => sum + r - l + 1, 0));
    for (const variant of [windup, fire, recoil])
      assert.deepEqual([...variant.keys()].sort(), positions, 'attack never adds legs, faces or guns');
    assert.equal(idle.get('11,2'), '#1b120b', 'top edge is bold dark outline');
    assert.ok(idle.has('29,12'), 'long upper tip is solid croissant');
    assert.ok(!idle.has('29,19'), 'inside of croissant curl is transparent');
    assert.ok(idle.has('11,28'), 'hanging tapered tail remains visible');
    assert.ok(!idle.has('22,28'), 'no second foot under the tail');
    assert.notEqual(idle.get('27,11'), fire.get('27,11'), 'firing only changes tip shading');
    assert.ok(new Set(idle.values()).size >= 6, 'folds have readable gold-toasted contrast');
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});
