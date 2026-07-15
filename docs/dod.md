# Definition of Done

## Discovery

This is an iOS/Swift project managed with Xcode, CocoaPods, and Swift Package Manager. It does not have a `package.json` or `pyproject.toml`. There are no `Makefile` targets, shell scripts, or CI configuration files found in the repository that define lint, test, or build commands.

No automated test suite was found in the inspected repository areas (see `docs/testing-standards.md`).

## Commands

The standard iOS build and validation gates are performed through Xcode tooling:

```bash
# Install CocoaPods dependencies (required before building)
pod install

# Build the workspace for a simulator destination
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Build the widget extension
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme BerkeleyMobileWidgetExtension \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- The test command is not applicable: no test target was found in the repository. If a test target is added in the future, `xcodebuild test` should be added to this list.
- The lint command is not applicable: no SwiftLint configuration (`.swiftlint.yml`) or linting run script phase was found in the inspected repository areas.
