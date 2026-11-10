import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  TITLE_WINDOW, TITLE_HOOMAN_COUNT, titleHoomanPose
} from '../dist/art/titleHoomans.js';

test('the three Hoomans retain distinct readable positions in the bakery window', () => {
  assert.equal(TITLE_HOOMAN_COUNT,3);
  const positions=Array.from({length:3},(_,i)=>titleHoomanPose(2,i));
  assert.deepEqual(positions.map(p=>p.kind),['walk','jog','critic']);
  assert.deepEqual(positions.map(p=>p.role),['hungry','impatient','critic']);
  assert.ok(positions[0].x < positions[1].x && positions[1].x < positions[2].x);
  for(const pose of positions){
    assert.ok(pose.x >= TITLE_WINDOW.x-2 && pose.x+pose.size <= TITLE_WINDOW.x+TITLE_WINDOW.width+4);
    assert.ok(pose.y >= TITLE_WINDOW.y && pose.y+pose.size <= TITLE_WINDOW.y+TITLE_WINDOW.height);
  }
});

test('a waiting Hooman stops walking instead of marching forever', () => {
  const waiting=titleHoomanPose(2,0);
  assert.equal(waiting.reaction,'watch');
  assert.equal(waiting.frame,0);
  const peer=titleHoomanPose(4,0);
  assert.equal(peer.reaction,'peer');
  assert.equal(peer.frame,0);
  const knock=titleHoomanPose(6.1,0);
  assert.equal(knock.reaction,'gesture');
  assert.ok(knock.gestureFrame > 0);
  assert.equal(knock.frame,0);
  const leaving=titleHoomanPose(11.5,0);
  assert.equal(leaving.reaction,'leave');
  const approaching=titleHoomanPose(0.5,0);
  assert.equal(approaching.reaction,'approach');
  assert.ok(approaching.x >= waiting.x);
  assert.deepEqual(titleHoomanPose(0,0),titleHoomanPose(12,0));
});

test('Hooman animation is deterministic, grounded, staggered and robust to bad times', () => {
  for(const time of [0,.2,1.5,3.8,4.4,5.9,7.1,10.2,54,6000,NaN,Infinity,-200]){
    const poses=Array.from({length:3},(_,i)=>titleHoomanPose(time,i));
    for(const p of poses){
      assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
      assert.ok(p.frame===0 || p.frame===1);
      assert.ok(['approach','watch','peer','gesture','leave'].includes(p.reaction));
      assert.ok(p.gestureFrame>=0&&p.gestureFrame<=2);
      // Feet rest on a fixed pavement baseline, never a vertical sine wave.
      const stationary=titleHoomanPose(0,p.kind==='walk'?0:p.kind==='jog'?1:2);
      assert.equal(p.y,stationary.y);
    }
    const actions=new Set(poses.map(x=>x.reaction));
    if(time===0) assert.ok(actions.size>1,'the Hoomans should not synchronize');
  }
  assert.throws(()=>titleHoomanPose(0,3),RangeError);
});

test('title renderer clips the crowd to the window and keeps gameplay sprites unchanged',()=>{
  const renderer=readFileSync(new URL('../dist/art/bakeryScene.js',import.meta.url),'utf8');
  assert.ok(renderer.includes('titleHoomanPose('));
  assert.ok(renderer.includes('c.clip()'));
  assert.ok(renderer.includes('c.restore()'));
  assert.ok(renderer.includes('pose.kind+pose.frame'));
  assert.ok(!renderer.includes('const crowd='));
  assert.ok(renderer.includes("pose.role==='impatient'"));
  assert.ok(renderer.includes("pose.role==='hungry'"));
  assert.ok(renderer.includes("pose.reaction==='peer'"));
  assert.ok(renderer.includes('rgba(255,251,230'));
});
