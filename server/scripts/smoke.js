// Smoke test for the core loop without a phone:
//   node scripts/smoke.js [image.jpg]
// Connects to the local backend, sends a frame (optional) + a text question,
// and checks that the coach answers with audio + a transcript.
import fs from 'node:fs';
import WebSocket from 'ws';

const url = process.env.SMOKE_URL || 'ws://localhost:8080/live';
const image = process.argv[2];
const ws = new WebSocket(url);
let audioChunks = 0, coachText = '', t0, firstAudioMs;

const done = (ok, why) => {
  console.log(ok ? 'PASS' : 'FAIL', why);
  console.log(`audio chunks: ${audioChunks}, first audio after: ${firstAudioMs ?? '-'} ms`);
  console.log(`coach said: ${coachText.trim() || '(no transcript)'}`);
  ws.close(); process.exit(ok ? 0 : 1);
};
setTimeout(() => done(audioChunks > 0, 'timeout (30 s)'), 30000);

ws.on('open', () => ws.send(JSON.stringify({ type: 'start' })));
ws.on('message', (raw) => {
  const m = JSON.parse(raw);
  if (m.type === 'status') {
    console.log('status:', m.state);
    if (m.state === 'live') {
      // Like a camera: a few frames at 1 fps, then the question.
      const frame = image && fs.readFileSync(image).toString('base64');
      const frames = image ? 3 : 0;
      for (let i = 0; i < frames; i++) setTimeout(() => ws.send(JSON.stringify({ type: 'frame', data: frame })), i * 1000);
      setTimeout(() => { t0 = Date.now(); ws.send(JSON.stringify({ type: 'text', text: image
        ? 'What do you see in the camera right now? Answer in one short sentence.'
        : 'Say hello in one short sentence.' })); }, frames * 1000);
    }
  }
  if (m.type === 'audio') { audioChunks++; firstAudioMs ??= Date.now() - t0; }
  if (m.type === 'transcript' && m.who === 'coach') coachText += m.text;
  if (m.type === 'error') console.log('error:', m.message);
  if (m.type === 'turnComplete' && audioChunks > 0) done(true, 'turn complete');
});
ws.on('error', (e) => done(false, e.message));
