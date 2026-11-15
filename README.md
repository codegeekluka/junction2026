# Handyman: your personal handyman on Meta glasses

**Hands-free, real-time guidance, mistakes caught before they happen.**
Handyman sees what you see through Meta glasses, talks you through a repair, **checks every step on camera**, warns you *before* you make a mistake, and tells you when to call a professional.
Demo job: unclogging a sink with a bottle trap. Built at Junction 2026 for **Meta: AI Glasses for Everyone, Everyday** and **Google DeepMind: Best Use of Gemini API**.

## How it works

```
Meta glasses ──Bluetooth──▶ Android app ──WebSocket──▶ Server (the brain) ──▶ Gemini Live          = the voice
 camera, display,            Meta Device Access          procedures, step runner,  └▶ Gemini Decisions API = the inspector
 speakers                    Toolkit                     diagnosis tree, display cards
```

- **Gemini Live** (`gemini-3.8-live`) is the voice: real-time conversation from camera + voice, function calling, Google Search, session resumption.
- **Gemini Decisions API** (`gemini-decision-1`) is the inspector: every frame, all of a procedure's yes/no questions in **one call** (~0.3 s), each with a calibrated confidence.
- **Confidence decides who acts:** a step counts only when the inspector confirms it (≥ 75 %, repeatedly). When it's unsure, it hands over to Gemini Live, which looks and asks the user.
- **Expertise is data:** each step has a "done" check, mistake checks ("Wait! Bucket first") and safety gates, built from 21 sources (`docs/knowledge/`).

Measured: ~0.3 s per check · step confirmed ~1.2–1.5 s after it happens · 89 % → 19/19 labelled frames after tuning · Live video input cut from 60 to ~6–9 frames/min.

## Repository map

| Path | What |
|---|---|
| `server/` | **The brain** (Node.js): Gemini Live session (`src/live.js`), inspector (`src/watcher.js`), procedures (`src/tasks.js`), step runner (`src/task-runner.js`), diagnosis tree (`src/diagnosis*.js`), orchestration (`src/orchestrator.js`), coach prompt (`src/prompt.js`), test and report scripts (`scripts/`) |
| `android/` | **Glasses app** (Kotlin, Meta Wearables Device Access Toolkit): camera stream, voice, step cards on the display. See `android/README.md` |
| `web/` | Browser test client (phone/laptop camera instead of glasses) and backup demo |
| `design/glasses-ui/` | The 30 display cards (SVG + PNG) for the 600×600 Ray-Ban Display |
| `probes/` | Early latency/accuracy probes of the Decisions API and Robotics-ER 2 |
| `docs/` | `PROJECT-SUMMARY.md` (start here), `DECISIONS.md` (every design decision with reasoning and evidence), `protocol.md` (client ↔ server messages), `knowledge/` (sourced repair knowledge), `SUBMISSION-description.md` |

## Run it

1. **Key:** copy `.env.example` to `.env` and set `GEMINI_API_KEY` (Google AI Studio).
2. **Server:** `cd server && npm install && npm start` → web client at http://localhost:8080 (phone on the same Wi-Fi: the printed `https://<ip>:8443`).
   - Options: `RECORD_AUDIO=1` / `RECORD_FRAMES=1` (save sessions for review), `LIVE_VAD=low` (noisy rooms), `CAPTURE_MODE=smart` (fewer frames).
   - Try it: press **Start** in *Coach* mode and say *"Let's do the bottle practice"*, or open **Debug → Start bottle-trap procedure**.
3. **Glasses app:** open `android/` in Android Studio (JDK 21), run on an Android 10+ phone, `adb reverse tcp:8080 tcp:8080`, pair the glasses in the Meta AI app (or enable the Mock Device Kit), then **Talk to the coach**.
4. **Tests and reports:** `node scripts/task-e2e.js …`, `node scripts/diag-e2e.js …`, `node scripts/report.js` (see `docs/HANDOFF-server.md`).

## Honest limitations
Procedures are AI-drafted from cited sources and still need expert review · the user's voice uses the phone mic (the glasses' mic forces Bluetooth call mode, which hides the display) · glasses events (taken off, battery) aren't handled yet.

## License
Our code is MIT (see `LICENSE`). Files under `android/` that carry Meta's copyright header come from Meta's CameraAccess sample and remain under the [Meta Wearables Developer Terms](https://wearables.developer.meta.com/terms). The Gemini skills in `.claude/skills/` are Google's (Apache 2.0), and `research/` holds verbatim copies of event and vendor documents for reference; neither is ours to license. Details in `LICENSE`.
