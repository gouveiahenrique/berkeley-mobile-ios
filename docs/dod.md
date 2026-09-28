# Definition of Done

## Discovery Note

This repository is an Xcode/iOS project, not a Node.js/TypeScript or Python/uv project: no `package.json` or `pyproject.toml` exists at the repository root (verified by direct search). The project's build tooling configuration is therefore the Xcode workspace/project files (`berkeley-mobile.xcworkspace`, `berkeley-mobile.xcodeproj`) rather than an npm/uv script block. The commands below are derived from those files:

- `berkeley-mobile.xcworkspace/contents.xcworkspacedata` references `berkeley-mobile.xcodeproj` and `Pods/Pods.xcodeproj`, confirming the workspace (not the bare `.xcodeproj`) is the correct build entry point, per CocoaPods convention (`README.md` instructs running `pod install`).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` is the only shared scheme found, targeting the `berkeley-mobile` app product.
- No lint configuration (`.swiftlint.yml`, `.swiftlint.yaml`, or equivalent) was found anywhere in the repository (searched, zero matches) — a repository-native lint command was not found in codebase.
- The shared scheme's `<TestAction>` has an empty `<Testables>` list and no test target exists in `berkeley-mobile.xcodeproj/project.pbxproj` — there is no automated test suite to run (see `docs/testing-standards.md`).

Every task is only complete when **all applicable commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required before building; per README.md)
pod install

# Build the app target via the shared workspace scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug -destination "generic/platform=iOS Simulator" build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- **Lint**: no lint command is applicable — no SwiftLint (or equivalent) configuration was found in the repository. If lint tooling is added later, this file should be updated to include its exact invocation.
- **Test**: no test command is applicable — no test target is registered in `berkeley-mobile.xcodeproj/project.pbxproj` and the shared scheme's `<Testables>` list is empty. If a test target is added later, the appropriate command is `xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination "generic/platform=iOS Simulator" test`, but this cannot be run today because there are no testables registered.
- If a command is not applicable for a given change, explain why in the task report — do not silently skip it.
