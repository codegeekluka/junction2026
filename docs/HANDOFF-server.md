# Handoff: the brain (server/), for a fresh Claude Code session (Sun 15.11, night)

Read `CLAUDE.md` first, then this. Luka owns the **server/brain**; Vedant owns the **Android app**
(see `docs/HANDOFF-android.md`). Every decision and its reasoning: `docs/DECISIONS.md` (D1–D23).
**Final submission due Sun 09:30** (deadline 10:00): video ≤ 2:00, deck PDF, description, repo link.

## What works (tested end to end with real Gemini)
- **Voice coach** = Gemini Live `gemini-3.8-live` (`server/src/live.js`, prompt `server/src/prompt.js`):
  tools `start_task`, `diagnose`, `verify_now`, `get_task_status`, `skip_step`, `stop_task`;
  context compression + session resumption, quiet reconnect, says "I'm back" after a drop.
  The prompt includes the sourced knowledge pack `docs/knowledge/sink-drain.md` (21 sources).
- **Inspector** = Gemini Decisions API `gemini-decision-1` (`server/src/watcher.js`): all questions of a
  procedure in one call per frame (~0.3 s median, ~1.7 checks/s).
- **Procedures** (`server/src/tasks.js`): `bottle_demo` (test), **`bottle_trap` (our demo sink)**, `ptrap`.
  Runner `server/src/task-runner.js`: 3 confident checks to pass, mistakes block passing, action steps
  must be seen not-done first, inView check ("I can't see the sink"), stuck → escalate to Live.
- **Diagnosis** (`server/src/diagnosis.js`, `diagnosis-runner.js`): problem + trap type → offers
  bottle_trap/ptrap; unsure → escalates to Live; hazards → urgent stop.
- **Orchestrator** (`server/src/orchestrator.js`): inspector events → short `[INSPECTOR]` notes to the
  coach (non-urgent ones wait until it finishes speaking), `hud` messages for the display
  (`short`, `tip`, `status`, `card`, `cardUrl`), capture rate (2 fps during a procedure, 0.5 idle).
- **Recording** for the demo video: `RECORD_AUDIO=1` → `server/logs/<session>/you.wav`, `coach.wav`,
  `transcript.srt`; `RECORD_FRAMES=1` → frames + `events.jsonl`.
- Web test client `web/` (http://localhost:8080): Coach / watcher modes, Debug buttons (start
  procedures, simulate drop), engine indicator, step card with the designers' cards.

## Run / test
```
cd server && npm install
# PowerShell: $env:RECORD_FRAMES=1; $env:RECORD_AUDIO=1; npm start     (venue: also $env:LIVE_VAD="low")
node scripts/smoke.js <img>                 # coach answers about an image
node scripts/task-e2e.js <standing> <fallen> <held>   # bottle_demo end to end (frames in server/logs/…)
node scripts/diag-e2e.js <img> "<sentence>"           # diagnosis end to end
node scripts/report.js [latest|list]        # session report: latency, Google vs network, certainty, task events
node --env-file=../.env scripts/replay.js   # re-test current questions on labelled frames
```
Env flags: `CAPTURE_MODE=smart` (2 fps only on risky steps), `LIVE_VAD=low` (loud hall), `DEV_LOG=0`.
`GET /debug/drop` simulates a connection drop on every live session (for showing judges).

## Open / next (priority order)
1. **Help the team get one usable sink take** (glasses + app + server on Vedant's laptop). Server-side
   problems arrive as `node scripts/report.js` output or a `server/logs/…` folder.
2. **Tune `bottle_trap` questions on real glasses frames** once a session folder is available
   (same loop as the bottle: report → look at wrong frames → reword → replay.js).
3. **Submission text** from `docs/DECISIONS.md`: Google's 4 questions (problem, integration, innovative,
   why Gemini) and Meta's criteria (map at the top of DECISIONS.md). Pitch numbers: inspector ~0.3 s,
   steps verified ~1.2–1.5 s after they happen, bottle accuracy 89% live / 19 of 19 labelled after tuning.
4. Optional: display **replay page** (log `hud` with timestamps → replay at 600×600 on black → screen-record
   for After Effects). Not built.
5. Optional: Robotics-ER 2 "which part?" live cutout on the display (D19). Not built.

## Gotchas
- Gemini key in repo-root `.env` (`GEMINI_API_KEY`), never commit it. Venue Wi-Fi drops often (use a hotspot).
- A second git worktree exists at `../Junction2026-android` (branch `android-voice`); Android work now
  belongs to Vedant, so leave it alone (or `git worktree remove ../Junction2026-android`).
- Meta sample code (Android) is under Meta's terms, our code MIT: ask an organiser; add a LICENSE note.
- Log every new decision in `docs/DECISIONS.md` (decision → why → evidence → criterion).
