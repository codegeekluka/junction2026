// Walks a diagnosis tree (diagnosis.js) with the inspector's answers. One-shot: it emits a
// single outcome and then stops. Same interface as TaskRunner so the watcher can run either.
//   events: { kind: 'diagnosed' | 'escalate' | 'hazard' | 'cant_see', ... }

import { DIAGNOSES } from './diagnosis.js';
import { checkP } from './task-runner.js';

const SURE = 0.75;          // booth threshold for "very sure"
const CONSECUTIVE = 2;      // same confident answer twice in a row
const UNSURE_CHECKS = 6;    // ~3 s at 2 fps without a confident answer → escalate to Live
const QUALITY_MIN = 0.6;
const QUALITY_CONSECUTIVE = 3;

export class DiagnosisRunner {
  constructor(id) {
    this.id = id;
    this.kind = 'diagnosis';
    this.task = DIAGNOSES[id];
    if (!this.task) throw new Error(`Unknown diagnosis "${id}"`);
    this.finished = false;
    this.checks = 0;
    this.last = null;
    this.streak = 0;
    this.darkStreak = 0;
    this.hazardStreak = 0;
  }

  questions() { return this.task.questions; }

  status() {
    return { diagnosis: this.id, title: this.task.title, finished: this.finished, checks: this.checks };
  }

  /** Top problem candidates, e.g. "a leak at the drain trap 45%, a slow drain 30%". */
  #top(problem) {
    return Object.entries(problem?.probabilities ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([k, p]) => `${this.task.branches[k]?.label ?? k} ${Math.round(p * 100)}%`).join(', ');
  }

  update(answers) {
    const events = [];
    if (this.finished) return { events, headline: null };
    this.checks++;
    const t = this.task;
    const problem = answers?.problem;
    const headline = problem ? { choice: problem.choice, confidence: problem.confidence } : null;

    // Hazard first: urgent, regardless of anything else.
    if (t.hazard && checkP(t.hazard, answers) >= t.hazard.min) {
      if (++this.hazardStreak >= CONSECUTIVE) {
        this.finished = true;
        events.push({ kind: 'hazard', say: t.hazard.say });
        return { events, headline };
      }
    } else this.hazardStreak = 0;

    // Can't see → ask for a better view (don't count towards "unsure").
    const q = answers?.[t.quality];
    if (q && q.noul >= QUALITY_MIN) {
      if (++this.darkStreak === QUALITY_CONSECUTIVE) events.push({ kind: 'cant_see' });
      this.checks--;
      return { events, headline: { choice: problem?.choice, confidence: 0.5, cantSee: true } };
    }
    this.darkStreak = 0;

    // Walk the tree: confident problem + its branch's confirm check agrees, twice in a row.
    const branch = t.branches[problem?.choice];
    const confirmed = branch && (!branch.confirm || checkP(branch.confirm, answers) >= branch.confirm.min);
    if (problem && problem.confidence >= SURE && confirmed) {
      this.streak = this.last === problem.choice ? this.streak + 1 : 1;
      this.last = problem.choice;
      if (this.streak >= CONSECUTIVE) {
        this.finished = true;
        // Which expert procedure? For drain problems the trap type decides.
        let procedure = branch.procedure;
        if (procedure === 'by_trap') procedure = answers?.trap_type?.choice === 'u_pipe' ? 'ptrap' : 'bottle_trap';
        events.push({ kind: 'diagnosed', problem: problem.choice, label: branch.label, p: problem.confidence,
          procedure, nothingWrong: Boolean(branch.nothingWrong), showMe: branch.showMe ?? null });
      }
      return { events, headline };
    }
    this.streak = 0;
    this.last = null;

    // Not confident for a while → escalate to the reasoning model (Live) instead of guessing.
    if (this.checks >= UNSURE_CHECKS) {
      this.finished = true;
      const why = !problem ? 'no answer' : problem.confidence < SURE
        ? `top guesses: ${this.#top(problem)}`
        : `it looks like ${branch?.label ?? problem.choice} (${Math.round(problem.confidence * 100)}%) but the follow-up check didn't confirm it`;
      events.push({ kind: 'escalate', why });
    }
    return { events, headline };
  }
}
