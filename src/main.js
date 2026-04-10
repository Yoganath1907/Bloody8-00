// main.js - Application entry point
import { unlockAudio, startRain, playThunder } from './audio.js';
import { renderEngine, restartGame } from './engine.js';
import { ParticleSystem } from './particles.js';
import { initJournal } from './journal.js';
import { initTitleCard } from './titlecard.js';
import { initInput } from './input.js';

const loadingEl    = document.getElementById('loading');
const mainMenuEl   = document.getElementById('main-menu');
const startBtn     = document.getElementById('start-btn');
const sceneLayer   = document.getElementById('scene-layer');
const uiLayer      = document.getElementById('ui-layer');

let bgCanvas, charCanvas, hudCanvas;
const particles = new ParticleSystem();

function initCanvas() {
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = 800; bgCanvas.height = 600;
  bgCanvas.style.cssText = 'position:absolute;top:0;left:0;display:block;';
  sceneLayer.appendChild(bgCanvas);

  charCanvas = document.createElement('canvas');
  charCanvas.width = 800; charCanvas.height = 600;
  charCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
  sceneLayer.appendChild(charCanvas);

  hudCanvas = document.createElement('canvas');
  hudCanvas.width = 800; hudCanvas.height = 600;
  hudCanvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:4;';
  sceneLayer.appendChild(hudCanvas);

  particles.init(sceneLayer);
  initJournal(uiLayer);
  initTitleCard(uiLayer);
  initInput();

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  // Only render active engine if menu is hidden
  if (mainMenuEl.classList.contains('hidden')) {
    renderEngine(hudCanvas.getContext('2d'), charCanvas.getContext('2d'), bgCanvas);
  }
  requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', () => {
  unlockAudio();
  mainMenuEl.classList.add('hidden');
  restartGame();
  setTimeout(playThunder, 800);
});

window.addEventListener('load', () => {
  initCanvas();
  loadingEl.classList.add('hidden');
  mainMenuEl.classList.remove('hidden');
});
