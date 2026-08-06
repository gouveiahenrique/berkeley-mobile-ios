# Definition of Done

## Discovery Note

The DoD generation procedure specifies discovery from `package.json` (Node/TypeScript) or `pyproject.toml` (Python/uv). Neither file exists in this repository — this is a native iOS/Swift application built with Xcode and CocoaPods. Not found in codebase: `package.json`, `pyproject.toml`, a `Fastfile`, a `Gemfile`, a `.swiftlint.yml`/`.swiftlint.yaml` configuration, or any CI workflow file (no `.github/` directory).

The build/lint/test gate for this repository is instead defined by its Xcode project and CocoaPods setup:
- `Podfile` / `Podfile.lock` define dependency installation via `pod install`.
- `berkeley-mobile.xcworkspace` is the workspace to build (required, since CocoaPods with `use_frameworks!` requires building the `.xcworkspace`, not the `.xcodeproj`, directly).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` is a shared scheme named `berkeley-mobile`, with `Debug` and `Release` build configurations, targeting the product `Berkeley.app`.
- The scheme's `<TestAction>` has no project-owned test target in its `<Testables>` list (see `docs/testing-standards.md`), and no SwiftLint build-phase script or configuration file was found in `project.pbxproj`.

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required before building — repository uses use_frameworks!)
pod install

# Build the application target via the CocoaPods-generated workspace and shared scheme
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug \
  -destination "generic/platform=iOS Simulator"
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint:** not found in codebase — no SwiftLint (or other linter) configuration or build-phase script was located. If a lint step is later introduced, this file must be updated with the exact command.
- **Test:** not found in codebase — no test target exists in the project (`project.pbxproj` defines only an application target and a widget-extension target). If a test target is added, replace this note with the exact `xcodebuild test -workspace ... -scheme ... -destination ...` command.
