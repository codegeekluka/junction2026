// VoiceLink - Milestone 3: talk to the coach through the glasses.
//
//   glasses mic (Bluetooth HFP/SCO) → 16 kHz 16-bit mono PCM, 100 ms chunks → server "audio"
//   server "audio" (24 kHz 16-bit mono PCM)  → glasses speakers
//   server "interrupted" (user talked over the coach) → drop queued speech immediately
//
// Routing: if the glasses are connected as a Bluetooth headset (SCO), mic and speaker go through
// them; otherwise (Mock Device Kit, no glasses) we fall back to the phone's mic and speaker, so
// the whole loop can be tested on the phone alone. VOICE_COMMUNICATION turns on the phone's echo
// cancellation, so the coach doesn't hear itself.
//
// Written without a build machine (Sat evening). Expect to fix small compile issues.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.util.Base64
import android.util.Log
import androidx.core.content.ContextCompat
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
    private const val CHUNK_SAMPLES = 1_600 // 100 ms at 16 kHz
  }

  private val context = context.applicationContext
  private val audioManager = this.context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  private val _route = MutableStateFlow(VoiceRoute.OFF)
  val route: StateFlow<VoiceRoute> = _route.asStateFlow()

  @Volatile private var running = false
  private var record: AudioRecord? = null
  private var track: AudioTrack? = null
  private var micThread: Thread? = null
  private var speakerThread: Thread? = null
  private val playQueue = LinkedBlockingQueue<ByteArray>()
  @Volatile private var flushRequested = false

  fun hasMicPermission(): Boolean =
      ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
          PackageManager.PERMISSION_GRANTED

  /** Start mic capture and speaker playback. Returns false if the mic can't be opened. */
  @SuppressLint("MissingPermission") // checked in hasMicPermission()
  fun start(): Boolean {
    if (running) return true
    if (!hasMicPermission()) {
      Log.w(TAG, "No RECORD_AUDIO permission")
      return false
    }
    _route.value = routeToGlasses()

    val minIn =
        AudioRecord.getMinBufferSize(MIC_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
    val rec =
        AudioRecord(
            MediaRecorder.AudioSource.VOICE_COMMUNICATION, // echo cancellation + noise suppression
            MIC_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            maxOf(minIn, CHUNK_SAMPLES * 2 * 2),
        )
    if (rec.state != AudioRecord.STATE_INITIALIZED) {
      Log.w(TAG, "AudioRecord failed to initialize")
      rec.release()
      releaseRoute()
      return false
    }
    record = rec

    val minOut =
        AudioTrack.getMinBufferSize(SPEAKER_RATE, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT)
    val trk =
        AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
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
    track = trk

    running = true
    rec.startRecording()
    trk.play()
    micThread = Thread(::micLoop, "Handyman:Mic").apply { start() }
    speakerThread = Thread(::speakerLoop, "Handyman:Speaker").apply { start() }
    Log.i(TAG, "voice started via ${_route.value}")
    return true
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

  fun stop() {
    if (!running) return
    running = false
    playQueue.clear()
    runCatching { micThread?.join(300) }
    runCatching { speakerThread?.join(300) }
    runCatching { record?.stop() }
    runCatching { record?.release() }
    runCatching { track?.pause(); track?.flush(); track?.release() }
    record = null
    track = null
    micThread = null
    speakerThread = null
    releaseRoute()
    _route.value = VoiceRoute.OFF
    Log.i(TAG, "voice stopped")
  }

  private fun micLoop() {
    val buf = ByteArray(CHUNK_SAMPLES * 2)
    while (running) {
      val rec = record ?: break
      var filled = 0
      while (running && filled < buf.size) {
        val n = rec.read(buf, filled, buf.size - filled)
        if (n <= 0) break
        filled += n
      }
      if (filled == buf.size) sendAudio(Base64.encodeToString(buf, Base64.NO_WRAP))
      else if (running) Thread.sleep(10) // mic hiccup (e.g. route change); try again
    }
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
    }
  }

  /** Use the glasses as a Bluetooth headset if they're there; otherwise the phone. */
  private fun routeToGlasses(): VoiceRoute {
    audioManager.mode = AudioManager.MODE_IN_COMMUNICATION // enables echo cancellation
    val devices = audioManager.availableCommunicationDevices
    val sco = devices.firstOrNull { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO }
    if (sco == null) {
      // No glasses headset (e.g. Mock Device Kit): loudspeaker, not the quiet earpiece.
      devices.firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
          ?.let { audioManager.setCommunicationDevice(it) }
      return VoiceRoute.PHONE
    }
    return if (audioManager.setCommunicationDevice(sco)) VoiceRoute.GLASSES
    else {
      Log.w(TAG, "Couldn't route audio to the glasses; using the phone")
      VoiceRoute.PHONE
    }
  }

  private fun releaseRoute() {
    runCatching { audioManager.clearCommunicationDevice() }
    runCatching { audioManager.mode = AudioManager.MODE_NORMAL }
  }
}
