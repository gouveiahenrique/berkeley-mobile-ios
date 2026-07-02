# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main application target using the Xcode workspace
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Build the widget extension target
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme BerkeleyMobileWidgetExtension \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

- This repository has no `package.json`, `pyproject.toml`, `Makefile`, `Fastfile`, or SwiftLint configuration file in the inspected repository areas. No `lint` or `test` scripts were found in any build tooling configuration.
- No automated test targets were found in the inspected repository areas. If an Xcode test scheme exists, add `xcodebuild test -scheme <TestSchemeName> ...` as an additional required command.
- The workspace file (`berkeley-mobile.xcworkspace`) must be used instead of the `.xcodeproj` because CocoaPods integrates via the workspace.
- The simulator destination may need to be adjusted to match the Xcode version and available runtimes on the build machine.
