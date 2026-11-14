// GlassesPreview - a small live view of the simulated glasses display, on the phone screen.
//
// Uses MockDisplayKit's own preview renderer, so it shows exactly what sendContent() put on the
// (mock) Ray-Ban Display. Only present while mock Display glasses are paired and the display is
// ready. Also shows how to open the same view in Chrome on the laptop.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@SuppressLint("JetpackComposeAndroidView")
@Composable
fun GlassesPreview(displayStatus: GlassesDisplayStatus, modifier: Modifier = Modifier) {
  val glasses by MockPreview.glasses.collectAsStateWithLifecycle()
  val chromeUrl by MockPreview.chromeUrl.collectAsStateWithLifecycle()
  val mock = glasses ?: return // real glasses (or no mock): nothing to preview on the phone

  Column(modifier = modifier.width(180.dp)) {
    Text(
        "Glasses display (simulated)",
        color = Color.White.copy(alpha = 0.8f),
        fontSize = 11.sp,
        modifier = Modifier.padding(bottom = 4.dp),
    )
    if (displayStatus == GlassesDisplayStatus.READY) {
      key(mock) {
        AndroidView(
            factory = { context -> mock.services.display.createPreviewView(context) },
            modifier =
                Modifier.size(180.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.Black)
                    .border(1.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
        )
      }
    } else {
      Text(
          when (displayStatus) {
            GlassesDisplayStatus.ATTACHING -> "Connecting the display…"
            GlassesDisplayStatus.UNAVAILABLE -> "These glasses have no display"
            else -> "Start a session to show the display"
          },
          color = Color.White.copy(alpha = 0.7f),
          fontSize = 12.sp,
      )
    }
    chromeUrl?.let { url ->
      Text(
          "Chrome: adb forward tcp:${MockPreview.CHROME_PREVIEW_PORT} tcp:${MockPreview.CHROME_PREVIEW_PORT}, then open $url",
          color = Color.White.copy(alpha = 0.6f),
          fontSize = 10.sp,
          modifier = Modifier.padding(top = 4.dp),
      )
    }
  }
}
