# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Notes

This repository is an Xcode iOS project (`berkeley-mobile.xcodeproj` / `berkeley-mobile.xcworkspace`), not a Node.js or Python project — there is no `package.json` or `pyproject.toml` in the repository. Build/lint/test commands are therefore derived from the checked-in Xcode project configuration rather than package-manager scripts:

- **Build:** Dependencies are installed via CocoaPods (`Podfile` at repo root) and Swift Package Manager (`berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved`); the app must be built through the `.xcworkspace` (not the bare `.xcodeproj`) so CocoaPods dependencies resolve. The shared scheme is `berkeley-mobile` (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`), building `Berkeley.app`.
- **Lint:** Not found in codebase — no `.swiftlint.yml` or other linter configuration exists in the repository.
- **Test:** Not found in codebase — the shared scheme's `TestAction` has an empty `Testables` list, and no files import `XCTest`.

## Commands

```bash
# Install dependencies (CocoaPods)
pod install

# Build (must build the workspace, not the .xcodeproj directly, per Podfile usage)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug -destination 'generic/platform=iOS Simulator' build

# Lint: not applicable — no lint configuration found in this repository
# Test: not applicable — no test target is configured in the shared scheme, and no XCTest files exist
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it. For this repository, `lint` and `test` are marked not applicable because no linter configuration or test target exists in the codebase as of this writing; if a task adds either, this file must be updated to include the corresponding real command.
