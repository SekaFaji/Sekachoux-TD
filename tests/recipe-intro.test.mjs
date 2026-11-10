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

test('camera starts over Hoomans on right and pans left at constant zoom', () => {
  assert.equal(APPROACH_DURATION_MS, 3100);
  const start = approachCamera(0);
  const held = approachCamera(.12);
  const middle = approachCamera(.57);
  const end = approachCamera(1);
  assert.deepEqual(start, held);
  assert.equal(start.sourceX, 192);
  assert.ok(middle.sourceX < start.sourceX && middle.sourceX > 0);
  assert.equal(end.sourceX, 0);
  for (const frame of [start, held, middle, end, approachCamera(-1), approachCamera(2)]) {
    assert.equal(frame.sourceY, 0);
    assert.equal(frame.sourceWidth, 288);
    assert.equal(frame.sourceHeight, 160);
  }
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
