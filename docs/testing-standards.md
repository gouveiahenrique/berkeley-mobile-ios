# Testing Standards

## Test Infrastructure Status

No automated test target exists in this repository. Evidence:

- `berkeley-mobile.xcodeproj/project.pbxproj` contains zero entries for `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` (verified via repository-wide grep). The only two product types present are `com.apple.product-type.application` (`berkeley-mobile`) and `com.apple.product-type.app-extension` (`BerkeleyMobileWidgetExtension`).
- The shared Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) has a `<TestAction>` block with an empty `<Testables>` list — no test bundles are registered to run.
- A repository-wide search for `import XCTest` returned no matches outside of `Pods/` (none exist even there, as no testing-framework pods are declared).
- No `*Tests` or `*UITests` directories were found at any depth in the repository (excluding `Pods/`).

Per `<negative_evidence_rules>`, this reflects the areas actually inspected (project file, scheme, and repository-wide source search) — not an exhaustive audit of every directory, but no contrary evidence was found in any inspected area.

## Manual/QA Process

The `TabBarController` includes a `#if DEBUG`-gated debug view (`berkeley-mobile/TabBarController.swift`, `motionEnded`), triggered by a shake gesture (`motion == .motionShake`), presenting `DebugView` via `UIHostingController`. This, along with the `berkeley-mobile/Debug/DebugViewModel.swift` file, indicates the repository implements an in-app debug/inspection tool for manual verification during development, rather than an automated test suite.

## Sample/Fixture Data in Production Code

Several production types define static sample-data helpers used for SwiftUI previews, not automated tests:

- `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`) — a static sample event instance.
- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) — a static sample `BMSafetyLog`.
- `FeedbackFormView` includes a `#Preview` block (`berkeley-mobile/FeedbackForm/FeedbackFormView.swift`) constructing a sample `FeedbackFormConfig` for SwiftUI canvas previews.

These are framework capability (SwiftUI `#Preview` macro) demonstrated in production source files for design-time preview purposes — they are not test fixtures and do not constitute or feed an automated test suite.

## Not Found in Codebase

- Unit test frameworks (XCTest, Quick/Nimble, etc.): not found in codebase.
- UI test automation (XCUITest, etc.): not found in codebase.
- Snapshot testing tooling: not found in codebase.
- Mocking libraries or mock/stub conventions for data-layer testing: not found in codebase.
- CI-triggered test execution: not found in codebase (no CI configuration files were found at all — see `docs/dod.md`).
- Test naming conventions: not applicable — no test files exist to establish a convention.
