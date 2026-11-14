// Regression test: re-run the CURRENT questions on every frame the user labelled
// (Right/Wrong taps) in past sessions, and compare with the true label.
//   node --env-file=../.env scripts/replay.js [session-dir | latest | all]
// The true label = the answer shown if they tapped Right, or the answer they picked if Wrong.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { QUESTION_SETS } from '../src/questions.js';
import { headline } from '../src/watcher.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const logs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../logs');
const arg = process.argv[2] || 'latest';
const all = fs.readdirSync(logs).filter((d) => fs.existsSync(path.join(logs, d, 'events.jsonl'))).sort();
const dirs = arg === 'all' ? all.map((d) => path.join(logs, d)) : [arg === 'latest' ? path.join(logs, all.at(-1)) : path.resolve(arg)];
const toApi = (set) => Object.fromEntries(Object.entries(set).map(([id, { label, ...q }]) => [id, q]));

let right = 0, total = 0;
for (const dir of dirs) {
  const events = fs.readFileSync(path.join(dir, 'events.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const set = events.find((e) => e.ev === 'watch')?.set;
  for (const f of events.filter((e) => e.ev === 'feedback' && e.frame)) {
    const truth = f.correct ? (f.headline ?? f.answers?.bottle_state)?.choice : f.expected;
    if (!truth) continue;
    const data = fs.readFileSync(path.join(dir, f.frame)).toString('base64');
    let res;
    try {
      res = await ai.decisions.create({
        api_version: 'v1beta', model: 'gemini-decision-1',
        input: [{ type: 'image', data, mime_type: 'image/jpeg', resolution: 'low' }],
        questions: toApi(QUESTION_SETS[set]),
      }, { retries: { strategy: 'none' }, fetch_options: { signal: AbortSignal.timeout(8000) } });
    } catch (e) { console.log(`  ${f.frame}: ERROR ${e.message}`); continue; }
    const h = headline(set, res.answers);
    const before = (f.headline ?? f.answers?.bottle_state)?.choice;
    const ok = h.choice === truth;
    total++; if (ok) right++;
    console.log(`${ok ? '✓' : '✗'} truth ${truth.padEnd(8)} now ${h.choice.padEnd(8)} ${Math.round(h.confidence * 100)}%${h.conflict ? ' (conflict)' : ''}  · before: ${before}  · ${path.basename(f.frame)}`);
  }
}
console.log(`\nCurrent questions: ${right}/${total} correct (${Math.round((100 * right) / Math.max(total, 1))}%)`);
