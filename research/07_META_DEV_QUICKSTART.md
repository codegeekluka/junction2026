# Meta glasses: developer quick start (Junction 2026)

Sources: the Meta mentors' Discord messages (Tony from Meta, Amy), the official docs at https://wearables.developer.meta.com (crawled 14 Nov 2026 into `meta_docs/`: 409 pages, all guides, no per-class API reference), the three GitHub repos (cloned into `repos/`), and the Meta help centre pages on reset and pairing.

---

## 1. Pick your framework first (this decides everything)

| | **Device Access Toolkit (DAT)** | **Web Apps** |
|---|---|---|
| Runs where | Your **iOS / Android phone app**, talking to the glasses | Chromium browser **on the glasses** |
| Glasses | Ray-Ban Meta Gen 1/Gen 2, Ray-Ban Meta Optics, Meta glasses, **Meta Ray-Ban Display**, Oakley Meta HSTN/Vanguard | **Meta Ray-Ban Display only** |
| **Camera** | ✅ video stream + photo capture | ❌ |
| **Microphone audio** | ✅ (plus speakers, speech-to-text) | ❌ Speech only arrives as text dictated into a text field, or via **WebMCP** tool calls from Meta AI (off by default) |
| Display UI | ✅ on Display glasses | ✅ (600×600 additive display) |
| Other | Inputs, motion, voice invocations, device state (worn/not worn) | Focus-based directional input (no touch/pointer), Neural Band optional |
| Stack | Swift (iOS 17.2+, Xcode 26.4+) / Kotlin (Android 10+, Kotlin 2.2+) | Any HTTPS-hosted web app; React 19 UI Toolkit `@wearables-ui-toolkit/mrbd` |
| Repo | `repos/dat-ios`, `repos/dat-android` | `repos/webapp` |

> The official index says: **"Only the Device Access Toolkit can use the glasses' camera or capture microphone audio."** If your idea is "Gemini sees what I see", you need **DAT** (a phone app), not a Web App.
>
> **Hardware angle:** DAT also works on **Ray-Ban Meta Gen 2**, the glasses with the 240-minute loan and a shorter queue (20 waiting vs 38 for Display). Gen 2 has no display, so its output is **audio-first**, and Meta judges audio-first equally with display experiences.

## 2. Setup checklist

**Both frameworks**
1. Install the **Meta AI app**: iOS https://apps.apple.com/us/app/meta-ai-assistant-glasses/id1558240027 · Android https://play.google.com/store/apps/details?id=com.facebook.stella
2. Pair the borrowed glasses (see §5 if pairing fails).
3. **Enable Developer Mode:** Meta AI app → Settings → App Info → **tap the app version number 5 times** → toggle Developer Mode → Enable. It persists across sessions.
4. Check versions. **Glasses:** Devices → device → gear icon → General → About → Version. **App:** Settings → App Info.

**DAT (SDK 1.0.1) needs** Meta AI app **v292** and glasses firmware **v128** (all models). Known issue: after the v128 update, **reboot the glasses** or camera capture won't work.
**Web Apps need** glasses software **≥ v125** and Meta AI app **≥ v272**.

**Web App extras**
- It must be served over **HTTPS** at a public URL (HTTP is rejected). Options include Vercel, Netlify, GitHub Pages, Cloudflare Pages, Replit and Lovable.
- Install it on the glasses with a QR code that encodes `fb-viewapp://web_app_deep_link?appName=<name>&appUrl=<https-url>` (generate it with the simulator's "View on Glasses QR" or the plugin), or with `navigator.install()` (always `catch`; a resolved promise does **not** mean the app was installed).
- The wearer must confirm the install on the glasses. The app shows as "unverified", which is fine for a hackathon.

## 3. Test without hardware (important, since glasses are scarce)

- **Web Apps → Meta Ray-Ban Display Simulator** (Chrome extension): https://chromewebstore.google.com/detail/jpjlmmodokemlepklkdbimceggpbjcll. Click "Add to Chrome", open your web app in Chrome, then click the extension icon. It previews the **600 × 600 additive display** (frame overlay, additive blending), checks for directional-focus targets, horizontal overflow and visible focus styles, and generates the install QR. It doesn't replace testing on the device. Docs: `meta_docs/033_webapps_guides_test.md`.
- **DAT → Mock Device Kit:** a simulated glasses device for iOS and Android tests. Docs: `meta_docs/065_dat_guides_mock-device-kit.md`, `066_…testing-mdk-ios.md`, `067_…testing-mdk-android.md`, and `052_dat_guides_display-simulation.md` for the display.

## 4. AI coding agent setup (Meta's own recommendation)

- **Web Apps:** the AI Coding plugin is in `repos/webapp` (`plugins/`, `install-skills.sh`, `AGENTS.md`). The **Wearables MCP server** exposes `search_webapps_docs`. Setup steps for Claude Code, Codex, Cursor and Muse Code: `meta_docs/036_webapps_guides_wearables-documentation-mcp.md`.
- **DAT:** add the marketplace `meta/meta-wearables-dat-ios` or `meta/meta-wearables-dat-android`, then install the DAT plugin, which adds `search_dat_docs` through the MCP server. Start a new session after installing. Otherwise read `repos/dat-*/AGENTS.md`. Docs: `meta_docs/040_dat_guides_ai-assisted-claude-code.md`, `044_…ai-assisted-mcp.md`.
- Samples: `repos/dat-ios/samples`, `repos/dat-android/samples`, `repos/webapp/examples` and `repos/webapp/templates`.

## 5. Hardware checkout problems (from Meta's mentors)

**"Device is registered with another account"** → **factory reset** it.

*Meta Ray-Ban Display glasses* (the Display loaners):
1. Glasses out of the case, charged and powered on.
2. Fold both arms closed.
3. Press the **capture button rapidly 5 times**. The LED turns orange.
4. **Press and hold** the capture button and release when the LED **pulses white and orange**.

*Meta Ray-Ban Display charging case* (no button; it uses the cable): open the case, then **insert and remove the USB-C cable 3 times within 11 seconds** (port on the ridge side). The LED next to the port blinks white when the reset worked.

*Ray-Ban Meta Gen 2 / Oakley glasses:* out of the case, charged and on → close both arms → press the capture button 5 times (LED orange) → press and hold, release when the LED flashes.
*Gen 2 charging case:* remove the glasses, then hold the button on the back of the case for **more than 16 seconds**.

*Meta Neural Band:* hold the button for about **16 seconds** and release when the LED flashes **white and orange**. Then unpair and re-pair it in the Meta AI app **and** in your phone's Bluetooth menu. The band can only pair with **one Meta account at a time**.

A factory reset deletes the photos and videos on the glasses, and you'll need to pair again afterwards.

**Unable to pair the glasses?** Do these in order:
- Before you start: the Meta AI app is up to date, Bluetooth is on with active Wi-Fi, the glasses have charged for at least 1 hour (or until the case LED is green), and they're **powered on and in the case for about 45 seconds**.
1. Always start pairing **from the Meta AI app**, never from your phone's Bluetooth settings.
2. Hold the case's pairing button for **5 seconds** until the LED pulses **blue**. If it never turns blue, factory reset the case.
3. If the glasses appear in your phone's Bluetooth list, **forget** them and retry from the app.
4. Still failing? Delete and reinstall the Meta AI app.
5. Still failing, or previously paired to another phone? **Factory reset the glasses.**
- If the glasses LED **blinks white continuously** during pairing, force-restart the glasses and pair again from the app.

**Pairing the Neural Band:** Meta AI app → Glasses (top right) → swipe down → *Meta Ray-Ban Display and Meta Neural Band*. Hold the band's button **2 seconds** to power on (white flash and vibration), then **3 seconds** for pairing mode (rapid white flashing) → tap *Light is pulsing white* → follow the prompts. If it won't turn on, charge it for at least 30 seconds.
**Unpairing:** Glasses → Device settings → General → Unpair wristband → Unpair, and also forget it in your phone's Bluetooth menu.

**Where to rent:** https://2026.hackjunction.com/hardware (hardware desk, 5th floor). Sign-up info is posted in Discord **#hardware**.

## 6. DAT gotchas worth knowing before you build (from the docs)

- **Camera stream:** frame rates of 2, 7, 15, 24 or 30 fps, up to 720×1280. It travels over **Bluetooth Classic**, so quality steps down automatically when bandwidth is tight (resolution first, then fps, never below 15). Requesting lower resolution or fps can actually *look* better. For high-quality stills, use **photo capture** (up to the native sensor resolution).
- **Speech capability silently stops after about 1 minute** (Dev/Beta). Restart it in code.
- **Don't combine photo capture with display capabilities** on Display glasses; updates get batched until after the transfer.
- A double press on the capture button sends `SHORT_PRESS` then `DOUBLE_PRESS`. Buffer the short press before acting on it.
- Taking the glasses off and putting them back on (with wear detection on) kills inputs. Watch `donState` and re-add the capability.
- Some capabilities are gated per user on Meta's servers and can fail at runtime with `CAPABILITY_DENIED`. Handle that gracefully; Meta's judges look for exactly this kind of error handling.
- Install fails if the glasses battery is **below 10%**.
- If you're logged in to developers.meta.com (Horizon), log out before signing up for the Wearables Developer Center.
- Handle each `DeviceSessionError` separately (`INSUFFICIENT_SDK_VERSION`, `DWA_OUT_OF_STU_RANGE`, `DAT_APP_ON_THE_GLASSES_UPDATE_REQUIRED`, `DWA_UNAVAILABLE`). Meta's brief explicitly asks for handling of **permissions, errors, connectivity and device state changes**. Docs: `054_…lifecycle-events.md`, `055_…permissions-requests.md`, `062_…device-state.md`, `074_…version-dependencies.md`.

## 7. Where things are

- Docs index: `meta_docs/000_index.md`. The full crawl list with source URLs is in `meta_docs/_crawl_index.tsv`.
- Key DAT guides: `056_dat_guides_streaming.md`, `057_…camera-stream-processing.md`, `058_…microphones-and-speakers.md`, `063_…speech.md`, `064_…camera-capture.md`, `049–053` (display).
- Key Web App guides: `031_webapps_guides_setup.md`, `284_webapps_guides_build_overview.md`, `033_…test.md`, `034_…troubleshoot.md`, plus the UI Toolkit component pages (`…design_components_mrbd_*`).
- Community: r/MetaGlassesforDevs, GitHub Discussions on each repo, and the Meta booth and Discord channel at Junction.
- Not saved: the per-class API reference (about 210 pages crawled before I stopped, the rest skipped; look it up online as needed) and the Chrome Web Store listing itself, which only opens in a full browser. The simulator's documented behaviour is in §3.
