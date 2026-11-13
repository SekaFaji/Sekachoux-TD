import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BAKERY_PALETTE, laneColor, laneShadow } from '../dist/art/palette.js';

test('new board palette uses light complementary lanes, not a checkered field', () => {
  assert.equal(laneColor(0), BAKERY_PALETTE.cream);
  assert.equal(laneColor(1), BAKERY_PALETTE.marble);
  assert.equal(laneColor(2), laneColor(0));
  assert.notEqual(laneShadow(0), laneShadow(1));
  assert.notEqual(BAKERY_PALETTE.honey, BAKERY_PALETTE.cream);
});

test('board uses a continuous custom worktop, and butter pickups use a dedicated sprite', () => {
  const render = readFileSync(new URL('../dist/art/render.js', import.meta.url), 'utf8');
  const sprites = readFileSync(new URL('../dist/art/sprites.js', import.meta.url), 'utf8');
  assert.ok(render.includes('drawBakeryWorktop'));
  assert.ok(render.includes("sprites.images['butter-drop']"));
  assert.ok(sprites.includes("'butter-drop'"));
  assert.ok(!render.includes("'#f3dcae'"));
});

test('visual refresh does not modify the level data or engine gameplay', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.version, /^0\.[6-9]\.\d+$/);
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('data-action="start-baking"'));
  assert.ok(html.includes('data-action="settings"'));
  assert.ok(html.includes('data-action="recipe-book"'));
});


test('each Hooman role has readable unique costume details and two actual stride frames', async () => {
  const { human } = await import('../dist/art/sprites.js');
  const { ENEMIES } = await import('../dist/game/catalog.js');
  const existing = globalThis.document;
  const render = (kind, frame) => {
    const pixels = new Map();
    const ctx = {
      fillStyle: '',
      fillRect(x,y,w,h) {
        for(let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++)
          pixels.set((x+dx)+','+(y+dy),this.fillStyle);
      },
      getImageData(_x,_y,w,h) {
        const data=new Uint8ClampedArray(w*h*4);
        for (const key of pixels.keys()){
          const [x,y]=key.split(',').map(Number);
          if(x>=0&&y>=0&&x<w&&y<h)data[(y*w+x)*4+3]=255;
        }
        return {data};
      },
    };
    globalThis.document={
      createElement: tag => {
        assert.equal(tag,'canvas');
        return {width:0,height:0,getContext:type=>type==='2d'?ctx:null};
      },
    };
    const canvas=human(frame,ENEMIES[kind].o);
    assert.equal(canvas.width,32);
    assert.equal(canvas.height,32);
    return pixels;
  };
  try {
    // One prototype only: existing three other character sprites are still
    // rendered by the exact legacy code path and retain their costume pixels.
    const customerA = render('walk',0), customerB = render('walk',1);
    assert.notEqual(customerA.get('9,26'),customerB.get('9,26'),'stride shifts the near leg');
    assert.notEqual(customerA.get('7,23'),customerB.get('7,23'),'near arm has a distinct swing');
    for(const kind of ['walk','jog','critic','insp']){
      const a=render(kind,0),b=render(kind,1);
      assert.ok(a.size>180 && a.size<900,kind+' stays readable at 32px');
      assert.notDeepEqual([...a.entries()], [...b.entries()],kind+' must actually stride');
    }
    // The prototype Customer no longer uses a front-facing shopper/bag.
    // Unequal eyes, a projecting left nose and an offset jaw face the incoming
    // Hooman in its actual right-to-left travel direction.
    const customer = render('walk', 0);
    assert.equal(customer.get('7,8'),'#fff3db','large near eye leads on the left');
    assert.equal(customer.get('15,9'),'#48372b','smaller far eye is set back');
    assert.equal(customer.get('5,11'),'#8b563d','nose points into the left-moving direction');
    assert.equal(customer.get('7,13'),'#ffefdc','open jaw has readable tiny teeth');
    assert.equal(customer.get('17,18'),'#c96553','striped red tie marks a hunched brown jacket');
    assert.equal(customer.get('20,20'),'#825235','jacket has a warm brown back plane');
    assert.equal(customer.get('6,28'),'#44342b','near shoe extends to the left of the coat');
    assert.ok(!customer.has('29,11'),'forward-leaning head is not a centered face');
    assert.equal(render('jog',0).get('11,6'),'#fc7b70','Jogger has a colored headband');
    assert.equal(render('critic',0).get('25,22'),'#8d715c','Critic carries a notepad');
    assert.equal(render('insp',0).get('16,4'),'#5b9e70','Inspector cap has a green emblem');
  } finally {
    if(existing===undefined)delete globalThis.document;
    else globalThis.document=existing;
  }
});
