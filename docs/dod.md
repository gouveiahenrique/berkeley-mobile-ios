<!-- steering-agent-last-run: 2026-10-21 13:37 UTC -->
# Definition of Done

Every task is only complete when all commands below pass with zero errors.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is incomplete.

## Commands

```bash
# Lint: Not found in codebase (no SwiftLint or other lint configuration or script discovered)

# Tests: Not found in codebase (no test target; shared scheme has empty <Testables>)

# Build (workspace and scheme from berkeley-mobile.xcworkspace / shared scheme "berkeley-mobile"; requires macOS with Xcode and `pod install`)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

Note: the build command is composed from the workspace and scheme names found in the repository; it is not a script defined by the repository. `xcodebuild` is not available in the Linux environment this document was generated in, so the command was not executed.

## Rules

- Run all commands even if an earlier one fails.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why.
