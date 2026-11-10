import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GAME_SAVE_KEYS, clearGameSave } from '../dist/settings/saveReset.js';
import { SOUND_SETTINGS_KEY, normalizeSoundSettings, loadSoundSettings, saveSoundSettings } from '../dist/audio/sound.js';

function mockStorage(run) {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => { values.delete(key); },
  };
  try { run(values); }
  finally { if (previous === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous; }
}

test('volume and mute are normalized and survive reload; malformed data uses defaults', () => mockStorage(values => {
  assert.deepEqual(normalizeSoundSettings({ volume: 3, muted: true }), { volume: 1, muted: true });
  assert.deepEqual(normalizeSoundSettings({ volume: -1, muted: 'yes' }), { volume: 0, muted: false });
  saveSoundSettings({ volume: .25, muted: true });
  assert.deepEqual(loadSoundSettings(), { volume: .25, muted: true });
  values.set(SOUND_SETTINGS_KEY, '{garbled');
  assert.deepEqual(loadSoundSettings(), { volume: .6, muted: false });
}));

test('reset removes campaign, legacy migration, discovery and baker name but keeps sound', () => mockStorage(values => {
  for (const key of GAME_SAVE_KEYS) values.set(key, 'progress');
  values.set(SOUND_SETTINGS_KEY, JSON.stringify({ volume: .1, muted: true }));
  values.set('unrelated_site_data', 'keep');
  assert.equal(clearGameSave(globalThis.localStorage), true);
  assert.ok(GAME_SAVE_KEYS.every(key => !values.has(key)));
  assert.equal(values.get('unrelated_site_data'), 'keep');
  assert.deepEqual(loadSoundSettings(), { volume: .1, muted: true });
}));

test('a blocked browser storage reset is treated as failure, not success', () => {
  assert.equal(clearGameSave({ removeItem() { throw new Error('denied'); } }), false);
});

test('settings and credits are accessible with a two-stage reset confirmation', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');
  assert.ok(html.includes('data-action="settings"'));
  assert.ok(html.includes('data-action="credits"'));
  assert.ok(html.includes('id="sound-volume"'));
  assert.ok(html.includes('data-action="reset-saves"'));
  assert.ok(js.includes('reset-confirm-1'));
  assert.ok(js.includes('reset-confirm-2'));
  assert.ok(js.includes('clearGameSave'));
});
