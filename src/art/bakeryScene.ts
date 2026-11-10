import type { SpriteAtlas } from './render.js';
import { MENU_SIZE, MENU_SLOTS } from './menuLayout.js';

/** Original bakery interior, authored at the same 480x270 resolution as the HTML hit areas. */
export function drawBakeryScene(canvas: HTMLCanvasElement, sprites: SpriteAtlas): void {
  const g = canvas.getContext('2d');
  if (!g) throw new Error('Bakery menu canvas not available');
  canvas.width = MENU_SIZE.width;
  canvas.height = MENU_SIZE.height;
  g.imageSmoothingEnabled = false;
  const r = (x: number, y: number, w: number, h: number, color: string): void => {
    g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const frame = (x: number, y: number, w: number, h: number, edge: string, face: string, light: string): void => {
    r(x,y,w,h,edge);r(x+3,y+3,w-6,h-6,face);
    r(x+4,y+4,w-8,2,light);r(x+4,y+4,2,h-8,light);
  };
  const arch = (cx:number,cy:number,rx:number,ry:number,bottom:number,color:string):void=>{
    for (let y=cy-ry;y<cy;y++){
      const hw=Math.round(rx*Math.sqrt(Math.max(0,1-Math.pow((y-cy)/ry,2))));
      r(cx-hw,y,hw*2,1,color);
    }
    r(cx-rx,cy,rx*2,bottom-cy,color);
  };

  // Warm plaster, deep green timbers and honey-brown bakery floor.
  for(let y=0;y<235;y++){
    const t=y/235;
    r(0,y,480,1,'rgb('+Math.round(248-29*t)+','+Math.round(235-30*t)+','+Math.round(208-27*t)+')');
  }
  for(let y=15;y<230;y+=23){
    r(0,y,480,1,'#e2d6c1');
    for(let x=(Math.floor(y/23)%2)*24;x<480;x+=48)r(x,y,1,10,'#e1d0b4');
  }
  r(0,0,480,12,'#314f45');r(0,11,480,3,'#8aa391');r(0,14,480,2,'#d9a96f');
  r(0,80,480,5,'#4f7662');r(0,85,480,2,'#c39b69');
  r(0,230,480,6,'#665449');r(0,235,480,35,'#997556');
  for(let y=237;y<270;y+=12){
    r(0,y,480,1,'#6d5140');
    for(let x=(Math.floor(y/12)%2)*19;x<480;x+=38)r(x,y,1,12,'#ad8d70');
    r(0,y+2,480,1,'#b5906a');
  }
  for(const x of [0,277,475]){
    r(x,16,5,217,'#395e4d');r(x+3,18,1,210,'#90b09b');
    for(let y=94;y<228;y+=35)r(x,y,4,2,'#d8b889');
  }
  r(0,228,480,4,'#385745');r(0,231,480,2,'#d8b17b');

  // Porcelain shop sign: artwork and title use a common rectangle.
  const sign=MENU_SLOTS.logo;
  r(65,14,2,10,'#74533c');r(412,14,2,10,'#74533c');
  frame(sign.x-6,sign.y-4,sign.width+12,sign.height+11,'#425f50','#fbf0d6','#fff9e8');
  r(sign.x-1,sign.y+2,sign.width+2,sign.height-1,'#fbefd8');
  r(sign.x+4,sign.y+5,sign.width-8,1,'#d4b287');
  r(sign.x+4,sign.y+sign.height-6,sign.width-8,1,'#d5bea0');
  for(const [x,y] of [[sign.x,sign.y],[sign.x+sign.width-4,sign.y],[sign.x,sign.y+sign.height-3],[sign.x+sign.width-4,sign.y+sign.height-3]]){
    r(x,y,4,4,'#c18f54');r(x+1,y+1,1,1,'#ffe6a2');
  }
  // Kitchen utensils on either side of the plaque.
  r(62,43,2,18,'#b4895a');r(60,34,6,11,'#bc9164');
  r(415,44,2,17,'#b4895a');r(410,38,13,5,'#d7a568');

  // An arched bakery oven replaces the previous static window display.
  arch(147,145,122,55,227,'#7e6250');
  arch(147,147,119,51,225,'#d8b38b');
  arch(147,149,109,46,223,'#efc8a0');
  for(let y=117;y<217;y+=14){
    r(26,y,241,2,'#ba9172');
    for(let x=33+Math.floor(y/14)%2*16;x<260;x+=33)r(x,y+2,2,12,'#d4ab85');
  }
  arch(147,151,92,34,218,'#6f4b38');
  arch(147,154,85,29,215,'#3e342e');
  arch(147,157,80,24,213,'#251f1e');
  r(74,182,146,30,'#493023');r(77,198,140,11,'#71452d');
  for(let i=0;i<9;i++){
    const x=86+i*16,h=8+i*7%12;
    r(x,208-h,7,h,'#be6b2c');
    r(x+1,206-h,4,h-2,'#f3a849');
    r(x+2,210-h,2,Math.max(1,h-7),'#ffdf80');
  }
  r(63,213,169,5,'#704d37');r(64,214,167,2,'#f3cd9a');
  r(47,221,200,8,'#b58b65');r(50,221,194,2,'#ffdcab');
  for(const [x,y] of [[62,174],[224,173],[70,155],[214,153]]){
    r(x,y,5,4,'#e19b5a');r(x+1,y,2,2,'#ffd09a');
  }
  // Flour shovel and peel alongside the kiln.
  r(27,194,6,34,'#584e41');r(25,187,10,10,'#ae8f6b');
  r(251,186,4,41,'#63594b');r(248,184,10,5,'#d9b084');
  // Pastry samples displayed on the oven's front shelf.
  r(22,226,251,6,'#4a5945');r(25,227,246,2,'#d1b081');
  for(const [kind,x] of [['croissant',38],['butter',90],['pretzel',204]] as const){
    g.drawImage(sprites.images[kind],x,220,21,21);
  }

  // The smaller right-side desk has three interactive, recognizable objects.
  r(284,95,181,133,'#e8d9bb');r(286,95,178,2,'#d9bc90');
  for(let x=292;x<460;x+=37)r(x,95,1,132,'#dfcdb0');
  frame(306,83,146,16,'#5b6145','#6a856c','#d7ce9b');
  r(316,86,126,1,'#aab69a');

  // Clipboard / bakery orders with a metal clamp and paper detail.
  const orders=MENU_SLOTS.orders;
  frame(orders.x-4,orders.y-4,orders.width+8,orders.height+8,'#684d3b','#cfb28c','#f1dcb3');
  frame(orders.x+2,orders.y+1,orders.width-4,orders.height-2,'#bc936b','#f8edda','#fff9ec');
  r(orders.x+60,orders.y-7,29,7,'#86664c');r(orders.x+67,orders.y-9,15,4,'#dcb57e');
  r(orders.x+11,orders.y+9,14,3,'#d3b58d');r(orders.x+11,orders.y+15,22,2,'#e3d2b4');
  r(orders.x+114,orders.y+10,20,2,'#d3b58d');

  // Leather-bound open Recipe Book, with pages and colored bookmarks.
  const book=MENU_SLOTS.book;
  r(book.x-8,book.y+7,book.width+16,book.height+3,'#684737');
  r(book.x-6,book.y+3,book.width+12,book.height,'#9f6551');
  r(book.x-2,book.y+2,book.width+4,book.height-5,'#e5cba9');
  r(book.x+2,book.y+3,book.width/2-5,book.height-9,'#fff2d3');
  r(book.x+book.width/2+2,book.y+3,book.width/2-5,book.height-9,'#fff8df');
  r(book.x+book.width/2-1,book.y+4,3,book.height-10,'#b38968');
  r(book.x+8,book.y+6,26,1,'#d9c0a0');
  r(book.x+book.width-31,book.y+6,22,1,'#d9c0a0');
  r(book.x+3,book.y+book.height-7,book.width-6,2,'#d9aa81');
  r(book.x+12,book.y-3,6,10,'#be8061');

  // Two smaller hanging engraved plaques for Settings and Credits.
  for(const key of ['settings','credits'] as const){
    const slot=MENU_SLOTS[key];
    r(slot.x+7,slot.y-5,2,6,'#947b58');
    r(slot.x+slot.width-9,slot.y-5,2,6,'#947b58');
    frame(slot.x-2,slot.y-1,slot.width+4,slot.height+2,'#526e55','#78947b','#b9c4a0');
  }
  r(284,113,2,78,'#8f7955');
  for(let y=117;y<=185;y+=17)r(282,y,4,2,'#d3b18a');
  r(468,112,3,108,'#8e7555');r(470,113,1,95,'#e8c79b');

  // Player receipt and studio maker's stamp, also sharing hitbox geometry.
  const profile=MENU_SLOTS.profile;
  frame(profile.x-4,profile.y-3,profile.width+8,profile.height+6,'#4f6552','#f0e3c6','#fff9e9');
  r(profile.x+5,profile.y+profile.height-5,profile.width-10,1,'#cdb48f');
  const studio=MENU_SLOTS.studio;
  r(studio.x-5,studio.y-3,studio.width+9,studio.height+5,'#3e5949');
  r(studio.x-2,studio.y-1,studio.width+3,studio.height+1,'#52735e');
  r(studio.x+5,studio.y+2,studio.width-10,1,'#73937a');
}
