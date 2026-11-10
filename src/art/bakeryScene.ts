import type { SpriteAtlas } from './render.js';

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
  c.globalAlpha=.3;
  for(let i=0;i<5;i++){
    const x=227+i*17,y=84+(i%2)*5;
    px(c,x+4,y,9,11,'#364b43');px(c,x+1,y+10,15,22,'#364b43');
  }
  c.globalAlpha=1;

  // Existing real human sprites, switching the real gameplay walking frames.
  const crowd=[
    {name:'walk',x:221+Math.sin(t*.7)*3,y:88+Math.sin(t*2)*1.2,size:31,speed:2.1},
    {name:'jog',x:254+Math.sin(t*.92+2)*4,y:82+Math.sin(t*3)*2,size:35,speed:3.1},
    {name:'critic',x:279+Math.sin(t*.55+1)*2,y:86+Math.sin(t*1.8),size:33,speed:1.7}
  ];
  for(const h of crowd)actor(c,atlas,h.name+(Math.floor(t*h.speed)%2),h.x,h.y,h.size);
  // Window mullions and subtle reflections over the crowd.
  px(c,249,33,4,96,'#3b574a');px(c,250,36,1,89,'#d6d5b5');
  px(c,217,71,97,3,'#395849');px(c,220,72,92,1,'#e4d7af');
  px(c,232,40,1,20,'rgba(255,251,230,.4)');
  px(c,236,41,1,13,'rgba(255,251,230,.2)');
  px(c,301,42,1,16,'rgba(255,251,230,.4)');

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
  px(c,25,150,43,4,'rgba(33,29,23,.32)');
  px(c,74,153,28,3,'rgba(33,29,23,.3)');
  actor(c,atlas,'baguette',5,120+Math.sin(t*1.3)*1.2,31);
  actor(c,atlas,'croissant',22,101+Math.sin(t*1.7)*1.7,49);
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
