import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COLUMNS, ROWS, TILE, STREET_END_X, STREET_SPAWN_X } from '../dist/game/types.js';
import { LEVELS } from '../dist/game/levels.js';
import { pointerToGrid } from '../dist/ui/viewport.js';
import { ROOM_WIDTH, ROOM_HEIGHT, SHELF_WIDTH, DOOR_WIDTH, STREET_WIDTH } from '../dist/art/battleScenery.js';
import { ROYAL_FAMILY } from '../dist/game/royalty.js';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');

test('the cutscene covers the exact same full 416px room as the gameplay scene', () => {
  const roomStart = html.indexOf('<div id="battle-room"');
  const roomEnd = html.indexOf('<div id="banner"', roomStart);
  assert.ok(roomStart >= 0 && roomEnd > roomStart);
  const room = html.slice(roomStart, roomEnd);
  const boardStart = room.indexOf('<div id="board-viewport">');
  const boardEnd = room.indexOf('id="bakery-door"');
  assert.ok(boardStart >= 0 && boardEnd > boardStart);
  const board = room.slice(boardStart, boardEnd);
  assert.ok(board.includes('id="battlefield" width="288" height="160"'));
  assert.ok(board.includes('id="lane-reveal"'));
  assert.ok(board.includes('id="reward-drop-layer"'));
  assert.ok(!board.includes('id="approach-intro"'), 'intro owns whole room, not board only');
  assert.ok(room.indexOf('id="approach-intro"') > room.indexOf('id="bakery-street"'));
  assert.ok(room.includes('id="approach-canvas" width="416" height="160"'));
  assert.ok(room.includes('id="approach-roster"'));
  assert.ok(room.includes('data-action="skip-intro"'));
});

test('shelves, board, glass door and outdoor street have matching native pixels', () => {
  assert.equal(SHELF_WIDTH, 32);
  assert.equal(COLUMNS * TILE, 288);
  assert.equal(DOOR_WIDTH, 32);
  assert.equal(STREET_WIDTH, 64);
  assert.equal(ROOM_WIDTH, 416);
  assert.equal(ROOM_HEIGHT, 160);
  assert.equal(ROWS * TILE, ROOM_HEIGHT);
  assert.equal(STREET_END_X, 12);
  assert.ok(STREET_SPAWN_X > 11 && STREET_SPAWN_X < STREET_END_X);

  const room = html.slice(html.indexOf('<div id="battle-room"'), html.indexOf('<div id="banner"'));
  assert.match(room, /id="battle-scenery" width="32" height="160"/);
  assert.match(room, /id="bakery-door" width="32" height="160"/);
  assert.match(room, /id="bakery-street" width="64" height="160"/);
  assert.match(room, /id="battlefield" width="288" height="160"/);
  const scene = css.slice(css.lastIndexOf('/* v0.9.5 - Living bakery battle layout'));
  assert.match(scene, /#game-screen #battle-room\s*\{[^}]*grid-template-columns:\s*32fr 288fr 32fr 64fr/);
  assert.match(scene, /#game-screen #battle-room\s*\{[^}]*aspect-ratio:\s*13\s*\/\s*5/);
  assert.ok(!/#game-screen #battlefield\s*\{[^}]*object-fit:\s*contain/.test(scene));
  assert.ok(scene.includes('#game-screen #approach-intro'));
  assert.ok(scene.includes('#game-screen #approach-canvas'));
});

test('five unique royal chouquettes replace the old pastry display sprites', () => {
  assert.deepEqual([...ROYAL_FAMILY], ['Queen','King','Princess','Prince','Grandpa']);
  const art = readFileSync(new URL('../dist/art/battleScenery.js', import.meta.url), 'utf8');
  const royalArt = readFileSync(new URL('../dist/art/royaltyArt.js', import.meta.url), 'utf8');
  assert.ok(art.includes('drawRoyalChouquette'));
  assert.ok(art.includes('state?.royalsEaten'));
  assert.ok(art.includes('drawStreet'));
  assert.ok(art.includes('drawActorsInSegment'));
  assert.ok(art.includes('drawWheelInSegment'));
  assert.ok(!art.includes('spawnEnemy('),'visuals must not invent enemies');
  assert.ok(royalArt.includes('drawRoyalChouquette'));
  for (const style of ['Queen:', 'King:', 'Princess:', 'Prince:', 'Grandpa:']) {
    assert.ok(royalArt.includes(style), style + ' visual design is missing');
  }
});

test('touches still map only to the real 9x5 placement board', () => {
  const rect = { left: 10, top: 20, width: 900, height: 500 };
  assert.deepEqual(
    { col: pointerToGrid(460, 270, rect)?.column, row: pointerToGrid(460, 270, rect)?.row },
    { col: 4, row: 2 }
  );
  assert.equal(pointerToGrid(4, 270, rect), null);
  assert.deepEqual(LEVELS.slice(0,4).map(l=>l.activeRows), [[2],[2],[2],[2]]);
  assert.ok(app.includes('this.canvas.addEventListener('));
  assert.ok(app.includes("byId<HTMLCanvasElement>('bakery-street')"));
});

test('HUD keeps playable pastry controls and adds readable remaining royalty lives', () => {
  assert.ok(html.includes('id="royal-counter"'));
  assert.ok(app.includes('royalsRemaining(state.royalsEaten)'));
  assert.ok(app.includes('royalty.classList.toggle'));
  assert.ok(html.includes('id="defender-cards"'));
  assert.ok(html.includes('id="butter-counter"'));
  const section = css.slice(css.indexOf('/* v0.9.7 - The royalty shelves'));
  assert.ok(section.includes('#game-screen #royal-counter'));
  assert.ok(section.includes('#game-screen #hud-deck-header'));
  assert.ok(app.includes("this.showBanner('THE ROYAL CHOUQUETTE FAMILY HAS FALLEN!'"));
});
