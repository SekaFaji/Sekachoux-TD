import type { SpriteAtlas } from './render.js';
import { titleHoomanPose, TITLE_HOOMAN_COUNT, TITLE_WINDOW } from './titleHoomans.js';

/**
 * Sekampfire-style living title scene using the SAME sprite atlas as battles.
 * The canvas contains scenery and characters only; readable menu controls
 * are real HTML buttons above it. 320x180 logical pixels, landscape 16:9.
 */
export const TITLE_WIDTH = 320;
export const TITLE_HEIGHT = 180;
type Ctx = CanvasRenderingContext2D;
function px(c: Ctx,x:number,y:number,w:number,h:number,color:string):void {
  c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function light(c:Ctx,x:number,y:number,radius:number,alpha:number):void {
  const grad=c.createRadialGradient(x,y,0,x,y,radius);
  grad.addColorStop(0,'rgba(255,169,74,'+alpha+')');
  grad.addColorStop(1,'rgba(255,169,74,0)');
  c.fillStyle=grad;c.fillRect(x-radius,y-radius,radius*2,radius*2);
}
function actor(c:Ctx,atlas:SpriteAtlas,id:string,x:number,y:number,size:number):void {
  const image=atlas.images[id];
  if(image)c.drawImage(image,Math.round(x),Math.round(y),size,size);
}
export function drawBakeryTitleScene(canvas:HTMLCanvasElement,atlas:SpriteAtlas,time:number):void {
  if(canvas.width!==TITLE_WIDTH)canvas.width=TITLE_WIDTH;
  if(canvas.height!==TITLE_HEIGHT)canvas.height=TITLE_HEIGHT;
  const c=canvas.getContext('2d');
  if(!c)throw new Error('Bakery title canvas not supported');
  c.imageSmoothingEnabled=false;
  const t=Number.isFinite(time)?Math.max(0,time):0;
  const warm=.5+.5*Math.sin(t*2.7);
  c.clearRect(0,0,TITLE_WIDTH,TITLE_HEIGHT);

  // A softly lit real bakery, using the game's sage/stone/copper palette.
  const wall=c.createLinearGradient(0,0,0,142);
  wall.addColorStop(0,'#243d3a');wall.addColorStop(.62,'#506b5e');wall.addColorStop(1,'#91785f');
  c.fillStyle=wall;c.fillRect(0,0,320,142);
  for(let y=22;y<139;y+=19){
    px(c,0,y,320,1,'rgba(237,219,190,.11)');
    for(let x=((Math.floor(y/19)%2)*22);x<320;x+=44)px(c,x,y+1,1,8,'rgba(237,219,190,.09)');
  }
  px(c,0,0,320,6,'#2a483e');px(c,0,6,320,2,'#9ab09a');
  px(c,0,37,320,3,'#466757');px(c,0,39,320,1,'#d5ab77');

  // The Hoomans wait outside a real window; they are not pasted art.
  px(c,214,29,101,104,'#2c433c');px(c,218,33,93,96,'#b6a27c');
  const sky=c.createLinearGradient(0,35,0,126);
  sky.addColorStop(0,'#638c95');sky.addColorStop(.7,'#a8b9a8');sky.addColorStop(1,'#e1af84');
  c.fillStyle=sky;c.fillRect(222,36,85,88);
  light(c,291,53,34,.28);
  for(const [x,y,w] of [[225,91,17],[242,86,13],[261,98,24],[292,92,15]]){
    px(c,x,y,w,126-y,'#839786');px(c,x+3,y+4,w-6,2,'#a3b6a1');
  }
  // Hoomans are outside the glass. Clip all actors to the window opening,
  // let their feet rest on the same sill and only animate walk frames while
  // approaching or moving off. No more perpetual jogging in place.
  c.save();
  c.beginPath();
  c.rect(TITLE_WINDOW.x, TITLE_WINDOW.y, TITLE_WINDOW.width, TITLE_WINDOW.height);
  c.clip();

  // Two distant customers, understated behind the three recognizable sprites.
  c.globalAlpha=.18;
  for(const [sx,sy] of [[239,91],[292,89]]){
    px(c,sx+3,sy,7,10,'#394d48');
    px(c,sx,sy+10,13,16,'#394d48');
  }
  c.globalAlpha=1;

  for(let index=0;index<TITLE_HOOMAN_COUNT;index++){
    const pose=titleHoomanPose(t,index);
    const x=Math.round(pose.x), y=Math.round(pose.y), size=pose.size;
    // Grounded contact shadow: it never follows an arbitrary bobbing sine.
    px(c,x+4,pose.y+size,Math.max(6,size-8),2,'rgba(38,45,40,.30)');
    actor(c,atlas,pose.kind+pose.frame,x,y,size);

    // A rare single-frame blink rather than a continuously twitching face.
    if(pose.blink){
      px(c,x+10,y+7,4,1,'#80533f');
      px(c,x+16,y+7,4,1,'#80533f');
    }
    if(pose.reaction==='peer'){
      // Small breath against the glass as a customer leans closer.
      c.globalAlpha=.40;
      px(c,x+13,y+14,4,2,'#eff5df');
      px(c,x+12,y+13,1,2,'#f6f4e5');
      px(c,x+18,y+14,1,1,'#f5f1d7');
      c.globalAlpha=1;
    }
    if(pose.reaction==='gesture' && pose.gestureFrame>0){
      if(pose.role==='impatient'){
        // Short impatient knock, with a single-pixel impact sparkle.
        const handY=y+14-(pose.gestureFrame===2?3:0);
        px(c,x+size-3,handY,4,4,'#f2bb93');
        px(c,x+size-1,handY+1,2,1,'#ffe2c7');
        if(pose.gestureFrame===2){
          px(c,x+size+2,handY-2,1,3,'#fff2c7');
          px(c,x+size+2,handY+3,1,2,'#fff2c7');
        }
      }else if(pose.role==='hungry'){
        // The hungry customer points at the pastries.
        px(c,x+size-4,y+16,6,2,'#edb38c');
        px(c,x+size+1,y+15,2,2,'#fff3de');
      }else{
        // The critic checks a tiny paper order instead of marching on spot.
        px(c,x-3,y+15,8,10,'#665145');
        px(c,x-2,y+16,6,8,'#f2e9d8');
        px(c,x-1,y+18,4,1,'#ba9d78');
        px(c,x-1,y+21,3,1,'#ba9d78');
      }
    }
  }
  c.restore();

  // Window rails in the foreground make the three real Hoomans appear
  // behind glass, with separate readable panes instead of overlapping faces.
  for(const mullion of [249,278]){
    px(c,mullion,33,3,96,'#3b574a');
    px(c,mullion+1,36,1,89,'#d6d5b5');
  }
  px(c,217,71,97,3,'#395849');
  px(c,220,72,92,1,'#e4d7af');
  px(c,219,122,93,4,'#334b41');
  px(c,221,122,89,1,'#e6d6aa');
  // Sparse glints are fixed to the pane, not glued to moving sprites.
  px(c,233,39,1,17,'rgba(255,251,230,.35)');
  px(c,236,42,1,11,'rgba(255,251,230,.22)');
  px(c,302,44,1,12,'rgba(255,251,230,.30)');

  // Working oven at left. Flickering flame gives the same calm atmosphere
  // as Sekampfire's campfire without using its setting or copied art.
  px(c,8,59,92,77,'#594a3c');px(c,11,62,86,71,'#c6a078');
  for(let y=65;y<133;y+=11){
    px(c,12,y,83,1,'#a47758');
    for(let x=15+(Math.floor(y/11)%2)*13;x<94;x+=24)px(c,x,y+2,1,8,'#b48b68');
  }
  for(let i=0;i<14;i++){
    const half=Math.round(26+9*Math.sin((i/14)*Math.PI));
    px(c,54-half,93-i,half*2,1,'#674739');
  }
  px(c,27,93,54,35,'#423127');px(c,31,101,47,25,'#221d1d');
  light(c,55,111,49,.20+warm*.11);
  for(let i=0;i<5;i++){
    const flicker=Math.round(Math.sin(t*4+i*1.3)*2);
    const x=35+i*9, y=121+flicker, ht=8+(i*3)%9;
    px(c,x,y-ht,6,ht,'#c46a33');
    px(c,x+1,y-ht+3,4,ht-3,'#f3a549');
    px(c,x+2,y-ht+6,2,Math.max(2,ht-6),'#ffe29a');
  }
  px(c,18,128,75,5,'#d3ae81');px(c,15,133,80,3,'#5d4738');
  px(c,108,62,3,78,'#405b51');px(c,111,65,1,70,'#78988a');

  // Bakery counter, wood grain and warm pastry-ready cloth.
  px(c,0,136,320,6,'#4c4e3d');px(c,0,138,320,3,'#e2b986');
  px(c,0,141,320,39,'#785643');px(c,0,142,320,2,'#c19a70');
  for(let y=155;y<180;y+=13){
    px(c,0,y,320,1,'#5b4034');
    for(let x=8+(Math.floor(y/13)%2)*24;x<320;x+=48)px(c,x,y+1,1,10,'#916c51');
  }
  // Small contact shadows and shared in-game actor sprites, no fake mascots.
  px(c,10,155,24,3,'rgba(33,29,23,.28)');
  px(c,36,150,31,3,'rgba(33,29,23,.32)');
  px(c,74,153,28,3,'rgba(33,29,23,.3)');
  actor(c,atlas,'loaf',5,120+Math.sin(t*1.3)*1.2,31);
  // Keep the menu Croissant near Butter's footprint, not 49px tall.
  // This affects title-scene presentation only, not the 32px game sprite.
  actor(c,atlas,'croissant',35,115+Math.sin(t*1.7)*1.7,35);
  actor(c,atlas,'butter',72,120+Math.sin(t*2+1.8)*1.5,36);
  actor(c,atlas,'pin',92,140+Math.sin(t*1.1)*.5,21);

  // Low-key flour motes and floating embers, deterministic calm loops.
  for(let i=0;i<9;i++){
    const x=8+((i*37+Math.sin(t*.42+i*1.4)*5+320)%300);
    const y=47+((i*14-t*(4+i%3)+3000)%79);
    c.globalAlpha=.20+.23*Math.sin(t+i)**2;
    px(c,x,y,1,1,i%3===0?'#ffd397':'#ffeed1');
  }
  c.globalAlpha=1;
  const shade=c.createLinearGradient(0,0,0,180);
  shade.addColorStop(0,'rgba(9,23,22,.17)');
  shade.addColorStop(.52,'rgba(9,23,22,0)');
  shade.addColorStop(1,'rgba(10,16,18,.31)');
  c.fillStyle=shade;c.fillRect(0,0,320,180);
}
