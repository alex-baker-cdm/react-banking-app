# WellsBanking (Android)

Jetpack Compose companion to the online banking web app, with feature parity to `ios/WellsBanking`. Same API, same
accounts, same Transfer & Pay flow (including the "Pay minimum due" quick action on credit card and loan accounts).

Stack: Kotlin 2.0.21, AGP 8.7.3, Gradle 8.13 (wrapper committed), Compose BOM 2024.12.01 / Material 3,
kotlinx.serialization, OkHttp. `minSdk 26`, `compileSdk`/`targetSdk 35`. Application id `com.demo.banking.wells`.

## Build and run

```bash
# once: JDK 17 + Android SDK (cmdline-tools, platform-tools, platforms;android-35, build-tools;35.0.0)
export ANDROID_HOME=$HOME/android-sdk      # or wherever the SDK lives; also written to local.properties by run.sh

./run.sh                                   # assembleDebug, adb install -r, launch on the running emulator/device
BANKING_API_BASE_URL=https://<app-runner-host> ./run.sh   # point at the hosted API
```

Build only:

```bash
./gradlew assembleDebug                    # app/build/outputs/apk/debug/app-debug.apk
```

## Pointing at another API

The base URL is compiled into `BuildConfig.API_BASE_URL`, resolved in this order:

1. `BANKING_API_BASE_URL` environment variable at build time
2. Gradle property `BANKING_API_BASE_URL` (`gradle.properties`, or `-PBANKING_API_BASE_URL=...`)
3. default `http://10.0.2.2:8080` (the emulator's alias for the host, where `npm run serve` listens)

Rebuild after changing it. Cleartext HTTP is only permitted for `10.0.2.2`/`localhost` (`res/xml/network_security_config.xml`) so the local default works; any other host must be HTTPS.

## Emulator (headless Linux)

```bash
sdkmanager "platform-tools" "emulator" "platforms;android-35" "build-tools;35.0.0" "system-images;android-35;google_apis;x86_64"
avdmanager create avd -n Pixel8 -k "system-images;android-35;google_apis;x86_64" -d pixel_7
emulator -avd Pixel8 -no-window -no-audio -no-snapshot -gpu swiftshader_indirect &
adb wait-for-device shell 'while [ "$(getprop sys.boot_completed)" != 1 ]; do sleep 2; done'
```

## Gotchas

- `avdmanager` has no `pixel_8` device profile; use `-d pixel_7` (or `-d pixel`).
- `/dev/kvm` must be accessible to your user (`sudo chmod 666 /dev/kvm` or add yourself to the `kvm` group);
  without it add `-no-accel` and expect a very slow boot.
- Maven Central (`repo.maven.apache.org`) rate-limits some networks with HTTP 429; `settings.gradle.kts` lists the
  Google-hosted mirror first so dependency resolution still works.
- Gradle 9 / newer JDKs are not compatible with AGP 8.7 - use the committed wrapper and JDK 17.
- Transfers **to** the credit card currently return a 500 from the API (known production bug, tracked separately).
  The app shows the error banner with the Reference ID, which is the expected behaviour.
