<!-- steering-agent-last-run: 2026-11-18 18:30 UTC -->
# Definition of Done

Every task is only complete when all commands below pass with zero errors.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is incomplete.

## Commands

```bash
# Lint: Not found in codebase (no package.json, pyproject.toml, or linter config; Swift/Xcode project)
# Tests: Not found in codebase (no test targets in berkeley-mobile.xcodeproj)
# Build (derived from berkeley-mobile.xcworkspace and the shared scheme "berkeley-mobile"; requires `pod install` and an Xcode toolchain):
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

## Rules
- Run all commands even if an earlier one fails.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why.

Note: the build command is constructed from the workspace and scheme names found in the repository; it is not defined in a script. `xcodebuild` was not available in the environment that generated this document, so the command was not executed.
