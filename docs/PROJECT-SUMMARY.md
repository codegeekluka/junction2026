# Handyman: project summary (tech stack, decisions, and how we used Meta and Google DeepMind)

> A hands-free repair coach on Meta glasses. It sees what you see, talks you through the repair,
> **checks every step on camera**, warns you *before* you make a mistake, and knows when to call a professional.
> Demo job: unclogging a bathroom sink (a Finnish **bottle trap**).
> Detailed reasoning behind every point: `docs/DECISIONS.md` (D1–D23).

---

## 1. How we got here (the story of the decisions)

1. **Challenges (Fri):** **Meta "AI Glasses for Everyone, Everyday"** as the main challenge, **Google DeepMind "Best Use of Gemini API"** as the tech challenge (ElevenLabs optional). We skipped Nemotron/Gemma (competing models), Verda/Modal (compute we don't need) and other main challenges, so the effort stays on one product.
2. **Use case (Sat):** from "accessible wayfinding" to a **hands-on repair coach**. Repairs need both hands (wet, under a sink), so a phone can't be held or read: the first-person view plus voice is the natural interface. The story is "**your personal handyman**" for the 9 in 10 people without trade skills.
3. **Meta booth:** *"Don't build what Meta will ship natively."* Meta Connect 2026 announced Muse on glasses ("acts on what you're looking at"), so generic "look and ask" will be native. **Our differentiator = expert know-how Meta won't build**: verified procedures, a coach that checks your work, safety stops and handoff to a pro. Their engineer asked *"why would anyone trust it?"* and *"is it fast enough?"*, and those two questions shaped the whole build.
4. **Google DeepMind booth (1):** use the new **Decisions API** (launched 11.11) as a **decision tree**: one problem at a time, all questions in one fast call (~0.3 s), show a **confidence score** (≥ 75 % = very sure), and **escalate unsure cases to Gemini Live** (the expensive reasoning model). Start trivially ("is the bottle standing or fallen?"), then grow.
5. **Google DeepMind booth (2):** *"You're sending more data than you need: verify at the moments that matter, keep Live on demand."* Gemini is strong at reading manuals; try **Gemini 4 Hydrogen**. Venue Wi-Fi drops were confirmed as Wi-Fi.
6. **Testing changed the design several times:** bottle tests (79 % → all 19 labelled frames right after rewording), the phone app (too slow, fooled by fast changes → inspector v2), and the real glasses (call mode hid the display → media mode).

---

## 2. Tech stack

| Layer | What | Why |
|---|---|---|
| **Glasses** | Meta Ray-Ban (Display) glasses: camera, speakers, 600×600 display | First-person view, hands free |
| **Glasses app** | **Android (Kotlin)** with Meta's **Wearables Device Access Toolkit (DAT)**, based on Meta's CameraAccess sample; **Mock Device Kit** for development | Only DAT can use the glasses' camera/mic; Android because the team is on Windows |
| **The brain** | **Node.js server** (`server/`), WebSocket protocol (`docs/protocol.md`) | API keys never on the phone; one brain for the glasses app and the web test client |
| **Voice** | **Gemini 3.8 Live** (`gemini-3.8-live`) with function calling + Google Search | Real-time conversation from camera + mic, interruptible |
| **Inspector** | **Gemini Decision 1** (Decisions API, `gemini-decision-1`) | Calibrated yes/no/choice answers per frame, ~0.3 s, cheap |
| **Knowledge** | Sourced knowledge pack `docs/knowledge/sink-drain.md` (21 sources: Hansgrohe, Prevex, Kiinteistöliitto, …) given to the coach in full | One job's knowledge fits in context: no RAG needed |
| **Procedures** | `server/src/tasks.js` (`bottle_trap`, `ptrap`, `bottle_demo`), diagnosis tree `diagnosis.js` | The expertise as data: steps, checks, mistakes, safety gates |
| **Display** | Designers' 30 cards (`design/glasses-ui`), chosen by the server per moment | Instant, readable at a glance, works offline |
| **Web test client** | `web/` (browser, phone or laptop camera) | Development tool and backup demo |
| **Measurement** | Session logs, `report.js`, `replay.js`, audio + subtitle recording | Every claim in the pitch is measured |
| Tested, not used live | **Gemini Robotics-ER 2** | Accurate at pointing to parts but 3–7 s per call; planned for an on-demand "which part?" cutout |

```
Glasses ──Bluetooth──▶ Android app (DAT) ──WebSocket──▶ Server (the brain) ──▶ Gemini Live (voice)
  camera, display,        frames at the rate           procedures, runner,  └▶ Gemini Decisions API (inspector)
  speakers                the server asks for          orchestrator, display cards
```

---

## 3. How we used Google DeepMind's models (and why each one)

**The core idea: two Gemini models, each doing what it's best at.**

| | **Gemini Live = the voice** | **Decisions API = the inspector** |
|---|---|---|
| Job | Talks, listens, explains, answers "why?", starts procedures (function calling), reasons about the unexpected | Checks every step on camera with calibrated yes/no answers |
| Strength | Flexible, natural, interruptible (~0.6–0.8 s to first word) | Fast (~0.3 s), cheap (~€0.40/h), **measurable**, gives a confidence score |
| Weakness we saw | Told the user to put a bucket under a pipe it couldn't see; read one label as two different flavours | Can't talk or reason |

**Why both:** an assistant guiding real repairs must *be* right, not *sound* right. So **only the inspector can mark a step done**; the voice can't skip ahead.

**The decision tree (from the Google booth):**
- **Diagnosis:** "Which problem is it?" + "which trap type?" + a confirming check + hazards, **all in one call per frame**, walked in code.
  - Confident (≥ 75 %, confirmed twice) → offer the matching expert procedure.
  - Unsure after ~3 s → **escalate to Gemini Live**, which looks itself and asks one clarifying question.
  - Known problem but no expert procedure → Live helps but **says it isn't expert-verified**.
  - Hazard (spraying water, wet electrics) → urgent stop.
- **During a procedure:** each step has a "done" check, mistake checks (warn *before* harm, e.g. "Wait! Bucket first") and safety gates that can't be skipped. A step that stays in "can't tell" escalates to Live ("show it from another angle").
- **Tested end to end:** a fallen bottle was diagnosed at 99 % in 1.3 s, and the procedure was offered and started. With a dry pipe and the user saying "it's leaking", the inspector was unsure (56 % / 37 %) and Live asked: *"Can you point to exactly where the water is leaking from?"*

**Efficiency (from the second Google conversation):** the server controls the camera rate: 0.5 fps when idle, 2 fps while a procedure runs, an immediate burst when the user says "done" (`verify_now`). Live gets a frame every ~4 s plus a fresh one when the user starts talking (was 60/min, now ~6–9/min).

**Knowledge:** the sourced knowledge pack goes straight into Live's instructions (context, not RAG). For many appliances the roadmap is **Gemini File Search over manufacturer manuals**, plus **Gemini 4 Carbon/Hydrogen** to draft new procedures from manuals for expert review.

**Google's 4 questions:**
1. **Problem:** small repairs are hard to follow from a phone when your hands are busy; people pay €150+ call-outs for 15-minute fixes, and badly done repairs cause water damage.
2. **Integration:** Gemini Live (voice, function calling, Search, session resumption) + the Decisions API (decision tree over every frame) + escalation between them.
3. **Innovative:** a model built for calibrated decisions acts as a **real-time inspector** of human hands, with **confidence-based routing** to the reasoning model, instead of an LLM that just talks.
4. **Why Gemini:** real-time multimodal voice and a calibrated multi-question decision model, from one API, working together. Without the Decisions API there's no fast, measurable verification; without Live there's no natural coaching.

---

## 4. How we used Meta's resources (and the brief's criteria)

- **Device Access Toolkit** (camera stream, display, audio), **CameraAccess sample** as the starting point, **Mock Device Kit** to build before the glasses arrived, the **display simulator**, the **Hardware Lab loan** for real glasses, and the **Meta booth's feedback** (differentiator, trust, speed).
- **Real-glasses lesson:** using the glasses' mic needs Bluetooth "call mode", which shows a **call screen over our display** and gives low-quality audio. We switched to **media mode** (the user's voice via the phone mic, the coach through the glasses, the display stays visible). Meta's in-stream audio (beta) is the proper fix → roadmap.

| Meta criterion (25 % each) | What we have |
|---|---|
| **Creativity & use case** | Hands-busy repair, first-person view as the interface; expert know-how Meta won't build natively (D1, D2) |
| **Technical execution** (permissions, errors, performance, connectivity, device state) | Connection drops: audible tone + "I'm back" + resume (demo: `/debug/drop`); can't-see / unsure handling; smart frame rate; timeouts; mic permission. **Device state (glasses off, battery) is not built yet** (D11–D14, D20, D23) |
| **Real-world value & feasibility** | Pilot with our HVAC business; in Finnish apartment buildings, trap cleaning is the housing company's job (Kiinteistöliitto 2019), so maintenance firms are natural customers (D1, D16, D22) |
| **UX: input, accessibility, trust** | Audio-first + glanceable display (step, ≤ 6-word instruction, tip, "Watching… / ✓ Done / ⚠ Stop"); says when it's unsure; safety gates; sourced procedures; consent; no video stored (D3, D6, D8–D10, D15, D19, D21) |

---

## 5. Key numbers (measured)

- Inspector: **~0.3 s per check**, ~1.7 checks/s; a step is verified **~1.2–1.5 s** after it happens; a mistake is caught ~1.3 s after the wrong move.
- Coach: first spoken word **~0.6–0.8 s**.
- Bottle test: **89 %** right in live taps; **19 of 19** labelled frames after rewording (gate question + precise definitions).
- Data: frames to Live **60 → ~6–9 per minute**; inspector cost ~**€0.40/hour** at 2 fps.

**The main lesson (for the pitch):** the models were fine; **the hard part is defining each state precisely**, and that is exactly the expert's job. That's our moat.

---

## 6. Honest limitations and roadmap

- The procedures are **sourced but AI-drafted**: the HVAC member still has to review them before we say "expert-verified".
- The voice uses the **phone mic** for now (glasses mic needs Meta's beta in-stream audio).
- Glasses device events (taken off, battery, heat) aren't handled yet.
- The bottle-trap checks haven't been tuned on real glasses footage yet.
- Roadmap: more procedures drafted from manuals (Gemini File Search + Carbon), expert review, handoff report to the plumber/housing company, "which part?" cutout with Robotics-ER 2, ElevenLabs for the fixed step lines.
