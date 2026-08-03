# Definition of Done

## Discovery Notes

This repository is not a Node.js/TypeScript or Python/uv project — no `package.json` or `pyproject.toml` exists anywhere in the repository (verified: `find . -maxdepth 2 -iname package.json` and `-iname pyproject.toml` returned no results). It is an Xcode/CocoaPods iOS project. Build tooling is instead defined by:

- `Podfile` / `Podfile.lock` — CocoaPods dependency installation (`pod install`), required before building per `README.md`.
- `berkeley-mobile.xcworkspace` — the workspace to open/build (required because CocoaPods is used).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` — the shared scheme, target name `berkeley-mobile`, product `Berkeley.app`.

No lint configuration (`.swiftlint.yml`, SwiftFormat config) and no test target/test bundle were found in the repository (see `docs/testing-standards.md`). The commands below reflect only what is discoverable from the actual project configuration.

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required before building; per README.md)
pod install

# Build the main application target via the shared Xcode workspace/scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint**: Not applicable — no lint tool configuration (e.g. `.swiftlint.yml`) was found in the repository.
- **Test**: Not applicable — the Xcode project defines no unit-test or UI-test target, and the shared scheme's `TestAction` has an empty `Testables` list (see `docs/testing-standards.md`).
