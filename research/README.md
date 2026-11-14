# Research notes (Vedant, Sat 14.11)

Source material scraped from the Junction platform (logged in), Meta's wearables docs, Google's Gemini docs and skills, and the Meta and Google booths. **Decisions live in `CLAUDE.md` and `PLAN.md`.** This folder is reference material behind them.

| File | What's in it |
|---|---|
| `01_META_CHALLENGE.md` | Meta challenge brief, verbatim: judging, mentors, glasses loan rules, submission fields, checklist |
| `02_participant_guide.md` | The full Junction participant guide, verbatim (rules, reviewing, pitching, venue, safety, code of conduct) |
| `04_tech_challenges_FULL.md` | All 19 tech challenges in full: requirements, judging %, prizes, contacts (claim codes removed) |
| `06_announcements_public_site_hardware.md` | Dashboard announcements, public site (grand jury, schedule, FAQ), hardware desk rules |
| `07_META_DEV_QUICKSTART.md` | Meta glasses dev quick start: DAT vs Web Apps, setup, versions, testing, reset and pairing, gotchas |

Kept on Vedant's laptop only, not committed: the full Meta docs crawl (409 pages), Meta's and Google's sample repos, and the claim codes for the free-tools packs.

## New findings not yet in CLAUDE.md / PLAN.md

### DAT app on the glasses (from Meta's docs)
- **Reserved gestures:** during a session, a **single tap pauses** it and **tap-and-hold stops** it, and the app never receives those. Use double-tap (Select) or the capture button (short press, hold, double press).
- **Versions:** DAT SDK 1.0.1 needs the Meta AI app **v292** and glasses firmware **v128**. After the v128 update, **reboot the glasses** or camera capture won't work.
- **Meta's own Speech capability stops silently after about 1 minute.** Use Gemini Live for speech instead.
- **Don't combine photo capture with display content.** Display updates get batched until after the transfer.
- **Double press** arrives as `SHORT_PRESS` then `DOUBLE_PRESS`, so buffer the short press.
- **Inputs stop working after the glasses are taken off and put back on.** Watch `donState` and re-add the capability.
- **`CAPABILITY_DENIED`:** some features are gated per user on Meta's servers. Handle it gracefully (the judges check error handling).
- **Install fails below 10% glasses battery.**
- **Camera stream** goes over Bluetooth Classic: 360×640, 504×896 or 720×1280 at 2, 7, 15, 24 or 30 fps. It steps down automatically under load (resolution first, then fps, never below 15). Requesting less can look better. Stream frames are a cropped 9:16; photo capture gives a wider, sharper view but is slower to arrive.
- **HFP mic** (voice-isolated) switches output to mono, and HFP and A2DP are mutually exclusive. In-stream PCM audio (16 kHz) is beta-only.
- **DAT display layouts:** FlexBox, Text, Image (from a **URL**), Button, Icon, Video (MP4). Keep them simple, because Bluetooth makes big images slow. It isn't true AR, so show a snapshot with the point drawn on it.

### Glasses reset and pairing (from Meta's help pages and the Meta mentors on Discord)
- **"Registered to another account" → factory reset.** Display glasses: out of the case, charged and on → fold both arms → press the capture button rapidly 5× (LED turns orange) → press and hold, release when the LED pulses white and orange.
- **Display charging case:** open it → plug and unplug the USB-C cable **3× within 11 s** → the LED blinks white.
- **Gen 2 case:** hold the back button for more than 16 s.
- **Neural Band:** hold about 16 s until it flashes white and orange, then re-pair in the Meta AI app **and** in the phone's Bluetooth settings. It pairs with one account at a time.
- **Pairing:** always pair from the Meta AI app, never from Bluetooth settings. Charge the glasses for at least 1 h, put them in the case for about 45 s, then hold the case button 5 s until it pulses blue. If it never turns blue, reset the case.

### Gemini
- **Confidence threshold (Google booth):** at or above **75%**, act and show "very sure". Below it, ask for another angle or more information. The docs' example uses 0.7.
- **Start trivially** (Google's advice): "is the water bottle upright or fallen over?" end to end, then one house problem, then branch out.
- **Agent skills for the Gemini SDK:** https://github.com/google-gemini/gemini-skills. Install with `npx skills add google-gemini/gemini-skills --skill gemini-api-dev` and the same with `--skill gemini-live-api-dev`. They cover the current model IDs, the Decisions API (`v1beta`, SDK ≥ 3.2.0) and Live session management.
- **Live connections last about 10 minutes** even with compression, so session resumption is required (a GoAway message warns first).

### Event logistics
- **Safety hotline:** +358 50 5330021 (Hype Security). Emergency: 112. First aid is on the 3rd floor.
- **Grand jury (7 judges):** Kia Kanninen (Founders House), Daksh Raghuvanshi (AfterQuery), Otto Söderlund (Supercell), Timo Ahopelto (Lifeline Ventures), Umar Noor (Google DeepMind), Hubertus van der Drift (Context.dev), Arturs Polis (Verda).
- **Plain-language team brief** (for the designers): a Claude Docs page shared separately by Vedant.
