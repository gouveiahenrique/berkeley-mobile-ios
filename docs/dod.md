# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Note

This repository is an Xcode/CocoaPods iOS project, not a Node.js/TypeScript or Python/uv project — no `package.json` or `pyproject.toml` exists anywhere in the repository (confirmed by directory search). There is therefore no `scripts`/`[tool.ruff]`/`[tool.pytest.ini_options]` block to read lint/test/build commands from. The commands below are derived instead from the project's actual build tooling evidence:
- `berkeley-mobile.xcworkspace` is the workspace to build (CocoaPods integration requires building the `.xcworkspace`, not the `.xcodeproj`, per `Podfile`/`Podfile.lock` presence).
- The scheme `berkeley-mobile` is the only shared scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`).
- That scheme's `<TestAction>` has an empty `<Testables>` list, and no test-bundle target exists in `project.pbxproj` — confirmed no automated test suite exists to run.
- No `.swiftlint.yml`, `.swiftformat`, or other lint configuration file was found anywhere in the repository — confirmed no lint gate exists to run.

## Commands

```bash
# Install CocoaPods dependencies (required before building, per README.md)
pod install

# Build the app for the iOS Simulator using the shared scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint**: not applicable — no lint tool/configuration (e.g. SwiftLint) is present in the repository. Do not fabricate a lint command.
- **Test**: not applicable — no test target is declared in `berkeley-mobile.xcodeproj/project.pbxproj` and the shared scheme's `TestAction` has no testables. Do not fabricate a test command.
