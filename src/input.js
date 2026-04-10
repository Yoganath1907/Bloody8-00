// input.js - Keyboard state manager
export const Keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

export const JustPressed = {
  e: false, space: false, enter: false
};

const Held = { e: false, space: false, enter: false };

function onKeyDown(e) {
  const k = e.key.toLowerCase();
  if (Keys[k] !== undefined) Keys[k] = true;
  if (Keys[e.key] !== undefined) Keys[e.key] = true;
  
  if (k === 'e' || e.key === 'Enter' || k === ' ') {
    const id = k === ' ' ? 'space' : e.key === 'Enter' ? 'enter' : 'e';
    if (!Held[id]) {
      JustPressed[id] = true;
      Held[id] = true;
    }
  }
}

function onKeyUp(e) {
  const k = e.key.toLowerCase();
  if (Keys[k] !== undefined) Keys[k] = false;
  if (Keys[e.key] !== undefined) Keys[e.key] = false;
  
  if (k === 'e' || e.key === 'Enter' || k === ' ') {
    const id = k === ' ' ? 'space' : e.key === 'Enter' ? 'enter' : 'e';
    Held[id] = false;
  }
}

export function initInput() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

export function clearJustPressed() {
  JustPressed.e = false;
  JustPressed.space = false;
  JustPressed.enter = false;
}
