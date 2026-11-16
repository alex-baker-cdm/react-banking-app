#!/usr/bin/env bash
# Build the debug APK, install it on the running Android emulator (or connected device) and launch it.
# The app talks to the API at $BANKING_API_BASE_URL (default http://10.0.2.2:8080 = the host machine from the
# emulator). Start the API first from the repo root with `npm run build && npm run serve`, or point the app at the
# hosted App Runner URL: BANKING_API_BASE_URL=https://<app-runner-host> ./run.sh
set -euo pipefail
cd "$(dirname "$0")"

APP_ID="com.demo.banking.wells"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/android-sdk}}"
export ANDROID_HOME="$SDK"
ADB="$SDK/platform-tools/adb"
[ -x "$ADB" ] || ADB="$(command -v adb)"

if [ ! -f local.properties ]; then
  echo "sdk.dir=$SDK" > local.properties
fi

./gradlew assembleDebug --console=plain -q

if ! "$ADB" get-state >/dev/null 2>&1; then
  echo "No emulator/device attached. Boot one first, e.g.:" >&2
  echo "  $SDK/emulator/emulator -avd Pixel8 -no-window -no-audio -gpu swiftshader_indirect &" >&2
  exit 1
fi
"$ADB" wait-for-device
"$ADB" install -r app/build/outputs/apk/debug/app-debug.apk
"$ADB" shell am start -n "$APP_ID/.MainActivity"
