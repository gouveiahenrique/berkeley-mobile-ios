# Testing Standards

## Current State

- **No test target exists.** `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`'s `TestAction` contains an empty `<Testables>` element:
  ```xml
  <TestAction ...>
    <Testables>
    </Testables>
  </TestAction>
  ```
- **No `*Tests*` directories or files** were found anywhere in the repository (excluding `Pods/` and `.git/`), confirmed via a recursive search for paths matching `*Tests*`.
- **No XCTest imports** were found in the inspected source files.
- **No test-related dependencies** (e.g. Quick/Nimble, SnapshotTesting) are declared in `Podfile` or `Package.resolved`.

## Frameworks

- Not found in codebase. XCTest is the platform-standard testing framework for Xcode projects (Level 2 — platform capability), but no repository usage was found.

## Not Applicable / Not Found

- Unit test organization/naming conventions: not found in codebase.
- Integration test patterns: not found in codebase.
- End-to-end test patterns: not found in codebase.
- Fixtures, mocks, and test utilities: not found in codebase.
- CI-triggered test execution: no CI configuration files (e.g. `.github/workflows/`, `fastlane/`) were found in the top-level repository listing.

## Definition-of-Done Implication

Because no test target or test files exist, the project's Definition-of-Done gate (`docs/dod.md`) does not include a test-execution command — see that file for the exact discovered build gate.
