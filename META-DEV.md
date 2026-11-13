# Meta glasses — developer quick start

Links from the Junction Discord (Meta team). Docs read 2026-11-13. Both frameworks are developer previews, so details may change: always check the live docs.

- Developer Center: https://wearables.developer.meta.com/
- Device Access Toolkit (DAT): https://wearables.developer.meta.com/docs/develop/dat/getting-started-toolkit
- Web Apps: https://wearables.developer.meta.com/docs/develop/webapps
- Display simulator (Chrome extension): https://chromewebstore.google.com/detail/jpjlmmodokemlepklkdbimceggpbjcll
- Repos: [webapp toolkit](https://github.com/meta/meta-wearables-webapp) · [DAT iOS](https://github.com/meta/meta-wearables-dat-ios) · [DAT Android](https://github.com/meta/meta-wearables-dat-android)
- Live docs MCP server for AI coding tools (no auth): `https://mcp.developer.meta.com/wearables` (tool: `search_webapps_docs`)

## The two options

| | **Device Access Toolkit (native phone app)** | **Web Apps (runs on the glasses' display)** |
|---|---|---|
| Glasses | Ray-Ban Meta Gen 1/2, Optics, Ray-Ban Display, Oakley HSTN/Vanguard | **Ray-Ban Display only** |
| Where code runs | Your iOS/Android app on the phone | HTML/CSS/JS on the glasses |
| **Camera** | ✅ video stream + photo capture | ❌ not supported |
| **Microphone / audio** | ✅ audio streaming | ❌ no mic (text-to-speech only; dictation into text fields) |
| Display | `mwdat-display` module (Display glasses) | ✅ fixed 600×600, no scrolling, black = transparent |
| Other | inputs, motion, speech modules; **mock device** for testing without glasses | geolocation (from phone), motion sensors, localStorage |
| Input | — | Touchpad / Neural Band → arrow keys, Enter, Back |
| Stack | Swift (iOS 17.2+, Xcode 26.4+) or Kotlin 2.2 (Android 10+) | Plain web, hosted on **public HTTPS** (Vercel, Netlify, GitHub Pages) |
| Test without hardware | **Mock Device Kit** (`mwdat-mockdevice`) | **Chrome simulator** extension |

## What this means for us
- **Our idea needs the first-person view (camera + voice) → use DAT.** Web apps alone can't see or hear.
- Architecture: glasses camera/mic → **DAT phone app** → **Gemini Live API** → spoken reply on the glasses (plus display output if we get Display glasses).
- Optional: a Display web app for a visual layer (e.g. arrows or labels in the 600×600 view). It can't access the camera, so it only shows what the phone app sends it.
- **Pick iOS or Android tonight** based on whose phone and laptop we'll demo with (iOS needs a Mac with Xcode 26.4+).

## Setup checklist (DAT)
1. Pair the glasses with the **Meta AI app** and update the app and glasses firmware.
2. Turn on **Developer Mode**: Meta AI app → Settings → App Info → tap the version number 5× → toggle on.
3. Add the SDK:
   - **iOS:** Swift Package `https://github.com/facebook/meta-wearables-dat-ios`
   - **Android:** Maven `com.meta.wearable:mwdat-core`, `mwdat-camera` and the other modules (v1.0.1)
4. Until you have glasses, develop against the **mock device**.
5. Opt out of Meta analytics in the app config if you want (see the repo READMEs). This also helps our privacy story.

## Setup checklist (Display web app, if used)
1. Install the Chrome simulator and build to the 600×600 view: dark background, high contrast, ≥20px main text, everything keyboard-focusable.
2. Host on HTTPS. Requires glasses software v125+ and Meta AI app v272+, with Developer Mode on.
3. Install by scanning the simulator's "View on Glasses" QR code. The wearer confirms on the glasses.

## For AI coding agents
- **Claude Code:**
  - `/plugin marketplace add https://github.com/meta/meta-wearables-webapp`
  - `/plugin install meta-wearables-webapp@meta-wearables`
- Or add the MCP server `https://mcp.developer.meta.com/wearables` for live docs.
- The DAT getting-started page mentions a DAT plugin for AI coding tools too.

## Ask the Meta booth
- Can we borrow glasses for the weekend? Which model: Display or Ray-Ban Meta?
- Does Developer Mode work on the loan glasses, and what firmware are they on?
- Any DAT sample app for camera streaming we can start from?
