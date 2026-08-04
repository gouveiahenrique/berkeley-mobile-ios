# Definition of Done

Every task is only complete when **all checks below pass with zero errors**.

Before marking any task complete, run each step in order, wait for it to finish, and confirm the outcome. A task without this verification is **incomplete**.

---

## Prerequisites

This is a native iOS project. There is no `package.json`, no `Makefile`, and no command-line lint or test runner configured in the repository. All build and validation steps require **Xcode** (version 16+ recommended for iOS 18 deployment target).

You must have:
- Xcode 16+ installed
- CocoaPods 1.16.2+ installed (`gem install cocoapods`)
- `berkeley-mobile/GoogleService-Info.plist` present (not in repo — obtain separately)
- `berkeley-mobile/Secrets.swift` present (not in repo — obtain separately)

---

## Commands

### Step 1 — Install dependencies (first time or after Podfile changes)

```bash
cd /path/to/berkeley-mobile-ios
pod install
```

Expected: "Pod installation complete!" with no errors.

### Step 2 — Build (main app target)

```bash
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'generic/platform=iOS' \
  -configuration Debug \
  | xcpretty || xcodebuild build \
    -workspace berkeley-mobile.xcworkspace \
    -scheme berkeley-mobile \
    -destination 'generic/platform=iOS' \
    -configuration Debug
```

Or in Xcode: `Cmd + B` (Product → Build).

Expected: `BUILD SUCCEEDED` with zero errors. Warnings are acceptable but should not increase.

### Step 3 — Build (widget extension target)

```bash
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme BerkeleyMobileWidgetExtension \
  -destination 'generic/platform=iOS' \
  -configuration Debug
```

Or in Xcode: select the `BerkeleyMobileWidgetExtension` scheme and `Cmd + B`.

Expected: `BUILD SUCCEEDED` with zero errors.

### Step 4 — Run on simulator (manual verification)

```bash
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0' \
  -configuration Debug
```

Then launch the app in the simulator and verify:
- App launches without crash
- The changed feature works end-to-end (golden path)
- No regression in unrelated tabs (Home, Today, Safety, Resources)
- Xcode console shows no `Logger.error` or `Logger.fault` output related to your change

### Step 5 — Tests (when a test target exists)

```bash
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0'
```

Expected: `TEST SUCCEEDED` with zero failures.

> **Note:** There is currently no test target in the repository. This step is a no-op until tests are added. If you add a test target, this step becomes mandatory.

---

## Rules

- Run all steps even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any build error.
- Fix the root cause and re-run from Step 1 until all steps succeed.
- If a step is not applicable (e.g., Step 5 before tests exist), state that explicitly — do not silently skip it.
- A build that succeeds only in `Debug` configuration is acceptable for most PRs; `Release` builds should be verified for App Store submissions.
- Never commit `GoogleService-Info.plist` or `Secrets.swift` — they are gitignored for security reasons.
