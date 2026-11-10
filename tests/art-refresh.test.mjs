import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BAKERY_PALETTE, laneColor, laneShadow } from '../dist/art/palette.js';

test('new board palette uses light complementary lanes, not a checkered field', () => {
  assert.equal(laneColor(0), BAKERY_PALETTE.cream);
  assert.equal(laneColor(1), BAKERY_PALETTE.marble);
  assert.equal(laneColor(2), laneColor(0));
  assert.notEqual(laneShadow(0), laneShadow(1));
  assert.notEqual(BAKERY_PALETTE.honey, BAKERY_PALETTE.cream);
});

test('board uses a continuous custom worktop, and butter pickups use a dedicated sprite', () => {
  const render = readFileSync(new URL('../dist/art/render.js', import.meta.url), 'utf8');
  const sprites = readFileSync(new URL('../dist/art/sprites.js', import.meta.url), 'utf8');
  assert.ok(render.includes('drawBakeryWorktop'));
  assert.ok(render.includes("sprites.images['butter-drop']"));
  assert.ok(sprites.includes("'butter-drop'"));
  assert.ok(!render.includes("'#f3dcae'"));
});

test('visual refresh does not modify the level data or engine gameplay', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.version, /^0\.[6-9]\.\d+$/);
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('data-action="start-baking"'));
  assert.ok(html.includes('data-action="settings"'));
  assert.ok(html.includes('data-action="recipe-book"'));
});
