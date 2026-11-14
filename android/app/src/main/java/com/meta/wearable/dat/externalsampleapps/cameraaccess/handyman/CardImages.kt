// CardImages - the designers' glasses display cards, bundled in the app.
//
// The PNGs in design/glasses-ui/png ("12-step-2-bucket.png", 1200×1200, transparent) are packed as
// app assets (see app/build.gradle.kts). The server names a card by id in every hud ("card":
// "step-2-bucket"); this maps the id to its file and decodes it at display size (600×600 on the
// Ray-Ban Display), caching each one.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import java.util.concurrent.ConcurrentHashMap

class CardImages(context: Context) {
  companion object {
    private const val TAG = "Handyman:Cards"
    private const val DISPLAY_SIZE = 600 // the Ray-Ban Display is 600×600
  }

  private val assets = context.applicationContext.assets

  // "step-2-bucket" → "12-step-2-bucket.png"
  private val files: Map<String, String> =
      runCatching { assets.list("").orEmpty() }
          .getOrDefault(emptyArray())
          .filter { it.endsWith(".png") && it.first().isDigit() }
          .associateBy { it.substringAfter('-').removeSuffix(".png") }
          .also { Log.d(TAG, "${it.size} designer cards bundled") }

  private val cache = ConcurrentHashMap<String, Bitmap>()

  /** The card's bitmap at display size, or null if the app has no such card. */
  fun get(cardId: String?): Bitmap? {
    if (cardId == null) return null
    cache[cardId]?.let { return it }
    val file = files[cardId] ?: return null
    return runCatching {
          assets.open(file).use { input ->
            val decoded = BitmapFactory.decodeStream(input) ?: return@use null
            if (decoded.width == DISPLAY_SIZE) decoded
            else Bitmap.createScaledBitmap(decoded, DISPLAY_SIZE, DISPLAY_SIZE * decoded.height / decoded.width, true)
                .also { decoded.recycle() }
          }
        }
        .onFailure { Log.w(TAG, "Couldn't load card $cardId: ${it.message}") }
        .getOrNull()
        ?.also { cache[cardId] = it }
  }
}
