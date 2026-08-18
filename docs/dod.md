# Definition of Done

## Discovery Note

This repository is an Xcode/CocoaPods iOS project, not a Node.js or Python project — no `package.json` or `pyproject.toml` exists anywhere in the repository (verified by search from the repository root). The canonical Node/uv-script discovery step in the standard DoD template therefore does not apply; the commands below are instead derived from the project's actual build tooling evidence:

- `Podfile` / `Podfile.lock` (CocoaPods dependency management — required before any build).
- `berkeley-mobile.xcworkspace` (the workspace to open/build, required once CocoaPods is used).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` (the shared scheme, product `Berkeley.app`).

Two things a Node/Python-style DoD gate would normally include were searched for and **not found in codebase**:
- **Lint**: no `.swiftlint.yml`, no SwiftLint/SwiftFormat build phase reference, and no linter of any kind was found in `berkeley-mobile.xcodeproj/project.pbxproj` or the repository root.
- **Automated tests**: no test target exists in the project (`berkeley-mobile.xcodeproj/project.pbxproj` defines only an application target and a widget-extension target), and the shared scheme's `TestAction` has an empty `<Testables>` list. See `docs/testing-standards.md`.

Given this, the only verifiable, repository-derived DoD gate is a **successful build** via `xcodebuild`, after installing CocoaPods dependencies.

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required before opening/building the workspace; Podfile.lock is checked in)
pod install

# Build the main app target for the iOS Simulator via the shared scheme
xcodebuild \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'generic/platform=iOS Simulator' \
  build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- **Lint**: not applicable — no lint tool/configuration exists in this repository. If one is introduced in the future, add its exact CLI invocation here.
- **Tests**: not applicable — no test target exists in this repository (`xcodebuild test` cannot run; the scheme's `TestAction` has no testables). If a test target is introduced in the future, add its exact `xcodebuild test` invocation here.
- If a command is not applicable for a given change (e.g. the change only touches `README.md`), explain why in your response rather than silently omitting the build command's output.
