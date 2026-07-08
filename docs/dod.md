# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# This repository is an iOS/Xcode project managed by CocoaPods.
# It does not contain a package.json or pyproject.toml.
# Build, lint, and test commands are executed via xcodebuild.

# Install dependencies (required before building)
pod install

# Build the main application target
xcodebuild -workspace berkeley-mobile.xcworkspace \
           -scheme berkeley-mobile \
           -sdk iphonesimulator \
           -destination 'platform=iOS Simulator,name=iPhone 16' \
           build

# Build the widget extension target
xcodebuild -workspace berkeley-mobile.xcworkspace \
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

- No `test` or `lint` scripts were found in the repository. The project does not contain a `package.json`, `pyproject.toml`, or a test target in the inspected configuration. The DoD gate therefore consists of build verification only.
- The Xcode scheme name and simulator destination may need to be adjusted to match the available simulators on the build machine. Run `xcrun simctl list devices available` to confirm available simulator names.
