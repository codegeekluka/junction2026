// Backend: serves the web client and relays each client's WebSocket to Gemini Live.
//   http://localhost:8080   – laptop testing
//   https://<laptop-ip>:8443 – phone on the same Wi-Fi (self-signed cert: accept the warning once).
//   Browsers only allow camera/mic on HTTPS or localhost, hence the second port.

import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { generate } from 'selfsigned';
import { CoachSession } from './live.js';
import { Watcher } from './watcher.js';
import { Recorder } from './recorder.js';
import { connect } from './orchestrator.js';
import { CARDS_DIR } from './cards.js';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY missing. Put it in the repo-root .env (see .env.example).');
  process.exit(1);
}

const HTTP_PORT = Number(process.env.PORT || 8080);
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 8443);
const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web');

const app = express();
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(express.static(webDir));
app.use('/cards', express.static(CARDS_DIR, { maxAge: '1h' })); // designers' glasses display cards

function attachLive(server) {
  const wss = new WebSocketServer({ server, path: '/live' });
  wss.on('connection', (ws, req) => {
    const id = Math.random().toString(36).slice(2, 7);
    const log = (...a) => console.log(`[${id}]`, ...a);
    log('client connected from', req.socket.remoteAddress);
    const send = (msg) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg)); };
    const coach = new CoachSession(send, log);
    const recorder = new Recorder(id);
    const watcher = new Watcher(send, log, recorder);
    const orch = connect({ coach, watcher, send, log, recorder });

    const usage = { t0: Date.now(), frames: 0, frameBytes: 0, audioBytes: 0 };

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      switch (msg.type) {
        case 'start': coach.start(msg.handle).catch(() => {}); break;
        case 'audio': usage.audioBytes += msg.data.length * 0.75; coach.sendAudio(msg.data); break;
        case 'frame':
          usage.frames++; usage.frameBytes += msg.data.length * 0.75;
          coach.sendFrame(msg.data); watcher.setFrame(msg.data); break;
        case 'watch': watcher.start(msg.set); break;
        case 'unwatch': watcher.stop(); break;
        case 'task': orch.startTask(msg.task); break;
        case 'diagnose': orch.diagnose(msg.area); break;
        case 'simulate_drop': coach.simulateDrop(); break;
        case 'feedback': watcher.feedback(msg); break;
        case 'text': coach.sendText(msg.text); break;
        case 'stop': coach.close(); watcher.close(); send({ type: 'status', state: 'stopped' }); break;
      }
    });
    ws.on('close', () => {
      const min = Math.max((Date.now() - usage.t0) / 60000, 1 / 60);
      const stats = {
        minutes: +min.toFixed(2),
        frames_per_min: Math.round(usage.frames / min),
        frame_kb_per_min: Math.round(usage.frameBytes / 1024 / min),
        audio_kb_per_min: Math.round(usage.audioBytes / 1024 / min),
        frames_to_live_per_min: Math.round(coach.framesToLive / min),
        inspector_checks_per_min: Math.round(watcher.calls / min),
      };
      log('usage', JSON.stringify(stats));
      if (usage.frames) recorder.stats(stats);
      coach.close(); watcher.close();
    });
  });
}

const httpServer = http.createServer(app);
attachLive(httpServer);
httpServer.listen(HTTP_PORT, () => console.log(`Laptop:  http://localhost:${HTTP_PORT}`));

const lanIps = Object.values(os.networkInterfaces()).flat()
  .filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
const pems = await generate([{ name: 'commonName', value: 'sink-coach.local' }], {
  days: 30, extensions: [{ name: 'subjectAltName', altNames: [
    { type: 2, value: 'localhost' }, ...lanIps.map((ip) => ({ type: 7, ip })),
  ] }],
});
const httpsServer = https.createServer({ key: pems.private, cert: pems.cert }, app);
attachLive(httpsServer);
httpsServer.listen(HTTPS_PORT, () => {
  for (const ip of lanIps) console.log(`Phone:   https://${ip}:${HTTPS_PORT}  (accept the certificate warning)`);
});
