import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLandscape, pointerToGrid } from '../dist/ui/viewport.js';
import { GameEngine } from '../dist/game/engine.js';
import { LEVELS } from '../dist/game/levels.js';

test('landscape remains 16:9 even on portrait screens', () => {
  assert.deepEqual(fitLandscape(390, 844), { width: 390, height: 219 });
  assert.deepEqual(fitLandscape(1280, 720), { width: 1280, height: 720 });
  assert.deepEqual(fitLandscape(800, 300), { width: 533, height: 300 });
});
test('grid input ignores letterbox and out-of-field taps', () => {
  const rect = { left: 10, top: 20, width: 400, height: 300 };
  assert.equal(pointerToGrid(210, 170, rect)?.column, 4);
  assert.equal(pointerToGrid(210, 170, rect)?.row, 2);
  assert.equal(pointerToGrid(30, 30, rect), null);
  assert.equal(pointerToGrid(401, 310, rect), null);
});
test('all levels retain valid rows and wave weights', () => {
  assert.equal(LEVELS.length, 7);
  for (const level of LEVELS) {
    assert.ok(level.activeRows.every(row => row >= 0 && row < 5));
    assert.equal(level.weights.length, 4);
  }
});
test('placing defenders spends butter and blocks occupied cells', () => {
  const engine = new GameEngine(1, () => .5);
  engine.state.intro = 0;
  assert.equal(engine.place('croissant', 2, 2), true);
  assert.equal(engine.state.butter, 0);
  assert.equal(engine.place('croissant', 2, 2), false);
  assert.equal(engine.place('not-a-unit', 3, 2), false);
});
test('tutorial only allows its current step, then advances on collecting butter', () => {
  const engine = new GameEngine(0, () => .5);
  engine.state.intro = .01;
  engine.update(.02);
  assert.equal(engine.allowed('croissant'), false);
  assert.equal(engine.collectAt(4.5, -.3), true);
  engine.update(.02);
  assert.equal(engine.allowed('butter'), true);
  assert.ok(engine.state.butter >= 50);
});
