# Client ↔ server protocol (glasses app, web page)

How any client (the Android glasses app, the web page in `web/`) talks to our backend in `server/`.
The web page (`web/app.js`) is a **working reference implementation** of everything below. When in doubt, copy what it does.

## Connection
- **One WebSocket per session**, path `/live`. All messages are **JSON text frames**: `{ "type": "...", ... }`.
- **Native Android app:** use **`ws://<laptop-ip>:8080/live`**.
  - Plain `ws://` is fine for a native app. The HTTPS port (8443) only exists because browsers need it for the camera, and its self-signed certificate will be rejected by OkHttp.
  - Allow cleartext traffic for that host. Easiest for a hackathon: `android:usesCleartextTraffic="true"` in the manifest.
- **The server prints the laptop's IPs on startup.** Phone and laptop must be on the same Wi-Fi. If the venue Wi-Fi blocks device-to-device traffic, ask Luka for a public tunnel URL (`wss://…`) instead.
- **Health check:** `GET http://<laptop-ip>:8080/health` → `{"ok":true}`.

## What the app sends

| type | fields | when |
|---|---|---|
| `start` | `handle?` (string) | Start the **voice coach** (Gemini Live). On a reconnect, send the last `handle` you received to resume the same conversation. |
| `watch` | `set` (string, e.g. `"bottle"`, `"sink_start"`) | Start the **watcher** (Decisions API checks on frames, about 1/s). It can run alongside `start` on the same socket. |
| `unwatch` | – | Stop the watcher. |
| `frame` | `data` = base64 **JPEG** | Camera frame. **~1 per second**, about **768 px wide**, JPEG quality ~0.7 (≈50–80 KB). Each frame goes to both the coach and the watcher. Sending faster gains nothing (Gemini Live takes ≤1 fps). |
| `audio` | `data` = base64 **PCM 16-bit little-endian, 16 kHz, mono** | Mic audio in chunks of ~100 ms (1,600 samples = 3,200 bytes). Only needed in coach mode. |
| `text` | `text` | Optional typed message to the coach (useful for testing). |
| `feedback` | `correct` (bool), `expected?` (option id) | Dev only: user tapped Right/Wrong on the watcher answer. |
| `stop` | – | End everything. The server closes the AI session. |

## What the server sends back

| type | fields | what to do |
|---|---|---|
| `status` | `state`: `connecting` · `reconnecting` · `live` · `offline` · `stopped` | Show or speak it. **Only send audio/frames after `live`** (anything sent earlier is dropped). |
| `audio` | `data` = base64 **PCM 16-bit LE, 24 kHz, mono** | The coach's voice. Queue and play the chunks in order, through the glasses speakers. |
| `interrupted` | – | The user started talking over the coach: **stop playback immediately and drop queued audio.** |
| `transcript` | `who`: `user`·`coach`, `text` | Fragments of what was said (for the screen or logs). Consecutive fragments from the same speaker belong together. |
| `turnComplete` | – | The coach finished a turn. |
| `handle` | `handle` | Save the latest one. Send it in `start` after a reconnect, so the conversation resumes. |
| `watch` | `state`: `on`·`off`, `set`, `questions`, `headline`, `quality` | The watcher started or stopped. `headline` = `{question, title, labels{option: plain words}}` tells you which answer to show big. |
| `decision` | `answers`, `headline` `{choice, confidence, conflict?}`, `ms`, `serverMs`, or `error` (`timeout`·`failed`) | One watcher result, about once a second. Show `headline.labels[choice]` with its certainty: **≥0.75 "very sure" · ≥0.6 "fairly sure" · below that "not sure, show me another angle"**. An `error` just means that one check was skipped. |
| `error` | `message` | Show or speak it in plain language (it's already written for users). |

## Getting the media from the glasses (Device Access Toolkit notes)
- **Camera:** DAT stream frames (e.g. 504×896 or 720×1280; request a low rate, 2–7 fps is plenty) → take ~1 per second → scale to ~768 px wide → JPEG → base64 → `frame`. Photo capture is sharper but slower, so save it for on-demand "look closely" moments.
- **Mic:** the glasses act as a Bluetooth headset (HFP). Record with `AudioRecord` at 16 kHz mono, PCM 16-bit, routed to the glasses mic. Send 100 ms chunks as `audio`.
- **Speaker:** play `audio` chunks with `AudioTrack` at 24 kHz mono, routed to the glasses.
- **Develop on the Mock Device Kit:** the phone's own camera stands in for the glasses camera (start from Meta's CameraAccess sample). Real glasses are needed for the demo and final testing.
- **Handle and show** (Meta's judges check these): glasses disconnected, glasses taken off and put back on (re-add the capability), `CAPABILITY_DENIED`, camera or mic permission denied, network lost (→ reconnect with `handle`). See `research/README.md` for the DAT gotchas.

## Minimal session
```
→ {"type":"start"}                 ← {"type":"status","state":"connecting"}
→ {"type":"watch","set":"sink_start"}   ← {"type":"watch","state":"on",...}
                                   ← {"type":"status","state":"live"}
→ {"type":"frame","data":"<jpeg b64>"}      (every ~1 s)
→ {"type":"audio","data":"<pcm16k b64>"}    (every ~100 ms)
                                   ← {"type":"decision","headline":{"choice":"leaking_trap","confidence":0.86},...}
                                   ← {"type":"audio","data":"<pcm24k b64>"}  (coach speaking)
                                   ← {"type":"handle","handle":"..."}
→ {"type":"stop"}                  ← {"type":"status","state":"stopped"}
```

**Test without the app:** `cd server && node scripts/smoke.js <image.jpg>` (coach) and `node scripts/watch-smoke.js <set> <image.jpg>` (watcher). Both use this exact protocol.
