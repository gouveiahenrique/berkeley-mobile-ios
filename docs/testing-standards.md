# Testing Standards

## Test Infrastructure (repository evidence)

The Xcode project defines exactly two native targets: `berkeley-mobile` (`productType = "com.apple.product-type.application"`) and `BerkeleyMobileWidgetExtension` (`productType = "com.apple.product-type.app-extension"`) — see `berkeley-mobile.xcodeproj/project.pbxproj:1009-1057`. **No unit-test or UI-test target is defined in the project.** Confirming evidence:

- The shared scheme's `TestAction` has an empty `<Testables>` block (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, `TestAction` section).
- No file or directory matching `*Tests*` exists anywhere in the repository outside of `Pods/` (searched from repository root).
- No `import XCTest` statement exists anywhere in `berkeley-mobile.xcodeproj/project.pbxproj` or `berkeley-mobile/`.

**"No automated tests exist in this repository" — not found in codebase**, stated per the negative-evidence rule: this is based on the absence of a test target, test files, and `XCTest` imports across the areas searched (project file, main app source tree). A wiki is referenced in `README.md` ("For documentation, check out our wiki") which was not accessible for inspection and could describe manual QA practices not captured in the repository.

## Closest Existing Verification Mechanism: SwiftUI Previews

35 Swift files contain `#Preview` macro blocks (Xcode/SwiftUI preview providers), e.g.:

- `berkeley-mobile/FeedbackForm/FeedbackFormView.swift:145-161` — constructs a sample `FeedbackFormConfig` and renders `FeedbackFormView` for canvas preview.
- `berkeley-mobile/Events/CalendarSectionView.swift:36-52` — constructs a `CalendarViewModel` with sample `BMEventCalendarEntry` data and registers it into the FactoryKit `Container` for preview injection (`Container.shared.calendarViewModel.preview { calendarViewModel }`).
- `berkeley-mobile/Home/Map/MapUserLocationButton.swift:72-74` — a minimal preview with an empty closure.

These `#Preview` blocks are a platform capability (Xcode/SwiftUI previews) used in the repository for interactive visual inspection during development. They do not execute assertions and are not run as part of any automated test or CI gate — no CI configuration exists in this repository (see `docs/dod.md`).

## Fixtures and Sample Data

Sample/fixture-style data is defined inline next to the types they represent, for use in `#Preview` blocks (Level 1 evidence: fixtures exist in the codebase, but only as SwiftUI preview data, not as test fixtures):

- `BMEventCalendarEntry.sampleEntry` (referenced in `berkeley-mobile/Events/CalendarSectionView.swift:41`).
- Ad hoc struct literals constructed directly inside `#Preview` closures (e.g. the `FeedbackFormConfig` literal in `berkeley-mobile/FeedbackForm/FeedbackFormView.swift:146-159`).

Per the framework/production distinction: these fixtures demonstrate SwiftUI canvas rendering capability; they are not evidence of any production test suite, mocking framework, or assertion-based verification.

## Not Applicable / Not Found

- Unit test frameworks (XCTest, Quick/Nimble, Swift Testing): not found in codebase.
- UI test targets/frameworks (XCUITest): not found in codebase.
- Test naming conventions, test organization by layer (unit/integration/e2e): not applicable — no test suite exists to derive conventions from.
- Mocking/stubbing libraries or protocol-based test doubles: not found in codebase. Note that several repository protocols (e.g. `DataSource` in `berkeley-mobile/Data/DataSource.swift`) are structurally mockable, but no mock conformances were found.
- Code coverage tooling or thresholds: not found in codebase.
