// One coaching session = one browser/phone client <-> one Gemini Live session.
// Handles: 2-min video limit (context compression), ~10-min connection limit and
// network drops (session resumption), interruptions, transcripts.

import { GoogleGenAI, Modality } from '@google/genai';
import { SYSTEM_PROMPT } from './prompt.js';

const MODEL = process.env.LIVE_MODEL || 'gemini-3.8-live';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { apiVersion: 'v1beta' } });

// Tools the voice model can call. Step progress itself is NOT a tool: only the watcher's
// verified checks advance a procedure, so the model can't claim a step is done.
const TOOL_DECLARATIONS = [
  {
    name: 'start_task',
    description: 'Start one of the expert-verified repair procedures when the user wants to do that job. The camera inspector then checks every step. Returns the first step to tell the user.',
    parameters: { type: 'OBJECT', properties: {
      task_id: { type: 'STRING', description: 'Procedure id from the list in your instructions.' },
    }, required: ['task_id'] },
  },
  {
    name: 'get_task_status',
    description: 'Current procedure, step number and what the camera inspector last saw. Use when the user asks what step they are on or whether something is done.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'skip_step',
    description: 'Skip the current step ONLY if the user explicitly asks to skip it. Safety steps cannot be skipped.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'stop_task',
    description: 'Stop the current procedure (user wants to stop or switch job).',
    parameters: { type: 'OBJECT', properties: {} },
  },
];

const isFatal = (err) => /quota|billing|API key|permission|not found|unauthenticated/i.test(String(err?.message || err));

export class CoachSession {
  /** @param {(msg: object) => void} send  sends a JSON message to the client */
  constructor(send, log = console.log) {
    this.send = send;
    this.log = log;
    this.session = null;
    this.handle = null;        // session resumption handle
    this.closedByClient = false;
    this.reconnecting = false;
    this.latestFrame = null;   // base64 JPEG, kept in memory only (for tools later)
    this.gen = 0;              // connection generation; ignore events from stale sessions
    /** Tool handler set by the orchestrator: async (name, args) => result object */
    this.onTool = async (name) => ({ error: `tool ${name} not available` });
  }

  /** @param {string|null} handle  resumption handle from a previous connection (client reconnect) */
  async start(handle = null) {
    this.closedByClient = false;
    if (handle) this.handle = handle;
    await this.#connect();
  }

  /** @param {boolean} quiet  during automatic reconnects, don't alarm the user on each attempt */
  async #connect(quiet = false) {
    const resuming = Boolean(this.handle);
    const gen = ++this.gen;
    this.send({ type: 'status', state: resuming ? 'reconnecting' : 'connecting' });
    try {
      this.session = await ai.live.connect({
        model: MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }, { functionDeclarations: TOOL_DECLARATIONS }],
          contextWindowCompression: { slidingWindow: {} }, // lifts the 2-min audio+video cap
          sessionResumption: { handle: this.handle },       // survive drops / 10-min connection limit
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.LIVE_VOICE || 'Charon' } } },
        },
        callbacks: {
          onopen: () => this.log(`[live] connected (${resuming ? 'resumed' : 'new'})`),
          onmessage: (m) => { if (gen === this.gen) this.#onMessage(m); },
          onerror: (e) => this.log('[live] error', e?.message || e),
          onclose: (e) => { if (gen === this.gen) this.#onClose(e); },
        },
      });
      // 'live' is announced on setupComplete (input sent before that is dropped).
    } catch (err) {
      this.log('[live] connect failed', err?.message || err);
      if (!quiet || isFatal(err)) this.#reportFailure(err);
      throw err;
    }
  }

  #reportFailure(err) {
    this.send({ type: 'error', message: isFatal(err)
      ? `The AI service refused the connection (quota or API key). ${String(err?.message || err).slice(0, 160)}`
      : 'Could not reach the AI. Check the internet connection.' });
    this.send({ type: 'status', state: 'offline' });
  }

  #onMessage(m) {
    if (m.setupComplete) this.send({ type: 'status', state: 'live' });
    if (m.sessionResumptionUpdate?.resumable && m.sessionResumptionUpdate.newHandle) {
      this.handle = m.sessionResumptionUpdate.newHandle;
      this.send({ type: 'handle', handle: this.handle }); // lets the client resume after its own network drop
    }
    if (m.goAway) {
      this.log(`[live] goAway, time left ${m.goAway.timeLeft}; reconnecting`);
      this.#reconnect();
    }
    const sc = m.serverContent;
    if (sc) {
      if (sc.interrupted) this.send({ type: 'interrupted' });
      for (const part of sc.modelTurn?.parts ?? []) {
        if (part.inlineData?.data) this.send({ type: 'audio', data: part.inlineData.data });
      }
      if (sc.inputTranscription?.text) this.send({ type: 'transcript', who: 'user', text: sc.inputTranscription.text });
      if (sc.outputTranscription?.text) this.send({ type: 'transcript', who: 'coach', text: sc.outputTranscription.text });
      if (sc.turnComplete) this.send({ type: 'turnComplete' });
    }
    if (m.toolCall?.functionCalls?.length) this.#handleTools(m.toolCall.functionCalls);
  }

  async #handleTools(calls) {
    const functionResponses = [];
    for (const fc of calls) {
      let response;
      try { response = await this.onTool(fc.name, fc.args ?? {}); }
      catch (err) { response = { error: String(err?.message || err) }; }
      this.log(`[live] tool ${fc.name}(${JSON.stringify(fc.args ?? {})}) ->`, JSON.stringify(response).slice(0, 160));
      functionResponses.push({ id: fc.id, name: fc.name, response });
    }
    this.session?.sendToolResponse({ functionResponses });
  }

  /** A verified observation from the watcher. The coach turns it into one short spoken line. */
  notify(text) {
    this.log('[live] inspector:', text);
    this.session?.sendRealtimeInput({ text: `[INSPECTOR] ${text}` });
  }

  #onClose(e) {
    this.log(`[live] closed: ${e?.code ?? ''} ${e?.reason ?? ''}`);
    // A close during setup is handled by #connect's rejection, so only reconnect live sessions.
    if (!this.session) return;
    this.session = null;
    if (!this.closedByClient && !this.reconnecting) this.#reconnect();
  }

  async #reconnect() {
    if (this.reconnecting || this.closedByClient) return;
    this.reconnecting = true;
    const old = this.session;
    this.session = null;
    this.gen++; // detach the old session's callbacks before closing it
    try { old?.close(); } catch {}
    // Network blips are common at the venue. Retry quietly. Google can take a few seconds
    // to release the old connection ("already connected to an existing client"), so if
    // resuming keeps failing, start a fresh session rather than giving up.
    let lastErr;
    let ok = false;
    for (let attempt = 1; attempt <= 6 && !this.closedByClient; attempt++) {
      if (attempt === 4 && this.handle) {
        this.log('[live] resume keeps failing; starting a fresh session');
        this.handle = null;
      }
      try {
        await this.#connect(true);
        ok = true;
        break;
      } catch (err) {
        lastErr = err;
        if (isFatal(err)) break; // quota / key / permission errors won't fix themselves
        await new Promise((r) => setTimeout(r, Math.min(1500 * attempt, 6000)));
      }
    }
    if (!ok && !this.closedByClient && lastErr && !isFatal(lastErr)) this.#reportFailure(lastErr);
    this.reconnecting = false;
  }

  sendAudio(b64) {
    this.session?.sendRealtimeInput({ audio: { data: b64, mimeType: 'audio/pcm;rate=16000' } });
  }

  sendFrame(b64) {
    if (!this.session) return;
    this.latestFrame = b64;
    this.session?.sendRealtimeInput({ video: { data: b64, mimeType: 'image/jpeg' } });
  }

  sendText(text) {
    this.session?.sendRealtimeInput({ text });
  }

  close() {
    this.closedByClient = true;
    this.latestFrame = null;
    try { this.session?.close(); } catch {}
    this.session = null;
  }
}
