// ServerConnection - the app's link to our backend (server/ in the repo).
//
// One WebSocket to ws://<host>:8080/live, speaking the JSON protocol in docs/protocol.md.
// So far it uses the "task" path: start a procedure (e.g. bottle_demo), stream camera frames at
// the rate the server asks for ("capture" / "snap"), and show the hud / decision messages that come
// back. Voice (start/audio) comes in Milestone 3.
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
)

data class ServerUiState(
    val link: Link = Link.OFFLINE,
    val activeTask: String? = null,
    val hud: Hud? = null,
    val watcherAnswer: String? = null,
    val watcherConfidence: Float? = null,
    val watcherMs: Int? = null,
    val framesSent: Int = 0,
    val lastError: String? = null,
    // The server decides how often we send frames ("capture"): 0.5 fps normally, 2 on risky steps.
    val captureFps: Double = DEFAULT_CAPTURE_FPS,
    val captureReason: String? = null,
)

const val DEFAULT_CAPTURE_FPS = 0.5

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

  /** "snap": the server wants one frame right now (user spoke, or said "done"). */
  val snapRequests = Channel<Unit>(Channel.CONFLATED)

  val isConnected: Boolean
    get() = _state.value.link == Link.CONNECTED

  /** Connect (if needed) and start an expert procedure, e.g. "bottle_demo" or "ptrap". */
  fun startTask(taskId: String) {
    wanted = true
    _state.update { it.copy(activeTask = taskId, hud = null, lastError = null) }
    if (isConnected) sendTask(taskId) else connect()
  }

  /** End everything: tell the server, close the socket, stop reconnecting. */
  fun stop() {
    wanted = false
    reconnectJob?.cancel()
    socket?.let {
      it.send(JSONObject().put("type", "stop").toString())
      it.close(1000, "user stopped")
    }
    socket = null
    _state.update { ServerUiState() }
  }

  /** One camera frame: base64 JPEG, ~768 px wide, about once a second. */
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
      // The server keeps no state between sockets, so (re)start the task on every connect.
      _state.value.activeTask?.let { sendTask(it) }
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
      val msg = runCatching { JSONObject(text) }.getOrNull() ?: return
      when (msg.optString("type")) {
        "hud" -> _state.update { it.copy(hud = parseHud(msg)) }
        "watch" -> headlineLabels = msg.optJSONObject("headline")?.optJSONObject("labels")
        "decision" -> handleDecision(msg)
        "error" -> _state.update { it.copy(lastError = msg.optString("message")) }
        "capture" -> {
          val fps = msg.optDouble("fps", DEFAULT_CAPTURE_FPS).takeIf { it > 0 } ?: DEFAULT_CAPTURE_FPS
          _state.update { it.copy(captureFps = fps, captureReason = msg.optNullableString("reason")) }
        }
        "snap" -> snapRequests.trySend(Unit)
        // status / audio / transcript / handle are for the voice coach (Milestone 3).
      }
    }

    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) = onDropped(null)

    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) =
        onDropped("Can't reach the server (${t.message}). Is it running, and did you run adb reverse?")

    private fun onDropped(error: String?) {
      if (socket == null && !wanted) return // we closed it on purpose
      Log.d(TAG, "connection dropped: $error")
      socket = null
      _state.update { it.copy(link = Link.OFFLINE, lastError = error ?: it.lastError) }
      scheduleReconnect()
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
      )
}

private fun JSONObject.optNullableString(key: String): String? =
    if (isNull(key)) null else optString(key).takeIf { it.isNotBlank() }
