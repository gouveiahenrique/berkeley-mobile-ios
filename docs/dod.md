# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required after Podfile changes)
pod install

# Build the main application target (Debug configuration)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Build the widget extension target
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build-for-testing
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

- This repository uses Xcode and CocoaPods as its build toolchain. There is no `package.json`, `pyproject.toml`, Makefile, or SwiftLint configuration file at the repository root. No lint or automated test commands were found in the inspected build configuration.
- The Xcode scheme (`berkeley-mobile.xcscheme`) defines no test targets — the `<Testables>` block is empty.
- The `pod install` step is only required when `Podfile` or `Podfile.lock` has changed; it can be skipped for source-only changes.
- A valid `GoogleService-Info.plist` (not committed) is required to build successfully against Firebase.
