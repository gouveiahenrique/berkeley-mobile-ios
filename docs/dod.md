# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is **incomplete**.

---

## Commands

```bash
# 1. Build — compile the app for a simulator destination (no code signing required)
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  CODE_SIGNING_ALLOWED=NO \
  | xcpretty || xcodebuild build \
    -workspace berkeley-mobile.xcworkspace \
    -scheme berkeley-mobile \
    -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
    CODE_SIGNING_ALLOWED=NO

# 2. Test — run the test suite (currently empty; still must exit 0)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  CODE_SIGNING_ALLOWED=NO \
  | xcpretty || xcodebuild test \
    -workspace berkeley-mobile.xcworkspace \
    -scheme berkeley-mobile \
    -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
    CODE_SIGNING_ALLOWED=NO

# 3. Analyze — run Xcode's static analyzer to catch common issues
xcodebuild analyze \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  CODE_SIGNING_ALLOWED=NO \
  | xcpretty || xcodebuild analyze \
    -workspace berkeley-mobile.xcworkspace \
    -scheme berkeley-mobile \
    -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
    CODE_SIGNING_ALLOWED=NO
```

> **Note:** `xcpretty` makes output readable but is optional. If it is not installed, the raw `xcodebuild` output is equally valid — the exit code is what matters.

> **Prerequisite:** `pod install` must have been run after any `Podfile` change, and `GoogleService-Info.plist` must be present at `berkeley-mobile/GoogleService-Info.plist`.

---

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change (e.g., the test step when the test scheme has no test targets configured), explain why in your response — do not silently skip it.
- **Simulator destination:** Adjust `name=iPhone 16,OS=latest` to match a simulator actually installed in your Xcode if the listed simulator is unavailable.

---

## Pre-PR Checklist

In addition to the commands above, verify manually before raising a pull request:

- [ ] The app launches without crash on a fresh simulator install
- [ ] The changed feature works end-to-end on a simulator (golden path + at least one edge case)
- [ ] No new `print()` calls introduced (use `os.Logger` instead)
- [ ] No new hardcoded Firestore collection name strings (declare as `fileprivate let k*` or in `BMConstants`)
- [ ] `Podfile.lock` committed if `Podfile` was changed
- [ ] `Package.resolved` committed if an SPM dependency was added or updated
- [ ] `GoogleService-Info.plist` is **not** staged for commit
