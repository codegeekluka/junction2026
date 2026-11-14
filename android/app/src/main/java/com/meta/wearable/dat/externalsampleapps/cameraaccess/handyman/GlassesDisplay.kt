// GlassesDisplay - draws the current step card on the Meta Ray-Ban Display glasses.
//
// Attaches the Display capability once the device session is STARTED, then re-draws a card every
// time the server's "hud" (or the link status) changes. Each sendContent() replaces the whole
// screen. On glasses without a display (Ray-Ban Meta Gen 2) addDisplay() fails and we simply stay
// audio/phone-only. On the glasses, black = see-through, so the card sits over the real world.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.util.Log
import com.meta.wearable.dat.core.session.DeviceSession
import com.meta.wearable.dat.display.Display
import com.meta.wearable.dat.display.addDisplay
import com.meta.wearable.dat.display.removeDisplay
import com.meta.wearable.dat.display.types.DisplayState
import com.meta.wearable.dat.display.views.ContentScope
import com.meta.wearable.dat.display.views.Direction
import com.meta.wearable.dat.display.views.FlexBoxBackground
import com.meta.wearable.dat.display.views.TextColor
import com.meta.wearable.dat.display.views.TextStyle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

/** What the step card should show, derived from the server state. */
private data class Card(
    val link: Link,
    val hasTask: Boolean,
    val hud: Hud?,
)

enum class GlassesDisplayStatus { NONE, ATTACHING, READY, UNAVAILABLE }

class GlassesDisplay(
    private val scope: CoroutineScope,
    private val server: StateFlow<ServerUiState>,
) {
  companion object {
    private const val TAG = "Handyman:Display"
  }

  private val _status = MutableStateFlow(GlassesDisplayStatus.NONE)
  val status: StateFlow<GlassesDisplayStatus> = _status.asStateFlow()

  // One thread for every sendContent so cards arrive in order.
  private val sendDispatcher = Dispatchers.Default.limitedParallelism(1)

  private var session: DeviceSession? = null
  @Volatile private var display: Display? = null
  private var stateJob: Job? = null
  private var renderJob: Job? = null

  /** Call when the device session reaches STARTED. */
  fun attach(newSession: DeviceSession) {
    if (session === newSession && display != null) return
    detach()
    session = newSession
    _status.value = GlassesDisplayStatus.ATTACHING
    newSession
        .addDisplay()
        .fold(
            onSuccess = { newDisplay ->
              display = newDisplay
              stateJob =
                  scope.launch {
                    newDisplay.state.collect { state ->
                      Log.d(TAG, "display state: $state")
                      if (state == DisplayState.STARTED) {
                        _status.value = GlassesDisplayStatus.READY
                        startRendering(newDisplay)
                      } else if (state == DisplayState.STOPPED) {
                        renderJob?.cancel()
                        _status.value = GlassesDisplayStatus.NONE
                      }
                    }
                  }
            },
            onFailure = { error, _ ->
              // Normal on glasses without a display: keep going audio/phone-only.
              Log.i(TAG, "No glasses display: ${error.description}")
              _status.value = GlassesDisplayStatus.UNAVAILABLE
            },
        )
  }

  /** Call when the session stops (or before attaching to a new one). */
  fun detach() {
    renderJob?.cancel()
    stateJob?.cancel()
    renderJob = null
    stateJob = null
    if (display != null) runCatching { session?.removeDisplay() }
    display = null
    session = null
    _status.value = GlassesDisplayStatus.NONE
  }

  private fun startRendering(target: Display) {
    renderJob?.cancel()
    renderJob =
        scope.launch(sendDispatcher) {
          server
              .map { s -> Card(s.link, s.activeTask != null, s.hud) }
              .distinctUntilChanged()
              .collect { card ->
                target.sendContent { cardContent(card) }.onFailure { error, _ ->
                  Log.w(TAG, "sendContent failed: ${error.description}")
                }
              }
        }
  }

  /** The card layout. One root flexBox per screen (Meta's rule). Text-first; images later. */
  private fun ContentScope.cardContent(card: Card) {
    val hud = card.hud
    flexBox(direction = Direction.COLUMN, gap = 12, padding = 24, background = FlexBoxBackground.CARD) {
      when {
        !card.hasTask -> {
          text("Handyman", style = TextStyle.HEADING)
          text(
              if (card.link == Link.CONNECTED) "Ready" else "Say what needs fixing",
              style = TextStyle.BODY,
              color = TextColor.SECONDARY,
          )
        }
        card.link != Link.CONNECTED -> {
          text("Reconnecting…", style = TextStyle.HEADING)
          text("Your progress is kept", style = TextStyle.BODY, color = TextColor.SECONDARY)
        }
        hud == null -> text("Starting…", style = TextStyle.HEADING)
        hud.state == "finished" -> {
          text("✓ All done", style = TextStyle.HEADING)
          hud.task?.let { text(it, style = TextStyle.BODY, color = TextColor.SECONDARY) }
        }
        hud.state == "stopped" -> text("Stopped", style = TextStyle.HEADING)
        else -> {
          text(
              listOfNotNull(hud.step?.let { "Step $it" }, if (hud.gate) "Safety" else null)
                  .joinToString(" · "),
              style = TextStyle.META,
              color = TextColor.SECONDARY,
          )
          hud.title?.let { text(it, style = TextStyle.HEADING) }
          when (hud.state) {
            "mistake" -> hud.warning?.let { text("⚠ $it", style = TextStyle.BODY) }
            "cant_see" -> text("Can't see: move closer or add light", style = TextStyle.BODY)
            else -> hud.verified?.let { text("✓ $it", style = TextStyle.BODY, color = TextColor.SECONDARY) }
          }
        }
      }
    }
  }
}
