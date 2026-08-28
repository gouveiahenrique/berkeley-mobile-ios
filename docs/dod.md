# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Note

This repository has no `package.json` or `pyproject.toml` — it is a native iOS project built with
Xcode/CocoaPods/SPM (`Podfile`, `berkeley-mobile.xcodeproj`, `berkeley-mobile.xcworkspace`). The
commands below were derived from that build configuration instead:
- `Podfile` (CocoaPods dependency install)
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` (the only checked-in
  scheme, target `berkeley-mobile`)

No SwiftLint configuration (`.swiftlint.yml`) and no test target (see `docs/testing-standards.md`)
were found in the repository, so no lint or test command is included below — this is documented
explicitly per the rule against silently skipping DoD gates.

## Commands

```bash
# 1. Install CocoaPods dependencies (required before building; also validates Podfile/Podfile.lock consistency)
pod install

# 2. Build the app target via the checked-in Xcode scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.

## Explicitly Not Included (with reason)

- **Lint**: Not found in codebase — no `.swiftlint.yml`, `.swiftlint.yml`-equivalent, or other linter
  configuration exists in this repository.
- **Automated tests**: Not found in codebase — no unit or UI test target is defined in
  `berkeley-mobile.xcodeproj/project.pbxproj`, and the only Xcode scheme's `<TestAction>` has an
  empty `<Testables>` list. See `docs/testing-standards.md` for full evidence.
