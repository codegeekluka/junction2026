// Summarise a watcher session log:  node scripts/report.js [session-dir | latest]
// Speed, certainty, flicker, and accuracy against the Right/Wrong taps, plus the
// frames it got wrong (to look at and tune the questions).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HEADLINES } from '../src/questions.js';

const logs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../logs');
const arg = process.argv[2] || 'latest';
const sessions = fs.existsSync(logs) ? fs.readdirSync(logs).filter((d) => fs.existsSync(path.join(logs, d, 'events.jsonl'))).sort() : [];
if (!sessions.length) { console.log('No sessions in server/logs yet.'); process.exit(0); }
if (arg === 'list') { sessions.forEach((s) => console.log(s)); process.exit(0); }
const dir = arg === 'latest' ? path.join(logs, sessions.at(-1)) : path.resolve(arg);
const events = fs.readFileSync(path.join(dir, 'events.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));

const pct = (a, p) => a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : '-';
const set = events.find((e) => e.ev === 'watch')?.set;
const head = HEADLINES[set]?.question;
const decisions = events.filter((e) => e.ev === 'decision');
const ok = decisions.filter((d) => !d.error);
const errors = decisions.filter((d) => d.error);
const ms = ok.map((d) => d.ms).sort((a, b) => a - b);
const durS = decisions.length ? (decisions.at(-1).t - decisions[0].t) / 1000 : 0;

console.log(`Session ${path.basename(dir)} · set "${set}" · ${durS.toFixed(0)} s`);
console.log(`Checks: ${ok.length} ok, ${errors.length} failed (${errors.map((e) => e.error).join(', ') || 'none'}) · ${(ok.length / Math.max(durS, 1)).toFixed(2)} checks/s`);
console.log(`Latency ms: min ${ms[0] ?? '-'} · median ${pct(ms, 0.5)} · p90 ${pct(ms, 0.9)} · max ${ms.at(-1) ?? '-'}`);

if (head) {
  const seq = ok.map((d) => d.headline ?? d.answers?.[head]).filter(Boolean);
  const conflicts = seq.filter((a) => a.conflict).length;
  const conf = seq.map((a) => a.confidence);
  const bands = { sure: conf.filter((c) => c >= 0.75).length, maybe: conf.filter((c) => c >= 0.6 && c < 0.75).length, unsure: conf.filter((c) => c < 0.6).length };
  let changes = 0, flickers = 0;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i].choice !== seq[i - 1].choice) changes++;
    if (i >= 2 && seq[i].choice === seq[i - 2].choice && seq[i].choice !== seq[i - 1].choice) flickers++; // A-B-A
  }
  const counts = {};
  seq.forEach((a) => (counts[a.choice] = (counts[a.choice] ?? 0) + 1));
  console.log(`Headline "${head}": ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  console.log(`Certainty: very sure ${bands.sure} · fairly sure ${bands.maybe} · not sure ${bands.unsure}`);
  console.log(`Answer changes: ${changes} · flickers (A→B→A): ${flickers} · gate conflicts: ${conflicts}`);
  console.log('Timeline:', seq.map((a) => (a.confidence < 0.6 ? a.choice[0] : a.choice[0].toUpperCase())).join(''), '(capital = sure)');
}

const fb = events.filter((e) => e.ev === 'feedback');
if (fb.length) {
  const right = fb.filter((f) => f.correct).length;
  console.log(`\nFeedback: ${right}/${fb.length} marked right (${Math.round((100 * right) / fb.length)}%)`);
  for (const f of fb.filter((x) => !x.correct)) {
    const a = f.headline ?? f.answers?.[head];
    console.log(`  WRONG: said "${a?.choice}" (${a ? Math.round(a.confidence * 100) : '?'}%), actually "${f.expected}" · frame: ${f.frame ? path.join(dir, f.frame) : 'none'}`);
    if (a?.probabilities) console.log(`         probabilities: ${Object.entries(a.probabilities).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ')}`);
  }
} else {
  console.log('\nNo Right/Wrong taps in this session.');
}
