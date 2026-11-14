// Walks an expert procedure (tasks.js) using the watcher's Decisions API answers.
// Only verified checks move the procedure forward; the voice model can't skip ahead.
// Emits events: { kind: 'advance' | 'finished' | 'mistake' | 'cant_see', ... }

import { TASKS } from './tasks.js';

const CONSECUTIVE = 2;          // a check must hold in 2 answers in a row (~1–2 s) to count
const QUALITY_MIN = 0.6;        // "too dark/blurry" if P(yes) ≥ this…
const QUALITY_CONSECUTIVE = 3;  // …in 3 answers in a row
const COOLDOWN_MS = 10000;      // don't repeat the same warning within 10 s
const STUCK_CHECKS = 8;         // done-check stuck in the "can't tell" band this many checks → ask Live
const STUCK_BAND = [0.25, 0.75];

/** Probability that a check { q, is?, min } holds, from one set of answers. */
export function checkP(check, answers) {
  const a = answers?.[check.q];
  if (!a) return 0;
  if (a.type === 'noul') return check.is === false ? 1 - a.noul : a.noul;
  if (a.type === 'choice') return a.probabilities?.[check.is] ?? (a.choice === check.is ? a.confidence : 0);
  return 0;
}

export class TaskRunner {
  constructor(taskId) {
    this.id = taskId;
    this.task = TASKS[taskId];
    if (!this.task) throw new Error(`Unknown task "${taskId}"`);
    this.i = 0;
    this.streak = {};       // check key -> consecutive passes
    this.lastWarn = {};     // warning id -> time
    this.finished = false;
  }

  get step() { return this.task.steps[this.i]; }

  status() {
    return {
      task: this.id, title: this.task.title, finished: this.finished,
      step: this.finished ? null : { n: this.i + 1, of: this.task.steps.length, id: this.step.id,
        title: this.step.title, say: this.step.say, gate: Boolean(this.step.gate) },
    };
  }

  /** Feed one Decisions API result. Returns { events, headline } for the UI and the coach. */
  update(answers) {
    const events = [];
    if (this.finished) return { events, headline: { choice: 'done', confidence: 1 } };
    const step = this.step;

    // 1. Can we even see? Pause judging while the view is bad.
    const q = answers?.[this.task.quality];
    if (q && q.noul >= QUALITY_MIN) {
      if (this.#bump('quality') >= QUALITY_CONSECUTIVE && this.#cool('cant_see')) events.push({ kind: 'cant_see' });
      return { events, headline: { choice: 'not_yet', confidence: 0.5, cantSee: true } };
    }
    this.streak.quality = 0;

    // 2. Mistakes for this step (warn immediately, once per cooldown).
    for (const m of step.mistakes ?? []) {
      const p = checkP(m, answers);
      if (p >= m.min) {
        if (this.#bump(`m:${m.id}`) >= CONSECUTIVE && this.#cool(m.id)) events.push({ kind: 'mistake', id: m.id, say: m.say, p });
        return { events, headline: { choice: 'mistake', confidence: p } };
      }
      this.streak[`m:${m.id}`] = 0;
    }

    // 3. Is the step done?
    const p = checkP(step.done, answers);
    if (p >= step.done.min) {
      if (this.#bump('done') >= CONSECUTIVE) {
        const from = this.status().step;
        this.i++;
        this.streak = {};
        if (this.i >= this.task.steps.length) {
          this.finished = true;
          events.push({ kind: 'finished', from });
        } else {
          events.push({ kind: 'advance', from, to: this.status().step });
        }
      }
      return { events, headline: { choice: 'done', confidence: p } };
    }
    this.streak.done = 0;
    // Escalation: the inspector can't decide (≈ 25–75%) for a while → hand it to the
    // reasoning model, which can look itself and ask for another angle.
    if (p >= STUCK_BAND[0] && p < STUCK_BAND[1]) {
      if (this.#bump('stuck') >= STUCK_CHECKS && this.#cool(`stuck:${step.id}`, 20000)) {
        events.push({ kind: 'stuck', title: step.title, p });
        this.streak.stuck = 0;
      }
    } else this.streak.stuck = 0;
    return { events, headline: { choice: 'not_yet', confidence: 1 - p } };
  }

  /** User asked to skip. Safety (gate) steps can't be skipped. */
  skip() {
    if (this.finished) return { ok: false, reason: 'Task already finished.' };
    if (this.step.gate) return { ok: false, reason: `"${this.step.title}" is a safety step and can't be skipped.` };
    const from = this.status().step;
    this.i++;
    this.streak = {};
    if (this.i >= this.task.steps.length) this.finished = true;
    return { ok: true, from, to: this.status().step };
  }

  /** All questions for one Decisions API call (every step's checks, ~0.4 s regardless of count). */
  questions() { return this.task.questions; }

  #bump(key) { return (this.streak[key] = (this.streak[key] ?? 0) + 1); }
  #cool(id, ms = COOLDOWN_MS) {
    const now = Date.now();
    if (now - (this.lastWarn[id] ?? 0) < ms) return false;
    this.lastWarn[id] = now;
    return true;
  }
}

// Labels for the watcher panel when a task is running.
export const STEP_HEADLINE = {
  question: '__step',
  title: 'Current step',
  labels: { done: 'Step done ✓', not_yet: 'Not done yet', mistake: 'Problem spotted' },
};
