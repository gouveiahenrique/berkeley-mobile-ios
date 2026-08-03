# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Note

This repository has no `package.json` or `pyproject.toml` — it is a native iOS project built with Xcode and CocoaPods (`Podfile`, `Podfile.lock`) plus Swift Package Manager (`Package.resolved`). No lint, test, or build script aliases exist in any build configuration file (no Fastlane `Fastfile`, no Makefile, no CI workflow files were found in the repository). The commands below are the standard `xcodebuild` invocations that this project's own scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) supports.

## Commands

```bash
# 1. Build — compile the app for simulator (catches type errors, missing symbols, import failures)
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16'

# 2. Analyze — run Xcode's static analyzer (catches retain cycles, nil dereferences, unreachable code)
xcodebuild analyze \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16'

# 3. Test — no test target is configured in this repository (see docs/testing-standards.md:
#    the scheme's <TestAction><Testables> list is empty and no XCTestCase subclass exists).
#    This step is a stub for when a test target is added:
# xcodebuild test \
#   -workspace berkeley-mobile.xcworkspace \
#   -scheme berkeley-mobile \
#   -destination 'platform=iOS Simulator,name=iPhone 16'
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- Step 3 (Test) is not applicable today because no test target exists in `berkeley-mobile.xcodeproj` — this is a repository fact (empty `<Testables>` list), not a skipped step. Explain this in your response rather than silently omitting it.
- Always open/build against `berkeley-mobile.xcworkspace`, not `berkeley-mobile.xcodeproj` — the app target's build configurations reference CocoaPods-generated `.xcconfig` files (`Pods-berkeley-mobile.debug.xcconfig`, `Pods-berkeley-mobile.release.xcconfig`) that are only resolved through the workspace.
- `berkeley-mobile/GoogleService-Info.plist` must be present (obtained from the team; not committed to the repository per the README) for any build that touches Firebase — the build will fail at compile/link time without it.

## Notes

- No linter is configured in this repository (no `.swiftlint.yml` found). Code style is enforced by convention (see `docs/code-conventions.md`) and PR review only.
- No formatter is configured in this repository.
- No test target exists as of 2026-08-03. Until one is added, manual smoke-testing in the iOS Simulator is the only verification method available for this repository, beyond the build and analyze commands above.
