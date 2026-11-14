// Probe: Gemini Decisions API (gemini-decision-1) on sink-repair frames.
//
//   node decision.mjs <image-or-folder> [--runs=3] [--rest] [--resolution=low|medium|high|ultra_high]
//                     [--width=768] [--raw]
//
// --rest        call POST /v1beta/decisions with fetch instead of the @google/genai SDK
// --resolution  image block `resolution` (docs: low | medium | high | ultra_high; default = server default)
// --width       downscale the image with sharp before sending (simulates a glasses frame)
// --raw         also print the raw JSON response
// --retry       allow SDK automatic retries (off by default so latency numbers are honest)
// --timeout=ms  per-call timeout (default 60000)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";
import { loadKey, listImages, mimeOf, parseArgs, stats, installFetchTracer, takeAttempts, fmtAttempts, sdkRequestOptions } from "./lib.mjs";
installFetchTracer();

const MODEL = "gemini-decision-1";
const { opts, positional } = parseArgs(process.argv.slice(2));
const images = listImages(positional[0]);
const runs = Number(opts.runs ?? 1);
const key = loadKey();
const ai = new GoogleGenAI({ apiKey: key });

// One request = shared image input + all questions. Keys: [A-Za-z0-9_-]{1,64}.
const QUESTIONS = {
  bucket_under_trap: {
    type: "noul",
    instructions: "Is there a bucket or container placed under the curved drain pipe (P-trap)?",
  },
  slip_nut_visible: {
    type: "noul",
    instructions: "Is a slip nut (the large threaded ring nut joining two drain pipe sections) visible?",
  },
  too_dark_or_blurry: {
    type: "noul",
    instructions: "Is the image too dark or too blurry to judge the plumbing parts?",
    criteria: {
      true_description: "Parts cannot be made out reliably because of darkness, blur or extreme closeness.",
      false_description: "The plumbing parts are clearly visible.",
    },
  },
  hands_visible: {
    type: "noul",
    instructions: "Are the person's hands visible in the image?",
  },
  water_visible: {
    type: "noul",
    instructions: "Is water dripping or pooled anywhere in the image?",
  },
  central_part: {
    type: "choice",
    instructions: "Which plumbing part is most central in the image?",
    criteria: {
      p_trap: "P-trap: the U- or J-shaped curved drain pipe",
      slip_nut: "Slip nut: threaded ring nut on a drain pipe joint",
      washer: "Washer: flat rubber or plastic ring seal",
      shut_off_valve: "Shut-off valve: small valve on a water supply line",
      none: "None of these parts",
    },
  },
  image_usefulness: {
    type: "score",
    instructions: "How useful is this image for a remote plumber checking the drain trap?",
    criteria: [
      "Useless: no plumbing visible or unreadable",
      "Poor: plumbing visible but the trap and joints are unclear",
      "OK: the trap is visible but joints are partly hidden",
      "Good: trap and its slip nuts clearly visible",
    ],
  },
};

async function buildImageBlock(file) {
  let buf = fs.readFileSync(file);
  let mime = mimeOf(file);
  if (opts.width) {
    buf = await sharp(buf).rotate().resize({ width: Number(opts.width), withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    mime = "image/jpeg";
  }
  const block = { type: "image", data: buf.toString("base64"), mime_type: mime };
  if (opts.resolution) block.resolution = opts.resolution;
  return { block, bytes: buf.length };
}

async function callRest(body) {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/decisions", {
    method: "POST",
    headers: { "x-goog-api-key": key, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(Number(opts.timeout ?? 60000)),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(json.error ?? json)}`);
  return json;
}

function fmtAnswer(a) {
  const c = a.confidence?.toFixed(2);
  if (a.type === "noul") {
    const verdict = a.noul >= 0.5 ? "YES" : "no ";
    return `${verdict}  P(yes)=${a.noul.toFixed(2)}  conf=${c}`;
  }
  if (a.type === "choice") {
    const probs = Object.entries(a.probabilities).sort((x, y) => y[1] - x[1])
      .map(([k, p]) => `${k}=${p.toFixed(2)}`).join(" ");
    return `${a.choice}  conf=${c}  [${probs}]`;
  }
  if (a.type === "score") {
    const top = Object.entries(a.probabilities).sort((x, y) => y[1] - x[1])[0][0];
    return `score=${a.score.toFixed(2)} (top: ${top} "${a.legend?.[top]}")  conf=${c}`;
  }
  return JSON.stringify(a);
}

const latencies = [];
console.log(`model=${MODEL} via=${opts.rest ? "REST fetch" : "@google/genai SDK"} questions=${Object.keys(QUESTIONS).length}` +
  ` resolution=${opts.resolution ?? "default"} width=${opts.width ?? "original"} runs=${runs}`);

for (const file of images) {
  const { block, bytes } = await buildImageBlock(file);
  const body = { model: MODEL, input: [block], questions: QUESTIONS };
  console.log(`\n=== ${path.basename(file)} (${Math.round(bytes / 1024)} KB sent)`);
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    let res;
    try {
      res = opts.rest ? await callRest(body) : await ai.decisions.create({ ...body, api_version: "v1beta" }, sdkRequestOptions(opts)); // SDK 3.3.0 defaults to /v1/ -> 404
    } catch (err) {
      console.log(`  run ${i + 1}: ERROR after ${Math.round(performance.now() - t0)} ms${fmtAttempts(takeAttempts())}: ${err.message}`);
      continue;
    }
    const ms = performance.now() - t0;
    latencies.push(ms);
    const tok = res.usage ? ` tokens=${res.usage.total_input_tokens}` +
      ` (${(res.usage.input_tokens_by_modality ?? []).map((m) => `${m.modality}:${m.tokens}`).join(", ")})` : "";
    console.log(`  run ${i + 1}: ${Math.round(ms)} ms end-to-end${fmtAttempts(takeAttempts())}${tok}`);
    if (i === 0 || opts.verbose) {
      for (const [k, a] of Object.entries(res.answers ?? {})) console.log(`    ${k.padEnd(20)} ${fmtAnswer(a)}`);
      if (res.prompt_feedback) console.log(`    prompt_feedback: ${JSON.stringify(res.prompt_feedback)}`);
    }
    if (opts.raw) console.log(JSON.stringify(res, null, 2));
  }
}
console.log(`\nlatency: ${stats(latencies)}`);
