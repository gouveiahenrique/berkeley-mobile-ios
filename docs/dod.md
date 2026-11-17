<!-- steering-agent-last-run: 2026-11-17 21:29 UTC -->
# Definition of Done

Every task is only complete when all commands below pass with zero errors.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is incomplete.

## Commands

```bash
# Lint: not found in codebase (no SwiftLint or other lint configuration/scripts discovered)

# Tests: not found in codebase (no test targets; shared scheme has no TestableReference)

# Build (workspace and scheme from repository; requires Xcode and `pod install`)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -sdk iphonesimulator -configuration Debug build
```

## Rules
- Run all commands even if an earlier one fails.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why.
