## Handyman: your personal handyman on Meta glasses

**Hands-free, real-time guidance, mistakes caught before they happen.** Handyman sees what you see, talks you through a repair, checks every step on camera, and tells you when to call a professional. Demo: unclogging a sink with a bottle trap, the most common sink drain in Finnish homes.

### The problem
We need help most when our hands are busy. We stop, wipe our hands, scroll a manual or video and try to remember the next step. Mistakes happen in that gap: callbacks and safety risks at work, lost time at home. And in the trades, know-how leaves when experienced workers retire. Generic "look and ask" AI is coming to glasses natively, but it improvises. People need expert know-how that watches their hands.

**Who it's for:** everyday people facing a common home repair first; then the trades (HVAC, maintenance, construction), where skipped steps mean callbacks.

### What it does
- **Diagnoses first:** "my sink drains slowly" → it identifies the problem and trap type and offers the matching procedure. Unsure → it asks one question instead of guessing.
- **Guides in real time:** interruptible voice, one step at a time; a glanceable card on the glasses shows the step and *Watching… / ✓ Done / ⚠ Stop*.
- **Checks every step on camera:** a step counts only when the camera confirms it.
- **Warns before harm:** e.g. "Wait! Bucket first", ~1.3 s after the wrong move.
- **Knows its limits:** hazards trigger a stop; otherwise it points you to a pro.
- **Remembers where you are:** after a network drop it says "I'm back" and continues from the same step.

### Inclusive, with consent
Audio-first: works without looking at the display and with gloves on. Plain language at your pace; ask "why?" or "repeat that" any time. Helps people with low literacy or dyslexia and non-native speakers (Gemini Live is multilingual; the demo is in English). It says when it isn't sure. Camera and mic run only after you press Start, the glasses' light shows the camera is on, no video is stored, and API keys never reach the phone. It guides you; it doesn't monitor you.

### Two Gemini models, one job each
A repair assistant must *be* right, not just *sound* right.
1. **Gemini Live (`gemini-3.8-live`) = the voice:** real-time video and voice, function calling (start, diagnose, verify, skip, stop), Google Search, session resumption. First word in ~0.6–0.8 s.
2. **Gemini Decisions API (`gemini-decision-1`) = the inspector:** all of a procedure's questions (in view? done? mistake? hazard?) in **one call per frame** with calibrated confidence. **~0.3 s per check**, a step confirmed **~1.2–1.5 s** after it happens, ~€0.40/hour.
3. **Confidence decides who acts:** ≥ 75%, confirmed repeatedly → step done. Unsure → handed to Gemini Live, which looks and asks you.

**Why Gemini:** without the Decisions API there's no fast, trustworthy verification; without Gemini Live, no natural coaching. Together, with confidence routing between them, they are the product.

**Expertise as data:** each step has a done check, mistake checks and safety gates; diagnosis is a decision tree over the inspector's answers. The knowledge pack (21 sources: Hansgrohe, Prevex, Kiinteistöliitto) goes to Live in full. **Frames only when needed:** 0.5 fps idle, 2 fps in a procedure, a burst on "done": Live's input fell from 60 to ~6–9 frames/min.

### Architecture
Glasses → Android app (Meta **Wearables Device Access Toolkit**, Kotlin, Mock Device Kit; 30 designer cards on the display) → Node.js server (procedures, step runner, diagnosis) → Gemini Live + Decisions API. Every number comes from our session logs.

### What testing taught us
- **Precise wording is the hard part:** 79% at first; 19 of 19 labelled frames after defining each state precisely. Writing those definitions is the expert's job: our edge.
- **Real glasses:** their mic forces Bluetooth call mode, which hides the display, so your voice goes through the phone mic.

### Real-world path
A team member runs an HVAC business: customers try the guided fix before a technician drives out, and the technician knows what was tried. In Finnish apartment buildings, trap cleaning is the housing company's job, so maintenance firms are natural buyers. Next: technician checklists such as the annual heat-pump service.

**Concept:** safety-rated AI glasses (impact frame, fits hard hats, in-lens step cards) would bring this to job sites.

### Limitations and next steps
Procedures are AI-drafted from sources and need expert review. Voice uses the phone mic until Meta's in-stream audio. Glasses events (taken off, battery) aren't handled yet. Next: more procedures from manuals, an automatic job log, more languages, and a "which part?" highlight with Gemini Robotics-ER 2.

**Tech:** Meta Ray-Ban Display, Device Access Toolkit, Kotlin, Gemini Live, Gemini Decisions API, Google Search, Node.js.
