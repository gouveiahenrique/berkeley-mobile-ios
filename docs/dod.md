# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install / update CocoaPods dependencies (required after Podfile changes)
pod install

# Build the workspace for a simulator destination (replace <sim-id> with a valid
# simulator UDID from `xcrun simctl list devices`).
# The scheme name is "berkeley-mobile" and the workspace is berkeley-mobile.xcworkspace.
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  | xcpretty
```

> **Note on tests:** No automated test target is configured in the shared Xcode scheme (`<Testables>` is empty in `berkeley-mobile.xcscheme`) and no test files were found in the repository. The `xcodebuild test` command is not applicable at this time. If a test target is added in the future, add `xcodebuild test` with the same workspace/scheme/destination flags above.

> **Note on linting:** No lint tool configuration (SwiftLint, SwiftFormat, etc.) was found in the repository. If a linter is added, add its invocation command here.

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change (e.g., `pod install` when `Podfile` was not modified), explain why — do not silently skip it.
