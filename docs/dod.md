# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# 1. Build — compile the app for simulator (catches type errors, missing symbols, import failures)
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  | xcpretty || xcodebuild build \
    -workspace berkeley-mobile.xcworkspace \
    -scheme berkeley-mobile \
    -destination 'platform=iOS Simulator,name=iPhone 16'

# 2. Analyze — run Xcode's static analyzer (catches retain cycles, nil dereferences, unreachable code)
xcodebuild analyze \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16'

# 3. Test — run the unit test suite (once a test target exists)
#    Currently no test target is configured. Skip this step and note the reason.
#    When a test target is added, use:
# xcodebuild test \
#   -workspace berkeley-mobile.xcworkspace \
#   -scheme berkeley-mobile \
#   -destination 'platform=iOS Simulator,name=iPhone 16'
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change (e.g., test step while no test target exists), explain why in your response — do not silently skip it.
- Always open `berkeley-mobile.xcworkspace` — never `berkeley-mobile.xcodeproj` — because CocoaPods integration requires the workspace.
- `GoogleService-Info.plist` must be present (obtained from the team) for any build that touches Firebase; the build will fail at link time without it.

## Notes

- **No linter is configured.** SwiftLint is not present in this project. Code style is enforced by convention (see `docs/code-conventions.md`) and PR review.
- **No formatter is configured.** Run Xcode's built-in re-indent (Ctrl+I on selection) before committing.
- **No test target exists** as of 2026-07-31. The "Test" step above is a stub for when tests are added. Until then, manual smoke-testing in the iOS Simulator (golden path for each affected tab) replaces automated tests.
