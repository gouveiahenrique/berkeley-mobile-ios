<!-- steering-agent-last-run: 2026-10-21 13:37 UTC -->
# Testing Standards

- No test target, test directory or test files were found in inspected repository areas. The `.xcodeproj` native targets found are the app and `BerkeleyMobileWidgetExtension`.
- The shared scheme `berkeley-mobile.xcscheme` has an empty `<Testables>` element.
- CodeGraph reports "no tests found" for the inspected symbols (e.g. `DataManager`, `FeedbackFormPresenter`, `EventsViewModel`).
- Testing frameworks, fixtures, mocks and naming conventions: Not found in codebase.

## Related testability and debug elements observed
- DI via FactoryKit `Container` (`BerkeleyMobile+Injection.swift`) allows view models to be resolved through factories; no test overrides were found.
- `DebugView`/`DebugViewModel` are compiled under `#if DEBUG` and presented on shake from `TabBarController`.
- SwiftUI `#Preview` blocks are used in views (e.g. `EventsView.swift`).
