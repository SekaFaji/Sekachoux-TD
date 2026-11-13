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
 * Reference-led side profile, not a character with crescent horns.
 * The horizontal laminated crown bends around into a vertical left-hand tail.
 * No arms, feet or gun: its tiny face is drawn inside the lower curl.
 * Rows are left/right extents of filled pixels in a 29x27 reference grid.
 */
export const CROISSANT_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [10,18], [9,20], [7,22], [6,24], [5,25], [4,26], [3,27],
  [3,27], [2,28], [2,28], [2,28], [2,28], [2,21], [2,18],
  [2,17], [2,16], [2,15], [2,14], [2,14], [3,14], [3,13],
  [4,13], [5,13], [6,12], [7,12], [8,12], [9,11],
];

const CROISSANT_COLORS = {
  // Butter's outline and facial tones, with a warmer toasted-pastry body.
  outline: '#2b1608',
  shadow: '#845b38',
  toast: '#b3681f',
  caramel: '#d99a3b',
  gold: '#e9ae4e',
  butter: '#ffd36c',
  light: '#ffe493',
  highlight: '#fff4b9',
  eye: '#514234',
  smile: '#845b38',
  cheek: '#d97868',
} as const;

/**
 * Butter-family Croissant. Preserve the supplied side-view croissant profile
 * while using Butter Block's soft chocolate outline, chunky golden shading,
 * two readable folded bands and a tiny sweet face on the hanging pastry.
 * No arms, feet or idle weapon; the tip itself launches crumb projectiles.
 */
export function croissantSprite(pose: CroissantPose = 'idle'): HTMLCanvasElement {
  return sprite(g => {
    const spans = CROISSANT_PROFILE;
    for (let y = 0; y < spans.length; y++) {
      const [left, right] = spans[y];
      for (let x = left; x <= right; x++) {
        const above = y > 0 ? spans[y - 1] : null;
        const below = y < spans.length - 1 ? spans[y + 1] : null;
        const edge = x === left || x === right || !above || !below ||
          x < above[0] || x > above[1] || x < below[0] || x > below[1];

        // The Butter Block uses broad blocks of yellow with warm side shadow:
        // use exactly that rendering language on a gently toasted crust.
        let color: string = CROISSANT_COLORS.caramel;
        if (y <= 3 || x >= 11 && y <= 10) color = CROISSANT_COLORS.gold;
        if (x >= 8 && x <= 19 && y >= 4 && y <= 12) color = CROISSANT_COLORS.butter;
        if (x >= 5 && x <= 12 && y >= 12 && y <= 23) color = CROISSANT_COLORS.butter;
        if (x >= 12 && x <= 18 && y >= 3 && y <= 8) color = CROISSANT_COLORS.light;
        if (x >= 6 && x <= 10 && y >= 15 && y <= 21) color = CROISSANT_COLORS.light;
        if (x >= 23 && y >= 5 && y <= 10) color = CROISSANT_COLORS.gold;
        if (x <= 4 && y >= 11 || x >= 24 && y >= 9) color = CROISSANT_COLORS.toast;

        // Two big pastry folds along the upper roll, and two on the lower
        // curl. Crisp warm shadow instead of the previous harsh black lines.
        const upperFold = (x === 12 && y >= 4 && y <= 10) ||
          (x === 21 && y >= 4 && y <= 9);
        const lowerFold = (y === 14 && x >= 4 && x <= 12) ||
          (y === 23 && x >= 7 && x <= 11);
        if (upperFold || lowerFold) color = CROISSANT_COLORS.shadow;

        // Keep the shooting pose contained inside the pastry silhouette.
        if (!edge && x >= 24 && y >= 8 && y <= 11) {
          if (pose === 'windup') color = CROISSANT_COLORS.light;
          if (pose === 'fire') color = CROISSANT_COLORS.highlight;
          if (pose === 'recoil') color = CROISSANT_COLORS.shadow;
        }
        if (edge) color = CROISSANT_COLORS.outline;
        rect(g, x + 1, y + 2, 1, 1, color);
      }
    }

    // Butter-like highlight clusters: one on the crown, one on the curled
    // tail. Both are fully inside the original croissant silhouette.
    rect(g, 14, 7, 3, 2, CROISSANT_COLORS.highlight);
    rect(g, 7, 16, 3, 1, CROISSANT_COLORS.highlight);

    // Same tiny eye and blush colors as Butter Block. Place the face on the
    // thick lower curl, without changing the unmistakable croissant outline.
    rect(g, 6, 19, 2, pose === 'windup' ? 1 : 2, CROISSANT_COLORS.eye);
    rect(g, 11, 19, 2, pose === 'windup' ? 1 : 2, CROISSANT_COLORS.eye);
    rect(g, 5, 22, 1, 1, CROISSANT_COLORS.cheek);
    rect(g, 13, 22, 1, 1, CROISSANT_COLORS.cheek);
    if (pose === 'fire') {
      rect(g, 9, 22, 2, 2, CROISSANT_COLORS.smile);
      rect(g, 9, 23, 1, 1, CROISSANT_COLORS.highlight);
    } else {
      rect(g, 8, 22, 3, 1, CROISSANT_COLORS.smile);
      rect(g, 9, 23, 1, 1, CROISSANT_COLORS.smile);
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
