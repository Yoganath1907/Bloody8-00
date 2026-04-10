// titlecard.js — Dramatic scene title card reveals

let titleEl = null;

export function initTitleCard(container) {
  titleEl = document.createElement('div');
  titleEl.id = 'title-card';
  titleEl.style.cssText = `
    position:absolute; top:0; left:0; width:100%; height:100%;
    display:none; flex-direction:column; justify-content:center; align-items:center;
    background:rgba(0,0,0,0); z-index:22; pointer-events:none;
  `;
  container.appendChild(titleEl);
}

/**
 * Show a dramatic title card
 * @param {string} act - e.g. 'ACT 1'
 * @param {string} title - e.g. 'A QUIET NIGHT'
 * @param {string} color - accent color
 * @param {Function} onDone
 */
export function showTitleCard(act, title, color = '#ff3333', onDone) {
  if (!titleEl) return onDone && onDone();

  titleEl.innerHTML = `
    <div id="tc-act" style="
      font-family:'Press Start 2P',monospace;
      color:${color}88;
      font-size:0.75rem;
      letter-spacing:6px;
      margin-bottom:14px;
      opacity:0;
      transform:translateY(-10px);
      transition:all 0.6s ease;
    ">${act}</div>
    <div id="tc-line" style="
      width:0px; height:2px; background:${color}44;
      transition:width 0.8s ease 0.3s;
    "></div>
    <div id="tc-title" style="
      font-family:'Press Start 2P',monospace;
      color:${color};
      font-size:1.4rem;
      letter-spacing:3px;
      margin-top:14px;
      opacity:0;
      transform:translateY(10px);
      transition:all 0.7s ease 0.5s;
      text-shadow: 0 0 20px ${color}66;
      text-align:center;
    ">${title}</div>
  `;

  titleEl.style.display = 'flex';
  titleEl.style.background = 'rgba(0,0,0,0.85)';
  titleEl.style.transition = 'background 0.4s ease';

  // Animate in
  requestAnimationFrame(() => {
    const actEl = document.getElementById('tc-act');
    const lineEl = document.getElementById('tc-line');
    const titleTextEl = document.getElementById('tc-title');
    if (actEl) { actEl.style.opacity = '1'; actEl.style.transform = 'translateY(0)'; }
    if (lineEl) { lineEl.style.width = '300px'; }
    if (titleTextEl) { titleTextEl.style.opacity = '1'; titleTextEl.style.transform = 'translateY(0)'; }
  });

  // Hold then fade out
  setTimeout(() => {
    titleEl.style.transition = 'background 0.7s ease, opacity 0.7s ease';
    titleEl.style.opacity = '0';
    setTimeout(() => {
      titleEl.style.display = 'none';
      titleEl.style.opacity = '1';
      titleEl.style.background = 'rgba(0,0,0,0)';
      onDone && onDone();
    }, 700);
  }, 2200);
}
