# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is **incomplete**.

---

## Commands

```bash
# 1. BUILD — Compile the app for the simulator (catches type errors, missing symbols, Swift syntax errors)
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  | xcpretty || xcodebuild build \
    -workspace berkeley-mobile.xcworkspace \
    -scheme berkeley-mobile \
    -sdk iphonesimulator \
    -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'

# 2. ANALYZE — Run Xcode static analyzer to catch common bugs (retain cycles, nil dereferences, etc.)
xcodebuild analyze \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'

# 3. TEST — Run the unit test suite (when a test target exists)
#    Currently no test target exists; skip this step until berkeley-mobileTests is added.
#    Once added, run:
# xcodebuild test \
#   -workspace berkeley-mobile.xcworkspace \
#   -scheme berkeley-mobile \
#   -sdk iphonesimulator \
#   -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

---

## Simplified Local Build (inside Xcode)

When working interactively in Xcode, the equivalent gates are:

| Gate | Xcode action |
|------|-------------|
| Build | ⌘+B (Build) — must produce **0 errors** |
| Analyze | Product → Analyze — must produce **0 issues** |
| Test | ⌘+U (Test) — must produce **0 failures** (once test target exists) |

---

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change (e.g., no test target yet), explain why in your response — do not silently skip it.
- A build warning that was pre-existing and unrelated to the change does **not** block completion, but newly introduced warnings must be resolved.
- The Analyze step must show **no new issues** introduced by the change.

---

## Notes

- **CocoaPods must be installed** and `pod install` run after any `Podfile` change. Open `berkeley-mobile.xcworkspace`, not `berkeley-mobile.xcodeproj`.
- **`xcpretty`** is optional but improves readability (`gem install xcpretty`). The fallback raw `xcodebuild` output is equally valid.
- **Simulator name** may differ on your machine. List available simulators with: `xcrun simctl list devices available`
- **No CI pipeline is currently configured.** Until one is added, these commands serve as the local DoD gate.
