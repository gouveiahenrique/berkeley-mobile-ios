# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the app (requires Xcode and CocoaPods; run from the repository root)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Analyze the app for static issues
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  analyze
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

- **Lint**: No linting tooling configuration (SwiftLint, SwiftFormat, or similar) was found in the repository. The `analyze` action above invokes the Xcode static analyzer as the observed substitute.
- **Tests**: The Xcode scheme's `<Testables>` section is empty and no test target was found. The `xcodebuild test` action is not applicable until a test target is added.
- **CocoaPods**: Run `pod install` before building if the `Pods/` directory is absent or `Podfile.lock` has changed.
- **Simulator name**: Adjust the `-destination` simulator name to match an available simulator on the build machine (`xcrun simctl list devices available`).
