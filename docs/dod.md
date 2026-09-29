# Definition of Done

## Discovery Note

This project is not a Node.js/TypeScript or Python/uv project — no `package.json` or `pyproject.toml` exists anywhere in the repository (verified by direct search). It is an Xcode iOS project built with CocoaPods and Swift Package Manager. No `package.json`-style `scripts` block, no `pyproject.toml` `[tool.ruff]`/`[tool.pytest.ini_options]` config, no `Fastfile`, `Makefile`, or CI workflow file (e.g. `.github/workflows/`) was found in the repository to source lint/test/build commands from.

The commands below are derived directly from the project's own build configuration instead: the CocoaPods workspace (`berkeley-mobile.xcworkspace`, required because `Podfile` declares `use_frameworks!`), the shared Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, target `berkeley-mobile`, product `Berkeley.app`), and the absence of a lint tool or test target (the scheme's `<TestAction><Testables>` block is empty — see `docs/testing-standards.md`).

Every task is only complete when **all commands below pass with zero errors**.

Before marking any task complete, run each command in order, wait for it to finish, and paste
the full terminal output in your response. A task without this output is **incomplete**.

## Commands

```bash
# Install CocoaPods dependencies (required before any build, per Podfile/Podfile.lock)
pod install

# Build the app target using the shared Xcode scheme (no dedicated lint command exists in this repository)
xcodebuild build \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -configuration Debug

# Test: not applicable — see "Rules" below
```

## Rules

- Run all commands even if an earlier one fails — report all failures together.
- Do not suppress, skip, or ignore any failure.
- Fix the root cause and re-run from step 1 until all commands pass.
- If a command is not applicable for the change, explain why — do not silently skip it.
- **Lint**: not applicable. No lint tool configuration (e.g. `.swiftlint.yml`) was found in the repository. Do not silently skip this gate — state explicitly that no lint tooling exists.
- **Test**: not applicable. No XCTest target is registered in the Xcode scheme (`<Testables>` is empty) and no test files were found in the repository. Do not silently skip this gate — state explicitly that no test target exists.
- `xcodebuild` requires macOS with Xcode installed; it cannot be run in a Linux-only environment. If validating in such an environment, state this limitation explicitly rather than skipping the build check silently.
