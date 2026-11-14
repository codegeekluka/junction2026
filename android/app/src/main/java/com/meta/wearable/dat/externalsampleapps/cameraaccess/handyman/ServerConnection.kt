// ServerConnection - the app's link to our backend (server/ in the repo).
//
// One WebSocket to ws://<host>:8080/live, speaking the JSON protocol in docs/protocol.md.
// Milestone 1: the "task" path (start a procedure, stream frames, show hud / decision).
// Milestone 3: the voice coach ("start" + "audio" in, "audio" / "interrupted" / "transcript" out),
// the server-controlled frame rate ("capture") and on-demand frames ("snap").
//
// During development the phone reaches the laptop through the USB cable:
//   adb reverse tcp:8080 tcp:8080   →   ws://localhost:8080/live on the phone = the laptop's server.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.util.Log
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject

enum class Link { OFFLINE, CONNECTING, CONNECTED }

/** What the server last told us, ready for the screen (and later the glasses display). */
data class Hud(
    val state: String = "",
    val task: String? = null,
    val step: String? = null,
    val title: String? = null,
    val say: String? = null,
    val gate: Boolean = false,
    val verified: String? = null,
    val warning: String? = null,
    val card: String? = null, // designer card id (design/glasses-ui), e.g. "step-2-bucket"
    val cardUrl: String? = null, // path on the server, e.g. "/cards/12-step-2-bucket.png"
    // Glanceable display fields (docs/protocol.md): the main text, an optional detail, a status line.
    val short: String? = null, // the instruction in ≤ 6 words, e.g. "Both nuts left, by hand"
    val tip: String? = null, // optional detail, e.g. "Washer: flat side to the nut"
    val status: String? = null, // "👁 Watching…" · "✓ Done" · "⚠ Stop" · "? Show me another angle"
)

enum class CoachState { OFF, CONNECTING, LIVE, RECONNECTING, OFFLINE }

data class ServerUiState(
    val link: Link = Link.OFFLINE,
    val activeTask: String? = null,
    val hud: Hud? = null,
    val watcherAnswer: String? = null,
    val watcherConfidence: Float? = null,
    val watcherMs: Int? = null,
    val framesSent: Int = 0,
    val lastError: String? = null,
    // Milestone 3: voice coach
    val coach: CoachState = CoachState.OFF,
    val coachLine: String? = null, // what the coach is saying / last said
    val userLine: String? = null, // what the user said last
    val captureFps: Float = 0.5f, // frame rate the server asks for ("capture")
)


class ServerConnection(
    private val scope: CoroutineScope,
    private val url: String = DEFAULT_URL,
) {
  companion object {
    private const val TAG = "Handyman:Server"
    const val DEFAULT_URL = "ws://localhost:8080/live"
    private const val RECONNECT_DELAY_MS = 2000L
  }

  private val client =
      OkHttpClient.Builder()
          .pingInterval(15, TimeUnit.SECONDS)
          .readTimeout(0, TimeUnit.MILLISECONDS) // a WebSocket stays open; don't time out reads
          .build()

  private val _state = MutableStateFlow(ServerUiState())
  val state: StateFlow<ServerUiState> = _state.asStateFlow()

  @Volatile private var socket: WebSocket? = null
  @Volatile private var wanted = false // true between start(task) and stop()
  private var reconnectJob: Job? = null

  // Plain-words labels for the watcher's answer options, sent once in the "watch" message.
  private var headlineLabels: JSONObject? = null

  // Milestone 3 (voice coach)
  @Volatile private var coachWanted = false
  @Volatile private var resumeHandle: String? = null // send back in "start" to resume the conversation
  private var lastSpeaker: String? = null

  /** Coach speech to play: base64 PCM 16-bit mono 24 kHz. */
  var onCoachAudio: (String) -> Unit = {}
  /** The user talked over the coach: stop playback now. */
  var onInterrupted: () -> Unit = {}
  /** The server wants a frame right now (user started talking, or "done" verification). */
  var onSnap: () -> Unit = {}

  /** Base URL of the server for HTTP things like card images, e.g. "http://localhost:8080". */
  val httpBase: String = url.replaceFirst("ws", "http").substringBefore("/live")

  val isConnected: Boolean
    get() = _state.value.link == Link.CONNECTED

  /** Connect (if needed) and start an expert procedure, e.g. "bottle_demo" or "ptrap". */
  fun startTask(taskId: String) {
    wanted = true
    _state.update { it.copy(activeTask = taskId, hud = null, lastError = null) }
    if (isConnected) sendTask(taskId) else connect()
  }

  /** Start the voice coach (Gemini Live). Procedures are then started by voice. */
  fun startCoach() {
    wanted = true
    coachWanted = true
    _state.update { it.copy(coach = CoachState.CONNECTING, lastError = null) }
    if (isConnected) sendStart() else connect()
  }

  /** Show a problem on the panel (e.g. mic permission denied). */
  fun reportError(message: String) = _state.update { it.copy(lastError = message) }

  /** Mic audio: base64 PCM 16-bit mono 16 kHz, ~100 ms per chunk. */
  fun sendAudio(pcmBase64: String) {
    if (!coachWanted || !isConnected) return
    socket?.send(JSONObject().put("type", "audio").put("data", pcmBase64).toString())
  }

  private fun sendStart() {
    val msg = JSONObject().put("type", "start")
    resumeHandle?.let { msg.put("handle", it) }
    socket?.send(msg.toString())
  }

  /** End everything: tell the server, close the socket, stop reconnecting. */
  fun stop() {
    coachWanted = false
    resumeHandle = null
    wanted = false
    reconnectJob?.cancel()
    socket?.let {
      it.send(JSONObject().put("type", "stop").toString())
      it.close(1000, "user stopped")
    }
    socket = null
    _state.update { ServerUiState() }
  }

  /** One camera frame: base64 JPEG, ~640 px wide, at the rate the server asks for ("capture"). */
  fun sendFrame(jpegBase64: String) {
    val ws = socket ?: return
    if (!isConnected) return
    val ok = ws.send(JSONObject().put("type", "frame").put("data", jpegBase64).toString())
    if (ok) _state.update { it.copy(framesSent = it.framesSent + 1) }
  }

  private fun connect() {
    if (_state.value.link != Link.OFFLINE) return
    _state.update { it.copy(link = Link.CONNECTING) }
    Log.d(TAG, "connecting to $url")
    socket = client.newWebSocket(Request.Builder().url(url).build(), Listener())
  }

  private fun sendTask(taskId: String) {
    socket?.send(JSONObject().put("type", "task").put("task", taskId).toString())
  }

  private fun scheduleReconnect() {
    if (!wanted) return
    reconnectJob?.cancel()
    reconnectJob =
        scope.launch {
          delay(RECONNECT_DELAY_MS)
          if (wanted) connect()
        }
  }

  private inner class Listener : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: Response) {
      Log.d(TAG, "connected")
      _state.update { it.copy(link = Link.CONNECTED, lastError = null) }
      // The server keeps no state between sockets, so (re)start the coach / task on every connect.
      // The coach resumes the same conversation thanks to the resumption handle.
      if (coachWanted) sendStart()
      _state.value.activeTask?.let { sendTask(it) }
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
      val msg = runCatching { JSONObject(text) }.getOrNull() ?: return
      when (msg.optString("type")) {
        "hud" -> _state.update { it.copy(hud = parseHud(msg)) }
        "watch" -> headlineLabels = msg.optJSONObject("headline")?.optJSONObject("labels")
        "decision" -> handleDecision(msg)
        "error" -> _state.update { it.copy(lastError = msg.optString("message")) }
        // ---- Milestone 3: voice coach ----
        "audio" -> onCoachAudio(msg.optString("data"))
        "interrupted" -> onInterrupted()
        "status" -> handleStatus(msg.optString("state"))
        "handle" -> resumeHandle = msg.optNullableString("handle")
        "transcript" -> handleTranscript(msg.optString("who"), msg.optString("text"))
        "turnComplete" -> lastSpeaker = null
        "capture" -> _state.update { it.copy(captureFps = msg.optDouble("fps", 0.5).toFloat().coerceIn(0.2f, 4f)) }
        "snap" -> onSnap()
      }
    }

    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) = onDropped(null)

    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) =
        onDropped("Can't reach the server (${t.message}). Is it running, and did you run adb reverse?")

    private fun onDropped(error: String?) {
      if (socket == null && !wanted) return // we closed it on purpose
      Log.d(TAG, "connection dropped: $error")
      socket = null
      _state.update {
        it.copy(
            link = Link.OFFLINE,
            lastError = error ?: it.lastError,
            coach = if (coachWanted) CoachState.RECONNECTING else it.coach,
        )
      }
      scheduleReconnect()
    }
  }

  private fun handleStatus(state: String) {
    val coach =
        when (state) {
          "live" -> CoachState.LIVE
          "connecting" -> CoachState.CONNECTING
          "reconnecting" -> CoachState.RECONNECTING
          "offline" -> CoachState.OFFLINE
          "stopped" -> CoachState.OFF
          else -> return
        }
    _state.update { it.copy(coach = coach) }
  }

  // Transcripts arrive in fragments; join them while the same person is speaking.
  private fun handleTranscript(who: String, text: String) {
    val continuing = lastSpeaker == who
    lastSpeaker = who
    _state.update {
      if (who == "coach") it.copy(coachLine = if (continuing) (it.coachLine ?: "") + text else text.trim())
      else it.copy(userLine = if (continuing) (it.userLine ?: "") + text else text.trim())
    }
  }

  private fun handleDecision(msg: JSONObject) {
    if (msg.has("error")) return // one skipped check, nothing to show
    val headline = msg.optJSONObject("headline") ?: return
    val choice = headline.optString("choice", "")
    val label = headlineLabels?.optString(choice)?.takeIf { it.isNotBlank() } ?: choice
    _state.update {
      it.copy(
          watcherAnswer = label,
          watcherConfidence = headline.optDouble("confidence", Double.NaN).toFloat().takeIf { c -> !c.isNaN() },
          watcherMs = msg.optInt("ms", -1).takeIf { ms -> ms >= 0 },
      )
    }
  }

  private fun parseHud(msg: JSONObject) =
      Hud(
          state = msg.optString("state"),
          task = msg.optNullableString("task"),
          step = msg.optNullableString("step"),
          title = msg.optNullableString("title"),
          say = msg.optNullableString("say"),
          gate = msg.optBoolean("gate", false),
          verified = msg.optNullableString("verified"),
          warning = msg.optNullableString("warning"),
          card = msg.optNullableString("card"),
          cardUrl = msg.optNullableString("cardUrl"),
          short = msg.optNullableString("short"),
          tip = msg.optNullableString("tip"),
          status = msg.optNullableString("status"),
      )
}

private fun JSONObject.optNullableString(key: String): String? =
    if (isNull(key)) null else optString(key).takeIf { it.isNotBlank() }
