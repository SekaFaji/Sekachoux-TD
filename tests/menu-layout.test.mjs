import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TITLE_WIDTH, TITLE_HEIGHT, drawBakeryTitleScene } from '../dist/art/bakeryScene.js';

test('living title uses the same 16:9 native pixel grid as a Sekampfire-style game scene', () => {
  assert.equal(TITLE_WIDTH,320);
  assert.equal(TITLE_HEIGHT,180);
  assert.equal(typeof drawBakeryTitleScene, 'function');
  const scene=readFileSync(new URL('../dist/art/bakeryScene.js',import.meta.url),'utf8');
  for(const unit of ['croissant','butter','loaf','pin']) {
    assert.ok(scene.includes("'"+unit+"'"),unit+' should reuse real game art');
  }
  const crowd = readFileSync(new URL('../dist/art/titleHoomans.js',import.meta.url),'utf8');
  for(const human of ['walk','jog','critic']) {
    assert.ok(crowd.includes("'"+human+"'"),human+' should reuse real gameplay Hoomans');
  }
  assert.ok(scene.includes('Math.sin'));
  assert.ok(scene.includes("atlas.images"));
  assert.ok(!scene.includes('.webp'));
});

test('main menu has five actual visible accessible navigation buttons', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const menu=html.split('<section id="menu"')[1].split('<section id="level-screen"')[0];
  const controls={
    'Start Baking':'start-baking',
    'Level Select':'levels',
    'Recipe Book':'recipe-book',
    'Settings':'settings',
    'Credits':'credits'
  };
  for(const [text,action] of Object.entries(controls)){
    assert.ok(menu.includes('data-action="'+action+'">'+text+'</button>'),action);
  }
  assert.equal((menu.match(/class="title-action/g)||[]).length,5);
  assert.ok(menu.includes('<canvas id="menu-art" width="320" height="180"'));
  assert.ok(!menu.includes('<img id="menu-art"'));
  assert.ok(!menu.includes('retro-hit'));
});

test('static promotional art and invisible click areas are removed from deployed output',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8');
  assert.ok(!existsSync(new URL('../dist/assets/menu/sekachoux-bakery-window.webp',import.meta.url)));
  assert.ok(!html.includes('sekachoux-bakery-window.webp'));
  assert.ok(!app.includes('MENU_IMAGE_PATH'));
  assert.ok(!app.includes('positionBakeryMenu'));
  assert.ok(app.includes('drawBakeryTitleScene'));
  assert.ok(app.includes('startMenuAnimation'));
  assert.ok(app.includes('stopMenuAnimation'));
  assert.ok(css.includes('#menu #main-actions .title-action'));
});

test('menu keeps editable baker name and fullscreen in Settings only',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const menu=html.split('<section id="menu"')[1].split('<section id="level-screen"')[0];
  assert.ok(menu.includes('id="profile-name"'));
  assert.ok(menu.includes('data-action="edit-name"'));
  assert.ok(!menu.includes('SekaFaji Games'));
  assert.ok(!menu.includes('data-action="fullscreen"'));
  assert.ok(html.includes('id="fullscreen-setting"'));
  assert.equal((html.match(/data-action="fullscreen"/g)||[]).length,1);
  assert.ok(html.includes('data-action="reset-saves"'));
  for(const id of ['game-screen','butter-counter','reward-drop-card','almanac-list'])assert.ok(html.includes('id="'+id+'"'));
});
