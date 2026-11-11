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

/** Golden crescent, layered laminated dough, brave little face and feet. */
export function croissantSprite(attack=false):HTMLCanvasElement {
  return sprite(g=>{
    // Feet, tucked under a puffy center.
    rect(g,9,24,4,5,C.crust);rect(g,19,24,4,5,C.crust);
    rect(g,8,28,6,2,C.boot);rect(g,18,28,6,2,C.boot);
    rect(g,9,25,4,2,C.honey);rect(g,19,25,4,2,C.honey);
    // The upward-curling tips identify a true croissant from a plain bun.
    shape(g,[3,21,3,16,5,11,7,9,9,8,11,11,12,16,10,21,7,24,5,24],C.crust);
    shape(g,[4,20,5,15,7,12,9,12,10,17,9,20,7,22,5,23],C.caramel);
    shape(g,[5,16,6,13,8,12,9,14,8,19,6,21],C.gold);
    line(g,[5,16,7,13],C.light,2);
    shape(g,[21,12,23,9,26,10,28,14,29,21,28,24,25,24,22,21,20,17],C.crust);
    shape(g,[23,14,24,11,26,13,28,18,28,22,26,23,24,20],C.caramel);
    line(g,[25,13,27,17,27,20],C.gold,1);
    // Puffed center and toasted edges. Separate diagonal bands show folds.
    shape(g,[9,13,10,9,13,7,19,7,22,9,24,12,24,20,22,24,18,26,13,26,9,23,8,19],C.crust);
    shape(g,[10,13,12,9,15,8,19,9,22,11,23,17,22,22,19,24,13,24,10,21,9,18],C.caramel);
    shape(g,[11,13,13,10,16,9,19,10,21,12,20,14,16,14,13,15],C.gold);
    line(g,[13,11,16,10,18,11],C.flour);
    rect(g,15,9,3,1,C.flour);
    shape(g,[10,16,13,14,15,14,13,20,11,22,9,20],C.roast);
    line(g,[10,16,12,15],C.honey);
    shape(g,[20,14,22,15,22,20,20,23,18,22,19,17],C.roast);
    line(g,[20,15,20,19],C.gold);
    shape(g,[14,15,18,15,20,18,19,23,16,24,13,22,12,19],C.honey);
    line(g,[13,17,14,16],C.flour);
    rect(g,12,13,1,2,C.caramel);rect(g,21,12,1,2,C.honey);
    // Charming but small, expressive face (not giant googly eyes).
    rect(g,13,17,3,3,C.eyes);rect(g,18,17,3,3,C.eyes);
    rect(g,14,17,1,3,C.ink);rect(g,19,17,1,3,C.ink);
    rect(g,12,20,2,1,C.cheek);rect(g,21,20,2,1,C.cheek);
    line(g,[15,22,17,23,19,22],C.ink);
    rect(g,7,21,3,2,C.honey);rect(g,23,20,3,3,C.gold);
    rect(g,7,22,2,2,C.caramel);rect(g,24,22,2,2,C.caramel);
    if(attack){
      // Short throwing animation, timed to an actual crumb projectile.
      rect(g,23,20,3,4,C.caramel);
      rect(g,24,17,3,3,C.honey);
      rect(g,26,16,2,3,C.gold);
      rect(g,29,13,2,2,C.gold);
      rect(g,29,14,1,1,C.flour);
    }else{
      rect(g,4,12,1,2,C.light);
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
