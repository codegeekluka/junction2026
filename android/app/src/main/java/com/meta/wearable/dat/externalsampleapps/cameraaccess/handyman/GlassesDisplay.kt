// GlassesDisplay - draws the current step card on the Meta Ray-Ban Display glasses.
//
// Attaches the Display capability once the device session is STARTED, then re-draws a card every
// time the server's "hud" (or the link status) changes. Each sendContent() replaces the whole
// screen. On glasses without a display (Ray-Ban Meta Gen 2) addDisplay() fails and we simply stay
// audio/phone-only. On the glasses, black = see-through, so the card sits over the real world.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.graphics.Bitmap
import android.util.Log
import com.meta.wearable.dat.core.session.DeviceSession
import com.meta.wearable.dat.display.Display
import com.meta.wearable.dat.display.addDisplay
import com.meta.wearable.dat.display.removeDisplay
import com.meta.wearable.dat.display.types.DisplayState
import com.meta.wearable.dat.display.views.ContentScope
import com.meta.wearable.dat.display.views.Direction
import com.meta.wearable.dat.display.views.FlexBoxBackground
import com.meta.wearable.dat.display.views.ImageSize
import com.meta.wearable.dat.display.views.TextColor
import com.meta.wearable.dat.display.views.TextStyle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.conflate
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

/** What the step card should show, derived from the server state. */
private data class Card(
    val link: Link,
    val hasTask: Boolean,
    val hud: Hud?,
    /** Designer card to show (design/glasses-ui), or null → text card. */
    val cardId: String?,
)

/**
 * Picks the designer card. The server names one in every hud; the app adds the ones only it can
 * know about: "offline" when the link to the server is down, "ready" when nothing is running.
 */
private fun pickCard(s: ServerUiState, hasTask: Boolean): String? {
  val coachOn = s.coach != CoachState.OFF
  val active = hasTask || coachOn
  return when {
    active && (s.link != Link.CONNECTED || s.coach == CoachState.RECONNECTING || s.coach == CoachState.OFFLINE) ->
        "offline"
    !hasTask -> "ready"
    else -> s.hud?.card
  }
}

enum class GlassesDisplayStatus { NONE, ATTACHING, READY, UNAVAILABLE }

class GlassesDisplay(
    private val scope: CoroutineScope,
    private val server: StateFlow<ServerUiState>,
    private val cards: CardImages,
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
              // A task can be started by the button (activeTask) OR by the voice coach (then only
              // the hud tells us), so any hud that isn't "stopped" counts as a running task.
              .map { s ->
                val hasTask = s.activeTask != null || (s.hud != null && s.hud.state != "stopped")
                Card(s.link, hasTask, s.hud, pickCard(s, hasTask))
              }
              .distinctUntilChanged()
              // Each card goes to the glasses over Bluetooth and can take a moment; if newer ones
              // arrive meanwhile, skip straight to the latest so the display never lags behind.
              .conflate()
              .collect { card ->
                target.sendContent { cardContent(card) }.onFailure { error, _ ->
                  Log.w(TAG, "sendContent failed: ${error.description}")
                }
              }
        }
  }

  /**
   * The card layout. One root flexBox per screen (Meta's rule). The designer image when there is
   * one (it already carries the short label), with the step number above and any warning below;
   * otherwise the text card.
   */
  private fun ContentScope.cardContent(card: Card) {
    val hud = card.hud
    val image = cards.get(card.cardId)
    val doingAStep =
        hud != null && card.hasTask && card.link == Link.CONNECTED && card.cardId != "offline" &&
            hud.state !in setOf("finished", "stopped", "diagnosing", "diagnosed")
    when {
      doingAStep -> glanceContent(hud!!, image)
      image != null -> imageCardContent(card, image)
      else -> textCardContent(card)
    }
  }

  /**
   * The glanceable step layout (docs/protocol.md): progress at the top, the designer card in the
   * middle, the short instruction in large text, the tip small, the status line at the bottom.
   * The voice says the long version.
   */
  private fun ContentScope.glanceContent(hud: Hud, image: Bitmap?) {
    flexBox(direction = Direction.COLUMN, gap = 8, padding = 16) {
      val progress =
          listOfNotNull(hud.step?.let { "Step $it" }, if (hud.gate) "Safety" else null).joinToString(" · ")
      if (progress.isNotEmpty()) text(progress, style = TextStyle.META, color = TextColor.SECONDARY)
      image?.let { image(bitmap = it, sizePreset = ImageSize.FILL, flexShrink = 1f) }
      (hud.short ?: hud.title)?.let { text(it, style = TextStyle.HEADING) }
      if (hud.state == "mistake" && hud.warning != null) {
        text("⚠ ${hud.warning}", style = TextStyle.BODY) // a warning replaces the tip
      } else {
        hud.tip?.let { text(it, style = TextStyle.META, color = TextColor.SECONDARY) }
      }
      statusLine(hud)?.let { text(it, style = TextStyle.BODY, color = TextColor.SECONDARY) }
    }
  }

  /** The server's status line, or one derived from the state for older servers. */
  private fun statusLine(hud: Hud): String? =
      hud.status
          ?: when (hud.state) {
            "mistake" -> "⚠ Stop"
            "unsure" -> "? Show me another angle"
            "cant_see" -> "Can't see: more light"
            else -> hud.verified?.let { "✓ $it" }
          }

  /** Cards without a step: ready, offline, diagnosis, job done. Image plus a short caption. */
  private fun ContentScope.imageCardContent(card: Card, image: Bitmap) {
    val hud = card.hud
    flexBox(direction = Direction.COLUMN, gap = 8, padding = 16) {
      image(bitmap = image, sizePreset = ImageSize.FILL, flexShrink = 1f)
      when {
        card.cardId == "offline" || card.cardId == "ready" -> Unit // the card carries its own label
        hud?.state == "diagnosing" || hud?.state == "diagnosed" -> {
          hud.title?.let { text(it, style = TextStyle.HEADING) }
          (hud.status ?: hud.say)?.let { text(it, style = TextStyle.BODY, color = TextColor.SECONDARY) }
        }
        hud != null -> statusLine(hud)?.let { text(it, style = TextStyle.BODY, color = TextColor.SECONDARY) }
      }
    }
  }

  private fun ContentScope.textCardContent(card: Card) {
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
        // Diagnosis (the server works out what's wrong before a procedure starts).
        hud.state == "diagnosing" || hud.state == "diagnosed" -> {
          text("Diagnosis", style = TextStyle.META, color = TextColor.SECONDARY)
          hud.title?.let { text(it, style = TextStyle.HEADING) }
          hud.say?.let { text(it, style = TextStyle.BODY, color = TextColor.SECONDARY) }
        }
        else -> {
          val label =
              listOfNotNull(hud.step?.let { "Step $it" }, if (hud.gate) "Safety" else null)
                  .joinToString(" · ")
          if (label.isNotEmpty()) text(label, style = TextStyle.META, color = TextColor.SECONDARY)
          hud.title?.let { text(it, style = TextStyle.HEADING) }
          when (hud.state) {
            "mistake" -> hud.warning?.let { text("⚠ $it", style = TextStyle.BODY) }
            "unsure" -> text("? ${hud.warning ?: "Show it from another angle"}", style = TextStyle.BODY)
            "cant_see" -> text("Can't see: move closer or add light", style = TextStyle.BODY)
            else -> hud.verified?.let { text("✓ $it", style = TextStyle.BODY, color = TextColor.SECONDARY) }
          }
        }
      }
    }
  }
}
