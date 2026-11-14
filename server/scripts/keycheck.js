// Checks which Gemini keys in .env can open a Live session (paid/credits tier).
// Prints only the variable name and last 4 characters of each key.
import { GoogleGenAI, Modality } from '@google/genai';

const names = Object.keys(process.env).filter((k) => /^GEMINI_API_KEY(_\w+)?$/.test(k)).sort();
for (const name of names) {
  const key = process.env[name].trim();
  if (!key) continue;
  const label = `${name} (…${key.slice(-4)})`;
  const ai = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: 'v1beta' } });
  const result = await new Promise((resolve) => {
    let settled = false;
    const finish = (r) => { if (!settled) { settled = true; resolve(r); } };
    setTimeout(() => finish('TIMEOUT (no answer in 15 s)'), 15000);
    ai.live.connect({
      model: 'gemini-3.8-live',
      config: { responseModalities: [Modality.AUDIO] },
      callbacks: {
        onmessage: (m) => { if (m.setupComplete) finish('OK: Live works'); },
        onclose: (e) => finish(`REFUSED: ${String(e?.reason || e?.code).slice(0, 90)}`),
        onerror: (e) => finish(`ERROR: ${String(e?.message || e).slice(0, 90)}`),
      },
    }).then((s) => setTimeout(() => { try { s.close(); } catch {} }, 16000))
      .catch((e) => finish(`REFUSED: ${String(e?.message || e).slice(0, 90)}`));
  });
  console.log(`${label}: ${result}`);
}
process.exit(0);
