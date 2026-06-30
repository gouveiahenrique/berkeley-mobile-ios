# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# This is a native iOS project managed with Xcode and CocoaPods.
# There is no package.json, pyproject.toml, or equivalent script runner.
#
# Build the project (requires Xcode and a configured simulator or device):
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build

# Run tests (no test target was found in the examined codebase;
# if a test target is added, replace 'test' below with the target name):
# xcodebuild \
#   -workspace berkeley-mobile.xcworkspace \
#   -scheme berkeley-mobile \
#   -sdk iphonesimulator \
#   -destination 'platform=iOS Simulator,name=iPhone 16' \
#   test
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes

- No lint script (`SwiftLint` or equivalent) was found in the examined repository configuration. If a linting tool is added to the Xcode build phases or a `.swiftlint.yml` is introduced, add the corresponding command here.
- No automated test target was found in the inspected repository areas. The test command above is commented out. If a test target is added, uncomment and configure it.
- The `berkeley-mobile.xcworkspace` must be used (not `berkeley-mobile.xcodeproj`) because CocoaPods generates the workspace.
- CocoaPods dependencies must be installed (`pod install`) before building if the `Pods/` directory is absent or out of date.
