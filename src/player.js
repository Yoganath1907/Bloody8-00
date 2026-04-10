// player.js - WSAD Movement controller
import { Keys } from './input.js';
import { drawCharacter } from './characters.js';
import { ROOMS, SharedState } from './world.js';
import { playFootstep } from './audio.js';

export const player = {
  x: 400,
  y: 520,
  vx: 0,
  vy: 0,
  speed: 4.5,
  facing: 'right', // 'left' or 'right'
  state: 'idle',   // 'idle' or 'walking'
  locked: false,   // if true, movement disabled (e.g. during dialogue)
  flashlight: false,
  
  // Animation state
  runTimer: 0,
  bob: 0
};

export function updatePlayer() {
  if (player.locked) {
    player.state = 'idle';
    player.bob = 0;
    return;
  }

  let dx = 0;
  let dy = 0;

  if (Keys.w || Keys.ArrowUp) dy -= 1;
  if (Keys.s || Keys.ArrowDown) dy += 1;
  if (Keys.a || Keys.ArrowLeft) dx -= 1;
  if (Keys.d || Keys.ArrowRight) dx += 1;

  // Normalize
  if (dx !== 0 && dy !== 0) {
    const len = Math.sqrt(dx*dx + dy*dy);
    dx /= len;
    dy /= len;
  }

  player.x += dx * player.speed;
  player.y += dy * player.speed; // Y movement is equal

  if (dy < 0) player.facing = 'up';
  if (dy > 0) player.facing = 'down';
  if (dx < 0) player.facing = 'left';
  if (dx > 0) player.facing = 'right';

  if (dx !== 0 || dy !== 0) {
    player.state = 'walking';
    player.runTimer += 0.15;
    player.bob = Math.sin(player.runTimer) * 4;
    
    // Footstep audio roughly synced to bob
    if (Math.abs(Math.sin(player.runTimer)) < 0.15) {
       // Only trigger once per step cycle, maybe throttle using a frame counter in audio but this is okay
       if (Math.random() < 0.1) playFootstep(); 
    }
  } else {
    player.state = 'idle';
    player.bob = 0;
    player.runTimer = 0;
  }

  // Confine to room bounds
  const room = ROOMS[SharedState.activeRoom];
  if (room && room.bounds) {
    if (player.x < room.bounds.left) player.x = room.bounds.left;
    if (player.x > room.bounds.right) player.x = room.bounds.right;
    if (player.y < room.bounds.top) player.y = room.bounds.top;
    if (player.y > room.bounds.bottom) player.y = room.bounds.bottom;
  }
}

export function drawPlayer(ctx) {
  // We use the pixel art character renderer, adjusting Y by bob
  const isDark = (SharedState.activeRoom.includes('_dark') || SharedState.activeRoom.includes('backyard') || SharedState.activeRoom.includes('fusebox'));
  player.flashlight = isDark;
  
  drawCharacter(ctx, 'ethan', player.x, player.y + player.bob, {
    scale: 0.95 + (player.y - 400) / 1000, 
    facing: player.facing,
    highlight: player.flashlight // acts as a flashlight cue
  });
}
