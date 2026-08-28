# Definition of Done

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Discovery Note

This repository is an Xcode/Swift project (CocoaPods + Swift Package Manager), not a Node.js or
Python project — no `package.json` or `pyproject.toml` was found in the repository (confirmed via
`find . -maxdepth 1 -iname package.json -o -maxdepth 1 -iname pyproject.toml`, no results). No
lint configuration (`.swiftlint.yml` or similar) and no CI configuration (`.github/workflows`,
`Fastfile`) were found in the inspected repository areas. The commands below are therefore derived
from the project's actual build unit — the shared Xcode scheme
`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` — and the CocoaPods
manifest (`Podfile`), rather than from a scripts block.

## Commands

```bash
# Install CocoaPods-managed dependencies (required before building; Podfile.lock is checked in)
pod install

# Build the app target via the workspace + shared scheme (xcodebuild is the standard Xcode CLI
# entry point; no wrapper script exists in this repository)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- **Lint:** Not applicable — no lint tool/configuration (e.g. SwiftLint) was found in the
  repository. Do not silently skip this without noting it; if a lint tool is introduced later,
  this file must be updated with its exact invocation.
- **Test:** Not applicable in its current state — the shared scheme's `<TestAction>` has an empty
  `<Testables>` list (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`),
  and no test target exists in the project. Running `xcodebuild test` against this scheme would
  execute zero tests rather than validate anything. If a test target is added, this file must be
  updated with the exact `xcodebuild test` invocation and target/scheme name.
- If a command is not applicable for a given change, explain why in the task report — do not
  silently omit it.
