# Testing Standards

## Test Target

The Xcode project (`berkeley-mobile.xcodeproj/project.pbxproj`) defines exactly two native targets:
- `com.apple.product-type.application` (`Berkeley.app`, the main app)
- `com.apple.product-type.app-extension` (`BerkeleyMobileWidgetExtension.appex`, the widget)

Neither is a `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` target. No XCTest target was found in the inspected repository areas.

## Test Files

No files matching test-related naming patterns (`*Test*`, `*Tests*`, `XCTestCase`) were found anywhere in the repository outside of `Pods/` during a repository-wide search.

**"No unit or UI tests were found in the inspected repository areas."** This is a statement of absence based on a full-repository filename search combined with the target inventory above, not an assumption.

## Testing-Adjacent Patterns Present in the Repository

While no automated test suite exists, the repository does implement developer/preview-time constructs that provide informal coverage of view rendering:

- **SwiftUI `#Preview` macros.** 39 occurrences across the codebase (e.g. `berkeley-mobile/Common/BMSegmentedControlView.swift:68-77`, `berkeley-mobile/Events/EventDetailView.swift:212-214`). These are compiled only in Xcode Previews / Debug builds and exercise view rendering with hardcoded or sample data — they are not automated tests and do not run in a CI pipeline (no CI configuration was found; see below).
- **Sample/mock data factory methods.** Several types expose static sample-data constructors used by `#Preview` blocks, e.g. `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift:157-161`), `BMEventCalendarEntry.sampleEntry` (referenced in `berkeley-mobile/Events/EventDetailView.swift:213`). These exist to support previews/fixtures, not as production behavior — per repository scope rules, this is "framework/platform capability demonstrated in fixtures," not evidence of a test suite.
- **`DebugView` / `DebugViewModel`** (`berkeley-mobile/Debug/DebugView.swift`, `berkeley-mobile/Debug/DebugViewModel.swift`) — a `#if DEBUG`-gated in-app debug screen, triggered by a shake gesture in `TabBarController.motionEnded(_:with:)` (`berkeley-mobile/TabBarController.swift:29-38`). This is a manual developer tool, not an automated test harness.

## CI/CD

No `.github/workflows/`, `Fastfile`, `Gymfile`, `Appfile`, `Matchfile`, or other CI/CD pipeline configuration files were found in the inspected repository areas.

## Not Found in Codebase

- Unit test framework/library configuration (XCTest, Quick/Nimble, etc.)
- Test organization conventions (naming, folder structure, `Arrange-Act-Assert`, etc.)
- Mocking framework usage for production code paths
- Code coverage tooling or thresholds
- UI test automation (XCUITest)

## Conclusion

Testing standards, as defined by an existing, enforced practice in this repository, could not be documented because no test infrastructure exists in the inspected repository areas.
