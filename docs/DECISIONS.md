# Decision log: what we chose, why, and which judging criterion it serves

Keep adding to this. Each entry: **decision → why → evidence → criterion**. Use it for the pitch, deck, video and Q&A.
Criteria: **Meta** (25% each): Creativity & use case · Technical execution · Real-world value & feasibility · UX: input, accessibility & trust. **Google**: problem · how Gemini is integrated · what's innovative · why Gemini is essential.

## Quick map: criterion → decisions
| Criterion | Decisions to cite |
|---|---|
| Meta: Creativity & use case | D1, D2, D16 |
| Meta: Technical execution (permissions, errors, performance trade-offs, connectivity, device state) | D4, D11, D12, D13, D14 |
| Meta: Real-world value & feasibility | D1, D16, D17 |
| Meta: UX, accessibility & trust | D3, D6, D8, D9, D10, D15, D18 |
| Google: integration / innovative / essential | D5, D6, D7, D8, D12, D18 |

---

### D1 · Use case: a hands-free "personal handyman", demoed on a sink P-trap (Sat 14.11)
- **Why:** repairs need both hands (often wet, under a sink), so a phone can't be held or read. A first-person camera plus voice is the natural interface. One fixed leak saves a €150+ call-out.
- **Audience:** the 9 in 10 people without trade skills (Meta booth steered us here, rather than at professionals).
- **Pilot path:** our HVAC business. Customers try the fix before a technician drives out; if it fails, the technician gets a handoff report.
- **Criterion:** Creativity, Real-world value.

### D2 · Differentiator: expertise Meta won't build natively (Meta booth, Sat)
- **Why:** Meta Connect 2026 announced Muse on glasses ("acts on what you're looking at"), so generic "look and ask" will be native. Meta told us not to build what they'll ship.
- **Ours:** expert-verified procedures, every step checked on camera, known beginner mistakes warned about, safety stops, and handoff to a real pro.
- **Criterion:** Creativity, Trust.

### D3 · Audio-first, display as an enhancement
- **Why:** works on any Meta glasses (Gen 2 has no display), works for people with low vision or who struggle to read, and the demo survives if no Display glasses are free. The display (`hud` messages) shows the same step, ✓ verified, ⚠ warnings.
- **Criterion:** UX & accessibility.

### D4 · Architecture: glasses → Android app (Meta Device Access Toolkit) → our server → Gemini
- **Why:** only the Device Access Toolkit can use the glasses' camera and mic (Display web apps can't). Android, because the whole team is on Windows (iOS needs a Mac/Xcode).
- **Why a server in the middle:** API keys never reach the phone (safe data practice), and the web test client and the glasses app share one brain (all tuning applies to both).
- **Web app** = our development tool and backup demo, not the product.
- **Criterion:** Technical execution.

### D5 · Models: each Gemini model does what it's best at
| Model | Job | Why |
|---|---|---|
| **Gemini 3.8 Live** | The voice: real-time conversation from camera + mic, interruptible, Google Search, function calling | Natural, hands-free, handles anything unexpected |
| **Gemini Decision 1 (Decisions API)** | The inspector: calibrated yes/no/choice answers per frame | Fast (~0.3 s median), cheap (~€0.20–0.40/h), measurable, confidence scores |
| Robotics-ER 2 | Tested, **not used live** | Accurate pointing at parts, but 3–7 s per call: too slow for the live loop. Option for on-demand "where exactly?" |
| Gemini 4 Hydrogen / Carbon | Planned: read manuals / labels, draft procedures offline | Google engineer: Gemini is strong at reading manuals and summarising steps; Hydrogen for speed |
- **Criterion:** Google integration / essential.

### D6 · Only the inspector can mark a step done; the voice can't
- **Why:** in testing, Gemini Live alone told the user to put a bucket under a pipe it couldn't see, and read the same label as two different flavours. A guiding assistant for real repairs must *be* right, not *sound* right.
- **How:** Live starts procedures and talks; step progress advances only on verified camera checks.
- **Criterion:** Trust; Google "why Gemini is essential" (Decisions API calibration).

### D7 · Decision tree / question design (Google booth advice)
- **Why:** booth: one problem at a time, branch, ≤1,000 questions → one fast call; low confidence → escalate to Live.
- **What we did:** all of a procedure's questions in **one call per frame** (latency stays flat with more questions); a gate question first ("is there a bottle at all?") before the state question.
- **Evidence:** bottle test went from 79% to **all 19 labelled frames correct** after adding the gate and sharper wording (background bottles were being counted; "held" vs "standing with a hand on it" was ambiguous).
- **Lesson for the pitch:** the model was fine; **precise definitions are the hard part, and that's the expert's job** (supports D2).
- **Diagnosis + escalation: built, see D18.**
- **Criterion:** Google innovative; Technical execution.

### D8 · Confidence thresholds
- **≥ 0.75 = "very sure"** (Google booth), 0.6–0.75 "fairly sure", below → "not sure, show me another angle".
- A step counts as done only after **2 confident checks in a row** (avoids flicker).
- "Too dark/blurry" pauses checking and asks for light instead of guessing.
- **Criterion:** Trust (shows certainty), Technical execution.

### D9 · Safety steps can't be skipped; mistakes are warned about before harm
- **Why:** trust and safety. Example: the bottle practice warns "Stop! The cap is off…" before you tip it (no spill); the P-trap warns "no bucket" before you loosen anything.
- Gas, electricity near water, a burst pipe, water that won't stop → stop and call a professional.
- **Criterion:** Trust, Value.

### D10 · Coach personality and honesty rules (prompt v2+)
- **Why:** v1 was too rigid (refused anything but sinks, misread "I don't have a sink yet"). Now: general handyman, finds out the job first, plays along with tests.
- **Honesty:** never instruct about something it can't see; never guess text (it now says "the flavour text is too blurry, bring it closer"); English unless asked; never says its reasoning aloud.
- **Criterion:** UX & trust.

### D11 · Connectivity handling (Meta: "handles connectivity")
- Context compression (Live's audio+video limit is otherwise 2 minutes), session resumption (~10-minute connection limit), quiet retries, fresh-session fallback when resume is refused.
- **Audible + visible:** falling tone and banner when lost, rising tone when back; the coach says "I lost connection for a moment, I'm back".
- **Demo:** "Simulate connection drop" button (Debug) to show judges.
- **Evidence:** venue Wi-Fi dropped repeatedly; logs separate network vs Google delays (in one run 10/11 timeouts were the network).
- **Criterion:** Technical execution.

### D12 · Smart capture: verify at the moments that matter (Google booth advice)
- **Why:** a Google engineer said we sent far more data than needed; verify at the start and end of a step, keep Live on demand. Also: venue upload is the bottleneck.
- **What:** server sets the camera rate. **0.5 fps on normal steps, 2 fps only on risky steps** (safety gates / known mistakes), a 3-frame burst when the user says "done" (`verify_now`). Live gets one frame every ~4 s plus a fresh one when the user starts talking (was 60/min, now ~6–9/min). Frames 640 px.
- **Trade-off (our honest call):** fewer checks on normal steps means slower confirmation there, but the corrections that prevent mistakes still run at full speed. **`CAPTURE_MODE=careful`** runs 2 fps on every step (more corrections, more data) for demos where that matters.
- **Criterion:** Meta "performance trade-offs"; Google efficiency.

### D13 · Speech UX in a loud hall
- Inspector updates wait until the coach finishes its sentence; only urgent warnings interrupt.
- Lower speech-start sensitivity (default was cutting the coach off on background noise); 0.25 s audio buffer against choppy playback on bad Wi-Fi.
- **Criterion:** UX, Technical execution.

### D14 · Measuring instead of guessing
- Session logs (dev-only, git-ignored) with Right/Wrong taps; `report.js` (latency, certainty, flicker, accuracy, data use); `replay.js` re-tests new question wording on labelled frames; timing split into Google processing vs network.
- **Criterion:** Technical execution (evidence for every claim in the pitch).

### D15 · Privacy and consent
- Consent notice before start; camera/mic only while a session runs; **no video stored** in the product (frames live in memory only; dev logs can be switched off with `DEV_LOG=0`); keys only on the server.
- **Criterion:** Trust (Meta: "consent and safe data practices").

### D16 · How the expertise is made (planned)
- AI drafts each procedure from manufacturer manuals and public sources, with sources listed → our HVAC team (licensed installers) reviews: order, **common beginner mistakes** (become warnings), **when to call a pro**, what pros check that manuals skip → the reviewer's name goes on the procedure.
- Business data → which call-outs are simple self-fixes, how often, what they cost → impact numbers and the next procedures.
- **Criterion:** Creativity, Value, Trust.

### D17 · Server hosting (planned)
- Now: the server runs on a laptop at the venue. Latency isn't the issue (Google processing dominates), reliability is (venue Wi-Fi, phone must reach the laptop).
- Plan: Google Cloud Run in Finland (europe-north1) for the demo; any internet (incl. 4G hotspot) works, one address for the team.
- **Criterion:** Technical execution, feasibility.

### D18 · Diagnosis tree + escalation to the reasoning model (Google booth advice, built Sat)
- **Why:** booth: "Is it one of the problems we can solve with decisions alone, or does it need reasoning? If confidence drops below a threshold, send it to the Live API." Also cost: the cheap model handles the clear cases, the expensive one only the hard ones.
- **How:** the user describes a problem → Live calls `diagnose(area)` → the inspector asks the whole tree in **one call per frame** (problem choice + each branch's confirm check + hazards) and walks it in code:
  - confident (≥0.75, twice) **and** the branch check agrees → diagnosis; offer the expert procedure (user consents → `start_task`)
  - known problem but **no expert procedure** → escalate: Live helps with its own knowledge, **saying it isn't expert-verified**
  - **unsure** after ~3 s → escalate: Live looks itself and asks one clarifying question
  - **hazard** (spraying water, wet electrics; broken glass in the test tree) → urgent stop
- **During a procedure:** if a step's check stays in the "can't tell" band (25–75%) for 8 checks → escalate to Live ("show it from another angle"); Live may not mark it done.
- **Evidence (end-to-end, real Gemini):**
  - fallen bottle → "fallen over, 99%" in **1.3 s** → coach offers the procedure → "yes" → procedure starts.
  - dry P-trap photo + "my sink is leaking" → inspector unsure (no visible problem 56%, leak 37%) → Live: *"I see the drain trap, but can you point to exactly where the water is leaking from?"*
- **Pitch line:** "Fast, calibrated checks decide when they can; when they can't, they say so and hand over to the model that can reason, instead of guessing."
- **Criterion:** Google innovative / essential; Meta trust.
