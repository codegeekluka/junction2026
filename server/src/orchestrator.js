// Connects the two Gemini models for one session:
//   Gemini Live (live.js)  – the voice. Starts expert procedures via tools.
//   Decisions API (watcher) – the inspector. Diagnoses the problem (decision tree) and
//                             verifies each step on camera; unsure cases escalate to Live.
// Verified events from the watcher become short [INSPECTOR] messages the coach speaks,
// and 'hud' messages for the screen / glasses display.

import { TaskRunner } from './task-runner.js';
import { TASKS } from './tasks.js';
import { DiagnosisRunner } from './diagnosis-runner.js';
import { DIAGNOSES } from './diagnosis.js';
import { cardFields } from './cards.js';

export function connect({ coach, watcher, send, log, recorder }) {
  let runner = null;   // expert procedure (TaskRunner)
  let diag = null;     // running diagnosis (DiagnosisRunner), one-shot

  // ---- Capture policy (Google booth: verify at the moments that matter, don't stream) ----
  // The server tells the client how many frames to send; less upload on crowded Wi-Fi.
  //   no procedure / plain step : 0.5 fps (one frame every 2 s)
  //   risky step (safety gate or known mistakes): 2 fps, to warn before harm happens
  //   "done" / "is it right?"   : immediate burst of 3 frames
  let fps = null;
  const capturePolicy = () => {
    const step = runner && !runner.finished ? runner.step : null;
    const diagnosing = Boolean(diag && !diag.finished);
    const risky = diagnosing || Boolean(step && (step.gate || step.mistakes?.length));
    // Default (since phone-app testing, Sat evening): 2 fps on EVERY step while a procedure
    // runs; 0.5 fps when idle. CAPTURE_MODE=smart → 2 fps only on risky steps (saves data).
    // See docs/DECISIONS.md D12/D20.
    const smart = process.env.CAPTURE_MODE === 'smart';
    const want = risky || (!smart && step) ? 2 : 0.5;
    if (want !== fps) {
      fps = want;
      send({ type: 'capture', fps, reason: diagnosing ? 'diagnosing' : risky ? `risky step: "${step.title}"` : step ? 'normal step' : 'no procedure running' });
    }
  };
  const snap = (n = 1, gapMs = 350) => { for (let i = 0; i < n; i++) setTimeout(() => send({ type: 'snap' }), i * gapMs); };

  // User started talking: Live should see what they see right now.
  coach.onUserSpeech = () => { coach.forceFrame = true; snap(1); };

  // Which designer card (design/glasses-ui) to show for a procedure state.
  let hudSeq = 0;
  const defaultCard = (state) => {
    const cards = runner?.task.cards ?? {};
    if (state === 'doing') return runner?.step?.card;
    if (state === 'finished') return cards.done ?? 'correct';
    if (state === 'mistake') return cards.mistake ?? 'careful';
    if (state === 'cant_see' || state === 'unsure') return cards.look ?? 'look-down';
    if (state === 'stopped') return 'ready';
    return null;
  };

  const hud = (state, extra = {}) => {
    capturePolicy();
    hudSeq++;
    const s = runner?.status();
    const { card, ...rest } = extra;
    send({ type: 'hud', state, task: s?.title ?? null,
      step: s?.step ? `${s.step.n}/${s.step.of}` : null, title: s?.step?.title ?? null,
      say: s?.step?.say ?? null, gate: s?.step?.gate ?? false, ...rest,
      ...cardFields(card ?? defaultCard(state)) });
  };

  // A step was verified: flash the ✓ card, then show the next step's card.
  const hudVerified = (verified) => {
    hud('doing', { verified, card: 'correct' });
    const seq = hudSeq;
    setTimeout(() => { if (seq === hudSeq && runner && !runner.finished) hud('doing', { verified }); }, 1500);
  };

  // ---- Inspector → voice ----
  // Steps can be verified faster than the coach can speak. So verified steps are batched
  // for a moment and the coach is always told the CURRENT step (not a queue of old ones).
  // Mistakes go out immediately.
  const BATCH_MS = 500; // was 1200: felt slow in testing
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
        if (e.kind === 'finished') hud('finished', { verified: e.from.title });
        else hudVerified(e.from.title);
        clearTimeout(timer);
        timer = setTimeout(flush, BATCH_MS);
      } else if (e.kind === 'mistake') {
        verified = []; clearTimeout(timer); timer = null; // a warning beats stale "well done" news
        coach.notify(`URGENT, say it now: ${e.say}`, { urgent: true });
        hud('mistake', { warning: e.say, card: e.card });
      } else if (e.kind === 'cant_see') {
        coach.notify('The camera view is too dark or blurry to check this. Ask them to move closer or add light.');
        hud('cant_see');
      } else if (e.kind === 'out_of_view') {
        coach.notify(`The camera can't see ${e.what} any more. Ask the user, in one short sentence, to point the camera at ${e.what}.`);
        hud('unsure', { warning: `Can\u2019t see ${e.what}. Point the camera at it.` });
      } else if (e.kind === 'stuck') {
        // ESCALATION: the inspector can't decide → the reasoning model takes a look.
        coach.notify(`The inspector can't tell whether step "${e.title}" is done (about ${Math.round(e.p * 100)}%). ` +
          'Look at the camera yourself and help: ask them to show it from another angle or closer, or ask what they did. ' +
          'Do not tell them it is done; the inspector confirms it.');
        hud('unsure', { warning: 'Can\u2019t tell yet. Show it from another angle.' });
      } else if (e.kind === 'diagnosed') {
        diag = null;
        capturePolicy();
        const p = Math.round(e.p * 100);
        if (e.procedure) {
          const t = TASKS[e.procedure];
          coach.notify(`Diagnosis verified on camera: ${e.label} (${p}% sure). An expert-verified procedure exists: "${t.title}" (id ${e.procedure}, ${t.steps.length} steps). ` +
            `Tell the user what you see in one sentence and ask if they want to fix it together. If yes, call start_task with "${e.procedure}".`);
          diagHud('diagnosed', `Looks like ${e.label}`, `Expert procedure available: ${t.title}`, 'confirm');
        } else if (e.nothingWrong) {
          coach.notify(`Diagnosis: ${e.label} (${p}% sure). Tell the user nothing looks wrong from here, and ask what they noticed (sound, smell, drip, when it happens).`);
          diagHud('diagnosed', 'Nothing visibly wrong', 'Tell me what you noticed', 'thinking');
        } else if (e.showMe) {
          coach.notify(`The inspector can't see the problem area: ${e.label}. Ask the user: ${e.showMe} Then call diagnose again.`);
          diagHud('unsure', 'Show me the problem', e.showMe, 'look-down');
        } else {
          // ESCALATION: known problem, but no expert procedure yet → Live's own knowledge, flagged.
          coach.notify(`Diagnosis: ${e.label} (${p}% sure). There is NO expert-verified procedure for this yet. ` +
            'Help with your own knowledge if it is a simple, safe fix, say clearly that this advice is not expert-verified, and suggest a professional otherwise.');
          diagHud('diagnosed', `Looks like ${e.label}`, 'No expert procedure yet: general advice only', 'thinking');
        }
      } else if (e.kind === 'escalate') {
        // ESCALATION: the fast inspector isn't sure → hand over to the reasoning model.
        diag = null;
        capturePolicy();
        coach.notify(`The inspector is not sure what the problem is (${e.why}). Use your own judgement: look at the image, ` +
          'and ask the user ONE short clarifying question or for a better view. Then call diagnose again if useful.');
        diagHud('unsure', 'Not sure yet', 'Asking you a question to narrow it down', 'look-down');
      } else if (e.kind === 'hazard') {
        diag = null;
        capturePolicy();
        coach.notify(`URGENT, say it now: ${e.say}`, { urgent: true });
        diagHud('mistake', 'Stop: hazard', e.say, 'careful');
      }
    }
  };

  const diagHud = (state, title, say, card) => {
    capturePolicy();
    hudSeq++;
    send({ type: 'hud', state, task: 'Diagnosis', step: null, title, say, gate: false,
      ...(state === 'mistake' ? { warning: say } : {}), ...cardFields(card) });
  };

  // ---- Voice → tools ----
  coach.onTool = async (name, args) => {
    switch (name) {
      case 'diagnose': {
        const area = String(args.area ?? '').toLowerCase();
        const id = DIAGNOSES[area] ? area : /bottle/.test(area) ? 'bottle' : 'sink';
        runner = null;
        diag = new DiagnosisRunner(id);
        watcher.startTask(diag);
        diagHud('diagnosing', 'Taking a look…', 'Hold the camera steady on the problem', 'scanning');
        snap(2);
        return { ok: true, looking_at: DIAGNOSES[id].title,
          note: 'Say you are taking a look (one short sentence). The result arrives as an [INSPECTOR] message within a few seconds. Do not guess before it.' };
      }
      case 'start_task': {
        if (!TASKS[args.task_id]) return { ok: false, error: `Unknown procedure. Available: ${Object.keys(TASKS).join(', ')}` };
        diag = null;
        runner = new TaskRunner(args.task_id);
        watcher.startTask(runner);
        hud('doing');
        const s = runner.status();
        return { ok: true, procedure: s.title, steps: s.step.of, first_step: s.step.title, tell_user: s.step.say,
          note: 'The camera inspector will confirm each step; wait for its [INSPECTOR] message before moving on.' };
      }
      case 'verify_now': {
        if (!runner || runner.finished) return { ok: false, error: 'No procedure step to verify.' };
        const step = runner.status().step;
        watcher.burst(3, (last, events) => {
          if (events.some((e) => e.kind === 'advance' || e.kind === 'finished')) return; // verified: the normal message covers it
          const p = last?.headline?.choice === 'done' ? last.headline.confidence : 1 - (last?.headline?.confidence ?? 0.5);
          coach.notify(`Checked closely: step "${step.title}" is NOT verified yet (only ${Math.round(p * 100)}% sure it is done). ` +
            'Tell the user briefly, and ask them to show it clearly to the camera or finish it.');
        });
        snap(3);
        return { ok: true, checking: true, note: 'Say you are checking. The inspector result arrives in a moment as an [INSPECTOR] message.' };
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
        diag = null;
        watcher.stop();
        hud('stopped');
        return { ok: true };
      }
      default:
        return { error: `Unknown tool ${name}` };
    }
  };

  capturePolicy();

  // Let the client start a procedure directly too (testing without voice).
  return {
    startTask(id) { return coach.onTool('start_task', { task_id: id }); },
    diagnose(area) { return coach.onTool('diagnose', { area }); },
  };
}
