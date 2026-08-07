# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main application target (Debug, simulator)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Build the widget extension target (Debug, simulator)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme BerkeleyMobileWidgetExtension \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

- **Lint**: No lint tooling (SwiftLint, etc.) was found in the repository. There is no lint command to run.
- **Tests**: No test target was found in the project. There is no test command to run.
- **Dependency prerequisite**: CocoaPods dependencies must be installed before building. Run `pod install` if the `Pods/` directory is missing or stale, then open `berkeley-mobile.xcworkspace` (not the `.xcodeproj`).
- **Simulator name**: Adjust the `-destination` device name to match a simulator available in your Xcode installation (`xcrun simctl list devices available`).
- The build configuration discovered from `project.pbxproj`: Swift 5.0, main app deployment target iOS 18.0, widget extension deployment target iOS 17.0, bundle identifier `org.asuc.ASUC`.
