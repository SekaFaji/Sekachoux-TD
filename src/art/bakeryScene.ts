import type { SpriteAtlas } from './render.js';

/**
 * Original art for a welcoming bakery storefront and its attached recipe-board menu.
 * A painted 480x270 pixel diorama is scaled using nearest-neighbour interpolation.
 * All interactive wording and controls live in HTML above the scenery.
 */
export function drawBakeryScene(canvas: HTMLCanvasElement, sprites: SpriteAtlas): void {
  const g = canvas.getContext('2d');
  if (!g) throw new Error('Bakery menu canvas unavailable');
  canvas.width = 480;
  canvas.height = 270;
  g.imageSmoothingEnabled = false;
  const r = (x: number,y: number,w: number,h: number,color: string): void => {
    g.fillStyle=color; g.fillRect(x,y,w,h);
  };
  const edge=(x:number,y:number,w:number,h:number,dark:string,light:string,face:string):void=>{
    r(x,y,w,h,dark);r(x+3,y+3,w-6,h-6,face);
    r(x+4,y+4,w-8,2,light);r(x+4,y+4,2,h-8,light);
  };
  const diamond=(x:number,y:number,color:string):void=>{
    r(x,y+2,7,3,color);r(x+2,y,3,7,color);
  };

  // Soft mint-and-ivory painted plaster with warm bakery light from the window.
  for(let y=0;y<270;y++){
    const t=y/270;
    r(0,y,480,1,'rgb('+Math.round(233-33*t)+','+Math.round(239-27*t)+','+Math.round(222-24*t)+')');
  }
  for(let y=28;y<224;y+=29){
    for(let x=0;x<480;x+=48){
      const offset=(Math.floor(y/29)%2)*24;
      r(x+offset,y,23,1,'#d4dfd0');
      r(x+offset+17,y+1,1,6,'#dae2d6');
    }
  }
  // Raised structural beams, sage trim and a blush-copper molding.
  r(0,0,480,13,'#385a4b'); r(0,11,480,4,'#729e84');r(0,15,480,2,'#d3ad79');
  r(0,77,480,5,'#476c5b');r(0,81,480,2,'#ddbd87');
  r(0,226,480,8,'#395849');r(0,233,480,3,'#d39b69');
  for(const x of [0,295,476]){
    r(x,18,4,214,'#547766');r(x+1,20,1,206,'#a9c4a8');
    for(let y=90;y<229;y+=42) r(x,y,4,2,'#d9b386');
  }

  // Main sign: a hanging bakery-style porcelain plaque.
  r(45,12,2,13,'#866b4d');r(255,12,2,13,'#866b4d');
  edge(17,23,270,54,'#3a594a','#f8e4b8','#eef1da');
  r(23,29,258,42,'#fff8e7');
  r(25,31,254,2,'#f9e4be');r(25,67,254,1,'#c0d8c5');
  for(const x of [25,275]) for(const y of [30,65])diamond(x,y,'#d6a466');
  r(20,74,264,2,'#bd885f');
  // Small crest which doesn't interfere with the live title text.
  r(34,39,12,1,'#a9c8b1');r(39,35,2,11,'#a9c8b1');
  r(255,39,12,1,'#a9c8b1');r(260,35,2,11,'#a9c8b1');

  // Wide arched shop window: softly lit shelves and street beyond.
  edge(15,93,270,127,'#4a6c5c','#e9cb95','#f1d6a7');
  for(let y=101;y<209;y++){
    const t=(y-101)/108;
    r(23,y,254,1,'rgb('+Math.round(150+38*t)+','+Math.round(199+20*t)+','+Math.round(189-9*t)+')');
  }
  // Glowing distant skyline, planter silhouettes.
  r(24,163,252,45,'#bad0b1');
  for(const [x,y,w] of [[27,151,37],[77,137,49],[139,158,37],[195,143,42],[244,153,34]] as const){
    r(x,y,w,166-y,'#d1d4bb');r(x+3,y+4,w-6,3,'#e9dcc1');
  }
  for(const x of [32,71,194,249]){
    r(x,153,3,46,'#5a7d64');
    for(let i=0;i<5;i++){r(x-7+i*2,140+i%2*5,21-i*3,7,'#81ae87');}
  }
  // A bright red-and-cream bakery awning, with careful restrained highlights.
  r(11,90,278,12,'#c77862');
  for(let i=0;i<18;i++){
    const x=12+i*15;
    r(x,92,8,10,i%2===0?'#f8efde':'#b85d4b');
    r(x,101,8,3,i%2===0?'#e6dfd1':'#a24b40');
  }
  r(11,89,278,2,'#fff9e7');r(11,104,278,2,'#8c6455');
  // Mullions anchor the window and show reflections without visual noise.
  r(95,106,5,105,'#5c7b67');r(101,108,1,100,'#e3f4e1');
  r(188,106,5,105,'#5c7b67');r(194,108,1,100,'#e3f4e1');
  r(24,165,252,4,'#6d927d');r(24,166,252,1,'#e1efd5');
  r(37,109,3,45,'#fff8f0a8');r(43,109,1,36,'#fff8f0');
  r(214,109,2,31,'#fff8f0a8');r(219,109,1,25,'#fff8f0');

  // A glass pastry showcase: shelves, crisp copper frames and plump pastries.
  r(28,175,244,49,'#526f64');
  r(32,180,236,38,'#e5ebd9');
  r(35,183,229,30,'#a8c4b7');
  r(38,187,222,23,'#d6e9db');
  for(const [x,kind,size] of [[45,'croissant',37],[92,'butter',35],[137,'baguette',35],[178,'pretzel',37],[220,'pie',36]] as const){
    r(x-3,204,42,4,'#a77a52');
    g.drawImage(sprites.images[kind],x,170,size,size);
  }
  r(32,212,237,3,'#fff4db');r(32,215,237,4,'#789c8d');
  r(29,181,4,40,'#d8e7da');r(267,181,4,40,'#648879');
  r(51,180,1,31,'#ffffff88');r(54,184,1,27,'#f4faf0');
  r(154,179,1,35,'#ffffff6a');
  // Painted base cabinets with antique brass handles and a clear customer nameplate.
  r(12,222,281,48,'#395648');r(17,226,272,44,'#628876');
  r(19,227,269,4,'#d4b28c');
  for(let i=0;i<3;i++){
    const x=24+i*87;
    edge(x,236,79,31,'#355247','#9fbc9d','#537865');
    r(x+33,247,13,2,'#e3b57b');
    r(x+37,244,5,7,'#f8dba3');
  }
  // Small hand-painted flour sacks and spatula on the counter rim.
  r(7,239,18,25,'#f5e9d4');r(9,236,14,5,'#fff8ea');
  r(8,263,17,2,'#b9af9b');r(13,242,1,11,'#c9ac85');
  r(279,240,10,24,'#ead8bb');r(281,237,6,4,'#f7ecd2');
  r(279,263,10,2,'#b6a281');

  // The menu board is a fixture attached to the shop wall, not a floating pop-up.
  // Button positions are controlled in CSS and sit within this painted frame.
  r(298,51,180,207,'#304b40');r(301,54,174,201,'#caab80');
  r(306,59,164,190,'#466d5c');r(309,62,158,184,'#243f35');
  r(312,65,152,178,'#304b40');
  r(314,67,148,1,'#749782');
  r(315,238,146,2,'#426858');
  for(const [x,y] of [[302,56],[469,56],[302,251],[469,251]] as const){
    r(x,y,5,5,'#e5b672');r(x+1,y+1,2,2,'#fff1bb');
  }
  // A chalk sprig and tiny oven-mitt decorations set this apart from generic menu boxes.
  for(let i=0;i<5;i++){
    r(320+i*2,78-i*2,2,2,'#a3c5a7');
    r(325+i*3,80+i*2,2,2,'#d0dbc1');
  }
  for(let i=0;i<5;i++){
    r(438+i*2,77+i,2,2,'#b8d3ac');r(450-i*2,79+i,2,2,'#d7e4c8');
  }
  // No labels are burned into the canvas: buttons remain keyboard-friendly HTML.
}
