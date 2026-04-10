// mic.js - Audio level detection for hiding mechanic
let audioCtx = null;
let analyser = null;
let stream = null;
let dataArray = null;

export async function initMic() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    return true;
  } catch (err) {
    console.error('Mic access denied:', err);
    return false;
  }
}

export function getVolume() {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  return sum / dataArray.length; // 0 to 255
}

export function stopMic() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }
  if (audioCtx) audioCtx.close();
  analyser = null;
}
