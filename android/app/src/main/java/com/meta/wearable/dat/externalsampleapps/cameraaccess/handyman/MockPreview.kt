// MockPreview - lets us SEE the simulated glasses display while developing.
//
// When the debug menu pairs mock Ray-Ban Display glasses, it registers them here. Then:
//  - the camera screen shows an in-app preview of the glasses display (MockDisplayKit preview view)
//  - a small preview server runs on the phone (port 9000) for Meta's Chrome extension:
//      adb forward tcp:9000 tcp:9000   →   open http://127.0.0.1:9000/ in Chrome on the laptop
// Real glasses never go through here.

package com.meta.wearable.dat.externalsampleapps.cameraaccess.handyman

import android.content.Context
import android.util.Log
import com.meta.wearable.dat.mockdevice.MockDeviceKit
import com.meta.wearable.dat.mockdevice.api.MockGlasses
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object MockPreview {
  private const val TAG = "Handyman:MockPreview"
  const val CHROME_PREVIEW_PORT = 9000

  private val _glasses = MutableStateFlow<MockGlasses?>(null)
  /** The paired mock Display glasses, or null (no mock, or real glasses). */
  val glasses: StateFlow<MockGlasses?> = _glasses.asStateFlow()

  private val _chromeUrl = MutableStateFlow<String?>(null)
  /** Set while the Chrome preview server runs. */
  val chromeUrl: StateFlow<String?> = _chromeUrl.asStateFlow()

  fun onPaired(context: Context, glasses: MockGlasses) {
    _glasses.value = glasses
    MockDeviceKit.getInstance(context.applicationContext)
        .startTestServer(CHROME_PREVIEW_PORT)
        .fold(
            onSuccess = { port -> _chromeUrl.value = "http://127.0.0.1:$port/" },
            onFailure = { error, _ -> Log.w(TAG, "Chrome preview server didn't start: $error") },
        )
  }

  fun onUnpaired(context: Context, glasses: MockGlasses?) {
    if (glasses != null && glasses != _glasses.value) return
    _glasses.value = null
    _chromeUrl.value = null
    runCatching { MockDeviceKit.getInstance(context.applicationContext).stopTestServer() }
  }
}
