# Testing Standards

## Testing Framework

Not found in codebase. No file importing `XCTest` was found anywhere in the repository outside `Pods/`. The Xcode project defines only one scheme, `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, whose `TestAction` element contains an empty `<Testables>` list:

```xml
<TestAction ...>
   <Testables>
   </Testables>
</TestAction>
```

No unit test target (e.g. `berkeley-mobileTests`) or UI test target (e.g. `berkeley-mobileUITests`) was found under `PBXNativeTarget` entries in `berkeley-mobile.xcodeproj/project.pbxproj`; only two native targets exist: `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`).

## Test Organization

Not applicable — no test source directory exists in the repository.

## Unit / Integration / E2E Patterns

Not found in codebase.

## Fixtures, Mocks, and Sample Data

The repository does not implement a dedicated mocking/fixture framework, but several production model types define static sample-data helpers used for SwiftUI previews and/or placeholder UI states, e.g.:

- `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift` — `static let sampleEntry`.
- `berkeley-mobile/Safety/SafetyViewModel.swift` — `extension SafetyViewModel { static func getSampleSafetyLog() -> BMSafetyLog }`.
- `BerkeleyMobileWidget/GymOccupancyWidget.swift` — `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `defaultStadiumOccupancyPercentages`, used in `GymOccupancyProvider.placeholder(in:)` and `getSnapshot(in:)` for widget preview/placeholder rendering.

These are framework-supported SwiftUI/WidgetKit preview mechanisms demonstrated in production files, not a test suite. Per the negative-evidence rule, this indicates sample data was found only in these production/preview contexts within the inspected areas — it should not be read as proof that no other fixtures exist anywhere in the repository.

## Naming Conventions

Not applicable — no test files exist to derive a naming convention from.

## CI Test Execution

Not found in codebase. No `.github/workflows/`, `Fastfile`, `bitrise.yml`, `.travis.yml`, or `.circleci/` configuration was found in the inspected repository areas that would invoke a test suite.
