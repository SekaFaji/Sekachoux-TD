import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeBookEntries, HIDDEN_NAME, HIDDEN_DESCRIPTION } from '../dist/game/recipeBook.js';
import { approachCamera, APPROACH_DURATION_MS } from '../dist/art/approach.js';
import { LEVELS } from '../dist/game/levels.js';
import { readFileSync } from 'node:fs';

test('Recipe Book always shows every pastry, with exact masked labels and hidden costs', () => {
  const entries = recipeBookEntries('pastries', LEVELS[0].available, []);
  assert.equal(entries.length, 5);
  assert.equal(entries[0].name, 'Croissant');
  assert.equal(entries[0].locked, false);
  for (const entry of entries.slice(1)) {
    assert.equal(entry.locked, true);
    assert.equal(entry.name, HIDDEN_NAME);
    assert.equal(entry.description, HIDDEN_DESCRIPTION);
    assert.equal(entry.stat, '???');
  }
});

test('pastry silhouettes unlock sequentially without exposing later rewards', () => {
  for (let i = 0; i < 5; i++) {
    const level = LEVELS[i];
    const entries = recipeBookEntries('pastries', level.available, []);
    assert.equal(entries.filter(entry => !entry.locked).length, i + 1);
    assert.ok(entries.filter(entry => entry.locked).every(entry => entry.name === '??????'));
  }
});

test('Hooman Dex displays four slots; only encountered kinds show their names and descriptions', () => {
  const none = recipeBookEntries('hoomans', [], []);
  assert.equal(none.length, 4);
  assert.ok(none.every(entry => entry.locked && entry.name === '??????' && entry.description === '???? ?? ???? ??????'));
  const after = recipeBookEntries('hoomans', [], ['jog']);
  assert.equal(after.filter(entry => !entry.locked).length, 1);
  assert.equal(after.find(entry => entry.kind === 'jog').name, 'Jogger');
  assert.ok(after.filter(entry => entry.locked).every(entry => entry.stat === '???'));
});

test('camera opens on far-right Hooman approach, then zooms out to whole battlefield', () => {
  assert.equal(APPROACH_DURATION_MS, 3900);
  const start = approachCamera(0);
  const held = approachCamera(.2);
  const middle = approachCamera(.58);
  const end = approachCamera(1);
  assert.deepEqual(start, held);
  assert.ok(start.sourceX > 250);
  assert.ok(start.sourceWidth < 288);
  assert.ok(middle.sourceX < start.sourceX && middle.sourceX > 0);
  assert.ok(middle.sourceWidth > start.sourceWidth && middle.sourceWidth < 288);
  assert.ok(Math.abs(end.sourceX) < 1e-7);
  assert.ok(Math.abs(end.sourceY) < 1e-7);
  assert.ok(Math.abs(end.sourceWidth - 288) < 1e-7);
  assert.ok(Math.abs(end.sourceHeight - 160) < 1e-7);
  assert.deepEqual(approachCamera(-1), start);
  assert.deepEqual(approachCamera(2), end);
});


test('menu has one Recipe Book route, separate tabs and no old popup', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/data-action="recipe-book"/g) || []).length, 1);
  assert.ok(html.includes('id="tab-pastries" data-action="tab-pastries"'));
  assert.ok(html.includes('id="tab-hoomans" data-action="tab-hoomans"'));
  assert.ok(html.includes('id="approach-canvas"'));
  assert.ok(html.includes('data-action="skip-intro"'));
  assert.ok(!html.includes('id="level-preview"'));
});
