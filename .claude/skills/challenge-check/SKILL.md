---
name: challenge-check
description: Checkpoint review that grades the current project against the Meta and Google DeepMind (Gemini) judging criteria and the Junction submission checklist, then lists the top 3 gaps to fix. Run only at milestones (a demo step works, before the 22:00 feature freeze, before final submission). Not for individual tasks.
disable-model-invocation: true
---

# /challenge-check: are we building what the judges score?

Run this at **checkpoints only**. Be a strict, honest judge: the goal is to find gaps while there is still time to fix them, not to reassure. Keep the whole report under one screen.

## 1. Gather the current state (read, don't guess)
- `CLAUDE.md` and `PLAN.md`: the decision, pipeline, build-step status table, deadlines.
- `research/01_META_CHALLENGE.md`: Meta brief, judging criteria and submission checklist (verbatim).
- `challenge-briefs.md`: Gemini brief.
- The code: `server/`, `web/`, `android/` (if present), `probes/README.md` (measured latencies).
- `git log --oneline -15` to see what actually got done.
- If the user gives an argument (e.g. `/challenge-check pitch`), focus on that area.

Only credit what exists in the repo or was demonstrated. "Planned" earns nothing.

## 2. Grade each criterion: 🟢 strong / 🟡 partial / 🔴 missing, with one line of evidence

**Meta: AI Glasses for Everyone, Everyday (25% each)**
1. **Creativity and use case:** is it clear why it needs a first-person view and hands-free use, and not a phone? Is it something Meta will *not* ship natively (Muse does generic "look and ask")? Is our edge the expert-verified repair knowledge?
2. **Technical execution:** does it work on the glasses (DAT) or only the phone fallback? Are permissions, errors, latency, connectivity loss and device state (disconnect, don/doff, battery, `CAPABILITY_DENIED`) handled *visibly*?
3. **Real-world value and feasibility:** is the audience clear ("your personal handyman" for the 9 in 10 without trade skills)? Is there a plausible pilot (our HVAC business)? Is the cost per session believable?
4. **UX: input, accessibility and trust:** audio-first, plain language, works for people with low vision or limited reading. Does it show its certainty (🟢 ≥75% / 🟡 / ask for another angle), have safety gates, escalate to a professional, ask for consent and avoid storing video?

**Google DeepMind: Best Use of Gemini API** (and the booth's advice). Can we answer each in one sentence, backed by code?
1. What problem, and why it matters?
2. How is the Gemini API integrated (which models, for what)?
3. What's innovative or technically impressive (more than "LLM added to an app")?
4. Why is Gemini essential?
- Booth advice: is the Decisions API used as a **decision tree / router** (one problem at a time, ≤1,000 questions), with **low confidence escalating to Gemini Live**? Is the certainty shown to the user? Do we use the cost/latency argument (cheap fast checks, expensive reasoning only when needed)?

**Submission readiness** (Final due **Sun 10:00**, aim for 09:30)
- Name, one-line punchline, description, challenges selected (Meta + Gemini [+ ElevenLabs]), technologies.
- **Video ≤ 2:00**, deck PDF, demo link, public source repo (MIT), phone numbers and Discord names.
- 60-second peer-review demo that anyone gets instantly. Everyone is at the venue Sun 10:30–14:00.

## 3. Output format
```
## Challenge check: <date time> · checkpoint: <what just landed>
Meta:   Creativity 🟢/🟡/🔴 · Tech 🟢/🟡/🔴 · Value 🟢/🟡/🔴 · UX & trust 🟢/🟡/🔴
Gemini: Problem · Integration · Innovative · Essential · Booth advice  (🟢/🟡/🔴 each)
Submission: <n>/<total> items ready

| Criterion | Grade | Evidence (file or demo) |
...

### Top 3 gaps (highest score impact per hour of work)
1. <gap> → <concrete fix>, <owner if obvious>, ~<time>
2. ...
3. ...

### Drifting? <one line: anything we're building that no criterion rewards, which we should stop>
```
Rank gaps by **score gained per hour remaining**, given the clock (feature freeze Sat 22:00). Prefer fixes that make an existing strength *visible in the demo* over new features.

Don't edit files. If the user asks, add the top 3 gaps to the status table in `PLAN.md`.
