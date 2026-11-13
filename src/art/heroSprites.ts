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
function sprite(draw:(g:C)=>void):HTMLCanvasElement {
  const canvas=document.createElement('canvas');
  canvas.width=32;canvas.height=32;
  const g=canvas.getContext('2d');
  if(!g)throw new Error('Character sprite requires 2D Canvas');
  g.imageSmoothingEnabled=false;
  draw(g);
  const data=g.getImageData(0,0,32,32).data;
  const occupied=(x:number,y:number)=> x>=0&&y>=0&&x<32&&y<32&&data[(y*32+x)*4+3]>0;
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    if(occupied(x,y))continue;
    if(occupied(x-1,y)||occupied(x+1,y)||occupied(x,y-1)||occupied(x,y+1))
      rect(g,x,y,1,1,INK);
  }
  return canvas;
}

/**
 * Animated Croissant poses share the same toasted silhouette and pastry-gun.
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
 * Pastry-first silhouette: a low, wide crescent with two short curled tips.
 * Three overlapping, diagonal laminated rolls provide the croissant identity.
 * No blaster, arm or other accessory is present in the idle sprite.
 */
export function croissantSprite(pose: CroissantPose = 'idle'): HTMLCanvasElement {
  return sprite(g => {
    const winding = pose === 'windup';
    const firing = pose === 'fire';
    const recoiling = pose === 'recoil';

    // Only tiny, largely hidden feet: the pastry is always the silhouette.
    rect(g, 11, 25, 4, 3, C.roast);
    rect(g, 20, 25, 4, 3, C.roast);
    rect(g, 10, 27, 6, 2, C.boot);
    rect(g, 19, 27, 6, 2, C.boot);
    rect(g, 12, 26, 2, 1, C.gold);
    rect(g, 21, 26, 2, 1, C.gold);

    // A single unmistakable croissant outline: pointed side tips, generous
    // plump centre and an arched upper edge. No tall bull-like horns.
    shape(g, [
      1, 12, 2, 10, 4, 10, 7, 12, 9, 10, 12, 8,
      16, 7, 20, 8, 23, 10, 26, 12, 28, 10,
      30, 10, 31, 12, 31, 15, 29, 18, 26, 20,
      23, 22, 21, 25, 19, 26, 13, 26, 10, 24,
      8, 22, 5, 20, 3, 18, 1, 15,
    ], C.crust);

    // Left tapered end: its thin pointed tip curls toward the middle.
    shape(g, [
      2, 12, 4, 11, 7, 14, 9, 14, 11, 17,
      10, 21, 7, 20, 4, 17, 2, 15,
    ], C.caramel);
    shape(g, [3, 12, 5, 12, 8, 15, 9, 18, 7, 18, 4, 15], C.gold);
    line(g, [3, 12, 5, 13, 6, 14], C.honey);
    rect(g, 4, 12, 1, 1, C.light);
    shape(g, [6, 17, 9, 19, 10, 22, 8, 21, 5, 19], C.roast);

    // Right tapered end, curved back toward the central baked roll.
    shape(g, [
      23, 15, 26, 13, 29, 11, 30, 12,
      30, 15, 28, 18, 25, 20, 22, 21,
    ], C.caramel);
    shape(g, [25, 14, 28, 12, 30, 13, 29, 16, 26, 18, 23, 19], C.gold);
    line(g, [27, 13, 29, 12], C.light);
    shape(g, [23, 19, 26, 20, 28, 18, 26, 21, 23, 23], C.roast);

    // The fat central roll has its own toasted outer rim and buttery dome.
    shape(g, [
      8, 15, 9, 12, 12, 9, 16, 8, 20, 9, 23, 12,
      25, 16, 24, 21, 21, 24, 18, 25,
      13, 25, 10, 23, 8, 20,
    ], C.roast);
    shape(g, [
      9, 15, 11, 12, 14, 10, 17, 9, 20, 10,
      23, 13, 23, 20, 20, 23, 17, 24,
      13, 23, 10, 21,
    ], C.caramel);
    shape(g, [
      11, 14, 14, 11, 17, 10, 20, 11, 22, 14,
      21, 18, 12, 18,
    ], C.gold);
    shape(g, [13, 12, 16, 10, 19, 11, 21, 13, 18, 13, 15, 14], C.honey);
    line(g, [14, 11, 17, 10, 19, 11], C.light);

    // Lamination: the three rolled sections have distinct dark seams and
    // crisp butter highlights. These folds must read at native 32px size.
    shape(g, [10, 12, 12, 13, 13, 17, 12, 21, 10, 23, 9, 20], C.crust);
    line(g, [11, 12, 12, 15, 12, 18], C.roast);
    line(g, [10, 16, 10, 19], C.honey);
    shape(g, [19, 11, 21, 12, 23, 16, 23, 20, 21, 23, 19, 23, 21, 18], C.crust);
    line(g, [20, 12, 21, 15, 22, 18], C.roast);
    line(g, [23, 15, 23, 18], C.honey);
    // A small brighter fold on the rounded lower front.
    shape(g, [13, 18, 16, 17, 19, 18, 20, 21, 18, 23, 14, 23, 12, 21], C.gold);
    rect(g, 14, 18, 4, 1, C.honey);
    rect(g, 16, 13, 2, 1, C.light);
    rect(g, 15, 10, 1, 1, C.flour);

    // The face sits below the dough folds; no oversized cartoon eyes.
    rect(g, 14, 19, 2, 2, C.ink);
    rect(g, 19, 19, 2, 2, C.ink);
    rect(g, 13, 21, 1, 1, C.cheek);
    rect(g, 21, 21, 1, 1, C.cheek);
    if (firing) {
      rect(g, 17, 21, 2, 2, C.ink);
      rect(g, 17, 23, 1, 1, C.flour);
    } else if (winding) {
      rect(g, 16, 22, 3, 1, C.ink);
      rect(g, 13, 18, 3, 1, C.roast);
      rect(g, 19, 18, 3, 1, C.roast);
    } else {
      rect(g, 16, 22, 4, 1, C.ink);
      rect(g, 17, 23, 2, 1, C.flour);
    }

    // Animation changes only pastry layers, never adds a permanent gun.
    if (winding) {
      // The right point lifts slightly before launching its flaky crust.
      shape(g, [25, 13, 29, 9, 31, 9, 31, 11, 28, 14], C.gold);
      line(g, [27, 12, 29, 10], C.light);
    } else if (firing) {
      // The leading tip flicks forward; the renderer supplies flying crumbs.
      shape(g, [25, 14, 29, 12, 31, 13, 31, 16, 28, 18], C.honey);
      rect(g, 30, 14, 2, 2, C.light);
      rect(g, 29, 17, 2, 1, C.gold);
    } else if (recoiling) {
      // Dough compresses and springs back to the same recognizable shape.
      shape(g, [26, 15, 29, 13, 30, 16, 27, 19, 25, 19], C.roast);
      rect(g, 27, 15, 2, 1, C.gold);
    }
  });
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
