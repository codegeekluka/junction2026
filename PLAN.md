# Junction 2026 — Game Plan (Meta glasses + Gemini)

Team: 2 tech (EE/AI · data science/HVAC) + 2 design (architect · designer). Goal: win Meta + Gemini, and aim for the top 5 for the €10k main prize.

## 1. The challenge, in one screen
**Meta — AI Glasses for Everyone, Everyday.** Build the best *everyday* use case where the glasses' **first-person view** makes an interaction new or better. Mirroring a phone screen doesn't count.

**What they judge (design for each of these):**
| Criterion | What it means for us |
|---|---|
| Creativity | An original use case with an obvious "why on your face, not in your hand" |
| Technical execution | A functional prototype that handles **permissions, errors, performance trade-offs, connectivity loss and device state changes** (glasses disconnect, battery, mic busy). Show these in the demo. |
| Real-world impact | A clear audience and a **plausible path to a pilot** (who would deploy it first?) |
| Inclusive interaction design | Works for **people of all abilities**, with consent and safe data handling |

- Audio-first and display experiences count equally, so **we don't need a display**.
- Web apps and Device Access Toolkit mobile integrations are both accepted.
- **Deliverables:** a clear problem and audience, a functional prototype, and a deck.

**Gemini — Best Use of Gemini API** (€4,000 + $1k GCP credits/member for 1st; €2k; €1k). Judges want a meaningful, innovative, technically impressive use, and **why Gemini matters**. Make live multimodal understanding (seeing and hearing in real time) the visible core of the demo.

**Optional add-ons:**
- **ElevenLabs:** only if we want a custom or expressive voice. Gemini Live can already speak, so we may not need it.
- **Aiven:** only if we need a database.

Don't add anything else.

## 2. The 7 things everyone must know
1. **Tonight 23:59:** draft project on the platform with our challenges (Meta + Gemini, plus ElevenLabs if used). We can change them later.
2. **Sun 10:00:** FINAL submission. Switch it from DRAFT to FINAL. No late entries.
3. **Video max 2:00**, strictly enforced. Also needed: a deck PDF, demo and repo links, and phone numbers.
4. **Sun 10:30–14:00 peer review:** all 4 must be there, or we lose the main prize. Other hackers vote, so we need a 60-second demo anyone gets instantly.
5. The top 5 pitch for **3 min + 3 min Q&A**. The mic is cut at 3:00.
6. **Privacy is part of the judging.** Camera glasses raise bystander concerns, so show consent and that we don't store video.
7. **Sleeping at the venue isn't allowed.** Plan who goes home when.

## 3. Use case: decide by 22:30 tonight
Test each idea:
- Does the first-person view do something a phone can't?
- Can we name one real person who needs it?
- Can we demo it live in 60 seconds at the venue?
- Is it inclusive?

| Idea | Why it can win | Risk |
|---|---|---|
| ⭐ **Wayfinding for low-vision people:** reads signs and finds entrances, lifts, toilets and accessible routes in unfamiliar buildings, with voice guidance | Hits every Meta criterion. The architect brings real expertise on how buildings work. Easy to demo inside Hype Areena. | Navigation must be framed as *assistance*, not safety-critical |
| **Home appliance helper:** look at your heat pump or boiler and ask "why is it blinking?" | Real HVAC domain knowledge and real customers. Clear pilot path through the HVAC business. | Less "everyone, everyday", and less inclusive by default |
| *(propose your own and run the same test)* | | |

## 4. Tech architecture (keep it simple)
```
Ray-Ban Meta glasses ──(camera frames + mic via Meta Wearables Device Access Toolkit)──▶ phone app
phone app ──(streaming audio + video frames)──▶ Gemini Live API ──(spoken reply)──▶ glasses speakers
                                    └─ tool calls (e.g. "describe_sign", "find_route", "remember_place")
```
- **Plan A:** native phone app using Meta's Device Access Toolkit for camera and audio, streaming to the Gemini Live API.
- **Plan B (build it first, tonight):** a phone web app using the **phone camera** mounted at eye level, streaming to Gemini Live. This keeps the whole pipeline working even if the glasses or toolkit are late, and switching to glasses later is just changing the input.
- Keep secrets in `.env`, each person with their own API key.
- **Latency is the risk.** Send low-resolution frames at about 1 fps and only push detail when asked.

## 5. Roles
| Person | Owns | Tonight |
|---|---|---|
| **Tech 1 (EE/AI)** | Gemini Live pipeline, prompts, tool calls, latency | Get a Gemini API key and a "see and talk" demo working on a phone camera (Plan B) |
| **Tech 2 (data/HVAC)** | Glasses integration (Device Access Toolkit), app shell, error and state handling, test logging | Meta booth: get glasses and toolkit access, run Meta's sample app |
| **Designer 1 (architect)** | Use-case logic (spaces, routes, signage), demo scenario and route at the venue, deck visuals | Write the user scenario and pick 3 demo spots in the venue |
| **Designer 2** | Voice and interaction design: what it says, when, how it fails gracefully, consent, accessibility. Also the **2-min video**. | Persona, conversation script, consent and onboarding flow |

## 6. Timeline
**Friday (now → ~01:00)**
- [ ] Meta booth: glasses available? Device Access Toolkit sample app? Is a web-app route possible? *(Tech 2, now)*
- [ ] Use case decided *(all, 22:30)*
- [ ] Draft submission on the platform *(before 23:59)*
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
