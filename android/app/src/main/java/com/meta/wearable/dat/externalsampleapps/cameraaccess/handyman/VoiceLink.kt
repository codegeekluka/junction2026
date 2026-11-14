// VoiceLink - talk to the coach through the glasses (Milestone 3, Luka; v2 without "call mode").
//
//   mic   → 16 kHz 16-bit mono PCM, 100 ms chunks → server "audio"
//   server "audio" (24 kHz 16-bit mono PCM)       → speaker
//   server "interrupted" (user talked over the coach) → drop queued speech immediately
//
// Why v2: v1 used the glasses as a Bluetooth headset in call mode (HFP/SCO). The glasses then show
// their phone-call screen ("calling 1000000") for the whole session, covering our card. Now:
//  - Real glasses: the mic comes INSIDE the camera stream (Meta's "in-stream audio", beta, fine in
//    Developer Mode), pushed in via [onGlassesAudio]. Playback is normal MEDIA audio, which goes to
//    the glasses over A2DP (better quality than call audio). No call mode → no call screen.
//  - Mock Device Kit / no glasses audio yet: the phone's own mic and speaker, also without call mode.
// In-stream audio has no echo cancellation, so on the glasses mic we don't send while the coach is
// speaking (plus a short tail); otherwise the coach would hear itself and cut itself off.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.os.SystemClock
import android.util.Base64
import android.util.Log
import androidx.core.content.ContextCompat
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class VoiceRoute { OFF, GLASSES, PHONE }

class VoiceLink(context: Context, private val sendAudio: (String) -> Unit) {
  companion object {
    private const val TAG = "Handyman:Voice"
    private const val MIC_RATE = 16_000 // docs/protocol.md: audio in = 16 kHz
    private const val SPEAKER_RATE = 24_000 // audio out = 24 kHz
    private const val CHUNK_BYTES = 3_200 // 100 ms at 16 kHz, 16-bit mono
    private const val ECHO_TAIL_MS = 400L // keep the glasses mic muted this long after the coach stops
  }

  private val context = context.applicationContext

  private val _route = MutableStateFlow(VoiceRoute.OFF)
  val route: StateFlow<VoiceRoute> = _route.asStateFlow()

  @Volatile private var running = false
  @Volatile private var glassesMic = false
  private var record: AudioRecord? = null
  private var track: AudioTrack? = null
  private var micThread: Thread? = null
  private var speakerThread: Thread? = null
  private val playQueue = LinkedBlockingQueue<ByteArray>()
  @Volatile private var flushRequested = false
  @Volatile private var lastPlayedAt = 0L // elapsedRealtime of the last coach audio written
  private val glassesChunk = ByteArrayOutputStream(CHUNK_BYTES * 2)

  fun hasMicPermission(): Boolean =
      ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
          PackageManager.PERMISSION_GRANTED

  /**
   * Use the glasses mic (in-stream audio) instead of the phone mic. Called when a camera stream
   * with audio starts (true) or ends (false); switches over live if the voice is already running.
   */
  @Synchronized
  fun setGlassesMic(enabled: Boolean) {
    if (glassesMic == enabled) return
    glassesMic = enabled
    if (!running) return
    if (enabled) stopPhoneMic() else startPhoneMic()
    _route.value = if (enabled) VoiceRoute.GLASSES else VoiceRoute.PHONE
    Log.i(TAG, "mic switched to ${_route.value}")
  }

  /** Start the speaker, plus the phone mic unless the glasses mic is in use. */
  @Synchronized
  fun start(): Boolean {
    if (running) return true
    if (!glassesMic && !hasMicPermission()) {
      Log.w(TAG, "No RECORD_AUDIO permission")
      return false
    }
    track = buildTrack()
    running = true
    if (!glassesMic && !startPhoneMic()) {
      running = false
      runCatching { track?.release() }
      track = null
      return false
    }
    track?.play()
    speakerThread = Thread({ speakerLoop() }, "Handyman:Speaker").apply { start() }
    _route.value = if (glassesMic) VoiceRoute.GLASSES else VoiceRoute.PHONE
    Log.i(TAG, "voice started via ${_route.value}")
    return true
  }

  /** Mic audio from the glasses' camera stream (16 kHz mono PCM). Chunked to 100 ms and sent. */
  fun onGlassesAudio(buffer: ByteBuffer) {
    if (!running || !glassesMic) return
    val bytes = ByteArray(buffer.remaining())
    buffer.duplicate().get(bytes)
    synchronized(glassesChunk) {
      glassesChunk.write(bytes)
      while (glassesChunk.size() >= CHUNK_BYTES) {
        val all = glassesChunk.toByteArray()
        glassesChunk.reset()
        glassesChunk.write(all, CHUNK_BYTES, all.size - CHUNK_BYTES)
        // No echo cancellation on this path: stay quiet while the coach is talking.
        if (!coachSpeaking()) sendAudio(Base64.encodeToString(all, 0, CHUNK_BYTES, Base64.NO_WRAP))
      }
    }
  }

  /** Queue coach speech (base64 PCM 24 kHz) for playback. */
  fun play(base64Pcm: String) {
    if (!running) return
    playQueue.offer(Base64.decode(base64Pcm, Base64.DEFAULT))
  }

  /** The user interrupted the coach: drop everything queued and stop the current sound now. */
  fun interrupt() {
    playQueue.clear()
    flushRequested = true
  }

  @Synchronized
  fun stop() {
    if (!running) return
    running = false
    playQueue.clear()
    stopPhoneMic()
    runCatching { speakerThread?.join(300) }
    runCatching { track?.pause(); track?.flush(); track?.release() }
    track = null
    speakerThread = null
    synchronized(glassesChunk) { glassesChunk.reset() }
    _route.value = VoiceRoute.OFF
    Log.i(TAG, "voice stopped")
  }

  private fun coachSpeaking(): Boolean =
      playQueue.isNotEmpty() || SystemClock.elapsedRealtime() - lastPlayedAt < ECHO_TAIL_MS

  // ---- Phone mic (Mock Device Kit, or before the glasses stream starts) ----

  @SuppressLint("MissingPermission") // checked in start() / hasMicPermission()
  private fun startPhoneMic(): Boolean {
    if (record != null) return true
    if (!hasMicPermission()) return false
    val minIn =
        AudioRecord.getMinBufferSize(MIC_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
    val rec =
        AudioRecord(
            // VOICE_COMMUNICATION = the phone's echo cancellation. We never switch the phone into call
            // mode or route to a Bluetooth headset, so the glasses don't show a call.
            MediaRecorder.AudioSource.VOICE_COMMUNICATION,
            MIC_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            maxOf(minIn, CHUNK_BYTES * 2),
        )
    if (rec.state != AudioRecord.STATE_INITIALIZED) {
      Log.w(TAG, "AudioRecord failed to initialize")
      rec.release()
      return false
    }
    record = rec
    rec.startRecording()
    micThread = Thread({ phoneMicLoop(rec) }, "Handyman:Mic").apply { start() }
    return true
  }

  private fun stopPhoneMic() {
    val rec = record ?: return
    record = null
    runCatching { micThread?.join(300) }
    micThread = null
    runCatching { rec.stop() }
    runCatching { rec.release() }
  }

  private fun phoneMicLoop(rec: AudioRecord) {
    val buf = ByteArray(CHUNK_BYTES)
    while (running && record === rec) {
      var filled = 0
      while (running && record === rec && filled < buf.size) {
        val n = rec.read(buf, filled, buf.size - filled)
        if (n <= 0) break
        filled += n
      }
      if (filled == buf.size) sendAudio(Base64.encodeToString(buf, Base64.NO_WRAP))
      else if (running) Thread.sleep(10) // mic hiccup; try again
    }
  }

  // ---- Speaker: normal media audio (glasses over A2DP, or the phone's loudspeaker) ----

  private fun buildTrack(): AudioTrack {
    val minOut =
        AudioTrack.getMinBufferSize(SPEAKER_RATE, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT)
    return AudioTrack.Builder()
        .setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA) // not VOICE_COMMUNICATION: no call mode
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build())
        .setAudioFormat(
            AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setSampleRate(SPEAKER_RATE)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .build())
        .setBufferSizeInBytes(maxOf(minOut, SPEAKER_RATE / 2)) // ~0.25 s: smooths network jitter
        .setTransferMode(AudioTrack.MODE_STREAM)
        .build()
  }

  private fun speakerLoop() {
    while (running) {
      val trk = track ?: break
      if (flushRequested) {
        flushRequested = false
        runCatching { trk.pause(); trk.flush(); trk.play() }
      }
      val chunk = playQueue.poll(50, TimeUnit.MILLISECONDS) ?: continue
      if (flushRequested) continue // interrupted while we waited: drop this chunk
      trk.write(chunk, 0, chunk.size) // blocks while the buffer is full = natural pacing
      lastPlayedAt = SystemClock.elapsedRealtime()
    }
  }
}
