# Definition of Done

## Discovery Note

This repository is an Xcode/CocoaPods iOS project, not a Node.js/TypeScript or Python/uv project: no `package.json` or `pyproject.toml` was found anywhere in the repository (confirmed via directory search). There are therefore no `scripts`/`[tool.ruff]`/`[tool.pytest.ini_options]` blocks to source lint/test/build commands from.

The commands below are instead derived directly from the project's actual build tooling, discovered from repository configuration:
- `Podfile` / `Podfile.lock` (CocoaPods dependency manifest) and `berkeley-mobile.xcworkspace/xcshareddata/swiftpm/Package.resolved` (Swift Package Manager) define how dependencies are resolved.
- `berkeley-mobile.xcworkspace` is the workspace to build (required because CocoaPods integration means the `.xcodeproj` alone does not include Pods).
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` defines the only shared scheme, named `berkeley-mobile`, targeting product `Berkeley.app`.
- No lint tool configuration (e.g. `.swiftlint.yml`, `.swiftformat`) was found in the inspected repository areas — there is no lint command to run.
- No test target is wired into the `berkeley-mobile` scheme (its `TestAction` has an empty `<Testables>` list) and no `XCTest`-based test target exists in the project (see `docs/testing-standards.md`) — there is no test command to run.

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install/update CocoaPods dependencies (required before building; run from the repository root)
pod install

# Build the app target via the workspace and shared scheme
xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -configuration Debug build
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- Lint and test commands are intentionally omitted: no lint tool configuration and no test target exist in this repository (see Discovery Note above). If either is added to the project in the future, this file must be updated to include the corresponding command — do not assume they remain inapplicable without re-checking the project configuration.
</content>
