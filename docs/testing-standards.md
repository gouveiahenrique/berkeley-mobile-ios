# Testing Standards

**Last updated:** 2026-08-03

## Current State

The repository does not implement an automated test suite. Repository evidence:

- The shared Xcode scheme (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`) has an empty `<Testables>` list inside its `<TestAction>` block.
- No file in the repository defines a subclass of `XCTestCase` (searched all tracked `*.swift` files).
- No `berkeley-mobileTests` or `berkeley-mobileUITests` target exists in `berkeley-mobile.xcodeproj/project.pbxproj` (only `berkeley-mobile` and `BerkeleyMobileWidgetExtension` native targets are defined).

All verification is currently performed manually (running the app in the iOS Simulator or on-device) — this is inferred from the absence of any test infrastructure, not from direct documentation of a manual QA process.

## Guidance for Introducing Tests

The sections below describe how tests would integrate with this codebase's existing patterns, for use when a test target is added. This is guidance derived from platform capability and observed code shape, not a description of an existing test suite.

### Testing Framework (Platform Capability)

- **Unit Tests:** XCTest is bundled with Xcode and would be the natural choice (`import XCTest`) — this is a platform capability, not a repository implementation.
- **UI Tests:** XCUITest is bundled with Xcode for UI-level testing — platform capability, not implemented here.
- No third-party testing library (e.g. Quick/Nimble) appears in `Podfile.lock` or `Package.resolved`.

### Adding a Test Target

To add tests, a new Xcode unit test target (and optionally a UI test target) would need to be created in `berkeley-mobile.xcodeproj` and added to the existing scheme's `<Testables>` list — none of this exists today.

### Testability Considerations Observed in Current Code

- ViewModels are constructed via the Factory (`FactoryKit`) DI container (`berkeley-mobile/BerkeleyMobile+Injection.swift`), which supports registering test doubles by overriding a `Factory<T>` registration — this is a capability of the Factory library, and no test code exercising it currently exists in the repository.
- Some model types define static sample/mock factory methods for use in SwiftUI `#Preview` blocks (e.g. `BMEventCalendarEntry.sampleEntry` in `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`). These exist for preview purposes; no evidence was found that they are consumed by any test code, since no test code exists.

### Running Tests (Platform Capability)

If a test target were added, the standard Xcode command-line invocation would be:

```bash
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

This command is not currently functional against this repository because no testable target is registered in the scheme.

## SwiftUI Previews (Observed in Repository)

`#Preview` blocks were found alongside SwiftUI views in the repository (e.g. `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift` provides a `sampleEntry` static value apparently intended for preview/sample use). Previews are a Level 2 Xcode/SwiftUI platform capability for visual iteration during development; they do not constitute automated tests and are not a substitute for `XCTest` coverage.

## Not Found in Codebase

- Test file naming conventions: not found (no test files exist).
- Mocking conventions: not found (no test code exists to establish a pattern).
- Coverage targets or CI test gating: not found in codebase (no CI configuration files were found in the repository).
