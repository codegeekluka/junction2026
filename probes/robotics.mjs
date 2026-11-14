// Probe: Gemini Robotics-ER 2 (gemini-robotics-er-2-preview) on sink-repair frames.
//
//   node robotics.mjs <image-or-folder> [part] [--task=point|box|success|all] [--runs=1]
//                     [--thinking=minimal|low|medium|high] [--width=1024] [--raw]
//
// part        a single part to locate (default: P-trap, slip nuts, shut-off valve, drain pipe)
// --task      point (default all): points; box: bounding boxes; success: step-success judgement
// --thinking  generation_config.thinking_level (docs examples use "high"; default here "low" for speed)
// --retry     allow SDK automatic retries (off by default; they hid 429s as 35-55 s "latency")
// --timeout   per-call timeout in ms (default 60000)
// --width     downscale with sharp before sending (coordinates are normalized, so they stay valid)
//
// Uses the Interactions API via @google/genai (client.interactions.create), as in the
// robotics docs. Coordinates come back normalized 0-1000, points as [y, x].
// Annotated copies (points + boxes) are written to probes/out/.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";
import { OUT_DIR, extractJson, listImages, loadKey, mimeOf, parseArgs, stats, installFetchTracer, takeAttempts, fmtAttempts, sdkRequestOptions } from "./lib.mjs";
installFetchTracer();

const MODEL = "gemini-robotics-er-2-preview";
const { opts, positional } = parseArgs(process.argv.slice(2));
const images = listImages(positional[0]);
const parts = positional[1] ? [positional[1]] : ["P-trap", "slip nut", "shut-off valve", "drain pipe"];
const task = opts.task ?? "all";
const runs = Number(opts.runs ?? 1);
const thinking = opts.thinking ?? "low";
const ai = new GoogleGenAI({ apiKey: loadKey() });

const partList = parts.map((p) => `"${p}"`).join(", ");
const PROMPTS = {
  point:
    `Point to each of these sink plumbing parts if they are visible: ${partList}. ` +
    `If a part appears more than once (e.g. two slip nuts), point to each instance. ` +
    `Do not point to parts that are not visible. ` +
    `The answer should follow the json format: [{"point": [y, x], "label": <part name>}, ...]. ` +
    `The points are in [y, x] format normalized to 0-1000. Return [] if none are visible.`,
  box:
    `Detect these sink plumbing parts if visible: ${partList}. Return bounding boxes. ` +
    `The answer should follow the JSON format: ` +
    `[{"label": <part name>, "y": <y_min>, "x": <x_min>, "y2": <y_max>, "x2": <x_max>}, ...] ` +
    `where coordinates are normalized to 0-1000. Return [] if none are visible.`,
  success:
    `You are checking a step of a sink drain (P-trap) repair. Step: "Hand-tighten the slip nut ` +
    `onto the P-trap so it is fully seated." Is the slip nut fully tightened by hand in this image? ` +
    `Answer in JSON: {"success": true | false | null, "confidence": <0-1>, "reason": <short reason>, ` +
    `"point": [y, x] of the slip nut you judged, or null}. Use null for success if you cannot tell. ` +
    `Points are [y, x] normalized to 0-1000.`,
};
const tasks = task === "all" ? ["point", "box", "success"] : [task];

async function loadImage(file) {
  let buf = fs.readFileSync(file);
  let mime = mimeOf(file);
  if (opts.width) {
    buf = await sharp(buf).rotate().resize({ width: Number(opts.width), withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    mime = "image/jpeg";
  }
  return { buf, mime };
}

// Accept both the documented formats and the classic Gemini box_2d [ymin, xmin, ymax, xmax].
function normBox(o) {
  if (Array.isArray(o.box_2d)) { const [y, x, y2, x2] = o.box_2d; return { y, x, y2, x2 }; }
  if ([o.y, o.x, o.y2, o.x2].every((v) => typeof v === "number")) return { y: o.y, x: o.x, y2: o.y2, x2: o.x2 };
  return null;
}

async function annotate(file, buf, items, tag) {
  const meta = await sharp(buf).rotate().metadata();
  const W = meta.autoOrient?.width ?? meta.width;
  const H = meta.autoOrient?.height ?? meta.height;
  const colors = ["#ff2d55", "#00c7be", "#ffcc00", "#5856d6", "#34c759", "#ff9500"];
  const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
  const r = Math.max(6, Math.round(Math.min(W, H) / 80));
  const fs_ = Math.max(14, Math.round(Math.min(W, H) / 35));
  let svg = "";
  items.forEach((it, i) => {
    const c = colors[i % colors.length];
    const b = normBox(it);
    if (b) {
      const x = (b.x / 1000) * W, y = (b.y / 1000) * H, w = ((b.x2 - b.x) / 1000) * W, h = ((b.y2 - b.y) / 1000) * H;
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="${r / 2}"/>`;
      svg += `<text x="${x + 4}" y="${y + fs_}" font-size="${fs_}" font-family="Arial" fill="${c}" stroke="black" stroke-width="1">${esc(it.label)}</text>`;
    }
    if (Array.isArray(it.point)) {
      const [py, px] = it.point;
      const x = (px / 1000) * W, y = (py / 1000) * H;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="white" stroke-width="${r / 3}"/>`;
      svg += `<text x="${x + r * 1.5}" y="${y + fs_ / 3}" font-size="${fs_}" font-family="Arial" font-weight="bold" fill="${c}" stroke="black" stroke-width="1">${esc(it.label ?? "")}</text>`;
    }
  });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${path.parse(file).name}.${tag}.jpg`);
  await sharp(buf).rotate()
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`) }])
    .jpeg({ quality: 85 }).toFile(out);
  return out;
}

const latByTask = Object.fromEntries(tasks.map((t) => [t, []]));
console.log(`model=${MODEL} thinking=${thinking} tasks=${tasks.join(",")} parts=[${parts.join(", ")}] width=${opts.width ?? "original"} runs=${runs}`);

for (const file of images) {
  const { buf, mime } = await loadImage(file);
  console.log(`\n=== ${path.basename(file)} (${Math.round(buf.length / 1024)} KB sent)`);
  for (const t of tasks) {
    for (let i = 0; i < runs; i++) {
      const t0 = performance.now();
      let res;
      try {
        res = await ai.interactions.create({
          model: MODEL,
          input: [
            { type: "image", data: buf.toString("base64"), mime_type: mime },
            { type: "text", text: PROMPTS[t] },
          ],
          generation_config: { thinking_level: thinking },
          store: false,
          api_version: "v1beta", // SDK 3.3.0 defaults to /v1/, where preview models 404
        }, sdkRequestOptions(opts));
      } catch (err) {
        console.log(`  [${t}] run ${i + 1}: ERROR after ${Math.round(performance.now() - t0)} ms${fmtAttempts(takeAttempts())}: ${err.message}`);
        continue;
      }
      const ms = performance.now() - t0;
      latByTask[t].push(ms);
      const u = res.usage ?? {};
      const tok = ` in=${u.total_input_tokens ?? "?"} out=${u.total_output_tokens ?? "?"} thought=${u.total_thought_tokens ?? "?"}`;
      console.log(`  [${t}] run ${i + 1}: ${Math.round(ms)} ms end-to-end${fmtAttempts(takeAttempts())}${tok}`);
      if (opts.raw) console.log(JSON.stringify(res, null, 2));
      if (i > 0 && !opts.verbose) continue;
      const parsed = extractJson(res.output_text);
      if (parsed == null) { console.log(`    (unparsed) ${res.output_text}`); continue; }
      if (t === "success") {
        console.log(`    success=${parsed.success} confidence=${parsed.confidence} point=${JSON.stringify(parsed.point)}\n    reason: ${parsed.reason}`);
        if (Array.isArray(parsed.point)) console.log(`    -> ${await annotate(file, buf, [{ point: parsed.point, label: `tight? ${parsed.success}` }], "success")}`);
        continue;
      }
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of items) {
        const b = normBox(it);
        const where = Array.isArray(it.point) ? `point [y,x]=${JSON.stringify(it.point)}` : b ? `box y=${b.y} x=${b.x} y2=${b.y2} x2=${b.x2}` : JSON.stringify(it);
        console.log(`    ${String(it.label).padEnd(18)} ${where}`);
      }
      if (!items.length) console.log("    (nothing found)");
      else console.log(`    -> ${await annotate(file, buf, items, t)}`);
    }
  }
}
console.log("");
for (const t of tasks) console.log(`latency [${t}]: ${stats(latByTask[t])}`);
