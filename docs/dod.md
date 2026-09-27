# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Notes

This repository is an Xcode/Swift iOS project, not a Node/TypeScript or Python/uv project: no `package.json` or `pyproject.toml` exists at the repository root. The commands below are therefore derived from the discovered Xcode build configuration (`berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`, `Podfile`) rather than a `scripts` block, since no such file exists in this repository type.

- No lint configuration (e.g. `.swiftlint.yml`) was found in the repository — not found in codebase.
- No test target is attached to the shared scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` declares an empty `<Testables>` block), and no `XCTest` target exists in `project.pbxproj`.
- The project depends on CocoaPods (`Podfile`), so `pod install` must be run before building from a clean checkout so that `berkeley-mobile.xcworkspace` resolves its `Pods` dependencies.

## Commands
```bash
# Install CocoaPods dependencies (required before build/lint/test on a clean checkout)
pod install

# Build (Debug configuration, using the workspace and the checked-in shared scheme)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules
- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- Lint is not applicable: no lint tool or configuration (e.g. SwiftLint) was found in this repository — do not silently skip reporting this; state it explicitly if asked to lint.
- Test is not applicable: no test target is attached to the project's shared scheme and no `XCTest` target exists — do not silently skip reporting this; state it explicitly if asked to test.
