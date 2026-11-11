import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HIDDEN_DESCRIPTION, HIDDEN_NAME, recipeBookEntries } from '../dist/game/recipeBook.js';
import { drawBakeryPixelLogo, LOGO_HEIGHT, LOGO_WIDTH } from '../dist/art/titleLogo.js';

test('pastry cards keep exact hidden names, descriptions and stats until unlocked', () => {
  const all = recipeBookEntries('pastries', ['croissant','butter'], []);
  assert.equal(all.length,5);
  assert.equal(all[0].locked,false);
  assert.equal(all[1].locked,false);
  for(const card of all.slice(2)){
    assert.equal(card.locked,true);
    assert.equal(card.name,HIDDEN_NAME);
    assert.equal(card.description,HIDDEN_DESCRIPTION);
    assert.equal(card.stat,'???');
  }
});

test('Hoomans do not reveal undiscovered identities in book collection or detail panel', () => {
  const entries=recipeBookEntries('hoomans',['croissant'],['walk']);
  assert.equal(entries.length,4);
  assert.equal(entries[0].locked,false);
  for(const entry of entries.slice(1)){
    assert.equal(entry.name,'??????');
    assert.equal(entry.description,'???? ?? ???? ??????');
    assert.equal(entry.stat,'???');
    assert.equal(entry.locked,true);
  }
});

test('compact Recipe Book provides selectable cards plus a dedicated detail page', () => {
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8');
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  for(const id of ['codex-workspace','almanac-list','almanac-detail','detail-image','detail-kicker','detail-name','detail-description','detail-stat']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.ok(css.includes('grid-template-columns: repeat(4,minmax(0,1fr))'));
  assert.ok(css.includes('grid-auto-rows: 26.3cqh'));
  assert.ok(css.includes('.codex-detail-locked img'));
  assert.ok(app.includes("card.dataset.action = 'select-recipe'"));
  assert.ok(app.includes("card.setAttribute('aria-pressed'"));
  assert.ok(app.includes('private selectRecipe') || app.includes('selectRecipe(index)'));
  assert.ok(app.includes('entry.description'));
  assert.ok(app.includes('this.recipeSelection'));
});

test('pixel logo is hand-rendered at the correct scale and never relies on a font file', () => {
  assert.equal(LOGO_WIDTH,288);
  assert.equal(LOGO_HEIGHT,48);
  let pixels=0;
  const colors=new Set();
  const ctx={
    fillStyle:'',
    imageSmoothingEnabled:true,
    fillRect(x,y,w,h){
      assert.ok(Number.isFinite(x+y+w+h));
      pixels+=w*h;
      colors.add(this.fillStyle);
    },
    clearRect(){},
  };
  const canvas={width:0,height:0,getContext(kind){assert.equal(kind,'2d');return ctx;}};
  drawBakeryPixelLogo(canvas);
  assert.equal(canvas.width,288);
  assert.equal(canvas.height,48);
  assert.equal(ctx.imageSmoothingEnabled,false);
  assert.ok(pixels>5000,'letterforms should contain substantial hand-painted pixels');
  assert.ok(colors.has('#ffda83'),'golden raised lettering');
  assert.ok(colors.has('#39251f'),'toasted outlines');
  assert.ok(colors.has('#8d483c'),'subtitle plaque');
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('id="title-logo" width="288" height="48"'));
  assert.ok(html.includes('Sekachoux TD - Bakery Defense'));
  assert.ok(!html.includes('<h1>SEKACHOUX <span>TD</span></h1>'));
});
