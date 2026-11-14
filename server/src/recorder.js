// Dev-only session log, for tuning the watcher. Writes to server/logs/<session>/ (git-ignored):
//   events.jsonl : every decision (answers, confidence, latency), every user feedback tap
//   frames/      : the camera frame for each feedback tap (so we can see what it got wrong)
//                  + every evaluated frame if RECORD_FRAMES=1
// Disable entirely with DEV_LOG=0 (e.g. for the real demo / privacy).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENABLED = process.env.DEV_LOG !== '0';
const ALL_FRAMES = process.env.RECORD_FRAMES === '1';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../logs');

export class Recorder {
  constructor(id) {
    this.enabled = ENABLED;
    if (!this.enabled) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    this.dir = path.join(root, `${stamp}_${id}`);
    this.n = 0;
    this.made = false;
  }
  #ensureDir() {
    if (!this.made) { fs.mkdirSync(path.join(this.dir, 'frames'), { recursive: true }); this.made = true; }
  }
  #write(obj) {
    if (!this.enabled) return;
    this.#ensureDir();
    fs.appendFileSync(path.join(this.dir, 'events.jsonl'), JSON.stringify({ t: Date.now(), ...obj }) + '\n');
  }
  #saveFrame(b64, name) {
    this.#ensureDir();
    const file = path.join('frames', `${name}.jpg`);
    fs.writeFileSync(path.join(this.dir, file), Buffer.from(b64, 'base64'));
    return file;
  }
  start(set) { this.#write({ ev: 'watch', set }); }
  decision(msg, frameB64) {
    if (!this.enabled) return;
    const n = ++this.n;
    const frame = ALL_FRAMES && frameB64 ? this.#saveFrame(frameB64, `d${String(n).padStart(4, '0')}`) : undefined;
    this.#write({ ev: 'decision', n, set: msg.set, ms: msg.ms, serverMs: msg.serverMs, pingMs: msg.pingMs, error: msg.error, stale: msg.stale, answers: msg.answers, headline: msg.headline, frame });
  }
  taskEvents(events) {
    for (const e of events) this.#write({ ev: 'task', ...e });
  }
  coach(event) { this.#write({ ev: 'coach', ...event }); }
  stats(s) { this.#write({ ev: 'stats', ...s }); }
  feedback(fb, lastDecision, frameB64) {
    if (!this.enabled) return;
    const frame = frameB64 ? this.#saveFrame(frameB64, `fb${String(this.n).padStart(4, '0')}_${Date.now() % 100000}`) : undefined;
    this.#write({ ev: 'feedback', correct: fb.correct, expected: fb.expected, note: fb.note,
      decision_n: this.n, answers: lastDecision?.answers, headline: lastDecision?.headline, frame });
  }
}
