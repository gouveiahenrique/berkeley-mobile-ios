<!-- steering-agent-last-run: 2026-10-21 16:32 UTC -->
# Definition of Done

Every task is only complete when all commands below pass with zero errors.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is incomplete.

## Commands

```bash
# Lint: no linter configuration (e.g. .swiftlint.yml) found in the repository.
# Tests: no test target exists (scheme has empty <Testables>); no test command is defined.
# Build (workspace: berkeley-mobile.xcworkspace, scheme: berkeley-mobile, product: Berkeley.app):
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

The build command is composed from the files present (`berkeley-mobile.xcworkspace`, shared scheme `berkeley-mobile`); the repository does not define it in a script or CI config. `pod install` (per `README.md`) is a prerequisite.

## Rules
- Run all commands even if an earlier one fails.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why.
