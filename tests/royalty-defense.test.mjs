import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../dist/game/engine.js';
import { ROYAL_FAMILY, chooseRoyalToEat, royalsRemaining } from '../dist/game/royalty.js';
import { COLUMNS, STREET_END_X, STREET_SPAWN_X, OUTSIDE_WALK_SPEED } from '../dist/game/types.js';

const enemy = (kind, row, x) => ({ kind, row, x, health: 40, slow: 0 });

test('each royal has one permanent display for this run, and only living family members can be eaten', () => {
  const game = new GameEngine(4, () => .5);
  assert.deepEqual([...ROYAL_FAMILY], ['Queen','King','Princess','Prince','Grandpa']);
  assert.deepEqual(game.state.royalsEaten, [false, false, false, false, false]);
  assert.equal(royalsRemaining(game.state.royalsEaten), 5);
  assert.equal(chooseRoyalToEat(game.state.royalsEaten, 2), 2);
  assert.equal(chooseRoyalToEat([false,false,true,false,false], 2), 1);
  assert.equal(chooseRoyalToEat([true,true,true,true,false], 1), 4);
  assert.equal(chooseRoyalToEat([true,true,true,true,true], 1), -1);
});

test('the first breach activates a one-use wheel that sweeps ALL existing lane enemies through the street', () => {
  const game = new GameEngine(6, () => .5);
  const s = game.state;
  s.intro = 0;
  s.spawnTimer = 10000;
  s.firstWave = true;
  s.finalWave = true;
  const first = enemy('walk', 2, .95);
  const middle = enemy('jog', 2, 7.4);
  const outdoors = enemy('critic', 2, STREET_SPAWN_X);
  const otherLane = enemy('walk', 0, 5.5);
  s.enemies.push(first, middle, outdoors, otherLane);
  game.update(.05);
  const wheel = s.pins.find(pin => pin.row === 2);
  assert.equal(wheel?.active, true);
  assert.equal(wheel?.used, false);
  assert.ok(game.takeEvents().some(e => e.type === 'wheel' && e.row === 2));
  // A later arrival is not in the wheel's activation snapshot.
  const late = enemy('walk', 2, STREET_SPAWN_X);
  s.enemies.push(late);
  for (let i = 0; i < 120; i++) game.update(.05);
  assert.equal(wheel?.active, false);
  assert.equal(wheel?.used, true);
  for (const victim of [first, middle, outdoors]) {
    assert.ok(!s.enemies.includes(victim), 'every activation-time enemy in the lane is gone');
  }
  assert.ok(s.enemies.includes(late), 'the next wave is safe after the wheel sweep');
  assert.ok(s.enemies.includes(otherLane), 'another lane must not be affected');
  assert.equal(s.kills, 3);
  assert.equal(royalsRemaining(s.royalsEaten), 5);
  assert.equal(game.finished, false);
});

test('a spent wheel allows one Hooman to eat exactly one royal and then removes that Hooman', () => {
  const game = new GameEngine(4, () => .5);
  const s = game.state;
  s.intro = 0;
  s.spawnTimer = 10000;
  s.firstWave = true;
  s.finalWave = true;
  const pin = s.pins.find(pin => pin.row === 1);
  pin.used = true;
  s.enemies.push(enemy('walk', 1, .105));
  game.update(.05);
  const eaten = game.takeEvents().filter(e => e.type === 'royal-eaten');
  assert.deepEqual(eaten, [{ type: 'royal-eaten', row: 1, royalIndex: 1, remaining: 4 }]);
  assert.equal(game.finished, false);
  assert.equal(s.enemies.length, 0);
  assert.equal(s.royalsEaten[1], true);
  assert.equal(s.kills, 0, 'being eaten is not a defeated enemy or earned reward');
});

test('five distinct breaches eat the full family, and ONLY the fifth ends the shift', () => {
  // Early single-lane levels still provide access to the full royal family.
  const game = new GameEngine(0, () => .5);
  const s = game.state;
  s.intro = 0;
  s.pins[0].used = true;
  let events = [];
  for (let i = 0; i < 5; i++) {
    s.enemies.push(enemy('walk', 2, .105));
    game.update(.05);
    events = game.takeEvents();
    assert.equal(royalsRemaining(s.royalsEaten), 4-i);
    assert.equal(game.finished, i === 4, 'only the fifth royal death triggers defeat');
    assert.ok(events.some(e => e.type === 'royal-eaten' && e.remaining === 4-i));
    if (i < 4) assert.ok(!events.some(e => e.type === 'lose'));
  }
  assert.ok(events.some(e => e.type === 'lose'));
  assert.equal(s.royalsEaten.every(Boolean), true);
  // One family member always falls per invading Hooman, never multiple.
  assert.equal(s.kills, 0);
});

test('real enemies are placed at the far end of visible outdoor street and walk into the board', () => {
  const game = new GameEngine(4, () => .5);
  const s = game.state;
  s.intro = 0;
  s.spawnTimer = .01;
  const expectedRight = STREET_SPAWN_X + .5 * .2;
  game.update(.05);
  const customer = s.enemies[0];
  assert.ok(customer);
  assert.ok(customer.x > COLUMNS+2 && customer.x < STREET_END_X,
    'first enemy is visibly in the rightmost street, not at the board');
  assert.ok(Math.abs(customer.x - (expectedRight - OUTSIDE_WALK_SPEED*.05)) < .00001);
  const startX = customer.x;
  for (let i = 0; i < 40; i++) game.update(.05);
  assert.ok(customer.x < startX);
  assert.ok(customer.x < COLUMNS);
});
