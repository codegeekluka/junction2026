// FrameGrabber - turns the live preview into one JPEG for the server.
//
// The glasses stream compressed HEVC video, which Meta's sample already decodes onto the preview
// Surface. Rather than decoding a second time, we copy the decoded picture off that Surface with
// PixelCopy (scaled straight to the target width), then JPEG-encode it. Called at the rate the
// server asks for (0.5–2 fps) and on every "snap".

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.graphics.Bitmap
import android.os.Handler
import android.os.HandlerThread
import android.util.Base64
import android.view.PixelCopy
import android.view.Surface
import java.io.ByteArrayOutputStream
import kotlin.coroutines.resume
import kotlinx.coroutines.suspendCancellableCoroutine

object FrameGrabber {
  const val TARGET_WIDTH = 640 // docs/protocol.md: ~640 px wide (less upload on bad Wi-Fi)
  private const val JPEG_QUALITY = 60 // ≈ 25–35 KB per frame

  private val copyThread = HandlerThread("Handyman:PixelCopy").apply { start() }
  private val copyHandler = Handler(copyThread.looper)

  /**
   * Copies the current picture on [surface] (a stream of [sourceWidth]×[sourceHeight]) and returns
   * it as a base64 JPEG, or null if there's nothing to copy yet.
   */
  suspend fun grabJpegBase64(surface: Surface, sourceWidth: Int, sourceHeight: Int): String? {
    if (!surface.isValid || sourceWidth <= 0 || sourceHeight <= 0) return null
    val height = (TARGET_WIDTH.toLong() * sourceHeight / sourceWidth).toInt().coerceAtLeast(1)
    val bitmap = Bitmap.createBitmap(TARGET_WIDTH, height, Bitmap.Config.ARGB_8888)
    val copied =
        suspendCancellableCoroutine { cont ->
          try {
            PixelCopy.request(
                surface,
                bitmap,
                { result -> if (cont.isActive) cont.resume(result == PixelCopy.SUCCESS) },
                copyHandler,
            )
          } catch (e: IllegalArgumentException) {
            // The Surface was released between the check and the copy.
            if (cont.isActive) cont.resume(false)
          }
        }
    if (!copied) {
      bitmap.recycle()
      return null
    }
    val out = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, out)
    bitmap.recycle()
    return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
  }
}
