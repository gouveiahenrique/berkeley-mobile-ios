# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Notes

This repository has no `package.json` or `pyproject.toml` (it is an Xcode/CocoaPods iOS project, not Node.js or Python). The build tooling discovered from the repository is:

- `Podfile` / `Podfile.lock` — CocoaPods dependency manifest (main target: `berkeley-mobile`; extension target: `BerkeleyMobileWidgetExtension`).
- `berkeley-mobile.xcworkspace` — the workspace to build (CocoaPods requires building the `.xcworkspace`, not the `.xcodeproj`, once pods are installed).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` — the only shared scheme, named `berkeley-mobile`.
- No lint configuration (no `.swiftlint.yml` or equivalent) was found in the inspected repository areas.
- No test target exists (see `docs/testing-standards.md`) and the shared scheme's `TestAction` has an empty `<Testables>` list.

## Commands

```bash
# Install CocoaPods dependencies (required before building)
pod install

# Build (lint and test are not applicable — see Rules below)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint**: not applicable — no lint tool/configuration (e.g., SwiftLint) is configured in this repository. Do not silently skip verifying this; state that no lint gate exists.
- **Test**: not applicable — no test target is defined in `berkeley-mobile.xcodeproj` and no test files exist in the repository. Do not silently skip verifying this; state that no automated test gate exists.
