// characters.js — Pixel-art character silhouette renderer

/**
 * Draw a character silhouette on the given canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} character - 'ethan' | 'emily' | 'victor' | 'miranda' | 'warden'
 * @param {number} x - center x
 * @param {number} y - feet y (bottom of character)
 * @param {object} opts - { scale, facing, highlight, dead, alpha }
 */
export function drawCharacter(ctx, character, x, y, opts = {}) {
  const {
    scale = 1,
    facing = 'right',  // 'left' | 'right'
    highlight = false,
    dead = false,
    alpha = 1
  } = opts;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  
  // Idle breathing animation
  let breatheScale = 1;
  if (!dead) {
      const timeOffset = x * 10 + y * 10;
      breatheScale = 1 + Math.sin(Date.now() * 0.003 + timeOffset) * 0.015;
  }
  
  ctx.scale(facing === 'left' ? -scale : scale, scale * breatheScale);
  if (dead) ctx.rotate(Math.PI / 2);

  switch (character) {
    case 'ethan':    drawEthan(ctx, highlight, facing); break;
    case 'emily':    drawEmily(ctx, highlight); break;
    case 'victor':   drawVictor(ctx, highlight, dead); break;
    case 'miranda':  drawMiranda(ctx, highlight); break;
    case 'warden':   drawWarden(ctx, highlight); break;
  }

  ctx.restore();
}

// ─── Color Palettes ────────────────────────────────────────────────────────
const P = {
  ethan: {
    skin: '#c8906a', hair: '#2a1a0a', shirt: '#2a3a5a', pants: '#1a1a2a', shoes: '#0a0808',
    highlight: '#66aaff'
  },
  emily: {
    skin: '#ddc8b8', hair: '#1a0a0a', dress: '#1a1028', highlights: '#8833aa',
    highlight: '#ff4444', eyes: '#cc0000'
  },
  victor: {
    skin: '#d4a070', hair: '#4a3020', shirt: '#4a8080', pants: '#2a2a3a', shoes: '#1a1010',
    highlight: '#44ffaa'
  },
  miranda: {
    skin: '#d4906a', hair: '#4a2a10', shirt: '#8a3a3a', pants: '#2a2a3a',
    highlight: '#44cc88'
  },
  warden: {
    skin: '#c0a080', hair: '#888888', shirt: '#3a3a3a', pants: '#1a1a1a',
    highlight: '#aaaaaa'
  }
};

// ─── Ethan (Top-Down Pokemon Style, ~90px tall) ──────────────────────────
function drawEthan(ctx, highlight, facing) {
  const c = P.ethan;
  const border = highlight ? c.highlight : 'rgba(0,0,0,0.5)';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const isFront = (facing === 'down');
  const isBack = (facing === 'up');
  const isSide = (facing === 'left' || facing === 'right');

  // Feet
  if (isSide) {
    pill(ctx, -8, -12, 10, 12, '#0a0808', border);
    pill(ctx,  2, -12, 10, 12, '#0a0808', border);
  } else {
    pill(ctx, -12, -12, 10, 12, '#0a0808', border);
    pill(ctx,   2, -12, 10, 12, '#0a0808', border);
  }

  // Pants (shortened for top-down depth)
  if (isSide) {
    rect(ctx, -10, -35, 14, 25, c.pants, border);
    // highlight/shading on pants
    px(ctx, -10, -35, 4, 25, 'rgba(255,255,255,0.05)');
  } else {
    rect(ctx, -13, -35, 11, 25, c.pants, border);
    rect(ctx,   2, -35, 11, 25, c.pants, border);
    // pant creases
    px(ctx, -8, -30, 2, 15, 'rgba(0,0,0,0.1)');
    px(ctx, 7, -30, 2, 15, 'rgba(0,0,0,0.1)');
  }

  // Belt
  if (!isBack) {
    rect(ctx, isSide ? -11 : -14, -38, isSide ? 16 : 28, 5, '#111', '#000');
    // buckle
    rect(ctx, isSide ? 2 : -3, -38, 6, 5, '#c8a84b', '#8a6a2b');
  }

  // Torso
  if (isSide) {
    rect(ctx, -12, -65, 20, 32, c.shirt, border);
    // Shading on side
    px(ctx, -12, -65, 5, 32, 'rgba(0,0,0,0.1)');
  } else {
    rect(ctx, -16, -65, 32, 32, c.shirt, border);
    if (isFront) {
      // shirt pocket
      rect(ctx, 4, -58, 8, 10, 'rgba(0,0,0,0.15)', 'rgba(255,255,255,0.05)');
      // buttons
      px(ctx, -1, -55, 2, 2, 'rgba(255,255,255,0.2)');
      px(ctx, -1, -48, 2, 2, 'rgba(255,255,255,0.2)');
    }
  }

  // Arms
  if (isSide) {
    rect(ctx, -2, -65, 8, 28, c.shirt, border);
    circle(ctx, 2, -37, 5, c.skin, border);
  } else {
    rect(ctx, -24, -65, 8, 28, c.shirt, border);
    rect(ctx,  16, -65, 8, 28, c.shirt, border);
    circle(ctx, -20, -35, 5, c.skin, border);
    circle(ctx,  20, -35, 5, c.skin, border);
  }

  // Head
  if (isSide) {
    rect(ctx, -14, -90, 24, 28, c.skin, border);
    rect(ctx, -14, -90, 24, 12, c.hair, border); // hair top
    rect(ctx, -14, -90, 8, 26, c.hair, border);  // hair back
    // hair highlight
    px(ctx, -10, -90, 15, 3, 'rgba(255,255,255,0.1)');
    // Eye
    ctx.fillStyle = highlight ? c.highlight : '#1a1a2a';
    ctx.fillRect(4, -80, 5, 4);
    // Mouth
    ctx.strokeStyle = '#6a4030';
    ctx.beginPath(); ctx.moveTo(6, -72); ctx.lineTo(10, -72); ctx.stroke();
  } else if (isBack) {
    rect(ctx, -16, -90, 32, 28, c.skin, border);
    rect(ctx, -16, -92, 32, 30, c.hair, border); // full back head hair cover
    // hair crown highlight
    px(ctx, -10, -92, 20, 4, 'rgba(255,255,255,0.08)');
  } else { // Front
    rect(ctx, -16, -90, 32, 28, c.skin, border);
    rect(ctx, -16, -90, 32, 10, c.hair, border); // hair top
    rect(ctx, -16, -90, 6, 18, c.hair, border);  // side burns
    rect(ctx,  10, -90, 6, 18, c.hair, border);
    // hair highlight
    px(ctx, -8, -90, 16, 3, 'rgba(255,255,255,0.1)');
    // Eyes
    ctx.fillStyle = highlight ? c.highlight : '#1a1a2a';
    ctx.fillRect(-8, -80, 5, 4);
    ctx.fillRect(3, -80, 5, 4);
    // Mouth
    ctx.strokeStyle = '#6a4030';
    ctx.beginPath(); ctx.moveTo(-3, -70); ctx.lineTo(3, -70); ctx.stroke();
  }

  // Flashlight if dark
  if (highlight) {
    if (isSide) {
      rect(ctx, 10, -50, 12, 6, '#c8b84b', '#a09040');
      rect(ctx, 22, -53, 6, 12, '#eeee88', 'transparent');
    } else if (isFront) {
      rect(ctx, 16, -42, 6, 12, '#c8b84b', '#a09040');
      circle(ctx, 19, -30, 4, '#eeee88', 'transparent');
    }
  }
}

// ─── Emily (small girl, eerie, scaled internally) ──────────────────────────
function drawEmily(ctx, highlight) {
  ctx.save();
  ctx.scale(0.55, 0.55); // Scale down to be realistically child-sized
  const c = P.emily;
  const border = highlight ? c.highlight : 'rgba(0,0,0,0.5)';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes (mary janes)
  pill(ctx, -12, -14, 10, 14, '#1a0808', border);
  pill(ctx,  2,  -14, 10, 14, '#1a0808', border);
  // white socks
  rect(ctx, -14, -26, 10, 12, '#ddd', border);
  rect(ctx,  4,  -26, 10, 12, '#ddd', border);

  // Dress/skirt
  ctx.fillStyle = c.dress;
  ctx.beginPath();
  ctx.moveTo(-18, -26);
  ctx.lineTo( 18, -26);
  ctx.lineTo( 24, -65);
  ctx.lineTo(-24, -65);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dress bodice
  rect(ctx, -12, -105, 24, 40, c.dress, border);
  // Dress detail (bow)
  ctx.fillStyle = c.highlights || '#8833aa';
  rect(ctx, -4, -100, 8, 4, c.highlights);

  // Arms (thin, eerie)
  rect(ctx, -22, -105, 10, 44, '#ccc', border);
  rect(ctx,  12, -105, 10, 44, '#ccc', border);

  // Hands (slightly grasping)
  circle(ctx, -17, -61, 7, c.skin, border);
  circle(ctx,  17, -61, 7, c.skin, border);

  // Neck
  rect(ctx, -5, -118, 10, 13, c.skin, border);

  // Head (slightly too large — uncanny)
  rect(ctx, -17, -155, 34, 37, c.skin, border);
  // face shading
  px(ctx, -17, -155, 6, 37, 'rgba(0,0,0,0.05)');

  // Long dark hair
  rect(ctx, -17, -155, 6, 55, c.hair, border);
  rect(ctx,  11, -155, 6, 55, c.hair, border);
  rect(ctx, -17, -155, 34, 14, c.hair, border);
  // hair highlight
  px(ctx, -10, -155, 20, 3, 'rgba(255,255,255,0.08)');

  // Eyes (wide, unsettling)
  if (highlight) {
    // Red glowing eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-10, -138, 8, 7);
    ctx.fillRect(2, -138, 8, 7);
    // Pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(-7, -136, 3, 4);
    ctx.fillRect(5, -136, 3, 4);
    // glow effect
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(-12, -142, 12, 11);
    ctx.fillRect(1, -142, 12, 11);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#1a0808';
    ctx.fillRect(-10, -138, 8, 7);
    ctx.fillRect(2, -138, 8, 7);
    // empty stare dot
    ctx.fillStyle = '#fff';
    ctx.fillRect(-6, -136, 2, 3);
    ctx.fillRect(6, -136, 2, 3);
  }

  // Unsettling smile
  ctx.strokeStyle = highlight ? '#cc0000' : '#6a3030';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -122, 9, 0.1, Math.PI - 0.1);
  ctx.stroke();
  // cheeks
  ctx.fillStyle = 'rgba(200,60,60,0.25)';
  circle(ctx, -10, -124, 5, 'rgba(200,60,60,0.25)', 'transparent');
  circle(ctx,  10, -124, 5, 'rgba(200,60,60,0.25)', 'transparent');
  ctx.restore();
}

// ─── Victor (boy, scaled internally) ──────────────────────────────────────
function drawVictor(ctx, highlight, dead) {
  ctx.save();
  ctx.scale(0.60, 0.60); // Scale down to be realistically child-sized
  const c = P.victor;
  const border = highlight ? c.highlight : 'rgba(0,0,0,0.5)';

  if (!dead) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes
    pill(ctx, -11, -14, 10, 14, '#1a1010', border);
    pill(ctx,  1,  -14, 10, 14, '#1a1010', border);

    // Pants
    rect(ctx, -13, -65, 10, 51, c.pants, border);
    rect(ctx,  3,  -65, 10, 51, c.pants, border);
    // pant detail
    px(ctx, -13, -60, 2, 40, 'rgba(0,0,0,0.1)');

    // Shirt
    rect(ctx, -14, -115, 28, 50, c.shirt, border);
    // shirt detail
    px(ctx, -2, -100, 4, 25, 'rgba(0,0,0,0.05)');
    px(ctx, -1, -95, 2, 2, '#fff'); // button

    // Arms
    rect(ctx, -22, -115, 8, 44, c.shirt, border);
    rect(ctx,  14, -115, 8, 44, c.shirt, border);

    // Hands
    circle(ctx, -18, -71, 7, c.skin, border);
    circle(ctx,  18, -71, 7, c.skin, border);

    // Neck
    rect(ctx, -5, -126, 10, 11, c.skin, border);

    // Head
    rect(ctx, -14, -156, 28, 30, c.skin, border);

    // Hair (messy)
    rect(ctx, -14, -156, 28, 12, c.hair, border);
    rect(ctx, -14, -156, 5, 20, c.hair, border);
    // hair highlight
    px(ctx, -8, -156, 12, 3, 'rgba(255,255,255,0.1)');

    // Eyes (curious)
    ctx.fillStyle = highlight ? c.highlight : '#2a2a3a';
    ctx.fillRect(-8, -143, 6, 5);
    ctx.fillRect(3, -143, 6, 5);

    // Small smile
    ctx.strokeStyle = '#6a4030';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -132, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    // Dead Victor — Detailed slumped version
    ctx.fillStyle = 'rgba(120, 0, 0, 0.6)';
    // blood pool with texture
    ctx.beginPath();
    ctx.ellipse(30, 5, 50, 22, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(80, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.ellipse(25, 8, 30, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // body on floor (twisted)
    ctx.save();
    ctx.translate(-20, 0);
    ctx.rotate(-Math.PI * 0.4);
    
    // torso
    rect(ctx, -25, -10, 50, 22, c.shirt, '#000');
    // pants/legs
    rect(ctx, -10, 12, 20, 40, c.pants, '#000');
    rect(ctx, -30, 12, 20, 35, c.pants, '#000');
    
    // head
    circle(ctx, -5, -25, 14, c.skin, '#000');
    rect(ctx, -8, -32, 14, 8, c.hair, '#000');
    
    // X eyes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-9, -28); ctx.lineTo(-4, -23); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(-9, -23); ctx.stroke();
    
    ctx.restore();
  }
  ctx.restore();
}

// ─── Miranda (nurse/adult female) ──────────────────────────────────────────
function drawMiranda(ctx, highlight) {
  ctx.save();
  ctx.scale(0.55, 0.55);
  const c = P.miranda;
  const border = 'rgba(0,0,0,0.4)';
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  pill(ctx, -13, -14, 12, 14, '#1a0808', border);
  pill(ctx,  1,  -14, 12, 14, '#1a0808', border);
  // Skirt with flare
  ctx.fillStyle = c.shirt;
  ctx.beginPath();
  ctx.moveTo(-18, -14);
  ctx.lineTo( 18, -14);
  ctx.lineTo( 22, -65);
  ctx.lineTo(-22, -65);
  ctx.closePath();
  ctx.fill();
  rect(ctx, -14, -115, 28, 50, c.shirt, border);
  rect(ctx, -22, -115, 8, 48, c.shirt, border);
  rect(ctx,  14, -115, 8, 48, c.shirt, border);
  circle(ctx, -18, -67, 7, c.skin, border);
  circle(ctx,  18, -67, 7, c.skin, border);
  rect(ctx, -5, -127, 10, 12, c.skin, border);
  rect(ctx, -16, -160, 32, 33, c.skin, border);
  rect(ctx, -16, -160, 32, 13, c.hair, border);
  rect(ctx, -16, -160, 5, 30, c.hair, border);
  ctx.fillStyle = '#2a1a2a';
  ctx.fillRect(-8, -147, 6, 5);
  ctx.fillRect(3, -147, 6, 5);
  ctx.restore();
}

// ─── Warden ────────────────────────────────────────────────────────────────
function drawWarden(ctx, highlight) {
  ctx.save();
  ctx.scale(0.50, 0.50);
  const c = P.warden;
  const border = 'rgba(0,0,0,0.4)';
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  pill(ctx, -13, -16, 12, 16, '#0a0808', border);
  pill(ctx,  1,  -16, 12, 16, '#0a0808', border);
  rect(ctx, -14, -80, 11, 64, c.pants, border);
  rect(ctx,  3,  -80, 11, 64, c.pants, border);
  rect(ctx, -16, -148, 32, 68, c.shirt, border);
  rect(ctx, -26, -148, 10, 55, c.shirt, border);
  rect(ctx,  16, -148, 10, 55, c.shirt, border);
  circle(ctx, -21, -93, 7, c.skin, border);
  circle(ctx,  21, -93, 7, c.skin, border);
  rect(ctx, -5, -160, 10, 12, c.skin, border);
  rect(ctx, -16, -196, 32, 36, c.skin, border);
  rect(ctx, -16, -196, 32, 12, c.hair, border);
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(-8, -182, 6, 5);
  ctx.fillRect(4, -182, 6, 5);
  // glasses
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.strokeRect(-10, -185, 8, 7);
  ctx.strokeRect(2, -185, 8, 7);
  ctx.beginPath(); ctx.moveTo(-2, -181); ctx.lineTo(2, -181); ctx.stroke();
  ctx.restore();
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function rect(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  if (stroke && stroke !== 'transparent') {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

function circle(ctx, x, y, r, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (stroke && stroke !== 'transparent') {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function pill(ctx, x, y, w, h, fill, stroke) {
  const r = w / 2;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  if (stroke && stroke !== 'transparent') {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
