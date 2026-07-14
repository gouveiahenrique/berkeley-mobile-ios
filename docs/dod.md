# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Resolve CocoaPods dependencies (if Podfile or Podfile.lock has changed)
pod install

# Build the app for a simulator (replace <simulator-id> with a valid device UDID or name)
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -configuration Debug

# Run static analysis
xcodebuild analyze \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -configuration Debug

# Run the test suite (the scheme's Testables list is currently empty; this step will report
# "no tests" rather than fail — include it so the gate remains in place for when tests are added)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -configuration Debug
```

## Discovery Notes

- This repository uses **CocoaPods** (`Podfile`, `Podfile.lock`) and **Swift Package Manager** (Xcode-managed). There is no `package.json`, `pyproject.toml`, `Makefile`, or `Fastfile` in the repository root.
- Build commands are invoked via `xcodebuild` against the workspace (`berkeley-mobile.xcworkspace`) using the shared scheme `berkeley-mobile.xcscheme`.
- No dedicated lint script was found. The `xcodebuild analyze` action exercises the Xcode static analyzer, which is the closest equivalent.
- The shared scheme's `<Testables>` block is empty, confirming no test targets are currently wired into the scheme. The test command is included to maintain the gate for future test additions.

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change (e.g., `pod install` when no dependency files changed), explain why — do not silently skip it.
