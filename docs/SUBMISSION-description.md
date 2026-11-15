## Handyman: your personal handyman on Meta glasses

**Hands-free, real-time guidance, mistakes caught before they happen.** Handyman sees what you see and talks you through a repair. It checks every step on camera, warns you before you make a mistake, and tells you when to call a professional. Demo job: unclogging a sink with a bottle trap, the most common sink drain in Finnish homes.

### The problem

The moments we most need help are the moments our hands are busy. A technician servicing equipment, a builder fitting a component, someone fixing a bike or cooking a new recipe: they all stop, wipe their hands, pick up a phone, scroll a manual or video, and try to remember the next step. Mistakes happen in that gap. At work, those mistakes cost callbacks, rework and safety. At home, they cost time and frustration. And in skilled trades, the know-how leaves when experienced workers retire.

Generic "look and ask" AI is coming to glasses natively, but it improvises. People need expert know-how that watches their hands.

### Who it's for

We start with everyday people facing a common home repair: the 9 in 10 without trade skills. The same engine serves the trades next: HVAC technicians, maintenance and construction, where skipped steps mean callbacks and the know-how leaves with retiring workers.

### What it does
- **Diagnoses first:** you say "my sink drains slowly" and look at it. Handyman identifies the problem and the trap type, then offers the matching procedure. If it's unsure, it asks one clarifying question instead of guessing.
- **Guides by voice and display:** natural, interruptible speech, one step at a time, at your pace. A glanceable card on the glasses shows the step, a short instruction and *Watching… / ✓ Done / ⚠ Stop*.
- **Checks every step on camera:** a step only counts as done when the camera confirms it. The voice can't skip ahead.
- **Warns before harm:** each step lists known beginner mistakes, e.g. "Wait! Bucket first", ~1.3 s after the wrong move.
- **Knows its limits:** hazards (spraying water, wet electrics) trigger an urgent stop. Problems without a sourced procedure are flagged as not expert-verified, with a pointer to a professional.
- **Remembers where you are:** it always knows which step you're on. After a network drop you hear a tone, then "I'm back", and you continue from the same step.

### Inclusive by design
- **Audio-first:** it works without looking at a display and with gloves on; the display only confirms (step, a six-word instruction, ✓ / ⚠).
- **Plain language, at your pace:** one instruction at a time. Interrupt any time, ask "why?" or "repeat that".
- **For many kinds of learners:** people with low literacy or dyslexia, people who learn by doing, and non-native speakers. Gemini Live is multilingual; the demo runs in English.
- **Honest:** it says when it isn't sure and asks for a better view, instead of guessing.

### Consent and data
The camera and microphone run only after you press Start, and the glasses' light shows when the camera is on. No video is stored: frames are kept in memory only. API keys stay on our server, never on the phone. It guides you; it doesn't monitor you.

### Two Gemini models, one job each
A repair assistant must *be* right, not just *sound* right.

1. **Gemini Live (`gemini-3.8-live`) is the voice:** real-time conversation from camera and voice, function calling (start task, diagnose, verify, skip, stop), Google Search, context compression and session resumption. First word in ~0.6–0.8 s.
2. **Gemini Decisions API (`gemini-decision-1`) is the inspector:** all of a procedure's questions (in view? step done? known mistake? hazard?) in **one call per frame**, each with a calibrated confidence. **~0.3 s per check**; a step is confirmed **~1.2–1.5 s after it happens**; ~€0.40/hour at 2 fps.
3. **Confidence decides who acts:** ≥ 75%, confirmed several times → step done. Still unsure → escalate to Gemini Live, which looks and asks the user. You stay in control.

**Why Gemini is essential:** without the Decisions API's fast, calibrated checks there's no trustworthy verification; without Gemini Live there's no natural real-time coaching. The combination, with confidence deciding who acts, is the product.

**Expertise is stored as data:** each step has a "done" check, mistake checks and safety gates; diagnosis is a decision tree over the inspector's answers. The coach's knowledge pack is built from 21 sources (Hansgrohe, Prevex, Kiinteistöliitto) and given to Live in full, so no retrieval step can miss something.

**Frames only when needed:** 0.5 fps idle, 2 fps during a procedure, a burst when you say "done". Live's video input dropped from 60 to ~6–9 frames a minute.

### Architecture
Glasses → Android app (Bluetooth) → Node.js server (WebSocket) → Gemini Live + Decisions API.

- **Glasses app:** Kotlin on Meta's **Wearables Device Access Toolkit**, built from the CameraAccess sample and the Mock Device Kit. It streams frames at the server's rate and shows 30 designer-made cards on the 600×600 display.
- **Server:** procedures, step runner, diagnosis tree, what to say and show. API keys never reach the phone.
- **Measurement:** session recordings, latency/confidence reports and replay on labelled frames. Every number here is from our logs.

### What testing taught us
- **Precise wording is the hard part:** our first object test scored 79%. After adding a gate question and defining each state precisely: 19 of 19 labelled frames correct. Writing those definitions is the expert's job: our advantage.
- **Real glasses changed the audio:** the glasses' mic forces Bluetooth call mode, which covers our display. So your voice goes through the phone mic, and the coach plays on the glasses as media audio.

### Real-world path
A team member runs an HVAC business, which gives us a pilot: customers try the guided fix before a technician drives out, and if it fails the technician knows what was tried. In Finnish apartment buildings trap cleaning is the housing company's job, so maintenance firms are natural buyers. Next, the same engine guides technicians through checklist jobs such as the annual heat-pump service.

### Concept: guidance glasses for job sites
Today's AI glasses aren't rated as safety eyewear, which keeps them off most job sites. As a design concept for Meta: a safety-rated edition with an impact-rated wraparound frame, a fit for hard hats and gloves, and an in-lens display for step cards and checkmarks. It could open a professional market where people buy the glasses for this feature alone.

### Limitations and next steps
- Procedures are AI-drafted from sources and still need expert review.
- Voice uses the phone mic until Meta's in-stream audio (beta).
- Glasses events (taken off, battery, heat) aren't handled yet.
- Next: more procedures from manuals, an automatic job log / handoff report for the technician, other languages, and a "which part?" highlight with Gemini Robotics-ER 2 (too slow for the live loop at 3–7 s).

**Tech:** Meta Ray-Ban Display, Wearables Device Access Toolkit + Mock Device Kit, Kotlin, Gemini Live API, Gemini Decisions API, Google Search grounding, Node.js, WebSockets.
