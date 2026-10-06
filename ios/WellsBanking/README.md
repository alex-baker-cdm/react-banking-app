# WellsBanking (iOS)

SwiftUI companion to the online banking web app. Same API, same accounts, same Transfer & Pay flow.

```bash
brew install xcodegen          # once
./run.sh                       # generate project, build for simulator, install + launch
BANKING_API_BASE_URL=https://<app-runner-host> ./run.sh   # point at the hosted API
```

Build only (no simulator):

```bash
xcodegen generate
xcodebuild -project WellsBanking.xcodeproj -target WellsBanking -sdk iphonesimulator -configuration Debug \
  -arch arm64 ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO
```

Use `-target` + `-sdk iphonesimulator` (not `-scheme` + `-destination`) on machines that only have the simulator SDK.
