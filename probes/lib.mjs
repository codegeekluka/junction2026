// Shared helpers for the probe scripts. Never prints the API key.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = path.join(HERE, "out");

export function loadKey() {
  if (!process.env.GEMINI_API_KEY) {
    const envPath = path.join(HERE, "..", ".env");
    if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY missing: put it in the repo-root .env");
    process.exit(1);
  }
  return key;
}

const MIME = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".heic": "image/heic", ".heif": "image/heif",
  ".gif": "image/gif", ".bmp": "image/bmp",
};

export function mimeOf(file) {
  return MIME[path.extname(file).toLowerCase()];
}

/** Expand a file-or-folder argument into a sorted list of image paths. */
export function listImages(arg) {
  if (!arg) {
    console.error("usage: node <script> <image-or-folder> [...]");
    process.exit(1);
  }
  const st = fs.statSync(arg);
  if (st.isFile()) return [arg];
  return fs.readdirSync(arg)
    .filter((f) => mimeOf(f))
    .sort()
    .map((f) => path.join(arg, f));
}

/** Parse `--name=value` / `--flag` options; returns {opts, positional}. */
export function parseArgs(argv) {
  const opts = {};
  const positional = [];
  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) opts[m[1]] = m[2] ?? true;
    else positional.push(a);
  }
  return { opts, positional };
}

export function stats(ms) {
  if (!ms.length) return "n/a";
  const s = [...ms].sort((a, b) => a - b);
  const med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  return `n=${s.length} min=${Math.round(s[0])} median=${Math.round(med)} max=${Math.round(s.at(-1))} ms`;
}

/** Extract the first JSON value from model text (handles ```json fences). */
export function extractJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[\[{]/);
  if (start < 0) return null;
  for (let end = candidate.length; end > start; end--) {
    const ch = candidate[end - 1];
    if (ch !== "]" && ch !== "}") continue;
    try { return JSON.parse(candidate.slice(start, end)); } catch { /* keep shrinking */ }
  }
  return null;
}

/**
 * Wrap global fetch so every HTTP attempt (SDK retries, continuation hops) is recorded.
 * Call takeAttempts() after each logical request to get [{status, ms}] since the last call.
 */
let attempts = [];
export function installFetchTracer() {
  const orig = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const t0 = performance.now();
    try {
      const r = await orig(input, init);
      attempts.push({ status: r.status, ms: Math.round(performance.now() - t0), serverMs: r.headers.get("server-timing")?.match(/dur=(\d+)/)?.[1] });
      return r;
    } catch (err) {
      attempts.push({ status: "neterr", ms: Math.round(performance.now() - t0) });
      throw err;
    }
  };
}
export function takeAttempts() {
  const a = attempts;
  attempts = [];
  return a;
}
export function fmtAttempts(a) {
  if (a.length <= 1 && (a[0]?.status === 200)) return a[0]?.serverMs ? ` (server ${a[0].serverMs} ms)` : "";
  return ` [${a.length} HTTP attempts: ${a.map((x) => `${x.status}/${x.ms}ms`).join(", ")}]`;
}

/**
 * SDK request options: no automatic retries unless --retry is passed, plus a hard timeout.
 * timeout_ms alone did NOT stop a stalled socket in our test (a call hung 590 s), so we also
 * pass an AbortSignal. Call this once per request (the signal starts ticking immediately).
 */
export function sdkRequestOptions(opts) {
  const ms = Number(opts.timeout ?? 60000);
  const o = { timeout_ms: ms, fetch_options: { signal: AbortSignal.timeout(ms) } };
  if (!opts.retry) o.retries = { strategy: "none" };
  return o;
}
