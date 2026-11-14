# Handyman: Android glasses app

The Meta glasses client for our backend. It streams the glasses camera (through Meta's Wearables Device Access Toolkit) to `server/` and shows what comes back. It speaks the protocol in [`../docs/protocol.md`](../docs/protocol.md).

**Based on Meta's CameraAccess sample** (`meta/meta-wearables-dat-android`, `samples/CameraAccess`). That code is under the [Meta Wearables Developer Terms](https://wearables.developer.meta.com/terms), not MIT. Our additions are in `app/src/main/java/.../cameraaccess/handyman/`, plus small hooks in `camera/CameraViewModel.kt` and `ui/CameraScreen.kt`.

## Run it (development)
1. **Server:** put the Gemini key in `../.env`, then `cd ../server && npm install && npm start`.
2. **Phone over USB** (USB debugging on). Tunnel the phone's localhost to the laptop. Redo this after every replug:
   `adb reverse tcp:8080 tcp:8080`
3. **Android Studio:** File → Open → this `android/` folder. Set the Gradle JDK to **21** (Settings → Build Tools → Gradle; not 25). Then Run ▶.
4. **In the app:** Debug menu → Enable MockDeviceKit → Pair Ray-Ban Meta → Camera source: Back camera, Power on, Donned on → Start session → Preview → **Start bottle practice**. Point the phone at a bottle; the panel shows the step and the watcher's answer.

The server address is `ws://localhost:8080/live` (`handyman/ServerConnection.kt`, `DEFAULT_URL`).

## Status
- ✅ Milestone 1: connect to the server, start `bottle_demo`, send 1 JPEG frame/s (copied from the decoded preview with PixelCopy), show `hud` + `decision`.
- ⬜ Milestone 2: step card on the glasses display (see the DisplayAccess sample).
- ⬜ Milestone 3: voice in and out (`start` / `audio`).
