# Definition of Done

## Discovery Notes

This repository is an Xcode/Swift project, not a Node.js or Python project: no `package.json` or `pyproject.toml` exists anywhere in the repository. Build tooling was instead discovered from the Xcode project/workspace configuration:

- Workspace: `berkeley-mobile.xcworkspace` (references `berkeley-mobile.xcodeproj` and `Pods/Pods.xcodeproj`, per `berkeley-mobile.xcworkspace/contents.xcworkspacedata`).
- Scheme: `berkeley-mobile` (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`), `BlueprintName = "berkeley-mobile"`.
- The scheme's `TestAction` declares an empty `<Testables>` list (lines 24-31 of the scheme file) — no test target is currently wired up to run via `xcodebuild test` for this scheme.
- No `.swiftlint.yml` or other linter configuration file was found anywhere in the repository (excluding `Pods/`).

Because no lint configuration and no wired test target exist, this repository's discoverable DoD gate is limited to a build check. This is stated explicitly per the "Rules" section below rather than silently omitted.

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Build (discovered scheme/workspace from berkeley-mobile.xcworkspace and
# berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme)
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- Lint is not applicable: no `.swiftlint.yml` or other linter configuration was found in the repository. If lint tooling is added later, update this file to include the exact discovered command.
- Test is not applicable as an automated gate: the `berkeley-mobile` scheme's `TestAction` has no `Testables` configured, and no test target/source files exist in the repository. If a test target is added later, update this file to include the exact `xcodebuild test` invocation for that target.
- If a command is not applicable for the change, explain why — do not silently skip it.
