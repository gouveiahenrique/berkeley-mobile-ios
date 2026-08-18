# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Notes

This repository is an Xcode / CocoaPods iOS project, not a Node.js or Python project — there is
no `package.json` or `pyproject.toml`. The build entry point is `berkeley-mobile.xcworkspace`
(CocoaPods-generated) with the shared scheme `berkeley-mobile`, defined in
`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`.

- No lint tool configuration (e.g. `.swiftlint.yml`) was found in the repository.
- No test target exists: `berkeley-mobile.xcodeproj/project.pbxproj` defines only an application
  target (`berkeley-mobile`) and an app-extension target (`BerkeleyMobileWidgetExtension`); the
  shared scheme's `TestAction` has an empty `<Testables>` list. See `docs/testing-standards.md`.

## Commands

```bash
# Install CocoaPods dependencies (required before building)
pod install

# Build (application target, Debug configuration, shared scheme)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint:** not applicable — no lint tool configuration exists in this repository.
- **Test:** not applicable — no test target exists in this repository.
