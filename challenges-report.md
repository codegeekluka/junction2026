# Junction 2026 — Challenge Report

*Source: logged-in Junction Platform (hackjunction.app/participate/45/challenges and /guide), read 2026-11-13 ~20:45. Team profile: `TEAM.md`. Goal: win prizes.*

## ⏰ Deadlines that matter
| When | What |
|---|---|
| **Fri 13.11 23:59 (tonight)** | One team member creates the project submission and submits a **draft with the challenge(s) you plan to tackle**. You can still change them later. |
| Sat 14.11 12:00 | Submissions open |
| **Sun 15.11 10:00** | FINAL submission. Switch it from DRAFT to FINAL. Needs a ≤2-minute video, a pitch deck PDF, and demo and repo links. No late entries. |
| Sun 10:30–14:00 | Peer review. **The whole team must be present**, or you lose eligibility for the main prize. |

## Rules on combining challenges (verified)
- Participant Guide: *"You are allowed to submit a project for multiple challenges."* That covers main challenges as well as tech ones.
- Tech challenges *"run across every track"*. OpenAI, Arduino, Aiven, Modal, Oxylabs, CRACI and Context.dev each say explicitly that they can be combined with any main challenge.
- Each partner judges against its own criteria. Separately, the overall **€10,000 Junction main prize** goes through peer review (innovation, impact, implementation), then the top 5 pitch for 3 minutes each to a 7-judge jury.
- **Practical limit:** every extra challenge has its own judging criteria and often its own submission form or Discord post. Stacking only pays off when the extra challenge is a natural part of the same project.

## All main challenges (19)
| Track | Partner | Challenge | Core ask | 1st prize |
|---|---|---|---|---|
| Agentic AI | Hostinger | Decode the Noise | Detect propaganda, bots and bad actors; must run live on Hostinger | €2,000 |
| Agentic AI | Tieto | Earned Trust in AI Code | Concept and reference implementation for AI reviewing AI-written code (C# repo provided) | €2,000 |
| Agentic AI | Cala | Make Unicorns Real | Product for founders/VCs built on Cala's company and funding data | ~€5k hackathon travel + €1k credits |
| Agentic AI | Bahn Express | Spread | Agent runs a car-transport company in a simulation; leaderboard on margin | €2,000 |
| Agentic AI | AfterQuery | Break the Agent | RL environment where frontier agents fail; reward must resist exploits | €3,000 + work trial |
| Agentic AI | Valio Aimo | Trusted Trade Agents | Interface and operating model for external purchasing agents ordering from a wholesaler, incl. human approval | **€4,000** |
| Agentic AI | Exa | Internet Butler | Personal agent doing tedious life tasks using Exa search | $2,500 + $5k credits |
| Hardware | Arduino | Green European Renaissance | Edge AI on Arduino UNO Q for local green/sustainability problems | Ventuno Q per member |
| Hardware | **Meta** | **AI Glasses for Everyone, Everyday** | Everyday use case where a first-person view helps; functional prototype + deck; inclusive design | Ray-Ban Meta glasses per member |
| Hardware | Ignite Next × Intel | Physical AI | Robot arm picks Duplo bricks and sorts defects autonomously (VLA + Anomalib on Intel laptop) | **€5,000** |
| Hardware | Rokoko | Robot Teleoperation | Mocap suits/gloves controlling robots | Smartgloves + SDK (~€5k) |
| Hardware | Aalto | Aaltonomous Humanoid | Policy for Unitree G1 to sort blocks (Isaac Sim → real robot) | €2,000 + lab visit |
| Healthcare | AstraZeneca | Equal Care Across Finland | AI finding cancer-care pathway gaps + actionable recommendations | €1,000 |
| Healthcare | Aalto | Beyond the Clinic | At-home maintenance after TMS depression treatment | TBA |
| AI Infra (Verda) | **Stoa** | **Make Blueprints Talk** | Answer natural-language questions about real construction drawings/BIM, **correctly and verifiably** (show where in the drawing) | €1,000 + **work trial** |
| Data | Context.dev | Web Is Your Real-Time Database | Product reacting to live web data | €2,000 |
| Data | City of Espoo | Rethinking Recruitment | Better matchmaking at the city's recruitment events in the AI-CV era | €1,500 |
| Data | **MariaDB** | **Wikipedia Through Time** | Wikipedia tools on MariaDB vector RAG and/or system-versioned tables | €1,000 + credits + certs |
| FinTech | S-Pankki | Personal Economic Trainer | Chat with your own bank data (synthetic), mobile-first, teaches spending | €2,000 Airbnb card |

## Tech challenges (stack with anything)
| Partner | Ask | Prize | Fit for us |
|---|---|---|---|
| **Google DeepMind – Gemini API** | Meaningful, impressive use of Gemini | **€4,000 + $1k GCP/member**, €2k, €1k | ⭐ Gemini is strong at reading drawings and video, so it fits Stoa and the glasses |
| Google DeepMind – Gemma | Best use of open Gemma models | 3 × €1,000 | Good if a small model runs on-device or gets fine-tuned |
| **Verda** | Something you couldn't build on a laptop, on Verda compute (document your process in Discord) | **$10k credits**, 2× $2.5k | Good if you fine-tune a drawing model or run batch jobs |
| **NVIDIA – Nemotron 3.5 Super VL** | Nemotron central to the solution (it reads images and PDFs) | 2 × RTX 5080 | ⭐ A vision-language model reading drawings fits Stoa well |
| OpenAI – Codex | Use Codex in your dev process | $10k/$5k/$2.5k API credits | Almost free to enter if you code with Codex |
| Aiven | Meaningful use of an Aiven service (Postgres, Kafka…) | €1,000 / €750 / €500 | Easy add-on: host your database there |
| Modal | Ambitious AI system on Modal | $2,000 + $3k credits | Alternative to Verda for serving models |
| Arduino – Best use of UNO Q | UNO Q + Modulino in any project | UNO Q + kit per member | Hardware route only |
| Atech | Physical device from Atech modules + AI | Pro kit | Hardware route only |
| Cloudinary | Images/video via their tools (separate form) | $500 Amazon/member | Possible: serve drawing tiles and crops |
| Context.dev / Oxylabs | Live web data at runtime | €750 / €1k Apple voucher | Weak fit |
| CRACI | CI/CD on CRACI | LEGO / Red Bull | Trivial add-on if you use GitHub Actions |
| MLH (MongoDB, Vultr, Tiger Data, Solana, Entire, ElevenLabs) | Best use of X | Small hardware prizes | ElevenLabs fits audio on the glasses |

## Fit scores (main challenges, out of 10)
Skill = team coverage · Feas = doable in 48h · Odds = how differentiated we can be · Goal = prize value

| Challenge | Skill | Feas | Odds | Goal | Total | One-line reason |
|---|---|---|---|---|---|---|
| **Stoa – Make Blueprints Talk** | 9 | 6 | 8 | 7 | **30** | An architect plus an HVAC business owner read construction drawings for a living; few teams can. Accuracy is hard, but that's what keeps the field thin. Work trial on top. |
| **Meta – AI Glasses** | 8 | 6 | 6 | 6 | **26** | Judging weights inclusive interaction design, so your two designers count. It will be popular, and you need glasses (ask at the Meta booth tonight). |
| Valio Aimo – Trusted Trade Agents | 6 | 8 | 6 | 9 | 29 | Biggest track cash prize (€4k). Mostly API, permissions and approval-flow design, which suits designers and Claude-assisted coding. No domain edge. |
| Arduino – Green Renaissance (HVAC edge AI) | 8 | 7 | 6 | 5 | 26 | HVAC energy savings on the edge fits the team and stacks with UNO Q + Atech, but the prizes are hardware, not cash. |
| AstraZeneca – Equal Care | 6 | 7 | 6 | 4 | 23 | Data science fit, no domain edge, small prize. |
| City of Espoo – Recruitment | 5 | 7 | 5 | 6 | 23 | Design-heavy but vague brief. |
| Tieto – Earned Trust in AI Code | 5 | 7 | 5 | 6 | 23 | Concept-weighted, but needs C#/code-review depth. |
| **MariaDB – Wikipedia** | 5 | 8 | 4 | 4 | **21** | Generic RAG that many teams will build, small prize, nothing in your background gives an edge. |
| Intel Physical AI | 5 | 5 | 5 | 9 | 24 | €5k, but it's robotics/ML engineering and every team does the same task. |
| Others (Hostinger, Cala, Bahn, AfterQuery, Exa, S-Pankki, Rokoko, Aalto ×2, Context.dev) | ≤5 | – | – | – | <23 | Mostly pure-software or RL/robotics; no edge for this team. |

## Verdicts on your shortlist
- **Stoa: yes, make it the core.** The brief is about reading real technical drawings and pointing to where each answer comes from. That's exactly what your architect and HVAC member are good at. The designers can build the "verify in seconds" view (highlighting the source spot on the drawing), which is half the judging. They want approaches that "next year's frontier models won't make obsolete": a hybrid of a vision model, layout/OCR and geometry, plus domain rules (e.g. HVAC symbols and legends).
- **Meta glasses: yes, but as the front end of the Stoa project**, not a separate idea. A site engineer or HVAC installer looks at an installation and asks "what's the duct size here / does this match drawing M-102?", and the glasses answer with the cited drawing location. That gives Meta a clear audience and path to a pilot. Confirm tonight at the Meta booth that you can get glasses or the Device Access Toolkit. If you can't, drop Meta and keep the web/phone UI.
- **Wikipedia (MariaDB): skip.** It's a plain RAG build, the €1k prize is small, and the team has no edge there.

## Recommended stacks
### 🥇 Stack A — "Site Sight": Stoa + Meta + Gemini + Nemotron + Verda (+ Aiven, Codex)
A drawing Q&A engine: you ask a natural-language question and get the answer plus a highlighted crop of the exact spot on the drawing. It's used from a web app (for Stoa's test questions) and hands-free through Meta glasses on site.
- **Stoa:** accuracy and verifiable sources on their dataset. This is the core and must be solid first.
- **Meta:** first-person on-site use case. Voice/audio first, so it works without a display.
- **Gemini API:** multimodal reasoning over drawings and the glasses camera feed (€4k first prize).
- **Nemotron VL:** use it as a second reader or a check on the answer, and show that clearly in the demo (2 × RTX 5080).
- **Verda:** batch-preprocess or OCR the whole drawing set, or fine-tune a small symbol detector; post a process write-up in their Discord channel.
- **Aiven Postgres (+ pgvector)** for the index, and **Codex** if you use it to code. Both are low effort.
- **Main-prize angle:** construction is a $15T industry, and "AI that shows its source" demos well on stage.
- **Risks:** splitting effort. Spend roughly 70% on Stoa accuracy and 30% on the glasses and pitch, and don't stack more than you can demo well.

### 🥈 Stack B — "HVAC Edge Guardian": Arduino Green Renaissance + Best use of UNO Q + Atech (+ Gemma, Aiven/Tiger Data)
An UNO Q with Modulino sensors watches a ventilation unit or room, detects waste or faults on-device with a Gemma or small model, and suggests fixes. It's grounded in real HVAC knowledge from your team's business. Mostly hardware prizes, but a strong story for the main prize. Your EE member leads; the architect designs a 3D-printed enclosure.

### 🥉 Stack C — cash-max fallback: Valio Aimo + Gemini + Aiven + Codex
An agent ordering interface with permissions and human approvals ("1,000 L lactose-free milk by Monday"). Biggest single track cash prize, design-friendly, but no domain edge.

## Tonight's to-do
1. Pick Stack A (or B/C) and **submit the draft with the chosen challenges before 23:59**.
2. Visit the **Meta booth** and confirm glasses or toolkit access. Visit the **Stoa** channel or booth and get the dataset.
3. Join the Discord channels for Stoa, Meta, Verda and Gemini.

## Couldn't verify
- Whether Meta lends glasses to every team, and how many.
- Prizes for Aalto's Beyond the Clinic (TBA). Exa's description has placeholder text, but its prize list is filled in.
