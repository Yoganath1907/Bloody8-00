// minigame.js — Minigame controller

import { playClick, playQTE } from './audio.js';

// ─── DISH WASHING TYPING GAME ─────────────────────────────────────────
const DISH_WORDS = ['rinse', 'scrub', 'soap', 'wash', 'clean', 'dry', 'stack'];
const WORD_TIME_LIMIT = 5000; // 5 seconds per word

export function startDishGame(container, onComplete) {
  let wordIndex = 0;
  let typed = '';
  let wordTimer = null;
  let totalTimer = null;
  let totalTimeLeft = 30; // 30 seconds total
  let failed = false;

  function render() {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div id="mg-title">🫧 WASH THE DISHES</div>
      <div id="mg-subtitle">Type each word before time runs out!</div>
      <div id="mg-progress-bar"><div id="mg-fill"></div></div>
      <div id="mg-timer-bar"><div id="mg-timer-fill"></div></div>
      <div id="mg-word" class="type-target"></div>
      <div id="mg-typed" class="type-typed"></div>
      <div id="mg-word-timer"><div id="mg-word-timer-fill"></div></div>
      <div id="mg-hint">Type the word shown! <span style="color:#888">(${wordIndex + 1}/${DISH_WORDS.length})</span></div>
      <div id="mg-status"></div>
    `;
  }

  function startGame() {
    wordIndex = 0;
    typed = '';
    failed = false;
    totalTimeLeft = 30;
    render();

    const fill = document.getElementById('mg-fill');
    fill.style.width = '0%';

    // Total game timer countdown
    clearInterval(totalTimer);
    totalTimer = setInterval(() => {
      totalTimeLeft--;
      const timerFill = document.getElementById('mg-timer-fill');
      if (timerFill) {
        timerFill.style.width = (totalTimeLeft / 30 * 100) + '%';
        if (totalTimeLeft <= 10) timerFill.style.background = '#ff4444';
        else if (totalTimeLeft <= 20) timerFill.style.background = '#ffaa22';
      }
      if (totalTimeLeft <= 0) {
        failGame('TIME\'S UP!');
      }
    }, 1000);

    document.addEventListener('keydown', onKey);
    container._cleanup = cleanup;
    showWord();
  }

  function showWord() {
    if (wordIndex >= DISH_WORDS.length) {
      // WIN
      cleanup();
      container.innerHTML = `
        <div id="mg-title" style="color:#44ff88">✅ DISHES DONE!</div>
        <div id="mg-subtitle" style="color:#88ffaa">All clean and tidy.</div>
      `;
      setTimeout(() => {
        container.classList.add('hidden');
        onComplete();
      }, 1500);
      return;
    }
    typed = '';
    const wordEl = document.getElementById('mg-word');
    const typedEl = document.getElementById('mg-typed');
    const hintEl = document.getElementById('mg-hint');
    if (wordEl) wordEl.textContent = DISH_WORDS[wordIndex].toUpperCase();
    if (typedEl) typedEl.textContent = '_';
    if (hintEl) hintEl.innerHTML = `Type the word shown! <span style="color:#888">(${wordIndex + 1}/${DISH_WORDS.length})</span>`;

    // Per-word timer animation
    const wordTimerFill = document.getElementById('mg-word-timer-fill');
    if (wordTimerFill) {
      wordTimerFill.style.transition = 'none';
      wordTimerFill.style.width = '100%';
      wordTimerFill.style.background = '#33aaff';
      requestAnimationFrame(() => {
        wordTimerFill.style.transition = `width ${WORD_TIME_LIMIT}ms linear`;
        wordTimerFill.style.width = '0%';
      });
    }

    clearTimeout(wordTimer);
    wordTimer = setTimeout(() => {
      // Missed this word, restart the whole game
      failGame('TOO SLOW!');
    }, WORD_TIME_LIMIT);
  }

  function failGame(reason) {
    if (failed) return;
    failed = true;
    cleanup();
    playQTE(false);

    container.innerHTML = `
      <div id="mg-title" style="color:#ff4444">❌ ${reason}</div>
      <div id="mg-subtitle" style="color:#ff8888">The dishes are still dirty...</div>
      <div id="mg-hint" style="margin-top:20px;color:#aaa">Restarting in 2 seconds...</div>
    `;

    // Screen shake
    const gc = document.getElementById('game-container');
    if (gc) { gc.classList.add('shake'); setTimeout(() => gc.classList.remove('shake'), 500); }

    setTimeout(() => {
      startGame();
    }, 2000);
  }

  function onKey(e) {
    if (failed) return;
    if (e.key === 'Backspace') {
      typed = typed.slice(0, -1);
    } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      typed += e.key.toLowerCase();
      playClick();
    }
    const typedEl = document.getElementById('mg-typed');
    if (typedEl) typedEl.textContent = typed.toUpperCase() || '_';

    // Check if letter is wrong
    const target = DISH_WORDS[wordIndex];
    if (typed.length > 0 && target[typed.length - 1] !== typed[typed.length - 1]) {
      // Wrong letter - flash red
      if (typedEl) typedEl.style.color = '#ff4444';
      typed = typed.slice(0, -1); // remove wrong letter
      setTimeout(() => { if (typedEl) typedEl.style.color = ''; }, 200);
      return;
    }

    if (typed === DISH_WORDS[wordIndex]) {
      clearTimeout(wordTimer);
      wordIndex++;
      const fill = document.getElementById('mg-fill');
      if (fill) fill.style.width = (wordIndex / DISH_WORDS.length * 100) + '%';
      playClick();
      showWord();
    }
  }

  function cleanup() {
    document.removeEventListener('keydown', onKey);
    clearTimeout(wordTimer);
    clearInterval(totalTimer);
  }

  startGame();
}

// ─── FINAL QTE ─────────────────────────────────────────────────────────
const QTE_SEQUENCE = ['Z', 'X', 'C', 'V', 'B'];
const QTE_TIMEOUT = 2500;

export function startQTE(container, onPass, onFail) {
  let step = 0;
  let failed = false;
  let timer = null;

  container.classList.remove('hidden');
  container.innerHTML = `
    <div id="qte-title">⚡ FIGHT BACK!</div>
    <div id="qte-keys"></div>
    <div id="qte-prompt">Press the highlighted key!</div>
    <div id="qte-bar-wrap"><div id="qte-bar"></div></div>
  `;

  const keysEl = document.getElementById('qte-keys');
  const barEl = document.getElementById('qte-bar');

  function renderKeys() {
    keysEl.innerHTML = '';
    QTE_SEQUENCE.forEach((k, i) => {
      const span = document.createElement('span');
      span.textContent = k;
      span.className = 'qte-key' + (i === step ? ' active' : i < step ? ' done' : '');
      keysEl.appendChild(span);
    });
  }

  function startTimer() {
    clearTimeout(timer);
    barEl.style.transition = 'none';
    barEl.style.width = '100%';
    requestAnimationFrame(() => {
      barEl.style.transition = `width ${QTE_TIMEOUT}ms linear`;
      barEl.style.width = '0%';
    });
    timer = setTimeout(() => {
      if (!failed) fail();
    }, QTE_TIMEOUT);
  }

  function fail() {
    failed = true;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    container.classList.add('hidden');
    playQTE(false);
    onFail();
  }

  function onKey(e) {
    if (failed) return;
    const expected = QTE_SEQUENCE[step];
    if (e.key.toUpperCase() === expected) {
      playQTE(true);
      step++;
      if (step >= QTE_SEQUENCE.length) {
        clearTimeout(timer);
        document.removeEventListener('keydown', onKey);
        container.classList.add('hidden');
        onPass();
      } else {
        renderKeys();
        startTimer();
      }
    } else {
      playQTE(false);
      fail();
    }
  }

  document.addEventListener('keydown', onKey);
  container._cleanup = () => {
    document.removeEventListener('keydown', onKey);
    clearTimeout(timer);
  };
  renderKeys();
  startTimer();
}

// ─── FUSE SEARCH GAME ──────────────────────────────────────────────────
export function startFuseGame(container, onComplete) {
  container.classList.remove('hidden');
  container.classList.add('fuse-mode'); // apply custom full screen size

  // Randomize fuse position within an 800x600 padded boundary
  const fuseX = 100 + Math.random() * 600;
  const fuseY = 100 + Math.random() * 400;

  container.innerHTML = `
    <div id="fuse-box-bg">
       <div id="fuse-item" style="left: ${fuseX}px; top: ${fuseY}px;"></div>
    </div>
    <div id="fuse-light-mask"></div>
  `;

  const mask = document.getElementById('fuse-light-mask');
  const fuseItem = document.getElementById('fuse-item');

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    // Calculate cursor position relative to the container element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mask.style.setProperty('--mx', x + 'px');
    mask.style.setProperty('--my', y + 'px');
  }

  function onClick(e) {
      if (e.target.id === 'fuse-item') {
          playClick();
          cleanup();
          container.innerHTML = `
            <div id="mg-title" style="margin-top: 250px; color:#44ff88">✅ FUSE FOUND!</div>
          `;
          setTimeout(() => {
             container.classList.remove('fuse-mode');
             container.classList.add('hidden');
             onComplete();
          }, 1500);
      }
  }

  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('click', onClick);

  function cleanup() {
    container.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('click', onClick);
  }

  container._cleanup = cleanup;
}
