import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeBookEntries, HIDDEN_NAME, HIDDEN_DESCRIPTION } from '../dist/game/recipeBook.js';
import { approachCamera, incomingKinds, previewActors, APPROACH_DURATION_MS, APPROACH_HOLD_MS, APPROACH_PAN_MS, APPROACH_READY_MS } from '../dist/art/approach.js';
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
  assert.equal(APPROACH_DURATION_MS, 7500);
  assert.equal(APPROACH_HOLD_MS, 4000);
  assert.equal(APPROACH_PAN_MS, 2500);
  assert.equal(APPROACH_READY_MS, 1000);
  assert.deepEqual(approachCamera(APPROACH_HOLD_MS / APPROACH_DURATION_MS), approachCamera(0));
  assert.deepEqual(approachCamera((APPROACH_HOLD_MS + APPROACH_PAN_MS) / APPROACH_DURATION_MS), approachCamera(1));
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
    assert.equal(frame.sourceWidth, 416);
    assert.equal(frame.sourceHeight, 200);
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


test('preview lineup covers actual potential wave types without pretending random counts are exact', () => {
  const wants = [
    ['walk'], ['walk'], ['walk'], ['jog','walk'],
    ['walk'], ['walk','jog'], ['walk','jog','critic'], ['walk','jog','critic'],
    ['walk','jog','critic','insp'], ['walk','jog','critic','insp'],
  ];
  LEVELS.forEach((level, index) => {
    assert.deepEqual([...incomingKinds(level)].sort(), [...wants[index]].sort(), level.name);
    assert.deepEqual([...new Set(previewActors(level))].sort(), [...wants[index]].sort(), level.name);
    if (level.tutorial) {
      assert.deepEqual(previewActors(level),
        level.tutorial.flatMap(step => (step.spawn ?? []).map(enemy => enemy.kind)));
    } else {
      assert.equal(previewActors(level).length, level.finalWaveSize,
        'the street preview shows the level-defined final-wave size, not an invented 4-8 crowd');
      assert.ok(previewActors(level).length >= incomingKinds(level).length);
      assert.ok(previewActors(level).every(kind => incomingKinds(level).includes(kind)));
    }
  });
});

test('the camera keeps the lineup held, pans at constant size, then settles on the board', () => {
  assert.equal(approachCamera(.5).sourceX, 192);
  assert.ok(approachCamera(.65).sourceX > 0 && approachCamera(.65).sourceX < 192);
  assert.equal(approachCamera(.9).sourceX, 0);
  const app = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('incomingKinds(level)'));
  assert.ok(app.includes('roster.replaceChildren()'));
  assert.ok(app.includes('previewActors(level)'), 'intro count is derived from real preview actors');
  assert.ok(app.includes("preview.length + ' SCRIPTED HOOMAN'"));
  assert.ok(app.includes("preview.length + ' FINAL-WAVE SAMPLE'"));
  assert.ok(app.includes("this.engine.state.intro = .01"), 'no extra 2.6-second countdown after the camera');
  assert.ok(app.includes("data-action") || app.includes("intro.classList.toggle('lineup'"));
});


test('street-side camera uses the actual continuous live room instead of a distinct background', () => {
  const approach = readFileSync(new URL('../dist/art/approach.js', import.meta.url), 'utf8');
  assert.ok(approach.includes('drawBattleScenery(shelf, door, street, sprites, state, time)'));
  assert.ok(approach.includes('drawOutdoorPavement'));
  assert.ok(approach.includes('ctx.drawImage(board, SHELF_WIDTH, 0)'));
  assert.ok(approach.includes('ctx.drawImage(street, SHELF_WIDTH + COLUMNS * TILE + DOOR_WIDTH, 0)'));
  assert.equal(approachCamera(0).sourceX, 192);
  assert.equal(approachCamera(1).sourceX, 0);
  assert.equal(approachCamera(1).sourceWidth, 416);
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('id="approach-canvas" width="416" height="200"'));
});


test('preview counts and composition stay truthful for tutorials and every rush', () => {
  for (const level of LEVELS) {
    const samples = previewActors(level);
    if (level.tutorial) {
      const scripted = level.tutorial.flatMap(step => step.spawn ?? []);
      assert.equal(samples.length, scripted.length);
      assert.deepEqual(samples, scripted.map(enemy => enemy.kind));
    } else {
      assert.equal(samples.length, level.finalWaveSize, level.name);
      assert.deepEqual([...new Set(samples)].sort(), [...incomingKinds(level)].sort());
    }
  }
  const final = previewActors(LEVELS.at(-1));
  const counts = Object.groupBy ? Object.groupBy(final, kind => kind) : null;
  if (counts) for (const kind of incomingKinds(LEVELS.at(-1)))
    assert.equal(counts[kind].length, 2, 'the four final-level Hooman kinds are evenly represented');
  const renderer = readFileSync(new URL('../dist/art/approach.js', import.meta.url), 'utf8');
  assert.ok(renderer.includes('const crowd = previewActors(level)'));
  assert.ok(renderer.includes('for (let index = 0; index < count; index++)'));
});
