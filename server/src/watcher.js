// The watcher: runs the Gemini Decisions API on the latest camera frame, about once a
// second, and reports calibrated answers + confidence. Cheap and fast (~0.5 s), so it
// can watch continuously. Later (step 5) it walks the repair decision tree and asks
// Gemini Live for help when confidence is low.
//
// Lessons from probes/README.md: api_version v1beta is required, SDK auto-retries must be
// off, and a hard AbortSignal timeout is needed (one call once hung for 590 s).

import { GoogleGenAI } from '@google/genai';
import { QUESTION_SETS } from './questions.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-decision-1';
const INTERVAL_MS = Number(process.env.WATCH_INTERVAL_MS || 1000);
const TIMEOUT_MS = 3000;

export class Watcher {
  constructor(send, log = console.log) {
    this.send = send;
    this.log = log;
    this.frame = null;      // latest base64 JPEG (memory only)
    this.frameSeq = 0;
    this.lastAskedSeq = -1;
    this.timer = null;
    this.busy = false;
    this.setName = null;
  }

  start(setName) {
    if (!QUESTION_SETS[setName]) {
      this.send({ type: 'error', message: `Unknown question set "${setName}"` });
      return;
    }
    this.stop();
    this.setName = setName;
    this.send({ type: 'watch', state: 'on', set: setName, questions: describe(QUESTION_SETS[setName]) });
    this.timer = setInterval(() => this.#tick(), INTERVAL_MS);
  }

  setFrame(b64) {
    this.frame = b64;
    this.frameSeq++;
  }

  async #tick() {
    // One request in flight at a time; skip if there's no new frame since the last ask.
    if (this.busy || !this.frame || this.frameSeq === this.lastAskedSeq) return;
    this.busy = true;
    const seq = (this.lastAskedSeq = this.frameSeq);
    const t0 = performance.now();
    try {
      const res = await ai.decisions.create({
        api_version: 'v1beta',
        model: MODEL,
        input: [{ type: 'image', data: this.frame, mime_type: 'image/jpeg', resolution: 'low' }],
        questions: toApi(QUESTION_SETS[this.setName]),
      }, { retries: { strategy: 'none' }, fetch_options: { signal: AbortSignal.timeout(TIMEOUT_MS) } });
      if (!this.timer) return; // stopped while waiting
      this.send({
        type: 'decision',
        set: this.setName,
        ms: Math.round(performance.now() - t0),
        stale: this.frameSeq - seq, // frames that arrived while we waited
        answers: res.answers,
      });
    } catch (err) {
      const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
      this.log('[watch]', timedOut ? `timeout after ${TIMEOUT_MS} ms` : err?.message || err);
      this.send({ type: 'decision', set: this.setName, error: timedOut ? 'timeout' : 'failed',
        ms: Math.round(performance.now() - t0) });
    } finally {
      this.busy = false;
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    if (this.setName) this.send({ type: 'watch', state: 'off' });
    this.setName = null;
  }

  close() {
    this.stop();
    this.frame = null;
  }
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
