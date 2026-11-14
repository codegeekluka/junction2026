# Handoff: Android app (Sun 15.11, ~night) — Luka's Claude → Vedant

From now on **Vedant owns the Android app** (`android/`), Luka's Claude owns the **server** (`server/`).
Luka's Claude wrote some app changes blind (no build machine, no device). They are on branch
**`android-voice`**. Please merge, build, check on the device, and fix/adjust as you see fit.

## What's on `android-voice` (not yet verified on the glasses)
| Change | File | Why |
|---|---|---|
| **Media mode** (default): user's voice via the **phone mic** (`VOICE_RECOGNITION`), coach via the glasses as **media** (`USAGE_MEDIA`), never call mode | `handyman/VoiceLink.kt` | Call mode (HFP/SCO) showed a **call screen that hides our display** and gave narrowband audio. `VoiceLink.USE_CALL_MODE = true` restores the old route. Logs `audio outputs: …` and `media audio → glasses (A2DP)` / `…phone speaker` under tag `Handyman:Voice`. |
| **"Start sink procedure"** button while the coach is on | `handyman/HandymanPanel.kt` | With the coach on, only "Stop" was shown, so procedures could only start by voice (and the coach could pick the wrong one). The server now tells the coach to introduce step 1 when a procedure is started by a button. |
| **Sink button → `bottle_trap`** | `ui/CameraScreen.kt` | Our demo sink has a **bottle trap**; `ptrap` (U-pipe) checks never matched it. |
| **Display: `.conflate()` + 300 px card images** | `handyman/GlassesDisplay.kt`, `handyman/CardImages.kt` | Cards lagged: each hud sent a 600 px bitmap over Bluetooth and updates queued. Now only the latest card is sent, at a quarter of the pixels. Revisit size if it looks blurry. |

## Open problems (as last reported, after the changes above may or may not be in your build)
1. **Coach "not listening at all".** Suspects, in order:
   - **"Sound in video" ON while recording** → Meta's sample `AudioInputHandler` grabs the mic (and uses call mode) → our `AudioRecord` gets silence. Keep it OFF, or make recording video-only while the coach runs.
   - **Muffled phone mic** (pocket). Server now uses Gemini's default (sensitive) speech detection; `LIVE_VAD=low` only at the venue.
   - **Check:** does the panel show `You: …` lines? Is `server/logs/<newest>/you.wav` audible (start the server with `RECORD_AUDIO=1`)?
2. **Cards not in sync** with what the coach says → see `.conflate()` above. If still slow: log time from `hud` received → `sendContent` done (tag `Handyman:Display`).
3. **Inspector slow / misses mistakes.** Make sure Preview is streaming (panel "frames: N" counting, **2 fps** during a procedure) and the procedure is **bottle_trap**. Then send Luka the output of `cd server && node scripts/report.js`: it shows whether frames arrive, check confidence, and network vs Google delay.
4. **Not built:** glasses events Meta judges look for: taken off (`donState` → `paused` card), battery (`low-battery`), heat (`cooling`), `CAPABILITY_DENIED`. Cards exist in `design/glasses-ui`; mapping table in its README.

## Where things are
- Protocol (all messages incl. `hud.short/tip/status/card`, `capture`, `snap`): `docs/protocol.md`
- Why each decision was made: `docs/DECISIONS.md` (D20 inspector v2, D21 display fields, D22 bottle trap, D23 real-glasses fixes)
- Server run (on your laptop, phone via `adb reverse tcp:8080 tcp:8080`):
  `cd server && git pull && npm install` then PowerShell `$env:RECORD_FRAMES=1; $env:RECORD_AUDIO=1; npm start`
- Simulate a connection drop during a take (judges: connectivity): open `http://localhost:8080/debug/drop` on the laptop.
- Recorded audio + subtitles after each coach session: `server/logs/<time>_<id>/you.wav`, `coach.wav`, `transcript.srt`.
- The app's video recording goes to a **temp file**: after stopping, tap **Share → save** (Close deletes it).

## Server-side problems → Luka's Claude
Coach misunderstands, steps don't verify, wrong warnings, procedure content: send Luka the `report.js` output (and, if possible, the newest `server/logs/…` folder).
