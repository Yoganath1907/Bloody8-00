// audio.js - Procedural Sound Engine
let ctx = null;
let rainNode = null;
let rainGain = null;
let heartbeatInterval = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

function createNoise(duration = 2, type = 'white') {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

export function startRain() {
  const c = getCtx();
  if (rainNode) return;
  rainNode = createNoise(2);
  rainGain = c.createGain();
  rainGain.gain.setValueAtTime(0, c.currentTime);
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 0.4;
  rainNode.connect(filter);
  filter.connect(rainGain);
  rainGain.connect(c.destination);
  rainNode.start();
  rainGain.gain.linearRampToValueAtTime(0.18, c.currentTime + 2);
}

export function stopRain() {
  if (!rainGain) return;
  rainGain.gain.linearRampToValueAtTime(0, getCtx().currentTime + 2);
  setTimeout(() => {
    try { rainNode && rainNode.stop(); } catch(e){}
    rainNode = null;
    rainGain = null;
  }, 2500);
}

export function playThunder() {
  const c = getCtx();
  const noise = createNoise(3);
  noise.loop = false;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.8, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  noise.start();
  noise.stop(c.currentTime + 3);
}

export function playAlarm() {
  const c = getCtx();
  const t = c.currentTime;
  for (let i = 0; i < 5; i++) {
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const gain = c.createGain();
    osc1.type = 'square';
    osc1.frequency.value = 880;
    osc2.type = 'square';
    osc2.frequency.value = 1100;
    gain.gain.setValueAtTime(0, t + i * 0.5);
    gain.gain.linearRampToValueAtTime(0.3, t + i * 0.5 + 0.05);
    gain.gain.setValueAtTime(0.3, t + i * 0.5 + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + i * 0.5 + 0.4);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(c.destination);
    osc1.start(t + i * 0.5);
    osc2.start(t + i * 0.5);
    osc1.stop(t + i * 0.5 + 0.5);
    osc2.stop(t + i * 0.5 + 0.5);
  }
}

export function playPowerOff() {
  const c = getCtx();
  const noise = createNoise(1);
  noise.loop = false;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(50, c.currentTime + 0.8);
  gain.gain.setValueAtTime(0.5, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  noise.start();
  noise.stop(c.currentTime + 1.5);
}

export function playPowerOn() {
  const c = getCtx();
  const noise = createNoise(1);
  noise.loop = false;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(50, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3000, c.currentTime + 0.8);
  gain.gain.setValueAtTime(0.001, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, c.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  noise.start();
  noise.stop(c.currentTime + 1.5);
}

export function playScream() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  const dist = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 400) * x / (Math.PI + 400 * Math.abs(x));
  }
  dist.curve = curve;
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, c.currentTime);
  osc.frequency.linearRampToValueAtTime(1400, c.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(300, c.currentTime + 1.5);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.7, c.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.8);
  osc.connect(dist);
  dist.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 2);
}

export function playStinger() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(40, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, c.currentTime + 1.5);
  gain.gain.setValueAtTime(0.001, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, c.currentTime + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 2.5);
}

export function playClick() {
  const c = getCtx();
  const buf = c.createBuffer(1, 100, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < 100; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 100);
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  gain.gain.value = 0.3;
  src.connect(gain);
  gain.connect(c.destination);
  src.start();
}

export function startHeartbeat() {
  if (heartbeatInterval) return;
  const beat = () => {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, c.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.35);
  };
  beat();
  heartbeatInterval = setInterval(beat, 800);
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function playFootstep() {
  const c = getCtx();
  const buf = c.createBuffer(1, c.sampleRate * 0.1, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const gain = c.createGain();
  gain.gain.value = 0.25;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
}

export function playLightning() {
  playThunder();
  setTimeout(playThunder, 1500);
}

export function playQTE(hit) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = hit ? 880 : 220;
  gain.gain.setValueAtTime(0.4, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.35);
}
