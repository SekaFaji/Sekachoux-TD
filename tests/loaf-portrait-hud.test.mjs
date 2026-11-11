import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../dist/game/levels.js';
import { GameEngine } from '../dist/game/engine.js';
import { DEFENDERS } from '../dist/game/catalog.js';
import { recipeBookEntries } from '../dist/game/recipeBook.js';
import { SPR } from '../dist/art/sprites.js';

test('Loaf Bread replaces the tank without changing its balance or tutorial progression', () => {
  assert.deepEqual(LEVELS.slice(0,4).map(level=>level.reward),['butter','loaf','pretzel','pie']);
  assert.deepEqual([DEFENDERS.loaf.c, DEFENDERS.loaf.hp, DEFENDERS.loaf.cd],[50,400,12]);
  assert.equal(DEFENDERS.loaf.n,'Loaf Bread');
  assert.equal('baguette' in DEFENDERS,false,'Baguette is reserved for a future role');
  assert.ok(LEVELS[2].lesson.includes('Loaf Bread'));
  assert.ok(LEVELS[2].tutorial.some(step=>step.allowed.includes('loaf')));
  const game=new GameEngine(2,()=>.5);
  game.state.intro=0;
  assert.equal(game.place('loaf',4,2),false,'tutorial must require croissant first');
  assert.equal(game.place('croissant',2,2),true);
  game.update(.05);
  assert.equal(game.allowed('loaf'),true);
  assert.equal(game.place('loaf',1,2),false,'tank must defend in front');
  assert.equal(game.place('loaf',4,2),true);
  assert.equal(game.state.defenders.at(-1).health,400);
  assert.equal(game.state.butter,0);
});

test('past campaign unlocks still map to exactly the same level indices', async () => {
  const progress=await import('../dist/game/progress.js');
  const old=globalThis.localStorage;
  const values=new Map([['sekachoux_td_unlocked_v2','5']]);
  globalThis.localStorage={
    getItem:k=>values.get(k)??null,
    setItem:(k,v)=>values.set(k,String(v)),
  };
  try{
    assert.equal(progress.loadUnlocked(),5);
    assert.ok(LEVELS[2].available.includes('loaf'));
    assert.ok(LEVELS[4].available.includes('loaf'));
    assert.equal(progress.saveUnlocked(6),6);
    assert.equal(values.get('sekachoux_td_unlocked_v2'),'6');
  }finally{
    if(old===undefined)delete globalThis.localStorage;
    else globalThis.localStorage=old;
  }
});

test('Loaf Bread is the earnable recipe while locked silhouettes remain hidden', () => {
  const locked=recipeBookEntries('pastries',['croissant','butter'],[]);
  assert.equal(locked[2].locked,true);
  assert.equal(locked[2].name,'??????');
  assert.equal(locked[2].description,'???? ?? ???? ??????');
  const earned=recipeBookEntries('pastries',['croissant','butter','loaf'],[]);
  assert.equal(earned[2].name,'Loaf Bread');
  assert.equal(earned[2].kind,'loaf');
  assert.equal(earned[2].locked,false);
  assert.equal(earned[2].stat,'50 butter');
});

test('hand-authored Croissant and Loaf Bread have independent idle and action sprite frames', () => {
  for(const name of ['croissant','croissant-attack','loaf','loaf-guard']){
    assert.equal(typeof SPR[name],'function',name+' sprite factory missing');
  }
  assert.equal('baguette' in SPR,false);
  const art=readFileSync(new URL('../dist/art/heroSprites.js',import.meta.url),'utf8');
  assert.ok(art.includes('croissantSprite'));
  assert.ok(art.includes('loafSprite'));
  assert.ok(art.includes("attack"));
  assert.ok(art.includes("guard"));
  // The new artwork is hand-painted in 32px geometry, not enlarged stock art.
  assert.ok(art.includes('g.fillRect'));
  assert.ok(art.includes('g.lineTo'));
  assert.ok(art.includes('32'));
});

test('portrait card HUD retains real placement actions, butter prices and useful selection state', () => {
  const app=readFileSync(new URL('../dist/ui/app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(app.includes('defender-card pastry-portrait-card'));
  assert.ok(app.includes('portrait-card-art'));
  assert.ok(app.includes('portrait-card-type'));
  assert.ok(app.includes('portrait-card-footer'));
  assert.ok(app.includes("currency.textContent = 'BUTTER'"));
  assert.ok(app.includes("button.dataset.action = 'card'"));
  assert.ok(app.includes("button.dataset.kind = kind"));
  assert.ok(app.includes("'loaf'") || app.includes('loaf:'));
  assert.ok(css.includes('#game-screen .defender-card.pastry-portrait-card'));
  assert.ok(css.includes('#game-screen .pastry-portrait-card .portrait-card-art img'));
  assert.ok(css.includes('height: 32%'));
  assert.ok(css.includes("width: var(--cooldown,0%)") || css.includes('width: var(--cooldown, 0%)'));
  assert.ok(html.includes('id="defender-cards"'));
  assert.ok(html.includes('id="butter-counter"'));
  assert.ok(html.includes('data-action="shovel"'));
  assert.ok(html.includes('data-action="pause"'));
  assert.ok(html.includes('CHOOSE A PORTRAIT'));
});
