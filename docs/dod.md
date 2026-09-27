# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Notes

This repository is a Swift/iOS project (no `package.json` or `pyproject.toml` is present). Build
tooling configuration was read directly from `berkeley-mobile.xcodeproj/project.pbxproj` and the
shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`:

- **Build**: the project has two native targets (`berkeley-mobile`, `BerkeleyMobileWidgetExtension`)
  and uses CocoaPods (`Podfile`/`Podfile.lock`), so building requires the `.xcworkspace`, not the
  `.xcodeproj`, directly. `defaultConfigurationName = Release` for all targets.
- **Lint**: no `.swiftlint.yml`, `.swiftformat`, or lint-related build phase script was found in
  this repository.
- **Test**: the shared scheme's `<TestAction>` has an empty `<Testables>` block, and no target of
  product type `com.apple.product-type.bundle.unit-test` exists in the project. There is no test
  target to run.

## Commands

```bash
# Install CocoaPods dependencies (required before building; Podfile.lock is checked in)
pod install

# Build the app for the iOS Simulator using the checked-in scheme
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination 'generic/platform=iOS Simulator'
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Explicitly Not Included

- **Lint command**: not included. No lint tool (SwiftLint, SwiftFormat, or equivalent) is
  configured anywhere in this repository as of this analysis. Do not silently assume linting is
  being enforced elsewhere.
- **Test command**: not included. No unit or UI test target exists in
  `berkeley-mobile.xcodeproj`, and the shared scheme's test action has no testables configured.
  See `docs/testing-standards.md` for the full evidence trail. If a task adds a test target and
  test files, this file should be updated to include the corresponding
  `xcodebuild test -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination '...'`
  command.
