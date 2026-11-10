import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLandscape, pointerToGrid } from '../dist/ui/viewport.js';
import { GameEngine } from '../dist/game/engine.js';
import { LEVELS, rewardForLevel } from '../dist/game/levels.js';
import { DEFENDERS, ENEMIES } from '../dist/game/catalog.js';
import { migrateV1Unlocked, loadUnlocked, saveUnlocked } from '../dist/game/progress.js';
import { nextPlayableLevel, campaignLevelLabel } from '../dist/game/campaign.js';

function startTutorial(index) {
  const engine = new GameEngine(index, () => .5);
  engine.state.intro = .01;
  engine.update(.02);
  return engine;
}

function stepForward(engine) { engine.update(.05); }

test('landscape never crops or switches orientation on portrait screens', () => {
  assert.deepEqual(fitLandscape(390, 844), { width: 390, height: 219 });
  assert.deepEqual(fitLandscape(1280, 720), { width: 1280, height: 720 });
  assert.deepEqual(fitLandscape(800, 300), { width: 533, height: 300 });
});

test('pointer maps touch accurately and ignores outer letterbox', () => {
  const rect = { left: 10, top: 20, width: 400, height: 300 };
  assert.equal(pointerToGrid(210, 170, rect)?.column, 4);
  assert.equal(pointerToGrid(210, 170, rect)?.row, 2);
  assert.equal(pointerToGrid(30, 30, rect), null);
  assert.equal(pointerToGrid(401, 310, rect), null);
});

test('campaign keeps six original battle stages following four lessons', () => {
  assert.equal(LEVELS.length, 10);
  assert.deepEqual(LEVELS.slice(0, 4).map(level => level.name), ['First Bake', 'Fresh Butter', 'Hold the Line', 'Icing Lesson']);
  assert.deepEqual(LEVELS.slice(4).map(level => level.name), ['Morning Rush', 'Lunch Crowd', 'Critics Visit', 'Sugar Rush', 'Inspection Day', 'The Final Rush']);
  assert.equal(campaignLevelLabel(3), '1-4');
  for (const level of LEVELS) {
    assert.ok(level.activeRows.length >= 1 && level.activeRows.every(row => row >= 0 && row < 5));
    assert.equal(level.weights.length, Object.keys(ENEMIES).length);
    assert.ok(level.previewEnemies.length > 0 && level.previewEnemies.every(kind => kind in ENEMIES));
    assert.ok(level.available.length > 0 && level.available.every(kind => kind in DEFENDERS));
    assert.ok(level.tutorial ? level.duration === 0 : level.duration > 0);
  }
});

test('each tutorial awards exactly one new pastry, available in the next shift', () => {
  assert.deepEqual(LEVELS.slice(0, 4).map(level => level.reward), ['butter', 'baguette', 'pretzel', 'pie']);
  for (let i = 0; i < 4; i++) {
    const reward = rewardForLevel(i);
    assert.ok(reward && !LEVELS[i].available.includes(reward));
    assert.ok(LEVELS[i + 1].available.includes(reward));
  }
  assert.equal(LEVELS[4].available.length, 5);
  assert.equal(rewardForLevel(5), undefined);
});

test('first lesson only permits Croissant in highlighted tiles', () => {
  const engine = startTutorial(0);
  assert.equal(engine.allowed('croissant'), true);
  assert.equal(engine.allowed('butter'), false);
  assert.equal(engine.place('butter', 2, 2), false);
  assert.equal(engine.place('croissant', 2, 1), false);
  assert.equal(engine.place('croissant', 7, 2), false);
  assert.equal(engine.place('croissant', 2, 2), true);
  assert.equal(engine.state.butter, 0);
  stepForward(engine);
  assert.equal(engine.state.tutorialIndex, 1);
  assert.equal(engine.state.enemies.length, 1);
  assert.equal(engine.allowed('croissant'), false);
  for (let i = 0; i < 400 && !engine.finished; i++) stepForward(engine);
  assert.equal(engine.finished, true, 'single Croissant should defeat first visitor');
  assert.deepEqual(engine.takeEvents().filter(event => event.type === 'win'), [{ type: 'win' }]);
});

test('butter lesson waits for a real collect before enabling Croissant', () => {
  const engine = startTutorial(1);
  assert.equal(engine.place('croissant', 3, 2), false);
  assert.equal(engine.place('butter', 1, 2), true);
  stepForward(engine);
  assert.equal(engine.state.tutorialIndex, 1);
  assert.equal(engine.allowed('croissant'), false);
  for (let i = 0; i < 115; i++) stepForward(engine);
  const drop = engine.state.drops.find(d => d.y >= 2 && d.y < 3);
  assert.ok(drop, 'butter block should produce a collectible butter drop');
  assert.equal(engine.collectAt(drop.x, drop.y), true);
  stepForward(engine);
  assert.equal(engine.allowed('croissant'), true);
  assert.equal(engine.place('croissant', 4, 2), true);
});

test('baguette lesson enforces protection in front of Croissant', () => {
  const engine = startTutorial(2);
  assert.equal(engine.place('croissant', 2, 2), true);
  stepForward(engine);
  assert.equal(engine.allowed('baguette'), true);
  assert.equal(engine.place('baguette', 1, 2), false);
  assert.equal(engine.place('baguette', 4, 2), true);
  stepForward(engine);
  assert.equal(engine.state.enemies.length, 1);
});

test('unearned tower cannot be placed even during ordinary waves', () => {
  const engine = new GameEngine(0, () => .5);
  engine.state.intro = 0;
  assert.equal(engine.place('pie', 2, 2), false);
  const battle = new GameEngine(4, () => .5);
  battle.state.intro = 0;
  assert.equal(battle.place('pie', 2, 2), true);
  assert.equal(battle.place('pie', 2, 2), false);
  assert.equal(battle.place('nothing', 3, 2), false);
});



test('rolling pin lane-saver starts on the left edge and sweeps right through a breach', () => {
  const engine = new GameEngine(4, () => .5);
  engine.state.intro = 0;
  const pin = engine.state.pins.find(pin => pin.row === 1);
  assert.equal(pin?.x, 0.5);
  engine.state.enemies.push({ kind: 'walk', row: 1, x: 0.95, health: 6, slow: 0 });
  engine.update(.05);
  assert.equal(engine.finished, false);
  assert.equal(pin?.active, true);
  for (let i = 0; i < 120; i++) engine.update(.05);
  assert.equal(engine.state.enemies.length, 0);
  assert.equal(pin?.used, true);
  assert.equal(pin?.active, false);
});

test('save migration preserves old tutorial completion and unlocked battle stages', () => {
  assert.equal(migrateV1Unlocked(null), 1);
  assert.equal(migrateV1Unlocked('1'), 1);
  assert.equal(migrateV1Unlocked('2'), 5);
  assert.equal(migrateV1Unlocked('3'), 6);
  assert.equal(migrateV1Unlocked('7'), 10);
  assert.equal(nextPlayableLevel(5), 4);
  assert.equal(nextPlayableLevel(10), 9);
});

test('new save loads v2 first and never downgrades it from a previous key', () => {
  const values = new Map([['sekachoux_td_unlocked_v1', '7']]);
  const previous = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
  try {
    assert.equal(loadUnlocked(), 10);
    assert.equal(values.get('sekachoux_td_unlocked_v2'), '10');
    assert.equal(saveUnlocked(4), 4);
    assert.equal(loadUnlocked(), 4);
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});
