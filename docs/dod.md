# Definition of Done

## Discovery Notes (repository evidence)

This repository does not contain a `package.json` or `pyproject.toml` — it is a native iOS Xcode project (see `docs/tech.md`). A search for these files (`find . -maxdepth 2 -iname "package.json" -o -maxdepth 2 -iname "pyproject.toml"`, excluding `Pods/`) returned no results, so the Node/uv script blocks referenced by the standard discovery procedure do not exist in this repository.

The build tooling actually present is CocoaPods + Xcode:
- `Podfile` / `Podfile.lock` define dependency installation (`pod install`).
- `berkeley-mobile.xcworkspace` is the workspace to build (references `berkeley-mobile.xcodeproj` and `Pods/Pods.xcodeproj`).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` is the only shared scheme found.
- No test target exists in `project.pbxproj` (no `com.apple.product-type.bundle.unit-test` / `.ui-testing` target), and no lint configuration (e.g. `.swiftlint.yml`) or CI workflow (e.g. `.github/workflows/`) was found in the repository.

Because lint and automated test commands are **not defined anywhere in this repository**, the commands below reflect only what is discoverable: dependency installation and a build. Per the negative-evidence rule, this is reported as "not found," not as "the project has no tests."

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (Podfile / Podfile.lock)
pod install

# Build the app target using the only discovered scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint**: not applicable — no lint tool/configuration (e.g. SwiftLint) was found in the repository.
- **Test**: not applicable — no unit-test or UI-test target exists in `berkeley-mobile.xcodeproj/project.pbxproj`; there is no test command to run.
