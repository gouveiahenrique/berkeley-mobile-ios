# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build the main app target (requires Xcode and a connected simulator or device)
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
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

- **Lint**: No lint tool configuration (SwiftLint, `package.json` scripts, or `pyproject.toml`) was found in the repository. If a linter is introduced, add its command here.
- **Tests**: No automated test target was found in the Xcode project. The build command above is the only verifiable gate available in the current repository state.
- **CocoaPods**: The `Pods/` directory is checked in. If dependencies change, run `pod install` before building.
