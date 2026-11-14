// Connects the two Gemini models for one session:
//   Gemini Live (live.js)  – the voice. Starts expert procedures via tools.
//   Decisions API (watcher) – the inspector. Verifies each step on camera.
// Verified events from the watcher become short [INSPECTOR] messages the coach speaks,
// and 'hud' messages for the screen / glasses display.

import { TaskRunner } from './task-runner.js';
import { TASKS } from './tasks.js';

export function connect({ coach, watcher, send, log, recorder }) {
  let runner = null;

  const hud = (state, extra = {}) => {
    const s = runner?.status();
    send({ type: 'hud', state, task: s?.title ?? null,
      step: s?.step ? `${s.step.n}/${s.step.of}` : null, title: s?.step?.title ?? null,
      say: s?.step?.say ?? null, gate: s?.step?.gate ?? false, ...extra });
  };

  // ---- Inspector → voice ----
  // Steps can be verified faster than the coach can speak. So verified steps are batched
  // for a moment and the coach is always told the CURRENT step (not a queue of old ones).
  // Mistakes go out immediately.
  const BATCH_MS = 1200;
  let verified = [];
  let timer = null;

  const flush = () => {
    clearTimeout(timer);
    timer = null;
    if (!runner || !verified.length) return;
    const done = verified.map((s) => `"${s}"`).join(' and ');
    verified = [];
    const s = runner.status();
    if (s.finished) {
      coach.notify(`Verified on camera: ${done} done. That was the last step: the whole job is finished. Congratulate them in one sentence.`);
    } else {
      coach.notify(`Verified on camera: ${done} done. The current step is now ${s.step.n} of ${s.step.of}: "${s.step.title}"` +
        `${s.step.gate ? ' (safety step)' : ''}. Briefly confirm, then tell the user: ${s.step.say}`);
    }
  };

  watcher.onTaskEvents = (events) => {
    for (const e of events) {
      recorder?.coach({ kind: e.kind });
      if (e.kind === 'advance' || e.kind === 'finished') {
        verified.push(e.from.title);
        hud(e.kind === 'finished' ? 'finished' : 'doing', { verified: e.from.title });
        clearTimeout(timer);
        timer = setTimeout(flush, BATCH_MS);
      } else if (e.kind === 'mistake') {
        verified = []; clearTimeout(timer); timer = null; // a warning beats stale "well done" news
        coach.notify(`URGENT, say it now: ${e.say}`, { urgent: true });
        hud('mistake', { warning: e.say });
      } else if (e.kind === 'cant_see') {
        coach.notify('The camera view is too dark or blurry to check this step. Ask them to move closer or add light.');
        hud('cant_see');
      }
    }
  };

  // ---- Voice → tools ----
  coach.onTool = async (name, args) => {
    switch (name) {
      case 'start_task': {
        if (!TASKS[args.task_id]) return { ok: false, error: `Unknown procedure. Available: ${Object.keys(TASKS).join(', ')}` };
        runner = new TaskRunner(args.task_id);
        watcher.startTask(runner);
        hud('doing');
        const s = runner.status();
        return { ok: true, procedure: s.title, steps: s.step.of, first_step: s.step.title, tell_user: s.step.say,
          note: 'The camera inspector will confirm each step; wait for its [INSPECTOR] message before moving on.' };
      }
      case 'get_task_status': {
        if (!runner) return { active: false, available: Object.keys(TASKS) };
        const last = watcher.lastDecision?.headline;
        return { active: true, ...runner.status(),
          inspector_last_saw: last ? `${last.choice} (${Math.round(last.confidence * 100)}% sure)` : 'nothing yet' };
      }
      case 'skip_step': {
        if (!runner) return { ok: false, error: 'No procedure running.' };
        const r = runner.skip();
        if (r.ok) hud(runner.finished ? 'finished' : 'doing');
        return r.ok ? { ok: true, skipped: r.from.title, next_step: r.to?.title ?? 'none, job finished', tell_user: r.to?.say } : r;
      }
      case 'stop_task': {
        runner = null;
        watcher.stop();
        hud('stopped');
        return { ok: true };
      }
      default:
        return { error: `Unknown tool ${name}` };
    }
  };

  // Let the client start a procedure directly too (testing without voice).
  return {
    startTask(id) { return coach.onTool('start_task', { task_id: id }); },
  };
}
