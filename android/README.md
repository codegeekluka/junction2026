# Handyman: Android glasses app

The Meta glasses client for our backend. It streams the glasses camera (through Meta's Wearables Device Access Toolkit) to `server/` and shows what comes back. It speaks the protocol in [`../docs/protocol.md`](../docs/protocol.md).

**Based on Meta's CameraAccess sample** (`meta/meta-wearables-dat-android`, `samples/CameraAccess`). That code is under the [Meta Wearables Developer Terms](https://wearables.developer.meta.com/terms), not MIT. Our additions are in `app/src/main/java/.../cameraaccess/handyman/`, plus small hooks in `camera/CameraViewModel.kt` and `ui/CameraScreen.kt`.

## Run it (development)
1. **Server:** put the Gemini key in `../.env`, then `cd ../server && npm install && npm start`.
2. **Phone over USB** (USB debugging on). Tunnel the phone's localhost to the laptop. Redo this after every replug:
   `adb reverse tcp:8080 tcp:8080`
3. **Android Studio:** File → Open → this `android/` folder. Set the Gradle JDK to **21** (Settings → Build Tools → Gradle; not 25). Then Run ▶.
4. **In the app:** Debug menu → Enable MockDeviceKit → **Pair Ray-Ban Display** → Camera source: Back camera, Power on, Donned on → Start session → Preview → **Start bottle practice**. Point the phone at a bottle; the panel shows the step and the watcher's answer, and the **"Glasses display (simulated)"** box shows the step card exactly as the glasses would.
5. **Glasses display in Chrome (optional):** `adb forward tcp:9000 tcp:9000`, then open `http://127.0.0.1:9000/` in Chrome with the "Meta Ray-Ban Display Simulator" extension enabled.

The server address is `ws://localhost:8080/live` (`handyman/ServerConnection.kt`, `DEFAULT_URL`).

## Status
- ✅ Milestone 1: connect to the server, start `bottle_demo`, send JPEG frames (copied from the decoded preview with PixelCopy), show `hud` + `decision`.
- ✅ Milestone 2: text step card on the glasses display (`handyman/GlassesDisplay.kt`), redrawn on every `hud`; in-app preview + Chrome preview server for the mock Ray-Ban Display (`handyman/MockPreview.kt`, `GlassesPreview.kt`). Glasses without a display fall back to phone-only. (Chrome preview doesn't answer yet; the in-app preview works.)
- 🟡 Milestone 2.5 (built, not yet tested): frame rate set by the server (`capture` 0.5/2 fps, `snap` = one frame now), 640 px / q60 frames, diagnosis + "unsure" card states.
- ⬜ Milestone 3: voice in and out (`start` / `audio`).
