# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main app target (requires Xcode and an iOS simulator or device)
xcodebuild -workspace berkeley-mobile.xcworkspace \
           -scheme berkeley-mobile \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           clean build \
           | xcpretty

# Build the widget extension target
xcodebuild -workspace berkeley-mobile.xcworkspace \
           -scheme berkeley-mobile \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           -only-testing BerkeleyMobileWidgetExtension \
           build \
           | xcpretty
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

- This is a native iOS project managed with CocoaPods. There is no `package.json` and no `pyproject.toml`.
- No lint script (SwiftLint or equivalent) was found configured in the repository. If a linter is added in the future, include its invocation here.
- No test target was found in the repository. If a test target is added, include `xcodebuild test` here.
- `xcpretty` is optional formatting; replace with `| tee build.log` if not installed.
- The simulator device name may need to match an available simulator on the build machine (`xcrun simctl list devices`).
