# Definition of Done

## Discovery Notes

This repository is a native iOS/Swift application built with Xcode, CocoaPods, and Swift Package Manager — it does not contain a `package.json` or `pyproject.toml`. Neither of those files exists anywhere in the repository (verified by search), so the canonical Node/TS or Python/uv script blocks this template normally derives from are **not applicable for this repository type**.

The closest equivalent build-tooling evidence found in the repository:
- `berkeley-mobile.xcworkspace` — the workspace to build (aggregates the Xcode project and CocoaPods), per `Podfile`/`Podfile.lock`.
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` — the shared scheme, targeting buildable `Berkeley.app`.
- No test target exists in `berkeley-mobile.xcodeproj/project.pbxproj` (only an app target and an app-extension target — see `docs/testing-standards.md`), so there is no `xcodebuild test` action backed by an actual test target.
- No SwiftLint (or other linter) configuration or build phase was found in `berkeley-mobile.xcodeproj/project.pbxproj` or the repository root.

Because this repository has no lint configuration and no test target, the commands below reflect the only verifiable build gate this repository currently supports: dependency installation and a release build via `xcodebuild`, run against the shared scheme. Do not invent a `lint` or `test` command that does not correspond to actual repository tooling — their absence is documented, not silently skipped.

## Commands

```bash
# Install CocoaPods dependencies (required before building; see Podfile.lock)
pod install

# Build the app via the shared Xcode scheme (equivalent of a Node "build" script for this project type)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- Lint: not applicable — no SwiftLint (or other linter) configuration exists in this repository.
- Test: not applicable — no unit or UI test target exists in `berkeley-mobile.xcodeproj`; `xcodebuild test` cannot be run against this project as configured.
- If a command is not applicable for the change (e.g. a change confined to `BerkeleyMobileWidget`), explain why — do not silently skip it.
