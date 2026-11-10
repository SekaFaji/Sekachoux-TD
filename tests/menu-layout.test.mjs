import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MENU_SIZE, MENU_SLOTS, slotPercentage } from '../dist/art/menuLayout.js';

const actionSlots = ['oven','orders','book','settings','credits'];
const overlaps = (a,b) =>
  a.x < b.x+b.width && a.x+a.width > b.x &&
  a.y < b.y+b.height && a.y+a.height > b.y;

test('menu controls use one shared pixel-art coordinate space with non-overlapping hitboxes', () => {
  assert.deepEqual(MENU_SIZE, { width: 480, height: 270 });
  for (const [name,box] of Object.entries(MENU_SLOTS)) {
    assert.ok(box.x>=0 && box.y>=0 && box.width>0 && box.height>0,name);
    assert.ok(box.x+box.width<=MENU_SIZE.width,name+' width');
    assert.ok(box.y+box.height<=MENU_SIZE.height,name+' height');
    const percent=slotPercentage(name);
    assert.equal(parseFloat(percent.left),box.x/480*100);
    assert.equal(parseFloat(percent.top),box.y/270*100);
  }
  for (let i=0;i<actionSlots.length;i++) for (let j=i+1;j<actionSlots.length;j++) {
    const a=actionSlots[i],b=actionSlots[j];
    assert.equal(overlaps(MENU_SLOTS[a],MENU_SLOTS[b]),false,a+' overlaps '+b);
  }
});

test('scene objects are keyboard-clickable with correct action and painting slot', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const pairs={
    oven:'start-baking',orders:'levels',book:'recipe-book',
    settings:'settings',credits:'credits'
  };
  for(const [slot,action] of Object.entries(pairs)){
    assert.ok(html.includes('data-menu-slot="'+slot+'" data-action="'+action+'"'),slot);
  }
  assert.ok(html.includes('data-menu-slot="logo"'));
  assert.ok(html.includes('data-menu-slot="profile"'));
  assert.ok(html.includes('data-menu-slot="studio"'));
  assert.ok(html.includes('id="menu-board-heading"'));
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  const art=readFileSync(new URL('../dist/art/bakeryScene.js',import.meta.url),'utf8');
  assert.ok(app.includes('positionBakeryMenu'));
  assert.ok(art.includes('MENU_SLOTS'));
});

test('fullscreen moved entirely into settings, with live enabled state', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  assert.ok(html.includes('id="fullscreen-setting"'));
  assert.ok(html.includes('class="settings-fullscreen"'));
  assert.ok(!html.includes('menu-fullscreen'));
  assert.equal((html.match(/data-action="fullscreen"/g)||[]).length,1);
  assert.ok(app.includes('fullscreenchange'));
  assert.ok(app.includes('updateFullscreenControl'));
  assert.ok(app.includes('Fullscreen Unavailable'));
});

test('main-menu only update keeps gameplay and cookbook essentials intact', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('id="game-screen"'));
  assert.ok(html.includes('id="butter-counter"'));
  assert.ok(html.includes('id="reward-drop-card"'));
  assert.ok(html.includes('id="almanac-list"'));
  assert.ok(html.includes('data-action="reset-confirm-2"')===false);
  assert.ok(html.includes('data-action="reset-saves"'));
});
