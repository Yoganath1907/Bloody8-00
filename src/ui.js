// ui.js - DOM interactions
import { clearJustPressed } from './input.js';

export const dialogueBox  = document.getElementById('dialogue-box');
export const speakerEl    = document.getElementById('speaker-name');
export const dialogueEl   = document.getElementById('dialogue-text');
export const minigameEl   = document.getElementById('minigame-container');
export const qteEl        = document.getElementById('qte-container');
export const uiLayer      = document.getElementById('ui-layer');

let skipTyping = false;
let typingTimeout = null;
let dialogueCallback = null;
let currentDialogueTask = null;

// Global key/click to advance dialogue
document.addEventListener('mousedown', () => {
  if (dialogueCallback) {
     dialogueCallback();
     clearJustPressed();
  }
});

export function typeText(el, text, speed = 28, cb) {
  el.textContent = '';
  let i = 0;
  clearTimeout(typingTimeout);
  function next() {
    el.textContent += text[i];
    i++;
    if (i < text.length) {
      typingTimeout = setTimeout(next, speed);
    } else if (cb) cb();
  }
  next();
}

export function showDialogue(speaker, text, onDone) {
  dialogueBox.classList.remove('hidden');
  const spk = speaker || '';
  speakerEl.textContent = spk;
  speakerEl.style.color = spk === 'Emily' ? '#ff4444'
    : spk === 'Ethan' ? '#66aaff'
    : spk.includes('OBJECTIVE') ? '#ffaa22'
    : '#aaaaaa';
  dialogueEl.textContent = '';
  
  const finish = () => {
     dialogueEl.innerHTML = text + ' <span class="caret">▼</span>';
     dialogueCallback = () => {
        dialogueBox.classList.add('hidden');
        dialogueCallback = null;
        currentDialogueTask = null;
        if (onDone) setTimeout(onDone, 50); 
     };
  };

  currentDialogueTask = { text, onFinish: finish };

  if (skipTyping || !text) {
    dialogueEl.textContent = text || '';
    finish();
  } else {
    typeText(dialogueEl, text, 28, finish);
  }
}

export function showChoices(choices) {
  const container = document.getElementById('choices-container');
  container.innerHTML = '';
  container.classList.remove('hidden');
  
  choices.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-key">${idx + 1}</span> ${c.text}`;
    btn.onclick = () => {
      container.classList.add('hidden');
      if (c.callback) c.callback();
    };
    container.appendChild(btn);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      if (currentDialogueTask) {
        dialogueEl.innerHTML = currentDialogueTask.text + ' <span class="caret">▼</span>';
        dialogueCallback = currentDialogueTask.onFinish;
      }
    } else if (dialogueCallback) {
      dialogueCallback();
    }
  }

  const interactKeys = ['Enter', ' ', 'e', 'E', 'w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (interactKeys.includes(e.key)) {
    if (dialogueCallback) {
      dialogueCallback();
      clearJustPressed();
    }
  }
});

let vignetteLevel = 0;
export function setDarkVignetteLevel(val) {
   vignetteLevel = val;
}
export function getDarkVignetteLevel() {
   return vignetteLevel;
}

export function injectQTEStyle() { return; } // Already in CSS ideally
