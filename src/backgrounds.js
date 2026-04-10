// backgrounds.js — Canvas-drawn procedural pixel-art backgrounds

export function drawBackground(canvas, key, flashlightOn = false, playerX = 400) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  
  // Fill base black before transform
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  
  ctx.save();
  // Small parallax based on distance from center
  const offset = (400 - playerX) * 0.04;
  ctx.translate(offset, 0);

  const draw = BACKGROUNDS[key] || BACKGROUNDS['black'];
  draw(ctx, W, H, flashlightOn);
  
  ctx.restore();
}

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawFloor(ctx, W, H, color, lineColor) {
  px(ctx, 0, H * 0.7, W, H * 0.3, color);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.7);
  ctx.lineTo(W, H * 0.7);
  ctx.stroke();
}

function drawWindow(ctx, x, y, w, h, raining) {
  // window frame
  px(ctx, x, y, w, h, '#1a1a2e');
  px(ctx, x, y, w, 4, '#555');
  px(ctx, x, y + h - 4, w, 4, '#555');
  px(ctx, x, y, 4, h, '#555');
  px(ctx, x + w - 4, y, 4, h, '#555');
  px(ctx, x + w/2 - 2, y, 4, h, '#555');
  px(ctx, x, y + h/2 - 2, w, 4, '#555');
  // rain streaks
  if (raining) {
    ctx.strokeStyle = 'rgba(100,150,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const rx = x + Math.random() * w;
      const ry = y + Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 12);
      ctx.stroke();
    }
  }
}

function drawLamp(ctx, x, y) {
  // lamp stand
  px(ctx, x - 3, y, 6, 60, '#888');
  // shade
  ctx.fillStyle = '#c8a84b';
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.lineTo(x + 14, y - 30);
  ctx.lineTo(x - 14, y - 30);
  ctx.closePath();
  ctx.fill();
}

function drawSofa(ctx, x, y, w, h) {
  const cushionW = w / 3;
  
  // Sofa Base
  px(ctx, x, y + h * 0.4, w, h * 0.6, '#3a201c');
  // Bottom Shadow
  px(ctx, x, y + h * 0.9, w, h * 0.1, '#1a0c0a');

  // Backrest (3 thick cushions)
  for(let i=0; i<3; i++) {
     px(ctx, x + i*cushionW + 5, y, cushionW - 10, h * 0.5, '#5c3d2e');
     // Bevel/highlight
     px(ctx, x + i*cushionW + 10, y + 5, cushionW - 20, h * 0.1, '#6a4535');
  }

  // Seat Cushions (3 cushions)
  for(let i=0; i<3; i++) {
     px(ctx, x + i*cushionW, y + h * 0.4, cushionW - 2, h * 0.3, '#4d2a1f');
     // Cushion top highlight
     px(ctx, x + i*cushionW + 5, y + h * 0.42, cushionW - 12, h * 0.05, '#5e3a2b');
  }

  // Armrests
  px(ctx, x - 10, y + h * 0.2, w * 0.12, h * 0.8, '#4a251b'); // Left arm
  px(ctx, x - 5, y + h * 0.22, w * 0.10, h * 0.08, '#5c2d20'); // Left highlight

  px(ctx, x + w - (w * 0.12) + 10, y + h * 0.2, w * 0.12, h * 0.8, '#4a251b'); // Right arm
  px(ctx, x + w - (w * 0.10) + 5, y + h * 0.22, w * 0.10, h * 0.08, '#5c2d20'); // Right highlight
}

function drawTV(ctx, x, y, w, h, on) {
  // Bezel
  px(ctx, x - 10, y - 10, w + 20, h + 20, '#1a1a1a');
  px(ctx, x - 8, y - 8, w + 16, h + 16, '#080808');
  
  // Screen Base
  px(ctx, x, y, w, h, '#111');
  
  if (on) {
    const time = Date.now() * 0.002;
    
    // Draw News Reporter Scene
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    
    // News Studio background
    px(ctx, x, y, w, h, '#1a3a6a'); 
    
    // Desk
    px(ctx, x, y + h * 0.6, w, h * 0.4, '#a82c20');
    px(ctx, x, y + h * 0.58, w, h * 0.05, '#ffffff');
    
    // Anchor Man silhouette
    px(ctx, x + w/2 - 20, y + h * 0.2, 40, h * 0.5, '#0a0c10'); // Body
    px(ctx, x + w/2 - 12, y + h * 0.1, 24, 24, '#201815'); // Head
    
    // "BREAKING NEWS" ticker at bottom
    px(ctx, x, y + h * 0.85, w, h * 0.15, '#cc1111');
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    // scroll text
    const tickerX = x + w - ((time * 30) % (w * 2));
    ctx.fillText('BREAKING: STORM WARNING IN EFFECT...', tickerX, y + h * 0.95);
    
    // Heavy TV static lines
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < h; i += 4) {
      if (Math.sin(time * 5 + i) > 0) {
        px(ctx, x, y + i, w, 2, 'rgba(255,255,255,0.15)');
      }
    }
    ctx.restore();

    // screen glow cast around the TV
    const grd = ctx.createRadialGradient(x + w/2, y + h/2, 5, x + w/2, y + h/2, w);
    grd.addColorStop(0, 'rgba(180, 200, 255, 0.4)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grd;
    ctx.fillRect(x - 100, y - 50, w + 200, h + 100);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    // Screen reflection when off
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.6, y);
    ctx.lineTo(x, y + h * 0.8);
    ctx.fill();
  }
}

function addDarkVignette(ctx, W, H, strength = 0.7) {
  const grd = ctx.createRadialGradient(W/2, H/2, H * 0.2, W/2, H/2, H * 0.9);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function drawRainOnScene(ctx, W, H) {
  ctx.strokeStyle = 'rgba(100,180,255,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const rx = Math.random() * W;
    const ry = Math.random() * H;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 5, ry + 18);
    ctx.stroke();
  }
}

function addFlickering(ctx, W, H) {
  if (Math.random() < 0.05) {
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, W, H);
  }
}

function drawClock(ctx, x, y, label) {
  px(ctx, x, y, 90, 30, '#000');
  ctx.fillStyle = '#ff3300';
  ctx.font = 'bold 20px "Courier New"';
  ctx.fillText(label, x + 5, y + 22);
}

function drawDoor(ctx, x, y, w, h, color = '#3a2a1a', knobSide = 'right') {
  px(ctx, x, y, w, h, color);
  px(ctx, x + 4, y + 4, w - 8, h - 4, '#2a1e10');
  // Panel details
  px(ctx, x + 10, y + 10, w - 20, (h / 2) - 20, color);
  px(ctx, x + 10, y + (h / 2) + 10, w - 20, (h / 2) - 20, color);
  // Knob
  const kx = knobSide === 'right' ? x + w - 15 : x + 7;
  px(ctx, kx, y + h / 2, 8, 8, '#c8a84b');
  px(ctx, kx+2, y + (h/2)+2, 4, 4, '#eecc6b');
}

function drawArchway(ctx, x, y, w, h, color = '#1a1820') {
  px(ctx, x, y, w, h, color);
  ctx.fillStyle = '#0a0810';
  ctx.beginPath();
  ctx.arc(x + w/2, y + 20, w/2, Math.PI, 0);
  ctx.fill();
  px(ctx, x, y + 20, w, h - 20, '#0a0810');
}

function drawTree(ctx, x, y) {
  px(ctx, x - 5, y, 10, 50, '#2a1a0a');
  ctx.fillStyle = '#1a3a1a';
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
}

const BACKGROUNDS = {

  'black': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#050505');
  },

  'white_flash': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#ffffff');
  },

  'bedroom': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#0a0a12');
    // walls
    px(ctx, 0, 0, W, H * 0.7, '#1a1830');
    // wallpaper lines - subtle vertical stripes
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 15;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 60, 0);
      ctx.lineTo(i * 60, H * 0.7);
      ctx.stroke();
    }
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    
    // Bedside Rug
    ctx.fillStyle = '#3a2a4a';
    ctx.beginPath();
    ctx.ellipse(220, 460, 150, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a3a5a';
    ctx.stroke();

    // Window with curtains
    const wx = 540, wy = 60, ww = 180, wh = 140;
    drawWindow(ctx, wx, wy, ww, wh, true);
    // Curtains
    px(ctx, wx - 10, wy - 5, 30, wh + 10, '#3a1a1a');
    px(ctx, wx + ww - 20, wy - 5, 30, wh + 10, '#3a1a1a');
    px(ctx, wx - 15, wy - 10, ww + 30, 8, '#2a0a0a'); // curtain rod

    // Wall Poster
    px(ctx, 60, 80, 80, 110, '#222');
    px(ctx, 65, 85, 70, 100, '#444');
    ctx.fillStyle = '#555';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('STAY', 75, 120);
    ctx.fillText('AWAKE', 70, 135);

    // BETTER BED
    // Headboard
    px(ctx, 80, 220, 10, 180, '#2a1a0a');
    px(ctx, 70, 240, 20, 140, '#3a2a1a');
    // Mattress
    px(ctx, 90, 260, 300, 140, '#d8d0c0'); 
    px(ctx, 90, 390, 300, 10, '#c8c0b0'); // bottom edge
    // Blanket/Comforter
    px(ctx, 160, 260, 230, 140, '#2a3a5a');
    px(ctx, 160, 260, 230, 40, '#3a4a6a'); // top fold
    // Pillow
    px(ctx, 100, 275, 60, 110, '#e8e0d0');
    px(ctx, 105, 280, 50, 100, '#f8f0e0');
    
    // alarm clock on a small nightstand
    px(ctx, 30, 340, 50, 100, '#2a1a0a'); // nightstand
    drawClock(ctx, 55, 340, '8:00 PM');
    
    addDarkVignette(ctx, W, H);
  },

  'kitchen': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.65, '#1e1e18');
    drawFloor(ctx, W, H, '#2a2010', '#3a3020');
    // Floor highlights - tile lines
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 10; i++) {
        ctx.strokeRect(i * 80, H * 0.7, 80, 80);
    }
    // Archway to hallway (Left)
    drawArchway(ctx, 0, 160, 60, 300, '#3a3020');
    // cabinets
    px(ctx, 80, 60, 600, 120, '#3a2a18');
    for (let i = 0; i < 6; i++) {
      px(ctx, 85 + i * 100, 65, 90, 110, '#4a3820'); // door
      px(ctx, 85 + i * 100 + 10, 75, 70, 90, '#5a4830'); // inner panel
      px(ctx, 85 + i * 100 + 45, 115, 6, 8, '#c8a84b'); // handle
    }
    // countertop
    px(ctx, 80, 180, 600, 20, '#5a5040');
    // sink
    px(ctx, 300, 185, 140, 80, '#222222');
    px(ctx, 315, 200, 110, 55, '#111111');
    // tap
    px(ctx, 360, 160, 8, 25, '#c0c0c0');
    px(ctx, 350, 158, 28, 5, '#e0e0e0');
    // fridge
    px(ctx, 700, 60, 80, 280, '#888');
    px(ctx, 703, 63, 74, 125, '#a0a0a0');
    px(ctx, 703, 195, 74, 140, '#a0a0a0');
    px(ctx, 750, 140, 10, 30, '#666'); // handles
    // window
    drawWindow(ctx, 480, 70, 160, 100, true);
    addDarkVignette(ctx, W, H, 0.5);
  },

  'living_room': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.68, '#181820');
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    drawArchway(ctx, 0, 160, 80, 280, '#2a2010'); // Doorway left
    drawWindow(ctx, 550, 50, 180, 150, true);
    // Floor texture
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, H * 0.7 + i * 40);
        ctx.lineTo(W, H * 0.7 + i * 40);
        ctx.stroke();
    }
    // tv stand
    px(ctx, 160, 200, 200, 30, '#2a1a0a');
    px(ctx, 155, 195, 210, 5, '#3a2a1a');
    drawTV(ctx, 170, 120, 180, 80, false);
    drawSofa(ctx, 200, 310, 380, 160);
    // side lamp
    drawLamp(ctx, 640, 260);
    // rug
    ctx.fillStyle = '#3a1a1a';
    ctx.beginPath();
    ctx.ellipse(400, 430, 200, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.stroke();
    addDarkVignette(ctx, W, H, 0.6);
  },

  'tv_room': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.68, '#0e0e16');
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    px(ctx, 100, 200, 200, 20, '#2a1a0a');
    drawTV(ctx, 110, 120, 180, 80, true);
    drawSofa(ctx, 200, 310, 380, 160);
    drawLamp(ctx, 640, 260);
    // tv glow on room
    const grd = ctx.createRadialGradient(200, 160, 10, 200, 160, 350);
    grd.addColorStop(0, 'rgba(100,130,200,0.15)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    addDarkVignette(ctx, W, H, 0.5);
  },

  'living_dark': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#0a0a10');
    // Furniture outlines revealed by flashlight
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(100, 195, 200, 10);  // tv stand
    ctx.strokeRect(110, 125, 180, 75);  // TV
    ctx.strokeRect(200, 305, 380, 160); // sofa
    ctx.strokeRect(550, 50, 180, 150);  // window
    ctx.strokeRect(0, 160, 80, 280);    // archway
    addDarkVignette(ctx, W, H, 0.3);
  },

  'hallway_dark': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#080810');
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    drawDoor(ctx, 550, 120, 120, 260, '#1a1010'); // to living room
    drawDoor(ctx, 310, 120, 180, 320, '#1a1010'); // front door
    // Left stair arch
    drawArchway(ctx, 0, 160, 60, 300, '#0a0a0a');
    // Right arch
    drawArchway(ctx, W - 60, 160, 60, 300, '#0a0a0a');
    addDarkVignette(ctx, W, H, 0.5);
  },

  'hallway_lit': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.75, '#1e1c30');
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    drawDoor(ctx, 550, 120, 120, 260, '#3a2a1a'); // to living room
    drawDoor(ctx, 310, 120, 180, 320, '#3a2a1a', 'left'); // front door, bigger
    
    // Left stair arch
    drawArchway(ctx, 0, 160, 60, 300, '#1a1a25');
    // Right kitchen arch
    drawArchway(ctx, W - 60, 160, 60, 300, '#1a1a25');

    // ceiling light
    px(ctx, 360, 0, 80, 10, '#c8b84b');
    const grd = ctx.createRadialGradient(400, 0, 5, 400, 60, 250);
    grd.addColorStop(0, 'rgba(230,220,160,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H * 0.8);
    addDarkVignette(ctx, W, H, 0.5);
  },

  'backyard_rain': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.55, '#050d0a');
    px(ctx, 0, H * 0.55, W, H * 0.45, '#0a1208');
    // trees
    drawTree(ctx, 80, 220);
    drawTree(ctx, 680, 200);
    drawTree(ctx, 200, 260);
    // fence
    for (let i = 0; i < W; i += 40) {
      px(ctx, i, H * 0.45, 8, 80, '#3a2a18');
      px(ctx, i, H * 0.45, 8, 6, '#5a4a30');
    }
    px(ctx, 0, H * 0.45, W, 8, '#4a3a28');
    drawRainOnScene(ctx, W, H);
    addDarkVignette(ctx, W, H, 0.35);
  },

  'fusebox': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#080808');
    
    // Grimy brick wall texture
    for(let i=0; i<30; i++) {
        for(let j=0; j<20; j++) {
            const bx = i * 30 + (j%2 * 15);
            const by = j * 30;
            px(ctx, bx, by, 28, 28, '#141c14');
            px(ctx, bx+2, by+2, 24, 24, '#1b241b');
        }
    }

    // Heavy Danger Box
    // drop shadow
    px(ctx, 270, 110, 280, 400, 'rgba(0,0,0,0.8)');
    // main box
    px(ctx, 280, 100, 260, 380, '#2e3a2e');
    // inset rim
    px(ctx, 290, 110, 240, 360, '#1c241c');
    
    // Glass cover reflection
    px(ctx, 290, 110, 240, 100, 'rgba(255,255,255,0.03)');
    
    // Warning Stripes at bottom
    for (let i=0; i<10; i++) {
        px(ctx, 300 + i*20, 420, 10, 30, '#ccbb22');
        px(ctx, 310 + i*20, 420, 10, 30, '#111111');
    }

    // fuses rows
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const fx = 315 + col * 52, fy = 150 + row * 65;
        // Fuse Socket
        px(ctx, fx, fy, 42, 45, '#0a0a0a');
        
        // Is it the blown fuse?
        const isBlown = (col === 2 && row === 1);
        
        // Inner Glass
        px(ctx, fx + 8, fy + 4, 26, 36, isBlown ? '#3a1111' : '#114a22');
        
        // Metal contacts
        px(ctx, fx + 16, fy - 2, 10, 6, '#888');
        px(ctx, fx + 16, fy + 40, 10, 6, '#888');
        
        // Glowing filament
        if (!isBlown) {
            px(ctx, fx + 20, fy + 10, 2, 24, '#88ffaa');
        } else {
            // Blown filament is broken and blackened
            px(ctx, fx + 20, fy + 10, 2, 8, '#222');
            px(ctx, fx + 20, fy + 26, 2, 8, '#111');
            // Smoke smudge
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.arc(fx + 21, fy + 20, 12, 0, Math.PI*2); ctx.fill();
        }
      }
    }
    // Main Power Breaker Switch
    px(ctx, 380, 350, 40, 60, '#1a1a1a'); // plate
    px(ctx, 390, 360, 20, 40, '#aa2222'); // physical switch
    
    ctx.fillStyle = '#eee';
    ctx.font = '16px "VT323", monospace';
    ctx.fillText('MAIN BREAKERS', 355, 135);
    
    // Strong Flashlight Beam cutting through
    const grd = ctx.createLinearGradient(100, 100, 600, 500);
    grd.addColorStop(0, 'rgba(255,255,200,0.25)');
    grd.addColorStop(0.5, 'rgba(255,255,200,0.1)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    
    addDarkVignette(ctx, W, H, 0.7);
  },

  'storage_room': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.72, '#12100e');
    drawFloor(ctx, W, H, '#1a1208', '#2a2010');
    // shelves
    for (let s = 0; s < 3; s++) {
      px(ctx, 60, 80 + s * 130, 680, 12, '#3a2a18');
      // boxes on shelves
      for (let b = 0; b < 6; b++) {
        const bx = 70 + b * 110, by = 94 + s * 130;
        const bh = 50 + (b % 3) * 15;
        const colors = ['#4a3820', '#3a4820', '#483820', '#3a3848'];
        px(ctx, bx, by - bh, 90, bh, colors[b % colors.length]);
        ctx.strokeStyle = '#2a1a08';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by - bh, 90, bh);
      }
    }
    addDarkVignette(ctx, W, H, 0.7);
  },

  'staircase': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.75, '#0e0c14');
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    drawArchway(ctx, W - 60, 160, 60, 300, '#0a0a0a'); // To Hallway Dark
    drawArchway(ctx, 0, 160, 60, 300, '#080808'); // To Storage Room
    
    // Upstairs landing arch
    drawArchway(ctx, 280, 20, 240, 200, '#110c14');
    
    // Draw stairs with perspective (wide at bottom, narrow at top)
    const steps = 14;
    for (let i = 0; i < steps; i++) {
      const p = i / (steps - 1); // 0 to 1
      const sy = 220 + p * 340; // top to bottom
      const nextY = 220 + ((i+1) / (steps - 1)) * 340;
      const stepH = (nextY - sy);
      
      const width = 240 + p * 360; 
      const sx = 400 - width/2;
      
      // Step Top (tread)
      px(ctx, sx, sy, width, stepH * 0.3, '#332211');
      // Step Front (riser)
      px(ctx, sx, sy + stepH * 0.3, width, stepH * 0.7, '#1a1108');
      
      // Shadows on edges of stairs
      px(ctx, sx, sy, 5, stepH, '#111');
      px(ctx, sx + width - 5, sy, 5, stepH, '#111');
    }
    
    // Left and Right thick railing banners
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(280, 210); // top left
    ctx.lineTo(100, 560); // bottom left
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(520, 210); // top right
    ctx.lineTo(700, 560); // bottom right
    ctx.stroke();

    // Spindles (vertical bars)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1a0d04';
    for (let i = 1; i < 6; i++) {
        const p = i / 6;
        // left
        ctx.beginPath();
        ctx.moveTo(280 + (100 - 280) * p, 210 + (560 - 210) * p);
        ctx.lineTo(280 + (100 - 280) * p, 210 + (560 - 210) * p + 80 * p + 40);
        ctx.stroke();
        // right
        ctx.beginPath();
        ctx.moveTo(520 + (700 - 520) * p, 210 + (560 - 210) * p);
        ctx.lineTo(520 + (700 - 520) * p, 210 + (560 - 210) * p + 80 * p + 40);
        ctx.stroke();
    }
    
    addDarkVignette(ctx, W, H, 0.8);
  },

  'upstairs_blood': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.72, '#0e080e');
    drawFloor(ctx, W, H, '#1a0808', '#2a1010');
    // blood splatter
    ctx.fillStyle = 'rgba(180,10,10,0.8)';
    ctx.beginPath();
    ctx.arc(400, 370, 80, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(150,8,8,0.5)';
      ctx.beginPath();
      ctx.arc(300 + Math.random() * 200, 320 + Math.random() * 120, Math.random() * 18, 0, Math.PI * 2);
      ctx.fill();
    }
    // smeared lines
    ctx.strokeStyle = 'rgba(120,5,5,0.4)';
    ctx.lineWidth = 8;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(300 + Math.random() * 200, 300 + Math.random() * 60);
      ctx.lineTo(300 + Math.random() * 200, 400 + Math.random() * 60);
      ctx.stroke();
    }
    addDarkVignette(ctx, W, H, 0.8);
  },

  'victor_room': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.7, '#101428');
    drawFloor(ctx, W, H, '#1a1010', '#2a1818');
    drawDoor(ctx, 360, 400, 100, 180, '#221414');
    // bed
    px(ctx, 500, 240, 230, 170, '#1e1828');
    px(ctx, 500, 215, 250, 40, '#2a2038');
    px(ctx, 520, 222, 90, 28, '#e0d8e8');
    // poster on wall
    px(ctx, 100, 80, 120, 100, '#1e2a3a');
    ctx.strokeStyle = '#2a3a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 80, 120, 100);
    // toys on shelf
    px(ctx, 80, 200, 160, 10, '#3a2a18');
    for (let i = 0; i < 4; i++) px(ctx, 85 + i * 38, 180, 28, 20, ['#cc4444','#4488cc','#44aa88','#aa44cc'][i]);
    drawWindow(ctx, 540, 60, 160, 130, true);
    addDarkVignette(ctx, W, H, 0.5);
  },

  'emily_room': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.7, '#0e0c10');
    drawFloor(ctx, W, H, '#1a1010', '#2a1818');
    // door back
    drawDoor(ctx, 360, 400, 100, 180, '#221414');
    
    // dark drawings on wall
    ctx.strokeStyle = 'rgba(80,20,20,0.6)';
    ctx.lineWidth = 2;
    // creepy stick figure drawings
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 120, y = 100;
      ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 15); ctx.lineTo(x, y + 55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 20, y + 30); ctx.lineTo(x + 20, y + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 55); ctx.lineTo(x - 15, y + 85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 55); ctx.lineTo(x + 15, y + 85); ctx.stroke();
    }
    // X marks
    ctx.strokeStyle = 'rgba(180,10,10,0.5)';
    ctx.lineWidth = 3;
    [120,240,360].forEach(x => {
      ctx.beginPath(); ctx.moveTo(x - 12, 85); ctx.lineTo(x + 12, 112); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 12, 85); ctx.lineTo(x - 12, 112); ctx.stroke();
    });
    // bed
    px(ctx, 480, 240, 240, 180, '#1a1018');
    px(ctx, 480, 215, 260, 40, '#221820');
    px(ctx, 500, 222, 80, 28, '#d0c8c8');
    // small box on desk
    px(ctx, 150, 290, 100, 20, '#2a1a18');
    px(ctx, 170, 270, 60, 20, '#3a1818');
    drawWindow(ctx, 550, 55, 150, 130, true);
    addDarkVignette(ctx, W, H, 0.75);
  },

  'diary': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#0a0605');
    // diary page
    px(ctx, 150, 100, 500, 400, '#f5f0e8');
    // red cover
    px(ctx, 145, 95, 510, 410, '#8a1010');
    px(ctx, 155, 105, 490, 390, '#f5f0e8');
    // ruled lines
    ctx.strokeStyle = 'rgba(0,0,200,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(165, 135 + i * 24);
      ctx.lineTo(635, 135 + i * 24);
      ctx.stroke();
    }
    // handwriting (rendered as pixel blocks)
    ctx.fillStyle = '#1a0a30';
    ctx.font = '16px "VT323", monospace';
    const lines = [
      'They always loved him more.',
      '',
      'He took my place.',
      '',
      'He has to go.',
      '',
      '- Emily'
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, 172, 152 + i * 38);
    });
    addDarkVignette(ctx, W, H, 0.4);
  },

  'orphanage_warm': (ctx, W, H) => {
    // warm sepia filter
    px(ctx, 0, 0, W, H * 0.72, '#2a1e10');
    drawFloor(ctx, W, H, '#3a2a18', '#4a3a28');
    // walls
    ctx.fillStyle = '#3d2a18';
    ctx.fillRect(0, 0, W, H * 0.72);
    // wallpaper pattern
    ctx.fillStyle = 'rgba(255,200,100,0.05)';
    for (let x = 0; x < W; x += 60) {
      for (let y = 0; y < H * 0.72; y += 60) {
        ctx.beginPath(); ctx.arc(x + 30, y + 30, 8, 0, Math.PI * 2); ctx.fill();
      }
    }
    // window with warm light
    drawWindow(ctx, 580, 60, 160, 120, false);
    const grd = ctx.createRadialGradient(660, 120, 20, 660, 200, 250);
    grd.addColorStop(0, 'rgba(255,200,100,0.3)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    // chairs
    px(ctx, 100, 330, 80, 60, '#5a3a22');
    px(ctx, 100, 280, 80, 60, '#6a4a32');
    px(ctx, 250, 330, 80, 60, '#5a3a22');
    px(ctx, 250, 280, 80, 60, '#6a4a32');
    // desk
    px(ctx, 450, 320, 250, 80, '#4a3020');
    addDarkVignette(ctx, W, H, 0.3);
    // sepia overlay
    ctx.fillStyle = 'rgba(120,80,20,0.15)';
    ctx.fillRect(0, 0, W, H);
  },

  'orphanage_emily': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.72, '#2a1e10');
    drawFloor(ctx, W, H, '#3a2a18', '#4a3a28');
    ctx.fillStyle = '#3d2a18';
    ctx.fillRect(0, 0, W, H * 0.72);
    // hallway with Emily silhouette at end
    px(ctx, 280, 0, 240, H, '#251a0e');
    // Emily silhouette
    ctx.fillStyle = '#0a0806';
    ctx.beginPath();
    ctx.arc(400, 260, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(392, 278, 16, 55);
    ctx.fillRect(375, 290, 15, 5);
    ctx.fillRect(410, 290, 15, 5);
    ctx.fillRect(390, 333, 10, 35);
    ctx.fillRect(402, 333, 10, 35);
    // eerie glow around her
    const grd = ctx.createRadialGradient(400, 280, 5, 400, 280, 80);
    grd.addColorStop(0, 'rgba(255,50,50,0.08)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(120,80,20,0.15)';
    ctx.fillRect(0, 0, W, H);
    addDarkVignette(ctx, W, H, 0.6);
  },

  'basement': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#080806');
    px(ctx, 0, 0, W, H * 0.72, '#0e0e0a');
    drawFloor(ctx, W, H, '#151208', '#201a0a');
    // concrete texture
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * 45); ctx.lineTo(W, i * 45 + 15); ctx.stroke();
    }
    // old shelves
    px(ctx, 40, 80, 160, 12, '#2a2410');
    px(ctx, 40, 180, 160, 12, '#2a2410');
    px(ctx, 600, 80, 160, 12, '#2a2410');
    px(ctx, 600, 180, 160, 12, '#2a2410');
    // boxes
    for (let i = 0; i < 5; i++) {
      px(ctx, 50 + i * 28, 95, 24, 80, '#1e1c10');
    }
    // bare lightbulb hint
    px(ctx, 396, 0, 8, 30, '#555');
    const grd = ctx.createRadialGradient(400, 60, 5, 400, 100, 200);
    grd.addColorStop(0, 'rgba(200,200,150,0.15)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    addDarkVignette(ctx, W, H, 0.85);
  },

  'newspaper': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#0a0806');
    // yellowed newspaper page
    px(ctx, 120, 80, 560, 440, '#e8e0c8');
    // masthead
    px(ctx, 130, 90, 540, 50, '#c0b888');
    ctx.fillStyle = '#1a1208';
    ctx.font = 'bold 18px "VT323", monospace';
    ctx.fillText('THE RIVERSIDE CHRONICLE', 145, 122);
    // headline
    ctx.fillStyle = '#0a0806';
    ctx.font = 'bold 22px "VT323", monospace';
    ctx.fillText('BLACKWOOD ORPHANAGE MURDERS', 135, 170);
    ctx.fillText('UNSOLVED — 5 CHILDREN DEAD', 135, 195);
    // body text lines
    ctx.font = '14px "VT323", monospace';
    ctx.fillStyle = '#2a2018';
    const bodyLines = [
      'Investigators say the case has gone cold after',
      'all five victims were found in the east wing.',
      'The lone survivor, a young girl, is not named.',
      '',
      'Police note (found taped to article):',
      '"Primary suspect too young for prosecution."',
      '',
      'The case remains open.'
    ];
    bodyLines.forEach((l, i) => ctx.fillText(l, 138, 220 + i * 22));
    // photo placeholder (grainy)
    px(ctx, 430, 165, 200, 160, '#b0a888');
    ctx.fillStyle = '#888070';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(435 + Math.random() * 190, 170 + Math.random() * 150, Math.random() * 5, Math.random() * 5);
    }
    ctx.fillStyle = '#6a5840';
    ctx.font = '12px monospace';
    ctx.fillText('[Photo: Emily, age 9]', 443, 337);
    addDarkVignette(ctx, W, H, 0.5);
  },

  'police_outside': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.7, '#08101a');
    drawFloor(ctx, W, H, '#1a1808', '#28280a');
    // police lights — alternating red/blue
    const time = Date.now() % 1000;
    if (time < 500) {
      px(ctx, 0, 0, W, H, 'rgba(255,30,30,0.05)');
    } else {
      px(ctx, 0, 0, W, H, 'rgba(30,30,255,0.05)');
    }
    // car silhouette
    px(ctx, 100, 340, 280, 100, '#0a0a14');
    px(ctx, 150, 290, 180, 60, '#0e0e18');
    px(ctx, 220, 270, 50, 20, '#1a1a2a');
    // lights on car
    px(ctx, 185, 268, 25, 12, time < 500 ? '#ff3333' : '#3333ff');
    px(ctx, 220, 268, 25, 12, time < 500 ? '#3333ff' : '#ff3333');
    drawWindow(ctx, 540, 60, 180, 170, true);
    addDarkVignette(ctx, W, H, 0.6);
  },

  'ending_good_bg': (ctx, W, H) => {
    // Dawn light
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, '#0a0820');
    sky.addColorStop(1, '#3a2040');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.6);
    drawFloor(ctx, W, H, '#1a1a08', '#28280a');
    // sunrise glow
    const grd = ctx.createRadialGradient(650, H * 0.6, 10, 650, H * 0.6, 300);
    grd.addColorStop(0, 'rgba(255,180,60,0.5)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e8d080';
    ctx.font = 'bold 48px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ GOOD END ★', W/2, H/2 - 20);
    ctx.font = '18px "VT323", monospace';
    ctx.fillStyle = '#c0b880';
    ctx.fillText('Victor Saved. Emily Arrested.', W/2, H/2 + 30);
    ctx.textAlign = 'left';
    addDarkVignette(ctx, W, H, 0.3);
  },

  'ending_dark_bg': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#080808');
    ctx.fillStyle = '#cc3333';
    ctx.font = 'bold 48px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ DARK END ★', W/2, H/2 - 20);
    ctx.font = '18px "VT323", monospace';
    ctx.fillStyle = '#884444';
    ctx.fillText('Victor survives. But at what cost?', W/2, H/2 + 30);
    ctx.textAlign = 'left';
    addDarkVignette(ctx, W, H, 0.7);
  },

  'living_rom_dawn': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.68, '#1e1830');
    drawFloor(ctx, W, H, '#1a1008', '#2a2010');
    drawWindow(ctx, 550, 50, 180, 150, false);
    const grd = ctx.createRadialGradient(640, 120, 5, 640, 160, 280);
    grd.addColorStop(0, 'rgba(255,180,60,0.3)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    drawSofa(ctx, 200, 310, 380, 160);
    addDarkVignette(ctx, W, H, 0.4);
  },

  'closet_dark': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#030306');
    // Closet walls - very cramped
    px(ctx, 0, 0, 60, H, '#0a0a10');
    px(ctx, W - 60, 0, 60, H, '#0a0a10');
    // Slats of light through the door
    for (let i = 0; i < 8; i++) {
      const sy = 80 + i * 65;
      ctx.fillStyle = `rgba(180,180,200,${0.03 + Math.random() * 0.02})`;
      ctx.fillRect(100, sy, W - 200, 3);
    }
    // Hanging clothes silhouettes
    for (let i = 0; i < 5; i++) {
      px(ctx, 120 + i * 120, 0, 4, 120, '#111');
      px(ctx, 100 + i * 120, 120, 50, 200, '#0a0a12');
    }
    // Faint heartbeat glow pulsing
    const pulse = Math.sin(Date.now() * 0.004) * 0.05 + 0.05;
    ctx.fillStyle = `rgba(255,0,0,${pulse})`;
    ctx.fillRect(0, 0, W, H);
    addDarkVignette(ctx, W, H, 0.9);
  },

  'closet_found': (ctx, W, H) => {
    px(ctx, 0, 0, W, H, '#080406');
    // Closet door ripped open - bright light from room
    const doorGlow = ctx.createRadialGradient(W/2, H/2, 20, W/2, H/2, 400);
    doorGlow.addColorStop(0, 'rgba(255,200,150,0.15)');
    doorGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = doorGlow;
    ctx.fillRect(0, 0, W, H);
    // Emily silhouette in doorway
    ctx.fillStyle = '#0a0505';
    ctx.beginPath();
    ctx.arc(W/2, H * 0.35, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(W/2 - 10, H * 0.35 + 22, 20, 60);
    // Dress flare
    ctx.beginPath();
    ctx.moveTo(W/2 - 10, H * 0.35 + 50);
    ctx.lineTo(W/2 - 25, H * 0.35 + 110);
    ctx.lineTo(W/2 + 25, H * 0.35 + 110);
    ctx.lineTo(W/2 + 10, H * 0.35 + 50);
    ctx.closePath();
    ctx.fill();
    // Knife glint
    const glint = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,255,255,${glint * 0.6})`;
    ctx.fillRect(W/2 + 20, H * 0.35 + 30, 3, 25);
    // Red eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(W/2 - 7, H * 0.35 - 3, 5, 4);
    ctx.fillRect(W/2 + 3, H * 0.35 - 3, 5, 4);
    // Red glow
    const redGlow = ctx.createRadialGradient(W/2, H * 0.35, 10, W/2, H * 0.35, 120);
    redGlow.addColorStop(0, 'rgba(255,0,0,0.08)');
    redGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = redGlow;
    ctx.fillRect(0, 0, W, H);
    addDarkVignette(ctx, W, H, 0.85);
  },

  'fight_scene': (ctx, W, H) => {
    px(ctx, 0, 0, W, H * 0.72, '#0e080e');
    drawFloor(ctx, W, H, '#1a0808', '#2a1010');
    // Overturned furniture
    ctx.save();
    ctx.translate(300, 400);
    ctx.rotate(0.4);
    px(ctx, -40, -20, 80, 40, '#3a2a18');
    ctx.restore();
    // Scattered items
    px(ctx, 150, 460, 50, 15, '#2a1a0a');
    px(ctx, 500, 440, 30, 30, '#1a1a2a');
    // Knife on floor
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(420, 480, 4, 22);
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(418, 500, 8, 12);
    // Blood splatters
    ctx.fillStyle = 'rgba(150,10,10,0.7)';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(250 + Math.random() * 300, 380 + Math.random() * 150, Math.random() * 12 + 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Drag marks
    ctx.strokeStyle = 'rgba(120,5,5,0.4)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(300 + Math.random() * 150, 420);
      ctx.lineTo(350 + Math.random() * 150, 500);
      ctx.stroke();
    }
    // Flickering light
    if (Math.random() < 0.1) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, 0, W, H);
    }
    addDarkVignette(ctx, W, H, 0.8);
  },

  'orphanage_warm': (ctx, W, H) => {
    // Faded, warm institutional color
    px(ctx, 0, 0, W, H * 0.7, '#24201c');
    drawFloor(ctx, W, H, '#2a2218', '#3a3020');
    // Horizontal wainscoting
    px(ctx, 0, H * 0.4, W, 20, '#1a140c');
    px(ctx, 0, H * 0.7, W, 10, '#100a06');

    // Tall orphanage windows
    for(let i=0; i<3; i++) {
        const wx = 120 + i*220;
        drawWindow(ctx, wx, 80, 100, 200, false);
        // Window mullions
        px(ctx, wx + 48, 80, 4, 200, '#111');
        px(ctx, wx, 180, 100, 4, '#111');
    }
    
    // Sunlight rays cutting through windows
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const grd = ctx.createLinearGradient(W/2, 0, W/2 + 200, H);
    grd.addColorStop(0, 'rgba(255, 240, 200, 0.15)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(700, 80);
    ctx.lineTo(800, H);
    ctx.lineTo(0, H);
    ctx.fill();
    ctx.restore();

    addDarkVignette(ctx, W, H, 0.3);
  },

  'orphanage_emily': (ctx, W, H) => {
    // Memory dims to focus on Emily
    px(ctx, 0, 0, W, H * 0.7, '#151311');
    drawFloor(ctx, W, H, '#1a1612', '#2a2218');
    px(ctx, 0, H * 0.4, W, 20, '#0a0805');
    
    // Dimmed windows
    for(let i=0; i<3; i++) {
        const wx = 120 + i*220;
        px(ctx, wx, 80, 100, 200, '#0a0a0a');
        px(ctx, wx + 48, 80, 4, 200, '#000');
        px(ctx, wx, 180, 100, 4, '#000');
    }

    // A dark hallway opening exactly where Emily will stand
    drawArchway(ctx, 350, 150, 100, 270, '#050403');
    
    addDarkVignette(ctx, W, H, 0.6);
  }
};
