// End-to-end test of voice + inspector with recorded frames as a fake camera.
//   node scripts/task-e2e.js <standing.jpg> <fallen.jpg> <held.jpg>
// Asks the coach (by text) to start the bottle practice, then "acts out" each step by
// switching the fake camera frame, and prints what the coach says and the step card.
import fs from 'node:fs';
import WebSocket from 'ws';

const [standing, fallen, held] = process.argv.slice(2).map((f) => fs.readFileSync(f).toString('base64'));
const ws = new WebSocket(process.env.SMOKE_URL || 'ws://localhost:8080/live');
const t0 = Date.now();
const at = () => `${((Date.now() - t0) / 1000).toFixed(1).padStart(5)}s`;
let frame = standing, said = '';
// The fake camera reacts to the step card, like a person following instructions.
// In step 3 it first does the WRONG thing (lifts the bottle) to trigger a mistake warning.
const showFor = { 1: standing, 2: standing, 3: held, 4: fallen }; // step 4: lifts only when saying "done"
let started = false, warned = false;
const show = (f, label) => { if (frame !== f) console.log(`${at()} [camera] ${label}`); frame = f; };

// Behave like the real client: the server sets the frame rate and can ask for a snapshot.
let timer, frames = 0;
const sendFrame = () => { frames++; ws.send(JSON.stringify({ type: 'frame', data: frame })); };
const setRate = (fps) => { clearInterval(timer); timer = setInterval(sendFrame, 1000 / fps); };
const say = (text) => { console.log(`${at()} YOU: ${text}`); ws.send(JSON.stringify({ type: 'text', text })); };
let saidDone = false;

ws.on('open', () => ws.send(JSON.stringify({ type: 'start' })));
ws.on('message', (raw) => {
  const m = JSON.parse(raw);
  if (m.type === 'status' && m.state === 'live' && !started) {
    started = true;
    setRate(0.5);
    setTimeout(() => say("Let's do the bottle practice."), 2000);
  }
  if (m.type === 'capture') { console.log(`${at()} [capture] ${m.fps} fps (${m.reason})`); if (started) setRate(m.fps); }
  if (m.type === 'snap') sendFrame();
  if (m.type === 'hud') {
    console.log(`${at()} [step card] ${m.state}${m.step ? ` ${m.step} "${m.title}"` : ''}${m.verified ? ` ✓ verified "${m.verified}"` : ''}${m.warning ? ` ⚠ ${m.warning}` : ''}`);
    const n = Number(m.step?.split('/')[0]);
    if (m.state === 'mistake') { warned = true; setTimeout(() => show(fallen, 'fallen (fixing the mistake)'), 3000); }
    else if (m.state === 'doing' && n) show(n === 3 && !warned ? held : showFor[n], n === 3 && !warned ? 'held (WRONG: should tip it, not lift)' : `doing step ${n}`);
    // Step 4 is a normal (slow-rate) step: the user says "done" → verify_now burst.
    if (m.state === 'doing' && n === 4 && !saidDone) { saidDone = true; setTimeout(() => { show(held, 'held (picked up)'); say("Done, I've picked it up."); }, 6000); }
    if (m.state === 'finished') setTimeout(() => { console.log(`frames sent: ${frames} in ${at()}`); process.exit(0); }, 7000);
  }
  if (m.type === 'transcript' && m.who === 'coach') said += m.text;
  if (m.type === 'turnComplete' && said) { console.log(`${at()} COACH: ${said.trim()}`); said = ''; }
  if (m.type === 'error') console.log(`${at()} error: ${m.message}`);
});
setTimeout(() => { console.log('hard timeout'); process.exit(1); }, 150000);
