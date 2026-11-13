/**
 * Original hand-authored 32x32 bakery hero sprites. Every mark is placed on
 * the pixel grid, with layered crust, highlights, scoring and facial details.
 * Gameplay, menu and collection use the same real artwork.
 */
type C = CanvasRenderingContext2D;
const INK = '#3d271b';
const C = {
  crust: '#774326', roast: '#a75b2b', caramel: '#cd843f',
  gold: '#e9ae5d', honey: '#f8cd7c', light: '#ffe9b0',
  flour: '#fff2d0', eyes: '#fffaf0', ink: '#34251c',
  cheek: '#c47b62', boot: '#684733',
} as const;
function rect(g:C,x:number,y:number,w:number,h:number,color:string):void {
  g.fillStyle=color;g.fillRect(x,y,w,h);
}
function shape(g:C,points:number[],color:string):void {
  g.fillStyle=color;g.beginPath();
  g.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);
  g.closePath();g.fill();
}
function line(g:C,coords:number[],color:string,width=1):void {
  g.strokeStyle=color;g.lineWidth=width;g.lineCap='butt';
  g.beginPath();g.moveTo(coords[0]+.5,coords[1]+.5);
  for(let i=2;i<coords.length;i+=2)g.lineTo(coords[i]+.5,coords[i+1]+.5);
  g.stroke();
}
function sprite(draw:(g:C)=>void, addOutline=true):HTMLCanvasElement {
  const canvas=document.createElement('canvas');
  canvas.width=32;canvas.height=32;
  const g=canvas.getContext('2d');
  if(!g)throw new Error('Character sprite requires 2D Canvas');
  g.imageSmoothingEnabled=false;
  draw(g);
  if(addOutline) {
    const data=g.getImageData(0,0,32,32).data;
    const occupied=(x:number,y:number)=> x>=0&&y>=0&&x<32&&y<32&&data[(y*32+x)*4+3]>0;
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      if(occupied(x,y))continue;
      if(occupied(x-1,y)||occupied(x+1,y)||occupied(x,y-1)||occupied(x,y+1))
        rect(g,x,y,1,1,INK);
    }
  }
  return canvas;
}

/**
 * Animated Croissant poses share one side-profile pastry silhouette, with no gun.
 * Timings are entirely visual; GameEngine still owns firing and damage.
 */
export type CroissantPose = 'idle' | 'windup' | 'fire' | 'recoil';

export function croissantPoseForTimer(timer: number, targetAhead: boolean): CroissantPose {
  if (timer > 1.30 && timer <= 1.4) return 'fire';
  if (timer > 1.08 && timer <= 1.30) return 'recoil';
  if (timer > 0 && timer <= .10 && targetAhead) return 'windup';
  return 'idle';
}

/**
 * This Croissant belongs to the same bakery-character family as the Royal
 * Chouquettes in royaltyArt.ts: identical honey, baked-crust, eye, cheek and
 * smile colors, chunky pixel clusters, and a soft edge instead of black ink.
 *
 * Its long upper pastry roll bends into a dangling lower curl, following the
 * user's side-view croissant reference. No separate gun, hands or legs.
 */
export const CROISSANT_ROYAL_PALETTE = {
  dark: '#8f542e',
  crust: '#aa6537',
  middle: '#d4944d',
  gold: '#efb86c',
  light: '#f8d38d',
  butter: '#f7cf86',
  toast: '#b97940',
  flour: '#fff4c6',
  eye: '#49342e',
  smile: '#aa694e',
  cream: '#fff5de',
  cheek: '#e9957f',
} as const;

/** Rounded side-view Croissant, rendered in the exact 32px Royal style. */
export function croissantSprite(pose: CroissantPose = 'idle'): HTMLCanvasElement {
  return sprite(g => {
    const P = CROISSANT_ROYAL_PALETTE;
    // Outer shadow: a rounded arch curving right, with the pastry tail
    // hanging beneath the left roll. This is NOT a front-facing bun.
    for (const [x,y,w,h] of [
      [12,5,9,2], [9,7,16,2], [6,9,21,3], [4,12,25,3],
      [3,15,25,2], [3,17,16,5], [4,22,14,4],
      [6,26,11,2], [8,28,7,2],
    ]) rect(g,x,y,w,h,P.dark);

    // The same stacked warm blocks that build every Royal Chouquette.
    for (const [x,y,w,h] of [
      [13,6,8,2], [10,8,15,3], [7,10,19,4], [5,13,22,3],
      [4,16,15,5], [5,21,12,4], [7,25,9,2], [9,27,6,2],
    ]) rect(g,x,y,w,h,P.crust);
    for (const [x,y,w,h] of [
      [13,7,6,2], [10,9,12,4], [7,12,17,4], [5,15,13,5],
      [6,19,10,6], [8,24,7,3], [10,27,4,1],
    ]) rect(g,x,y,w,h,P.middle);

    // Golden top roll and plump lower curl, NOT neon yellow flat fills.
    rect(g,12,9,9,3,P.gold);
    rect(g,8,13,15,3,P.gold);
    rect(g,6,16,11,3,P.gold);
    rect(g,7,20,8,4,P.gold);
    rect(g,9,24,6,2,P.gold);
    rect(g,14,8,6,2,P.light);
    rect(g,9,13,7,2,P.light);
    rect(g,7,17,4,2,P.light);
    rect(g,8,21,5,2,P.light);
    rect(g,9,25,4,1,P.light);

    // Separate flaky right tip, sweeping forward to fire real crumbs.
    rect(g,24,11,3,2,P.gold);
    rect(g,26,13,2,2,P.middle);
    rect(g,28,14,2,1,P.toast);

    // Bold rolled folds: two upper seams plus the baked lower bands.
    rect(g,14,9,2,5,P.toast);
    rect(g,15,10,1,3,P.dark);
    rect(g,21,11,2,4,P.toast);
    rect(g,21,11,1,3,P.dark);
    rect(g,6,19,9,2,P.crust);
    rect(g,7,20,7,1,P.toast);
    rect(g,8,24,7,2,P.toast);

    // Royal Chouquette glints and tiny buttery flakes.
    rect(g,11,9,1,1,P.flour);
    rect(g,18,9,2,1,P.flour);
    rect(g,9,17,2,1,P.flour);
    rect(g,10,22,2,1,P.butter);
    rect(g,25,13,1,1,P.light);

    // Tiny Royal-style expression, with the exact royal eye/cheek colors.
    // The face lives on the thick curved lower roll, inside the silhouette.
    rect(g,7,18,2,pose === 'windup' ? 1 : 2,P.eye);
    rect(g,13,18,2,pose === 'windup' ? 1 : 2,P.eye);
    rect(g,5,20,2,2,P.cheek);
    rect(g,15,20,2,2,P.cheek);
    if (pose === 'fire') {
      // Determined little Royal face, startled by its own crumb volley.
      rect(g,10,21,2,2,P.eye);
      rect(g,10,22,1,1,P.cream);
    } else if (pose === 'windup') {
      rect(g,10,21,3,1,P.smile);
      rect(g,9,17,2,1,P.toast);
    } else {
      rect(g,10,21,3,1,P.smile);
      rect(g,11,22,2,1,P.cream);
    }

    // Recoil only changes the croissant tip's baked shading: never adds
    // a firearm or another silhouette that makes the pastry unrecognizable.
    if (pose === 'windup') rect(g,26,13,2,1,P.light);
    if (pose === 'fire') {
      rect(g,27,13,2,1,P.flour);
      rect(g,29,14,1,1,P.light);
    }
    if (pose === 'recoil') rect(g,26,13,2,2,P.toast);
  }, false);
}

/** A broad, scored, sturdy whole loaf. Separate identity from future Baguette. */
export function loafSprite(guard=false):HTMLCanvasElement {
  return sprite(g=>{
    rect(g,8,25,5,5,C.crust);rect(g,19,25,5,5,C.crust);
    rect(g,7,28,7,3,C.boot);rect(g,18,28,7,3,C.boot);
    rect(g,9,26,3,2,C.gold);rect(g,20,26,3,2,C.gold);
    shape(g,[6,16,3,18,2,21,4,24,8,23],C.crust);
    shape(g,[24,16,28,17,30,21,29,24,26,24],C.crust);
    // Full bread-loaf silhouette: broad, low and gently domed at the top.
    shape(g,[4,13,5,9,7,7,10,5,21,5,25,7,27,10,28,14,28,23,25,26,7,26,4,23],C.crust);
    shape(g,[5,13,7,9,10,7,21,7,25,10,26,13,26,23,24,24,8,24,6,23],C.caramel);
    rect(g,5,15,3,8,C.roast);rect(g,24,14,3,9,C.roast);
    rect(g,8,23,17,3,C.roast);rect(g,10,24,13,2,C.crust);
    shape(g,[7,12,8,9,12,7,20,7,24,10,25,13,24,15,7,15],C.gold);
    shape(g,[9,11,12,8,20,8,23,11,23,13,9,13],C.honey);
    line(g,[10,10,14,8,19,8],C.light,2);
    // Three scored cuts and individual crust highlights.
    line(g,[10,10,12,12,13,13],C.roast,2);
    line(g,[15,9,17,11,18,12],C.roast,2);
    line(g,[21,10,23,12],C.roast,2);
    line(g,[11,9,12,10],C.flour);
    line(g,[16,8,18,9],C.light);
    line(g,[22,9,23,10],C.light);
    // Warm crumb-colored front, gentle flour pores and a determined face.
    shape(g,[9,15,23,15,24,19,23,23,9,23,8,20],C.gold);
    rect(g,10,16,13,6,C.honey);
    rect(g,10,20,1,1,C.caramel);rect(g,21,21,1,1,C.caramel);
    rect(g,11,13,1,1,C.flour);rect(g,20,14,1,1,C.light);
    rect(g,11,16,4,1,C.crust);rect(g,18,16,4,1,C.crust);
    rect(g,12,17,3,3,C.eyes);rect(g,18,17,3,3,C.eyes);
    rect(g,13,17,1,3,C.ink);rect(g,19,17,1,3,C.ink);
    rect(g,12,20,2,1,C.cheek);rect(g,20,20,2,1,C.cheek);
    rect(g,15,21,4,1,C.ink);
    rect(g,3,20,5,3,C.honey);rect(g,25,20,5,3,C.gold);
    rect(g,3,22,4,2,C.caramel);rect(g,26,22,4,2,C.caramel);
    if(guard){
      // Bracing pose while a Hooman pushes against the loaf.
      rect(g,3,16,5,3,C.honey);rect(g,25,16,5,3,C.honey);
      rect(g,1,18,5,3,C.caramel);rect(g,27,18,5,3,C.caramel);
      rect(g,9,21,2,1,C.crust);rect(g,22,21,2,1,C.crust);
    }else rect(g,9,13,2,1,C.light);
  });
}
