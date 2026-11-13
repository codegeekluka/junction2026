# Challenge briefs and event facts (gathered from the Junction Platform)

## 1. Source and timestamp
- Read on **Fri 13.11.2026, around 21:10 (Helsinki time)**, signed in to the Junction Platform in the built-in browser. Read only: nothing was clicked that changes state.
- Pages read:
  - Meta brief: `hackjunction.app/participate/45/challenges/342`
  - Gemini brief: `/participate/45/tech-challenges/48`
  - ElevenLabs brief: `/tech-challenges/50`
  - Aiven brief: `/tech-challenges/43`
  - Participant guide: `/participate/45/guide`
  - Dashboard: `/participate/45`
  - Developer Tools and Assets: `/participate/45/hackerpacks` (Gemini pack is `/68`, Hardware Lab pack is `/57`)
  - Team page: `/participate/45/team`
  - Project page: `/participate/45/project`
  - Hardware desk: `https://2026.hackjunction.com/hardware`
- Public docs read: Meta Wearables developer docs (`wearables.developer.meta.com`, via its `llms.txt`), the Meta DAT GitHub repos, and Gemini Live API docs on `aistudio.google.com/docs` (ai.google.dev now redirects there).
- **The challenge list cards cut the briefs short.** The detail pages (links above) hold the judging weights, resources and mentors.

---

## 2. Meta: "AI Glasses for Everyone, Everyday" (main challenge, Hardware track)
**One-line ask:** show how a first-person field of view enables new or better interactions in everyday scenarios.

**Introduction.** Meta's AI glasses give a first-person view that can make everyday interactions more useful, hands-free and in the moment. Meta wants teams to find where this view creates value beyond mirroring a phone screen. The goal is to turn a clear everyday need into an intuitive, inclusive experience for people of all abilities.

**The challenge:**
- Build the best everyday use case with Meta AI glasses. Show how the first-person view enables new or better interactions in everyday scenarios.
- **Best entries:**
  - clearly state the **problem and the intended audience**
  - deliver a **functional prototype and a deck**
- **Display and audio-first experiences count equally.** So do **web apps and Device Access Toolkit (DAT) mobile integrations**.
- **What to show:**
  - an original, relevant use case with a clear benefit from wearing it
  - a focused, plausible **path to adoption or a pilot**
  - a functional prototype that **handles permissions, errors, performance trade-offs, connectivity, and device state changes**
- Interactions must be intuitive and inclusive for people of all abilities. They need **appropriate consent and safe data practices** within the demo's scope.

**Insight (detail page only):**
- Meta is interested in focused everyday problems where wearables give hands-free, in-the-moment value beyond basic mirroring.
- Show a plausible path to adoption or a pilot.
- **Make accessibility, appropriate consent and safe data practices part of the demo.**
- **Bonus:** teams with the best submissions may be invited to a Meta **AI forum on Wednesday 18 November 2026**, where industry professionals will discuss the future of wearable AI.

**Judging criteria (detail page, 25% each):**
| Criterion | Weight |
|---|---|
| Creativity and use case | 25% |
| Technical execution | 25% |
| Real-world value and feasibility | 25% |
| **User experience: input, accessibility and trust** | 25% |

**Prize:** best overall only. Each member of the winning team gets a pair of Ray-Ban Meta glasses. There is no 2nd or 3rd prize.

**Resources Meta provides:**
- Shared AI glasses: **10 × Meta Ray-Ban Display** and **10 × Ray-Ban Meta Gen 2**, for use during the hackathon
- Charging and hygiene materials
- Developer support at the **Meta booth**. **Amanda Le** is the challenge mentor and point of contact.
- **Mentors:**
  - Web Apps: Ming Lin, William La, Amy Lee, Odil Nikadambaev (all Software Engineers)
  - DAT (iOS): Dennis Punjabi (Software Engineer)
  - DAT (Android): Amanda Le (Product Marketing)
- The brief has no links to docs and does not name a Discord channel. Expect a Meta channel on the Junction Discord (`https://discord.gg/NMDxBZEep`).

### How to actually get glasses (Hardware desk, read at ~21:10 Fri)
- **The glasses are lent through the Junction Hardware Lab desk on the 5th floor, not handed out at the Meta booth.** Booking is at `https://2026.hackjunction.com/hardware`.
- **How borrowing works:**
  - Sign in with your Junction account.
  - Send **one request per team**, with a first and second choice. **A request does not reserve stock.**
  - A volunteer confirms at the desk. Bring your team name and a **photo ID, which stays at the desk as a deposit**.
  - To return, bring the items back to the desk and wait for a volunteer to confirm.
  - Starred items are "special": **one per team at a time**.
- **Availability at the time of reading:**
  | Item | Free now | Waiting requests | Loan limit |
  |---|---|---|---|
  | **Meta Ray-Ban Display Glasses** | **0 of 11** | **31** | **120 minutes** |
  | **Meta Ray-Ban Gen 2** (Wayfarer, Transitions lens) | **0 of 10** | **15** | **240 minutes** |
- **Implication:** we will have glasses only in short time slots. Most development must run **without the glasses**: Meta's Mock Device Kit, or the phone-camera Plan B. Book a slot early on Saturday, and another for filming and for the Sunday peer review.

---

## 3. Tech challenges

### Google DeepMind: Best Use of Gemini API
**The challenge:**
- Build something extraordinary with Google's Gemini API.
- It is an open innovation challenge, with no set problem or industry. Examples given: an AI agent, a developer tool, a creative application, or something new.
- Show a **meaningful, innovative and technically impressive** use of Gemini. **Show why Gemini matters** to your solution and what makes your project stand out.

**Insight:** they want projects that go beyond simply adding an LLM to an app. **The submission must clearly explain:**
1. what problem you are solving and why it matters
2. how you integrated the Gemini API
3. what makes your use of Gemini innovative or technically impressive
4. why Gemini is an important part of your solution

**Resources:**
- Google AI Studio for API keys: https://aistudio.google.com/
- Docs: https://ai.google.dev/gemini-api/docs (now redirects to aistudio.google.com/docs)
- Quickstart: https://ai.google.dev/gemini-api/docs/quickstart

**Credits:**
- Google DeepMind gives Gemini API credits to up to **400 teams**.
- **One person per team** fills in this form: **https://forms.gle/bByXvjGkW9WZuYwW9**
- Eligible teams get account instructions during the event. Keys are created in AI Studio.
- **Credits and the Google-provided accounts are for participants aged 18 or older only.**

**Support:**
- Google DeepMind booth.
- "Build with Google DeepMind" workshop, **Fri 20:00–20:30**. The schedule says the Registration area on the 2nd floor; the workshop list says the Loft on the 4th floor.

**Prizes:**
| Place | Prize |
|---|---|
| 1st | €4,000 + $1,000 Google Cloud credits per team member |
| 2nd | €2,000 |
| 3rd | €1,000 |

**Judging weights:** none published beyond the four points above.

### MLH: Best Use of ElevenLabs
- Use ElevenLabs for natural, human-sounding, emotionally expressive audio. The brief's examples are AI companions, narrated stories and voice-enabled apps.
- "Integrate fully autonomous audio experiences into your hack."
- **Resources:**
  - Claim your code: **https://mlh.link/junction-26**
  - How to build with ElevenLabs: https://mlh.link/elevenlabs
- **Prize:** Best Overall gets wireless earbuds.
- No judging criteria are published.

### Aiven: Best Use of Aiven
- Use **at least one Aiven service as a meaningful part** of the project, and show what it enables.
- You can enter it alongside your main challenge. One service done well can be as impressive as several.
- **Example services:**
  - Aiven Runtime: host the app or agent
  - PostgreSQL: store data
  - Valkey: caching
  - Kafka: events
  - ClickHouse: observe the agent
  - OpenSearch: search
- **Resources:**
  - Sign-up with **$50 free credits**: https://console.aiven.io/signup
  - Docs: https://aiven.io/docs/
  - Runtime templates: https://templates.aiven.io/
  - Aiven mentors are on site all days.
- **Judging:**
  | Criterion | Weight |
  |---|---|
  | Meaningful use of Aiven technology | 40% |
  | Technical implementation | 30% |
  | Impact on the overall solution | 20% |
  | Creativity | 10% |
- **Prizes:** €1,000 / €750 / €500.

### Other relevant packs (Developer Tools and Assets page)
- Anthropic: $20 Claude API credits per participant.
- OpenAI: $100 Codex credits per participant.
- Modal: $100 per participant.
- The Junction Hardware Lab pack points to the hardware desk above.

---

## 4. Participant guide essentials

### Rules (prize eligibility)
- **No code written before the event.** All code outside open-source libraries must be written at the event. Code written in advance for this idea, or a project tied to an existing company, means **disqualification**.
- Team size is 1–4. You must enter at least one challenge.
- **All submissions are licensed MIT**, and the organizers must be able to access the source code. Partner APIs remain under the partners' terms.
- The pitch video can be **2:00 at most**.
- **The whole team must take part in live peer review** to be eligible for the main prize.

### Platform state (as seen from the signed-in account)
- **Team page:** "You don't have a team yet". The account used to read the platform is **not in a team yet**. Someone must create the team and the others join.
- **Project Submission page:** shows only "Create or Join Team".
- **Dashboard:** "Your Submission: Draft" with placeholder text.
- **Next step:** one member creates the team, the others join with the team code, then one member creates the project. **The pre-submission (draft, used as a team count) is due Fri 23:59.**

### Submission (deadline **Sun 15.11 10:00**, form closes automatically, no late entries)
- **Status:** set the project from DRAFT to **FINAL**. Draft projects are not reviewed. You can still edit after setting FINAL, until the deadline.
- **Required fields:**
  - project name, punchline, description
  - challenge(s); you can submit to multiple challenges
  - technologies used
  - a **2-minute video pitch** on a public platform (YouTube or Vimeo), "not a second longer"
  - demo link and source code link
  - source code publicity setting
  - whether you want to be credited
  - **pitch deck (PDF)**
  - **phone numbers** of the team members
  - **Discord usernames**
- The platform says to check each partner's judging criteria carefully.

### Peer review and the main prize
- Partner reviewing and peer reviewing start in parallel after the deadline.
- **Peer review times conflict:**
  - the guide's Reviewing section says **Sun 10:30–14:00**
  - the guide's schedule says **10:30–13:00**
  - the dashboard lists "Review time 2:00 PM"
- **Mechanics:**
  - Each participant reviews the projects assigned to them, at the teams' tables.
  - If a team is not at its table, the reviewer can press **"not present"**.
  - A team that does not take part in peer review is not eligible for the main prize.
- **Peer criteria:**
  - **Innovation:** new or different compared with the other projects
  - **Impact:** significant impact on society, and the share of affected people whose problem gets solved
  - **Implementation:** realistic, viable and feasible from all angles
- **Top 5 by peer review:**
  - They pitch at the closing ceremony: **exactly 3 min (the mic is cut), then 3 min of judges' questions**.
  - A **panel of 7 judges** votes.
  - One handheld mic per team. One person on stage is advised, but more are allowed.
  - Teams can **demo on stage from their own computer**. The connection is checked beforehand.
  - The top teams are fetched after review. There is no separate practice time.
- **Challenge winners are picked by the partners.**

### Schedule highlights
**Friday:**
- 19:30 hacking starts
- 20:00 Google DeepMind workshop
- 21:00 MLH x GitHub workshop
- **23:59 pre-submission**

**Saturday:**
- **12:00 submissions open**
- 14:30–15:15 "Can It Be a Company?" with Kiuas (Loft, 4th floor). Useful for the pilot and adoption story.

**Sunday:**
- **10:00 final submission**
- 10:30 peer review
- 14:00 final ceremony
- **14:15–15:10 top 5 pitching**
- 15:10–15:50 challenge winners
- 15:50–16:05 Junction winner
- 17:00 event ends; 18:00 doors close

### Venue
- **Venue:** Hype Areena, Vanha Jorvaksentie 3, Espoo. Kivenlahti metro is 500 m away. **The metro stops around midnight.**
- **Access:**
  - The venue is open 24/7 from Fri 16:00 to Sun 18:00, but **sleeping there is legally not allowed**.
  - **Keep your badge visible** at all times. Use official entrances only.
- **WiFi:** `Junction2026`. The password is published in the guide.
- **Not provided:** screens, cables, mice, keyboards, headphones. Bring your own water bottle (tap water only).
- **Food:**
  - Fri and Sat meals are on the 2nd floor (Bistro Lilla Sten) and the 3rd floor.
  - Special diets have a separate line on the 2nd floor.
  - Breakfast and the Sunday snack (10:00–13:30) are self-service at snack points.
- **Rest:**
  - Hacker lounges on the 6th floor and in the Loft on the 4th floor.
  - A hackers' sauna on the 7th floor.
  - Hotel Matts gives 20% off with code JUNCTION.
- **Help:**
  - First aid on the 3rd floor.
  - Security hotline: +358 50 5330021.
  - Safe space guardians: Oula Karinen (+358 44 3389744) and Lotta Hämäläinen (+358 44 2222095).
- **3D printers** are at the hardware desk (desk-managed queue).

---

## 5. Technical setup notes from the docs

### Meta: two separate developer routes (key fact)
The Meta Wearables docs (`wearables.developer.meta.com/llms.txt`) define two paths:

1. **Device Access Toolkit (DAT):** native **iOS or Android** phone apps that connect to the glasses. It gives access to the camera, microphones and speakers, plus the display on Ray-Ban Display.
2. **Web Apps for Meta Ray-Ban Display:** HTTPS web apps running in the Chromium browser *on the glasses*.

**"Only the Device Access Toolkit can use the glasses' camera or capture microphone audio."** A web app gets speech input only as text dictated into a text field. With WebMCP, which is off by default, Meta AI can also call tools the page registers.

**For a vision use case such as wayfinding or sign reading, the glasses camera requires a DAT native app. The web-app route cannot see.**

### DAT facts
- **Status:** **developer preview.**
  - Audio streaming (synchronized PCM audio with the camera stream) and standalone photo capture are **experimental** and cannot be published to production. They are fine for a demo.
- **Platforms:**
  - **iOS:** 17.2+ and Xcode 26.4+. Install as a Swift Package from `https://github.com/facebook/meta-wearables-dat-ios`.
  - **Android:** 10+, Android Studio Flamingo+, Kotlin 2.2+. Maven Central group `com.meta.wearable`, e.g. `mwdat-core` and `mwdat-camera` 1.0.1. No access token is needed.
  - **Repos:** `github.com/meta/meta-wearables-dat-android` and `github.com/meta/meta-wearables-dat-ios`. Each has an `AGENTS.md`.
- **Samples (Android repo):** `CameraAccess`, `DisplayAccess`, `BirdSpotter`.
- **Supported glasses:** Ray-Ban Meta Gen 1 and Gen 2, Ray-Ban Meta Optics, Meta Ray-Ban Display, Oakley Meta HSTN and Vanguard.
- **Setup:**
  1. Connect the glasses to the **Meta AI app** and check the firmware and app versions on the version-dependencies page.
  2. Enable **Developer Mode**: in the Meta AI app, go to Settings > App Info, tap the version number 5 times, then turn on the toggle.
  3. Put the **`APPLICATION_ID`** from the Wearables Developer Center (`wearables.developer.meta.com`) in the Android manifest or iOS `Info.plist` under the `MWDAT` key. Developer Mode allows unpublished apps.
  4. Analytics and crash reporting are on by default. You can opt out in the manifest or `Info.plist`.
- **Permissions:**
  - **Registration comes first**: the app registers once with the Meta AI app while the glasses are connected. **Device permissions come second**.
  - The Meta AI app shows "Allow once" or "Allow always".
  - Camera permission is confirmed per device.
  - **In Developer Mode only one third-party app can stay registered at a time.** Registering a new app unregisters the previous one. This matters for shared, borrowed glasses.
- **Camera streaming:**
  - It runs over **Bluetooth Classic** between the phone and the glasses.
  - Frame rates: 2, 7, 15, 24 or 30 fps.
  - Resolutions: 720×1280, 504×896 or 360×640 (high, medium, low).
  - An adaptive ladder first drops resolution, then fps, but never below 15 fps.
  - **Requesting lower resolution or fps can give better-looking frames**, because compression adapts to bandwidth.
  - Photo capture works during a stream (JPEG).
- **Session lifecycle:**
  - Session states are STARTED, PAUSED and STOPPED. They are driven by the device, and the reason for a change is not exposed.
  - **What causes a stop:** opening another system experience (for example "Hey Meta"), another app taking the session, removing or folding the glasses, the app being removed in the Meta AI app, or connectivity loss.
  - **Paused** sessions resume by themselves; do not restart them.
  - **From STOPPED there is no auto-restart.** Start a new session after reconnecting.
- **Device state API:** `batteryLevel`, `chargingState`, `donState` (DONNED or DOFFED), `hingeState` (OPEN or CLOSED), and `thermalLevel` (NONE up to SHUTDOWN). This maps directly onto Meta's "device state changes" criterion.
- **Mock Device Kit:** a simulated device for testing without hardware. It can simulate battery, charging, thermal, don/doff and fold/unfold. **Essential while the glasses are scarce.**
- **AI-assisted development:** DAT plugins exist for Claude Code, Codex and Muse Code. The Wearables docs MCP server is `https://mcp.developer.meta.com/wearables` (no auth) and provides the `search_dat_docs` tool.

### Ray-Ban Display Web Apps facts (if we want a display layer)
- **Only on Meta Ray-Ban Display.** Glasses software v125+ and Meta AI app v272+, with Developer Mode on.
- **Hosting and install:**
  - Must be served from a public **HTTPS** URL with valid TLS.
  - Install via a QR code or deep link `fb-viewapp://web_app_deep_link?appName=…&appUrl=…`, made with the Simulator's "View on Glasses QR". A plain URL QR does not work.
  - Or call `navigator.install()` from a page open on the glasses.
- **Display:** 600×600 additive display.
- **Input:** directional focus navigation, with the Neural Band optional. Text fields open the system composer (handwriting, dictation or keyboard).
- **Audio:** a subset of `speechSynthesis` works for speech output.
- **Other APIs:** geolocation (permission-gated, via the phone), device motion and orientation, the Battery API, and Service Worker offline support.
- **No camera or mic.**
- **Simulator:** the Meta Ray-Ban Display Simulator runs in desktop Chrome.

### Gemini Live API facts (aistudio.google.com/docs/live-api)
- **Models:**
  - **`gemini-3.8-live`**: the default for low-latency voice agents
  - `gemini-3.8-live-extended-thinking`: more reasoning
  - `gemini-3.1-flash-live-preview`: legacy
  - **General models:** `gemini-4-hydrogen` (Flash tier) and `gemini-3.5-flash-lite` (fastest).
  - Gemini 2.5 Flash/Pro are deprecated on 1 Dec 2026.
- **I/O formats:**
  - Input audio: 16-bit PCM, 16 kHz.
  - Images: **JPEG, at most 1 fps**.
  - Output audio: 16-bit PCM, 24 kHz.
- **Connection:**
  - It uses a stateful WebSocket.
  - A browser can connect directly; **use ephemeral tokens** rather than the API key on the client.
  - SDK tutorials exist for Python, plus a raw WebSockets JS tutorial and ADK streaming.
- **Features:**
  - function calling and Google Search tools
  - barge-in
  - input and output transcriptions
  - proactive audio and affective dialog
  - 70 languages, including live translation
- **Session limits (important):**
  - Without compression, **audio+video sessions are limited to 2 minutes** (audio-only: 15 minutes).
  - A connection lives about 10 minutes, and a GoAway message with `timeLeft` comes before it closes.
  - **Turn on `contextWindowCompression`** for unlimited length, and **session resumption** (handles valid for 2 hours) to survive reconnects.
- **Examples:** https://github.com/google-gemini/gemini-live-api-examples. Live demo: https://aistudio.google.com/live

---

## 6. What changes or contradicts PLAN.md / CLAUDE.md
1. **Meta judging weights are now known**, and the criteria differ from PLAN's wording:
   - Creativity and use case 25%
   - Technical execution 25%
   - Real-world value and feasibility 25%
   - **"User experience: input, accessibility and trust" 25%**
   
   PLAN's "Inclusive interaction design" maps to that last one. It explicitly includes **input** (how the user controls it: voice, touchpad, Neural Band) and **trust**.
2. **The glasses come from the Hardware desk (5th floor) under loan limits:**
   - Display: 120 min. Gen 2: 240 min.
   - **All 21 are checked out and 46 requests are waiting** (at ~21:10 Fri).
   
   PLAN's "Meta booth: get glasses" step is wrong. Request through `2026.hackjunction.com/hardware` (one request per team, photo ID deposit). The Meta booth is for **developer support** (Amanda Le).
3. **The web-app route cannot use the camera or mic.** CLAUDE.md asks "does the web-app route work without hardware?" and the answer is no for vision.
   - Web Apps run on Ray-Ban Display only, with display, TTS and dictated text.
   - **Plan A must be a native DAT app (iOS or Android)** for camera frames.
   - A Display web app could be an extra visual layer at most.
   - Plan B (phone camera in a browser to Gemini Live) is still valid as a fallback, but it is not "glasses".
4. **Gemini Live audio+video sessions stop after 2 minutes unless context-window compression is on.** Add session resumption too. This is a real demo risk.
   - Also, Live accepts **at most 1 fps JPEG**, which matches PLAN's ~1 fps idea.
5. **Gemini credits need a form:** https://forms.gle/bByXvjGkW9WZuYwW9. **One person per team**, and every member using the Google accounts must be **18+**. This is not in PLAN.
6. **The Gemini submission must explicitly answer 4 questions:** problem, integration, what is innovative, and why Gemini. Put them in the description and the video.
7. **ElevenLabs needs a code claim:** https://mlh.link/junction-26.
8. **Peer review end time conflicts:** 13:00 in the schedule, 14:00 in the Reviewing section; the dashboard says 2:00 PM. Plan for 14:00. Top-5 pitching is 14:15–15:10, as in PLAN.
9. **Rules not in PLAN:**
   - **no code before the event**; the repo should contain only planning docs from before 19:30 Fri
   - **MIT license** on the submission
   - the source must be accessible to the organizers
10. **The platform team does not exist yet** for the signed-in account. Create the team, have the others join by code, then create the draft project **before 23:59 tonight**.
11. **Bonus:** the best Meta teams may be invited to Meta's AI forum on **Wed 18.11.2026**.
12. **Developer Mode allows only one registered third-party app at a time.** On borrowed glasses, re-register our app at the start of each loan, and expect another team's app to have been there.

---

## 7. Open questions (could not verify)
- How the Meta booth and the Hardware desk share the glasses:
  - Does Meta keep any units for teams in its challenge?
  - Can a team get extended loans for filming or peer review?
  - Is the waiting list first come, first served? *(Ask Amanda Le at the Meta booth, and the desk.)*
- Do the borrowed glasses come already paired to a Meta AI account with Developer Mode on? Or must we pair them to our own phone and Meta account each loan, plus our Wearables Developer Center `APPLICATION_ID`?
- Which DAT platform the Meta mentors favour (iOS: Dennis Punjabi; Android: Amanda Le), and whether the team has a suitable phone (iPhone with iOS 17.2+ and a Mac with Xcode 26.4+, or Android 10+).
- Exact firmware and Meta AI app versions needed: the version-dependencies page was not read in detail.
- Whether the DAT exposes the glasses' **speakers** for app audio output, or whether audio simply plays over the phone's Bluetooth audio route to the glasses. The docs mention speakers, but no API page was read.
- The ElevenLabs code claim page (`mlh.link/junction-26`) was not opened, so its contents are unknown.
- The Meta-specific Discord channel name was not listed on the platform.
- Whether the "Developer Tools and Assets" Meta pack or a Partners page has more Meta logistics. There is no Meta hackerpack; the Partners page was not read.
