import test from 'node:test';
import assert from 'node:assert/strict';
import { GUEST_NAME, loadPlayerName, normalizePlayerName, savePlayerName } from '../dist/profile/identity.js';
import { historicalDiscoveries, loadDiscoveredHoomans, recordDiscoveredHooman } from '../dist/game/discovery.js';
import { GameEngine } from '../dist/game/engine.js';

function withStorage(run) {
  const old = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) };
  try { run(values); }
  finally { if (old === undefined) delete globalThis.localStorage; else globalThis.localStorage = old; }
}

test('guest name, customized baker name and reset survive reloads', () => withStorage(() => {
  assert.equal(loadPlayerName(), GUEST_NAME);
  assert.equal(normalizePlayerName('   Seka  Faji   '), 'Seka Faji');
  assert.equal(savePlayerName('  Seka  Faji '), 'Seka Faji');
  assert.equal(loadPlayerName(), 'Seka Faji');
  assert.equal(savePlayerName('  '), GUEST_NAME);
  assert.equal(loadPlayerName(), GUEST_NAME);
}));

test('player names cannot overflow the HUD or contain markup', () => withStorage(() => {
  assert.equal(savePlayerName('<script>'), null);
  assert.equal(savePlayerName('A'.repeat(19)), null);
  assert.equal(savePlayerName('Dough_Master-7'), 'Dough_Master-7');
  assert.equal(loadPlayerName(), 'Dough_Master-7');
}));

test('new players see no Dex spoilers and opening a preview unlocks nothing', () => withStorage(() => {
  assert.deepEqual(loadDiscoveredHoomans(1), []);
  assert.deepEqual(loadDiscoveredHoomans(1), []);
  assert.deepEqual(historicalDiscoveries(1), []);
  const previewOnly = new GameEngine(3);
  assert.equal(previewOnly.takeEvents().filter(e => e.type === 'hooman').length, 0);
  assert.deepEqual(loadDiscoveredHoomans(1), []);
}));

test('a Hooman enters the Dex when actually spawned, once per type in a run', () => withStorage(() => {
  const engine = new GameEngine(0, () => .5);
  engine.state.intro = 0;
  assert.equal(engine.place('croissant', 2, 2), true);
  engine.update(.05);
  assert.equal(engine.state.tutorialIndex, 1);
  const seen = engine.takeEvents().filter(e => e.type === 'hooman');
  assert.deepEqual(seen, [{ type: 'hooman', kind: 'walk' }]);
  assert.deepEqual(recordDiscoveredHooman([], seen[0].kind), ['walk']);
  assert.deepEqual(loadDiscoveredHoomans(1), ['walk']);
  assert.deepEqual(recordDiscoveredHooman(['walk'], 'unknown'), ['walk']);
}));

test('existing cleared stages migrate seen Hoomans without revealing future types', () => withStorage(values => {
  assert.deepEqual(historicalDiscoveries(2), ['walk']);
  assert.deepEqual(historicalDiscoveries(5), ['walk', 'jog']);
  assert.deepEqual(historicalDiscoveries(7), ['walk', 'jog']);
  assert.deepEqual(historicalDiscoveries(8), ['walk', 'jog', 'critic']);
  assert.deepEqual(historicalDiscoveries(10), ['walk', 'jog', 'critic', 'insp']);
  assert.deepEqual(loadDiscoveredHoomans(5), ['walk', 'jog']);
  assert.deepEqual(recordDiscoveredHooman(['walk', 'jog'], 'critic'), ['walk', 'jog', 'critic']);
  assert.deepEqual(loadDiscoveredHoomans(1), ['walk', 'jog', 'critic']);
  assert.deepEqual(JSON.parse(values.get('sekachoux_td_hoomans_v1')), ['walk', 'jog', 'critic']);
}));
