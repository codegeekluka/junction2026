// End-to-end test: diagnosis → offer procedure → start it.
//   node scripts/diag-e2e.js <frame.jpg> ["first sentence"] ["reply after the diagnosis"]
import fs from 'node:fs';
import WebSocket from 'ws';

const [img, first = "Something's wrong with my bottle, can you take a look?", reply = "Yes, let's fix it."] = process.argv.slice(2);
const frame = fs.readFileSync(img).toString('base64');
const ws = new WebSocket(process.env.SMOKE_URL || 'ws://localhost:8080/live');
const t0 = Date.now(), at = () => `${((Date.now() - t0) / 1000).toFixed(1).padStart(5)}s`;
let timer, said = '', started = false, replied = false;
const sendFrame = () => ws.send(JSON.stringify({ type: 'frame', data: frame }));
const say = (text) => { console.log(`${at()} YOU: ${text}`); ws.send(JSON.stringify({ type: 'text', text })); };

ws.on('open', () => ws.send(JSON.stringify({ type: 'start' })));
ws.on('message', (raw) => {
  const m = JSON.parse(raw);
  if (m.type === 'status' && m.state === 'live' && !started) { started = true; timer = setInterval(sendFrame, 2000); setTimeout(() => say(first), 1500); }
  if (m.type === 'capture') { console.log(`${at()} [capture] ${m.fps} fps (${m.reason})`); clearInterval(timer); timer = setInterval(sendFrame, 1000 / m.fps); }
  if (m.type === 'snap') sendFrame();
  if (m.type === 'hud') {
    console.log(`${at()} [card] ${m.state} · ${m.task ?? ''} · ${m.title ?? ''} · ${m.say ?? ''}`);
    if (m.state === 'doing' && m.task !== 'Diagnosis') { console.log(`${at()} → procedure started`); setTimeout(() => process.exit(0), 5000); }
  }
  if (m.type === 'transcript' && m.who === 'coach') said += m.text;
  if (m.type === 'turnComplete' && said) {
    console.log(`${at()} COACH: ${said.trim()}`);
    if (/fix it together|want to|would you like|shall we|should we/i.test(said) && !replied) { replied = true; setTimeout(() => say(reply), 800); }
    said = '';
  }
  if (m.type === 'error') console.log(`${at()} error: ${m.message}`);
});
setTimeout(() => { console.log('timeout'); process.exit(1); }, 70000);
