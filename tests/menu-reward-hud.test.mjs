import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../dist/game/engine.js';

test('first-time recipe reward is anchored to the last defeated Hooman', () => {
  const engine = new GameEngine(0, () => .5);
  engine.state.intro = .01;
  engine.update(.02);
  assert.equal(engine.place('croissant', 2, 2), true);
  for (let i = 0; i < 500 && !engine.finished; i++) engine.update(.05);
  assert.equal(engine.finished, true);
  assert.ok(engine.state.lastDefeated, 'Last fallen Hooman is remembered');
  assert.equal(engine.state.lastDefeated.row, 2);
  assert.ok(engine.state.lastDefeated.x > 0 && engine.state.lastDefeated.x < 9.5);
  assert.deepEqual(engine.takeEvents().filter(e => e.type === 'win'), [{ type: 'win' }]);
});

test('HUD fixes shift and butter at left, portraits in the middle and tools at right', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const status = html.indexOf('id="hud-status"');
  const butter = html.indexOf('id="butter-counter"');
  const deck = html.indexOf('id="hud-deck"');
  const cards = html.indexOf('id="defender-cards"');
  const right = html.indexOf('id="hud-right"');
  assert.ok(status > 0 && status < butter && butter < deck && deck < cards && cards < right);
  assert.ok(html.includes('id="reward-drop-layer"'));
  assert.ok(html.includes('data-action="collect-reward"'));
});

test('new recipe is an interactive glowing field card with a five-second fallback', () => {
  const app = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.ok(app.includes('state.lastDefeated'));
  assert.ok(app.includes('setTimeout(() => this.collectReward(), 5000)'));
  assert.ok(app.includes("action === 'collect-reward'"));
  assert.ok(css.includes('card-reward-glow'));
  assert.ok(css.includes('reward-drop-card'));
});

test('recipe book uses real vertical cards and keeps locked mysteries', () => {
  const app = readFileSync(new URL('../dist/ui/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  assert.ok(app.includes("'recipe-card codex-compact-card '"));
  assert.ok(css.includes('grid-template-columns: repeat(4,minmax(0,1fr))'));
  assert.ok(css.includes('.codex-compact-card.codex-card-locked img'));
});

test('new menu has integrated bakery controls and preserved navigation', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const action of ['start-baking','levels','recipe-book','settings','credits']) {
    assert.ok(html.includes('data-action="' + action + '"'));
  }
  assert.ok(html.includes('<canvas id="menu-art"'));
  assert.ok(html.includes('class="title-action title-primary"'));
  assert.ok(!html.includes('id="studio-credit"'));
  assert.ok(html.includes('SekaFaji Games'));
});
