// journal.js — Clue/Evidence Journal UI

const CLUES = {
  diary:     { title: 'Emily\'s Diary', text: '"They always loved him more. He took my place. He has to go."',  color: '#cc7722' },
  drawings:  { title: 'Violent Drawings', text: 'Sketches of stick figures with X\'d-out eyes. Dated this week.', color: '#aa3333' },
  dead_bird: { title: 'Dead Bird in Box', text: 'A sparrow, carefully placed. Feathers arranged. Deliberate.', color: '#884422' },
  newspaper: { title: 'Blackwood Chronicle', text: 'BLACKWOOD ORPHANAGE MURDERS UNSOLVED. Police note: "Primary suspect too young."', color: '#888844' },
  flashback: { title: 'The Transfer', text: 'Emily survived Blackwood. 5 dead. Transferred here. Nobody knows.', color: '#6644aa' },
};

let discovered = new Set();
let visible = false;
let journalEl = null;

export function discoverClue(key) {
  if (!CLUES[key] || discovered.has(key)) return;
  discovered.add(key);
  showClueNotification(CLUES[key]);
}

export function initJournal(container) {
  // Journal toggle button
  const btn = document.createElement('button');
  btn.id = 'journal-btn';
  btn.innerHTML = '📔';
  btn.title = 'Evidence Journal';
  btn.style.cssText = `
    position:absolute; bottom:185px; right:12px;
    background:rgba(0,0,0,0.7); border:2px solid #444; color:#fff;
    font-size:1.2rem; width:38px; height:38px; cursor:pointer;
    z-index:20; border-radius:4px; transition:all 0.2s;
    font-family:monospace;
  `;
  btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#aaa'; });
  btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#444'; });
  btn.addEventListener('click', toggleJournal);
  container.appendChild(btn);

  // Journal panel
  journalEl = document.createElement('div');
  journalEl.id = 'journal-panel';
  journalEl.style.cssText = `
    position:absolute; top:0; left:0; width:100%; height:100%;
    background:rgba(10,8,6,0.97); z-index:25; display:none;
    font-family:'VT323',monospace; padding:20px; overflow-y:auto;
  `;
  journalEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #333;padding-bottom:12px;">
      <div style="font-family:'Press Start 2P',monospace;color:#cc7722;font-size:0.8rem;">📔 EVIDENCE JOURNAL</div>
      <button id="close-journal" style="background:transparent;border:1px solid #444;color:#aaa;font-family:'Press Start 2P',monospace;font-size:0.6rem;padding:6px 10px;cursor:pointer;">CLOSE</button>
    </div>
    <div id="journal-entries" style="display:flex;flex-direction:column;gap:14px;"></div>
    <div id="journal-empty" style="color:#444;font-size:1.2rem;text-align:center;margin-top:60px;">No evidence found yet.<br><br>Investigate to discover clues.</div>
  `;
  container.appendChild(journalEl);
  document.getElementById('close-journal').addEventListener('click', toggleJournal);
}

function toggleJournal() {
  visible = !visible;
  journalEl.style.display = visible ? 'block' : 'none';
  if (visible) renderEntries();
}

function renderEntries() {
  const entriesEl = document.getElementById('journal-entries');
  const emptyEl = document.getElementById('journal-empty');
  entriesEl.innerHTML = '';
  if (discovered.size === 0) {
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';
  discovered.forEach(key => {
    const clue = CLUES[key];
    if (!clue) return;
    const card = document.createElement('div');
    card.style.cssText = `
      border:2px solid ${clue.color}33; background:rgba(20,16,10,0.9);
      padding:14px; border-left:4px solid ${clue.color};
    `;
    card.innerHTML = `
      <div style="color:${clue.color};font-size:1.3rem;margin-bottom:8px;font-family:'Press Start 2P',monospace;font-size:0.65rem;">${clue.title}</div>
      <div style="color:#ccc;font-size:1.1rem;line-height:1.5;">${clue.text}</div>
    `;
    entriesEl.appendChild(card);
  });
}

function showClueNotification(clue) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position:absolute; top:14px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,0.92); border:2px solid ${clue.color};
    padding:10px 20px; font-family:'VT323',monospace; font-size:1.4rem;
    color:${clue.color}; z-index:30; text-align:center;
    animation: fadeInDown 0.3s ease;
    white-space:nowrap;
  `;
  notif.innerHTML = `📔 CLUE FOUND: ${clue.title}`;
  document.getElementById('game-container')?.appendChild(notif);
  setTimeout(() => {
    notif.style.transition = 'opacity 0.5s';
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}

export function resetJournal() {
  discovered.clear();
}
