# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Notes

This repository is an Xcode (iOS) project, not a Node/TypeScript or Python/uv project: no `package.json` and no `pyproject.toml` exist anywhere in the repository (verified by `find . -maxdepth 2 -iname "package.json" -o -iname "pyproject.toml"`, excluding `Pods/`). Build/lint/test tooling for this repository is therefore driven by `xcodebuild` against the project's own scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`), rather than by npm/uv scripts.

- **Build**: the repository defines exactly one shared scheme, `berkeley-mobile`, targeting the `berkeley-mobile` app (product `Berkeley.app`). Dependencies are managed via CocoaPods (`Podfile`/`Podfile.lock`), so the workspace (`berkeley-mobile.xcworkspace`), not the bare `.xcodeproj`, must be built.
- **Test**: the `berkeley-mobile` scheme's `<TestAction>` has an empty `<Testables>` list, and no XCTest target/files exist in the repository. There is no test suite to run.
- **Lint**: no `.swiftlint.yml`, `.swiftformat`, or other linter/formatter configuration file was found anywhere in the repository. There is no configured lint command.

## Commands

```bash
# Install CocoaPods dependencies (required before building — Podfile.lock/Manifest.lock sync is checked at build time)
pod install

# Build the app target via the shared workspace scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Test**: not applicable — no test target is registered in the `berkeley-mobile` scheme's `TestAction`, and no XCTest source files exist in the repository. If a task requires test coverage, a test target must first be added to the Xcode project; this is not part of the current build configuration.
- **Lint**: not applicable — no linter or formatter configuration file exists in the repository. If a task requires lint coverage, a linter (e.g. SwiftLint) must first be added and configured; this is not part of the current build configuration.
