// The watcher: runs the Gemini Decisions API on the latest camera frame, about once a
// second, and reports calibrated answers + confidence. Cheap and fast (~0.5 s), so it
// can watch continuously. Two modes:
//   start(set)        – a plain question set (bottle / sink tests, tuning)
//   startTask(runner) – an expert procedure: every answer goes to the TaskRunner, whose
//                       events (step verified, mistake, can't see) go to onTaskEvents.
//
// Lessons from probes/README.md: api_version v1beta is required, SDK auto-retries must be
// off, and a hard AbortSignal timeout is needed (one call once hung for 590 s).

import { QUESTION_SETS, HEADLINES, QUALITY_QUESTION } from './questions.js';
import { STEP_HEADLINE } from './task-runner.js';

const MODEL = 'gemini-decision-1';
const INTERVAL_MS = Number(process.env.WATCH_INTERVAL_MS || 450); // ~2 checks/s (frames arrive at ~2 fps)
const TIMEOUT_MS = 3000;

export class Watcher {
  constructor(send, log = console.log, recorder = null) {
    this.send = send;
    this.recorder = recorder;
    this.lastDecision = null;  // last answers + the frame they were computed on (for feedback)
    this.lastFrameUsed = null;
    this.log = log;
    this.frame = null;      // latest base64 JPEG (memory only)
    this.frameSeq = 0;
    this.lastAskedSeq = -1;
    this.timer = null;
    this.busy = false;
    this.setName = null;
    this.questions = null;
    this.runner = null;
    this.calls = 0;
    this.burstLeft = 0;
    this.burstCb = null;
    /** @type {(events: object[], runner: import('./task-runner.js').TaskRunner) => void} */
    this.onTaskEvents = () => {};
  }

  start(setName) {
    if (!QUESTION_SETS[setName]) {
      this.send({ type: 'error', message: `Unknown question set "${setName}"` });
      return;
    }
    this.#begin(setName, QUESTION_SETS[setName], HEADLINES[setName], QUALITY_QUESTION, null);
    this.send({ type: 'capture', fps: 2, reason: 'tuning: steady checks' });
  }

  /** Run an expert procedure: all its questions are asked on every frame. */
  startTask(runner) {
    const questions = describe(runner.questions());
    questions.__step = { type: 'choice', label: 'Current step', options: Object.keys(STEP_HEADLINE.labels) };
    this.#begin(`task:${runner.id}`, runner.questions(), STEP_HEADLINE, runner.task.quality, runner, questions);
  }

  #begin(name, questions, headlineDef, quality, runner, described = describe(questions)) {
    this.stop();
    this.setName = name;
    this.questions = questions;
    this.runner = runner;
    this.send({ type: 'watch', state: 'on', set: name, questions: described, headline: headlineDef, quality });
    this.recorder?.start(name);
    this.timer = setInterval(() => this.#tick(), INTERVAL_MS);
  }

  setFrame(b64) {
    this.frame = b64;
    this.frameSeq++;
    if (this.burstLeft > 0) this.#tick(); // verifying on request: check this frame right away
  }

  /** Check the next n frames as soon as they arrive, then call cb(lastDecision). */
  burst(n, cb) {
    this.burstLeft = n;
    this.burstCb = cb;
  }

  async #tick() {
    // One request in flight at a time; skip if there's no new frame since the last ask.
    if (this.busy || !this.frame || this.frameSeq === this.lastAskedSeq) return;
    this.busy = true;
    const seq = (this.lastAskedSeq = this.frameSeq);
    const frame = this.frame;
    const t0 = performance.now();
    try {
      this.calls++;
      const { res, serverMs } = await callDecisions({
        model: MODEL,
        input: [{ type: 'image', data: frame, mime_type: 'image/jpeg', resolution: 'low' }],
        questions: toApi(this.questions),
      });
      if (!this.timer) return; // stopped while waiting
      let head, events = [];
      if (this.runner) ({ headline: head, events } = this.runner.update(res.answers));
      else head = headline(this.setName, res.answers);
      const msg = {
        type: 'decision',
        set: this.setName,
        ms: Math.round(performance.now() - t0),
        stale: this.frameSeq - seq, // frames that arrived while we waited
        serverMs,                   // Google's own processing time (server-timing header)
        answers: res.answers,
        headline: head,
      };
      this.lastDecision = msg;
      this.lastFrameUsed = frame;
      this.send(msg);
      this.recorder?.decision(msg, frame);
      if (events.length) {
        this.recorder?.taskEvents(events);
        this.onTaskEvents(events, this.runner);
      }
      if (this.burstLeft > 0 && --this.burstLeft === 0) {
        const cb = this.burstCb;
        this.burstCb = null;
        cb?.(msg, events);
      }
    } catch (err) {
      const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
      this.log('[watch]', timedOut ? `timeout after ${TIMEOUT_MS} ms` : err?.message || err);
      const msg = { type: 'decision', set: this.setName, error: timedOut ? 'timeout' : 'failed',
        ms: Math.round(performance.now() - t0) };
      this.send(msg);
      // Was it the network? Ping Google right now: fast ping => the slowness was Google's side.
      msg.pingMs = await pingGoogle();
      this.recorder?.decision(msg);
    } finally {
      this.busy = false;
    }
  }

  /** User tapped Right/Wrong on the current answer. */
  feedback(fb) {
    this.recorder?.feedback(fb, this.lastDecision, this.lastFrameUsed);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    if (this.setName) this.send({ type: 'watch', state: 'off' });
    this.setName = null;
    this.runner = null;
  }

  close() {
    this.stop();
    this.frame = null;
  }
}

// Direct REST call (instead of the SDK) so we can read Google's server-timing header.
async function callDecisions(body) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/decisions', {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const serverMs = Number(r.headers.get('server-timing')?.match(/dur=([\d.]+)/)?.[1]) || undefined;
  const res = await r.json();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${res.error?.message ?? JSON.stringify(res).slice(0, 200)}`);
  return { res, serverMs: serverMs && Math.round(serverMs) };
}

// Round trip to Google's front door, without any model work (ms, or -1 if it failed too).
async function pingGoogle() {
  const t0 = performance.now();
  try {
    await fetch('https://generativelanguage.googleapis.com/', { method: 'HEAD', signal: AbortSignal.timeout(2000) });
    return Math.round(performance.now() - t0);
  } catch { return -1; }
}

// Combine answers into the one verdict the user sees (a tiny decision tree):
// if the set has a gate ("is a bottle there at all?"), the gate decides presence first;
// if the gate and the multiple-choice answer disagree, certainty drops to "not sure".
export function headline(setName, answers) {
  const h = HEADLINES[setName];
  if (!h) return null;
  const main = answers?.[h?.question];
  if (!main) return null;
  if (!h.gate) return { choice: main.choice, confidence: main.confidence };
  const gate = answers[h.gate.question];
  if (!gate) return { choice: main.choice, confidence: main.confidence };
  const present = gate.noul >= 0.5;
  if (!present) {
    // Gate says absent. If the choice agrees, take the stronger certainty; otherwise unsure.
    const agrees = main.choice === h.gate.absent;
    return { choice: h.gate.absent, confidence: agrees ? Math.max(gate.confidence, main.confidence) : Math.min(gate.confidence, 0.55), conflict: !agrees };
  }
  if (main.choice === h.gate.absent) {
    // Gate says present but the choice says absent: say we're unsure.
    return { choice: main.choice, confidence: Math.min(main.confidence, 0.55), conflict: true };
  }
  return { choice: main.choice, confidence: Math.min(main.confidence, gate.confidence) };
}

// Strip our UI-only fields (label) before sending: the API validates question fields.
function toApi(set) {
  return Object.fromEntries(Object.entries(set).map(([id, { label, ...q }]) => [id, q]));
}

// Labels for the UI, without sending the full prompts around.
function describe(set) {
  return Object.fromEntries(Object.entries(set).map(([id, q]) => [id, {
    type: q.type, label: q.label ?? q.instructions,
    options: q.type === 'choice' ? Object.keys(q.criteria) : q.type === 'score' ? q.criteria : undefined,
  }]));
}
