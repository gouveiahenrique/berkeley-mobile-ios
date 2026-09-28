# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
pod install
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Notes (repository evidence)

- This is an Xcode/CocoaPods iOS project, not a Node.js or Python project — there is no `package.json` or `pyproject.toml`, so the commands above are derived from `Podfile` and `berkeley-mobile.xcodeproj`/`berkeley-mobile.xcworkspace` instead.
- No lint command is included: no SwiftLint/SwiftFormat configuration file was found in the repository (see `docs/code-conventions.md`).
- No test command is included: the shared scheme's `TestAction` has an empty `<Testables>` block and no test target or test files exist in the repository (see `docs/testing-standards.md`).
