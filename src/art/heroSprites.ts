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

/** Hand-painted 32px crescent with folded lamination and a baked-in crumb gun. */
export function croissantSprite(pose: CroissantPose = 'idle'): HTMLCanvasElement {
  return sprite(g => {
    const aiming = pose === 'windup';
    const firing = pose === 'fire';
    const recovering = pose === 'recoil';

    // Separate little boots ground the character even during recoil.
    rect(g, 10, 25, 5, 4, C.crust);
    rect(g, 19, 25, 5, 4, C.crust);
    rect(g, 9, 28, 7, 2, C.boot);
    rect(g, 18, 28, 7, 2, C.boot);
    rect(g, 11, 26, 3, 2, C.gold);
    rect(g, 20, 26, 3, 2, C.gold);
    rect(g, 10, 29, 4, 1, C.caramel);
    rect(g, 19, 29, 4, 1, C.caramel);

    // Long, sharp, upturned crescent horns (not a round bread bun).
    shape(g, [2, 20, 1, 16, 2, 11, 4, 8, 7, 6, 9, 7,
      12, 13, 11, 19, 8, 23, 5, 25, 3, 23], C.crust);
    shape(g, [3, 19, 3, 13, 5, 10, 7, 8, 9, 11, 10, 16,
      8, 21, 6, 23, 4, 22], C.caramel);
    shape(g, [4, 16, 5, 11, 7, 10, 9, 14, 8, 19, 5, 22], C.gold);
    line(g, [4, 15, 5, 12, 7, 10], C.honey);
    rect(g, 5, 10, 2, 1, C.light);
    shape(g, [21, 13, 23, 8, 26, 6, 29, 7, 31, 11,
      31, 17, 29, 23, 26, 25, 23, 22, 21, 18], C.crust);
    shape(g, [24, 12, 26, 9, 28, 9, 30, 13, 30, 18,
      28, 22, 26, 23, 24, 20], C.caramel);
    shape(g, [27, 10, 29, 12, 29, 18, 27, 21, 26, 18], C.gold);
    line(g, [27, 10, 28, 13, 28, 16], C.honey);
    rect(g, 28, 9, 1, 2, C.light);

    // Raised, plump center: every tapered fold has its own shade.
    shape(g, [8, 17, 9, 12, 11, 9, 14, 7, 19, 7,
      22, 9, 24, 13, 25, 18, 23, 23, 20, 26,
      13, 26, 9, 23], C.crust);
    shape(g, [9, 16, 10, 12, 13, 9, 18, 8,
      21, 10, 23, 14, 23, 21, 20, 24,
      13, 24, 10, 22], C.caramel);
    shape(g, [11, 13, 14, 10, 18, 9, 21, 12,
      21, 15, 11, 17], C.gold);
    line(g, [13, 11, 16, 9, 19, 11], C.light);
    rect(g, 15, 9, 2, 1, C.flour);
    // Crisp diagonal dark seam to separate the left laminated segment.
    shape(g, [10, 13, 12, 14, 12, 18, 11, 21, 9, 22, 9, 18], C.roast);
    line(g, [11, 14, 10, 17, 10, 19], C.honey);
    // Distinct toasted fold on the right, not a featureless solid fill.
    shape(g, [20, 13, 22, 14, 23, 19, 21, 22,
      19, 22, 20, 18], C.roast);
    line(g, [20, 13, 21, 16, 21, 18], C.honey);
    shape(g, [13, 16, 17, 15, 20, 17, 20, 22,
      18, 24, 14, 24, 12, 21], C.honey);
    rect(g, 14, 15, 4, 1, C.light);
    rect(g, 12, 13, 1, 2, C.caramel);
    rect(g, 21, 12, 1, 2, C.honey);

    // Fine baked-crust crackles and a hint of flour, not visual noise.
    rect(g, 6, 19, 1, 1, C.honey);
    rect(g, 14, 11, 1, 1, C.flour);
    rect(g, 19, 11, 1, 1, C.light);
    rect(g, 23, 16, 1, 1, C.gold);
    rect(g, 16, 13, 2, 1, C.caramel);

    // Face: determined on the windup, excited in the burst, warm at rest.
    rect(g, 12, 18, 2, 1, C.cheek);
    rect(g, 21, 18, 2, 1, C.cheek);
    if (aiming) {
      line(g, [12, 17, 15, 18], C.ink);
      line(g, [19, 18, 22, 17], C.ink);
      rect(g, 16, 21, 3, 1, C.ink);
    } else {
      rect(g, 13, 16, 3, 3, C.eyes);
      rect(g, 19, 16, 3, 3, C.eyes);
      rect(g, 14, 16, 1, 3, C.ink);
      rect(g, 20, 16, 1, 3, C.ink);
      rect(g, 14, 15, 2, 1, C.caramel);
      rect(g, 19, 15, 2, 1, C.caramel);
      if (firing) {
        rect(g, 16, 20, 3, 3, C.ink);
        rect(g, 17, 22, 1, 1, C.cheek);
      } else if (recovering) {
        line(g, [15, 21, 17, 22, 19, 21], C.ink);
      } else {
        line(g, [15, 21, 17, 23, 19, 21], C.ink);
        rect(g, 16, 22, 3, 1, C.flour);
      }
    }

    // Little left arm balances the weapon stance.
    rect(g, 7, 21, 4, 2, C.roast);
    rect(g, 7, 20, 2, 3, C.honey);
    if (aiming) rect(g, 6, 18, 2, 3, C.gold);

    // Baked-in crumb blaster: a readable pastry barrel even in the idle card.
    // All of this is crust and flaky pastry, not a modern metal gun.
    const barrelY = aiming ? 16 : firing ? 18 : 19;
    rect(g, 22, 20, 4, 3, C.roast);
    rect(g, 23, 19, 4, 3, C.gold);
    rect(g, 25, barrelY, 5, 4, C.crust);
    rect(g, 26, barrelY + 1, 5, 2, C.caramel);
    rect(g, 27, barrelY, 3, 1, C.honey);
    rect(g, 30, barrelY, 2, 4, C.roast);
    rect(g, 31, barrelY + 1, 1, 2, C.light);
    rect(g, 26, barrelY + 3, 2, 2, C.gold);
    // crumb-spitting muzzle, clearly distinct from the croissant's horn.
    if (firing) {
      rect(g, 24, 22, 3, 2, C.honey);
      rect(g, 22, 24, 2, 1, C.caramel); // compressed recoil fold
    } else if (recovering) {
      rect(g, 24, 23, 3, 1, C.roast);
    } else if (aiming) {
      rect(g, 23, 17, 3, 2, C.light); // raised supporting arm
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
