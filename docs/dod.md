# Definition of Done

## Discovery Notes

This repository is an Xcode/CocoaPods iOS project, not a Node.js/TypeScript or Python/uv project: no `package.json` and no `pyproject.toml` were found anywhere in the repository (`find` confirmed). Build/test/lint commands are therefore derived from the actual build configuration present in the repository instead:

- LEVEL 1 — `berkeley-mobile.xcworkspace` is the CocoaPods-integrated workspace to build from (per `README.md`: "run pod install in the berkeley-mobile-ios directory").
- LEVEL 1 — The shared scheme is `berkeley-mobile` (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, `BlueprintName = "berkeley-mobile"`).
- LEVEL 1 — The scheme's `<TestAction>` exists but its `<Testables>` list is empty — there are no unit/UI test targets wired into this scheme (confirmed also by the absence of any `com.apple.product-type.bundle.unit-test` / `.bundle.ui-testing` target in `project.pbxproj`, and no `*Tests` directories or `XCTest` imports anywhere in the repo).
- Not found in codebase: a SwiftLint/SwiftFormat configuration file (no `.swiftlint.yml` or `.swiftformat`), a Fastlane `Fastfile`, or any CI workflow (no `.github/workflows`) defining canonical lint/test/build commands.

Because no lint tool or test target is configured in the repository, the DoD gate below is limited to what the project's build tooling can actually run: dependency installation and a build. Lint and automated tests are marked not applicable, per the rule to explain rather than silently skip.

## Commands

```bash
# Install CocoaPods dependencies (required before opening/building the workspace)
pod install

# Build the app target using the discovered workspace and scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint**: Not applicable — no lint tool (e.g. SwiftLint) is configured in this repository (no `.swiftlint.yml` found).
- **Test**: Not applicable as an automated gate — the `berkeley-mobile` scheme has no test targets attached (`Testables` is empty), and no `XCTest`-based test target exists in `project.pbxproj`. `xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile test` would run zero tests. If test targets are added in the future, this file should be updated to include the resulting `xcodebuild test` invocation.
