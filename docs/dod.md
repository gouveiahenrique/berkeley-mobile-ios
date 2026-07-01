# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main app target (Release configuration)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  build

# Build the widget extension target
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme BerkeleyMobileWidgetExtension \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

This repository has no `package.json`, `pyproject.toml`, or `Makefile`. The build tooling is Xcode
with CocoaPods. No lint script (e.g., SwiftLint) configuration file was found in the repository root.
No automated test target was found in the inspected repository areas.

The scheme names (`berkeley-mobile`, `BerkeleyMobileWidgetExtension`) are derived from the
`.xcworkspace` and `Podfile` target names. Verify the exact scheme names available with:

```bash
xcodebuild -workspace berkeley-mobile.xcworkspace -list
```
