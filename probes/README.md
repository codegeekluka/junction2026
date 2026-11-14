# probes/: step 0, Decision 1 + Robotics-ER 2 reality check

Two standalone scripts that hit `gemini-decision-1` (the Decisions API) and `gemini-robotics-er-2-preview` with sink photos. They print answers, coordinates and latency. Measured on Sat 14.11.2026 from the venue network (Espoo), `@google/genai` 3.3.0, Node 24.

## Run

```bash
cd probes
npm install                      # @google/genai 3.3.0 + sharp
# key is read from ../.env (GEMINI_API_KEY); never printed

node decision.mjs images/samples                              # 7 questions per image, 1 request per image
node decision.mjs images/samples --runs=5 --width=640 --resolution=low   # watcher-like settings (recommended)
node decision.mjs images/ --rest --raw                        # raw fetch instead of the SDK, dump JSON

node robotics.mjs images/samples                              # point + box + step-success per image
node robotics.mjs images/samples "slip nut" --task=point      # one part, points only
node robotics.mjs my.jpg --task=success --thinking=minimal --width=1024
```

Common flags: `--runs=N`, `--width=N` (downscale with sharp first), `--timeout=ms` (default 60000), `--retry` (allow SDK auto-retry, which is **off** by default so latencies are honest), `--raw`, `--verbose`. Annotated images (points and boxes drawn) go to `probes/out/` (git-ignored).

Put real sink photos in `probes/images/` (any subfolder). The samples in `images/samples/` come from Wikimedia Commons, see Credits.

## 1. Decisions API (`gemini-decision-1`)

**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/decisions`, header `x-goog-api-key`. The SDK supports it as `ai.decisions.create(...)`, **but you must pass `api_version: "v1beta"`**: SDK 3.3.0 defaults to `/v1/decisions`, which returns an empty 404.

Minimal working code (SDK):

```js
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const res = await ai.decisions.create({
  api_version: "v1beta",                       // required with SDK 3.3.0
  model: "gemini-decision-1",                  // "models/gemini-decision-1" also works
  input: [{ type: "image", data: jpegBase64, mime_type: "image/jpeg", resolution: "low" }],
  questions: {                                 // keys: [A-Za-z0-9_-]{1,64}, 1..1000 questions
    bucket_under_trap: { type: "noul", instructions: "Is there a bucket under the P-trap?" },
    too_dark: { type: "noul", instructions: "Too dark or blurry to judge?",
                criteria: { true_description: "...", false_description: "..." } },   // optional
    central_part: { type: "choice", instructions: "Which part is most central?",
                    criteria: { p_trap: "P-trap", slip_nut: "Slip nut", none: "" } },  // 2..255 options
    usefulness: { type: "score", instructions: "How useful for a plumber?",
                  criteria: ["useless", "poor", "ok", "good"] },                       // low -> high
  },
}, { retries: { strategy: "none" }, fetch_options: { signal: AbortSignal.timeout(3000) } });
```

Yes/no is called **`noul`**, not `bool`. That is the real field name in the API and the SDK types.

Observed response (trimmed):

```json
{
  "answers": {
    "slip_nut":  { "type": "noul",   "noul": 0.773, "confidence": 0.773 },
    "part":      { "type": "choice", "choice": "p_trap", "confidence": 0.634,
                   "probabilities": { "p_trap": 0.634, "slip_nut": 0.329, "none": 0.037 } },
    "quality":   { "type": "score",  "score": 2.77, "confidence": 0.807,
                   "probabilities": { "0": 0.005, "1": 0.025, "2": 0.162, "3": 0.807 },
                   "legend": { "0": "unusable", "1": "poor", "2": "ok", "3": "sharp" } }
  },
  "usage": { "total_input_tokens": 1268, "total_output_tokens": 0, "total_tokens": 1268,
             "input_tokens_by_modality": [ { "modality": "text", "tokens": 204 }, { "modality": "image", "tokens": 1064 } ] }
}
```

- `noul` = P(yes), clamped to 0.01–0.99. `confidence` = max(p, 1−p) for noul, or the top probability for choice/score. `score` = probability-weighted level index. Answer key order is not stable.
- `prompt_feedback` appears when an input filter fires. Errors look like `{"error":{"message":"* CreateDecisionRequest.questions[bad key!]: question IDs must be ...","code":"invalid_request"}}` (HTTP 400). An unknown model returns 404 `not_found`.
- **Image tokens:** about 1,064–1,073 at the default resolution, and about 252–266 with `resolution: "low"`. 7 questions add about 574 text tokens. At $0.10 per 1M input tokens, one low-res watcher call costs about $0.00008, so polling every 1.5 s costs about **$0.20 per hour**.

### Decision latency (end-to-end from Node, ms; "server" = Google's `server-timing` header)

| Setup | n | min | median | max | Notes |
|---|---|---|---|---|---|
| Full image (377 KB), default res, 7 q | 9 | 610 | 1397 | 2489 | |
| 640–768 px, default res, 7 q | 17 | 662 | ~1100 | 5348 | server time 480–1000; the rest was network jitter |
| **640 px, `resolution: "low"`, 7 q** | 15 | **405** | **504** | 3064 | server time 350–530, one cold 2.9 s |
| Text-only input, 1 q | 5 | 214 | 471 | 3847 | the only case near the advertised 150–250 ms |
| Low-res image, 1 q vs 50 q | 5+5 | 504 / 936 | ~900 / ~1100 | | latency is close to flat in question count, as advertised |

Other things we hit:
- One call took **46 s** (with the SDK's default auto-retry still on). Two calls died with `fetch failed`. One call **hung for 590 s**: the SDK's `timeout_ms` did not stop it, but an `AbortSignal` did. The watcher must use a hard timeout of 2–3 s and drop late frames.
- We made about 100 Decision calls with no 429. We never found the free-tier limit for Decision.

### Decision accuracy on the 3 samples (identical at low and default resolution)
- Brass P-trap: central part = `p_trap` (0.88–0.90). Slip nut visible: YES (0.84–0.85). Hands: no. Bucket: no. Correct.
- PVC S-trap (no slip nut; there is a cleanout cap): `p_trap` 0.95–0.97. Slip nut: undecided (0.44–0.48, confidence about 0.55). That is a reasonable "unsure" on an ambiguous image.
- Valve in a hand: `shut_off_valve` 0.91. Hands: YES (0.88). Usefulness score 0.1–0.3 ("useless" for a trap check). Correct.
- Synthetic dark copy (12% brightness) and blurred copy: `too_dark_or_blurry` = YES at 0.74–0.75, versus 0.05–0.11 on the clean images. That separates clearly, but only at about 0.75 confidence, so use a threshold around 0.6.

## 2. Robotics-ER 2 (`gemini-robotics-er-2-preview`)

ER 2 uses the **Interactions API** (`POST /v1beta/interactions`), or classic `models/gemini-robotics-er-2-preview:generateContent` (that also answered us). There is no special spatial endpoint: you ask for JSON in the prompt and parse the text. As with Decision, **the SDK needs `api_version: "v1beta"`**. Without it, it calls `/v1/interactions` and gets `404 Model 'gemini-robotics-er-2-preview' not found`. `gemini-robotics-er-2-streaming-preview` is Live-API only (Interactions returns 400 for it).

```js
const res = await ai.interactions.create({
  api_version: "v1beta",
  model: "gemini-robotics-er-2-preview",
  input: [
    { type: "image", data: jpegBase64, mime_type: "image/jpeg" },
    { type: "text", text: 'Point to each of these parts if visible: "P-trap", "slip nut". ' +
      'The answer should follow the json format: [{"point": [y, x], "label": <part name>}, ...]. ' +
      'The points are in [y, x] format normalized to 0-1000.' },
  ],
  generation_config: { thinking_level: "low" },   // minimal | low | medium | high | xhigh
  store: false,                                    // don't keep frames server-side
}, { retries: { strategy: "none" } });
console.log(res.output_text);   // SDK helper; raw JSON has steps[] -> {type:"model_output", content:[{type:"text", text}]}
```

Raw response: `{ status: "completed", usage: { total_input_tokens, total_output_tokens, total_thought_tokens, ... }, steps: [ {type:"thought", signature}, {type:"model_output", content:[{type:"text", text:"```json [...] ```"}]} ], model, object: "interaction" }`. The text may be fenced in ```` ```json ````; `lib.mjs → extractJson` handles this.

**Coordinate convention (verified by drawing):** points are `[y, x]` normalized 0–1000 (`px = x/1000*W`, `py = y/1000*H`). Boxes, using the format from the docs prompt, come back as `{"label","y","x","y2","x2"}` (y_min, x_min, y_max, x_max, normalized 0–1000). The script also accepts the classic `box_2d: [ymin, xmin, ymax, xmax]`.

Observed outputs (thinking=low):
- Brass P-trap: points `P-trap [595,458]`, `slip nut [492,631]`, `drain pipe [342,755]`. Boxes P-trap `y218 x175 y2=683 x2=930`, slip nut `y426 x489 y2=545 x2=792`. **All spot-on** (see `out/brass-p-trap.point.jpg` / `.box.jpg`). It did not mistake the threaded open end for a nut.
- PVC S-trap: P-trap and drain pipe pointed correctly. It correctly reported no slip nut. One box run returned `[]`, the next returned boxes, so results are not deterministic.
- Valve in hand: `shut-off valve [556,655]`, on the valve body. Correct.
- Step success ("is the slip nut fully hand-tightened?"): on the brass trap it returned `success: null, confidence 0.8, point [500,640]` with the reason "heavily corroded... impossible to determine if recently hand-tightened". On the PVC trap: `null`, "no slip nut is present on this solvent-welded trap". It is honest and abstains rather than guessing. You can't judge "tight" from one still image anyway; the real test needs our own before/after photos or a short clip (ER 2 also supports video progress and moment-finding).

### ER 2 latency (end-to-end, successful calls, thinking=low, full-size image, about 1,180 input tokens, 230–690 thought tokens)

| Task | n | min | median | max |
|---|---|---|---|---|
| point | 6 | 2764 | 6318 | 22679 |
| box | 5 | 2969 | 4376 | 54366 |
| success | 4 | 4219 | 7531 | 44174 |

The runs over 15 s were made with SDK auto-retry on. The SDK silently retries 429/5xx with backoff, and our 429 errors took 35–50 s to surface for exactly this reason, so those outliers are probably retries, not model time. Expect about **3–6 s per call**. `thinking=minimal` and `--width` were **not** measured, because we ran out of quota.

### Free-tier limit
**`429 Rate limit exceeded for model gemini-robotics-er-2-preview (limit: 20 requests per day on Free Tier)`**. We hit it after about 20 calls, and it resets about 20 h later (roughly Sun 08:00). **Before the demo, the key needs billing or the GCP credits**, or ER must be called very sparingly (cache `locate` results per step).

## Verdict

**Decision 1 as the 1–2 s watcher: yes, with settings.** Downscale frames to about 640 px and send `resolution: "low"`. That gives about 0.4–0.6 s end-to-end (about 0.4 s server time), costs about $0.20/h, and accuracy did not drop on our samples. It is **not** the advertised 150–250 ms with images: only text-only calls got near that. Network jitter (1–5 s spikes, occasional `fetch failed`, one 590 s hang) is the real risk. Use one request in flight at a time, a hard 2–3 s `AbortSignal`, drop late or failed frames, and SDK retries off. Treat confidence below about 0.7 as "unsure, ask the user to move closer" rather than acting on it. Confirm on real under-sink photos (dim light, wet, clutter) before trusting the numbers.

**ER 2 for locating parts: accurate, but slow and rate-limited.** Points and boxes were precise on every sample, it knew when a part wasn't there, and it abstained honestly on "is it tight?". At 3–6 s per call (with occasional long tails) it fits the on-demand `locate(part)` tool ("where's the slip nut?" → circled snapshot) and the deep check. It does not fit the watcher loop. The 20 requests/day free limit is a blocker for rehearsals and the demo until billing is on.

## Files
- `decision.mjs`: Decisions API probe (SDK or `--rest`)
- `robotics.mjs`: ER 2 point / box / step-success probe and annotated output
- `lib.mjs`: key loading, image listing, JSON extraction, latency stats, fetch tracer (counts hidden retries, reads `server-timing`), request options with no retry and a hard timeout
- `images/samples/`: test images · `out/`: annotated results (git-ignored)

## Credits (sample images, Wikimedia Commons)
- `brass-p-trap.jpg`: "Brass P trap" by Raquel Baranow, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Brass_P_trap.jpg (resized)
- `annotated-plumbing-trap.jpg`: "Annotated plumbing trap" by McGeddon, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Annotated_plumbing_trap.jpg (resized)
- `shutoff-valve-under-sink.jpg`: "Kitchen renovation new plumbing valve beneath kitchen sink with teflon tape" by Tomwsulcer, CC0, https://commons.wikimedia.org/wiki/File:Kitchen_renovation_new_plumbing_valve_beneath_kitchen_sink_with_teflon_tape.JPG (resized)
