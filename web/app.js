// Plan B client: phone camera + mic -> backend (/live) -> Gemini Live -> coach voice.
// The glasses app (Device Access Toolkit) will speak the same WebSocket protocol.

const FRAME_INTERVAL_MS = 1000; // Live API takes ≤ 1 fps
const FRAME_WIDTH = 768;
const JPEG_QUALITY = 0.7;

const $ = (id) => document.getElementById(id);
const statusEl = $('status'), toggle = $('toggle'), video = $('preview'), transcript = $('transcript');

let ws, stream, micCtx, micNode, outCtx, frameTimer, wakeLock;
let running = false, playHead = 0, framesSent = 0, resumeHandle = null;
const playing = new Set();
let mode = 'coach';
const SURE = 0.75, MAYBE = 0.6; // certainty bands (green / yellow / grey), per the Google booth advice
let watchQuestions = {};

// ---------- UI helpers ----------
function setStatus(state, text) {
  statusEl.dataset.state = state;
  statusEl.textContent = text ?? ({
    connecting: 'Connecting…', reconnecting: 'Reconnecting…', live: 'Live: coach is watching',
    stopped: 'Stopped', offline: 'Offline', error: 'Problem',
  }[state] || state);
}
let lastLine = null;
function addLine(who, text) {
  // Transcripts arrive in fragments: append to the current line while the speaker is the same.
  if (lastLine && lastLine.dataset.who === who && who !== 'system') {
    lastLine.textContent += text;
  } else {
    lastLine = document.createElement('li');
    lastLine.className = who;
    lastLine.dataset.who = who;
    lastLine.textContent = text;
    transcript.append(lastLine);
  }
  transcript.scrollTop = transcript.scrollHeight;
}
const b64 = (buf) => {
  const bytes = new Uint8Array(buf); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

// ---------- Audio out (24 kHz PCM) ----------
function playPcm(base64) {
  const bin = atob(base64);
  const pcm = new Int16Array(bin.length / 2);
  for (let i = 0; i < pcm.length; i++) pcm[i] = (bin.charCodeAt(2 * i + 1) << 8) | bin.charCodeAt(2 * i);
  const buf = outCtx.createBuffer(1, pcm.length, 24000);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000;
  const src = outCtx.createBufferSource();
  src.buffer = buf;
  src.connect(outCtx.destination);
  playHead = Math.max(playHead, outCtx.currentTime + 0.05);
  src.start(playHead);
  playHead += buf.duration;
  playing.add(src);
  src.onended = () => playing.delete(src);
}
function stopPlayback() { // user interrupted the coach: drop queued speech immediately
  for (const s of playing) { try { s.stop(); } catch {} }
  playing.clear();
  playHead = 0;
}

// ---------- Socket ----------
function connectSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}/live`);
  ws.onopen = () => ws.send(JSON.stringify(mode === 'coach'
    ? { type: 'start', handle: resumeHandle }
    : { type: 'watch', set: mode }));
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    switch (msg.type) {
      case 'status': setStatus(msg.state); break;
      case 'audio': playPcm(msg.data); break;
      case 'interrupted': stopPlayback(); break;
      case 'transcript': addLine(msg.who, msg.text); break;
      case 'turnComplete': lastLine = null; break;
      case 'handle': resumeHandle = msg.handle; break;
      case 'error': addLine('system', msg.message); lastLine = null; break;
      case 'watch': onWatch(msg); break;
      case 'decision': renderDecision(msg); break;
    }
  };
  ws.onclose = () => {
    if (!running) return;
    setStatus('reconnecting', 'Connection lost. Reconnecting… (your progress is kept)');
    setTimeout(() => running && connectSocket(), 1500);
  };
}
// ---------- Watcher panel ----------
function onWatch(msg) {
  const panel = $('watch-panel');
  if (msg.state !== 'on') { panel.hidden = true; return; }
  watchQuestions = msg.questions;
  panel.hidden = false;
  setStatus('live', 'Watching (Decisions API)');
  $('watch-list').replaceChildren(...Object.entries(watchQuestions).map(([id, q]) => {
    const li = document.createElement('li');
    li.id = `q-${id}`; li.className = 'unsure';
    li.innerHTML = '<span class="q"></span><span class="a">–</span><span class="bar"><span></span></span>';
    li.querySelector('.q').textContent = q.label;
    return li;
  }));
}
function renderDecision(msg) {
  if (msg.error) { $('watch-meta').textContent = `Last check ${msg.error} (${msg.ms} ms). Retrying…`; return; }
  $('watch-meta').textContent = `Answered in ${(msg.ms / 1000).toFixed(2)} s`;
  for (const [id, a] of Object.entries(msg.answers ?? {})) {
    const li = $(`q-${id}`);
    if (!li) continue;
    let text, conf = a.confidence ?? 0;
    if (a.type === 'noul') text = a.noul >= 0.5 ? `Yes ${Math.round(a.noul * 100)}%` : `No ${Math.round((1 - a.noul) * 100)}%`;
    else if (a.type === 'choice') text = `${a.choice.replace(/_/g, ' ')} ${Math.round(conf * 100)}%`;
    else text = `${a.legend?.[Math.round(a.score)] ?? a.score?.toFixed(1)} ${Math.round(conf * 100)}%`;
    li.className = conf >= SURE ? 'sure' : conf >= MAYBE ? 'maybe' : 'unsure';
    li.querySelector('.a').textContent = conf >= MAYBE ? text : `unsure (${text})`;
    li.querySelector('.bar > span').style.width = `${Math.round(conf * 100)}%`;
  }
}

const sendMsg = (m) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify(m));

// ---------- Capture ----------
async function startCapture() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  video.srcObject = stream;

  micCtx = new AudioContext({ sampleRate: 16000 });
  await micCtx.audioWorklet.addModule('pcm-worklet.js');
  micNode = new AudioWorkletNode(micCtx, 'pcm-capture');
  micNode.port.onmessage = (e) => mode === 'coach' && sendMsg({ type: 'audio', data: b64(e.data) });
  micCtx.createMediaStreamSource(stream).connect(micNode);

  outCtx = new AudioContext({ sampleRate: 24000 });

  const canvas = document.createElement('canvas');
  frameTimer = setInterval(() => {
    if (!video.videoWidth) return;
    canvas.width = FRAME_WIDTH;
    canvas.height = Math.round(FRAME_WIDTH * video.videoHeight / video.videoWidth);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
    if (sendMsg({ type: 'frame', data })) $('frames').textContent = ++framesSent;
  }, FRAME_INTERVAL_MS);

  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
}

function stopCapture() {
  clearInterval(frameTimer);
  stream?.getTracks().forEach((t) => t.stop());
  micCtx?.close(); outCtx?.close();
  stopPlayback();
  video.srcObject = null;
  wakeLock?.release?.();
}

// ---------- Start / stop ----------
toggle.addEventListener('click', async () => {
  if (running) {
    running = false;
    sendMsg({ type: 'stop' });
    ws?.close();
    stopCapture();
    resumeHandle = null;
    toggle.textContent = 'Start';
    toggle.setAttribute('aria-pressed', 'false');
    document.querySelectorAll('input[name="mode"]').forEach((r) => (r.disabled = false));
    $('watch-panel').hidden = true;
    setStatus('stopped');
    return;
  }
  mode = document.querySelector('input[name="mode"]:checked').value;
  document.querySelectorAll('input[name="mode"]').forEach((r) => (r.disabled = true));
  try {
    await startCapture();
  } catch (err) {
    const denied = err?.name === 'NotAllowedError';
    setStatus('error', denied ? 'Camera or microphone blocked' : 'Camera or microphone unavailable');
    addLine('system', denied
      ? 'Please allow camera and microphone access in your browser settings, then press Start again.'
      : `Could not open camera/microphone (${err?.name || err}). Check no other app is using them.`);
    lastLine = null;
    document.querySelectorAll('input[name="mode"]').forEach((r) => (r.disabled = false));
    return;
  }
  running = true;
  toggle.textContent = 'Stop';
  toggle.setAttribute('aria-pressed', 'true');
  connectSocket();
});

addEventListener('offline', () => running && setStatus('offline', 'No internet: waiting to reconnect…'));
