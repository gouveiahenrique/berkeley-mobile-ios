# Testing Standards

## Testing Frameworks

Not found in codebase. A repository-wide search for `import XCTest` across all `.swift` files (excluding `Pods/`) returned no results. No other test framework (e.g. Quick/Nimble) was found via dependency inspection of `Podfile` or `Package.resolved`.

## Test Organization

Not found in codebase. There are no directories named `*Tests*` or `*Test*` under `berkeley-mobile/` or `BerkeleyMobileWidget/` (excluding `Pods/`).

The checked-in Xcode scheme, `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, defines a `TestAction` element with an empty `Testables` list:

```xml
<TestAction ...>
   <Testables>
   </Testables>
</TestAction>
```

This confirms no test target is wired into the shared scheme's test action.

## Unit / Integration / E2E Patterns

Not found in codebase within the inspected areas. No unit test files, UI test files (`XCUIApplication`), or snapshot-test dependencies were found.

## Fixtures, Mocks, Sample/Preview Data

The repository does not use dedicated test fixtures, but several production types define static sample data used for SwiftUI previews and/or placeholder UI states:

- `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:134-147`) — a static sample event instance.
- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift:157-161`) — a static factory producing a sample `BMSafetyLog`.
- `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `defaultStadiumOccupancyPercentages` (`BerkeleyMobileWidget/GymOccupancyWidget.swift:15-16`) — default values used by `GymOccupancyProvider.placeholder(in:)` and `getSnapshot(in:completion:)` when `context.isPreview` is true.

These are framework-capability usages (SwiftUI/WidgetKit preview and placeholder support) demonstrated in production view-model/model code, not a dedicated test-fixture layer — "Framework/platform capability demonstrated in fixtures," not "The application uses a fixture framework."

## Naming Conventions

Not applicable — no test files exist to derive a naming convention from.

## CI Test Execution

Not found in codebase. No `.github/workflows/`, Fastlane `Fastfile`, or other CI configuration is present in the repository.
