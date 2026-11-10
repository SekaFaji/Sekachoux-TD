import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { MENU_SIZE, MENU_SLOTS, slotPercentage } from '../dist/art/menuLayout.js';

const actionSlots = ['start','levels','recipes','settings','credits'];
const overlaps = (a,b) =>
  a.x < b.x+b.width && a.x+a.width > b.x &&
  a.y < b.y+b.height && a.y+a.height > b.y;

test('menu click targets match the illustration and never overlap', () => {
  assert.deepEqual(MENU_SIZE, { width: 480, height: 270 });
  for (const [name,box] of Object.entries(MENU_SLOTS)) {
    assert.ok(box.x>=0 && box.y>=0 && box.width>0 && box.height>0,name);
    assert.ok(box.x+box.width<=MENU_SIZE.width,name+' width');
    assert.ok(box.y+box.height<=MENU_SIZE.height,name+' height');
    const pct=slotPercentage(name);
    assert.equal(parseFloat(pct.left),box.x/480*100);
    assert.equal(parseFloat(pct.top),box.y/270*100);
  }
  for (let i=0;i<actionSlots.length;i++) for (let j=i+1;j<actionSlots.length;j++) {
    const a=actionSlots[i],b=actionSlots[j];
    assert.equal(overlaps(MENU_SLOTS[a],MENU_SLOTS[b]),false,a+' overlaps '+b);
  }
  for(const name of actionSlots){
    assert.equal(overlaps(MENU_SLOTS[name],MENU_SLOTS.profile),false,name+' overlaps baker name');
  }
});

test('approved image is packaged as a real WebP and active native controls align with it', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const artPath=new URL('../dist/assets/menu/sekachoux-bakery-window.webp',import.meta.url);
  const art=readFileSync(artPath);
  assert.equal(art.toString('ascii',0,4),'RIFF');
  assert.equal(art.toString('ascii',8,12),'WEBP');
  assert.ok(statSync(artPath).size>100000);
  assert.ok(html.includes('id="menu-art"'));
  assert.ok(!html.includes('<canvas id="menu-art"'));
  const actions={start:'start-baking',levels:'levels',recipes:'recipe-book',settings:'settings',credits:'credits'};
  for(const [slot,action] of Object.entries(actions)){
    assert.ok(html.includes('data-menu-slot="'+slot+'" data-action="'+action+'"'),slot);
  }
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  assert.ok(app.includes('positionBakeryMenu'));
  assert.ok(app.includes('MENU_IMAGE_PATH'));
  assert.ok(!app.includes('drawMenuBackground'));
});

test('baker name stays editable and studio badge is absent from the main menu', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const menu=html.split('<section id="menu"')[1].split('<section id="level-screen"')[0];
  assert.ok(menu.includes('id="profile-name"'));
  assert.ok(menu.includes('data-action="edit-name"'));
  assert.ok(!menu.includes('id="studio-credit"'));
  assert.ok(!menu.includes('SekaFaji Games'));
  assert.ok(menu.includes('aria-label="Baker profile"'));
});

test('fullscreen remains in settings and the game systems survive the menu replacement', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  assert.ok(html.includes('id="fullscreen-setting"'));
  assert.equal((html.match(/data-action="fullscreen"/g)||[]).length,1);
  assert.ok(app.includes('fullscreenchange'));
  for(const id of ['game-screen','butter-counter','reward-drop-card','almanac-list']) {
    assert.ok(html.includes('id="'+id+'"'));
  }
  assert.ok(html.includes('data-action="reset-saves"'));
  assert.ok(html.includes('data-action="edit-name"'));
});
