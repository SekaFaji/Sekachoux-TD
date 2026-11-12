import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COLUMNS, ROWS, TILE } from '../dist/game/types.js';
import { LEVELS } from '../dist/game/levels.js';
import { pointerToGrid } from '../dist/ui/viewport.js';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');

test('approach, worktop, runner reveal and reward share one exact-size board', () => {
  const start = html.indexOf('<div id="board-viewport">');
  const end = html.indexOf('<div id="banner"', start);
  assert.ok(start > 0 && end > start);
  const board = html.slice(start, end);
  for (const id of ['battlefield', 'lane-reveal', 'reward-drop-layer', 'approach-intro', 'approach-canvas']) {
    assert.equal((board.match(new RegExp('id="'+id+'"', 'g')) || []).length, 1, id);
  }
  assert.ok(board.indexOf('id="battlefield"') < board.indexOf('id="approach-intro"'));
  assert.ok(board.includes('width="288" height="160"'));
  assert.equal(COLUMNS * TILE, 288);
  assert.equal(ROWS * TILE, 160);
  assert.ok(!board.includes('id="level-label"'),'shift info must not cover board');
});

test('gameplay viewport keeps camera and live board identically scaled', () => {
  const current = css.slice(css.lastIndexOf('/* v0.9.5 - Living bakery battle layout'));
  assert.ok(current.includes('#game-screen #board-viewport'));
  assert.match(current, /#game-screen #board-viewport\s*\{[^}]*height:\s*100%;[^}]*aspect-ratio:\s*9\s*\/\s*5/);
  assert.match(current, /#game-screen #battlefield\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*fill/);
  assert.match(current, /#game-screen #approach-canvas\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*fill/);
  assert.match(current, /#game-screen #approach-intro,\s*#game-screen #lane-reveal,\s*#game-screen #reward-drop-layer\s*\{[^}]*inset:\s*0/);
  assert.ok(!/#game-screen #battlefield\s*\{[^}]*object-fit:\s*contain/.test(current),'board must not letterbox');
  assert.ok(app.includes("byId<HTMLElement>('game-screen').classList.remove('cinematic')") ||
    app.includes("byId('game-screen').classList.remove('cinematic')"));
  assert.ok(app.includes('drawApproachFrame'));
  assert.ok(app.includes('drawBattlefield'));
});

test('decorative scenery is separate from gameplay grid and leaves touch logic unchanged', () => {
  assert.ok(html.includes('id="battle-scenery"'));
  assert.ok(html.indexOf('id="battle-scenery"') < html.indexOf('id="board-viewport"'));
  const art = readFileSync(new URL('../dist/art/battleScenery.js', import.meta.url), 'utf8');
  assert.ok(art.includes('drawBattleScenery'));
  assert.ok(art.includes("['croissant', 'loaf', 'pretzel', 'butter', 'pie']"));
  assert.ok(art.includes('sprites.images[displayKinds[row]]'));
  assert.ok(art.includes('state?.enemies'), 'shelf and door use live state');
  assert.ok(art.includes('enemy.x - COLUMNS'), 'door translates real enemy world position to local coordinates');
  const rect = { left: 10, top: 20, width: 900, height: 500 };
  assert.deepEqual(
    { col: pointerToGrid(10 + 450, 20 + 250, rect)?.column, row: pointerToGrid(460, 270, rect)?.row },
    { col: 4, row: 2 }
  );
  assert.equal(pointerToGrid(4, 270, rect), null);
  assert.deepEqual(LEVELS.slice(0,4).map(l => l.activeRows), [[2],[2],[2],[2]]);
});

test('intro is skippable and CSS never fades or shifts the HUD', () => {
  const current = css.slice(css.lastIndexOf('/* v0.9.5 - Living bakery battle layout'));
  assert.ok(current.includes('#game-screen.cinematic #toolbar { opacity: 1; pointer-events: none; }'));
  assert.ok(html.includes('data-action="skip-intro"'));
  assert.ok(app.includes('this.beginBattle()'));
  assert.ok(app.includes('drawBattleScenery'));
});


test('side margins are two pixel-aligned parts of the bakery, not stretched filler', () => {
  const start = html.indexOf('<div id="battle-room"');
  const end = html.indexOf('<div id="banner"', start);
  assert.ok(start > 0 && end > start);
  const room = html.slice(start, end);
  assert.match(room, /id="battle-scenery" width="32" height="160"/);
  assert.match(room, /id="bakery-door" width="32" height="160"/);
  assert.match(room, /id="battlefield" width="288" height="160"/);
  assert.ok(room.indexOf('id="battle-scenery"') < room.indexOf('id="board-viewport"'));
  assert.ok(room.indexOf('id="bakery-door"') > room.indexOf('id="board-viewport"'));
  const scene = css.slice(css.lastIndexOf('/* v0.9.5 - Living bakery battle layout'));
  assert.match(scene, /#game-screen #battle-room\s*\{[^}]*grid-template-columns:\s*32fr 288fr 32fr/);
  assert.match(scene, /#game-screen #battle-room\s*\{[^}]*aspect-ratio:\s*11\s*\/\s*5/);
  assert.ok(html.includes('id="approach-roster"'));
  assert.ok(html.includes('data-action="skip-intro"'));
  // The 9x5 tiles stay untouched, and each side is exactly 1 tile wide.
  assert.equal(COLUMNS * TILE + 2 * TILE, 352);
  assert.equal(ROWS * TILE, 160);
});

test('doorway renders the same real enemy objects, while the shelf remains an objective prop', () => {
  const art = readFileSync(new URL('../dist/art/battleScenery.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');
  assert.match(art, /enemy\.x\s*-\s*COLUMNS/);
  assert.ok(art.includes('sprites.images[enemy.kind'));
  assert.ok(art.includes('state?.enemies'));
  assert.ok(!art.includes('spawnEnemy('));
  assert.ok(app.includes("byId('bakery-door')") || app.includes("byId('bakery-door'") || app.includes("byId('bakery-door')") ||
    app.includes("('bakery-door')"), 'the new doorway is connected to the render loop');
  assert.ok(app.includes('this.drawBakeryRoom(this.engine.state.elapsed)'));
});
