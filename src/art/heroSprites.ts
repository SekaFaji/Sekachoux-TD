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
  const data=g.getImageData(0,0,32,32).data;
  const occupied=(x:number,y:number)=> x>=0&&y>=0&&x<32&&y<32&&data[(y*32+x)*4+3]>0;
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    if(occupied(x,y))continue;
    if(occupied(x-1,y)||occupied(x+1,y)||occupied(x,y-1)||occupied(x,y+1))
      rect(g,x,y,1,1,INK);
  }
  return addOutline ? outline(canvas) : canvas;
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
 * Reference-led side profile, not a character with crescent horns.
 * The horizontal laminated crown bends around into a vertical left-hand tail.
 * No eyes, feet or weapon: the croissant itself is the entire silhouette.
 * Rows are left/right extents of filled pixels in a 29x27 reference grid.
 */
export const CROISSANT_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [10,18], [9,20], [7,22], [6,24], [5,25], [4,26], [3,27],
  [3,27], [2,28], [2,28], [2,28], [2,28], [2,21], [2,18],
  [2,17], [2,16], [2,15], [2,14], [2,14], [3,14], [3,13],
  [4,13], [5,13], [6,12], [7,12], [8,12], [9,11],
];

const CROISSANT_COLORS = {
  outline: '#1b120b',
  toasted: '#874319',
  crust: '#aa5416',
  amber: '#cd7418',
  orange: '#ee9416',
  gold: '#ffb51d',
  butter: '#ffdb39',
  highlight: '#fff052',
} as const;

/**
 * A pure, crisp pixel-grid sprite in the photographed croissant's side-view
 * orientation. Every fold stays inside the pastry mask, never on a floating
 * face or accessory. The rightmost tip provides the crumb firing origin.
 */
export function croissantSprite(pose: CroissantPose = 'idle'): HTMLCanvasElement {
  return sprite(g => {
    const spans = CROISSANT_PROFILE;
    for (let y = 0; y < spans.length; y++) {
      const [left, right] = spans[y];
      for (let x = left; x <= right; x++) {
        const top = y > 0 ? spans[y - 1] : null;
        const bottom = y < spans.length - 1 ? spans[y + 1] : null;
        const border = x === left || x === right || !top || !bottom ||
          x < top[0] || x > top[1] || x < bottom[0] || x > bottom[1];

        // Broad golden flakes and deeply baked fold bands, matching the
        // example's high-contrast orange/yellow/brown palette.
        let color: string = CROISSANT_COLORS.orange;
        if (y <= 3) color = CROISSANT_COLORS.gold;
        if (x >= 6 && x <= 12 && y >= 11) color = CROISSANT_COLORS.gold;
        if (x <= 10 && y >= 17) color = CROISSANT_COLORS.gold;
        if (x >= 10 && x <= 19 && y >= 3 && y <= 10) color = CROISSANT_COLORS.gold;
        if (x >= 13 && x <= 20 && y >= 4 && y <= 8) color = CROISSANT_COLORS.butter;
        if (x >= 4 && x <= 8 && y >= 12 && y <= 19) color = CROISSANT_COLORS.gold;
        if (x >= 6 && x <= 11 && y >= 18 && y <= 24) color = CROISSANT_COLORS.butter;
        if (x >= 9 && x <= 14 && y >= 10 && y <= 16) color = CROISSANT_COLORS.butter;
        if (x >= 6 && x <= 10 && y >= 7 && y <= 10) color = CROISSANT_COLORS.butter;

        // One vertical seam on each rolled segment plus two clear bands on
        // the hanging tail: individual folds, not noisy random pixel marks.
        if ((x === 15 || x === 16) && y >= 2 && y <= 8 ||
            (x === 21 || x === 22) && y >= 4 && y <= 9 ||
            (x === 9 || x === 10) && y >= 5 && y <= 10 ||
            (y === 16 || y === 21) && x >= 4 && x <= 13) {
          color = CROISSANT_COLORS.toasted;
        }
        if (x > 24 && y > 7) color = CROISSANT_COLORS.crust;
        if (x < 5 && y > 12 || x > 23 && y < 7) color = CROISSANT_COLORS.amber;

        // Firing changes only a few crust pixels on the right-hand tip.
        // The entire filled mask and black silhouette stay unchanged.
        if (!border && x >= 24 && y >= 8 && y <= 11) {
          if (pose === 'windup') color = CROISSANT_COLORS.butter;
          if (pose === 'fire') color = CROISSANT_COLORS.highlight;
          if (pose === 'recoil') color = CROISSANT_COLORS.toasted;
        }
        if (border) color = CROISSANT_COLORS.outline;
        rect(g, x + 1, y + 2, 1, 1, color);
      }
    }

    // Highlights in the broad front roll make it read at HUD-card size.
    if (pose === 'idle' || pose === 'windup') {
      rect(g, 13, 7, 2, 1, CROISSANT_COLORS.highlight);
      rect(g, 10, 23, 2, 1, CROISSANT_COLORS.highlight);
    }
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
