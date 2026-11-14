// HandymanPanel - Milestone 1 debug panel, shown over the camera preview.
//
// Shows the link to our server, the current procedure step (from "hud"), the watcher's latest
// answer with its certainty (from "decision"), and how many frames have been sent. Milestone 2
// moves the step card onto the glasses display; this panel stays as the developer view.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val PanelBg = Color.Black.copy(alpha = 0.6f)
private val Good = Color(0xFF4ADE80)
private val Warn = Color(0xFFFBBF24)
private val Bad = Color(0xFFF87171)

private fun fpsLabel(fps: Float) = if (fps % 1f == 0f) fps.toInt().toString() else fps.toString()

@Composable
fun HandymanPanel(
    state: ServerUiState,
    isStreaming: Boolean,
    onStartCoach: () -> Unit,
    onStartBottle: () -> Unit,
    onStop: () -> Unit,
    modifier: Modifier = Modifier,
) {
  Column(
      modifier =
          modifier
              .fillMaxWidth()
              .padding(horizontal = 12.dp, vertical = 8.dp)
              .clip(RoundedCornerShape(12.dp))
              .background(PanelBg)
              .padding(12.dp),
      verticalArrangement = Arrangement.spacedBy(6.dp),
  ) {
    // Link status + frame counter
    Row(verticalAlignment = Alignment.CenterVertically) {
      val (color, label) =
          when (state.link) {
            Link.CONNECTED -> Good to "Server connected"
            Link.CONNECTING -> Warn to "Connecting…"
            Link.OFFLINE -> (if (state.activeTask != null) Bad else Color.Gray) to "Server offline"
          }
      Box(Modifier.size(10.dp).clip(CircleShape).background(color))
      Spacer(Modifier.width(8.dp))
      Text(label, color = Color.White, fontSize = 13.sp)
      Spacer(Modifier.weight(1f))
      Text(
          if (isStreaming) "frames: ${state.framesSent} · ${fpsLabel(state.captureFps)} fps" else "start Preview to send frames",
          color = Color.White.copy(alpha = 0.7f),
          fontSize = 12.sp,
      )
    }

    // Current step (hud)
    val hud = state.hud
    when {
      hud == null && state.activeTask != null ->
          Text("Waiting for the first step…", color = Color.White, fontSize = 14.sp)
      hud != null && hud.state == "finished" ->
          Text("✓ ${hud.task ?: "Task"}: all done!", color = Good, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
      hud != null -> {
        hud.task?.let { Text(it, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp) }
        Text(
            listOfNotNull(hud.step, hud.title).joinToString(" · ") + if (hud.gate) "  🛡 safety step" else "",
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
        )
        hud.verified?.let { Text("✓ $it", color = Good, fontSize = 13.sp) }
        if (hud.state == "mistake") hud.warning?.let { Text("⚠ $it", color = Bad, fontSize = 14.sp, fontWeight = FontWeight.SemiBold) }
        if (hud.state == "unsure") Text("? ${hud.warning ?: "Show it from another angle"}", color = Warn, fontSize = 13.sp)
        if (hud.state == "cant_see") Text("Can't see clearly: move closer or add light", color = Warn, fontSize = 13.sp)
        hud.say?.let { Text(it, color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp) }
      }
    }

    // Watcher's latest answer + certainty (same thresholds as docs/protocol.md)
    state.watcherAnswer?.let { answer ->
      val c = state.watcherConfidence
      val (sure, color) =
          when {
            c == null -> "" to Color.White
            c >= 0.75f -> "very sure" to Good
            c >= 0.6f -> "fairly sure" to Warn
            else -> "not sure, show another angle" to Bad
          }
      Text(
          "Sees: $answer" + (c?.let { " · ${(it * 100).toInt()}% $sure" } ?: "") +
              (state.watcherMs?.let { " · ${it} ms" } ?: ""),
          color = color,
          fontSize = 13.sp,
      )
    }

    // Milestone 3: the conversation with the coach
    if (state.coach != CoachState.OFF) {
      val (color, label) =
          when (state.coach) {
            CoachState.LIVE -> Good to "Coach listening"
            CoachState.CONNECTING -> Warn to "Coach connecting…"
            CoachState.RECONNECTING -> Warn to "Connection lost. Reconnecting… (progress kept)"
            CoachState.OFFLINE -> Bad to "Can't reach the coach"
            CoachState.OFF -> Color.Gray to ""
          }
      Text("● $label", color = color, fontSize = 13.sp)
      state.userLine?.let { Text("You: $it", color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp) }
      state.coachLine?.let { Text("Coach: $it", color = Color.White, fontSize = 14.sp) }
    }

    state.lastError?.let { Text(it, color = Bad, fontSize = 12.sp) }

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
      if (state.activeTask == null && state.coach == CoachState.OFF) {
        Button(
            onClick = onStartCoach,
            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
        ) {
          Text("Talk to the coach")
        }
        OutlinedButton(onClick = onStartBottle) { Text("Bottle practice (no voice)", color = Color.White) }
      } else {
        OutlinedButton(onClick = onStop) { Text("Stop", color = Color.White) }
      }
    }
  }
}
