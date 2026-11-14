// Walks an expert procedure (tasks.js) using the watcher's Decisions API answers.
// Only verified checks move the procedure forward; the voice model can't skip ahead.
// Emits events: { kind: 'advance' | 'finished' | 'mistake' | 'cant_see' | 'out_of_view' | 'stuck', ... }
//
// v2 (Sat evening, after testing on the phone app with a bottle):
//  - "did it wrong but it moved on": 3 confident checks in a row (not 2); a step can't pass
//    while any mistake check is also firing; ACTION steps must first be seen NOT done (or the
//    done state must hold for a while), so a state that was already true doesn't skip the step.
//  - "doesn't notice when the object leaves the view": per-task inView check → out_of_view.

import { TASKS } from './tasks.js';

const CONSECUTIVE = 3;          // a check must hold in 3 answers in a row (~1.5 s at 2 fps) to count
const MISTAKE_CONSECUTIVE = 2;  // warnings react a bit faster than completions
const MISTAKE_BLOCKS = 0.5;     // any mistake signal ≥ this blocks the step from passing
const ALREADY_DONE_MS = 5000;   // action step already done when it started: accept after it holds this long
const QUALITY_MIN = 0.6;        // "too dark/blurry" if P(yes) ≥ this…
const QUALITY_CONSECUTIVE = 3;  // …in 3 answers in a row
const OUT_OF_VIEW_CONSECUTIVE = 4; // ~2 s at 2 fps without the object in view → tell the user
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
    this.lastWarn = {};     // warning id -> time
    this.finished = false;
    this.#enterStep();
  }

  get step() { return this.task.steps[this.i]; }

  #enterStep() {
    this.streak = {};       // check key -> consecutive passes
    this.sawNotDone = false; // has this step been seen NOT done yet?
    this.stepStart = Date.now();
    this.doneSince = null;
  }

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

    // 2. Is the object we're working on in view at all? (step-specific override possible)
    const inView = step.inView ?? this.task.inView;
    if (inView && checkP(inView, answers) < inView.min) {
      if (this.#bump('out') >= OUT_OF_VIEW_CONSECUTIVE && this.#cool('out_of_view', 8000)) {
        events.push({ kind: 'out_of_view', what: inView.what ?? 'it' });
      }
      this.streak.done = 0;
      return { events, headline: { choice: 'not_yet', confidence: 0.5, outOfView: true } };
    }
    this.streak.out = 0;

    // Remember if this step has been seen NOT done (before any early return below).
    const p = checkP(step.done, answers);
    if (p < 0.5) this.sawNotDone = true;

    // 3. Mistakes for this step (warn quickly, once per cooldown). Any mistake signal also
    //    blocks the step from passing in this answer.
    let mistakeSignal = 0;
    for (const m of step.mistakes ?? []) {
      const p = checkP(m, answers);
      mistakeSignal = Math.max(mistakeSignal, p);
      if (p >= m.min) {
        this.streak.done = 0;
        if (this.#bump(`m:${m.id}`) >= MISTAKE_CONSECUTIVE && this.#cool(m.id)) events.push({ kind: 'mistake', id: m.id, say: m.say, p, card: m.card });
        return { events, headline: { choice: 'mistake', confidence: p } };
      }
      this.streak[`m:${m.id}`] = 0;
    }

    // 4. Is the step done?
    const isAction = !step.gate && step.action !== false; // gates are state checks: "already true" is fine
    if (p >= step.done.min && mistakeSignal < MISTAKE_BLOCKS) {
      this.doneSince ??= Date.now();
      const earned = !isAction || this.sawNotDone || Date.now() - this.doneSince >= ALREADY_DONE_MS;
      if (this.#bump('done') >= CONSECUTIVE && earned) {
        const from = this.status().step;
        this.i++;
        if (this.i >= this.task.steps.length) {
          this.finished = true;
          events.push({ kind: 'finished', from });
        } else {
          this.#enterStep();
          events.push({ kind: 'advance', from, to: this.status().step });
        }
      }
      return { events, headline: { choice: 'done', confidence: p } };
    }
    this.streak.done = 0;
    this.doneSince = null;

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
    if (this.i >= this.task.steps.length) this.finished = true;
    else this.#enterStep();
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
