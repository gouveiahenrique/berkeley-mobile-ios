# Testing Standards

## Testing Infrastructure — Direct Findings

The following checks were performed against the repository (excluding `Pods/` and `.git/`):

- `grep -rl "import XCTest"` across the repository: **no matches found**.
- `find . -iname "*Test*"` across the repository: **no matches found** (no `*Tests/` directory, no `*Tests.swift` files).
- The shared Xcode scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` contains a `<TestAction>` block, but its `<Testables>` element is empty:
  ```xml
  <TestAction ...>
      <Testables>
      </Testables>
  </TestAction>
  ```
- `berkeley-mobile.xcodeproj/project.pbxproj` was searched for `Tests` occurrences: **no matches found** (no test target definitions, e.g. no `*TestsTarget`/`XCTest`-linked native target was found).

**Conclusion:** No unit test target, UI test target, or XCTest-based test files were found in the inspected repository areas. This is a repository-wide observation based on the checks above, not an exhaustive guarantee that no test artifact exists anywhere on disk outside the paths searched.

## Preview-Based Manual/Visual Verification

The repository implements SwiftUI `#Preview` blocks extensively as a form of manual, in-canvas visual verification during development (not automated testing):

- 35 files under `berkeley-mobile/` contain `#Preview` blocks (direct count via repository search).
- Example: `berkeley-mobile/Events/CalendarView.swift:155-167` constructs a `CalendarViewModel`, populates it with sample `BMEventCalendarEntry` instances, injects it into the `FactoryKit` `Container` via `.preview { viewModel }`, and returns `CalendarView()` for Xcode Preview rendering.
- Sample/fixture data used for previews (e.g. `BMEventCalendarEntry.sampleEntry` in `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:136-146`) exists in a handful of files (5 files matched a search for `sampleEntry`/`SampleData`/`mock`, case-insensitive).

Framework/platform capability demonstrated in fixtures: SwiftUI's `#Preview` macro and `FactoryKit`'s `.preview { }` override mechanism are used to substitute sample data for dependency-injected view models during Xcode canvas preview rendering. This is not automated test coverage — it requires manual visual inspection in Xcode and is not run as part of any build/test command found in this repository.

## Test Organization, Fixtures, Mocks, Naming Conventions

Not found in codebase: there is no test directory to describe organization for, no mocking framework or dependency declared for testing purposes (the `Podfile` and `Package.resolved` list only production dependencies — Firebase, GoogleSignIn, Factory, Glur), and no naming convention for test files exists to document.

## CI Integration

No CI/CD configuration was found in the repository (no `.github/workflows/`, no `Fastfile`, no `Makefile`, no `.yml`/`.yaml` files at the repository root besides non-CI JSON/config files). Not found in codebase: any automated pipeline that would invoke tests, lint, or builds.
