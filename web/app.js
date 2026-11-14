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
// Big plain answer + a separate certainty label. Colour only ever means certainty
// (the dot) or which answer it was (history strip), never "good/bad".
const OPTION_COLORS = ['#4ea8ff', '#ff7a59', '#c084fc', '#9ca3af', '#2dd4bf', '#f472b6'];
let watch = null;      // { headline, quality, questions, optionColor }
let history = [];      // last 20 { option, level } | { err }
let lastVerdict = null;

const certainty = (c) => c >= SURE ? ['sure', 'Very sure']
  : c >= MAYBE ? ['maybe', 'Fairly sure'] : ['unsure', 'Not sure. Show me another angle'];

function onWatch(msg) {
  const panel = $('watch-panel');
  if (msg.state !== 'on') { panel.hidden = true; watch = null; return; }
  const opts = msg.questions[msg.headline.question].options;
  watch = { ...msg, optionColor: Object.fromEntries(opts.map((o, i) => [o, OPTION_COLORS[i % OPTION_COLORS.length]])) };
  history = []; lastVerdict = null;
  panel.hidden = false;
  setStatus('live', 'Watching (Decisions API)');
  $('w-title').textContent = msg.headline.title;
  $('w-verdict').textContent = 'Looking…';
  $('w-legend').replaceChildren(...opts.map((o) => {
    const span = document.createElement('span');
    const sw = document.createElement('i');
    sw.style.background = watch.optionColor[o];
    span.append(sw, msg.headline.labels[o] ?? o);
    return span;
  }));
  $('fb-options').replaceChildren(...opts.map((o) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = msg.headline.labels[o] ?? o;
    b.onclick = () => sendFeedback(false, o);
    return b;
  }));
  $('fb-pick').hidden = true;
  $('fb-thanks').textContent = '';
  renderHistory();
}

function renderDecision(msg) {
  if (!watch) return;
  if (msg.error) {
    $('watch-meta').textContent = `last check ${msg.error} after ${(msg.ms / 1000).toFixed(1)} s`;
    pushHistory({ err: true });
    return;
  }
  const head = msg.answers?.[watch.headline.question];
  if (head) {
    const [level, text] = certainty(head.confidence);
    const verdict = watch.headline.labels[head.choice] ?? head.choice;
    if (verdict !== lastVerdict) { $('w-verdict').textContent = verdict; lastVerdict = verdict; } // announce changes only
    $('w-cert').dataset.level = level;
    $('w-cert-text').textContent = `${text} (${Math.round(head.confidence * 100)}%)`;
    $('w-meter').style.width = `${Math.round(head.confidence * 100)}%`;
    pushHistory({ option: head.choice, level });
  }
  const q = msg.answers?.[watch.quality];
  $('w-warn').hidden = !(q && q.noul >= MAYBE);
  $('watch-meta').textContent = `answered in ${(msg.ms / 1000).toFixed(2)} s`;
  $('watch-list').replaceChildren(...Object.entries(msg.answers ?? {})
    .filter(([id]) => id !== watch.headline.question)
    .map(([id, a]) => {
      const li = document.createElement('li');
      const ans = a.type === 'noul' ? (a.noul >= 0.5 ? 'Yes' : 'No')
        : a.type === 'choice' ? a.choice.replace(/_/g, ' ') : a.legend?.[Math.round(a.score)] ?? a.score;
      const l = document.createElement('span');
      l.textContent = watch.questions[id]?.label ?? id;
      const r = document.createElement('span');
      r.textContent = `${ans} · ${certainty(a.confidence)[0] === 'sure' ? 'very sure' : certainty(a.confidence)[0] === 'maybe' ? 'fairly sure' : 'not sure'}`;
      li.append(l, r);
      return li;
    }));
}

function pushHistory(entry) {
  history.push(entry);
  if (history.length > 20) history.shift();
  renderHistory();
}
function renderHistory() {
  $('w-history').replaceChildren(...Array.from({ length: 20 }, (_, i) => {
    const h = history[i - (20 - history.length)];
    const li = document.createElement('li');
    if (h?.err) li.className = 'err';
    else if (h) {
      li.style.background = watch.optionColor[h.option] ?? '#666';
      if (h.level === 'unsure') li.className = 'faint';
      li.title = watch.headline.labels[h.option] ?? h.option;
    }
    return li;
  }));
}

function sendFeedback(correct, expected) {
  sendMsg({ type: 'feedback', correct, expected });
  $('fb-pick').hidden = true;
  $('fb-thanks').textContent = correct ? 'Noted as right ✓'
    : `Noted: it was "${watch.headline.labels[expected] ?? expected}". Frame saved for tuning.`;
  setTimeout(() => ($('fb-thanks').textContent = ''), 3000);
}
$('fb-right').onclick = () => sendFeedback(true);
$('fb-wrong').onclick = () => { $('fb-pick').hidden = false; $('fb-thanks').textContent = ''; };

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
    document.body.classList.remove('running', 'watching');
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
  document.body.classList.add('running');
  document.body.classList.toggle('watching', mode !== 'coach');
  toggle.textContent = 'Stop';
  toggle.setAttribute('aria-pressed', 'true');
  connectSocket();
});

addEventListener('offline', () => running && setStatus('offline', 'No internet: waiting to reconnect…'));
