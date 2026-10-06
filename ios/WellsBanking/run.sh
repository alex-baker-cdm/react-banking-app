#!/usr/bin/env bash
# Build the iOS app for the iPhone simulator, install it on the booted device and launch it.
# Requires Xcode (iOS simulator SDK) and xcodegen (brew install xcodegen). The app talks to the API at
# ApiBaseUrl (Info.plist, default http://localhost:8080) or $BANKING_API_BASE_URL; start the API first from
# the repo root with `npm run build && npm run serve`, or point it at the hosted App Runner URL.
set -euo pipefail
cd "$(dirname "$0")"

DEVICE="${SIM_DEVICE:-iPhone 17}"
BUNDLE_ID="com.demo.banking.wells"

xcodegen generate --quiet
xcodebuild -project WellsBanking.xcodeproj -target WellsBanking -sdk iphonesimulator -configuration Debug \
  -arch arm64 ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO SYMROOT="$PWD/build/Products" build | grep -E "error|BUILD" || true

if ! xcrun simctl list devices booted | grep -q "Booted"; then
  xcrun simctl boot "$DEVICE"
fi
open -a Simulator
xcrun simctl install booted build/Products/Debug-iphonesimulator/WellsBanking.app
if [ -n "${BANKING_API_BASE_URL:-}" ]; then
  SIMCTL_CHILD_BANKING_API_BASE_URL="$BANKING_API_BASE_URL" xcrun simctl launch booted "$BUNDLE_ID"
else
  xcrun simctl launch booted "$BUNDLE_ID"
fi
