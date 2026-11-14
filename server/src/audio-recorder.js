// Records a coaching session's audio for the demo video (RECORD_AUDIO=1, dev/filming only):
//   you.wav        – the user's mic (16 kHz), as the server received it
//   coach.wav      – the coach's voice (24 kHz), as it was played (interrupted speech is cut)
//   transcript.srt – both sides with timestamps (subtitles); transcript.txt – plain text
// Both WAVs start at the same moment (session start), so they line up in a video editor.
// Saved in server/logs/<session>/ (git-ignored).

import fs from 'node:fs';
import path from 'node:path';

const ENABLED = process.env.RECORD_AUDIO === '1';

/** One audio track: chunks placed on a timeline (silence in between). */
class Track {
  constructor(rate) {
    this.rate = rate;
    this.segments = []; // { pos (samples), buf }
    this.end = 0;       // samples
  }
  add(t0, buf) {
    // Real-time input lands at its arrival time; bursts of output are queued back to back.
    const atArrival = Math.round(((Date.now() - t0) / 1000) * this.rate);
    const pos = Math.max(this.end, atArrival);
    this.segments.push({ pos, buf });
    this.end = pos + buf.length / 2;
  }
  /** Drop everything queued after "now" (the coach was interrupted: it was never heard). */
  cutAt(t0) {
    const now = Math.round(((Date.now() - t0) / 1000) * this.rate);
    if (this.end <= now) return;
    this.segments = this.segments.flatMap((s) => {
      const len = s.buf.length / 2;
      if (s.pos >= now) return [];
      if (s.pos + len <= now) return [s];
      return [{ pos: s.pos, buf: s.buf.subarray(0, (now - s.pos) * 2) }];
    });
    this.end = now;
  }
  wav() {
    const data = Buffer.alloc(this.end * 2);
    for (const s of this.segments) s.buf.copy(data, s.pos * 2);
    const h = Buffer.alloc(44);
    h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
    h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
    h.writeUInt32LE(this.rate, 24); h.writeUInt32LE(this.rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
    h.write('data', 36); h.writeUInt32LE(data.length, 40);
    return Buffer.concat([h, data]);
  }
}

export class AudioRecorder {
  constructor(dir) {
    this.enabled = ENABLED;
    this.dir = dir;
    this.t0 = Date.now();
    this.you = new Track(16000);
    this.coach = new Track(24000);
    this.lines = [];      // { who, start, end, text }
    this.current = null;
  }
  mic(b64) { if (this.enabled) this.you.add(this.t0, Buffer.from(b64, 'base64')); }
  speech(b64) { if (this.enabled) this.coach.add(this.t0, Buffer.from(b64, 'base64')); }
  interrupted() { if (this.enabled) this.coach.cutAt(this.t0); }
  transcript(who, text) {
    if (!this.enabled || !text) return;
    const t = (Date.now() - this.t0) / 1000;
    if (this.current?.who === who) { this.current.text += text; this.current.end = t; return; }
    this.current = { who, start: t, end: t, text };
    this.lines.push(this.current);
  }
  turnEnd() { this.current = null; }

  finish() {
    if (!this.enabled || (!this.you.end && !this.coach.end)) return null;
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(path.join(this.dir, 'you.wav'), this.you.wav());
    fs.writeFileSync(path.join(this.dir, 'coach.wav'), this.coach.wav());
    const ts = (s) => {
      const ms = Math.round(s * 1000);
      const p = (n, w = 2) => String(n).padStart(w, '0');
      return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
    };
    const lines = this.lines.map((l) => ({ ...l, text: l.text.trim(), end: Math.max(l.end + 1.5, l.start + 1.5) }));
    fs.writeFileSync(path.join(this.dir, 'transcript.srt'), lines.map((l, i) =>
      `${i + 1}\n${ts(l.start)} --> ${ts(l.end)}\n${l.who === 'coach' ? 'Coach' : 'You'}: ${l.text}\n`).join('\n'));
    fs.writeFileSync(path.join(this.dir, 'transcript.txt'), lines.map((l) =>
      `[${l.start.toFixed(1).padStart(6)}s] ${l.who === 'coach' ? 'Coach' : 'You  '}: ${l.text}`).join('\n') + '\n');
    return this.dir;
  }
}
