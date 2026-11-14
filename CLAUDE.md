# Junction 2026 — Team Context

> Shared context for our team. Everyone (and every teammate's Claude / AI assistant) should read this first.
> Claude Code loads this file automatically when it's opened in this folder.
> **Game plan, roles and timeline: `PLAN.md`.** Meta glasses dev setup (DAT vs Web Apps, links, hardware troubleshooting): `META-DEV.md`. Full briefs (Meta, Gemini, ElevenLabs, Aiven), participant guide and SDK setup notes: `challenge-briefs.md`. Full list of all challenges and scores: `challenges-report.md`. Team profile: `TEAM.md`.

## The event
- **Junction 2026**, Hype Areena, Espoo · Fri 13.11 16:00 → Sun 15.11 18:00 · team size 1–4 · €100k total prizes
- Platform: https://hackjunction.app/participate/45 (challenges, submission, peer review) · Comms: Junction Discord
- Theme: *European Tech Renaissance*. "Someone will move the center of gravity."

## Deadlines
| When | What | Who |
|---|---|---|
| **Fri 23:59** | Draft submission on the platform listing our challenges (can still change later) | One member creates the project |
| Sat 12:00 | Submissions open | |
| **Sun 10:00** | **FINAL** submission. Switch it from DRAFT to FINAL. No late entries. | |
| Sun 10:30–14:00 | Live peer review. **Everyone must be at the venue**, or we're out of the main prize. (The guide's schedule says it ends at 13:00, elsewhere 14:00. Plan for 14:00.) | All |
| Sun 14:15 | Top 5 pitch (3 min + 3 min Q&A) for the €10,000 main prize | |
| Sun 15:10 | Challenge winners announced | |

**Final submission needs:**
- name, one-line punchline, description
- challenges entered, technologies used
- a **video of max 2:00** (strictly enforced)
- demo and source code links, plus a pitch deck PDF
- team phone numbers and Discord names

**Rules:** no code written before the event. All submissions are MIT-licensed, and the organizers must be able to access the source code.

## Our decision: Meta glasses + a small set of tech challenges
We are **not** spreading thin: one product, one main challenge, only tech challenges that are a natural part of it.

| Challenge | Role in the project | Prize |
|---|---|---|
| **Meta: AI Glasses for Everyone, Everyday** (main, Hardware track) | The product | Ray-Ban Meta glasses for each winning team member |
| **Google DeepMind: Best Use of Gemini API** (tech) | The AI brain: sees the camera, hears the user, reasons | €4,000 + $1k GCP credits/member (2nd €2k, 3rd €1k) |
| **MLH: Best Use of ElevenLabs** (tech) | Natural voice output (audio-first) | Wireless earbuds |
| *(optional)* **Aiven** (tech) | Only if we need a database. Host it on Aiven. | €1,000 / €750 / €500 |

**Deliberately skipped:**
- Nemotron and Gemma: competing AI models, and their judges want their own model at the core
- Verda and Modal: heavy computing power we don't need
- Stoa and Wikipedia: separate main challenges that would split our effort

### Meta brief (summary)
- **Ask:** build the best *everyday* use case for Meta AI glasses, showing how a **first-person field of view** enables new or better interactions. It should go beyond mirroring a phone screen.
- **Deliver:** a clearly stated problem and audience, a **functional prototype**, and a **deck**.
- **Judged on, 25% each:** creativity and use case, technical execution, real-world value and feasibility, and **user experience: input, accessibility and trust**. The prize goes to the best overall entry only. The best teams may be invited to Meta's AI forum on Wed 18.11.
- Display and **audio-first** experiences count equally.
- **Only the Device Access Toolkit can use the glasses' camera or microphone.** Web apps run only on Ray-Ban Display, with a screen and text-to-speech but no camera or mic. Our product needs the camera, so it has to be a **native iOS/Android app using the toolkit**.
- **Getting glasses:** from the **Hardware Lab desk on the 5th floor**, not the Meta booth. Request at https://2026.hackjunction.com/hardware (one request per team, it doesn't reserve stock, photo ID kept as a deposit). Loans: 2 hours for Ray-Ban Display, 4 hours for Gen 2. Demand is far higher than stock.
- **Meta booth** is for developer help: Amanda Le (main contact), Dennis Punjabi (iOS).
- **Toolkit setup:** developer preview. iOS 17.2+ and Xcode 26.4+ (Swift Package), or Android 10+ (Maven `com.meta.wearable`). Turn on Developer Mode in the Meta AI app and register an application ID in the Wearables Developer Center. Use the Mock Device Kit to build without glasses. Shared glasses hold only one unpublished app, so re-register ours at the start of every loan.
- **Strong entries show:**
  - an original, relevant use case with a clear benefit from wearing it
  - a focused, plausible path to adoption or a pilot
  - a prototype that handles permissions, errors, performance trade-offs, connectivity and device state changes
  - consent and safe data practices

### Gemini brief (summary)
- Open challenge: a meaningful, innovative, technically impressive use of the Gemini API. Any industry or idea.
- They want more than "an LLM added to an app": Gemini should **enable something genuinely new** or make an existing solution much better.
- The submission must clearly explain:
  1. the problem and why it matters
  2. how we integrated the Gemini API
  3. what makes our use innovative or technically impressive
  4. why Gemini is essential to the solution
- Make Gemini the visible core, e.g. live multimodal understanding of what the wearer sees.
- **Credits:** Google DeepMind gives Gemini API credits to up to 400 teams. One person per team fills in https://forms.gle/bByXvjGkW9WZuYwW9. Instructions for accessing the accounts come during the event, and keys are generated in Google AI Studio. **Accounts and participation are 18+ only.**
- **Support:** Google DeepMind booth at the venue. There was a "Build with Google DeepMind" workshop on Friday.
- **Gemini Live limits:** audio+video sessions stop after **2 minutes** unless `contextWindowCompression` is on. Also turn on session resumption to survive reconnects. Video input is at most 1 frame per second. Model: `gemini-3.8-live-preview` (model card: `gemini-3.8-live`).

### ElevenLabs brief (summary)
- Use ElevenLabs for natural, expressive voice in the project.
- Claim the code at https://mlh.link/junction-26.

## ✅ DECIDED (Sat 14.11): hands-free repair coach, demo = fixing a sink
- The story is about workers and handymen (1 in 10 people work with their hands) plus the 9 in 10 who lack the know-how. The story is still being refined by our designer.
- Pipeline: **three Gemini models**:
  - **Gemini Live:** the voice
  - **Gemini Decision 1 / Decisions API:** the watcher, running continuous yes/no step checks
  - **Gemini Robotics-ER 2:** the pointer, giving spatial locations
- Full architecture and build steps: `PLAN.md` §3–4. The sections below are earlier brainstorming.

## Use-case direction (earlier brainstorm, superseded)
Our edge: an **architect** and a **designer** (spaces, inclusive design, pitch), an **EE/AI builder** (Gemini pipeline, glasses integration), and a **data scientist who runs an HVAC business** (real users, domain knowledge, connections).

- **Lead idea:** *Accessible wayfinding for low-vision people.* The glasses read signs and find entrances, lifts and accessible routes inside unfamiliar buildings, then guide the wearer by voice. This fits "everyday", "inclusive" and "first-person view", and uses the architect's knowledge of buildings.
- **Alternative:** a hands-free home-appliance helper. Look at your heat pump or boiler and ask "why is it beeping / what does this error mean?" Uses our HVAC domain knowledge and real customer cases.

## Roles (suggested)
| Member | Owns |
|---|---|
| EE / AI | Glasses ↔ app ↔ Gemini pipeline, ElevenLabs voice, making the demo reliable |
| Data science / HVAC | Use-case research with real users, data and evaluation, the impact numbers for the pitch |
| Architect | Spatial logic (buildings, routes, signage), demo scenario and set, deck visuals |
| Designer | Inclusive interaction design (voice flows, errors, consent), deck, **2-min video** |

## Open questions / to-do
- [ ] Request glasses at https://2026.hackjunction.com/hardware now (5th-floor Hardware Lab desk, bring photo ID)
- [x] Pick iOS or Android → **Android** (team is on Windows). Next: get the Mock Device Kit running until glasses arrive
- [x] Pick the use case → sink-repair coach. [ ] Write the one-line punchline
- [ ] **Create the team on the platform** (no team exists yet), have the others join by code, then create the draft project with Meta + Gemini + ElevenLabs **before Fri 23:59**
- [ ] Gemini credits form (one person per team): https://forms.gle/bByXvjGkW9WZuYwW9. Check everyone is 18+
- [ ] ElevenLabs code: https://mlh.link/junction-26
- [ ] Get Gemini and ElevenLabs API keys (each person their own; never commit keys to the repo)
- [ ] Join the Discord channels for Meta, Gemini and ElevenLabs
- [ ] Sat evening: feature freeze. Sun morning: video and deck.

## Working rules
- Keep the demo path working at all times; do the polish later.
- Secrets go in `.env` (git-ignored), never in code or chat.
- Update this file when we make a decision, so everyone's AI has the same context.
