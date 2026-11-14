// Watcher smoke test: node scripts/watch-smoke.js <set> <image.jpg> [seconds]
// Streams the image as a 1 fps "camera" and prints each Decisions API answer.
import fs from 'node:fs';
import WebSocket from 'ws';

const [set = 'bottle', image, secs = 6] = process.argv.slice(2);
const frame = fs.readFileSync(image).toString('base64');
const ws = new WebSocket(process.env.SMOKE_URL || 'ws://localhost:8080/live');
const lat = [];
ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'watch', set }));
  const t = setInterval(() => ws.send(JSON.stringify({ type: 'frame', data: frame })), 1000);
  setTimeout(() => { clearInterval(t); ws.close();
    lat.sort((a, b) => a - b);
    console.log(`answers: ${lat.length}, latency min/median: ${lat[0]}/${lat[Math.floor(lat.length / 2)]} ms`);
    process.exit(lat.length ? 0 : 1); }, secs * 1000);
});
let printed = false;
ws.on('message', (raw) => {
  const m = JSON.parse(raw);
  if (m.type === 'error') console.log('error:', m.message);
  if (m.type !== 'decision') return;
  if (m.error) return console.log(`check ${m.error} (${m.ms} ms)`);
  lat.push(m.ms);
  if (printed) return; printed = true;
  for (const [id, a] of Object.entries(m.answers)) {
    const v = a.type === 'noul' ? `P(yes)=${a.noul.toFixed(2)}` : a.type === 'choice' ? a.choice : a.score;
    console.log(`  ${id.padEnd(18)} ${String(v).padEnd(14)} confidence ${a.confidence.toFixed(2)}`);
  }
});
