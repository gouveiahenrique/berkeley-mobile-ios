# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required before building; see Podfile)
pod install

# Build the app target via the checked-in workspace and shared scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- Lint: not applicable — no lint tool configuration (e.g. `.swiftlint.yml`) was found in the repository. If a lint gate is added later, update this document rather than silently skipping it.
- Test: not applicable — no test target or test bundle exists in `berkeley-mobile.xcodeproj` (empty `Testables` in the shared scheme's `TestAction`, no `*Tests*` files in the repository; see `docs/testing-standards.md`). Do not run `xcodebuild test`; there is no test bundle for it to execute. If a test target is added later, update this document with the corresponding `xcodebuild test -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile` command.

## Discovery Notes

This repository is a native iOS project (Xcode + CocoaPods + Swift Package Manager), not a Node/TypeScript or Python/uv project. No `package.json` or `pyproject.toml` exists anywhere in the repository (confirmed via repository-wide search). Build tooling configuration was instead discovered from:

- `berkeley-mobile.xcworkspace/contents.xcworkspacedata` — defines the workspace referencing `berkeley-mobile.xcodeproj` and `Pods/Pods.xcodeproj`.
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` — the checked-in shared scheme, targeting the `berkeley-mobile` app (`Berkeley.app`), with a `TestAction` present but its `<Testables>` list empty.
- `berkeley-mobile.xcodeproj/project.pbxproj` — defines two build targets, `berkeley-mobile` and `BerkeleyMobileWidgetExtension`, and `IPHONEOS_DEPLOYMENT_TARGET` values of `13.0`/`18.0` across build configurations.
- `Podfile` — CocoaPods dependency manifest requiring `pod install` before building (per `README.md`: "be sure to run pod install in the berkeley-mobile-ios directory").

No SwiftLint configuration, Fastlane configuration, Makefile, or CI workflow files (e.g. `.github/workflows/`) were found in the inspected repository areas.
