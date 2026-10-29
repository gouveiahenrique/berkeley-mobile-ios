<!-- steering-agent-last-run: 2026-10-29 13:05 UTC -->
# Definition of Done

Every task is only complete when all commands below pass with zero errors.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is incomplete.

## Commands

```bash
# Lint: Not found in codebase (no lint script or linter config discovered; no package.json/pyproject.toml)

# Tests: Not found in codebase (shared scheme has no Testables). The scheme-level test command is:
xcodebuild test -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'platform=iOS Simulator,name=iPhone 15'

# Build (workspace and scheme exist in the repository; Pods must be installed first):
pod install
xcodebuild build -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator'
```

Note: these `xcodebuild` commands are derived from the workspace/scheme names present in the repository, not from a script defined in the repository. The simulator name in the test command is a placeholder to adjust. Building also requires `berkeley-mobile/GoogleService-Info.plist`, which `README.md` says is not included.

## Rules

- Run all commands even if an earlier one fails.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why.
