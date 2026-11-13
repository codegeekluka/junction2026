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
   - **iOS:** Swift Package `https://github.com/meta/meta-wearables-dat-ios` (the old `facebook/` URL redirects here)
   - **Android:** Maven `com.meta.wearable:mwdat-core`, `mwdat-camera` and the other modules (v1.0.1)
4. Until you have glasses, develop against the **mock device**.
5. Opt out of Meta analytics in the app config if you want (see the repo READMEs). This also helps our privacy story.

## Developer Center account flow
From https://wearables.developer.meta.com/, needed before the app can use the camera:
1. **Account and organization:** one person creates **one organization for the team** and invites the others. [Guide](https://wearables.developer.meta.com/docs/develop/dat/onboarding-and-organization-management)
2. **Developer Mode** (see the checklist above).
3. **Register the project** and request permissions for device features such as the camera. [Guide](https://wearables.developer.meta.com/docs/develop/dat/manage-projects/)
4. **Share with test users** through versions and release channels. Probably not needed for the demo. [Guide](https://wearables.developer.meta.com/docs/develop/dat/set-up-release-channels)

Also useful: [DAT docs](https://wearables.developer.meta.com/docs/develop/dat) · [API reference](https://wearables.developer.meta.com/docs/reference/) · [Support](https://wearables.developer.meta.com/support/). The Wearables Developer Terms and Acceptable Use Policy (linked in the site footer) matter for our consent and privacy story.

## Common problems when checking out the hardware
*From Tony (Meta) on the Junction Discord, Fri 13.11 20:23.*

| Problem | Fix | Glasses | Meta Neural Band |
|---|---|---|---|
| Device is registered to another account | Factory reset it | [Reset guide](https://www.meta.com/en-gb/help/ai-glasses/814846737027479/) | [Reset guide](https://www.meta.com/en-gb/help/ai-glasses/1481163499576351/) |
| Device won't pair | Follow the pairing guide | [Pairing guide](https://www.meta.com/en-gb/help/ai-glasses/852077233025627/) | [Pairing guide](https://www.meta.com/en-gb/help/ai-glasses/770840295349358/) |

Every loan starts on someone else's setup, so expect to reset, pair and re-register our app each time. Shared glasses hold only one unpublished app (`challenge-briefs.md` §5). Budget about 15 minutes of each loan for this.

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

## Help and community
- GitHub Discussions: [iOS](https://github.com/meta/meta-wearables-dat-ios/discussions) · [Android](https://github.com/meta/meta-wearables-dat-android/discussions) · [Web Apps](https://github.com/meta/meta-wearables-webapp/discussions)
- Reddit: https://www.reddit.com/r/MetaGlassesforDevs
- Meta booth contacts: Amanda Le (main), Dennis Punjabi (iOS)

## Ask the Meta booth
*Note: according to the participant guide, glasses are lent from the **Hardware Lab desk (5th floor)**, not the booth. Request at https://2026.hackjunction.com/hardware. Loans are 2 h (Display) or 4 h (Gen 2), not the weekend. Details: `challenge-briefs.md`.*
- Can we borrow glasses for the weekend? Which model: Display or Ray-Ban Meta?
- Does Developer Mode work on the loan glasses, and what firmware are they on?
- Any DAT sample app for camera streaming we can start from?
