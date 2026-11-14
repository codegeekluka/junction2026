# Junction 2026 — Game Plan (Meta glasses + Gemini)

Team: 2 tech (EE/AI · data science/HVAC) + 2 design (architect · designer). Goal: win Meta + Gemini, and aim for the top 5 for the €10k main prize.

## 1. The challenge, in one screen
**Meta — AI Glasses for Everyone, Everyday.** Build the best *everyday* use case where the glasses' **first-person view** makes an interaction new or better. Mirroring a phone screen doesn't count.

**What they judge (25% each, design for every one):**
| Criterion | What it means for us |
|---|---|
| Creativity and use case | An original use case with an obvious "why on your face, not in your hand" |
| Technical execution | A functional prototype that handles **permissions, errors, performance trade-offs, connectivity loss and device state changes** (glasses disconnect, battery, mic busy). Show these in the demo. |
| Real-world value and feasibility | A clear audience and a **plausible path to a pilot** (who would deploy it first?) |
| User experience: input, accessibility and trust | Works for **people of all abilities**, with clear input, consent and safe data handling |

- Audio-first and display experiences count equally, so **we don't need a display**.
- **Only the Device Access Toolkit can use the glasses' camera or mic.** Web apps run only on Ray-Ban Display and can't see or hear, so our product must be a native iOS/Android toolkit app. Full details: `challenge-briefs.md`.
- Prize is best overall only. The best teams may be invited to Meta's AI forum on Wed 18.11.
- **Deliverables:** a clear problem and audience, a functional prototype, and a deck.

**Gemini — Best Use of Gemini API** (€4,000 + $1k GCP credits/member for 1st; €2k; €1k). Judges want a meaningful, innovative, technically impressive use, and **why Gemini matters**. Make live multimodal understanding (seeing and hearing in real time) the visible core of the demo. The submission must answer: the problem, how Gemini is integrated, what's innovative, and why Gemini matters. Credits: one person per team fills in https://forms.gle/bByXvjGkW9WZuYwW9 (Google account users must be 18+).

**Optional add-ons:**
- **ElevenLabs:** only if we want a custom or expressive voice. Gemini Live can already speak, so we may not need it. If used, claim the code at https://mlh.link/junction-26.
- **Aiven:** only if we need a database.

Don't add anything else.

## 2. The 9 things everyone must know
1. **Tonight 23:59:** create the team on the platform (none exists yet), the others join by code, then the draft project with our challenges (Meta + Gemini, plus ElevenLabs if used). We can change them later.
2. **Sun 10:00:** FINAL submission. Switch it from DRAFT to FINAL. No late entries.
3. **Video max 2:00**, strictly enforced. Also needed: a deck PDF, demo and repo links, and phone numbers.
4. **Sun 10:30–14:00 peer review:** all 4 must be there, or we lose the main prize. Other hackers vote, so we need a 60-second demo anyone gets instantly. (One schedule says it ends at 13:00; plan for 14:00.)
5. The top 5 pitch for **3 min + 3 min Q&A**. The mic is cut at 3:00.
6. **Privacy is part of the judging.** Camera glasses raise bystander concerns, so show consent and that we don't store video.
7. **Sleeping at the venue isn't allowed.** Plan who goes home when.
8. **Glasses come from the Hardware Lab desk (5th floor), not the Meta booth.** Request at https://2026.hackjunction.com/hardware: one request per team, it doesn't reserve stock, photo ID kept as a deposit. Loans are 2 h (Ray-Ban Display) or 4 h (Gen 2), and demand is far above stock. Plan our glasses time in short, booked blocks.
9. **No code written before the event.** Submissions are MIT-licensed and the source must be accessible.

## 3. Use case: DECIDED (Sat 14.11)
**A hands-free repair coach. The demo is fixing a sink (the P-trap under the basin).**
- **Story: "your personal handyman"** (teammate owns it, still being refined). We bring a tradesperson's expertise to ordinary people. It's not aimed at professionals.
- **Differentiator (from the Meta booth):** Meta will ship generic "look and ask" AI natively (Muse on glasses). It won't ship **expert-verified procedures, step checking, safety gates and handoff to a real pro**. That's our product.
- **Trust:**
  - Expert-authored repair plans: the model guides and checks but doesn't make up the steps.
  - Confidence scores from the Decisions API: "I'm not sure, show me closer."
  - Safety gates and escalation to a pro.
- **Speed:** the feedback loop must feel instant. Measure it (step 0) and quote the number.
- **Why glasses:** both hands are busy and wet under the sink. A phone can't be held or propped there.
- **Why it's worth buying:** one fixed leak saves a €150+ call-out. Daily uses (cooking, assembly, bike) keep the glasses on your face.
- **Pilot path:** our HVAC business. Customers try the fix themselves before a technician drives out. If it fails, the technician gets a handoff report.

## 4. Tech architecture: three Gemini models
```
Ray-Ban Meta glasses ──camera + mic (DAT)──▶ phone app ◀── speaker audio (+ snapshot on display)
                                               │  (Plan B: browser page using the phone camera)
                                               ▼
                         Backend (API keys, tools, session state, repair plan)
   ┌──────────────────────────┬───────────────┴────────────┬──────────────────────────────┐
   ▼                          ▼                            ▼                              ▼
Gemini Live               Gemini Decision 1           Gemini Robotics-ER 2          Google Search
gemini-3.8-live-preview   gemini-decision-1           gemini-robotics-er-2-preview  grounding (via Live)
THE VOICE                 THE WATCHER                 THE POINTER                   model no. → part/manual
talks, can be interrupted yes/no checks on frames     "where's the slip nut?"
calls tools               every 1–2 s, ~200 ms,       point/box + whether the step
                          with a confidence score     is done (deep check)
```
**How they work together:** the watcher flags something → the pointer locates it if needed → the voice tells the user.
- **Gemini Live:** audio in as 16kHz PCM, JPEG frames at ≤1 fps, audio out at 24kHz. Use ephemeral tokens or the backend relay so keys never reach the phone.
- **Decision 1 (Decisions API, launched 11.11.2026):** closed-set questions (yes/no, multiple choice, or a score) answered with a probability and a confidence score. Up to 1,000 questions per request, $0.10 per 1M input tokens. Low confidence means ask the user, or call ER.
- **Robotics-ER 2 (preview):** pointing, bounding boxes, and detecting whether a task succeeded. Runs on a sharp snapshot when Live calls it as a tool. Stretch goal: `gemini-robotics-er-2-streaming-preview`.

**Tools that Live calls:**
| Tool | Does | Model |
|---|---|---|
| `identify_fixture` | Reads the brand/model, finds the part or manual | Live + Search |
| `locate(part)` | Gives a point on the image → spoken directions / circled snapshot | Robotics-ER 2 |
| `check_step(step)` | Says whether the step is done, with the reason | Decision 1 (Robotics-ER 2 if unsure) |
| `safety_gate` | Blocks progress until a condition holds (water off, bucket in place) | Decision 1 |
| `recall(step)` | Returns the keyframe from when that part came off | session memory |
| `handoff_report` | Summary + photos + part number + steps tried | Gemini text model |

**Gemini Live limits (must handle):** audio+video sessions **stop after 2 minutes** unless `contextWindowCompression` is on. Also turn on **session resumption** so a dropped connection resumes. Video input is at most 1 frame per second.

**Glasses app (Device Access Toolkit) notes:**
- It's the only way to use the glasses' camera and mic; a web app can't reach them. Android 10+ (Maven `com.meta.wearable`).
- Turn on Developer Mode in the Meta AI app and register an application ID in the Wearables Developer Center. Start from the CameraAccess sample.
- Use the **Mock Device Kit** to build and test without glasses, so loan time is spent only on testing on the real device.
- Shared glasses hold only one unpublished app: **re-register ours at the start of every loan.**

**Watcher loop (backend, independent of Live):** every 1–2 s, send the latest frame plus the questions for the current step (including "too dark/blurry?") to Decision 1. A confident "wrong" result makes Live interrupt the user ("stop, flip that washer").

**Robustness the Meta judges want to see (demo at least one):**
- **Glasses disconnect:** fall back to the phone camera and keep the current step.
- **Network drop:** resume the session and keep the step state.
- **Dark or blurry frame:** ask the user to move closer or add light.
- **Consent:** ask for consent at start, and only run when activated.
- **Data:** no video is stored. Keep one keyframe per step, deleted at the end of the session.

**Stack (proposal):** a Node.js backend (WebSocket relay + tools) using the `@google/genai` SDK, a plain web client for Plan B, and a DAT app on **Android (Kotlin)**, decided because the whole team is on Windows and iOS needs a Mac with Xcode. We need an Android phone for the demo. Secrets go in `.env`.

### Build steps (work top to bottom; ✅ = demo-able checkpoint)
| # | Step | Depends on | Parallel? |
|---|---|---|---|
| 0 | Gemini API key + credits form. Probe scripts: send 3–5 photos of the real sink to Decision 1 and Robotics-ER 2. Measure latency and accuracy. | — | **A** |
| 1 | Backend skeleton: WebSocket relay to Gemini Live, `.env`, health check | 0 (key) | **B** |
| 2 | Web client: phone camera + mic → backend → voice reply ✅ *core loop* | 1 | B |
| 3 | Repair plan (P-trap steps as JSON: checks, safety gates, phrasing) | — | **C** (designer + AI) |
| 4 | Tools in Live: `check_step`, `safety_gate`, `locate` (wired to 0's modules) | 2, 3 | B |
| 5 | Watcher loop + proactive interrupt ✅ *"stop, flip the washer"* | 4 | B |
| 6 | Keyframe memory + `recall` + `handoff_report` | 4 | B |
| 7 | Android DAT app: glasses camera/mic → same backend (mock device first) ✅ *on glasses* | 1 | **D** |
| 8 | Robustness: disconnect fallback, network resume, dark/blurry, consent screen | 5, 7 | B + D |
| 9 | Demo set: a real sink/trap at the venue, rehearse the 60-second flow, film | 5 | design |
| — | **Feature freeze 22:00** | | |

## 5. Roles
| Person | Owns | Tonight |
|---|---|---|
| **Tech 1 (EE/AI)** | Gemini Live pipeline, prompts, tool calls, latency | Get a Gemini API key and a "see and talk" demo working on a phone camera (Plan B) |
| **Tech 2 (data/HVAC)** | Glasses integration (Device Access Toolkit), app shell, error and state handling, test logging | Request glasses at the Hardware Lab (5th floor). Set up the toolkit with the Mock Device Kit and run Meta's CameraAccess sample. Ask the Meta booth (Amanda Le; Dennis Punjabi for iOS) for help. |
| **Designer 1 (architect)** | Use-case logic (spaces, routes, signage), demo scenario and route at the venue, deck visuals | Write the user scenario and pick 3 demo spots in the venue |
| **Designer 2** | Voice and interaction design: what it says, when, how it fails gracefully, consent, accessibility. Also the **2-min video**. | Persona, conversation script, consent and onboarding flow |

## 6. Timeline
**Friday (now → ~01:00)**
- [ ] Request glasses at https://2026.hackjunction.com/hardware, pick iOS or Android, get the Mock Device Kit and CameraAccess sample running *(Tech 2, now)*
- [ ] Gemini credits form (one person) and ElevenLabs code if used *(Tech 1, now)*
- [ ] Use case decided *(all, 22:30)*
- [ ] Create the team on the platform, everyone joins, then the draft submission *(before 23:59)*
- [ ] Plan B pipeline: phone camera → Gemini Live → voice reply *(Tech 1)*
- [ ] Persona, scenario, script v1 *(designers)*
- [ ] Go home and sleep. Saturday is the real build day.

**Saturday**
| Time | Tech | Design |
|---|---|---|
| 09–13 | Full loop running **on the glasses**: see → understand → speak | Finalize voice script and error and consent flows. Deck skeleton. Book 1–2 real users to test (low-vision association / HVAC customers). |
| 13–18 | Robustness: permissions, disconnects, low battery, no network, slow responses. Make each one visible and polite. | **User test** with a real person and record it for the video. Visual identity. Video storyboard. |
| 18–22 | Polish the demo path only. **Feature freeze at 22:00.** | Film demo footage at the venue. Draft the deck. |

**Sunday**
| Time | Task |
|---|---|
| 07–09 | Edit the video (≤2:00), finish the deck, fill in the submission |
| **09:30** | **Set the submission to FINAL** (30 min buffer before 10:00) |
| 10:30–14:00 | Peer review: run the 60-second live demo on loop and rehearse the 3-min pitch in between |
| 14:15 | If top 5: pitch. One speaker plus the demo on the glasses. |

## 7. Demo and pitch shape
1. **Hook (15s):** a real person and moment, e.g. "Anna can't read the sign above the lift."
2. **Live demo (60–90s):** the glasses doing it, including **one graceful failure** (connection drops, it tells you clearly). That proves technical execution.
3. **Why glasses, why Gemini (30s):** hands-free first-person view plus live multimodal reasoning.
4. **Impact and pilot (30s):** who deploys it first (e.g. a building operator or accessibility organization), and how many people it affects.
5. **Privacy (15s):** consent, no stored video, how bystanders are handled.
